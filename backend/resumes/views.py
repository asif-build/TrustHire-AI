import os
import uuid
from rest_framework import generics, status, exceptions, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Resume, ResumeAnalysis
from .serializers import ResumeSerializer, ResumeAnalysisSerializer
from candidates.models import Candidate
from career.models import CareerProfile
from career.services.resume_extractor import (
    extract_text_from_pdf, extract_text_from_docx, parse_structured_resume_data, validate_file_safety
)

class ResumeUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        resume_file = request.FILES.get('resume') or request.FILES.get('resume_file')
        if not resume_file:
            return Response({"error": "No resume file provided."}, status=status.HTTP_400_BAD_REQUEST)

        # File size check (10MB limit)
        if resume_file.size > 10 * 1024 * 1024:
            return Response({"error": "File size exceeds 10MB limit."}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(resume_file.name)[1].lower()
        if ext not in ['.pdf', '.docx']:
            return Response({"error": "Unsupported file format. Please upload a PDF or DOCX file."}, status=status.HTTP_400_BAD_REQUEST)

        file_type = 'pdf' if ext == '.pdf' else 'docx'

        # Link to candidate profile
        if request.user.role == 'candidate':
            candidate, _ = Candidate.objects.get_or_create(user=request.user)
        else:
            candidate_id = request.data.get('candidate_id')
            if not candidate_id:
                return Response({"error": "Recruiters must specify a candidate_id to upload resumes."}, status=status.HTTP_400_BAD_REQUEST)
            candidate = generics.get_object_or_404(Candidate, id=candidate_id)

        # Sanitize filename with UUID prefix to prevent traversal
        safe_name = f"{uuid.uuid4().hex[:8]}_{os.path.basename(resume_file.name)}"
        resume_file.name = safe_name

        resume = Resume.objects.create(
            candidate=candidate,
            resume_file=resume_file
        )

        file_path = resume.resume_file.path
        if file_type == 'pdf':
            ext_res = extract_text_from_pdf(file_path)
        else:
            ext_res = extract_text_from_docx(file_path)

        if not ext_res['success']:
            return Response({
                'error': ext_res['error'] or 'Failed to extract text from resume.',
                'status': ext_res.get('status', 'failed')
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        raw_text = ext_res['text']
        resume.raw_text = raw_text
        resume.save()

        structured = parse_structured_resume_data(raw_text)

        analysis = ResumeAnalysis.objects.create(
            candidate=candidate,
            extracted_text=raw_text,
            skills=structured.get('skills', []),
            projects=structured.get('projects', []),
            certifications=structured.get('certifications', []),
            education=structured.get('education', []),
            employment_history=structured.get('work_experience', []),
            career_timeline=[],
            parsed_json=structured
        )

        # Synchronize with CareerProfile if candidate
        if request.user.role == 'candidate':
            cp, _ = CareerProfile.objects.get_or_create(user=request.user)
            if structured.get('skills'):
                cp.skills = list(set(cp.skills + structured.get('skills', [])))
            if structured.get('education'):
                cp.education = structured.get('education')
            if structured.get('work_experience'):
                cp.work_experience = structured.get('work_experience')
            if structured.get('projects'):
                cp.projects = structured.get('projects')
            if structured.get('headline') and not cp.headline:
                cp.headline = structured.get('headline')
            cp.is_confirmed = True
            cp.save()

        return Response({
            "detail": "Resume uploaded and analyzed successfully.",
            "resume_id": resume.id,
            "analysis": ResumeAnalysisSerializer(analysis).data,
            "structured_analysis": structured
        }, status=status.HTTP_201_CREATED)


class ResumeStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'candidate':
            return Response({"error": "Only candidates have resume status records."}, status=status.HTTP_403_FORBIDDEN)

        try:
            candidate = Candidate.objects.get(user=request.user)
            latest_resume = Resume.objects.filter(candidate=candidate).order_by('-uploaded_at').first()
            latest_analysis = ResumeAnalysis.objects.filter(candidate=candidate).order_by('-id').first()
        except Candidate.DoesNotExist:
            latest_resume = None
            latest_analysis = None

        has_resume = latest_resume is not None
        return Response({
            "has_resume": has_resume,
            "resume_id": latest_resume.id if latest_resume else None,
            "uploaded_at": latest_resume.uploaded_at if latest_resume else None,
            "structured_analysis": latest_analysis.parsed_json if latest_analysis else None,
            "rankings": []
        })


class ResumeDetailView(generics.RetrieveAPIView):
    queryset = ResumeAnalysis.objects.all()
    serializer_class = ResumeAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_object(self):
        analysis_id = self.kwargs.get('id')
        analysis = generics.get_object_or_404(ResumeAnalysis, id=analysis_id)

        user = self.request.user
        if user.role == 'candidate' and analysis.candidate.user != user:
            raise exceptions.PermissionDenied("You do not have permission to view this resume analysis.")

        return analysis
