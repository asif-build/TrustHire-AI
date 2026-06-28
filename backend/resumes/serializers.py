from rest_framework import serializers
from .models import Resume, ResumeAnalysis

class ResumeAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeAnalysis
        fields = [
            'id', 'extracted_text', 'skills', 'projects', 'certifications', 
            'education', 'employment_history', 'career_timeline', 'parsed_json'
        ]

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'candidate', 'resume_file', 'raw_text', 'uploaded_at']
        read_only_fields = ['id', 'candidate', 'raw_text', 'uploaded_at']
