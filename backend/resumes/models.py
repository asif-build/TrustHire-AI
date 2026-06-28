from django.db import models
from candidates.models import Candidate
from utils.validators import validate_resume_file

class Resume(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='resumes')
    resume_file = models.FileField(upload_to='resumes/', validators=[validate_resume_file])
    raw_text = models.TextField(blank=True, default='')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resume: {self.candidate.user.email} - {self.uploaded_at}"


class ResumeAnalysis(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='analyses')
    extracted_text = models.TextField()
    skills = models.JSONField(default=list, blank=True)
    projects = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    education = models.JSONField(default=list, blank=True)
    employment_history = models.JSONField(default=list, blank=True)
    career_timeline = models.JSONField(default=list, blank=True)
    parsed_json = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Analysis: {self.candidate.user.email}"
