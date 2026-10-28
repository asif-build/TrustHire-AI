import json
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from companies.models import Company
from career.models import (
    CareerProfile, ResumeDocument, JobPosting, JobMatch,
    CareerRoadmap, RoadmapPhase, RoadmapTask, SkillAssessment,
    AssessmentAttempt, ProjectSubmission, JobApplication, JobApplicationClickLog
)

User = get_user_model()

class EndToEndCareerIntelligenceJourneyTest(TestCase):
    """
    Validates Section 17 Complete User Journey:
      1. Register and sign in candidate.
      2. Upload a resume.
      3. Review extracted skills.
      4. Confirm target role and preferences.
      5. Receive personalised job recommendations with explainable scores.
      6. Review skill gaps.
      7. Open a recommended skill assessment.
      8. Complete the assessment and verify skill promotion to 'assessment_supported'.
      9. Submit practical project evidence (GitHub repo) and verify 'project_supported'.
      10. Verify automated completion of active roadmap tasks.
      11. Discover active verified vacancies.
      12. Execute direct application click ('View job & apply ->').
      13. Verify click telemetry and application tracker creation.
      14. Return to Job-Readiness Experience Dashboard and verify persisted state.
    """

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='e2e_candidate@trusthire.io',
            password='SecurePassword123!',
            full_name='Vikram Sharma'
        )
        self.client.force_authenticate(user=self.user)

        # Seed verified test employer
        self.company = Company.objects.create(
            company_name='Razorpay Software Private Limited',
            slug='razorpay',
            website='https://razorpay.com',
            careers_url='https://razorpay.com/jobs',
            industry='Financial Technology',
            headquarters='Bangalore, Karnataka, India',
            is_startup=False
        )

        # Seed verified active job posting
        self.job = JobPosting.objects.create(
            company=self.company,
            company_name='Razorpay',
            external_id='rzp-se2-python-101',
            title='Senior Backend Engineer (Python & Distributed Systems)',
            description='Build high-throughput payment rails handling billions in transactions. Requirements: Python, SQL, Docker, Kafka, System Design.',
            location='Bangalore, India',
            workplace_type='hybrid',
            employment_type='Full-time',
            required_skills=['Python', 'SQL', 'Docker', 'System Design'],
            preferred_skills=['Kafka', 'FastAPI'],
            application_url='https://boards.greenhouse.io/razorpay/jobs/4829101',
            verification_status='verified_active'
        )

        # Seed skill assessment
        self.assessment = SkillAssessment.objects.create(
            title='Python Production Engineering',
            slug='python-production-engineering',
            skill_name='Python',
            assessment_type='quiz',
            difficulty='Intermediate',
            passing_score=70.0,
            questions=[
                {
                    'id': 'q1',
                    'prompt': 'Which Python protocol yields memory-efficient streaming for large datasets?',
                    'type': 'multiple_choice',
                    'options': ['List comprehension', 'Generator iterator protocol', 'Recursion'],
                    'correct_option_index': 1,
                    'explanation': 'Generators produce values lazily without memory buffering.'
                }
            ]
        )

    def test_complete_connected_career_intelligence_loop(self):
        # Step 1 & 2: User profile initialized & resume parsed
        profile, _ = CareerProfile.objects.get_or_create(user=self.user)
        resume_doc = ResumeDocument.objects.create(
            user=self.user,
            file_name='vikram_sharma_resume.pdf',
            file_type='pdf',
            file_size=204800,
            raw_text="Vikram Sharma. Software Engineer. Experienced in Python, Django, REST APIs, and PostgreSQL. Built scalable backend services.",
            extracted_data={
                'name': 'Vikram Sharma',
                'headline': 'Software Engineer | Python & Distributed Services',
                'skills': ['Python', 'Django', 'PostgreSQL', 'REST APIs'],
                'work_experience': [{'company': 'Tech Corp', 'role': 'Software Engineer'}]
            },
            parsing_status='parsed'
        )

        # Step 3 & 4: Review extracted skills & confirm target career
        confirm_payload = {
            'headline': 'Senior Backend Engineer | Payment Infrastructure',
            'summary': 'Passionate backend engineer specializing in high-concurrency payment services.',
            'skills': ['Python', 'Django', 'PostgreSQL', 'REST APIs'],
            'preferred_job_titles': ['Senior Backend Engineer', 'Backend Engineer'],
            'preferred_locations': ['Bangalore', 'Remote'],
            'workplace_preference': 'hybrid',
            'experience_level': 'senior'
        }
        res_confirm = self.client.post('/api/career/profile/confirm-extraction', confirm_payload, format='json')
        self.assertEqual(res_confirm.status_code, status.HTTP_200_OK)
        self.assertTrue(res_confirm.data['profile']['is_confirmed'])

        # Step 5: Receive personalized job recommendations
        res_matches = self.client.get('/api/career/matches')
        self.assertEqual(res_matches.status_code, status.HTTP_200_OK)

        # Step 6: Generate & inspect personalized career roadmap
        res_roadmap = self.client.post('/api/career/roadmaps/generate', {
            'target_role': 'Senior Backend Engineer',
            'target_company': 'Razorpay',
            'job_id': str(self.job.id)
        }, format='json')
        self.assertEqual(res_roadmap.status_code, status.HTTP_201_CREATED)
        roadmap_id = res_roadmap.data['roadmap']['id']
        roadmap = CareerRoadmap.objects.get(id=roadmap_id)
        self.assertIn('Senior Backend Engineer', roadmap.target_role)

        # Find Python task in roadmap
        py_task = RoadmapTask.objects.filter(phase__roadmap=roadmap, related_requirement__icontains='Python').first()
        self.assertIsNotNone(py_task)
        self.assertEqual(py_task.status, 'todo')

        # Step 7 & 8: Open and complete Skill Assessment for Python
        res_submit = self.client.post(f'/api/career/assessments/{self.assessment.slug}/submit', {
            'answers': {'q1': 1}
        }, format='json')
        self.assertEqual(res_submit.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_submit.data['passed'])
        self.assertEqual(res_submit.data['score'], 100.0)

        # Verify competence promotion: skill marked assessment_supported
        profile.refresh_from_db()
        py_skill = next((s for s in profile.skills if (s.get('name') if isinstance(s, dict) else s) == 'Python'), None)
        self.assertIsNotNone(py_skill)
        self.assertEqual(py_skill.get('verification_tier'), 'assessment_supported')

        # Verify roadmap task auto-completed
        py_task.refresh_from_db()
        self.assertEqual(py_task.status, 'completed')

        # Step 9: Submit practical project deliverable (e.g. GitHub repository)
        res_project = self.client.post('/api/career/projects/submissions', {
            'title': 'High-Throughput Payment Processing Microservice',
            'repository_url': 'https://github.com/vikramsharma/payment-gateway-engine',
            'live_demo_url': 'https://payments.vikramsharma.dev',
            'skills_demonstrated': ['Docker', 'System Design', 'PostgreSQL'],
            'deliverables_summary': 'Engineered idempotent payment processing pipeline with Redis locking and database connection pooling.'
        }, format='json')
        self.assertEqual(res_project.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_project.data['verification_status'], 'verified')

        # Step 10: Verify project-supported skills in profile
        profile.refresh_from_db()
        docker_skill = next((s for s in profile.skills if isinstance(s, dict) and s.get('name') == 'Docker'), None)
        self.assertIsNotNone(docker_skill)
        self.assertEqual(docker_skill.get('verification_tier'), 'project_supported')

        # Step 11 & 12: Direct application click telemetry ('View job & apply ->')
        res_apply = self.client.post(f'/api/career/jobs/{self.job.id}/apply-click', {
            'status': 'applied'
        }, format='json')
        self.assertEqual(res_apply.status_code, status.HTTP_200_OK)
        self.assertEqual(res_apply.data['application_url'], self.job.application_url)

        # Step 13: Verify application tracker
        self.assertTrue(JobApplicationClickLog.objects.filter(user=self.user, job=self.job).exists())
        app = JobApplication.objects.get(user=self.user, job=self.job)
        self.assertEqual(app.status, 'applied')
        self.assertEqual(app.company_name, 'Razorpay')

        # Step 14: Return to Job-Readiness Experience Dashboard
        res_overview = self.client.get('/api/career/overview')
        self.assertEqual(res_overview.status_code, status.HTTP_200_OK)
        overview_data = res_overview.data

        # Verify all 5 core questions answered
        self.assertEqual(overview_data['target']['primary_role'], 'Senior Backend Engineer')
        self.assertTrue(any(s['tier'] == 'assessment_supported' for s in overview_data['strengths']))
        self.assertTrue(any(s['tier'] == 'project_supported' for s in overview_data['strengths']))
        self.assertEqual(overview_data['assessments']['passed_count'], 1)
        self.assertEqual(overview_data['metrics']['submitted_projects'], 1)
        self.assertEqual(overview_data['metrics']['applications_tracked'], 1)
        self.assertIn('next_step', overview_data)
        self.assertIsNotNone(overview_data['next_step']['title'])
