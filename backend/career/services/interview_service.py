import uuid
from .ai_adapter import AIAdapter

class InterviewPrepService:
    """
    Generates grounded interview preparation questions across 4 distinct categories:
    1. Technical questions
    2. Role-specific architectural / system design questions
    3. Behavioral questions (STAR format)
    4. Project-based deep-dive questions
    Provides constructive rubric-based feedback on candidate responses.
    """

    @classmethod
    def generate_questions(cls, candidate_profile, job_posting):
        target_role = job_posting.title
        target_company = job_posting.company_name
        req_skills = job_posting.required_skills or ['Software Engineering', 'System Design']
        primary_skill = req_skills[0] if req_skills else 'Distributed Systems'
        secondary_skill = req_skills[1] if len(req_skills) > 1 else 'API Design'

        cand_project = (
            candidate_profile.projects[0].get('name')
            if candidate_profile.projects
            else "your recent technical project"
        )

        def deterministic_questions():
            return [
                {
                    'id': str(uuid.uuid4())[:8],
                    'category': 'Technical Depth',
                    'question': f"How would you architect a production service in {primary_skill} that handles concurrent traffic spikes and manages state gracefully?",
                    'context': f"Directly tests {primary_skill}, which is a core requirement for {target_role} at {target_company}.",
                    'suggested_structure': "1. Architectural overview -> 2. Concurrency model -> 3. Error handling & resilience -> 4. Performance telemetry.",
                    'sample_points': [
                        "Mention thread pooling or asynchronous event loops",
                        "Discuss cache invalidation strategies (Redis / Memcached)",
                        "Explain database connection pooling and backpressure handling"
                    ]
                },
                {
                    'id': str(uuid.uuid4())[:8],
                    'category': 'Role-Specific & System Design',
                    'question': f"Walk us through how you would design an API integrating {secondary_skill} ensuring low latency, idempotency, and backward compatibility.",
                    'context': f"Evaluates production API craftsmanship and systems maturity for {target_company}.",
                    'suggested_structure': "1. API contract & schema -> 2. Data flow & indexing -> 3. Edge-case handling -> 4. Monitoring & alerts.",
                    'sample_points': [
                        "Idempotency keys for non-GET mutating endpoints",
                        "Schema versioning best practices",
                        "Rate limiting and graceful degradation strategies"
                    ]
                },
                {
                    'id': str(uuid.uuid4())[:8],
                    'category': 'Project-Based Deep Dive',
                    'question': f"In '{cand_project}', what was the single hardest technical bottleneck you encountered, and what trade-offs did you make to resolve it?",
                    'context': f"Grounded directly in your documented project history.",
                    'suggested_structure': "Situation & Bottleneck -> Concrete Technical Options Evaluated -> Trade-offs Selected -> Measurable Outcome.",
                    'sample_points': [
                        "Quantify before vs. after latency or throughput",
                        "Explain why alternative frameworks/libraries were rejected",
                        "Acknowledge technical debt and how you mitigated it"
                    ]
                },
                {
                    'id': str(uuid.uuid4())[:8],
                    'category': 'Behavioral (STAR Method)',
                    'question': "Describe a time when you strongly disagreed with an engineering or product decision. How did you advocate for your viewpoint while keeping team velocity high?",
                    'context': f"Assesses cross-functional collaboration and constructive technical alignment at {target_company}.",
                    'suggested_structure': "Situation -> Task & Disagreement -> Action & Data Gathered -> Collaborative Resolution.",
                    'sample_points': [
                        "Focus on using benchmarks, telemetry, or user impact data rather than opinion",
                        "Demonstrate respect for alternative architectural viewpoints",
                        "Highlight 'disagree and commit' maturity once a decision was made"
                    ]
                }
            ]

        prompt = f"""
Generate 4 grounded interview prep questions for the candidate targeting this position.
Job: {target_role} at {target_company}
Requirements: {req_skills}
Candidate Projects: {candidate_profile.projects}
Return JSON with an array "questions", each having:
"id", "category", "question", "context", "suggested_structure", "sample_points".
"""
        ai_res = AIAdapter.generate_json(prompt, fallback_fn=deterministic_questions)
        data = ai_res.get('data') or deterministic_questions()
        if isinstance(data, dict) and 'questions' in data:
            return data['questions']
        elif isinstance(data, list):
            return data
        return deterministic_questions()

    @classmethod
    def evaluate_answer(cls, question, user_answer):
        """
        Provides constructive, rubric-based feedback on a candidate's practice response.
        """
        word_count = len(user_answer.strip().split())
        
        def deterministic_eval():
            if word_count < 25:
                score = 55
                strengths = "Good starting premise."
                improvements = "Answer is too brief. Provide concrete technical details, trade-offs, and quantify your outcomes."
            elif word_count < 80:
                score = 75
                strengths = "Clear, direct communication that addresses the core prompt."
                improvements = "Consider expanding on error handling, edge cases, or specific architectural trade-offs."
            else:
                score = 88
                strengths = "Strong depth, structured delivery, and solid coverage of technical trade-offs."
                improvements = "Great response. For live interviews, keep the opening summary punchy before diving into deep implementation details."

            return {
                'score': score,
                'strengths': strengths,
                'areas_for_improvement': improvements,
                'rubric': {
                    'structure_clarity': 'Strong' if word_count >= 50 else 'Needs Expansion',
                    'technical_depth': 'Detailed' if word_count >= 80 else 'Moderate',
                    'outcome_focus': 'Present' if word_count >= 60 else 'Limited'
                }
            }

        prompt = f"""
Evaluate this candidate's interview answer to the question:
Question: {question.get('question')}
Answer: {user_answer}

Return JSON with:
"score": integer 0-100,
"strengths": string,
"areas_for_improvement": string,
"rubric": {{ "structure_clarity": string, "technical_depth": string, "outcome_focus": string }}
"""
        ai_res = AIAdapter.generate_json(prompt, fallback_fn=deterministic_eval)
        return ai_res.get('data') or deterministic_eval()
