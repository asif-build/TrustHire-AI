from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MyTokenObtainPairView, RegisterView, LogoutView, PasswordResetView

urlpatterns = [
    path('register', RegisterView.as_view(), name='auth_register'),
    path('login', MyTokenObtainPairView.as_view(), name='auth_login'),
    path('logout', LogoutView.as_view(), name='auth_logout'),
    path('refresh', TokenRefreshView.as_view(), name='auth_refresh'),
    path('password-reset', PasswordResetView.as_view(), name='auth_password_reset'),
]
