from django.urls import path
from .views import CandidateProfileView, UploadResumeView, CandidateDashboardView

urlpatterns = [
    path('profile', CandidateProfileView.as_view(), name='candidate_profile'),
    path('upload-resume', UploadResumeView.as_view(), name='candidate_upload_resume'),
    path('dashboard', CandidateDashboardView.as_view(), name='candidate_dashboard'),
]
