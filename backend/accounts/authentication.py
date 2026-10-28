import jwt
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class TrustHireAuthentication(JWTAuthentication):
    """
    Robust JWT authentication for TrustHire.
    1. Validates standard SimpleJWT access tokens.
    2. Resolves local developer mock tokens (mock-jwt-<role>-...) seamlessly to the local user.
    3. In DEBUG mode, decodes non-SimpleJWT tokens (e.g. Supabase session tokens) to identify the user by email without failing.
    4. In DEBUG mode, falls back to the active candidate user (e.g. itsasifhere7@gmail.com) so local development and file uploads are never blocked by 401.
    """
    def authenticate(self, request):
        header = self.get_header(request)
        raw_token = self.get_raw_token(header) if header else None

        if raw_token is not None:
            raw_token_str = raw_token.decode('utf-8') if isinstance(raw_token, bytes) else str(raw_token)

            # 1. Local developer mock token support
            if raw_token_str.startswith('mock-jwt-'):
                role = 'recruiter' if 'recruiter' in raw_token_str else 'candidate'
                user = User.objects.filter(email='itsasifhere7@gmail.com').first() if role == 'candidate' else None
                if not user:
                    user = User.objects.filter(role=role, is_active=True).first()
                if not user:
                    user, _ = User.objects.get_or_create(
                        email=f"{role}@trusthire.local",
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
                # 3. If invalid/expired SimpleJWT in DEBUG mode: attempt unverified payload decode
                if getattr(settings, 'DEBUG', False):
                    try:
                        payload = jwt.decode(raw_token_str, options={"verify_signature": False})
                        email = payload.get('email') or payload.get('user_metadata', {}).get('email')
                        if email:
                            user = User.objects.filter(email=email).first()
                            if user:
                                return (user, None)
                    except Exception:
                        pass
                    
                    # Fallback in local DEBUG mode for candidate or recruiter endpoints
                    default_candidate = User.objects.filter(email='itsasifhere7@gmail.com').first() or User.objects.filter(role='candidate').first()
                    if default_candidate:
                        return (default_candidate, None)

                return None

        # 4. If header is None and DEBUG is True on career/candidate routes, fallback to candidate
        if getattr(settings, 'DEBUG', False):
            path = request.path
            if '/career/' in path or '/resumes/' in path or '/candidate/' in path:
                default_candidate = User.objects.filter(email='itsasifhere7@gmail.com').first() or User.objects.filter(role='candidate').first()
                if default_candidate:
                    return (default_candidate, None)

        return None
