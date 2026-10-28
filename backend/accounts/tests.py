from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from candidates.models import Candidate
from recruiters.models import Recruiter

User = get_user_model()

class AuthTestCase(APITestCase):
    def setUp(self):
        # Initial urls
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.profile_url = reverse('candidate_profile')

    def test_candidate_registration_and_login(self):
        # Verify terms acceptance requirement
        invalid_data = {
            "email": "candidate@example.com",
            "password": "securepassword123",
            "full_name": "Test Candidate",
            "role": "candidate",
            "phone": "9876543210"
        }
        res_fail = self.client.post(self.register_url, invalid_data)
        self.assertEqual(res_fail.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("terms_accepted", res_fail.data)

        # 1. Register candidate with explicit terms acceptance
        data = {
            "email": "candidate@example.com",
            "password": "securepassword123",
            "full_name": "Test Candidate",
            "role": "candidate",
            "phone": "9876543210",
            "terms_accepted": True,
            "terms_version": "v1.0.0-2026.10"
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        
        # Verify Candidate profile was auto-created and terms acceptance recorded
        user = User.objects.get(email="candidate@example.com")
        self.assertTrue(Candidate.objects.filter(user=user).exists())
        self.assertTrue(user.terms_accepted)
        self.assertIsNotNone(user.terms_accepted_at)
        self.assertEqual(user.terms_version, "v1.0.0-2026.10")

        # 2. Login candidate
        login_data = {
            "email": "candidate@example.com",
            "password": "securepassword123"
        }
        login_response = self.client.post(self.login_url, login_data)
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
        self.assertEqual(login_response.data["user"]["role"], "candidate")

        # 3. Access profile with token
        token = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        profile_response = self.client.get(self.profile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data["full_name"], "Test Candidate")

    def test_recruiter_registration(self):
        # 1. Register recruiter with terms acceptance
        data = {
            "email": "recruiter@example.com",
            "password": "securepassword123",
            "full_name": "Test Recruiter",
            "role": "recruiter",
            "terms_accepted": True,
            "terms_version": "v1.0.0-2026.10"
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify Recruiter profile was auto-created and terms recorded
        user = User.objects.get(email="recruiter@example.com")
        self.assertTrue(Recruiter.objects.filter(user=user).exists())
        self.assertTrue(user.terms_accepted)
