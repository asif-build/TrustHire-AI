from django.db import models

class Company(models.Model):
    company_name = models.CharField(max_length=255, unique=True)
    website = models.URLField(max_length=200, blank=True, default='')
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    industry = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return self.company_name
