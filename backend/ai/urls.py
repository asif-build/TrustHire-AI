from django.urls import path
from .views import (
    AIAnalyzeJobView, AIAnalyzeResumeView, AIRankCandidatesView, 
    AIGenerateTrustReportView, AICareerTrajectoryView
)

urlpatterns = [
    path('analyze-job', AIAnalyzeJobView.as_view(), name='ai_analyze_job'),
    path('analyze-resume', AIAnalyzeResumeView.as_view(), name='ai_analyze_resume'),
    path('rank-candidates', AIRankCandidatesView.as_view(), name='ai_rank_candidates'),
    path('generate-trust-report', AIGenerateTrustReportView.as_view(), name='ai_generate_trust_report'),
    path('career-trajectory', AICareerTrajectoryView.as_view(), name='ai_career_trajectory'),
]
