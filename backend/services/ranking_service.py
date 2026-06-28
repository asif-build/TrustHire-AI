def calculate_ranking(resume_analysis, job_analysis):
    """
    Calculates candidate alignment rankings based on parsed resume and job analyses.
    TODO: Replace with actual semantic embedding similarity and LLM alignment scoring.
    """
    # 1. Skill alignment
    resume_skills = set(resume_analysis.get('skills', []))
    must_have_skills = set(job_analysis.get('must_have_skills', []))
    nice_to_have_skills = set(job_analysis.get('nice_to_have_skills', []))

    if must_have_skills:
        must_have_match = len(resume_skills.intersection(must_have_skills)) / len(must_have_skills)
    else:
        must_have_match = 1.0

    if nice_to_have_skills:
        nice_to_have_match = len(resume_skills.intersection(nice_to_have_skills)) / len(nice_to_have_skills)
    else:
        nice_to_have_match = 1.0

    skill_score = round((must_have_match * 0.7 + nice_to_have_match * 0.3) * 100, 1)

    # 2. Experience alignment
    candidate_exp = 3.0  # default
    if 'parsed_json' in resume_analysis:
        # try to get exp from user metadata or profile
        pass
    job_required_exp = job_analysis.get('experience_required', 3.0)
    
    if candidate_exp >= job_required_exp:
        experience_score = 100.0
    else:
        experience_score = round((candidate_exp / job_required_exp) * 100, 1)

    # Mock semantic, trajectory, and trust scores
    semantic_score = round(skill_score * 0.95, 1)
    trajectory_score = 85.0
    trust_score = 90.0

    # Calculate overall weighted average score
    overall_score = round(
        (semantic_score * 0.35) + 
        (skill_score * 0.25) + 
        (experience_score * 0.15) + 
        (trajectory_score * 0.15) + 
        (trust_score * 0.10), 1
    )

    # Generate explainable match summary
    matched_skills = list(resume_skills.intersection(must_have_skills))
    missing_skills = list(must_have_skills.difference(resume_skills))
    
    explanation = (
        f"Candidate satisfies {len(matched_skills)}/{len(must_have_skills)} must-have skills ({', '.join(matched_skills) if matched_skills else 'none'}). "
        f"Missing: {', '.join(missing_skills) if missing_skills else 'none'}. "
        f"Experience alignment is at {experience_score}% relative to the target requirements."
    )

    return {
        "semantic_score": semantic_score,
        "skill_score": skill_score,
        "experience_score": experience_score,
        "trajectory_score": trajectory_score,
        "trust_score": trust_score,
        "overall_score": overall_score,
        "explanation": explanation,
        "missing_skills": missing_skills
    }
