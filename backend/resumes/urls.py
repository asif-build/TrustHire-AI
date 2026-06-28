from django.urls import path
from .views import ResumeUploadView, ResumeDetailView

urlpatterns = [
    path('upload', ResumeUploadView.as_view(), name='resume_upload'),
    path('<int:id>', ResumeDetailView.as_view(), name='resume_detail'),
]
