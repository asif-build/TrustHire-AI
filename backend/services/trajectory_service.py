def calculate_trajectory(resume_analysis):
    """
    Calculates candidate career trajectory vectors and velocity metrics.
    TODO: Integrate graph neural networks or semantic career progression APIs.
    """
    timeline = resume_analysis.get('career_timeline', [])
    employment_history = resume_analysis.get('employment_history', [])
    
    # Heuristics for speed of career progression:
    # Look for title changes or promotions in descriptions
    promotions = 0
    for job in employment_history:
        desc = job.get('description', '').lower()
        role = job.get('role', '').lower()
        if any(keyword in desc or keyword in role for keyword in ["promote", "senior", "lead", "principal", "manager"]):
            promotions += 1

    # Base velocity score
    velocity = 75.0 + (promotions * 7.5)
    velocity = min(velocity, 100.0)

    # Progression risk indicator: average job duration
    avg_duration_years = 2.0  # mock default
    
    return {
        "velocity_score": round(velocity, 1),
        "promotions_detected": promotions,
        "average_job_tenure_years": avg_duration_years,
        "direction": "Upward" if velocity >= 80 else "Stable",
        "trajectory_summary": f"Strong upward path with {promotions} key growth indicator(s) identified in job history."
    }
