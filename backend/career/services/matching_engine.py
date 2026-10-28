import re
from django.utils import timezone
from .ai_adapter import AIAdapter

def evaluate_job_match(profile_data, resume_text, job_posting):
    """
    Evaluates alignment between a candidate's profile/resume and a job posting.
    Separates deterministic qualification checks from narrative explanations.
    Distinguishes:
      1. Declared skills (user-listed in profile)
      2. Evidenced skills (proven by explicit resume bullet points or project details)
      3. Verified skills (linked to verified GitHub repos or formal certifications)
    Adheres strictly to respectful, evidence-based language:
      - Does NOT state a candidate lacks a skill, but rather that the current resume does not demonstrate it.
      - Provides actionable recommendations for strengthening application.
    """
    req_skills = job_posting.required_skills or []
    pref_skills = job_posting.preferred_skills or []
    all_job_skills = req_skills + pref_skills
    if not all_job_skills:
        # Fallback to description scan if skills list is empty
        from .job_sources import extract_skills_from_text
        all_job_skills = extract_skills_from_text(f"{job_posting.title} {job_posting.description}")
        req_skills = all_job_skills[:6]
        pref_skills = all_job_skills[6:12]

    # Candidate skill pools
    declared_skills = set(profile_data.get('skills', []))
    certifications = profile_data.get('certifications', [])
    projects = profile_data.get('projects', [])
    work_exp = profile_data.get('work_experience', [])

    # Text pool for evidence scanning
    corpus = (resume_text or '').lower()
    for exp in work_exp:
        if isinstance(exp, dict):
            corpus += " " + " ".join(exp.get('bullets', [])) + " " + exp.get('description', '')
    for proj in projects:
        if isinstance(proj, dict):
            corpus += " " + proj.get('description', '') + " " + proj.get('name', '')

    matched_requirements = []
    partially_matched = []
    missing_requirements = []

    evidenced_skills = set()
    verified_skills = set()

    # Check verified signals from certifications and projects with URLs
    for cert in certifications:
        cert_name = cert.get('name', '') if isinstance(cert, dict) else str(cert)
        for s in all_job_skills:
            if s.lower() in cert_name.lower():
                verified_skills.add(s)

    for proj in projects:
        if isinstance(proj, dict) and (proj.get('github_url') or proj.get('url')):
            p_techs = proj.get('technologies', [])
            for t in p_techs:
                verified_skills.add(t)

    # Evaluate each required skill
    for skill in req_skills:
        skill_lower = skill.lower()
        is_declared = skill in declared_skills or any(skill_lower == d.lower() for d in declared_skills)

        # Scan corpus for explicit citation
        pattern = r'([^.\n]*?\b' + re.escape(skill_lower) + r'\b[^.\n]*)'
        citation_match = re.search(pattern, corpus)
        has_evidence = bool(citation_match)
        is_verified = skill in verified_skills

        if has_evidence:
            evidenced_skills.add(skill)
            raw_citation = citation_match.group(0).strip()
            if len(raw_citation) > 160:
                raw_citation = raw_citation[:160] + '...'
            matched_requirements.append({
                'skill': skill,
                'importance': 'Required',
                'status': 'Evidenced in Past Work',
                'citation': f"Found in work artifacts: \"{raw_citation}\"",
                'is_verified': is_verified
            })
        elif is_declared:
            partially_matched.append({
                'skill': skill,
                'importance': 'Required',
                'status': 'Self-Declared in Profile',
                'citation': 'Candidate lists proficiency on profile; direct repository or bullet-point evidence not found in current resume.',
                'is_verified': is_verified
            })
        else:
            missing_requirements.append({
                'skill': skill,
                'importance': 'Required',
                'status': 'Not Demonstrated in Resume',
                'recommendation': f"Your current resume does not demonstrate {skill}. Adding a project milestone, assessment, or past application example can strengthen your candidacy."
            })

    # Evaluate preferred skills
    for skill in pref_skills:
        skill_lower = skill.lower()
        is_declared = skill in declared_skills or any(skill_lower == d.lower() for d in declared_skills)
        pattern = r'([^.\n]*?\b' + re.escape(skill_lower) + r'\b[^.\n]*)'
        citation_match = re.search(pattern, corpus)
        has_evidence = bool(citation_match)

        if has_evidence:
            evidenced_skills.add(skill)
            matched_requirements.append({
                'skill': skill,
                'importance': 'Preferred',
                'status': 'Evidenced in Past Work',
                'citation': f"Demonstrated in background: \"{citation_match.group(0).strip()[:140]}\"",
                'is_verified': skill in verified_skills
            })
        elif is_declared:
            partially_matched.append({
                'skill': skill,
                'importance': 'Preferred',
                'status': 'Self-Declared in Profile',
                'citation': 'Candidate lists proficiency; recommended for technical discussion.',
                'is_verified': False
            })
        else:
            missing_requirements.append({
                'skill': skill,
                'importance': 'Preferred',
                'status': 'Not Demonstrated in Resume',
                'recommendation': f"Not currently demonstrated in resume. Building hands-on experience with {skill} would provide an extra competitive edge."
            })

    # Constraints analysis (Location & Workplace Type)
    cand_workplace = profile_data.get('workplace_preference', 'any')
    job_loc = job_posting.location or 'Flexible / Unspecified'
    job_workplace = job_posting.workplace_type or 'unspecified'

    loc_compatible = True
    constraints_notes = []

    if job_workplace == 'remote':
        constraints_notes.append("Workplace alignment: Job is 100% remote.")
    elif cand_workplace != 'any' and job_workplace != 'unspecified' and cand_workplace != job_workplace:
        loc_compatible = False
        constraints_notes.append(f"Workplace preference note: You prefer {cand_workplace.title()} while this role is listed as {job_workplace.title()}.")
    else:
        constraints_notes.append(f"Role location: {job_loc} ({job_workplace.title()}).")

    # Score calculation: deterministic, transparent formula
    total_req = len(req_skills) if req_skills else 1
    total_pref = len(pref_skills) if pref_skills else 1

    evidenced_req_count = len([m for m in matched_requirements if m['importance'] == 'Required'])
    partial_req_count = len([m for m in partially_matched if m['importance'] == 'Required'])
    evidenced_pref_count = len([m for m in matched_requirements if m['importance'] == 'Preferred'])

    req_score = ((evidenced_req_count * 1.0) + (partial_req_count * 0.5)) / total_req
    pref_score = (evidenced_pref_count * 1.0) / total_pref

    # 75% weight on core requirements, 25% on preferred skills
    composite_score = round(((req_score * 0.75) + (pref_score * 0.25)) * 100.0, 1)
    composite_score = max(10.0, min(98.0, composite_score))

    # Narrative generation (evidence-backed, respectful)
    relevant_skills_str = ", ".join(list(evidenced_skills)[:4]) if evidenced_skills else "general engineering principles"
    narrative = (
        f"Why this matches: Your background demonstrates {evidenced_req_count} of {total_req} core required technical competencies "
        f"({relevant_skills_str}). {len(partially_matched)} competencies are self-declared on your profile. "
    )
    if missing_requirements:
        missing_names = ", ".join([m['skill'] for m in missing_requirements[:3]])
        narrative += f"The vacancy also asks for competencies not currently demonstrated in your resume ({missing_names}). "
        narrative += f"Strengthening advice: Adding project milestones or relevant practice in {missing_names} can enhance your application. "
    else:
        narrative += "Your profile comprehensively covers all explicitly stated technical requirements. "
    narrative += "This score is an estimate of profile alignment, not an automated hiring probability or employer decision."

    return {
        'overall_score': composite_score,
        'matched_requirements': matched_requirements,
        'partially_matched_requirements': partially_matched,
        'missing_requirements': missing_requirements,
        'declared_skills': list(declared_skills),
        'evidenced_skills': list(evidenced_skills),
        'verified_skills': list(verified_skills),
        'explanation': narrative,
        'constraints_analysis': {
            'location_compatible': loc_compatible,
            'notes': constraints_notes
        },
        'methodology_version': 'TrustHire v2.0 Explainable Alignment Engine'
    }
