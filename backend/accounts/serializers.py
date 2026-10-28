from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'phone', 'profile_image', 'terms_accepted', 'terms_accepted_at', 'terms_version', 'created_at']
        read_only_fields = ['id', 'terms_accepted', 'terms_accepted_at', 'terms_version', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    terms_accepted = serializers.BooleanField(write_only=True, required=True)
    terms_version = serializers.CharField(write_only=True, required=False, default='v1.0.0-2026.10')
    
    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'role', 'phone', 'terms_accepted', 'terms_version']

    def validate_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError("You must review and accept the Terms of Service and Privacy Policy to create an account.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_role(self, value):
        if value not in ['candidate', 'recruiter']:
            raise serializers.ValidationError("Role must be either candidate or recruiter.")
        return value

    def create(self, validated_data):
        from django.utils import timezone
        now = timezone.now()
        terms_version = validated_data.pop('terms_version', 'v1.0.0-2026.10')
        validated_data.pop('terms_accepted', True)

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            role=validated_data.get('role', 'candidate'),
            phone=validated_data.get('phone', ''),
            terms_accepted=True,
            terms_accepted_at=now,
            privacy_accepted_at=now,
            terms_version=terms_version
        )
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        # Include user details in the final JSON response
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'full_name': self.user.full_name,
            'role': self.user.role,
            'phone': self.user.phone,
        }
        return data
