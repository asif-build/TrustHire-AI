from django.db import models
from django.utils.text import slugify

class Company(models.Model):
    company_name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True, null=True, db_index=True)
    canonical_name = models.CharField(max_length=255, blank=True, default='')
    domain = models.CharField(max_length=255, blank=True, default='', db_index=True)
    website = models.URLField(max_length=500, blank=True, default='')
    careers_url = models.URLField(max_length=500, blank=True, default='')
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    logo_url = models.CharField(max_length=500, blank=True, default='')
    industry = models.CharField(max_length=150, blank=True, default='', db_index=True)
    description = models.TextField(blank=True, default='')
    
    # Origin & Geography (Strictly distinguished)
    founded_year = models.IntegerField(null=True, blank=True)
    founding_location = models.CharField(max_length=255, blank=True, default='')
    headquarters = models.CharField(max_length=255, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='India', db_index=True)
    region = models.CharField(max_length=100, blank=True, default='India', db_index=True)
    countries_of_operation = models.JSONField(default=list, blank=True)
    
    # Office Presence
    locations = models.JSONField(default=list, blank=True)
    office_locations = models.JSONField(default=list, blank=True)
    
    # Scale & Classification
    company_stage = models.CharField(max_length=50, blank=True, default='Growth', db_index=True)
    company_size = models.CharField(max_length=100, blank=True, default='')
    is_startup = models.BooleanField(default=False, db_index=True)
    
    # Business Capabilities
    products_and_services = models.JSONField(default=list, blank=True)
    departments = models.JSONField(default=list, blank=True)
    
    # Job Board Integrations & Data Provenance
    job_source_type = models.CharField(max_length=50, blank=True, default='none')
    job_source_token = models.CharField(max_length=100, blank=True, default='')
    data_source = models.CharField(max_length=255, blank=True, default='Official Corporate Disclosures & Public Registries')
    source_url = models.URLField(max_length=500, blank=True, default='')
    last_verified_at = models.DateTimeField(null=True, blank=True)
    verification_status = models.CharField(max_length=50, default='verified')
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.canonical_name:
            self.canonical_name = self.company_name
        if not self.domain and self.website:
            try:
                self.domain = self.website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0].lower()
            except Exception:
                pass
        if not self.slug:
            base_slug = slugify(self.company_name) or 'company'
            slug = base_slug
            counter = 1
            while Company.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.company_name
