from rest_framework.permissions import BasePermission

class IsRecruiter(BasePermission):
    """
    Allows access only to authenticated users with role='recruiter'.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'recruiter')

class IsCandidate(BasePermission):
    """
    Allows access only to authenticated users with role='candidate'.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'candidate')

class IsAdminUser(BasePermission):
    """
    Allows access only to authenticated users with role='admin' or superusers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser)
        )
