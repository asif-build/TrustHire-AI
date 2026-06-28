from django.db import models
from django.conf import settings
from companies.models import Company

class Recruiter(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recruiter_profile')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='recruiters')
    designation = models.CharField(max_length=100, blank=True, default='')

    def __str__(self):
        return f"Recruiter: {self.user.email} at {self.company.company_name if self.company else 'No Company'}"
