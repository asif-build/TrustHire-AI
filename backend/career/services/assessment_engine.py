import re
from django.db.models import Q
from django.utils import timezone
from ..models import (
    SkillAssessment, AssessmentAttempt, CareerProfile,
    CareerRoadmap, RoadmapTask, JobMatch, JobPosting
)
from .matching_engine import evaluate_job_match

class AssessmentEngine:
    """
    Evaluates candidate competence across multiple assessment formats:
      1. Concept quizzes (multiple choice / conceptual definitions)
      2. Code implementation challenges (syntax, logic, output expectations)
      3. SQL challenges (clauses, joins, aggregations, schema design)
      4. Architecture & scenario reviews (trade-offs, scalability, design)

    Adheres to transparent, evidence-based evaluation rubrics.
    When passed, promotes the verified skill into CareerProfile and active roadmaps.
    """

    @classmethod
    def evaluate_attempt(cls, user, assessment: SkillAssessment, candidate_answers: dict) -> AssessmentAttempt:
        questions = assessment.questions or []
        if not questions:
            attempt = AssessmentAttempt.objects.create(
                user=user,
                assessment=assessment,
                answers=candidate_answers,
                score=100.0,
                passed=True,
                feedback={'summary': 'Assessment has no evaluated items; auto-marked complete.'}
            )
            return attempt

        total_questions = len(questions)
        correct_count = 0
        question_feedbacks = []

        for idx, q in enumerate(questions):
            q_id = str(q.get('id', idx))
            user_ans = candidate_answers.get(q_id)
            correct_ans = q.get('correct_answer')
            correct_idx = q.get('correct_option_index')
            q_type = q.get('type', 'multiple_choice')
            explanation = q.get('explanation', '')

            is_correct = False
            item_feedback = {
                'question_id': q_id,
                'prompt': q.get('prompt', ''),
                'explanation': explanation
            }

            if q_type == 'multiple_choice':
                # Check option index or text
                if correct_idx is not None and user_ans is not None:
                    try:
                        is_correct = int(user_ans) == int(correct_idx)
                    except (ValueError, TypeError):
                        is_correct = str(user_ans).strip().lower() == str(correct_ans).strip().lower()
                elif correct_ans:
                    is_correct = str(user_ans).strip().lower() == str(correct_ans).strip().lower()

            elif q_type in ('code_challenge', 'sql_challenge'):
                # Rubric & pattern checks
                user_str = str(user_ans or '').strip().lower()
                expected_keywords = q.get('required_keywords', [])
                forbidden_patterns = q.get('forbidden_patterns', [])

                keyword_matches = sum(1 for kw in expected_keywords if kw.lower() in user_str)
                min_keywords = q.get('min_keywords', len(expected_keywords))

                has_forbidden = any(fp.lower() in user_str for fp in forbidden_patterns)
                regex_pattern = q.get('regex_check')

                regex_passed = True
                if regex_pattern:
                    regex_passed = bool(re.search(regex_pattern, user_str, re.IGNORECASE))

                if keyword_matches >= min_keywords and not has_forbidden and regex_passed:
                    is_correct = True

            elif q_type == 'scenario':
                user_str = str(user_ans or '').strip().lower()
                expected_concepts = q.get('key_concepts', [])
                concept_matches = sum(1 for c in expected_concepts if c.lower() in user_str)
                is_correct = concept_matches >= max(1, len(expected_concepts) // 2)

            if is_correct:
                correct_count += 1
                item_feedback['status'] = 'correct'
                item_feedback['message'] = 'Correctly answered.'
            else:
                item_feedback['status'] = 'incorrect'
                item_feedback['message'] = f"Needs review. {explanation}"

            question_feedbacks.append(item_feedback)

        score = round((correct_count / total_questions) * 100.0, 1)
        passed = score >= assessment.passing_score

        feedback_summary = {
            'total_questions': total_questions,
            'correct_count': correct_count,
            'score_percentage': score,
            'passing_score': assessment.passing_score,
            'passed': passed,
            'question_feedbacks': question_feedbacks,
            'summary': (
                f"You achieved {score:.1f}% ({correct_count}/{total_questions} correct). "
                f"{'Congratulations! You have verified this competence.' if passed else 'You did not meet the passing threshold. Review the recommended learning resources and re-attempt.'}"
            )
        }

        attempt = AssessmentAttempt.objects.create(
            user=user,
            assessment=assessment,
            answers=candidate_answers,
            score=score,
            passed=passed,
            feedback=feedback_summary
        )

        if passed:
            cls.on_assessment_passed(user, assessment, attempt)

        return attempt

    @classmethod
    def on_assessment_passed(cls, user, assessment: SkillAssessment, attempt: AssessmentAttempt):
        """
        Promotes skill into verified status across CareerProfile, CareerRoadmaps, and JobMatches.
        """
        skill_name = assessment.skill_name
        profile, _ = CareerProfile.objects.get_or_create(user=user)

        # Update profile skills
        existing_skills = profile.skills or []
        updated_skills = []
        found = False

        for s in existing_skills:
            if isinstance(s, dict):
                if s.get('name', '').lower() == skill_name.lower():
                    s['verification_tier'] = 'assessment_supported'
                    s['verified_at'] = timezone.now().isoformat()
                    s['assessment_title'] = assessment.title
                    s['assessment_score'] = attempt.score
                    found = True
                updated_skills.append(s)
            elif isinstance(s, str):
                if s.lower() == skill_name.lower():
                    updated_skills.append({
                        'name': s,
                        'verification_tier': 'assessment_supported',
                        'verified_at': timezone.now().isoformat(),
                        'assessment_title': assessment.title,
                        'assessment_score': attempt.score
                    })
                    found = True
                else:
                    updated_skills.append(s)

        if not found:
            updated_skills.append({
                'name': skill_name,
                'verification_tier': 'assessment_supported',
                'verified_at': timezone.now().isoformat(),
                'assessment_title': assessment.title,
                'assessment_score': attempt.score
            })

        profile.skills = updated_skills
        profile.save()

        # Update matching active roadmap tasks
        active_roadmaps = CareerRoadmap.objects.filter(user=user, status='active')
        for roadmap in active_roadmaps:
            matching_tasks = RoadmapTask.objects.filter(
                phase__roadmap=roadmap,
                status__in=['todo', 'in_progress']
            ).filter(
                Q(related_requirement__icontains=skill_name) |
                Q(title__icontains=skill_name)
            )
            for task in matching_tasks:
                task.status = 'completed'
                task.completed_at = timezone.now()
                task.user_evidence = f"Passed verified assessment: {assessment.title} ({attempt.score:.1f}%)"
                task.save()

            # Recalculate roadmap readiness score
            total_tasks = RoadmapTask.objects.filter(phase__roadmap=roadmap).count()
            completed_tasks = RoadmapTask.objects.filter(phase__roadmap=roadmap, status='completed').count()
            if total_tasks > 0:
                roadmap.readiness_score = round((completed_tasks / total_tasks) * 100.0, 1)
                roadmap.save()
