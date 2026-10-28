import re
import html
import logging
from datetime import datetime, timezone as dt_timezone
import requests
from django.utils import timezone
from ..models import JobSource, JobPosting

logger = logging.getLogger(__name__)

# Common tech skills lexicon for normalized extraction
COMMON_SKILLS = [
    'Python', 'Django', 'FastAPI', 'Flask', 'JavaScript', 'TypeScript', 'React', 'Next.js',
    'Vue.js', 'Angular', 'Node.js', 'Express', 'Go', 'Golang', 'Rust', 'Java', 'Spring Boot',
    'C++', 'C#', '.NET', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Git', 'Linux',
    'GraphQL', 'REST', 'Microservices', 'Kafka', 'RabbitMQ', 'Machine Learning', 'AI',
    'PyTorch', 'TensorFlow', 'LLM', 'NLP', 'Vector Databases', 'Prompt Engineering',
    'Pandas', 'NumPy', 'Spark', 'Airflow', 'Databricks', 'Snowflake', 'HTML', 'CSS', 'Tailwind',
    'Elasticsearch', 'System Design', 'Cybersecurity', 'SOC 2', 'Agile', 'Scrum'
]

def clean_html_text(raw_html):
    if not raw_html:
        return ''
    # Replace breaks and list items with newlines
    text = re.sub(r'<(?:br|/li|/p|/div)[^>]*>', '\n', raw_html, flags=re.IGNORECASE)
    # Strip remaining HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Unescape HTML entities
    text = html.unescape(text)
    # Normalize excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def extract_skills_from_text(text):
    if not text:
        return []
    found = []
    lower_text = text.lower()
    for skill in COMMON_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, lower_text):
            found.append(skill)
    return found

def detect_workplace_type(title, location, text):
    combined = f"{title} {location} {text[:400]}".lower()
    if 'remote' in combined:
        return 'remote'
    elif 'hybrid' in combined:
        return 'hybrid'
    elif 'on-site' in combined or 'onsite' in combined or 'in-office' in combined:
        return 'onsite'
    return 'unspecified'

def detect_experience_level(title, text):
    combined = f"{title} {text[:500]}".lower()
    if any(k in combined for k in ['lead', 'staff', 'principal', 'director', 'vp', 'head of']):
        return 'Lead'
    elif any(k in combined for k in ['senior', 'sr.', 'sr ']):
        return 'Senior'
    elif any(k in combined for k in ['entry', 'junior', 'jr.', 'associate', 'intern', 'graduate']):
        return 'Entry'
    return 'Mid'

def get_or_link_company(company_name):
    from companies.models import Company
    if not company_name:
        return None
    comp = Company.objects.filter(company_name__iexact=company_name).first()
    if not comp:
        comp = Company.objects.filter(canonical_name__iexact=company_name).first()
    return comp


class GreenhouseConnector:
    """
    Official Greenhouse Job Board API connector.
    Documentation: https://developers.greenhouse.io/job-board.html
    Endpoint: https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true
    """
    
    @staticmethod
    def sync_board(board_token, company_name=None, limit=25):
        url = f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true"
        headers = {'User-Agent': 'TrustHire-CareerIntelligence/1.0'}
        
        try:
            resp = requests.get(url, headers=headers, timeout=14)
            if resp.status_code == 404:
                return {
                    'success': False,
                    'error': f"Greenhouse board token '{board_token}' was not found (404).",
                    'jobs_synced': 0
                }
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException as e:
            logger.error(f"Greenhouse sync error for board '{board_token}': {e}")
            return {'success': False, 'error': str(e), 'jobs_synced': 0}

        raw_jobs = data.get('jobs', [])
        effective_company = company_name or board_token.capitalize()
        company_obj = get_or_link_company(effective_company)
        synced_count = 0
        current_ext_ids = []

        for item in raw_jobs[:limit]:
            ext_id = str(item.get('id'))
            composite_ext_id = f"{board_token}_{ext_id}"
            current_ext_ids.append(composite_ext_id)
            title = item.get('title', 'Untitled Position').strip()
            raw_content = item.get('content', '')
            clean_desc = clean_html_text(raw_content) or f"Role: {title} at {effective_company}"
            
            loc_dict = item.get('location', {})
            loc_name = loc_dict.get('name', 'Remote / Unspecified') if isinstance(loc_dict, dict) else str(loc_dict)
            
            app_url = item.get('absolute_url') or f"https://boards.greenhouse.io/{board_token}/jobs/{ext_id}"
            workplace_type = detect_workplace_type(title, loc_name, clean_desc)
            exp_level = detect_experience_level(title, clean_desc)
            skills = extract_skills_from_text(f"{title} {clean_desc}")

            # Parse updated_at
            updated_str = item.get('updated_at')
            posted_dt = timezone.now()
            if updated_str:
                try:
                    posted_dt = datetime.fromisoformat(updated_str.replace('Z', '+00:00'))
                except Exception:
                    pass

            JobPosting.objects.update_or_create(
                source_name='greenhouse',
                external_id=composite_ext_id,
                defaults={
                    'company': company_obj,
                    'company_name': effective_company,
                    'title': title,
                    'description': clean_desc,
                    'location': loc_name,
                    'workplace_type': workplace_type,
                    'employment_type': 'Full-time',
                    'experience_level': exp_level,
                    'required_skills': skills[:8],
                    'preferred_skills': skills[8:14],
                    'application_url': app_url,
                    'posted_at': posted_dt,
                    'verification_status': 'verified_active',
                    'raw_payload': {
                        'board_token': board_token,
                        'departments': item.get('departments', []),
                        'offices': item.get('offices', [])
                    }
                }
            )
            synced_count += 1

        # Detect closed jobs: mark listings from this source that are no longer in raw_jobs
        if len(raw_jobs) > 0:
            all_source_active_ext_ids = [f"{board_token}_{str(j.get('id'))}" for j in raw_jobs]
            JobPosting.objects.filter(
                source_name='greenhouse',
                external_id__startswith=f"{board_token}_",
                verification_status='verified_active'
            ).exclude(external_id__in=all_source_active_ext_ids).update(
                verification_status='closed'
            )

        return {'success': True, 'error': None, 'jobs_synced': synced_count}


class LeverConnector:
    """
    Official Lever Postings API connector.
    Documentation: https://github.com/lever/postings-api
    Endpoint: https://api.lever.co/v0/postings/{company}?mode=json
    """
    
    @staticmethod
    def sync_company(company_slug, display_name=None, limit=25):
        url = f"https://api.lever.co/v0/postings/{company_slug}?mode=json"
        headers = {'User-Agent': 'TrustHire-CareerIntelligence/1.0'}
        
        try:
            resp = requests.get(url, headers=headers, timeout=14)
            if resp.status_code == 404:
                return {
                    'success': False,
                    'error': f"Lever company postings '{company_slug}' not found (404).",
                    'jobs_synced': 0
                }
            resp.raise_for_status()
            data = resp.json()
            if not isinstance(data, list):
                return {'success': False, 'error': 'Unexpected response format from Lever API.', 'jobs_synced': 0}
        except requests.RequestException as e:
            logger.error(f"Lever sync error for company '{company_slug}': {e}")
            return {'success': False, 'error': str(e), 'jobs_synced': 0}

        effective_company = display_name or company_slug.capitalize()
        company_obj = get_or_link_company(effective_company)
        synced_count = 0

        for item in data[:limit]:
            ext_id = str(item.get('id'))
            title = item.get('text', 'Untitled Position').strip()
            
            clean_desc = item.get('descriptionPlain', '')
            if not clean_desc:
                clean_desc = clean_html_text(item.get('description', ''))
            
            cats = item.get('categories', {}) or {}
            loc_name = cats.get('location', 'Remote / Unspecified')
            workplace_type = str(item.get('workplaceType') or detect_workplace_type(title, loc_name, clean_desc)).lower()
            if workplace_type not in ['remote', 'hybrid', 'onsite']:
                workplace_type = detect_workplace_type(title, loc_name, clean_desc)
                
            commitment = cats.get('commitment', 'Full-time')
            app_url = item.get('hostedUrl') or item.get('applyUrl') or f"https://jobs.lever.co/{company_slug}/{ext_id}"
            exp_level = detect_experience_level(title, clean_desc)
            skills = extract_skills_from_text(f"{title} {clean_desc}")

            # Salary extraction if provided by Lever
            salary_range = item.get('salaryRange', {})
            sal_min = None
            sal_max = None
            sal_cur = 'USD'
            if isinstance(salary_range, dict):
                sal_min = salary_range.get('min')
                sal_max = salary_range.get('max')
                sal_cur = salary_range.get('currency', 'USD')

            # Parse created_at (timestamp in ms)
            posted_dt = timezone.now()
            created_ms = item.get('createdAt')
            if created_ms:
                try:
                    posted_dt = datetime.fromtimestamp(created_ms / 1000.0, tz=dt_timezone.utc)
                except Exception:
                    pass

            JobPosting.objects.update_or_create(
                source_name='lever',
                external_id=f"{company_slug}_{ext_id}",
                defaults={
                    'company': company_obj,
                    'company_name': effective_company,
                    'title': title,
                    'description': clean_desc or f"Role: {title} at {effective_company}",
                    'location': loc_name,
                    'workplace_type': workplace_type,
                    'employment_type': commitment,
                    'experience_level': exp_level,
                    'required_skills': skills[:8],
                    'preferred_skills': skills[8:14],
                    'salary_min': sal_min,
                    'salary_max': sal_max,
                    'salary_currency': sal_cur,
                    'application_url': app_url,
                    'posted_at': posted_dt,
                    'verification_status': 'verified_active',
                    'raw_payload': {
                        'company_slug': company_slug,
                        'categories': cats,
                        'department': cats.get('department')
                    }
                }
            )
            synced_count += 1

        # Detect closed jobs
        if len(data) > 0:
            all_source_active_ext_ids = [f"{company_slug}_{str(j.get('id'))}" for j in data]
            JobPosting.objects.filter(
                source_name='lever',
                external_id__startswith=f"{company_slug}_",
                verification_status='verified_active'
            ).exclude(external_id__in=all_source_active_ext_ids).update(
                verification_status='closed'
            )

        return {'success': True, 'error': None, 'jobs_synced': synced_count}


class AshbyConnector:
    """
    Official Ashby Public Job Postings API connector.
    Documentation: https://developers.ashbyhq.com/
    Endpoint: https://api.ashbyhq.com/posting-api/job-board/{board_name}
    """

    @staticmethod
    def sync_board(board_name, display_name=None, limit=25):
        url = f"https://api.ashbyhq.com/posting-api/job-board/{board_name}"
        headers = {'User-Agent': 'TrustHire-CareerIntelligence/1.0'}
        
        try:
            resp = requests.get(url, headers=headers, timeout=14)
            if resp.status_code == 404:
                return {
                    'success': False,
                    'error': f"Ashby job board '{board_name}' was not found (404).",
                    'jobs_synced': 0
                }
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException as e:
            logger.error(f"Ashby sync error for board '{board_name}': {e}")
            return {'success': False, 'error': str(e), 'jobs_synced': 0}

        raw_jobs = data.get('jobs', [])
        effective_company = display_name or board_name.capitalize()
        company_obj = get_or_link_company(effective_company)
        synced_count = 0

        for item in raw_jobs[:limit]:
            ext_id = str(item.get('id'))
            composite_ext_id = f"{board_name}_{ext_id}"
            title = item.get('title', 'Untitled Position').strip()
            desc_html = item.get('descriptionHtml', '')
            clean_desc = clean_html_text(desc_html) or f"Role: {title} at {effective_company}"
            
            loc_name = item.get('location', 'Remote / Unspecified')
            is_remote = item.get('isRemote', False)
            workplace_type = 'remote' if is_remote else detect_workplace_type(title, loc_name, clean_desc)
            emp_type = item.get('employmentType', 'Full-time')
            exp_level = detect_experience_level(title, clean_desc)
            skills = extract_skills_from_text(f"{title} {clean_desc}")
            app_url = item.get('jobUrl') or f"https://jobs.ashbyhq.com/{board_name}/{ext_id}"

            # Parse publishedAt
            pub_str = item.get('publishedAt')
            posted_dt = timezone.now()
            if pub_str:
                try:
                    posted_dt = datetime.fromisoformat(pub_str.replace('Z', '+00:00'))
                except Exception:
                    pass

            JobPosting.objects.update_or_create(
                source_name='ashby',
                external_id=composite_ext_id,
                defaults={
                    'company': company_obj,
                    'company_name': effective_company,
                    'title': title,
                    'description': clean_desc,
                    'location': loc_name,
                    'workplace_type': workplace_type,
                    'employment_type': emp_type,
                    'experience_level': exp_level,
                    'required_skills': skills[:8],
                    'preferred_skills': skills[8:14],
                    'application_url': app_url,
                    'posted_at': posted_dt,
                    'verification_status': 'verified_active',
                    'raw_payload': {
                        'board_name': board_name,
                        'department': item.get('department'),
                        'team': item.get('team'),
                        'secondaryLocations': item.get('secondaryLocations', [])
                    }
                }
            )
            synced_count += 1

        # Detect closed jobs
        if len(raw_jobs) > 0:
            all_source_active_ext_ids = [f"{board_name}_{str(j.get('id'))}" for j in raw_jobs]
            JobPosting.objects.filter(
                source_name='ashby',
                external_id__startswith=f"{board_name}_",
                verification_status='verified_active'
            ).exclude(external_id__in=all_source_active_ext_ids).update(
                verification_status='closed'
            )

        return {'success': True, 'error': None, 'jobs_synced': synced_count}


def sync_all_default_sources():
    """
    Coordinates synchronization across verified active public boards.
    Never fabricates jobs; records real fetch statistics and errors.
    """
    default_greenhouse = [
        ('cloudflare', 'Cloudflare'),
        ('github', 'GitHub'),
        ('hashicorp', 'HashiCorp'),
        ('figma', 'Figma'),
    ]

    default_lever = [
        ('palantir', 'Palantir Technologies'),
        ('spotify', 'Spotify'),
    ]

    default_ashby = [
        ('ramp', 'Ramp'),
        ('linear', 'Linear'),
    ]

    results = []

    # Sync Greenhouse
    for token, comp in default_greenhouse:
        source, _ = JobSource.objects.get_or_create(
            slug=f"gh-{token}",
            defaults={
                'name': comp,
                'source_type': 'greenhouse',
                'board_token': token
            }
        )
        res = GreenhouseConnector.sync_board(token, comp, limit=20)
        source.last_sync_at = timezone.now()
        source.sync_status = 'success' if res['success'] else 'error'
        source.sync_error = res.get('error') or ''
        source.total_jobs_fetched += res.get('jobs_synced', 0)
        source.save()
        results.append({'source': comp, 'type': 'Greenhouse', **res})

    # Sync Lever
    for slug, comp in default_lever:
        source, _ = JobSource.objects.get_or_create(
            slug=f"lever-{slug}",
            defaults={
                'name': comp,
                'source_type': 'lever',
                'board_token': slug
            }
        )
        res = LeverConnector.sync_company(slug, comp, limit=20)
        source.last_sync_at = timezone.now()
        source.sync_status = 'success' if res['success'] else 'error'
        source.sync_error = res.get('error') or ''
        source.total_jobs_fetched += res.get('jobs_synced', 0)
        source.save()
        results.append({'source': comp, 'type': 'Lever', **res})

    # Sync Ashby
    for board, comp in default_ashby:
        source, _ = JobSource.objects.get_or_create(
            slug=f"ashby-{board}",
            defaults={
                'name': comp,
                'source_type': 'ashby',
                'board_token': board
            }
        )
        res = AshbyConnector.sync_board(board, comp, limit=20)
        source.last_sync_at = timezone.now()
        source.sync_status = 'success' if res['success'] else 'error'
        source.sync_error = res.get('error') or ''
        source.total_jobs_fetched += res.get('jobs_synced', 0)
        source.save()
        results.append({'source': comp, 'type': 'Ashby', **res})

    return results
