from django.urls import path
from .views import JobRankingsListView, CandidateRankingsListView

urlpatterns = [
    path('job/<int:job_id>', JobRankingsListView.as_view(), name='rankings_by_job'),
    path('candidate/<int:candidate_id>', CandidateRankingsListView.as_view(), name='rankings_by_candidate'),
]
