from rest_framework import generics, status, exceptions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from utils.permissions import IsRecruiter
from .models import Job, JobAnalysis
from .serializers import JobSerializer
from services.ai_service import AIService

class JobCreateView(generics.CreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def perform_create(self, serializer):
        recruiter = self.request.user.recruiter_profile
        company = recruiter.company
        if not company:
            raise exceptions.ValidationError("You must be associated with a Company to post a job. Please update your profile first.")
        
        job = serializer.save(recruiter=recruiter, company=company)
        
        # Trigger Job Description AI parsing
        analysis_data = AIService.analyze_job(job.description)
        JobAnalysis.objects.create(
            job=job,
            must_have_skills=analysis_data.get('must_have_skills', []),
            nice_to_have_skills=analysis_data.get('nice_to_have_skills', []),
            soft_skills=analysis_data.get('soft_skills', []),
            experience_required=analysis_data.get('experience_required', job.experience_required),
            seniority=analysis_data.get('seniority', ''),
            domain=analysis_data.get('domain', ''),
            parsed_json=analysis_data.get('parsed_json', {})
        )

class JobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Job.objects.filter(status='active').order_by('-created_at')
        
        # Filter options
        location = self.request.query_params.get('location')
        employment_type = self.request.query_params.get('employment_type')
        title = self.request.query_params.get('title')
        company_name = self.request.query_params.get('company_name')

        if location:
            queryset = queryset.filter(location__icontains=location)
        if employment_type:
            queryset = queryset.filter(employment_type__icontains=employment_type)
        if title:
            queryset = queryset.filter(title__icontains=title)
        if company_name:
            queryset = queryset.filter(company__company_name__icontains=company_name)
            
        return queryset

class JobDetailView(generics.RetrieveAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'

class JobUpdateView(generics.UpdateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]
    lookup_field = 'id'

    def perform_update(self, serializer):
        job = self.get_object()
        if job.recruiter != self.request.user.recruiter_profile:
            raise exceptions.PermissionDenied("You do not have permission to modify this job post.")
        
        updated_job = serializer.save()
        
        # Re-run AI analysis if description changed
        if 'description' in serializer.validated_data:
            analysis_data = AIService.analyze_job(updated_job.description)
            analysis, created = JobAnalysis.objects.get_or_create(job=updated_job)
            analysis.must_have_skills = analysis_data.get('must_have_skills', [])
            analysis.nice_to_have_skills = analysis_data.get('nice_to_have_skills', [])
            analysis.soft_skills = analysis_data.get('soft_skills', [])
            analysis.experience_required = analysis_data.get('experience_required', updated_job.experience_required)
            analysis.seniority = analysis_data.get('seniority', '')
            analysis.domain = analysis_data.get('domain', '')
            analysis.parsed_json = analysis_data.get('parsed_json', {})
            analysis.save()

class JobDeleteView(generics.DestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]
    lookup_field = 'id'

    def perform_destroy(self, instance):
        if instance.recruiter != self.request.user.recruiter_profile:
            raise exceptions.PermissionDenied("You do not have permission to delete this job post.")
        instance.delete()
