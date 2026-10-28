from django.urls import path
from .views import ResumeUploadView, ResumeDetailView, ResumeStatusView

urlpatterns = [
    path('upload', ResumeUploadView.as_view(), name='resume_upload'),
    path('status', ResumeStatusView.as_view(), name='resume_status'),
    path('<int:id>', ResumeDetailView.as_view(), name='resume_detail'),
]
