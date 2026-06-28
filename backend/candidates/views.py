from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from utils.permissions import IsCandidate
from .models import Candidate
from .serializers import CandidateSerializer
from resumes.models import Resume, ResumeAnalysis
from services.ai_service import AIService
from jobs.models import Job
from jobs.serializers import JobSerializer
from rankings.models import Ranking

class CandidateProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CandidateSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_object(self):
        candidate, _ = Candidate.objects.get_or_create(user=self.request.user)
        return candidate

class UploadResumeView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        candidate, _ = Candidate.objects.get_or_create(user=request.user)
        resume_file = request.FILES.get('resume_file')
        if not resume_file:
            return Response({"error": "No resume file provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save file to Candidate profile
        candidate.resume_file = resume_file
        candidate.save()

        # Create structured Resume record in resumes app
        resume = Resume.objects.create(
            candidate=candidate,
            resume_file=resume_file
        )

        # Trigger mock parsing / analysis
        raw_text = "Mock parsed text content extracted from PDF resume."
        resume.raw_text = raw_text
        resume.save()

        analysis_data = AIService.analyze_resume(raw_text)
        
        # Create ResumeAnalysis record
        ResumeAnalysis.objects.create(
            candidate=candidate,
            extracted_text=raw_text,
            skills=analysis_data.get('skills', []),
            projects=analysis_data.get('projects', []),
            certifications=analysis_data.get('certifications', []),
            education=analysis_data.get('education', []),
            employment_history=analysis_data.get('employment_history', []),
            career_timeline=analysis_data.get('career_timeline', []),
            parsed_json=analysis_data.get('parsed_json', {})
        )

        # Recalculate profile completion
        total_fields = 6
        filled_fields = 0
        if candidate.github_url: filled_fields += 1
        if candidate.linkedin_url: filled_fields += 1
        if candidate.location: filled_fields += 1
        if candidate.experience_years > 0: filled_fields += 1
        if candidate.current_role: filled_fields += 1
        if candidate.resume_file: filled_fields += 1
        candidate.profile_completion = int((filled_fields / total_fields) * 100)
        candidate.save()

        return Response({
            "detail": "Resume uploaded and analyzed successfully.",
            "resume_id": resume.id,
            "profile_completion": candidate.profile_completion
        }, status=status.HTTP_201_CREATED)

class CandidateDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request):
        candidate, _ = Candidate.objects.get_or_create(user=request.user)
        
        # Calculate Mock / Computed dashboard stats
        # Resume Score (mock or based on profile completion)
        resume_score = 65.0
        if candidate.resume_file:
            resume_score = 85.0

        # Trust Score (calculate using trust service)
        latest_analysis = ResumeAnalysis.objects.filter(candidate=candidate).last()
        analysis_data = {}
        if latest_analysis:
            analysis_data = {
                "skills": latest_analysis.skills,
                "education": latest_analysis.education
            }
        trust_result = AIService.generate_trust_report(candidate, analysis_data)
        trust_score = trust_result.get('trust_score', 70.0)

        # Career Trajectory (calculate using trajectory service)
        trajectory_result = AIService.evaluate_career_trajectory(analysis_data)
        trajectory_velocity = trajectory_result.get('velocity_score', 75.0)

        # Recommended Jobs
        jobs = Job.objects.filter(status='active')[:3]
        recommended_jobs = JobSerializer(jobs, many=True).data

        # Recent Applications / Rankings
        applications = Ranking.objects.filter(candidate=candidate).order_by('-overall_score')[:5]
        recent_applications = []
        for app in applications:
            recent_applications.append({
                "job_id": app.job.id,
                "job_title": app.job.title,
                "company_name": app.job.company.company_name,
                "overall_score": app.overall_score,
                "status": app.job.status
            })

        return Response({
            "resume_score": resume_score,
            "trust_score": trust_score,
            "career_trajectory": {
                "velocity_score": trajectory_velocity,
                "direction": trajectory_result.get('direction', 'Stable'),
                "summary": trajectory_result.get('trajectory_summary', 'Stable career path detected.')
            },
            "recommended_jobs": recommended_jobs,
            "recent_applications": recent_applications
        }, status=status.HTTP_200_OK)
