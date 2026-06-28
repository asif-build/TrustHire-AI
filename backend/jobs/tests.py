from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from companies.models import Company
from recruiters.models import Recruiter
from jobs.models import Job, JobAnalysis

User = get_user_model()

class JobsTestCase(APITestCase):
    def setUp(self):
        # 1. Create company
        self.company = Company.objects.create(
            company_name="TrustHire AI Corp",
            website="https://trusthire.ai",
            industry="HRTech"
        )
        
        # 2. Create recruiter user and profile
        self.user = User.objects.create_user(
            email="recruiter@example.com",
            password="securepassword123",
            full_name="Recruiter One",
            role="recruiter"
        )
        self.recruiter = Recruiter.objects.create(
            user=self.user,
            company=self.company,
            designation="Talent Acquisition Lead"
        )
        
        # Authenticate client
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(self.user).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        self.create_job_url = reverse('job_create')
        self.list_jobs_url = reverse('job_list')

    def test_job_creation_and_duplicate_check(self):
        # 1. Post a job
        job_data = {
            "title": "Senior Python Engineer",
            "description": "Looking for a Python Developer experienced in Django and PostgreSQL.",
            "location": "Bengaluru, India",
            "employment_type": "Full-time",
            "experience_required": 5.0,
            "salary_range": "15-25 LPA"
        }
        response = self.client.post(self.create_job_url, job_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify Job and JobAnalysis were created
        self.assertTrue(Job.objects.filter(title="Senior Python Engineer").exists())
        job = Job.objects.get(title="Senior Python Engineer")
        self.assertTrue(JobAnalysis.objects.filter(job=job).exists())
        
        # Verify mock analysis extracted must-have skills
        analysis = JobAnalysis.objects.get(job=job)
        self.assertIn("Python", analysis.must_have_skills)
        self.assertIn("Django", analysis.must_have_skills)

        # 2. Attempt duplicate active job posting (must fail)
        duplicate_response = self.client.post(self.create_job_url, job_data)
        self.assertEqual(duplicate_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", duplicate_response.data)
