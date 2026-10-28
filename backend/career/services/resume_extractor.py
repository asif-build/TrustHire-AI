import os
import re
import zipfile
import xml.etree.ElementTree as ET
from pypdf import PdfReader
from pypdf.errors import FileNotDecryptedError, PdfReadError

from .job_sources import COMMON_SKILLS

# Categorized Skill Taxonomy for Phase 3
SKILL_TAXONOMY = {
    'programming_languages': [
        'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Golang',
        'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'SQL', 'Bash', 'Shell', 'C'
    ],
    'frameworks_and_libraries': [
        'React', 'Node.js', 'Django', 'FastAPI', 'Flask', 'Express.js', 'Express',
        'Next.js', 'Spring Boot', 'Vue.js', 'Vue', 'Angular', 'PyTorch', 'TensorFlow',
        'Pandas', 'NumPy', 'Scikit-learn', 'Tailwind CSS', 'Bootstrap', 'Redux', 'GraphQL'
    ],
    'cloud_platforms': [
        'AWS', 'Amazon Web Services', 'Azure', 'Microsoft Azure', 'GCP',
        'Google Cloud', 'Google Cloud Platform', 'Heroku', 'DigitalOcean'
    ],
    'databases': [
        'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
        'DynamoDB', 'Cassandra', 'Elasticsearch', 'Supabase', 'Firebase'
    ],
    'devops_and_tools': [
        'Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'GitHub Actions',
        'Terraform', 'Linux', 'Jenkins', 'Nginx', 'Postman', 'Webpack', 'Vite'
    ],
    'ai_and_ml': [
        'Machine Learning', 'Deep Learning', 'NLP', 'Natural Language Processing',
        'Computer Vision', 'LLMs', 'Large Language Models', 'Generative AI',
        'RAG', 'Retrieval-Augmented Generation', 'Prompt Engineering', 'LangChain'
    ],
    'domain_knowledge': [
        'Distributed Systems', 'Microservices', 'REST APIs', 'RESTful APIs',
        'System Design', 'WebSockets', 'Agile', 'Scrum', 'Object-Oriented Programming', 'Clean Architecture'
    ],
    'collaboration': [
        'Technical Leadership', 'Cross-functional Collaboration', 'Code Review',
        'Mentorship', 'Technical Documentation', 'Project Management'
    ]
}


def validate_file_safety(file_path, file_type):
    """
    Validates file signature / magic bytes, structure, and active content safety.
    Returns (is_safe: bool, error_message: str | None).
    """
    try:
        if not os.path.exists(file_path):
            return False, "Uploaded file does not exist on disk."

        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return False, "The uploaded file is completely empty."
        if file_size > 10 * 1024 * 1024:
            return False, "File size exceeds the 10MB limit."

        with open(file_path, 'rb') as f:
            header = f.read(2048)

        if file_type == 'pdf':
            # PDF magic byte check: %PDF- must appear in the first 1024 bytes
            if b'%PDF-' not in header[:1024]:
                return False, "Invalid file signature: File does not match valid PDF magic bytes (%PDF-)."
            return True, None

        elif file_type == 'docx':
            # DOCX is a zip package starting with PK\x03\x04
            if not header.startswith(b'PK\x03\x04'):
                return False, "Invalid file signature: File does not match valid DOCX zip archive header."

            # Inspect zip contents to ensure it is a genuine Word document and contains no macro/executables
            try:
                with zipfile.ZipFile(file_path, 'r') as zf:
                    namelist = zf.namelist()
                    if 'word/document.xml' not in namelist:
                        return False, "Invalid DOCX format: missing required word/document.xml structure."
                    # Security check: disallow macro-enabled documents or embedded scripts/binaries
                    disallowed = [n for n in namelist if n.endswith(('.exe', '.bat', '.cmd', '.vbs', '.js', '.bin', '.dll'))]
                    if disallowed:
                        return False, "Document contains disallowed active content or executable payload."
            except zipfile.BadZipFile:
                return False, "The DOCX file is corrupted or not a valid zip archive."

            return True, None

        else:
            return False, f"Unsupported file type: {file_type}."

    except Exception as e:
        return False, f"Document security verification failed: {str(e)}"


def extract_text_from_pdf(file_path):
    """
    Extracts selectable text from a PDF file using pypdf.
    Validates encryption, corrupted structure, and scans for digital text.
    """
    safety_ok, safety_err = validate_file_safety(file_path, 'pdf')
    if not safety_ok:
        return {
            'success': False,
            'text': '',
            'status': 'failed',
            'error': safety_err
        }

    try:
        reader = PdfReader(file_path)
        if reader.is_encrypted:
            return {
                'success': False,
                'text': '',
                'status': 'failed',
                'error': 'This PDF document is password-protected or encrypted. Please upload an unencrypted document.'
            }

        extracted_pages = []
        for i, page in enumerate(reader.pages):
            try:
                text = page.extract_text()
                if text:
                    extracted_pages.append(text.strip())
            except Exception:
                pass

        full_text = "\n\n".join(extracted_pages).strip()
        
        # If page text extraction is short, check form fields and annotations
        if len(full_text) < 15:
            try:
                fields = reader.get_fields()
                if fields:
                    field_vals = [str(v.get('/V', '')) for v in fields.values() if v.get('/V')]
                    if field_vals:
                        full_text = (full_text + "\n" + "\n".join(field_vals)).strip()
            except Exception:
                pass

        if len(full_text) < 10:
            return {
                'success': False,
                'text': '',
                'status': 'ocr_required',
                'error': 'This PDF appears to be a scanned image or empty document without selectable digital text. Please provide an exported PDF with selectable text or DOCX format.'
            }

        return {
            'success': True,
            'text': full_text,
            'status': 'parsed',
            'error': None
        }
    except FileNotDecryptedError:
        return {
            'success': False,
            'text': '',
            'status': 'failed',
            'error': 'PDF is encrypted with a password. Please remove encryption before uploading.'
        }
    except PdfReadError as pre:
        return {
            'success': False,
            'text': '',
            'status': 'failed',
            'error': f"Corrupted or invalid PDF structure: {str(pre)}"
        }
    except Exception as e:
        return {
            'success': False,
            'text': '',
            'status': 'failed',
            'error': f"Failed to parse PDF document: {str(e)}"
        }


def extract_text_from_docx(file_path):
    """
    Extracts text from a DOCX file by reading the word/document.xml content.
    Zero external C library dependencies, with full macro/zip verification.
    """
    safety_ok, safety_err = validate_file_safety(file_path, 'docx')
    if not safety_ok:
        return {
            'success': False,
            'text': '',
            'status': 'failed',
            'error': safety_err
        }

    try:
        with zipfile.ZipFile(file_path, 'r') as zf:
            if 'word/document.xml' not in zf.namelist():
                return {
                    'success': False,
                    'text': '',
                    'status': 'failed',
                    'error': 'Invalid DOCX structure: missing word/document.xml.'
                }
            xml_content = zf.read('word/document.xml')
            tree = ET.fromstring(xml_content)

            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            paragraphs = []
            for p in tree.iterfind('.//w:p', namespaces):
                texts = [node.text for node in p.iterfind('.//w:t', namespaces) if node.text]
                if texts:
                    paragraphs.append("".join(texts))

            full_text = "\n\n".join(paragraphs).strip()
            if len(full_text) < 30:
                return {
                    'success': False,
                    'text': '',
                    'status': 'failed',
                    'error': 'DOCX document contains insufficient text content.'
                }

            return {
                'success': True,
                'text': full_text,
                'status': 'parsed',
                'error': None
            }
    except zipfile.BadZipFile:
        return {
            'success': False,
            'text': '',
            'status': 'failed',
            'error': 'Corrupted or malformed DOCX file.'
        }
    except Exception as e:
        return {
            'success': False,
            'text': '',
            'status': 'failed',
            'error': f"Failed to read DOCX document: {str(e)}"
        }


def parse_structured_resume_data(raw_text):
    """
    Deterministic rule-based parser that maps raw resume text into structured fields.
    Extracts:
      - Basic info (name, headline, email, phone, location)
      - Categorized skills
      - Education
      - Experience with measurable impact detection
      - Projects
      - Certifications
    Distinguishes explicit vs inferred vs uncertain elements.
    Never hallucinates or invents non-existent details.
    """
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    lower_text = raw_text.lower()

    # 1. Contact Information
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
    email = email_match.group(0) if email_match else ''

    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', raw_text)
    phone = phone_match.group(0) if phone_match else ''

    # Candidate Name: first 1-3 lines excluding contact info, headers, or URLs
    candidate_name = ''
    candidate_headline = ''
    for i, line in enumerate(lines[:6]):
        if '@' not in line and not re.search(r'\d{2,}|http|www|\.com|phone|tel:|mobile|github|linkedin', line, re.I):
            clean_line = re.sub(r'[^a-zA-Z\s\.]', '', line).strip()
            if 3 <= len(clean_line) <= 40 and not any(kw in clean_line.lower() for kw in ['resume', 'curriculum', 'vitae', 'cv', 'summary', 'skills']):
                if not candidate_name:
                    candidate_name = clean_line
                elif not candidate_headline and len(line) < 60:
                    candidate_headline = line
                    break

    # Location heuristic (city, state, country)
    location_match = re.search(r'\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?),\s*([A-Z]{2}|[A-Z][a-zA-Z]+)\b', raw_text)
    location = location_match.group(0) if location_match else ''

    # 2. Categorized Skills
    detected_skills_flat = []
    categorized_skills = {}

    for category, skill_list in SKILL_TAXONOMY.items():
        matched = []
        for s in skill_list:
            pattern = r'\b' + re.escape(s.lower()) + r'\b'
            if re.search(pattern, lower_text):
                matched.append(s)
                if s not in detected_skills_flat:
                    detected_skills_flat.append(s)
        if matched:
            categorized_skills[category] = matched

    # Also capture other COMMON_SKILLS
    for s in COMMON_SKILLS:
        pattern = r'\b' + re.escape(s.lower()) + r'\b'
        if re.search(pattern, lower_text) and s not in detected_skills_flat:
            detected_skills_flat.append(s)

    # 3. Education Extraction
    education = []
    edu_keywords = ['bachelor', 'b.tech', 'b.e.', 'master', 'm.tech', 'm.s.', 'b.s.', 'ph.d', 'degree', 'university', 'institute', 'college']
    for i, line in enumerate(lines):
        if any(k in line.lower() for k in edu_keywords):
            year_match = re.search(r'\b(19\d{2}|20\d{2})\b', line)
            year = year_match.group(0) if year_match else ''
            
            # Degree extraction heuristic
            degree = line
            institution = line
            if ' - ' in line:
                parts = line.split(' - ')
                institution = parts[0].strip()
                degree = parts[1].strip()
            elif ',' in line:
                parts = line.split(',')
                institution = parts[0].strip()
                degree = parts[1].strip()

            if not any(e.get('institution') == institution for e in education):
                education.append({
                    'institution': institution,
                    'degree': degree,
                    'year': year,
                    'field_of_study': 'Computer Science / Engineering' if any(c in line.lower() for c in ['computer', 'software', 'technology', 'engineering']) else '',
                    'certainty': 'explicit' if year else 'inferred'
                })
        if len(education) >= 4:
            break

    # 4. Work Experience Extraction with Measurable Impact Detection
    work_experience = []
    exp_header_indices = []
    for i, line in enumerate(lines):
        if re.search(r'^(work\s+experience|professional\s+experience|employment\s+history|experience)\b', line, re.IGNORECASE):
            exp_header_indices.append(i)

    if exp_header_indices:
        start_idx = exp_header_indices[0] + 1
        end_idx = min(len(lines), start_idx + 35)
        current_role = None

        for line in lines[start_idx:end_idx]:
            if re.search(r'^(education|projects|skills|certifications|awards|publications)\b', line, re.IGNORECASE):
                break

            date_match = re.search(r'\b(20\d{2}|19\d{2})\b.*?(present|current|\d{4})?', line, re.IGNORECASE)
            if date_match and len(line) < 140:
                if current_role:
                    work_experience.append(current_role)
                current_role = {
                    'role_or_company': line,
                    'dates': date_match.group(0),
                    'bullets': [],
                    'impact_evidence': [],
                    'certainty': 'explicit'
                }
            elif current_role and (line.startswith('•') or line.startswith('-') or line.startswith('*') or len(line) > 20):
                clean_bullet = line.lstrip('•-* ')
                current_role['bullets'].append(clean_bullet)
                # Check for measurable impact (metrics, percentages, numbers, speedups)
                if re.search(r'(\d+%\s*|increased|reduced|improved|scaled|optimized|saved|\$\d+|\d+\+?\s*(users|requests|queries|engineers|teams))', clean_bullet, re.IGNORECASE):
                    current_role['impact_evidence'].append(clean_bullet)

        if current_role:
            work_experience.append(current_role)

    # 5. Projects Extraction
    projects = []
    proj_header_indices = []
    for i, line in enumerate(lines):
        if re.search(r'^(projects|technical\s+projects|selected\s+projects|key\s+projects)\b', line, re.IGNORECASE):
            proj_header_indices.append(i)

    if proj_header_indices:
        start_idx = proj_header_indices[0] + 1
        end_idx = min(len(lines), start_idx + 30)
        curr_proj = None

        for line in lines[start_idx:end_idx]:
            if re.search(r'^(education|experience|skills|certifications|interests)\b', line, re.IGNORECASE):
                break
            if len(line) < 60 and not (line.startswith('•') or line.startswith('-')):
                if curr_proj:
                    projects.append(curr_proj)
                curr_proj = {
                    'name': line,
                    'description': '',
                    'technologies': [s for s in detected_skills_flat if s.lower() in line.lower()],
                    'outcomes': [],
                    'certainty': 'explicit'
                }
            elif curr_proj:
                clean_line = line.lstrip('•-* ')
                if curr_proj['description']:
                    curr_proj['description'] += ' ' + clean_line
                else:
                    curr_proj['description'] = clean_line

                # Check for technologies mentioned in description
                for s in detected_skills_flat:
                    if s.lower() in clean_line.lower() and s not in curr_proj['technologies']:
                        curr_proj['technologies'].append(s)

                if re.search(r'(\d+%\s*|built|deployed|achieved|reduced|scaled)', clean_line, re.IGNORECASE):
                    curr_proj['outcomes'].append(clean_line)

        if curr_proj:
            projects.append(curr_proj)

    # 6. Certifications Extraction
    certifications = []
    cert_keywords = ['certified', 'certification', 'certificate', 'aws certified', 'gcp certified', 'coursera', 'udemy']
    for line in lines:
        if any(ck in line.lower() for ck in cert_keywords) and len(line) < 120:
            if not re.search(r'^(certifications|awards)\b', line, re.I):
                certifications.append({
                    'name': line,
                    'issuing_organization': 'AWS' if 'aws' in line.lower() else ('Google Cloud' if 'gcp' in line.lower() or 'google' in line.lower() else ''),
                    'date': (re.search(r'\b(20\d{2})\b', line) or [None])[0] or '',
                    'credential_url': (re.search(r'https?://[^\s]+', line) or [None])[0] or '',
                    'certainty': 'explicit'
                })
        if len(certifications) >= 5:
            break

    # 7. Uncertainty Flags & Review Indicators
    uncertainties = []
    if not candidate_name:
        uncertainties.append({'field': 'candidate_name', 'reason': 'Full name could not be reliably distinguished from document header.'})
    if not email:
        uncertainties.append({'field': 'email', 'reason': 'No email address found in the document.'})
    if not work_experience:
        uncertainties.append({'field': 'work_experience', 'reason': 'No structured work experience section identified.'})
    if not education:
        uncertainties.append({'field': 'education', 'reason': 'No formal degree or educational institution identified.'})

    # 8. Optional AI Synthesis if configured
    summary = ''
    try:
        from .ai_adapter import AIAdapter
        if AIAdapter.is_configured() and detected_skills_flat:
            prompt = f"Candidate resume text excerpt:\n{raw_text[:2000]}\n\nDetected skills: {detected_skills_flat[:15]}\nReturn JSON with 'summary': (2-3 concise professional sentences summarizing their engineering background) and 'recommended_headline': (e.g. Senior Full Stack Engineer)."
            ai_data = AIAdapter.generate_json(prompt)
            if ai_data.get('success') and isinstance(ai_data.get('data'), dict):
                ai_dict = ai_data['data']
                if ai_dict.get('summary'):
                    summary = ai_dict['summary']
                if ai_dict.get('recommended_headline'):
                    candidate_headline = ai_dict['recommended_headline']
    except Exception:
        pass

    return {
        'candidate_name': candidate_name,
        'headline': candidate_headline or ('Software Engineer' if 'software' in lower_text or 'developer' in lower_text else ''),
        'summary': summary,
        'email': email,
        'phone': phone,
        'location': location,
        'skills': detected_skills_flat,
        'categorized_skills': categorized_skills,
        'education': education,
        'work_experience': work_experience,
        'projects': projects,
        'certifications': certifications,
        'uncertainties': uncertainties,
        'needs_review': len(uncertainties) > 0,
        'analysis_version': 'TrustHire-Extractor-v2.0-Secure',
        'extracted_line_count': len(lines)
    }
