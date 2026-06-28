from django.urls import path
from .views import CompanyCreateView, CompanyListView, CompanyUpdateView

urlpatterns = [
    path('create', CompanyCreateView.as_view(), name='company_create'),
    path('', CompanyListView.as_view(), name='company_list'),
    path('update', CompanyUpdateView.as_view(), name='company_update'),
]
