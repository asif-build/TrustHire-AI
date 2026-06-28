from django.urls import path
from .views import RecruiterProfileView, RecruiterDashboardView

urlpatterns = [
    path('profile', RecruiterProfileView.as_view(), name='recruiter_profile'),
    path('dashboard', RecruiterDashboardView.as_view(), name='recruiter_dashboard'),
]
