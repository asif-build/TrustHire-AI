import re

def parse_job(job_text):
    """
    Parses job descriptions using mock heuristics.
    TODO: Replace mock parsing logic with actual LLM parser.
    """
    # Simple heuristics to find common skills in the JD
    common_skills = ["Python", "Django", "React", "TypeScript", "PostgreSQL", "AWS", "Docker", "Kubernetes", "Redis", "Java", "Go"]
    must_have = [skill for skill in common_skills if re.search(r'\b' + re.escape(skill) + r'\b', job_text, re.IGNORECASE)]
    
    # Fallbacks if JD doesn't match
    if not must_have:
        must_have = ["Python", "Django"]
        nice_to_have = ["React", "AWS"]
    else:
        nice_to_have = [s for s in common_skills if s not in must_have][:3]

    # Heuristics for experience required
    exp_match = re.search(r'(\d+)\+?\s*(years?|yrs?)', job_text, re.IGNORECASE)
    experience_required = float(exp_match.group(1)) if exp_match else 3.0

    # Heuristics for domain
    domain = "Web Development"
    if any(kw in job_text.lower() for kw in ["cloud", "devops", "aws", "docker"]):
        domain = "Cloud Infrastructure"
    elif any(kw in job_text.lower() for kw in ["ai", "ml", "nlp", "model", "llm"]):
        domain = "Artificial Intelligence"

    parsed_json = {
        "must_have_skills": must_have,
        "nice_to_have_skills": nice_to_have,
        "soft_skills": ["Problem Solving", "Communication", "Team Collaboration"],
        "experience_required": experience_required,
        "seniority": "Senior" if experience_required >= 5 else "Mid-level",
        "domain": domain
    }

    return {
        "must_have_skills": must_have,
        "nice_to_have_skills": nice_to_have,
        "soft_skills": ["Problem Solving", "Communication", "Team Collaboration"],
        "experience_required": experience_required,
        "seniority": parsed_json["seniority"],
        "domain": domain,
        "parsed_json": parsed_json
    }
