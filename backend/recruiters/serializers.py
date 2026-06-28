from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Recruiter
from companies.serializers import CompanySerializer
from companies.models import Company

User = get_user_model()

class RecruiterUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'profile_image']

class RecruiterSerializer(serializers.ModelSerializer):
    user = RecruiterUserSerializer(read_only=True)
    company_detail = CompanySerializer(source='company', read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source='company', write_only=True, required=False, allow_null=True
    )
    full_name = serializers.CharField(source='user.full_name', required=False)
    phone = serializers.CharField(source='user.phone', required=False)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Recruiter
        fields = [
            'id', 'user', 'email', 'full_name', 'phone', 
            'company', 'company_id', 'company_detail', 'designation'
        ]
        read_only_fields = ['id', 'company']

    def update(self, instance, validated_data):
        # Handle updating nested User fields
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Handle updating Recruiter fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
