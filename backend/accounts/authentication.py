from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.contrib.auth import get_user_model

User = get_user_model()

class TrustHireAuthentication(JWTAuthentication):
    """
    Robust JWT authentication for TrustHire.
    1. Validates standard SimpleJWT access tokens.
    2. Resolves local developer mock tokens (mock-jwt-<role>-...) seamlessly to local demo accounts.
    3. Gracefully degrades on expired/invalid tokens for public endpoints so public pages
       (companies directory, learning hub, job search) load without being blocked by 401.
    """
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        raw_token_str = raw_token.decode('utf-8') if isinstance(raw_token, bytes) else str(raw_token)

        # 1. Local developer mock token support
        if raw_token_str.startswith('mock-jwt-'):
            role = 'recruiter' if 'recruiter' in raw_token_str else 'candidate'
            email = f"{role}@trusthire.local"
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    'full_name': f"Demo {role.title()}",
                    'role': role,
                    'terms_accepted': True
                }
            )
            return (user, None)

        # 2. Standard SimpleJWT validation
        try:
            validated_token = self.get_validated_token(raw_token)
            return (self.get_user(validated_token), validated_token)
        except (InvalidToken, AuthenticationFailed):
            # If the token is expired or malformed, return None so AllowAny views
            # can still render for the visitor. Views requiring IsAuthenticated
            # will properly reject with 401 via their permission class.
            return None
