from django.db import models
from recruiters.models import Recruiter
from companies.models import Company

class Job(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('closed', 'Closed'),
    )
    
    recruiter = models.ForeignKey(Recruiter, on_delete=models.CASCADE, related_name='jobs')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=50, default='Full-time')
    experience_required = models.FloatField(default=0.0)
    salary_range = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} at {self.company.company_name}"


class JobAnalysis(models.Model):
    job = models.OneToOneField(Job, on_delete=models.CASCADE, related_name='analysis')
    must_have_skills = models.JSONField(default=list, blank=True)
    nice_to_have_skills = models.JSONField(default=list, blank=True)
    soft_skills = models.JSONField(default=list, blank=True)
    experience_required = models.FloatField(default=0.0)
    seniority = models.CharField(max_length=50, blank=True, default='')
    domain = models.CharField(max_length=100, blank=True, default='')
    parsed_json = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Analysis: {self.job.title}"
