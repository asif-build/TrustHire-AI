from rest_framework import serializers
from .models import Job, JobAnalysis
from companies.serializers import CompanySerializer

class JobAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobAnalysis
        fields = [
            'id', 'must_have_skills', 'nice_to_have_skills', 'soft_skills', 
            'experience_required', 'seniority', 'domain', 'parsed_json'
        ]

class JobSerializer(serializers.ModelSerializer):
    company_detail = CompanySerializer(source='company', read_only=True)
    analysis = JobAnalysisSerializer(read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'recruiter', 'company', 'company_detail', 'title', 
            'description', 'location', 'employment_type', 
            'experience_required', 'salary_range', 'status', 'created_at', 'analysis'
        ]
        read_only_fields = ['id', 'recruiter', 'company', 'created_at']

    def validate(self, data):
        # Validation: Check for duplicate active job titles by the same recruiter
        recruiter = self.context['request'].user.recruiter_profile
        title = data.get('title')
        company = recruiter.company
        
        instance = self.instance
        if not instance:
            if Job.objects.filter(recruiter=recruiter, company=company, title__iexact=title, status='active').exists():
                raise serializers.ValidationError("An active job with this title already exists for this company.")
        return data
