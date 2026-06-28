import os
import django
import sys
import uuid

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trusthire.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import RecruiterProfile, CandidateProfile
from jobs.models import Job
from resumes.models import Resume
from matching.models import CandidateRanking, AuditLog
from matching.engines.fusion_scoring import FusionScoringEngine

User = get_user_model()

def seed():
    print("Deleting old seed data...")
    CandidateRanking.objects.all().delete()
    Resume.objects.all().delete()
    Job.objects.all().delete()
    CandidateProfile.objects.all().delete()
    RecruiterProfile.objects.all().delete()
    User.objects.all().delete()
    AuditLog.objects.all().delete()
    
    print("Creating recruiter...")
    # Create Recruiter
    rec_user = User.objects.create_user(
        id="a1111111-2222-3333-4444-555555555555",
        username="recruiter_demo",
        email="recruiter@demo.com",
        full_name="Rajesh Mehta",
        role="recruiter"
    )
    rec_profile = RecruiterProfile.objects.create(
        user=rec_user,
        company_name="TrustHire Tech Solutions",
        designation="Talent Acquisition Lead",
        is_verified=True
    )
    
    print("Creating job description...")
    # Create Job Description
    jd_text = """
    Job Title: Senior Backend Engineer
    Experience Required: 4 Years
    Must Have Skills: Python, Django, PostgreSQL, AWS, Docker
    Nice To Have Skills: Kubernetes, Redis, System Design
    We are looking for a software engineer to build core API services, coordinate scale, and deploy containers on AWS cloud infrastructure. High startup pace.
    """
    job = Job.objects.create(
        recruiter=rec_profile,
        title="Senior Backend Engineer",
        description_text=jd_text,
        structured_analysis={
            "job_title": "Senior Backend Engineer",
            "must_have_skills": ["PYTHON", "DJANGO", "POSTGRESQL", "AWS", "DOCKER"],
            "nice_to_have_skills": ["KUBERNETES", "REDIS"],
            "experience_required": 4,
            "seniority": "Senior",
            "domain": "Backend Development",
            "soft_skills": ["Communication", "System Design"],
            "hidden_expectations": "Fast-paced startup adaptability, container optimization."
        }
    )
    
    # Candidate dataset configuration
    candidates_data = [
        {
            "id": "c1111111-1111-1111-1111-111111111111",
            "username": "candidate_sharma",
            "email": "sharma@demo.com",
            "full_name": "Aarav Sharma",
            "github": "https://github.com/aaravsharma",
            "linkedin": "https://linkedin.com/in/aaravsharma",
            "location": "Bangalore",
            "notice": 15,
            "experience_years": 4.5,
            "resume_text": """
            Aarav Sharma - Backend Engineer
            Email: sharma@demo.com | Github: github.com/aaravsharma
            Education: B.Tech, Tier-3 Engineering College (2020)
            Experience:
            - Software Developer at Early-stage Startup (2022-2024). Maintained Django backend APIs, setup Docker, deployed on AWS EC2.
            - Freelancer (2020-2022). Custom web platforms, API integrations.
            Skills: Python, Django, Docker, AWS, PostgreSQL, SQL, Git, JavaScript.
            """,
            "resume_analysis": {
                "skills": ["Python", "Django", "Docker", "AWS", "PostgreSQL", "JavaScript"],
                "github": "https://github.com/aaravsharma",
                "linkedin": "https://linkedin.com/in/aaravsharma",
                "experience": [
                    {
                        "role": "Software Developer",
                        "company": "Growth Tech Startup",
                        "duration": "2 Years",
                        "description": "Maintained Django backend APIs, setup Docker, deployed on AWS EC2."
                    },
                    {
                        "role": "Freelance Developer",
                        "company": "Upwork Contracts",
                        "duration": "2 Years",
                        "description": "Built custom web portals and payment gateways."
                    }
                ],
                "education": [
                    {
                        "degree": "B.Tech Computer Science",
                        "institution": "Local College (Tier-3)",
                        "year": "2020"
                    }
                ],
                "gaps": [],
                "freelance": [
                    {
                        "client": "Various",
                        "projects": "Web design, APIs",
                        "duration": "2 Years"
                    }
                ],
                "certifications": ["AWS Cloud Practitioner"],
                "projects": [
                    {
                        "name": "E-Commerce Pipeline",
                        "description": "High-throughput pipeline deployed on AWS.",
                        "technologies": ["Python", "Docker", "PostgreSQL"]
                    }
                ]
            }
        },
        {
            "id": "c2222222-2222-2222-2222-222222222222",
            "username": "candidate_patel",
            "email": "patel@demo.com",
            "full_name": "Pooja Patel",
            "github": "https://github.com/poojapatel",
            "linkedin": "https://linkedin.com/in/poojapatel",
            "location": "Mumbai",
            "notice": 30,
            "experience_years": 5.0,
            "resume_text": """
            Pooja Patel - Systems Engineer
            Education: B.Tech Computer Science, IIT Bombay (2018)
            Experience:
            - Backend Developer, MNC Software (2019-2022). Scaled Python microservices, managed postgres databases.
            Gaps:
            - 2022-2024: Took career gap for intense UPSC Civil Services preparation.
            Skills: Python, PostgreSQL, SQL, Linux, C++, Java, AWS.
            """,
            "resume_analysis": {
                "skills": ["Python", "PostgreSQL", "SQL", "Java", "AWS"],
                "github": "https://github.com/poojapatel",
                "linkedin": "https://linkedin.com/in/poojapatel",
                "experience": [
                    {
                        "role": "Systems Developer",
                        "company": "Big Tech Corp",
                        "duration": "3 Years",
                        "description": "Scaled Python microservices, managed postgres databases."
                    }
                ],
                "education": [
                    {
                        "degree": "B.Tech Computer Science",
                        "institution": "Indian Institute of Technology (IIT) Bombay",
                        "year": "2018"
                    }
                ],
                "gaps": [
                    {
                        "duration": "2 Years",
                        "reason": "UPSC Civil Services Preparation",
                        "justification": "Candidate dedicated time to civil services exam preparation; displays high analytical capacity and dedication."
                    }
                ],
                "freelance": [],
                "certifications": [],
                "projects": [
                    {
                        "name": "Database Partition Scheduler",
                        "description": "Built automated scheduler for tables partition.",
                        "technologies": ["Python", "PostgreSQL"]
                    }
                ]
            }
        },
        {
            "id": "c3333333-3333-3333-3333-333333333333",
            "username": "candidate_kumar",
            "email": "kumar@demo.com",
            "full_name": "Vikram Kumar",
            "github": "",
            "linkedin": "",
            "location": "Pune",
            "notice": 60,
            "experience_years": 1.5,
            "resume_text": """
            Vikram Kumar
            Education: B.Tech CS, Tier-3 local college (2023)
            Skills: Java, Spring Boot, MySQL.
            Experience:
            - Junior Software Engineer (1.5 Years). Spring boot REST APIs.
            """,
            "resume_analysis": {
                "skills": ["Java", "Spring Boot", "MySQL"],
                "github": "",
                "linkedin": "",
                "experience": [
                    {
                        "role": "Junior Engineer",
                        "company": "Service Tech",
                        "duration": "1.5 Years",
                        "description": "Worked on spring boot REST APIs."
                    }
                ],
                "education": [
                    {
                        "degree": "B.Tech Computer Science",
                        "institution": "State University (Tier-3)",
                        "year": "2023"
                    }
                ],
                "gaps": [],
                "freelance": [],
                "certifications": [],
                "projects": []
            }
        }
    ]

    print("Populating candidates & matches...")
    for c in candidates_data:
        user = User.objects.create_user(
            id=c["id"],
            username=c["username"],
            email=c["email"],
            full_name=c["full_name"],
            role="candidate"
        )
        cand_profile = CandidateProfile.objects.create(
            user=user,
            github_url=c["github"],
            linkedin_url=c["linkedin"],
            location=c["location"],
            notice_period=c["notice"],
            experience_years=c["experience_years"]
        )
        resume = Resume.objects.create(
            candidate=cand_profile,
            raw_text=c["resume_text"],
            structured_analysis=c["resume_analysis"]
        )
        
        # Calculate matching scores
        match = FusionScoringEngine.match_resume_to_job(
            resume_analysis=c["resume_analysis"],
            job_analysis=job.structured_analysis,
            raw_resume_text=c["resume_text"],
            raw_job_text=job.description_text
        )
        
        CandidateRanking.objects.create(
            job=job,
            resume=resume,
            overall_score=match.get('overall_score', 0.0),
            semantic_score=match.get('semantic_score', 0.0),
            trajectory_score=match.get('trajectory_score', 0.0),
            trust_score=match.get('trust_score', 0.0),
            experience_score=match.get('experience_score', 0.0),
            score_breakdown=match.get('score_breakdown', {}),
            india_context_adjustments=match.get('india_context_adjustments', {}),
            ranking_explanation=match.get('ranking_explanation', ''),
            missing_skills=match.get('missing_skills', [])
        )
        print(f"Created candidate {c['full_name']} with overall score {match.get('overall_score')}%")
        
    print("Seed complete.")

if __name__ == "__main__":
    seed()
