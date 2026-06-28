from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Candidate

User = get_user_model()

class CandidateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'profile_image']

class CandidateSerializer(serializers.ModelSerializer):
    user = CandidateUserSerializer(read_only=True)
    full_name = serializers.CharField(source='user.full_name', required=False)
    phone = serializers.CharField(source='user.phone', required=False)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Candidate
        fields = [
            'id', 'user', 'email', 'full_name', 'phone', 'resume_file', 
            'github_url', 'linkedin_url', 'location', 
            'experience_years', 'current_role', 'profile_completion'
        ]
        read_only_fields = ['id', 'profile_completion']

    def update(self, instance, validated_data):
        # Handle updating nested User fields
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Handle updating Candidate fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Recalculate profile completion percentage dynamically
        total_fields = 6  # github_url, linkedin_url, location, experience_years, current_role, resume_file
        filled_fields = 0
        if instance.github_url: filled_fields += 1
        if instance.linkedin_url: filled_fields += 1
        if instance.location: filled_fields += 1
        if instance.experience_years > 0: filled_fields += 1
        if instance.current_role: filled_fields += 1
        if instance.resume_file: filled_fields += 1
        
        instance.profile_completion = int((filled_fields / total_fields) * 100)
        instance.save()
        
        return instance
