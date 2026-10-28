import re
from datetime import date
from django.utils import timezone
from ..models import (
    CareerProfile, JobPosting, CareerRoadmap, RoadmapPhase,
    RoadmapTask, TaskLearningResource, TaskProjectRecommendation
)
from companies.models import Company

# ---------------------------------------------------------------------------
# 1. VERIFIED LEARNING RESOURCES CATALOG
# ---------------------------------------------------------------------------
VERIFIED_RESOURCES = {
    'Python': {
        'title': 'Official Python Documentation & Tutorial',
        'provider': 'Python Software Foundation',
        'url': 'https://docs.python.org/3/tutorial/',
        'difficulty': 'Beginner to Advanced',
        'is_official': True
    },
    'Django': {
        'title': 'Official Django Documentation & Architecture Guide',
        'provider': 'Django Software Foundation',
        'url': 'https://docs.djangoproject.com/en/stable/',
        'difficulty': 'Intermediate',
        'is_official': True
    },
    'FastAPI': {
        'title': 'FastAPI Tutorial - User Guide',
        'provider': 'FastAPI / Sebastián Ramírez',
        'url': 'https://fastapi.tiangolo.com/tutorial/',
        'difficulty': 'Intermediate',
        'is_official': True
    },
    'React': {
        'title': 'React Official Documentation (react.dev)',
        'provider': 'Meta Open Source',
        'url': 'https://react.dev/learn',
        'difficulty': 'Beginner to Advanced',
        'is_official': True
    },
    'TypeScript': {
        'title': 'TypeScript Handbook & Reference',
        'provider': 'Microsoft',
        'url': 'https://www.typescriptlang.org/docs/handbook/intro.html',
        'difficulty': 'Intermediate',
        'is_official': True
    },
    'JavaScript': {
        'title': 'MDN Web Docs: JavaScript Guide',
        'provider': 'Mozilla Developer Network',
        'url': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        'difficulty': 'Beginner to Advanced',
        'is_official': True
    },
    'PostgreSQL': {
        'title': 'PostgreSQL Official Documentation',
        'provider': 'PostgreSQL Global Development Group',
        'url': 'https://www.postgresql.org/docs/current/',
        'difficulty': 'Intermediate to Advanced',
        'is_official': True
    },
    'Docker': {
        'title': 'Docker Get Started & Containerization Essentials',
        'provider': 'Docker, Inc.',
        'url': 'https://docs.docker.com/get-started/',
        'difficulty': 'Beginner to Intermediate',
        'is_official': True
    },
    'Kubernetes': {
        'title': 'Kubernetes Basics & Production Concepts',
        'provider': 'Cloud Native Computing Foundation (CNCF)',
        'url': 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
        'difficulty': 'Advanced',
        'is_official': True
    },
    'AWS': {
        'title': 'AWS Cloud Practitioner & Architecture Documentation',
        'provider': 'Amazon Web Services',
        'url': 'https://aws.amazon.com/getting-started/',
        'difficulty': 'Intermediate',
        'is_official': True
    },
    'System Design': {
        'title': 'The System Design Primer',
        'provider': 'Donne Martin (Open Source Education)',
        'url': 'https://github.com/donnemartin/system-design-primer',
        'difficulty': 'Advanced',
        'is_official': False
    },
    'Machine Learning': {
        'title': 'Google Machine Learning Crash Course',
        'provider': 'Google Developers',
        'url': 'https://developers.google.com/machine-learning/crash-course',
        'difficulty': 'Intermediate',
        'is_official': True
    },
    'PyTorch': {
        'title': 'Deep Learning with PyTorch Tutorials',
        'provider': 'PyTorch Foundation',
        'url': 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html',
        'difficulty': 'Intermediate to Advanced',
        'is_official': True
    },
    'Git': {
        'title': 'Pro Git Book & Official Git Documentation',
        'provider': 'Git SCM / Scott Chacon',
        'url': 'https://git-scm.com/book/en/v2',
        'difficulty': 'Beginner to Intermediate',
        'is_official': True
    },
    'Linux': {
        'title': 'Linux Journey: Systems, Kernel & Networking',
        'provider': 'Linux Journey Project',
        'url': 'https://linuxjourney.com/',
        'difficulty': 'Beginner to Intermediate',
        'is_official': False
    },
    'REST': {
        'title': 'RESTful API Architectural Guidelines',
        'provider': 'Roy Fielding / MDN Web Docs',
        'url': 'https://developer.mozilla.org/en-US/docs/Glossary/REST',
        'difficulty': 'Beginner to Intermediate',
        'is_official': True
    },
    'Redis': {
        'title': 'Redis Official Documentation & Data Structures',
        'provider': 'Redis Ltd.',
        'url': 'https://redis.io/docs/latest/',
        'difficulty': 'Intermediate',
        'is_official': True
    },
    'GraphQL': {
        'title': 'Introduction to GraphQL & Schema Specification',
        'provider': 'GraphQL Foundation',
        'url': 'https://graphql.org/learn/',
        'difficulty': 'Intermediate',
        'is_official': True
    },
}

# ---------------------------------------------------------------------------
# 2. VERIFIED ROLE TAXONOMY (Standard Role Requirements)
# ---------------------------------------------------------------------------
VERIFIED_ROLE_TAXONOMY = {
    'Full-Stack Engineer': {
        'required_skills': ['JavaScript', 'TypeScript', 'React', 'Python', 'Django', 'REST', 'SQL', 'Git'],
        'preferred_skills': ['PostgreSQL', 'Docker', 'Redis', 'AWS', 'Tailwind', 'CI/CD'],
        'experience_years': '2–5 years',
        'focus_areas': 'Frontend component architecture, backend RESTful APIs, relational schema design, auth workflows, automated testing.'
    },
    'Frontend Engineer': {
        'required_skills': ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Tailwind', 'Git'],
        'preferred_skills': ['Next.js', 'GraphQL', 'Jest', 'Web Performance', 'Accessibility (a11y)'],
        'experience_years': '2–4 years',
        'focus_areas': 'Modern client UI, reactive state management, responsive accessibility, client bundle optimization, design systems.'
    },
    'Backend Engineer': {
        'required_skills': ['Python', 'PostgreSQL', 'REST', 'SQL', 'Docker', 'Git', 'System Design'],
        'preferred_skills': ['FastAPI', 'Django', 'Redis', 'Kafka', 'Microservices', 'Kubernetes', 'AWS'],
        'experience_years': '3–6 years',
        'focus_areas': 'Distributed architecture, high-throughput database queries, asynchronous messaging queues, caching, API security.'
    },
    'Machine Learning Engineer': {
        'required_skills': ['Python', 'PyTorch', 'Machine Learning', 'Pandas', 'NumPy', 'SQL', 'Git'],
        'preferred_skills': ['TensorFlow', 'LLM', 'NLP', 'Docker', 'Vector Databases', 'AWS', 'Airflow'],
        'experience_years': '2–5 years',
        'focus_areas': 'Model training & fine-tuning pipelines, evaluation metrics, inference serving optimization, embeddings, data pipelines.'
    },
    'DevOps / Cloud Engineer': {
        'required_skills': ['Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Git', 'Python'],
        'preferred_skills': ['Terraform', 'GCP', 'Azure', 'Elasticsearch', 'Prometheus', 'Cybersecurity'],
        'experience_years': '3–6 years',
        'focus_areas': 'Infrastructure as Code (IaC), container orchestration, cloud networking, continuous delivery, telemetry & SRE observability.'
    },
}

def get_role_template(target_role):
    # Match role keyword
    lower = target_role.lower()
    if 'front' in lower or 'ui' in lower:
        return VERIFIED_ROLE_TAXONOMY['Frontend Engineer']
    elif 'back' in lower or 'distrib' in lower or 'api' in lower:
        return VERIFIED_ROLE_TAXONOMY['Backend Engineer']
    elif 'ml' in lower or 'machine learning' in lower or 'ai' in lower:
        return VERIFIED_ROLE_TAXONOMY['Machine Learning Engineer']
    elif 'devops' in lower or 'cloud' in lower or 'infra' in lower or 'sre' in lower:
        return VERIFIED_ROLE_TAXONOMY['DevOps / Cloud Engineer']
    return VERIFIED_ROLE_TAXONOMY['Full-Stack Engineer']


# ---------------------------------------------------------------------------
# 3. PROJECT TEMPLATES LINKED TO MISSING SKILLS
# ---------------------------------------------------------------------------
PROJECT_TEMPLATES = {
    'Full-Stack': {
        'title': 'Production Multi-Tenant SaaS Workspace with Role-Based Access Control',
        'objective': 'Build and deploy an enterprise-grade collaborative application featuring JWT authentication, tenant isolation, interactive dashboard, and automated testing.',
        'why_relevant': 'Demonstrates end-to-end full-stack competence, clean architecture, secure authorization boundaries, and real-time state synchronization.',
        'skills': ['React', 'TypeScript', 'Django', 'PostgreSQL', 'Docker', 'REST'],
        'milestones': [
            'Design normalized relational schema with tenant-scoped models and database constraints.',
            'Implement authenticated REST API with refresh tokens and permission classes.',
            'Build responsive React frontend with TypeScript types, form validation, and query caching.',
            'Containerize application with Docker Compose and write unit test suite with >80% coverage.'
        ],
        'deliverables': ['GitHub Repository with CI workflow', 'Deployed Staging URL', 'OpenAPI/Swagger Documentation', 'Architecture Design RFC'],
        'evaluation_criteria': 'Strict separation of concerns, zero SQL injection / XSS vulnerabilities, sub-200ms API response time, responsive layout.',
        'extension_ideas': ['Integrate Redis caching for frequently queried lists', 'Add Webhook dispatch mechanism for third-party integrations'],
        'repo_url': 'https://github.com/tastejs/realworld'
    },
    'Backend': {
        'title': 'High-Throughput Distributed Event Processing & Caching Service',
        'objective': 'Design a resilient distributed ingestion API handling concurrent asynchronous workloads with Redis caching and PostgreSQL persistence.',
        'why_relevant': 'Demonstrates understanding of concurrency, data consistency, caching invalidation strategies, and robust error recovery under load.',
        'skills': ['Python', 'PostgreSQL', 'Redis', 'Docker', 'System Design'],
        'milestones': [
            'Implement ingestion API endpoint capable of batching concurrent incoming requests.',
            'Configure Redis for rate-limiting, session deduplication, and cache read-through.',
            'Set up database connection pooling and optimized indexes for time-series / analytical queries.',
            'Perform load testing using Locust to prove stability under 1,000 requests/sec.'
        ],
        'deliverables': ['Source code repository with Dockerfile', 'Locust load test report', 'Database migration history and indexing analysis'],
        'evaluation_criteria': 'P99 latency under 150ms, graceful handling of Redis downtime, automated retry policies with exponential backoff.',
        'extension_ideas': ['Add OpenTelemetry distributed tracing', 'Export Prometheus metrics to a Grafana dashboard'],
        'repo_url': 'https://github.com/donnemartin/system-design-primer'
    },
    'Cloud-DevOps': {
        'title': 'Automated Multi-Environment GitOps Infrastructure Pipeline',
        'objective': 'Create production-ready Infrastructure as Code (IaC) provisioning containerized microservices on Kubernetes with automated CI/CD.',
        'why_relevant': 'Demonstrates modern cloud engineering best practices: immutable infrastructure, automated testing gates, and secure secret management.',
        'skills': ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'],
        'milestones': [
            'Create multi-stage Dockerfiles optimizing image size and eliminating root user execution.',
            'Write declarative Kubernetes manifests (Deployments, Services, Ingress, Horizontal Pod Autoscaler).',
            'Implement GitHub Actions workflow testing, linting, building, and tagging container images.',
            'Configure health checks, readiness probes, and zero-downtime rolling deployment strategies.'
        ],
        'deliverables': ['IaC repository with GitHub Actions workflows', 'Kubernetes Helm chart or Kustomize manifests', 'Runbook documentation'],
        'evaluation_criteria': 'Zero plaintext secrets in source code, reproducible clean build, automated rollback on failing readiness probe.',
        'extension_ideas': ['Implement automated SSL cert renewal with cert-manager', 'Add network policies restricting inter-pod communication'],
        'repo_url': 'https://github.com/kelseyhightower/nocode'
    }
}


# ---------------------------------------------------------------------------
# 4. ROADMAP ENGINE CORE GENERATOR
# ---------------------------------------------------------------------------
class RoadmapEngine:

    @classmethod
    def generate_roadmap(
        cls,
        user,
        company_name,
        target_role,
        job_id=None,
        learning_preferences='project-based',
        hours_per_week=10
    ):
        """
        Generates an individualised, 6-phase career roadmap backed by traceable requirements.
        Preserves user progress and provides explainable readiness calculations.
        """
        # 1. Fetch Candidate Profile Evidence
        profile = getattr(user, 'career_profile', None)
        user_skills = set()
        user_projects = []
        user_exp = []

        if profile:
            # Profile declared skills
            for s in profile.skills:
                if isinstance(s, dict) and s.get('name'):
                    user_skills.add(s['name'].lower())
                elif isinstance(s, str):
                    user_skills.add(s.lower())
            user_projects = profile.projects or []
            user_exp = profile.work_experience or []

        # Also inspect primary resume document if parsed
        primary_resume = user.career_resumes.filter(parsing_status='parsed').order_by('-created_at').first()
        if primary_resume and primary_resume.extracted_data:
            extracted_skills = primary_resume.extracted_data.get('skills', [])
            for s in extracted_skills:
                if isinstance(s, str):
                    user_skills.add(s.lower())

        # 2. Fetch or Establish Target Requirements
        job_obj = None
        if job_id:
            try:
                job_obj = JobPosting.objects.filter(id=job_id).first()
            except Exception:
                pass

        if job_obj:
            required_skills = job_obj.required_skills or []
            preferred_skills = job_obj.preferred_skills or []
            effective_company = job_obj.company_name or company_name
            effective_role = job_obj.title or target_role
        else:
            role_tmpl = get_role_template(target_role)
            required_skills = role_tmpl['required_skills']
            preferred_skills = role_tmpl['preferred_skills']
            effective_company = company_name or 'Industry Standard'
            effective_role = target_role

        # Link Company model if matching
        company_obj = Company.objects.filter(company_name__iexact=effective_company).first()
        if not company_obj and company_name:
            company_obj = Company.objects.filter(company_name__iexact=company_name).first()

        # 3. Establish Baseline & Skill Gap Analysis
        demonstrated = []
        partially_demonstrated = []
        needs_evidence = []
        learning_recommended = []

        # Analyze each required skill
        for skill in required_skills:
            skill_lower = skill.lower()
            # Check if evidenced in projects or experience
            in_projects = any(skill_lower in str(p).lower() for p in user_projects)
            in_exp = any(skill_lower in str(e).lower() for e in user_exp)
            in_skills_list = skill_lower in user_skills

            if in_projects and in_exp:
                demonstrated.append(skill)
            elif in_projects or in_exp:
                partially_demonstrated.append(skill)
            elif in_skills_list:
                needs_evidence.append(skill)
            else:
                learning_recommended.append(skill)

        # Calculate explainable readiness score
        # Formula: weighted score over required skills
        total_reqs = len(required_skills) or 1
        raw_score = (
            (len(demonstrated) * 1.0) +
            (len(partially_demonstrated) * 0.65) +
            (len(needs_evidence) * 0.40)
        ) / total_reqs * 100
        readiness_score = round(min(100.0, max(12.0, raw_score)), 1)

        summary_text = (
            f"Candidate evidences {len(demonstrated)} core skills with practical experience, "
            f"{len(partially_demonstrated)} with partial project evidence, and {len(needs_evidence)} "
            f"listed in profile requiring verifiable demonstration. {len(learning_recommended)} critical "
            f"competencies require focused preparation to match {effective_company}'s stated expectations."
        )

        # 4. Create CareerRoadmap Instance
        roadmap = CareerRoadmap.objects.create(
            user=user,
            company=company_obj,
            company_name=effective_company,
            target_role=effective_role,
            job=job_obj,
            readiness_score=readiness_score,
            readiness_summary=summary_text,
            baseline_skills={
                'demonstrated': demonstrated,
                'partially_demonstrated': partially_demonstrated,
                'needs_evidence': needs_evidence,
                'learning_recommended': learning_recommended,
            },
            target_requirements={
                'required_skills': required_skills,
                'preferred_skills': preferred_skills,
            },
            skill_gap_analysis={
                'gap_count': len(learning_recommended),
                'needs_evidence_count': len(needs_evidence),
                'readiness_tier': 'High' if readiness_score >= 75 else ('Medium' if readiness_score >= 45 else 'Foundational'),
                'hours_per_week_allocated': hours_per_week,
            },
            status='active'
        )

        # 5. Generate the 6 Structured Phases
        phases_data = [
            (
                1,
                "Validate the Foundation",
                "Audit core technical proficiencies, verify foundational tools, and consolidate existing codebase artifacts.",
                2
            ),
            (
                2,
                "Develop Missing Competencies",
                f"Close identified skill gaps ({', '.join(learning_recommended[:3]) if learning_recommended else 'target requirements'}) through official documentation and hands-on exercises.",
                3
            ),
            (
                3,
                "Build Role-Relevant Projects",
                f"Construct production-grade deliverables aligned directly with {effective_company}'s engineering systems.",
                4
            ),
            (
                4,
                "Improve Portfolio & Resume Evidence",
                "Formulate quantified impact bullets, verify GitHub repository presentation, and generate tailored application assets.",
                2
            ),
            (
                5,
                "Practise Technical & Behavioural Interviews",
                f"Simulate role-specific technical deep-dives, system architecture defenses, and behavioral scenarios for {effective_company}.",
                2
            ),
            (
                6,
                "Review Relevant Vacancies & Apply",
                "Final audit of live vacancies, referral strategy, application submission tracking, and ongoing interview management.",
                1
            ),
        ]

        created_phases = {}
        for num, title, desc, weeks in phases_data:
            phase = RoadmapPhase.objects.create(
                roadmap=roadmap,
                phase_number=num,
                title=f"Phase {num} — {title}",
                description=desc,
                estimated_weeks=weeks,
                order=num
            )
            created_phases[num] = phase

        # 6. Populate Tasks, Resources & Projects across Phases
        cls._create_phase_1_tasks(created_phases[1], required_skills, demonstrated)
        cls._create_phase_2_tasks(created_phases[2], learning_recommended, needs_evidence)
        cls._create_phase_3_tasks(created_phases[3], effective_role, effective_company, required_skills)
        cls._create_phase_4_tasks(created_phases[4], effective_role, effective_company)
        cls._create_phase_5_tasks(created_phases[5], effective_role, effective_company, required_skills)
        cls._create_phase_6_tasks(created_phases[6], effective_company, job_obj)

        return roadmap

    @classmethod
    def _create_phase_1_tasks(cls, phase, required_skills, demonstrated):
        t1 = RoadmapTask.objects.create(
            phase=phase,
            title="Baseline Technical & Environment Audit",
            explanation="Ensure runtime environments, version managers, Git configuration, and container engines match modern production standards.",
            why_it_matters="Technical screening often evaluates whether candidate environments are robust and capable of immediate contribution.",
            related_requirement="Foundational Developer Workflow",
            status='todo',
            priority='high',
            estimated_effort='4–6 hours (estimated)',
            completion_criteria="Clean local development setup with verified terminal toolchain, Docker engine, and signed Git commits.",
            evidence_guide="Screenshot of development environment or link to a dotfiles / starter template repository.",
            order=1
        )
        cls._attach_resource(t1, 'Git')
        cls._attach_resource(t1, 'Linux')

        t2 = RoadmapTask.objects.create(
            phase=phase,
            title="Core Language Idioms & Code Cleanliness Review",
            explanation="Review language-specific best practices, typing systems, error handling conventions, and unit testing frameworks.",
            why_it_matters="Interview reviewers examine code structure, idiomatic syntax, and test discipline before architecture.",
            related_requirement=f"Core Language Fluency ({required_skills[0] if required_skills else 'Python / TypeScript'})",
            status='todo',
            priority='medium',
            estimated_effort='6–8 hours (estimated)',
            completion_criteria="Implement a clean reference module with 100% type coverage, comprehensive unit tests, and CI linting.",
            evidence_guide="Link to a pull request with passing test suite and automated linter workflow.",
            order=2
        )
        if required_skills:
            cls._attach_resource(t2, required_skills[0])

    @classmethod
    def _create_phase_2_tasks(cls, phase, learning_recommended, needs_evidence):
        order = 1
        focus_skills = (learning_recommended + needs_evidence)[:4]
        if not focus_skills:
            focus_skills = ['PostgreSQL', 'Docker', 'System Design']

        for skill in focus_skills:
            task = RoadmapTask.objects.create(
                phase=phase,
                title=f"Master {skill} Core Architecture & Production Patterns",
                explanation=f"Study official reference documentation for {skill}, complete deep-dive hands-on labs, and build a verified working prototype.",
                why_it_matters=f"Directly addresses target vacancy requirement for {skill}, transforming an unevidenced skill into a verifiable strength.",
                related_requirement=skill,
                status='todo',
                priority='high' if skill in learning_recommended else 'medium',
                estimated_effort='8–12 hours (estimated)',
                completion_criteria=f"Working proof-of-concept module implementing {skill} with documented architecture and clean integration.",
                evidence_guide=f"Submit GitHub repository link or code walkthrough displaying active usage of {skill}.",
                order=order
            )
            cls._attach_resource(task, skill)
            order += 1

    @classmethod
    def _create_phase_3_tasks(cls, phase, target_role, company_name, required_skills):
        # Select best project template
        if 'back' in target_role.lower() or 'distrib' in target_role.lower():
            tmpl = PROJECT_TEMPLATES['Backend']
        elif 'devops' in target_role.lower() or 'cloud' in target_role.lower():
            tmpl = PROJECT_TEMPLATES['Cloud-DevOps']
        else:
            tmpl = PROJECT_TEMPLATES['Full-Stack']

        t1 = RoadmapTask.objects.create(
            phase=phase,
            title=f"Architect & Build: {tmpl['title']}",
            explanation=tmpl['objective'],
            why_it_matters=f"Tailored to {company_name}'s domain to demonstrate you can deliver production-ready software matching their team standards.",
            related_requirement=f"Practical Systems Engineering ({', '.join(tmpl['skills'][:3])})",
            status='todo',
            priority='high',
            estimated_effort='20–30 hours (estimated across 3 weeks)',
            completion_criteria="Fully functional deployed project with public GitHub repository, automated CI tests, and live interactive URL.",
            evidence_guide="Public GitHub repository URL and live production deployment link.",
            order=1
        )
        TaskProjectRecommendation.objects.create(
            task=t1,
            title=tmpl['title'],
            objective=tmpl['objective'],
            why_relevant=tmpl['why_relevant'],
            skills_demonstrated=tmpl['skills'],
            implementation_milestones=tmpl['milestones'],
            deliverables=tmpl['deliverables'],
            evaluation_criteria=tmpl['evaluation_criteria'],
            extension_ideas=tmpl['extension_ideas'],
            verified_repo_url=tmpl.get('repo_url', ''),
            is_open_source_reference=True
        )
        cls._attach_resource(t1, 'System Design')
        cls._attach_resource(t1, 'Docker')

    @classmethod
    def _create_phase_4_tasks(cls, phase, target_role, company_name):
        t1 = RoadmapTask.objects.create(
            phase=phase,
            title=f"Quantify Portfolio Evidence & Refine Technical Resume for {company_name}",
            explanation="Rewrite resume bullets using the Google XYZ formula: 'Accomplished [X], as measured by [Y], by doing [Z]'. Highlight evidenced skills.",
            why_it_matters="Engineering hiring managers and technical screeners look for measurable business and latency impact rather than passive task lists.",
            related_requirement="Evidence Presentation & Impact Metric Clarity",
            status='todo',
            priority='high',
            estimated_effort='4–6 hours (estimated)',
            completion_criteria="Updated TrustHire tailored resume document with verified metrics, linked project repositories, and clean typography.",
            evidence_guide="Submit exported PDF or save tailored resume version in TrustHire Application Studio.",
            order=1
        )

        t2 = RoadmapTask.objects.create(
            phase=phase,
            title="Audit GitHub Profile & Public Engineering Artifacts",
            explanation="Ensure pinned repositories contain clear READMEs, architecture diagrams, installation guides, and test coverage badges.",
            why_it_matters="Provides instant proof of execution when recruiters and engineers inspect your profile.",
            related_requirement="Public Engineering Credibility",
            status='todo',
            priority='medium',
            estimated_effort='3–5 hours (estimated)',
            completion_criteria="Top 3 repositories on GitHub feature visual architecture diagrams, setup instructions, and clean commit history.",
            evidence_guide="Link to public GitHub profile.",
            order=2
        )

    @classmethod
    def _create_phase_5_tasks(cls, phase, target_role, company_name, required_skills):
        t1 = RoadmapTask.objects.create(
            phase=phase,
            title=f"System Architecture & Scalability Deep-Dive for {company_name}",
            explanation=f"Prepare to design systems matching {company_name}'s scale: distributed caching, rate limiting, database sharding, and resilience patterns.",
            why_it_matters="System design rounds test your ability to balance trade-offs, communicate clearly, and design for high availability.",
            related_requirement="System Design & Architecture Evaluation",
            status='todo',
            priority='high',
            estimated_effort='8–12 hours (estimated)',
            completion_criteria="Complete 3 end-to-end system design simulations on TrustHire Interview Prep and score above 80% on trade-off analysis.",
            evidence_guide="Completed interview prep session notes and architectural diagram.",
            order=1
        )
        cls._attach_resource(t1, 'System Design')

        t2 = RoadmapTask.objects.create(
            phase=phase,
            title="Behavioral Scenarios & Project Defense Practice",
            explanation="Structure behavioral answers using the STAR method (Situation, Task, Action, Result), focusing on conflicts, ambiguity, and technical ownership.",
            why_it_matters="Cultural alignment and technical communication determine senior leveling and final offer decisions.",
            related_requirement="Technical Leadership & Communication",
            status='todo',
            priority='medium',
            estimated_effort='4–6 hours (estimated)',
            completion_criteria="Document 5 detailed STAR stories addressing conflict resolution, system outages, deadline pressure, and mentorship.",
            evidence_guide="Completed STAR story document in TrustHire Interview Studio.",
            order=2
        )

    @classmethod
    def _create_phase_6_tasks(cls, phase, company_name, job_obj):
        app_url = job_obj.application_url if job_obj else f"https://careers.{company_name.lower().replace(' ', '')}.com"
        t1 = RoadmapTask.objects.create(
            phase=phase,
            title=f"Review Active Vacancies & Final Application Submission for {company_name}",
            explanation=f"Conduct final review of job requirements, ensure tailored resume and cover letter are synchronized, and apply directly via official employer portal.",
            why_it_matters="Applying through official channels with verified tailored evidence maximizes candidate visibility.",
            related_requirement=f"Application Dispatch to {company_name}",
            status='todo',
            priority='high',
            estimated_effort='2–3 hours (estimated)',
            completion_criteria=f"Application submitted via official URL ({app_url}) and tracked in TrustHire Application Tracker.",
            evidence_guide="Recorded application in TrustHire Tracker with application date and confirmation email reference.",
            order=1
        )

    @classmethod
    def _attach_resource(cls, task, skill_name):
        res = VERIFIED_RESOURCES.get(skill_name)
        if res:
            TaskLearningResource.objects.create(
                task=task,
                title=res['title'],
                provider=res['provider'],
                url=res['url'],
                associated_skill=skill_name,
                difficulty_level=res['difficulty'],
                is_free=True,
                is_official_documentation=res['is_official'],
                verified_date=date.today()
            )
