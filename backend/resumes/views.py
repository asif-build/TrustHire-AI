from rest_framework import generics, status, exceptions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Resume, ResumeAnalysis
from .serializers import ResumeSerializer, ResumeAnalysisSerializer
from candidates.models import Candidate
from services.ai_service import AIService

class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        resume_file = request.FILES.get('resume_file')
        if not resume_file:
            return Response({"error": "No resume file provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Link to candidate profile
        if request.user.role == 'candidate':
            candidate, _ = Candidate.objects.get_or_create(user=request.user)
        else:
            # If recruiter uploads, they must pass candidate_id in post body
            candidate_id = request.data.get('candidate_id')
            if not candidate_id:
                return Response({"error": "Recruiters must specify a candidate_id to upload resumes."}, status=status.HTTP_400_BAD_REQUEST)
            candidate = generics.get_object_or_404(Candidate, id=candidate_id)
            
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
        analysis = ResumeAnalysis.objects.create(
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

        return Response({
            "detail": "Resume uploaded and analyzed successfully.",
            "resume_id": resume.id,
            "analysis": ResumeAnalysisSerializer(analysis).data
        }, status=status.HTTP_201_CREATED)

class ResumeDetailView(generics.RetrieveAPIView):
    queryset = ResumeAnalysis.objects.all()
    serializer_class = ResumeAnalysisSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_object(self):
        analysis_id = self.kwargs.get('id')
        analysis = generics.get_object_or_404(ResumeAnalysis, id=analysis_id)
        
        # Access control
        user = self.request.user
        if user.role == 'candidate' and analysis.candidate.user != user:
            raise exceptions.PermissionDenied("You do not have permission to view this resume analysis.")
        
        return analysis
