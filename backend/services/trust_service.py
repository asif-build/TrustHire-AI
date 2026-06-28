def calculate_trust_score(candidate_profile, resume_analysis):
    """
    Calculates a verification Trust Score for the candidate based on profile completeness,
    github availability, LinkedIn presence, and education institution tier rankings (e.g. IIT/NIT).
    TODO: Add real social integration check APIs.
    """
    base_trust = 70.0  # Base trust score

    # Heuristic adjustments:
    # 1. Profile completeness
    profile_completion = getattr(candidate_profile, 'profile_completion', 50)
    base_trust += (profile_completion - 50) * 0.2

    # 2. Social URLs
    github_url = getattr(candidate_profile, 'github_url', '')
    linkedin_url = getattr(candidate_profile, 'linkedin_url', '')
    
    if github_url:
        base_trust += 10.0
    if linkedin_url:
        base_trust += 8.0

    # 3. India Tier College calibration
    education = resume_analysis.get('education', [])
    has_tier_1 = False
    for edu in education:
        inst = edu.get('institution', '').lower()
        if any(tier in inst for tier in ["iit", "nit", "iiit", "bits", "indian institute of technology", "national institute of technology"]):
            has_tier_1 = True
            break
            
    if has_tier_1:
        base_trust += 10.0
    else:
        base_trust += 5.0

    # Limit score between 0 and 100
    trust_score = min(max(base_trust, 0.0), 100.0)
    trust_score = round(trust_score, 1)

    return {
        "trust_score": trust_score,
        "github_verified": bool(github_url),
        "linkedin_verified": bool(linkedin_url),
        "tier_1_institution": has_tier_1,
        "profile_score": profile_completion
    }
