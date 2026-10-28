import io

import zipfile

import uuid

from django.test import TestCase

from django.contrib.auth import get_user_model

from rest_framework.test import APIClient

from rest_framework import status



from .models import (

    CareerProfile, ResumeDocument, JobSource, JobPosting,

    JobMatch, TailoredDocument, InterviewSession, JobApplication

)

from .services.job_sources import GreenhouseConnector, LeverConnector, extract_skills_from_text, detect_workplace_type

from .services.resume_extractor import parse_structured_resume_data, extract_text_from_pdf

from .services.matching_engine import evaluate_job_match

from .services.studio_service import ApplicationStudioService

from .services.interview_service import InterviewPrepService

from .services.ai_adapter import AIAdapter



User = get_user_model()



class JobSourceNormalisationTest(TestCase):

    def test_skills_extraction(self):

        text = "Looking for a Senior Python Developer with experience in Django, React, PostgreSQL, and Docker."

        skills = extract_skills_from_text(text)

        self.assertIn("Python", skills)

        self.assertIn("Django", skills)

        self.assertIn("React", skills)

        self.assertIn("PostgreSQL", skills)

        self.assertIn("Docker", skills)

        self.assertNotIn("Rust", skills)



    def test_workplace_type_detection(self):

        self.assertEqual(detect_workplace_type("Backend Engineer - Remote", "San Francisco, CA", ""), "remote")

        self.assertEqual(detect_workplace_type("Staff Frontend", "New York (Hybrid)", ""), "hybrid")

        self.assertEqual(detect_workplace_type("DevOps Engineer", "Bangalore (On-site)", ""), "onsite")



    def test_greenhouse_error_handling_nonexistent_board(self):

        result = GreenhouseConnector.sync_board("definitely-nonexistent-board-12345", limit=5)

        self.assertFalse(result['success'])

        self.assertEqual(result['jobs_synced'], 0)

        self.assertTrue(len(result['error']) > 0)



    def test_lever_error_handling_nonexistent_company(self):

        result = LeverConnector.sync_company("definitely-nonexistent-co-998877", limit=5)

        self.assertFalse(result['success'])

        self.assertEqual(result['jobs_synced'], 0)

        self.assertTrue(len(result['error']) > 0)





class ResumeExtractionTest(TestCase):

    def test_structured_resume_parsing(self):

        sample_resume = """

Aditya Sharma

aditya.sharma@example.com | (555) 123-4567



WORK EXPERIENCE

TechInnovate Solutions — Senior Software Engineer (2022 - Present)

• Architected real-time analytics microservice in Python and Django serving 20k users.

• Built interactive client dashboards in React and TypeScript with TanStack Query.

• Configured automated CI/CD deployment pipelines on AWS and Docker.



PROJECTS

E-Commerce Engine

Built scalable transaction processing engine using Python, PostgreSQL, and Redis.



EDUCATION

Indian Institute of Technology (IIT), Delhi — B.Tech in Computer Science (2022)

"""

        extracted = parse_structured_resume_data(sample_resume)

        self.assertEqual(extracted['candidate_name'], 'Aditya Sharma')

        self.assertEqual(extracted['email'], 'aditya.sharma@example.com')

        self.assertIn('Python', extracted['skills'])

        self.assertIn('Django', extracted['skills'])

        self.assertIn('React', extracted['skills'])

        self.assertIn('PostgreSQL', extracted['skills'])

        self.assertTrue(len(extracted['work_experience']) > 0)

        self.assertTrue(len(extracted['education']) > 0)





class ExplainableMatchingEngineTest(TestCase):

    def setUp(self):

        self.job = JobPosting.objects.create(

            source_name='trusthire_benchmark',

            external_id='test-job-001',

            company_name='Apex Intelligence',

            title='Senior Full-Stack Engineer',

            description='We need React, TypeScript, Python, and Docker.',

            location='Remote',

            workplace_type='remote',

            required_skills=['React', 'TypeScript', 'Python'],

            preferred_skills=['Docker', 'Kubernetes'],

            application_url='https://example.com/apply'

        )



    def test_matching_evidence_segregation(self):

        profile_data = {

            'skills': ['React', 'TypeScript', 'Python', 'Docker'],

            'education': [{'institution': 'Test University', 'degree': 'B.S. CS'}],

            'work_experience': [{

                'company': 'TechCorp',

                'bullets': ['Developed scalable frontend applications with React and TypeScript.']

            }],

            'projects': [{

                'name': 'API Gateway',

                'description': 'Engineered Python REST endpoints containerized in Docker.',

                'technologies': ['Python', 'Docker']

            }],

            'certifications': [],

            'preferred_locations': ['Remote'],

            'workplace_preference': 'remote'

        }

        resume_text = "Experienced in React, TypeScript, Python, and Docker."



        match = evaluate_job_match(profile_data, resume_text, self.job)

        self.assertGreaterEqual(match['overall_score'], 70.0)

        self.assertTrue(len(match['matched_requirements']) > 0)

        

        # Verify that React has a cited snippet

        react_match = next((m for m in match['matched_requirements'] if m['skill'] == 'React'), None)

        self.assertIsNotNone(react_match)

        self.assertIn('work artifacts', react_match['citation'].lower())

        

        # Verify missing preferred requirement

        missing_skills = [m['skill'] for m in match['missing_requirements']]

        self.assertIn('Kubernetes', missing_skills)





class ApplicationStudioTest(TestCase):

    def setUp(self):

        self.user = User.objects.create_user(

            email='studio.test@example.com',

            password='Password123!',

            full_name='Maya Vance',

            role='candidate'

        )

        self.profile = CareerProfile.objects.create(

            user=self.user,

            headline='Full-Stack Engineer',

            skills=['React', 'Python', 'Django', 'PostgreSQL'],

            education=[{'institution': 'State Univ', 'degree': 'B.S. CS', 'year': '2023'}],

            work_experience=[{'role_or_company': 'Innovate Inc', 'bullets': ['Developed React dashboards.']}],

            projects=[{'name': 'DocSearch', 'technologies': ['Python', 'PostgreSQL'], 'description': 'Search engine'}]

        )

        self.job = JobPosting.objects.create(

            source_name='test',

            external_id='studio-job-1',

            company_name='CloudScale AI',

            title='Senior Frontend Engineer',

            description='Looking for React and TypeScript expertise.',

            required_skills=['React', 'TypeScript'],

            application_url='https://example.com'

        )



    def test_tailored_resume_generation_and_audit(self):

        result = ApplicationStudioService.generate_tailored_resume(self.profile, "React and Python experience", self.job)

        self.assertIn('Tailored Resume', result['title'])

        self.assertIn('Maya Vance', result['content'])

        self.assertIn('Innovate Inc', result['content'])

        self.assertTrue(len(result['unsupported_claims_review']) > 0)

        

        # Verify claims audit passed

        for check in result['unsupported_claims_review']:

            self.assertEqual(check['status'], 'PASSED')



    def test_tailored_cover_letter_generation(self):

        letter = ApplicationStudioService.generate_cover_letter(self.profile, "React and Python experience", self.job)

        self.assertIn('Cover Letter', letter['title'])

        self.assertIn('CloudScale AI', letter['content'])

        self.assertIn('Maya Vance', letter['content'])





class InterviewPrepServiceTest(TestCase):

    def setUp(self):

        self.user = User.objects.create_user(

            email='interview.test@example.com',

            password='Password123!',

            full_name='Alex Rivera',

            role='candidate'

        )

        self.profile = CareerProfile.objects.create(

            user=self.user,

            skills=['Go', 'Kubernetes', 'gRPC'],

            projects=[{'name': 'Distributed Cache', 'technologies': ['Go', 'gRPC']}]

        )

        self.job = JobPosting.objects.create(

            source_name='test',

            external_id='interview-job-1',

            company_name='Stripe',

            title='Infrastructure Engineer',

            description='High throughput Go services and Kubernetes orchestration.',

            required_skills=['Go', 'Kubernetes'],

            application_url='https://example.com'

        )



    def test_generates_4_distinct_question_categories(self):

        questions = InterviewPrepService.generate_questions(self.profile, self.job)

        self.assertEqual(len(questions), 4)

        categories = [q['category'] for q in questions]

        self.assertTrue(any('Technical' in c for c in categories))

        self.assertTrue(any('System Design' in c for c in categories))

        self.assertTrue(any('Project' in c for c in categories))

        self.assertTrue(any('Behavioral' in c for c in categories))



    def test_evaluates_candidate_answer_with_rubric(self):

        q = {'question': 'How do you handle concurrency in Go?'}

        ans = (

            "In Go, I use goroutines coordinated via channels for CSP style communication. "

            "For shared memory access, I utilize sync.RWMutex and atomic primitives to avoid race conditions. "

            "In high-load services, I bound goroutine spawning using worker pools to prevent memory exhaustion."

        )

        feedback = InterviewPrepService.evaluate_answer(q, ans)

        self.assertGreaterEqual(feedback['score'], 70)

        self.assertIn('rubric', feedback)





class CareerAPIPermissionsAndOwnershipTest(TestCase):

    def setUp(self):

        self.user_a = User.objects.create_user(

            email='user_a@example.com',

            password='Password123!',

            full_name='User Alpha',

            role='candidate'

        )

        self.user_b = User.objects.create_user(

            email='user_b@example.com',

            password='Password123!',

            full_name='User Beta',

            role='candidate'

        )

        self.client_a = APIClient()

        self.client_a.force_authenticate(user=self.user_a)



        self.client_b = APIClient()

        self.client_b.force_authenticate(user=self.user_b)



        self.job = JobPosting.objects.create(

            source_name='test',

            external_id='job-own-1',

            company_name='Test Company',

            title='Platform Engineer',

            description='Test description',

            required_skills=['Python'],

            application_url='https://example.com'

        )



    def test_unauthenticated_request_blocked(self):

        anon_client = APIClient()

        res = anon_client.get('/api/career/overview')

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)



    def test_user_ownership_profile_isolation(self):

        # User A updates profile

        res_a = self.client_a.put('/api/career/profile', {'headline': 'Alpha Staff Engineer'}, format='json')

        self.assertEqual(res_a.status_code, status.HTTP_200_OK)



        # User B reads their own profile

        res_b = self.client_b.get('/api/career/profile')

        self.assertEqual(res_b.status_code, status.HTTP_200_OK)

        # User B should NOT see User A's headline

        self.assertNotEqual(res_b.data.get('headline'), 'Alpha Staff Engineer')



    def test_application_tracker_crud_and_duplicate_prevention(self):

        # User A tracks application

        post_data = {

            'job_id': str(self.job.id),

            'status': 'preparing',

            'notes': 'Preparing resume and reviewing job requirements.'

        }

        res = self.client_a.post('/api/career/tracker/applications', post_data, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        app_id = res.data['id']



        # Prevent duplicate insertion

        res_dup = self.client_a.post('/api/career/tracker/applications', post_data, format='json')

        self.assertEqual(res_dup.status_code, status.HTTP_200_OK)

        self.assertIn('already tracked', res_dup.data['detail'])



        # User B cannot access User A's application

        res_b_get = self.client_b.get(f'/api/career/tracker/applications/{app_id}')

        self.assertEqual(res_b_get.status_code, status.HTTP_404_NOT_FOUND)



        # User A updates status

        update_res = self.client_a.put(f'/api/career/tracker/applications/{app_id}', {'status': 'applied'}, format='json')

        self.assertEqual(update_res.status_code, status.HTTP_200_OK)

        self.assertEqual(update_res.data['status'], 'applied')

        self.assertTrue(len(update_res.data['history']) >= 2)





class AIProviderContractTest(TestCase):

    def test_ai_adapter_status_reporting(self):

        status_info = AIAdapter.get_status()

        self.assertIn('provider', status_info)

        self.assertIn('configured', status_info)

        self.assertIn('model', status_info)

        # Explicit honesty: If GEMINI_API_KEY is not set, notice must describe deterministic fallback

        if not status_info['configured']:

            self.assertIsNotNone(status_info['notice'])

            self.assertIn('GEMINI_API_KEY', status_info['notice'])





class CompanyIntelligenceAndRoadmapTest(TestCase):

    def setUp(self):

        self.user_a = User.objects.create_user(

            email='alice.candidate@example.com',

            password='Password123!',

            full_name='Alice Candidate',

            role='candidate'

        )

        self.user_b = User.objects.create_user(

            email='bob.candidate@example.com',

            password='Password123!',

            full_name='Bob Candidate',

            role='candidate'

        )

        self.client_a = APIClient()

        self.client_a.force_authenticate(user=self.user_a)



        self.client_b = APIClient()

        self.client_b.force_authenticate(user=self.user_b)



        # Seed test company

        from companies.models import Company

        self.company = Company.objects.create(

            company_name='Cloudflare',

            canonical_name='Cloudflare, Inc.',

            website='https://www.cloudflare.com',

            careers_url='https://www.cloudflare.com/careers',

            industry='Software and cloud computing',

            description='Web infrastructure and security company providing CDN and DDoS protection.',

            headquarters='San Francisco, California, USA',

            job_source_type='greenhouse',

            job_source_token='cloudflare',

            verification_status='verified'

        )



        # Seed test job posting

        self.job = JobPosting.objects.create(

            company=self.company,

            company_name='Cloudflare',

            source_name='greenhouse',

            external_id='cf_12345',

            title='Systems Software Engineer',

            description='Build low-latency edge services using Rust, Go, Python, Linux, and Docker.',

            location='San Francisco, CA (Hybrid)',

            workplace_type='hybrid',

            employment_type='Full-time',

            experience_level='Mid',

            required_skills=['Python', 'Linux', 'Docker', 'Git'],

            preferred_skills=['Rust', 'Go'],

            application_url='https://boards.greenhouse.io/cloudflare/jobs/12345',

            verification_status='verified_active'

        )



    def test_company_directory_listing_and_filtering(self):

        # Public search without authentication

        anon_client = APIClient()

        res = anon_client.get('/api/companies/?search=Cloudflare')

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertTrue(res.data['count'] >= 1)

        self.assertEqual(res.data['companies'][0]['company_name'], 'Cloudflare')

        self.assertEqual(res.data['companies'][0]['verification_status'], 'verified')

        self.assertTrue(len(res.data['industries']) >= 1)



    def test_company_detail_by_slug(self):

        res = self.client_a.get(f'/api/companies/{self.company.slug}')

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertEqual(res.data['company_name'], 'Cloudflare')

        self.assertEqual(res.data['headquarters'], 'San Francisco, California, USA')

        self.assertFalse(res.data['is_saved'])



    def test_ashby_connector_error_handling(self):

        from .services.job_sources import AshbyConnector

        res = AshbyConnector.sync_board("definitely-nonexistent-board-998811", limit=5)

        self.assertFalse(res['success'])

        self.assertEqual(res['jobs_synced'], 0)

        self.assertTrue(len(res['error']) > 0)



    def test_roadmap_generation_and_phase_structure(self):

        from .services.roadmap_engine import RoadmapEngine

        from .models import CareerRoadmap, RoadmapPhase, RoadmapTask



        # Setup User A profile with some demonstrated skills

        profile, _ = CareerProfile.objects.get_or_create(user=self.user_a)

        profile.skills = ['Python', 'Git']

        profile.projects = [{'name': 'Web Scraper', 'tech': 'Python, Git, SQLite'}]

        profile.save()



        # Generate roadmap for Cloudflare Systems Engineer

        roadmap = RoadmapEngine.generate_roadmap(

            user=self.user_a,

            company_name='Cloudflare',

            target_role='Systems Software Engineer',

            job_id=str(self.job.id),

            hours_per_week=12

        )



        self.assertIsInstance(roadmap, CareerRoadmap)

        self.assertEqual(roadmap.user, self.user_a)

        self.assertEqual(roadmap.company_name, 'Cloudflare')

        self.assertTrue(0.0 <= roadmap.readiness_score <= 100.0)

        self.assertIn('explainable', roadmap.methodology_disclaimer.lower())



        # Verify exactly 6 phases created

        phases = roadmap.phases.all().order_by('phase_number')

        self.assertEqual(phases.count(), 6)

        self.assertIn('Phase 1', phases[0].title)

        self.assertIn('Phase 6', phases[5].title)



        # Verify tasks have learning resources & project recommendations attached

        total_tasks = RoadmapTask.objects.filter(phase__roadmap=roadmap)

        self.assertTrue(total_tasks.count() >= 8)



        # Check task progress API

        sample_task = total_tasks.first()

        patch_res = self.client_a.patch(

            f'/api/career/roadmaps/tasks/{sample_task.id}/progress',

            {'status': 'completed', 'user_evidence': 'Built working prototype in PR #42'},

            format='json'

        )

        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)

        sample_task.refresh_from_db()

        self.assertEqual(sample_task.status, 'completed')

        self.assertIsNotNone(sample_task.completed_at)

        self.assertEqual(sample_task.user_evidence, 'Built working prototype in PR #42')



        # Ownership security: User B cannot modify User A's task

        patch_b_res = self.client_b.patch(

            f'/api/career/roadmaps/tasks/{sample_task.id}/progress',

            {'status': 'todo'},

            format='json'

        )

        self.assertEqual(patch_b_res.status_code, status.HTTP_404_NOT_FOUND)



    def test_saved_job_and_company_toggle(self):

        # Save Job

        save_job_res = self.client_a.post(f'/api/career/jobs/{self.job.id}/save')

        self.assertEqual(save_job_res.status_code, status.HTTP_200_OK)

        self.assertTrue(save_job_res.data['is_saved'])



        # List saved jobs

        list_saved_res = self.client_a.get('/api/career/saved-jobs')

        self.assertEqual(list_saved_res.status_code, status.HTTP_200_OK)

        self.assertEqual(list_saved_res.data['count'], 1)



        # Toggle off

        unsave_job_res = self.client_a.post(f'/api/career/jobs/{self.job.id}/save')

        self.assertEqual(unsave_job_res.status_code, status.HTTP_200_OK)

        self.assertFalse(unsave_job_res.data['is_saved'])



        # Save Company

        save_comp_res = self.client_a.post(f'/api/companies/{self.company.slug}/save')

        self.assertEqual(save_comp_res.status_code, status.HTTP_200_OK)

        self.assertTrue(save_comp_res.data['is_saved'])



        # List saved companies

        list_comp_res = self.client_a.get('/api/career/saved-companies')

        self.assertEqual(list_comp_res.status_code, status.HTTP_200_OK)

        self.assertEqual(list_comp_res.data['count'], 1)





class LearningPlatformTest(TestCase):

    def setUp(self):

        self.client_a = APIClient()

        self.client_b = APIClient()

        self.user_a = User.objects.create_user(

            email='alice@example.com',

            password='TestPassword123!',

            terms_accepted=True

        )

        self.user_b = User.objects.create_user(

            email='bob@example.com',

            password='TestPassword123!',

            terms_accepted=True

        )

        self.client_a.force_authenticate(user=self.user_a)

        self.client_b.force_authenticate(user=self.user_b)



        from .models import LearningResource, LearningPath, LearningPathStep

        self.resource1 = LearningResource.objects.create(

            title="FastAPI Course for Testing",

            slug="fastapi-course-testing",

            description="Build APIs with FastAPI",

            provider="FreeCodeCamp",

            resource_type="video",

            external_url="https://www.youtube.com/watch?v=tLKKmouUAMS",

            youtube_video_id="tLKKmouUAMS",

            skills_covered=["FastAPI", "Python"],

            target_roles=["Backend Developer"],

            difficulty="Intermediate",

            estimated_duration="2 hours",

            duration_seconds=7200.0,

            pricing_classification="free",

            verification_status="verified_active"

        )

        self.resource2 = LearningResource.objects.create(

            title="Python Tutorial Testing",

            slug="python-tutorial-testing",

            description="Python documentation tutorial",

            provider="Python Software Foundation",

            resource_type="documentation",

            external_url="https://docs.python.org/3/tutorial/",

            skills_covered=["Python"],

            target_roles=["Backend Developer"],

            difficulty="Beginner",

            estimated_duration="1 hour",

            duration_seconds=3600.0,

            pricing_classification="free",

            verification_status="verified_active"

        )



        self.path = LearningPath.objects.create(

            title="Test Backend Path",

            slug="test-backend-path",

            description="A test path",

            target_role="Backend Developer",

            estimated_weeks=4

        )

        LearningPathStep.objects.create(

            path=self.path,

            resource=self.resource1,

            step_number=1,

            phase_category="fundamentals",

            order=1

        )

        LearningPathStep.objects.create(

            path=self.path,

            resource=self.resource2,

            step_number=2,

            phase_category="core_technical",

            order=2

        )



    def test_youtube_url_parsing(self):

        from .services.youtube import extract_youtube_info, is_valid_youtube_video_id

        # Standard watch

        vid, pl = extract_youtube_info("https://www.youtube.com/watch?v=bMknfKXIFA8")

        self.assertEqual(vid, "bMknfKXIFA8")

        self.assertIsNone(pl)

        self.assertTrue(is_valid_youtube_video_id(vid))



        # youtu.be shortlink

        vid2, _ = extract_youtube_info("https://youtu.be/jS4aFq5-91M")

        self.assertEqual(vid2, "jS4aFq5-91M")



        # embed

        vid3, _ = extract_youtube_info("https://www.youtube.com/embed/rfscVS0vtbw")

        self.assertEqual(vid3, "rfscVS0vtbw")



        # Invalid

        vid_bad, _ = extract_youtube_info("https://notyoutube.com/watch?v=fake")

        self.assertIsNone(vid_bad)



    def test_learning_hub_overview(self):

        res = self.client_a.get('/api/career/learning/hub')

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertIn('stats', res.data)

        self.assertIn('learning_paths', res.data)

        self.assertIn('youtube_lessons', res.data)

        self.assertIn('courses_and_certifications', res.data)



    def test_progress_tracking_and_resumption(self):

        # Alice starts watching at 1800s (25%)

        payload = {

            'resource_id': str(self.resource1.id),

            'position_seconds': 1800.0,

            'duration_seconds': 7200.0,

            'status': 'in_progress',

            'tracking_method': 'youtube_player_observed'

        }

        res = self.client_a.post('/api/career/learning/progress', payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertEqual(res.data['progress']['completion_status'], 'in_progress')

        self.assertEqual(res.data['progress']['current_position_seconds'], 1800.0)

        self.assertEqual(res.data['completion_percentage'], 25.0)



        # Retrieve resource: user_progress should be populated with exact saved position for resumption

        detail_res = self.client_a.get(f'/api/career/learning/resources/{self.resource1.id}')

        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)

        self.assertIsNotNone(detail_res.data['user_progress'])

        self.assertEqual(detail_res.data['user_progress']['current_position_seconds'], 1800.0)



        # Cross-user isolation: Bob should have NO user_progress for this resource

        bob_detail_res = self.client_b.get(f'/api/career/learning/resources/{self.resource1.id}')

        self.assertEqual(bob_detail_res.status_code, status.HTTP_200_OK)

        self.assertIsNone(bob_detail_res.data['user_progress'])



    def test_90_percent_completion_rule(self):

        # Alice watches to 6600s out of 7200s (91.6%)

        payload = {

            'resource_id': str(self.resource1.id),

            'position_seconds': 6600.0,

            'duration_seconds': 7200.0,

            'status': 'in_progress',

            'tracking_method': 'youtube_player_observed'

        }

        res = self.client_a.post('/api/career/learning/progress', payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertTrue(res.data['is_completed'])

        self.assertEqual(res.data['progress']['completion_status'], 'completed')

        self.assertIsNotNone(res.data['progress']['completed_at'])



    def test_manual_completion(self):

        payload = {

            'resource_id': str(self.resource2.id),

            'status': 'completed',

            'tracking_method': 'manual_self_report'

        }

        res = self.client_a.post('/api/career/learning/progress', payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertTrue(res.data['is_completed'])

        self.assertEqual(res.data['progress']['completion_status'], 'completed')

        self.assertEqual(res.data['progress']['completion_percentage'], 100.0)



    def test_learning_path_progress_calculation(self):

        # Complete step 1 (resource 1)

        self.client_a.post('/api/career/learning/progress', {

            'resource_id': str(self.resource1.id),

            'status': 'completed',

            'tracking_method': 'manual_self_report'

        }, format='json')



        # Check path progress: 1 of 2 completed => 50%

        path_res = self.client_a.get(f'/api/career/learning/paths/{self.path.slug}')

        self.assertEqual(path_res.status_code, status.HTTP_200_OK)

        self.assertEqual(path_res.data['total_steps'], 2)

        self.assertEqual(path_res.data['completed_steps'], 1)

        self.assertEqual(path_res.data['progress_percentage'], 50.0)



        # Bob's path progress should still be 0%

        bob_path_res = self.client_b.get(f'/api/career/learning/paths/{self.path.slug}')

        self.assertEqual(bob_path_res.status_code, status.HTTP_200_OK)

        self.assertEqual(bob_path_res.data['completed_steps'], 0)

        self.assertEqual(bob_path_res.data['progress_percentage'], 0.0)



    def test_save_and_click_logging(self):

        # Save resource

        save_res = self.client_a.post(f'/api/career/learning/resources/{self.resource1.id}/save')

        self.assertEqual(save_res.status_code, status.HTTP_200_OK)

        self.assertTrue(save_res.data['is_saved'])



        # Click resource

        click_res = self.client_a.post(f'/api/career/learning/resources/{self.resource1.id}/click')

        self.assertEqual(click_res.status_code, status.HTTP_200_OK)

        self.assertEqual(click_res.data['destination_url'], self.resource1.external_url)

        self.assertEqual(click_res.data['click_count'], 1)







# ===========================================================================

# PHASE 2-8 ADVANCED INTEGRATION & SECURITY TESTS

# ===========================================================================

from django.core.files.uploadedfile import SimpleUploadedFile

from companies.models import Company



def create_valid_pdf_bytes(content="Aditya Sharma\naditya@example.com\nSenior Software Engineer\nWork Experience\nTechCorp - Senior Engineer (2022 - Present)\nBuilt microservices in Python, Django, React, PostgreSQL scaled to 10k users.\nEducation\nIIT Delhi - B.Tech (2022)"):

    return (

        b"%PDF-1.4\n"

        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"

        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"

        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"

        b"4 0 obj << /Length " + str(len(content) + 30).encode() + b" >> stream\n"

        b"BT /F1 12 Tf 72 712 Td (" + content.replace('\n', ' ').encode('ascii', errors='ignore') + b") Tj ET\n"

        b"endstream endobj\n"

        b"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"

        b"xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000261 00000 n \n0000000366 00000 n \n"

        b"trailer << /Size 6 /Root 1 0 R >>\nstartxref\n443\n%%EOF"

    )



def create_valid_docx_bytes(content="Aditya Sharma\naditya@example.com\nSenior Engineer\nSkills: Python, Django, React, PostgreSQL, Docker.\nExperience:\nTechCorp (2022-Present): Developed high throughput APIs."):

    buf = io.BytesIO()

    with zipfile.ZipFile(buf, 'w') as zf:

        zf.writestr('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>')

        doc_xml = f'<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{content}</w:t></w:r></w:p></w:body></w:document>'

        zf.writestr('word/document.xml', doc_xml)

    return buf.getvalue()





class SecureResumeUploadAndLifecycleTest(TestCase):

    def setUp(self):

        self.user_a = User.objects.create_user(email="alice@trusthire.internal", password="Password123!", full_name="Alice Candidate", role="candidate")

        self.user_b = User.objects.create_user(email="bob@trusthire.internal", password="Password123!", full_name="Bob Candidate", role="candidate")

        self.client_a = APIClient()

        self.client_a.force_authenticate(user=self.user_a)

        self.client_b = APIClient()

        self.client_b.force_authenticate(user=self.user_b)



    def test_upload_valid_pdf(self):

        pdf_bytes = create_valid_pdf_bytes()

        uploaded = SimpleUploadedFile("alice_resume.pdf", pdf_bytes, content_type="application/pdf")

        res = self.client_a.post('/api/career/resumes/upload', {'file': uploaded}, format='multipart')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        self.assertIn('resume', res.data)

        self.assertEqual(res.data['resume']['parsing_status'], 'parsed')

        self.assertIn('extracted_preview', res.data)

        self.assertIn('skills', res.data['extracted_preview'])



    def test_upload_valid_docx(self):

        docx_bytes = create_valid_docx_bytes()

        uploaded = SimpleUploadedFile("alice_resume.docx", docx_bytes, content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")

        res = self.client_a.post('/api/career/resumes/upload', {'file': uploaded}, format='multipart')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        self.assertEqual(res.data['resume']['parsing_status'], 'parsed')

        self.assertEqual(res.data['resume']['file_type'], 'docx')



    def test_reject_invalid_magic_bytes(self):

        fake_pdf = SimpleUploadedFile("fake.pdf", b"NOT_A_REAL_PDF_CONTENT_HERE", content_type="application/pdf")

        res = self.client_a.post('/api/career/resumes/upload', {'file': fake_pdf}, format='multipart')

        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

        self.assertIn('Invalid file signature', res.data['error'])



    def test_reject_unsupported_file_extension(self):

        exe_file = SimpleUploadedFile("payload.exe", b"MZ-EXECUTABLE-MOCK", content_type="application/octet-stream")

        res = self.client_a.post('/api/career/resumes/upload', {'file': exe_file}, format='multipart')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)



    def test_reject_oversized_file(self):

        # 11MB file

        oversized = SimpleUploadedFile("big.pdf", b"%PDF-1.4 " + (b"0" * (11 * 1024 * 1024)), content_type="application/pdf")

        res = self.client_a.post('/api/career/resumes/upload', {'file': oversized}, format='multipart')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('exceeds 10MB limit', res.data['error'])



    def test_reanalyse_resume(self):

        pdf_bytes = create_valid_pdf_bytes()

        uploaded = SimpleUploadedFile("resume_v1.pdf", pdf_bytes, content_type="application/pdf")

        up_res = self.client_a.post('/api/career/resumes/upload', {'file': uploaded}, format='multipart')

        resume_id = up_res.data['resume']['id']



        # Reanalyse

        re_res = self.client_a.post(f'/api/career/resumes/{resume_id}/reanalyse')

        self.assertEqual(re_res.status_code, status.HTTP_200_OK)

        self.assertEqual(re_res.data['resume']['parsing_status'], 'parsed')



    def test_replace_resume(self):

        pdf_bytes = create_valid_pdf_bytes("First version of candidate resume with sufficient text for Python and Django parsing.")

        uploaded = SimpleUploadedFile("v1.pdf", pdf_bytes, content_type="application/pdf")

        up_res = self.client_a.post('/api/career/resumes/upload', {'file': uploaded}, format='multipart')

        resume_id = up_res.data['resume']['id']



        # Replace with docx

        docx_bytes = create_valid_docx_bytes("Replaced version of candidate resume with sufficient text for Python and React parsing.")

        new_file = SimpleUploadedFile("v2.docx", docx_bytes, content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")

        rep_res = self.client_a.post(f'/api/career/resumes/{resume_id}/replace', {'file': new_file}, format='multipart')

        self.assertEqual(rep_res.status_code, status.HTTP_200_OK)

        self.assertEqual(rep_res.data['resume']['file_name'], 'v2.docx')

        self.assertEqual(rep_res.data['resume']['file_type'], 'docx')



    def test_resume_download_and_user_isolation(self):

        pdf_bytes = create_valid_pdf_bytes()

        uploaded = SimpleUploadedFile("alice_secret.pdf", pdf_bytes, content_type="application/pdf")

        up_res = self.client_a.post('/api/career/resumes/upload', {'file': uploaded}, format='multipart')

        resume_id = up_res.data['resume']['id']



        # Alice downloads own resume -> 200 OK

        dl_res = self.client_a.get(f'/api/career/resumes/{resume_id}/download')

        self.assertEqual(dl_res.status_code, status.HTTP_200_OK)



        # Bob attempts to download Alice's resume -> 404 NOT FOUND (No access)

        bob_dl = self.client_b.get(f'/api/career/resumes/{resume_id}/download')

        self.assertEqual(bob_dl.status_code, status.HTTP_404_NOT_FOUND)



        # Bob attempts to delete Alice's resume -> 404 NOT FOUND

        bob_del = self.client_b.delete(f'/api/career/resumes/{resume_id}')

        self.assertEqual(bob_del.status_code, status.HTTP_404_NOT_FOUND)





class CareerProfileAndCompanyIntelligenceTest(TestCase):

    def setUp(self):

        self.user = User.objects.create_user(email="candidate.pro@trusthire.internal", password="Password123!", full_name="Pro Candidate", role="candidate")

        self.client = APIClient()

        self.client.force_authenticate(user=self.user)



        self.company = Company.objects.create(

            company_name="Apex Cloud Technologies",

            slug="apex-cloud",

            industry="Cloud Computing",

            description="Leading Indian cloud infrastructure provider.",

            headquarters="Bangalore, India",

            verification_status="verified"

        )

        self.job = JobPosting.objects.create(

            source_name="trusthire_bench",

            external_id="apex-001",

            company=self.company,

            company_name="Apex Cloud Technologies",

            title="Senior Backend Engineer",

            description="Build scalable distributed systems with Python and Docker.",

            required_skills=["Python", "Docker", "PostgreSQL"],

            preferred_skills=["Redis", "AWS"],

            verification_status="verified_active",

            application_url="https://example.com/apply"

        )



    def test_profile_confirmation(self):

        confirm_payload = {

            'headline': 'Senior Distributed Systems Architect',

            'skills': ['Python', 'Docker', 'PostgreSQL', 'Redis'],

            'education': [{'degree': 'B.Tech CS', 'institution': 'BITS Pilani', 'year': '2020'}],

            'work_experience': [{'company': 'CloudScale', 'dates': '2020-Present', 'bullets': ['Scaled APIs to 10k RPS.']}],

            'projects': [{'name': 'Distributed Cache', 'technologies': ['Python', 'Redis']}],

            'preferred_locations': ['Bangalore', 'Remote'],

            'workplace_preference': 'remote',

            'experience_level': 'senior'

        }

        res = self.client.post('/api/career/profile/confirm-extraction', confirm_payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertTrue(res.data['profile']['is_confirmed'])

        self.assertEqual(res.data['profile']['headline'], 'Senior Distributed Systems Architect')



    def test_company_recommendations(self):

        # Update user profile with matching skills

        self.client.post('/api/career/profile/confirm-extraction', {

            'skills': ['Python', 'Docker']

        }, format='json')



        res = self.client.get('/api/career/companies/recommended')

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertTrue(len(res.data) > 0)

        top_rec = res.data[0]

        self.assertEqual(top_rec['company_name'], 'Apex Cloud Technologies')

        self.assertIn('Python', top_rec['matched_skills'])

        self.assertIn('Actively hiring', top_rec['recommendation_reason'])



    def test_resume_improvement_assistant(self):

        self.client.post('/api/career/profile/confirm-extraction', {

            'work_experience': [{

                'company': 'Tech Solutions',

                'bullets': ['responsible for microservices and made databases faster.']

            }]

        }, format='json')



        res = self.client.post('/api/career/studio/improve-resume', {'target_role': 'Senior Backend Engineer'}, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertIn('clarity_score', res.data)

        self.assertIn('bullet_suggestions', res.data)

        self.assertTrue(len(res.data['bullet_suggestions']) > 0)

        # Verify metrics were not fabricated

        self.assertFalse(res.data['bullet_suggestions'][0]['metrics_fabricated'])



    def test_health_check_endpoint(self):

        client = APIClient()  # Unauthenticated check

        res = client.get('/api/career/health')

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertEqual(res.data['status'], 'healthy')

        self.assertEqual(res.data['database'], 'connected')

        self.assertGreaterEqual(res.data['verified_active_jobs'], 1)



    def test_skill_assessment_lifecycle(self):

        # 1. Seed assessment

        from career.models import SkillAssessment, CareerRoadmap, RoadmapPhase, RoadmapTask

        assessment = SkillAssessment.objects.create(

            title="Python Testing Assessment",

            slug="python-test-slug",

            skill_name="Python",

            assessment_type="quiz",

            difficulty="Intermediate",

            passing_score=70.0,

            questions=[

                {

                    "id": "q1",

                    "prompt": "What is Python?",

                    "type": "multiple_choice",

                    "options": ["A snake", "A programming language"],

                    "correct_option_index": 1,

                    "explanation": "Python is an interpreted programming language."

                }

            ]

        )



        # Create active roadmap with Python task

        roadmap = CareerRoadmap.objects.create(

            user=self.user,

            company_name="Acme",

            target_role="Python Engineer",

            status="active"

        )

        phase = RoadmapPhase.objects.create(roadmap=roadmap, phase_number=1, title="Foundations")

        task = RoadmapTask.objects.create(

            phase=phase,

            title="Master Python Core Principles",

            related_requirement="Python",

            status="todo"

        )



        # 2. List assessments

        list_res = self.client.get('/api/career/assessments')

        self.assertEqual(list_res.status_code, status.HTTP_200_OK)

        self.assertTrue(any(a['slug'] == 'python-test-slug' for a in list_res.data))



        # 3. Get detail (sanitized - no correct answer exposed)

        detail_res = self.client.get('/api/career/assessments/python-test-slug')

        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)

        q = detail_res.data['questions'][0]

        self.assertNotIn('correct_option_index', q)



        # 4. Submit correct attempt

        submit_res = self.client.post('/api/career/assessments/python-test-slug/submit', {

            'answers': {'q1': 1}

        }, format='json')

        self.assertEqual(submit_res.status_code, status.HTTP_201_CREATED)

        self.assertEqual(submit_res.data['score'], 100.0)

        self.assertTrue(submit_res.data['passed'])



        # 5. Verify CareerProfile was updated to assessment_supported

        prof_res = self.client.get('/api/career/profile')

        skills = prof_res.data['skills']

        py_skill = next((s for s in skills if (s.get('name') if isinstance(s, dict) else s) == 'Python'), None)

        self.assertIsNotNone(py_skill)

        self.assertEqual(py_skill.get('verification_tier'), 'assessment_supported')



        # 6. Verify RoadmapTask was auto-completed

        task.refresh_from_db()

        self.assertEqual(task.status, 'completed')



    def test_project_submission_lifecycle(self):

        from career.models import ProjectSubmission, RoadmapTask, RoadmapPhase, CareerRoadmap

        roadmap = CareerRoadmap.objects.create(

            user=self.user,

            company_name="ScaleTech",

            target_role="Fullstack Developer",

            status="active"

        )

        phase = RoadmapPhase.objects.create(roadmap=roadmap, phase_number=1, title="Projects")

        task = RoadmapTask.objects.create(

            phase=phase,

            title="Build Production React App",

            related_requirement="React",

            status="todo"

        )



        res = self.client.post('/api/career/projects/submissions', {

            'title': 'E-Commerce Microfrontend',

            'repository_url': 'https://github.com/candidate/ecommerce-storefront',

            'live_demo_url': 'https://storefront.candidate.dev',

            'skills_demonstrated': ['React', 'TypeScript', 'TailwindCSS'],

            'deliverables_summary': 'Built responsive shopping cart with Zustand and automated Vitest suites.',

            'task_id': str(task.id)

        }, format='json')



        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        self.assertEqual(res.data['title'], 'E-Commerce Microfrontend')

        self.assertEqual(res.data['verification_status'], 'verified')



        # Verify task completed

        task.refresh_from_db()

        self.assertEqual(task.status, 'completed')



        # Verify profile updated with project-supported skills

        prof_res = self.client.get('/api/career/profile')

        skills = prof_res.data['skills']

        react_skill = next((s for s in skills if isinstance(s, dict) and s.get('name') == 'React'), None)

        self.assertIsNotNone(react_skill)

        self.assertEqual(react_skill.get('verification_tier'), 'project_supported')



    def test_job_apply_click_logging(self):

        from career.models import JobPosting, JobApplicationClickLog, JobApplication

        job = JobPosting.objects.filter(verification_status='verified_active').first()

        self.assertIsNotNone(job)



        res = self.client.post(f'/api/career/jobs/{job.id}/apply-click', {

            'status': 'applied'

        }, format='json')



        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertEqual(res.data['application_url'], job.application_url)

        self.assertEqual(res.data['status'], 'applied')



        # Verify click telemetry was logged

        self.assertTrue(JobApplicationClickLog.objects.filter(user=self.user, job=job).exists())



        # Verify JobApplication record was created

        self.assertTrue(JobApplication.objects.filter(user=self.user, job=job, status='applied').exists())



    def test_job_readiness_experience_dashboard(self):

        res = self.client.get('/api/career/overview')

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data



        # Section 14 elements

        self.assertIn('target', data)

        self.assertIn('strengths', data)

        self.assertIn('priorities', data)

        self.assertIn('learning_plan', data)

        self.assertIn('practical_work', data)

        self.assertIn('assessments', data)

        self.assertIn('job_matches', data)

        self.assertIn('next_step', data)

        self.assertIn('title', data['next_step'])

        self.assertIn('action_label', data['next_step'])

