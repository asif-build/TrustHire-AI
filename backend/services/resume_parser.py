import re

def parse_resume(raw_text):
    """
    Parses resume text using mock heuristics to build a structured JSON structure.
    TODO: Replace mock parsing logic with actual LLM parser (e.g., Gemini API, LangChain).
    """
    # Simple regex heuristics to extract details dynamically if possible
    # (keeps mock developer mode interactive and realistic)
    skills_list = ["Python", "Django", "React", "TypeScript", "PostgreSQL", "AWS", "Docker", "Node.js", "GraphQL", "Java", "C++"]
    found_skills = [skill for skill in skills_list if re.search(r'\b' + re.escape(skill) + r'\b', raw_text, re.IGNORECASE)]
    if not found_skills:
        found_skills = ["Python", "Django", "React", "PostgreSQL"]

    # Mock projects
    projects = [
        {
            "name": "E-Commerce Microservices Platform",
            "description": "Built a scalable transaction processing system with Django and RabbitMQ.",
            "technologies": ["Python", "Django", "PostgreSQL", "RabbitMQ"]
        },
        {
            "name": "AI Search Engine",
            "description": "Developed vector embeddings semantic search using PgVector and Gemini.",
            "technologies": ["Python", "FastAPI", "PgVector", "Gemini"]
        }
    ]

    # Mock education
    education = [
        {
            "institution": "Indian Institute of Technology (IIT), Delhi",
            "degree": "B.Tech in Computer Science",
            "year": "2022"
        }
    ]

    # Mock certifications
    certifications = ["AWS Certified Solutions Architect", "TensorFlow Developer Certificate"]

    # Mock employment history
    employment_history = [
        {
            "company": "TechInnovate India",
            "role": "Software Engineer",
            "duration": "2 years",
            "description": "Developed serverless APIs and configured database replication models."
        }
    ]

    # Mock career timeline
    career_timeline = [
        {"year": 2020, "event": "Started B.Tech CSE"},
        {"year": 2022, "event": "Joined TechInnovate India as SWE"},
        {"year": 2024, "event": "Promoted to Senior SWE"}
    ]

    parsed_json = {
        "candidate_name": "Aditya Sharma",
        "email": "aditya.sharma@example.com",
        "skills": found_skills,
        "projects": projects,
        "education": education,
        "certifications": certifications,
        "employment_history": employment_history,
        "career_timeline": career_timeline
    }

    return {
        "extracted_text": raw_text or "Sample resume text content.",
        "skills": found_skills,
        "projects": projects,
        "certifications": certifications,
        "education": education,
        "employment_history": employment_history,
        "career_timeline": career_timeline,
        "parsed_json": parsed_json
    }
