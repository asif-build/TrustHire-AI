from django.urls import path
from .views import (
    CompanyCreateView, CompanyListView, CompanyDetailView,
    CompanyJobsListView, CompanySaveToggleView, CompanyUpdateView
)

urlpatterns = [
    path('', CompanyListView.as_view(), name='company_list'),
    path('create', CompanyCreateView.as_view(), name='company_create'),
    path('update', CompanyUpdateView.as_view(), name='company_update'),
    path('<str:slug>', CompanyDetailView.as_view(), name='company_detail'),
    path('<str:slug>/jobs', CompanyJobsListView.as_view(), name='company_jobs'),
    path('<str:slug>/save', CompanySaveToggleView.as_view(), name='company_save_toggle'),
]
