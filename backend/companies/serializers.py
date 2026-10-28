from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    active_jobs_count = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    domain = serializers.SerializerMethodField()
    display_offices = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'company_name', 'slug', 'canonical_name', 'website', 'careers_url',
            'logo', 'logo_url', 'domain', 'industry', 'description',
            'founded_year', 'founding_location', 'headquarters', 'country', 'region',
            'countries_of_operation', 'locations', 'office_locations', 'display_offices',
            'company_stage', 'company_size', 'is_startup',
            'products_and_services', 'departments',
            'job_source_type', 'job_source_token', 'data_source', 'source_url',
            'last_verified_at', 'verification_status', 'created_at', 'updated_at',
            'active_jobs_count', 'is_saved'
        ]

    def get_domain(self, obj):
        if obj.domain:
            return obj.domain
        if obj.website:
            from urllib.parse import urlparse
            netloc = urlparse(obj.website).netloc.lower()
            return netloc.replace('www.', '')
        return ''

    def get_display_offices(self, obj):
        offices = obj.office_locations or obj.locations or []
        if isinstance(offices, list) and len(offices) > 0:
            cleaned = []
            for item in offices:
                if isinstance(item, dict):
                    city = item.get('city') or item.get('name')
                    country = item.get('country')
                    cleaned.append(f"{city}, {country}" if city and country else (city or country))
                elif isinstance(item, str):
                    cleaned.append(item.split(',')[0].strip())
            return ' · '.join(cleaned[:4])
        if obj.headquarters:
            return obj.headquarters.split(',')[0].strip()
        return ''

    def get_active_jobs_count(self, obj):
        from career.models import JobPosting
        from django.db.models import Q
        return JobPosting.objects.filter(
            Q(company=obj) | Q(company_name__iexact=obj.company_name),
            verification_status='verified_active'
        ).count()

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from career.models import SavedCompany
            return SavedCompany.objects.filter(user=request.user, company=obj).exists()
        return False
