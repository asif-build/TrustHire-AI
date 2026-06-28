from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/company/', include('companies.urls')),
    path('api/candidate/', include('candidates.urls')),
    path('api/recruiter/', include('recruiters.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/resume/', include('resumes.urls')),
    path('api/rankings/', include('rankings.urls')),
    path('api/ai/', include('ai.urls')),
    
    # Swagger / OpenAPI documentation urls
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
