from django.urls import path
from .views import (
    CareerOverviewView, AIStatusView,
    CareerProfileDetailView, ConfirmProfileExtractionView,
    ResumeDocumentListView, ResumeUploadView, ResumeDeleteView,
    ResumeReanalyseView, ResumeReplaceView, ResumeDownloadView,
    JobSearchListView, JobDetailView, JobSyncTriggerView, JobSaveToggleView,
    JobMatchListView, EvaluateJobMatchView,
    TailoredDocumentListView, GenerateTailoredResumeView,
    GenerateCoverLetterView, TailoredDocumentDetailView,
    ResumeImprovementAssistantView,
    InterviewSessionListView, GenerateInterviewPrepView, SubmitInterviewAnswerView,
    JobApplicationListView, JobApplicationDetailView,
    CareerRoadmapListView, CareerRoadmapDetailView, GenerateRoadmapView,
    UpdateRoadmapTaskProgressView, SavedJobsListView, SavedCompaniesListView,
    RecommendedCompaniesView,
    MySkillsOverviewView,
    LearningHubOverviewView, LearningResourceListView, LearningResourceDetailView,
    UpdateLearningProgressView, ToggleSaveLearningResourceView, LogResourceClickView,
    LearningPathListView, LearningPathDetailView, AdminLearningResourceView,
    AdminVerifyResourceView, HealthCheckView, SkillAssessmentListView, SkillAssessmentDetailView, SubmitAssessmentAttemptView, ProjectSubmissionListView, JobApplyClickLogView
)

urlpatterns = [
    # 1. Overview & AI Status & Health
    path('overview', CareerOverviewView.as_view(), name='career_overview'),
    path('ai-status', AIStatusView.as_view(), name='career_ai_status'),
    path('health', HealthCheckView.as_view(), name='career_health'),

    # 2. Career Profile (Phase 3 & 4)
    path('profile', CareerProfileDetailView.as_view(), name='career_profile'),
    path('profile/confirm-extraction', ConfirmProfileExtractionView.as_view(), name='career_profile_confirm'),

    # 3. Resume Ingestion, Lifecycle & Parsing (Phase 2 & 3)
    path('resumes', ResumeDocumentListView.as_view(), name='career_resumes_list'),
    path('resumes/upload', ResumeUploadView.as_view(), name='career_resume_upload'),
    path('resumes/<uuid:pk>', ResumeDeleteView.as_view(), name='career_resume_delete'),
    path('resumes/<uuid:pk>/reanalyse', ResumeReanalyseView.as_view(), name='career_resume_reanalyse'),
    path('resumes/<uuid:pk>/replace', ResumeReplaceView.as_view(), name='career_resume_replace'),
    path('resumes/<uuid:pk>/download', ResumeDownloadView.as_view(), name='career_resume_download'),

    # 4. Job Discovery & Search (Phase 4 & 5)
    path('jobs', JobSearchListView.as_view(), name='career_jobs_list'),
    path('jobs/<uuid:pk>', JobDetailView.as_view(), name='career_job_detail'),
    path('jobs/<uuid:pk>/save', JobSaveToggleView.as_view(), name='career_job_save'),
    path('jobs/sync', JobSyncTriggerView.as_view(), name='career_jobs_sync'),

    # 5. Explainable Job Matching & Recommendations (Phase 5)
    path('matches', JobMatchListView.as_view(), name='career_matches_list'),
    path('matches/evaluate', EvaluateJobMatchView.as_view(), name='career_matches_evaluate'),

    # 6. AI Resume & Application Studio & Resume Improvement Assistant (Phase 8)
    path('studio/documents', TailoredDocumentListView.as_view(), name='career_studio_documents'),
    path('studio/generate-resume', GenerateTailoredResumeView.as_view(), name='career_studio_gen_resume'),
    path('studio/generate-cover-letter', GenerateCoverLetterView.as_view(), name='career_studio_gen_letter'),
    path('studio/documents/<uuid:pk>', TailoredDocumentDetailView.as_view(), name='career_studio_doc_detail'),
    path('studio/improve-resume', ResumeImprovementAssistantView.as_view(), name='career_studio_improve_resume'),

    # 7. Interview Preparation
    path('interview/sessions', InterviewSessionListView.as_view(), name='career_interview_sessions'),
    path('interview/generate', GenerateInterviewPrepView.as_view(), name='career_interview_generate'),
    path('interview/sessions/<uuid:pk>/submit-answer', SubmitInterviewAnswerView.as_view(), name='career_interview_submit'),

    # 8. Application Tracker
    path('tracker/applications', JobApplicationListView.as_view(), name='career_tracker_list'),
    path('tracker/applications/<uuid:pk>', JobApplicationDetailView.as_view(), name='career_tracker_detail'),

    # 9. Company Intelligence, Career Roadmaps & Saved Opportunities (Phase 6 & 7)
    path('companies/recommended', RecommendedCompaniesView.as_view(), name='career_recommended_companies'),
    path('roadmaps', CareerRoadmapListView.as_view(), name='career_roadmaps_list'),
    path('roadmaps/generate', GenerateRoadmapView.as_view(), name='career_roadmap_generate'),
    path('roadmaps/<uuid:pk>', CareerRoadmapDetailView.as_view(), name='career_roadmap_detail'),
    path('roadmaps/tasks/<uuid:pk>/progress', UpdateRoadmapTaskProgressView.as_view(), name='career_roadmap_task_progress'),
    path('saved-jobs', SavedJobsListView.as_view(), name='career_saved_jobs'),
    path('saved-companies', SavedCompaniesListView.as_view(), name='career_saved_companies'),
    path('my-skills', MySkillsOverviewView.as_view(), name='career_my_skills'),

    # 10. Learning Hub & Career Readiness Platform (Phase 7)
    path('learning/hub', LearningHubOverviewView.as_view(), name='career_learning_hub'),
    path('learning/resources', LearningResourceListView.as_view(), name='career_learning_resources_list'),
    path('learning/resources/<uuid:pk>', LearningResourceDetailView.as_view(), name='career_learning_resource_detail'),
    path('learning/resources/<uuid:pk>/save', ToggleSaveLearningResourceView.as_view(), name='career_learning_resource_save'),
    path('learning/resources/<uuid:pk>/click', LogResourceClickView.as_view(), name='career_learning_resource_click'),
    path('learning/progress', UpdateLearningProgressView.as_view(), name='career_learning_progress_update'),
    path('learning/paths', LearningPathListView.as_view(), name='career_learning_paths_list'),
    path('learning/paths/<slug:slug>', LearningPathDetailView.as_view(), name='career_learning_path_detail'),
    path('learning/admin/resources', AdminLearningResourceView.as_view(), name='career_learning_admin_resource_create'),
    path('learning/admin/resources/<uuid:pk>/verify', AdminVerifyResourceView.as_view(), name='career_learning_admin_verify'),

    # 11. Assessments, Project Verification & Direct Application Links
    path('assessments', SkillAssessmentListView.as_view(), name='career_assessments_list'),
    path('assessments/<slug:slug>', SkillAssessmentDetailView.as_view(), name='career_assessment_detail'),
    path('assessments/<slug:slug>/submit', SubmitAssessmentAttemptView.as_view(), name='career_assessment_submit'),
    path('projects/submissions', ProjectSubmissionListView.as_view(), name='career_project_submissions'),
    path('jobs/<uuid:pk>/apply-click', JobApplyClickLogView.as_view(), name='career_job_apply_click'),
]
