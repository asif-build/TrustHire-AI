from django.db import models
from django.conf import settings
from utils.validators import validate_resume_file

class Candidate(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='candidate_profile')
    resume_file = models.FileField(upload_to='resumes/', validators=[validate_resume_file], null=True, blank=True)
    github_url = models.URLField(max_length=200, blank=True, default='')
    linkedin_url = models.URLField(max_length=200, blank=True, default='')
    location = models.CharField(max_length=100, blank=True, default='')
    experience_years = models.FloatField(default=0.0)
    current_role = models.CharField(max_length=100, blank=True, default='')
    profile_completion = models.IntegerField(default=0)  # Percentage 0 to 100

    def __str__(self):
        return f"Candidate: {self.user.email} - {self.experience_years} YOE"
