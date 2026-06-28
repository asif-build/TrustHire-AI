from django.urls import path
from .views import JobCreateView, JobListView, JobDetailView, JobUpdateView, JobDeleteView

urlpatterns = [
    path('create', JobCreateView.as_view(), name='job_create'),
    path('', JobListView.as_view(), name='job_list'),
    path('<int:id>', JobDetailView.as_view(), name='job_detail'),
    path('<int:id>/update', JobUpdateView.as_view(), name='job_update'),
    path('<int:id>/delete', JobDeleteView.as_view(), name='job_delete'),
]
