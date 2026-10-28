import os
import uuid
from django.core.cache import cache
from django.http import FileResponse
from companies.models import Company
from datetime import datetime
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import (
    CareerProfile, ResumeDocument, JobSource, JobPosting,
    JobMatch, TailoredDocument, InterviewSession, JobApplication,
    CareerRoadmap, RoadmapPhase, RoadmapTask,
    TaskLearningResource, TaskProjectRecommendation,
    SavedJob, SavedCompany,
    LearningResource, LearningPath, LearningPathStep,
    UserLearningProgress, SavedLearningResource, ResourceClickLog,
    SkillAssessment, AssessmentAttempt, ProjectSubmission, JobApplicationClickLog
)
from .serializers import (
    CareerProfileSerializer, ResumeDocumentSerializer, JobPostingSerializer,
    JobMatchSerializer, TailoredDocumentSerializer, InterviewSessionSerializer,
    JobApplicationSerializer,
    LearningResourceSerializer, LearningPathSerializer,
    LearningPathStepSerializer, UserLearningProgressSerializer,
    SavedLearningResourceSerializer,
    SkillAssessmentSerializer, AssessmentAttemptSerializer,
    ProjectSubmissionSerializer, JobApplicationClickLogSerializer
)
from .services.assessment_engine import AssessmentEngine
from .services.youtube import extract_youtube_info, get_youtube_thumbnail_url
from .services.link_checker import verify_external_url
from .services.job_sources import sync_all_default_sources, GreenhouseConnector, LeverConnector
from .services.resume_extractor import (
    extract_text_from_pdf, extract_text_from_docx, parse_structured_resume_data, validate_file_safety
)
from .services.ai_adapter import AIAdapter
from .services.matching_engine import evaluate_job_match
from .services.studio_service import ApplicationStudioService
from .services.interview_service import InterviewPrepService


# ----------------------------------------------------------------------
# 1. Career Overview & AI Provider Status
# ----------------------------------------------------------------------

class CareerOverviewView(APIView):
    """
    TrustHire Section 14: Job-Readiness Experience Dashboard.
    Answers the 5 core user questions:
      1. Which jobs are realistically relevant to my current profile?
      2. What evidence makes me a suitable candidate?
      3. What requirements am I not yet demonstrating?
      4. Exactly what should I learn or build to improve my suitability?
      5. Where can I apply for the actual job?
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = CareerProfile.objects.get_or_create(user=user)
        
        # 1. Profile completeness calculation
        filled_count = 0
        total_fields = 7
        if profile.headline: filled_count += 1
        if profile.summary: filled_count += 1
        if profile.skills: filled_count += 1
        if profile.work_experience: filled_count += 1
        if profile.education: filled_count += 1
        if profile.projects: filled_count += 1
        if profile.preferred_locations or profile.preferred_job_titles: filled_count += 1
        completion = int((filled_count / total_fields) * 100)

        # 2. Target role & preferences
        target_roles = profile.preferred_job_titles or (['Software Engineer'] if profile.skills else [])
        primary_target_role = target_roles[0] if target_roles else 'Software Engineer'
        target_locations = profile.preferred_locations or ['Flexible / Any']
        workplace_pref = profile.workplace_preference

        # 3. Candidate Strengths (Evidenced, Project-supported & Assessment-supported skills)
        strengths = []
        user_skills = profile.skills or []
        for s in user_skills:
            if isinstance(s, dict):
                strengths.append({
                    'name': s.get('name', ''),
                    'tier': s.get('verification_tier', 'self_declared'),
                    'evidence': s.get('assessment_title') or s.get('evidence') or 'Demonstrated in profile'
                })
            elif isinstance(s, str):
                strengths.append({
                    'name': s,
                    'tier': 'self_declared',
                    'evidence': 'Profile confirmed competency'
                })

        # 4. Active Roadmap & Priorities (Skill Gaps)
        active_roadmap = CareerRoadmap.objects.filter(user=user, status='active').first()
        priorities = []
        learning_plan = []
        practical_work = []

        if active_roadmap:
            gap_data = active_roadmap.skill_gap_analysis or {}
            missing_skills = gap_data.get('missing_skills', [])
            for ms in missing_skills[:5]:
                skill_name = ms if isinstance(ms, str) else ms.get('skill', '')
                priorities.append({
                    'skill': skill_name,
                    'importance': 'High Priority Gap',
                    'rationale': f"Frequently required for {active_roadmap.target_role} roles."
                })

            for phase in active_roadmap.phases.all().prefetch_related('tasks'):
                phase_tasks = []
                for t in phase.tasks.all():
                    phase_tasks.append({
                        'id': str(t.id),
                        'title': t.title,
                        'status': t.status,
                        'priority': t.priority,
                        'estimated_effort': t.estimated_effort,
                        'why_it_matters': t.why_it_matters
                    })
                learning_plan.append({
                    'phase_number': phase.phase_number,
                    'title': phase.title,
                    'estimated_weeks': phase.estimated_weeks,
                    'tasks': phase_tasks
                })
                # Collect practical project recommendations
                for t in phase.tasks.all():
                    for proj in t.project_recommendations.all():
                        practical_work.append({
                            'id': str(proj.id),
                            'title': proj.title,
                            'objective': proj.objective,
                            'skills_demonstrated': proj.skills_demonstrated,
                            'task_title': t.title,
                            'task_status': t.status
                        })
        else:
            # Fallback priority gaps based on target role
            common_gaps = ['Docker', 'System Design', 'SQL']
            for cg in common_gaps:
                if not any(s.lower() == cg.lower() for s in [st['name'] for st in strengths]):
                    priorities.append({
                        'skill': cg,
                        'importance': 'Target Role Requirement',
                        'rationale': f"Essential production competency for {primary_target_role}."
                    })

        # 5. Assessments summary
        user_attempts = AssessmentAttempt.objects.filter(user=user).select_related('assessment')
        completed_assessments = [{
            'title': att.assessment.title,
            'skill': att.assessment.skill_name,
            'score': att.score,
            'passed': att.passed,
            'completed_at': att.completed_at
        } for att in user_attempts[:5]]

        available_assessments_count = SkillAssessment.objects.filter(is_active=True).count()
        passed_assessments_count = user_attempts.filter(passed=True).count()

        # 6. User Project Submissions
        user_submissions = ProjectSubmission.objects.filter(user=user)
        submissions_data = [{
            'id': str(sub.id),
            'title': sub.title,
            'repository_url': sub.repository_url,
            'skills_demonstrated': sub.skills_demonstrated,
            'verification_status': sub.verification_status
        } for sub in user_submissions[:4]]

        # 7. Job Matches with verified apply links & explanations
        top_matches_qs = JobMatch.objects.filter(user=user).select_related('job').order_by('-overall_score')[:5]
        job_matches = []
        for m in top_matches_qs:
            job_matches.append({
                'id': str(m.id),
                'job_id': str(m.job.id),
                'job_title': m.job.title,
                'company_name': m.job.company_name,
                'location': m.job.location,
                'workplace_type': m.job.workplace_type,
                'overall_score': m.overall_score,
                'explanation': m.explanation,
                'application_url': m.job.application_url,
                'matched_count': len(m.matched_requirements),
                'missing_count': len(m.missing_requirements)
            })

        # If no evaluated matches, provide top active verified jobs
        if not job_matches:
            top_active_jobs = JobPosting.objects.filter(verification_status='verified_active')[:5]
            for job in top_active_jobs:
                job_matches.append({
                    'id': None,
                    'job_id': str(job.id),
                    'job_title': job.title,
                    'company_name': job.company_name,
                    'location': job.location,
                    'workplace_type': job.workplace_type,
                    'overall_score': 75.0,
                    'explanation': f"Actively hiring in {job.location}. Role matches {primary_target_role} profile.",
                    'application_url': job.application_url,
                    'matched_count': len(job.required_skills or []),
                    'missing_count': 0
                })

        # 8. Single Next Step CTA
        if not profile.skills:
            next_step = {
                'title': 'Upload Your Resume to Calibrate Skills',
                'description': 'Upload your CV to extract proven skills, projects, and target role matches.',
                'action_label': 'Upload Resume',
                'action_url': '/career/profile'
            }
        elif not profile.is_confirmed:
            next_step = {
                'title': 'Confirm Your Extracted Career Profile',
                'description': 'Review and confirm your extracted competencies so our matching engine can calibrate jobs.',
                'action_label': 'Review & Confirm Profile',
                'action_url': '/career/profile'
            }
        elif passed_assessments_count == 0 and SkillAssessment.objects.exists():
            first_assessment = SkillAssessment.objects.first()
            next_step = {
                'title': f'Verify Competence: {first_assessment.title}',
                'description': f'Complete a 15-minute assessment in {first_assessment.skill_name} to strengthen your profile.',
                'action_label': 'Take Assessment',
                'action_url': f'/career/assessments/{first_assessment.slug}'
            }
        elif job_matches:
            top_job = job_matches[0]
            next_step = {
                'title': f"Ready to Apply: {top_job['job_title']} at {top_job['company_name']}",
                'description': f"Your profile strongly aligns ({top_job['overall_score']}%) with this verified vacancy.",
                'action_label': 'View Job & Apply →',
                'action_url': top_job['application_url'],
                'is_external': True,
                'job_id': top_job['job_id']
            }
        else:
            next_step = {
                'title': 'Explore Verified Job Postings',
                'description': 'Search verified openings from top companies across India and globally.',
                'action_label': 'Browse Jobs',
                'action_url': '/career/jobs'
            }

        # Summary metrics
        resumes_count = ResumeDocument.objects.filter(user=user).count()
        matches_count = JobMatch.objects.filter(user=user).count()
        tracked_count = JobApplication.objects.filter(user=user).count()
        docs_count = TailoredDocument.objects.filter(user=user).count()
        sessions_count = InterviewSession.objects.filter(user=user).count()
        available_jobs = JobPosting.objects.filter(verification_status='verified_active').count()

        return Response({
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name
            },
            'completion_percentage': completion,
            'is_confirmed': profile.is_confirmed,
            'target': {
                'primary_role': primary_target_role,
                'preferred_roles': target_roles,
                'locations': target_locations,
                'workplace': workplace_pref
            },
            'strengths': strengths[:8],
            'priorities': priorities[:5],
            'learning_plan': learning_plan,
            'practical_work': practical_work[:4],
            'user_submissions': submissions_data,
            'assessments': {
                'completed': completed_assessments,
                'available_count': available_assessments_count,
                'passed_count': passed_assessments_count
            },
            'job_matches': job_matches,
            'next_step': next_step,
            'metrics': {
                'available_jobs': available_jobs,
                'resumes_uploaded': resumes_count,
                'matches_evaluated': matches_count,
                'applications_tracked': tracked_count,
                'tailored_documents': docs_count,
                'interview_sessions': sessions_count,
                'passed_assessments': passed_assessments_count,
                'submitted_projects': user_submissions.count()
            },
            'ai_status': AIAdapter.get_status()
        })


class AIStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(AIAdapter.get_status())


# ----------------------------------------------------------------------
# 2. Authenticated Career Profile (Phase 3)
# ----------------------------------------------------------------------

class CareerProfileDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = CareerProfile.objects.get_or_create(user=request.user)
        serializer = CareerProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = CareerProfile.objects.get_or_create(user=request.user)
        serializer = CareerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConfirmProfileExtractionView(APIView):
    """
    Candidate confirmation step before saving extracted resume data
    as authoritative profile data (Phase 3 requirement).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile, _ = CareerProfile.objects.get_or_create(user=request.user)
        data = request.data

        # Update authoritative fields upon explicit candidate confirmation
        if 'skills' in data and isinstance(data['skills'], list):
            profile.skills = list(dict.fromkeys(profile.skills + data['skills']))
        if 'education' in data and isinstance(data['education'], list):
            profile.education = data['education']
        if 'work_experience' in data and isinstance(data['work_experience'], list):
            profile.work_experience = data['work_experience']
        if 'projects' in data and isinstance(data['projects'], list):
            profile.projects = data['projects']
        if 'certifications' in data and isinstance(data['certifications'], list):
            profile.certifications = data['certifications']
        if 'headline' in data and data['headline']:
            profile.headline = data['headline']
        if 'summary' in data and data['summary']:
            profile.summary = data['summary']
        if 'preferred_job_titles' in data and isinstance(data['preferred_job_titles'], list):
            profile.preferred_job_titles = data['preferred_job_titles']
        if 'preferred_locations' in data and isinstance(data['preferred_locations'], list):
            profile.preferred_locations = data['preferred_locations']
        if 'workplace_preference' in data and data['workplace_preference']:
            profile.workplace_preference = data['workplace_preference']
        if 'experience_level' in data and data['experience_level']:
            profile.experience_level = data['experience_level']
        
        profile.is_confirmed = True
        profile.save()

        return Response({
            'detail': 'Career profile successfully confirmed and saved.',
            'profile': CareerProfileSerializer(profile).data
        })


# ----------------------------------------------------------------------
# 3. Resume Ingestion and Parsing (Phase 6)
# ----------------------------------------------------------------------

class ResumeDocumentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        resumes = ResumeDocument.objects.filter(user=request.user).order_by('-created_at')
        serializer = ResumeDocumentSerializer(resumes, many=True)
        return Response(serializer.data)


def sync_resume_to_profile_and_recommend(user, raw_text, structured):
    """
    Auto-populates candidate CareerProfile from extracted resume data
    and updates job matches / recommendations immediately.
    """
    profile, _ = CareerProfile.objects.get_or_create(user=user)

    # 1. Skills
    extracted_skills = structured.get('skills') or structured.get('detected_skills_flat') or []
    if extracted_skills:
        existing_skills = profile.skills or []
        combined_skills = list(dict.fromkeys(existing_skills + extracted_skills))
        profile.skills = combined_skills

    # 2. Headline
    headline = structured.get('headline') or structured.get('candidate_headline')
    if headline and (not profile.headline or profile.headline in ['Software Engineer', 'Senior Software Engineer', 'Draft Profile']):
        profile.headline = headline
    elif not profile.headline and extracted_skills:
        profile.headline = f"{extracted_skills[0]} Engineer"

    # 3. Summary
    if structured.get('summary') and not profile.summary:
        profile.summary = structured['summary']

    # 4. Education
    if structured.get('education') and (not profile.education or len(profile.education) == 0):
        profile.education = structured['education']

    # 5. Work Experience
    if structured.get('work_experience') and (not profile.work_experience or len(profile.work_experience) == 0):
        profile.work_experience = structured['work_experience']

    # 6. Projects
    if structured.get('projects') and (not profile.projects or len(profile.projects) == 0):
        profile.projects = structured['projects']

    # 7. Certifications
    if structured.get('certifications') and (not profile.certifications or len(profile.certifications) == 0):
        profile.certifications = structured['certifications']

    # 8. Location
    if structured.get('location') and (not profile.preferred_locations or len(profile.preferred_locations) == 0):
        profile.preferred_locations = [structured['location']]

    profile.is_confirmed = True
    profile.save()

    # 9. Compute job recommendations
    try:
        profile_data = {
            'skills': profile.skills,
            'education': profile.education,
            'work_experience': profile.work_experience,
            'projects': profile.projects,
            'certifications': profile.certifications,
            'preferred_locations': profile.preferred_locations,
            'workplace_preference': profile.workplace_preference
        }
        active_jobs = JobPosting.objects.filter(verification_status='verified_active')[:25]
        for job in active_jobs:
            match_result = evaluate_job_match(profile_data, raw_text, job)
            JobMatch.objects.update_or_create(
                user=user,
                job=job,
                defaults={
                    'overall_score': match_result['overall_score'],
                    'matched_requirements': match_result['matched_requirements'],
                    'partially_matched_requirements': match_result['partially_matched_requirements'],
                    'missing_requirements': match_result['missing_requirements'],
                    'declared_skills': match_result['declared_skills'],
                    'evidenced_skills': match_result['evidenced_skills'],
                    'verified_skills': match_result['verified_skills'],
                    'explanation': match_result['explanation'],
                    'constraints_analysis': match_result['constraints_analysis'],
                    'methodology_version': match_result['methodology_version']
                }
            )
    except Exception as e:
        print(f"Notice: job match evaluation notice: {e}")

    return profile


class ResumeUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get('file') or request.FILES.get('resume')
        if not uploaded_file:
            return Response({'error': 'No resume file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Rate limiting: 15 uploads per minute per user
        cache_key = f"career_upload_rate_{request.user.id}"
        count = cache.get(cache_key, 0)
        if count >= 15:
            return Response({'error': 'Rate limit exceeded. Please wait a minute before uploading again.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        cache.set(cache_key, count + 1, timeout=60)

        # File size validation (limit 10MB)
        if uploaded_file.size > 10 * 1024 * 1024:
            return Response({'error': 'File size exceeds 10MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

        # File type validation
        ext = os.path.splitext(uploaded_file.name)[1].lower()
        if ext not in ['.pdf', '.docx']:
            return Response(
                {'error': 'Unsupported file format. Please upload a PDF or DOCX resume.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        file_type = 'pdf' if ext == '.pdf' else 'docx'
        original_name = uploaded_file.name
        safe_name = f"{uuid.uuid4().hex[:12]}_{os.path.basename(original_name)}"
        uploaded_file.name = safe_name

        # Create record
        resume_doc = ResumeDocument.objects.create(
            user=request.user,
            file=uploaded_file,
            file_name=original_name,
            file_type=file_type,
            file_size=uploaded_file.size,
            parsing_status='pending',
            is_primary=True
        )
        ResumeDocument.objects.filter(user=request.user).exclude(id=resume_doc.id).update(is_primary=False)

        # Extract text based on file type
        file_path = resume_doc.file.path
        if file_type == 'pdf':
            ext_res = extract_text_from_pdf(file_path)
        else:
            ext_res = extract_text_from_docx(file_path)

        if not ext_res['success']:
            resume_doc.parsing_status = ext_res['status']
            resume_doc.parsing_error = ext_res['error']
            resume_doc.save()
            return Response({
                'status': ext_res['status'],
                'error': ext_res['error'],
                'resume_id': str(resume_doc.id)
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        # Structured parsing
        raw_text = ext_res['text']
        structured = parse_structured_resume_data(raw_text)

        resume_doc.raw_text = raw_text
        resume_doc.extracted_data = structured
        resume_doc.parsing_status = 'parsed'
        resume_doc.parsing_error = ''
        resume_doc.save()

        # Auto-sync extracted data to profile and compute recommendations immediately
        profile = sync_resume_to_profile_and_recommend(request.user, raw_text, structured)

        return Response({
            'detail': 'Resume uploaded, profile updated, and recommendations generated successfully.',
            'resume': ResumeDocumentSerializer(resume_doc).data,
            'extracted_preview': structured,
            'profile': CareerProfileSerializer(profile).data,
            'confirmation_needed': False,
            'message': 'Your skills, experience, and job matches have been synced.'
        }, status=status.HTTP_201_CREATED)


class ResumeReanalyseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            resume_doc = ResumeDocument.objects.get(id=pk, user=request.user)
        except ResumeDocument.DoesNotExist:
            return Response({'error': 'Resume document not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)

        if not resume_doc.file or not os.path.exists(resume_doc.file.path):
            return Response({'error': 'Original resume file not found on storage.'}, status=status.HTTP_404_NOT_FOUND)

        file_path = resume_doc.file.path
        if resume_doc.file_type == 'pdf':
            ext_res = extract_text_from_pdf(file_path)
        else:
            ext_res = extract_text_from_docx(file_path)

        if not ext_res['success']:
            resume_doc.parsing_status = ext_res['status']
            resume_doc.parsing_error = ext_res['error']
            resume_doc.save()
            return Response({
                'status': ext_res['status'],
                'error': ext_res['error'],
                'resume_id': str(resume_doc.id)
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        raw_text = ext_res['text']
        structured = parse_structured_resume_data(raw_text)

        resume_doc.raw_text = raw_text
        resume_doc.extracted_data = structured
        resume_doc.parsing_status = 'parsed'
        resume_doc.parsing_error = ''
        resume_doc.save()

        # Auto-sync extracted data to profile and compute recommendations immediately
        profile = sync_resume_to_profile_and_recommend(request.user, raw_text, structured)

        return Response({
            'detail': 'Resume reanalysed, profile updated, and recommendations generated successfully.',
            'resume': ResumeDocumentSerializer(resume_doc).data,
            'extracted_preview': structured,
            'profile': CareerProfileSerializer(profile).data,
            'confirmation_needed': False,
            'message': 'Your skills, experience, and job matches have been updated.'
        })


class ResumeReplaceView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            resume_doc = ResumeDocument.objects.get(id=pk, user=request.user)
        except ResumeDocument.DoesNotExist:
            return Response({'error': 'Resume document not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)

        uploaded_file = request.FILES.get('file') or request.FILES.get('resume')
        if not uploaded_file:
            return Response({'error': 'No replacement resume file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        if uploaded_file.size > 10 * 1024 * 1024:
            return Response({'error': 'File size exceeds 10MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(uploaded_file.name)[1].lower()
        if ext not in ['.pdf', '.docx']:
            return Response({'error': 'Unsupported file format. Please upload a PDF or DOCX file.'}, status=status.HTTP_400_BAD_REQUEST)

        # Remove old file safely
        if resume_doc.file and os.path.exists(resume_doc.file.path):
            try:
                os.remove(resume_doc.file.path)
            except Exception:
                pass

        file_type = 'pdf' if ext == '.pdf' else 'docx'
        original_name = uploaded_file.name
        safe_name = f"{uuid.uuid4().hex[:12]}_{os.path.basename(original_name)}"
        uploaded_file.name = safe_name

        resume_doc.file = uploaded_file
        resume_doc.file_name = original_name
        resume_doc.file_type = file_type
        resume_doc.file_size = uploaded_file.size
        resume_doc.parsing_status = 'pending'
        resume_doc.save()

        file_path = resume_doc.file.path
        if file_type == 'pdf':
            ext_res = extract_text_from_pdf(file_path)
        else:
            ext_res = extract_text_from_docx(file_path)

        if not ext_res['success']:
            resume_doc.parsing_status = ext_res['status']
            resume_doc.parsing_error = ext_res['error']
            resume_doc.save()
            return Response({
                'status': ext_res['status'],
                'error': ext_res['error'],
                'resume_id': str(resume_doc.id)
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        raw_text = ext_res['text']
        structured = parse_structured_resume_data(raw_text)

        resume_doc.raw_text = raw_text
        resume_doc.extracted_data = structured
        resume_doc.parsing_status = 'parsed'
        resume_doc.parsing_error = ''
        resume_doc.save()

        # Auto-sync extracted data to profile and compute recommendations immediately
        profile = sync_resume_to_profile_and_recommend(request.user, raw_text, structured)

        return Response({
            'detail': 'Resume replaced, profile updated, and recommendations generated successfully.',
            'resume': ResumeDocumentSerializer(resume_doc).data,
            'extracted_preview': structured,
            'profile': CareerProfileSerializer(profile).data,
            'confirmation_needed': False,
            'message': 'Your skills, experience, and job matches have been synced.'
        })


class ResumeDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            resume_doc = ResumeDocument.objects.get(id=pk, user=request.user)
        except ResumeDocument.DoesNotExist:
            return Response({'error': 'Resume document not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)

        if not resume_doc.file or not os.path.exists(resume_doc.file.path):
            return Response({'error': 'Resume file does not exist on disk.'}, status=status.HTTP_404_NOT_FOUND)

        content_type = 'application/pdf' if resume_doc.file_type == 'pdf' else 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        response = FileResponse(open(resume_doc.file.path, 'rb'), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(resume_doc.file_name)}"'
        return response


class ResumeDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            resume_doc = ResumeDocument.objects.get(id=pk, user=request.user)
            # Remove physical file if exists
            if resume_doc.file and os.path.exists(resume_doc.file.path):
                try:
                    os.remove(resume_doc.file.path)
                except Exception:
                    pass
            resume_doc.delete()
            return Response({'detail': 'Resume document deleted successfully.'})
        except ResumeDocument.DoesNotExist:
            return Response({'error': 'Resume document not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)


# ----------------------------------------------------------------------
# 4. Real Job Discovery & Search (Phase 4 & 5)
# ----------------------------------------------------------------------

class JobSearchListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = JobPosting.objects.filter(verification_status='verified_active')

        # Keyword search across title, company, description
        q = request.query_params.get('q', '').strip()
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q) |
                Q(company_name__icontains=q) |
                Q(description__icontains=q)
            )

        # Job title filter
        title = request.query_params.get('title', '').strip()
        if title:
            queryset = queryset.filter(title__icontains=title)

        # Company filter
        company = request.query_params.get('company', '').strip()
        if company:
            queryset = queryset.filter(company_name__icontains=company)

        # Location filter
        location = request.query_params.get('location', '').strip()
        if location:
            queryset = queryset.filter(location__icontains=location)

        # Workplace type (remote, hybrid, onsite)
        workplace = request.query_params.get('workplace_type', '').strip().lower()
        if workplace and workplace in ['remote', 'hybrid', 'onsite']:
            queryset = queryset.filter(workplace_type=workplace)

        # Employment type
        emp_type = request.query_params.get('employment_type', '').strip()
        if emp_type:
            queryset = queryset.filter(employment_type__icontains=emp_type)

        # Experience level
        exp_level = request.query_params.get('experience_level', '').strip()
        if exp_level:
            queryset = queryset.filter(experience_level__iexact=exp_level)

        # Skill filtering
        skill = request.query_params.get('skill', '').strip()
        if skill:
            queryset = queryset.filter(
                Q(required_skills__icontains=skill) |
                Q(preferred_skills__icontains=skill)
            )

        # Sorting
        sort_by = request.query_params.get('sort', 'newest')
        if sort_by == 'oldest':
            queryset = queryset.order_by('posted_at')
        elif sort_by == 'company':
            queryset = queryset.order_by('company_name')
        elif sort_by == 'title':
            queryset = queryset.order_by('title')
        else:
            queryset = queryset.order_by('-posted_at', '-created_at')

        # Pagination (20 per page)
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        total_count = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size

        jobs = queryset[start:end]
        serializer = JobPostingSerializer(jobs, many=True, context={'request': request})

        return Response({
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size if total_count else 1,
            'jobs': serializer.data
        })


class JobDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            job = JobPosting.objects.get(id=pk)
            serializer = JobPostingSerializer(job, context={'request': request})
            return Response(serializer.data)
        except JobPosting.DoesNotExist:
            return Response({'error': 'Job posting not found.'}, status=status.HTTP_404_NOT_FOUND)


class JobSaveToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            job = JobPosting.objects.get(id=pk)
        except JobPosting.DoesNotExist:
            return Response({'error': 'Job posting not found.'}, status=status.HTTP_404_NOT_FOUND)

        from .models import SavedJob
        saved = SavedJob.objects.filter(user=request.user, job=job).first()
        if saved:
            saved.delete()
            return Response({'status': 'unfollowed', 'is_saved': False, 'message': f"Removed '{job.title}' from saved jobs."})
        else:
            SavedJob.objects.create(user=request.user, job=job)
            return Response({'status': 'saved', 'is_saved': True, 'message': f"Saved '{job.title}' to your saved jobs."})


class JobSyncTriggerView(APIView):
    """
    Triggers live synchronization with Greenhouse and Lever feeds.
    Reports real fetch results without fabrication.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        results = sync_all_default_sources()
        total_synced = sum(r.get('jobs_synced', 0) for r in results)
        return Response({
            'detail': f"Job source synchronization completed. Fetched {total_synced} listings.",
            'results': results,
            'total_jobs_in_catalog': JobPosting.objects.count()
        })


# ----------------------------------------------------------------------
# 5. Explainable Job Matching (Phase 7)
# ----------------------------------------------------------------------

class JobMatchListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        matches = JobMatch.objects.filter(user=request.user, job__verification_status='verified_active').order_by('-overall_score')
        
        # If no evaluations exist, automatically evaluate candidate against active verified jobs
        if not matches.exists():
            profile, _ = CareerProfile.objects.get_or_create(user=request.user)
            latest_resume = ResumeDocument.objects.filter(user=request.user, parsing_status='parsed').order_by('-updated_at').first()
            resume_text = latest_resume.raw_text if latest_resume else ''

            if profile.skills or resume_text:
                profile_data = {
                    'skills': profile.skills,
                    'education': profile.education,
                    'work_experience': profile.work_experience,
                    'projects': profile.projects,
                    'certifications': profile.certifications,
                    'preferred_locations': profile.preferred_locations,
                    'workplace_preference': profile.workplace_preference
                }
                active_jobs = JobPosting.objects.filter(verification_status='verified_active')[:10]
                for job in active_jobs:
                    match_result = evaluate_job_match(profile_data, resume_text, job)
                    JobMatch.objects.update_or_create(
                        user=request.user,
                        job=job,
                        defaults={
                            'overall_score': match_result['overall_score'],
                            'matched_requirements': match_result['matched_requirements'],
                            'partially_matched_requirements': match_result['partially_matched_requirements'],
                            'missing_requirements': match_result['missing_requirements'],
                            'declared_skills': match_result['declared_skills'],
                            'evidenced_skills': match_result['evidenced_skills'],
                            'verified_skills': match_result['verified_skills'],
                            'explanation': match_result['explanation'],
                            'constraints_analysis': match_result['constraints_analysis'],
                            'methodology_version': match_result['methodology_version']
                        }
                    )
                matches = JobMatch.objects.filter(user=request.user, job__verification_status='verified_active').order_by('-overall_score')

        serializer = JobMatchSerializer(matches, many=True)
        return Response(serializer.data)


class EvaluateJobMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        job_id = request.data.get('job_id')
        if not job_id:
            return Response({'error': 'job_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = JobPosting.objects.get(id=job_id)
        except JobPosting.DoesNotExist:
            return Response({'error': 'Job posting not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile, _ = CareerProfile.objects.get_or_create(user=request.user)
        latest_resume = ResumeDocument.objects.filter(user=request.user, parsing_status='parsed').first()
        resume_text = latest_resume.raw_text if latest_resume else ''

        profile_data = {
            'skills': profile.skills,
            'education': profile.education,
            'work_experience': profile.work_experience,
            'projects': profile.projects,
            'certifications': profile.certifications,
            'preferred_locations': profile.preferred_locations,
            'workplace_preference': profile.workplace_preference
        }

        # Run explainable match calculation
        match_result = evaluate_job_match(profile_data, resume_text, job)

        # Persist or update match record
        job_match, _ = JobMatch.objects.update_or_create(
            user=request.user,
            job=job,
            defaults={
                'overall_score': match_result['overall_score'],
                'matched_requirements': match_result['matched_requirements'],
                'partially_matched_requirements': match_result['partially_matched_requirements'],
                'missing_requirements': match_result['missing_requirements'],
                'declared_skills': match_result['declared_skills'],
                'evidenced_skills': match_result['evidenced_skills'],
                'verified_skills': match_result['verified_skills'],
                'explanation': match_result['explanation'],
                'constraints_analysis': match_result['constraints_analysis'],
                'methodology_version': match_result['methodology_version']
            }
        )

        return Response(JobMatchSerializer(job_match).data)


# ----------------------------------------------------------------------
# 6. AI Resume and Application Studio (Phase 8)
# ----------------------------------------------------------------------

class TailoredDocumentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        docs = TailoredDocument.objects.filter(user=request.user).order_by('-updated_at')
        serializer = TailoredDocumentSerializer(docs, many=True)
        return Response(serializer.data)


class GenerateTailoredResumeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        job_id = request.data.get('job_id')
        if not job_id:
            return Response({'error': 'job_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = JobPosting.objects.get(id=job_id)
        except JobPosting.DoesNotExist:
            return Response({'error': 'Job posting not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile, _ = CareerProfile.objects.get_or_create(user=request.user)
        latest_resume = ResumeDocument.objects.filter(user=request.user, parsing_status='parsed').first()
        resume_text = latest_resume.raw_text if latest_resume else ''

        result = ApplicationStudioService.generate_tailored_resume(profile, resume_text, job)

        doc = TailoredDocument.objects.create(
            user=request.user,
            job=job,
            document_type='tailored_resume',
            title=result['title'],
            target_role=result['target_role'],
            content=result['content'],
            structured_content=result['structured_content'],
            coverage_report=result['coverage_report'],
            unsupported_claims_review=result['unsupported_claims_review']
        )

        return Response(TailoredDocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


class GenerateCoverLetterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        job_id = request.data.get('job_id')
        if not job_id:
            return Response({'error': 'job_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = JobPosting.objects.get(id=job_id)
        except JobPosting.DoesNotExist:
            return Response({'error': 'Job posting not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile, _ = CareerProfile.objects.get_or_create(user=request.user)
        latest_resume = ResumeDocument.objects.filter(user=request.user, parsing_status='parsed').first()
        resume_text = latest_resume.raw_text if latest_resume else ''

        result = ApplicationStudioService.generate_cover_letter(profile, resume_text, job)

        doc = TailoredDocument.objects.create(
            user=request.user,
            job=job,
            document_type='cover_letter',
            title=result['title'],
            target_role=result['target_role'],
            content=result['content'],
            structured_content=result['structured_content'],
            coverage_report=result['coverage_report'],
            unsupported_claims_review=result['unsupported_claims_review']
        )

        return Response(TailoredDocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


class TailoredDocumentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            doc = TailoredDocument.objects.get(id=pk, user=request.user)
            return Response(TailoredDocumentSerializer(doc).data)
        except TailoredDocument.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            doc = TailoredDocument.objects.get(id=pk, user=request.user)
            content = request.data.get('content')
            title = request.data.get('title')
            if content is not None:
                doc.content = content
            if title is not None:
                doc.title = title
            doc.version += 1
            doc.save()
            return Response(TailoredDocumentSerializer(doc).data)
        except TailoredDocument.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            doc = TailoredDocument.objects.get(id=pk, user=request.user)
            doc.delete()
            return Response({'detail': 'Document deleted.'})
        except TailoredDocument.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)


# ----------------------------------------------------------------------
# 7. Interview Preparation (Phase 9)
# ----------------------------------------------------------------------

class InterviewSessionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sessions = InterviewSession.objects.filter(user=request.user).order_by('-created_at')
        serializer = InterviewSessionSerializer(sessions, many=True)
        return Response(serializer.data)


class GenerateInterviewPrepView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        job_id = request.data.get('job_id')
        if not job_id:
            return Response({'error': 'job_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = JobPosting.objects.get(id=job_id)
        except JobPosting.DoesNotExist:
            return Response({'error': 'Job posting not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile, _ = CareerProfile.objects.get_or_create(user=request.user)
        questions = InterviewPrepService.generate_questions(profile, job)

        session = InterviewSession.objects.create(
            user=request.user,
            job=job,
            role_title=job.title,
            company_name=job.company_name,
            questions=questions,
            user_answers={},
            feedback={}
        )

        return Response(InterviewSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class SubmitInterviewAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            session = InterviewSession.objects.get(id=pk, user=request.user)
        except InterviewSession.DoesNotExist:
            return Response({'error': 'Interview session not found.'}, status=status.HTTP_404_NOT_FOUND)

        question_id = request.data.get('question_id')
        user_answer = request.data.get('answer', '').strip()

        if not question_id or not user_answer:
            return Response({'error': 'Both question_id and answer are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Locate question in session
        matched_q = next((q for q in session.questions if q.get('id') == question_id), None)
        if not matched_q:
            return Response({'error': 'Question ID not found in session.'}, status=status.HTTP_400_BAD_REQUEST)

        # Evaluate answer
        feedback_result = InterviewPrepService.evaluate_answer(matched_q, user_answer)

        # Store answer and feedback in session
        session.user_answers[question_id] = user_answer
        session.feedback[question_id] = feedback_result
        session.save()

        return Response({
            'question_id': question_id,
            'feedback': feedback_result,
            'session': InterviewSessionSerializer(session).data
        })


# ----------------------------------------------------------------------
# 8. Application Tracker (Phase 10)
# ----------------------------------------------------------------------

class JobApplicationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        apps = JobApplication.objects.filter(user=request.user).order_by('-updated_at')
        serializer = JobApplicationSerializer(apps, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        job_id = request.data.get('job_id')
        company_name = request.data.get('company_name', '').strip()
        job_title = request.data.get('job_title', '').strip()
        location = request.data.get('location', '').strip()
        application_url = request.data.get('application_url', '').strip()
        status_val = request.data.get('status', 'interested')

        job = None
        if job_id:
            try:
                job = JobPosting.objects.get(id=job_id)
                company_name = company_name or job.company_name
                job_title = job_title or job.title
                location = location or job.location
                application_url = application_url or job.application_url
            except JobPosting.DoesNotExist:
                pass

        if not company_name or not job_title:
            return Response({'error': 'Company name and job title are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent duplicate applications for the same job
        if job and JobApplication.objects.filter(user=user, job=job).exists():
            existing = JobApplication.objects.get(user=user, job=job)
            return Response({
                'detail': 'Job is already tracked in your application pipeline.',
                'application': JobApplicationSerializer(existing).data
            }, status=status.HTTP_200_OK)

        initial_history = [{
            'timestamp': timezone.now().isoformat(),
            'action': f"Added to tracker with status '{status_val}'.",
            'notes': request.data.get('notes', '')
        }]

        app = JobApplication.objects.create(
            user=user,
            job=job,
            company_name=company_name,
            job_title=job_title,
            location=location,
            application_url=application_url,
            status=status_val,
            notes=request.data.get('notes', ''),
            history=initial_history
        )

        return Response(JobApplicationSerializer(app).data, status=status.HTTP_201_CREATED)


class JobApplicationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            app = JobApplication.objects.get(id=pk, user=request.user)
            return Response(JobApplicationSerializer(app).data)
        except JobApplication.DoesNotExist:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            app = JobApplication.objects.get(id=pk, user=request.user)
        except JobApplication.DoesNotExist:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

        old_status = app.status
        new_status = request.data.get('status', old_status)
        
        if new_status != old_status:
            app.status = new_status
            if not isinstance(app.history, list):
                app.history = []
            app.history.append({
                'timestamp': timezone.now().isoformat(),
                'action': f"Status changed from '{old_status}' to '{new_status}'.",
                'notes': request.data.get('notes', '')
            })

        if 'notes' in request.data:
            app.notes = request.data['notes']
        if 'applied_date' in request.data:
            app.applied_date = request.data['applied_date'] or None
        if 'interview_date' in request.data:
            app.interview_date = request.data['interview_date'] or None
        if 'salary_offered' in request.data:
            app.salary_offered = request.data['salary_offered']
        if 'tailored_resume_id' in request.data:
            app.tailored_resume_id = request.data['tailored_resume_id']
        if 'tailored_cover_letter_id' in request.data:
            app.tailored_cover_letter_id = request.data['tailored_cover_letter_id']

        app.save()
        return Response(JobApplicationSerializer(app).data)

    def delete(self, request, pk):
        try:
            app = JobApplication.objects.get(id=pk, user=request.user)
            app.delete()
            return Response({'detail': 'Application removed from tracker.'})
        except JobApplication.DoesNotExist:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)


# ----------------------------------------------------------------------
# 9. Company Intelligence & Individualised Career Roadmap Views
# ----------------------------------------------------------------------

from .models import (
    CareerRoadmap, RoadmapPhase, RoadmapTask,
    TaskLearningResource, TaskProjectRecommendation,
    SavedJob, SavedCompany
)
from .serializers import (
    CareerRoadmapSerializer, CareerRoadmapDetailSerializer,
    RoadmapTaskSerializer, SavedJobSerializer, SavedCompanySerializer
)
from .services.roadmap_engine import RoadmapEngine


class CareerRoadmapListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        roadmaps = CareerRoadmap.objects.filter(user=request.user).order_by('-updated_at')
        serializer = CareerRoadmapSerializer(roadmaps, many=True)
        return Response({
            'count': roadmaps.count(),
            'roadmaps': serializer.data
        })


class CareerRoadmapDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            roadmap = CareerRoadmap.objects.get(id=pk, user=request.user)
            serializer = CareerRoadmapDetailSerializer(roadmap)
            return Response(serializer.data)
        except CareerRoadmap.DoesNotExist:
            return Response({'error': 'Roadmap not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            roadmap = CareerRoadmap.objects.get(id=pk, user=request.user)
            roadmap.delete()
            return Response({'detail': 'Roadmap archived and removed.'})
        except CareerRoadmap.DoesNotExist:
            return Response({'error': 'Roadmap not found.'}, status=status.HTTP_404_NOT_FOUND)


class GenerateRoadmapView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        company_name = data.get('company_name', '').strip()
        target_role = data.get('target_role', '').strip()
        job_id = data.get('job_id')
        learning_preferences = data.get('learning_preferences', 'project-based')
        hours_per_week = int(data.get('hours_per_week', 10))

        if not target_role:
            return Response({'error': 'Target role is required to generate a personalized roadmap.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate individualised roadmap
        roadmap = RoadmapEngine.generate_roadmap(
            user=request.user,
            company_name=company_name or 'Industry Standard',
            target_role=target_role,
            job_id=job_id,
            learning_preferences=learning_preferences,
            hours_per_week=hours_per_week
        )

        serializer = CareerRoadmapDetailSerializer(roadmap)
        return Response({
            'detail': 'Career roadmap successfully generated.',
            'roadmap': serializer.data
        }, status=status.HTTP_201_CREATED)


class UpdateRoadmapTaskProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            task = RoadmapTask.objects.get(id=pk, phase__roadmap__user=request.user)
        except RoadmapTask.DoesNotExist:
            return Response({'error': 'Roadmap task not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status and new_status in ['todo', 'in_progress', 'completed']:
            task.status = new_status
            if new_status == 'completed':
                task.completed_at = timezone.now()
            else:
                task.completed_at = None

        if 'user_evidence' in request.data:
            task.user_evidence = request.data['user_evidence']

        task.save()
        serializer = RoadmapTaskSerializer(task)
        return Response({
            'detail': 'Task progress saved.',
            'task': serializer.data
        })


class SavedJobsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        saved = SavedJob.objects.filter(user=request.user).order_by('-created_at')
        serializer = SavedJobSerializer(saved, many=True, context={'request': request})
        return Response({
            'count': saved.count(),
            'saved_jobs': serializer.data
        })


class SavedCompaniesListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        saved = SavedCompany.objects.filter(user=request.user).order_by('-created_at')
        serializer = SavedCompanySerializer(saved, many=True, context={'request': request})
        return Response({
            'count': saved.count(),
            'saved_companies': serializer.data
        })


class MySkillsOverviewView(APIView):
    """
    Comprehensive skill readiness and evidence breakdown for the authenticated candidate.
    Categorizes declared skills, evidenced skills from projects/experience, and identifies gaps.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = CareerProfile.objects.get_or_create(user=user)

        user_skills = profile.skills or []
        normalized_skills = []
        for s in user_skills:
            if isinstance(s, dict) and s.get('name'):
                normalized_skills.append(s['name'])
            elif isinstance(s, str):
                normalized_skills.append(s)

        projects = profile.projects or []
        experience = profile.work_experience or []

        # Categorize
        demonstrated = []
        partially_evidenced = []
        declared_only = []

        for skill in normalized_skills:
            s_lower = skill.lower()
            in_proj = any(s_lower in str(p).lower() for p in projects)
            in_exp = any(s_lower in str(e).lower() for e in experience)

            if in_proj and in_exp:
                demonstrated.append(skill)
            elif in_proj or in_exp:
                partially_evidenced.append(skill)
            else:
                declared_only.append(skill)

        # Active roadmap target requirements
        active_roadmap = CareerRoadmap.objects.filter(user=user, status='active').order_by('-created_at').first()
        target_gaps = []
        if active_roadmap and active_roadmap.baseline_skills:
            target_gaps = active_roadmap.baseline_skills.get('learning_recommended', [])

        return Response({
            'total_skills_count': len(normalized_skills),
            'demonstrated_skills': demonstrated,
            'partially_evidenced_skills': partially_evidenced,
            'declared_only_skills': declared_only,
            'target_gaps': target_gaps,
            'active_roadmap_role': active_roadmap.target_role if active_roadmap else None,
            'active_roadmap_company': active_roadmap.company_name if active_roadmap else None,
            'active_readiness_score': active_roadmap.readiness_score if active_roadmap else None,
        })


# =====================================================================
# LEARNING HUB & CAREER READINESS TRACKER VIEWS
# =====================================================================

class LearningHubOverviewView(APIView):
    """
    Main overview payload for /learn.
    Accessible to all users; personalizes stats, continue learning,
    and completion history if the user is authenticated.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user if request.user.is_authenticated else None

        # 1. User Learning Statistics
        stats = {
            'paths_in_progress': 0,
            'lessons_completed': 0,
            'saved_resources_count': 0,
            'hours_learned': 0.0,
            'has_active_activity': False,
        }
        continue_learning = []
        completed_learning = []
        my_roadmaps = []

        if user:
            # Completed lessons
            completed_progress = UserLearningProgress.objects.filter(
                user=user,
                completion_status='completed'
            ).select_related('resource').order_by('-completed_at')
            stats['lessons_completed'] = completed_progress.count()

            for cp in completed_progress[:10]:
                completed_learning.append({
                    'id': str(cp.id),
                    'resource': LearningResourceSerializer(cp.resource, context={'request': request}).data,
                    'completed_at': cp.completed_at,
                    'tracking_method': cp.tracking_method,
                })

            # In-progress lessons (Continue Learning)
            in_progress = UserLearningProgress.objects.filter(
                user=user,
                completion_status='in_progress'
            ).select_related('resource').order_by('-last_watched_at')

            for p in in_progress[:6]:
                continue_learning.append({
                    'id': str(p.id),
                    'resource': LearningResourceSerializer(p.resource, context={'request': request}).data,
                    'current_position_seconds': p.current_position_seconds,
                    'total_duration_seconds': p.total_duration_seconds,
                    'completion_percentage': p.completion_percentage,
                    'last_watched_at': p.last_watched_at,
                })

            stats['saved_resources_count'] = SavedLearningResource.objects.filter(user=user).count()

            # Calculate total hours from actual progress
            total_seconds = sum(
                p.current_position_seconds for p in UserLearningProgress.objects.filter(user=user)
            )
            stats['hours_learned'] = round(total_seconds / 3600.0, 1)

            # User roadmaps with calculated completion percentage
            roadmaps = CareerRoadmap.objects.filter(user=user, status='active').order_by('-created_at')[:3]
            for r in roadmaps:
                total_tasks = RoadmapTask.objects.filter(phase__roadmap=r).count()
                completed_tasks = RoadmapTask.objects.filter(phase__roadmap=r, status='completed').count()
                pct = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0
                my_roadmaps.append({
                    'id': str(r.id),
                    'target_role': r.target_role,
                    'company_name': r.company_name,
                    'readiness_score': r.readiness_score,
                    'completed_tasks': completed_tasks,
                    'total_tasks': total_tasks,
                    'progress_percentage': pct,
                    'created_at': r.created_at,
                })

            # Paths with user progress
            all_paths = LearningPath.objects.prefetch_related('steps__resource').all()
            for lp in all_paths:
                total_s = lp.steps.count()
                if total_s > 0:
                    res_ids = lp.steps.values_list('resource_id', flat=True)
                    done_s = UserLearningProgress.objects.filter(
                        user=user, resource_id__in=res_ids, completion_status='completed'
                    ).count()
                    if done_s > 0 and done_s < total_s:
                        stats['paths_in_progress'] += 1

            stats['has_active_activity'] = (
                stats['lessons_completed'] > 0 or len(continue_learning) > 0 or stats['saved_resources_count'] > 0
            )

        # 2. Curated Learning Paths
        paths = LearningPath.objects.filter(is_featured=True).prefetch_related('steps__resource')
        serialized_paths = LearningPathSerializer(paths, many=True, context={'request': request}).data

        # 3. Categorized Authentic Resources
        base_qs = LearningResource.objects.filter(verification_status='verified_active')
        
        # YouTube Lessons
        yt_lessons = base_qs.filter(resource_type__in=['video', 'playlist']).order_by('-click_count', '-created_at')[:8]
        
        # Courses & Certifications
        courses = base_qs.filter(resource_type__in=['course', 'documentation', 'certification_guide']).order_by('-created_at')[:8]

        # Recommended (matched to target role if profile exists, else balanced top resources)
        target_role = None
        if user and hasattr(user, 'career_profile') and user.career_profile.preferred_job_titles:
            target_role = user.career_profile.preferred_job_titles[0]
        
        if target_role:
            recommended_qs = base_qs.filter(
                Q(target_roles__icontains=target_role) | Q(skills_covered__icontains=target_role)
            )[:6]
            if not recommended_qs.exists():
                recommended_qs = base_qs.order_by('-click_count')[:6]
        else:
            recommended_qs = base_qs.order_by('-click_count')[:6]

        return Response({
            'stats': stats,
            'continue_learning': continue_learning,
            'completed_learning': completed_learning,
            'my_roadmaps': my_roadmaps,
            'learning_paths': serialized_paths,
            'recommended': LearningResourceSerializer(recommended_qs, many=True, context={'request': request}).data,
            'youtube_lessons': LearningResourceSerializer(yt_lessons, many=True, context={'request': request}).data,
            'courses_and_certifications': LearningResourceSerializer(courses, many=True, context={'request': request}).data,
        })


class LearningResourceListView(generics.ListAPIView):
    """
    Search and filter verified learning resources.
    """
    serializer_class = LearningResourceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = LearningResource.objects.filter(
            verification_status__in=['verified_active', 'needs_verification']
        ).order_by('-created_at')

        # Text search
        query = self.request.query_params.get('q', '').strip()
        if query:
            qs = qs.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(provider__icontains=query) |
                Q(skills_covered__icontains=query) |
                Q(target_roles__icontains=query)
            )

        # Filters
        r_type = self.request.query_params.get('type')
        if r_type and r_type != 'all':
            qs = qs.filter(resource_type=r_type)

        difficulty = self.request.query_params.get('difficulty')
        if difficulty and difficulty != 'all':
            qs = qs.filter(difficulty=difficulty)

        pricing = self.request.query_params.get('pricing')
        if pricing and pricing != 'all':
            qs = qs.filter(pricing_classification=pricing)

        role = self.request.query_params.get('role')
        if role and role != 'all':
            qs = qs.filter(target_roles__icontains=role)

        skill = self.request.query_params.get('skill')
        if skill and skill != 'all':
            qs = qs.filter(skills_covered__icontains=skill)

        return qs


class LearningResourceDetailView(generics.RetrieveAPIView):
    queryset = LearningResource.objects.all()
    serializer_class = LearningResourceSerializer
    permission_classes = [permissions.AllowAny]


class UpdateLearningProgressView(APIView):
    """
    Save genuine playback or completion progress.
    Authenticated only. Enforces transparent completion rules (>= 90% or explicit).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        resource_id = request.data.get('resource_id')
        if not resource_id:
            return Response({'error': 'resource_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            resource = LearningResource.objects.get(id=resource_id)
        except LearningResource.DoesNotExist:
            return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)

        position_seconds = float(request.data.get('position_seconds', 0.0) or 0.0)
        duration_seconds = float(request.data.get('duration_seconds', 0.0) or resource.duration_seconds or 0.0)
        requested_status = request.data.get('status', 'in_progress')
        tracking_method = request.data.get('tracking_method', 'youtube_player_observed')
        path_id = request.data.get('path_id')

        # Clamp position
        if duration_seconds > 0:
            position_seconds = min(max(position_seconds, 0.0), duration_seconds)
            completion_percentage = min(max((position_seconds / duration_seconds) * 100.0, 0.0), 100.0)
        else:
            completion_percentage = 100.0 if requested_status == 'completed' else 0.0

        # Automatic 90% completion rule
        is_completed = False
        if requested_status == 'completed':
            is_completed = True
            completion_percentage = 100.0
        elif duration_seconds > 20 and position_seconds >= (0.90 * duration_seconds):
            is_completed = True
            completion_percentage = 100.0

        progress_record, created = UserLearningProgress.objects.get_or_create(
            user=user,
            resource=resource,
            defaults={
                'current_position_seconds': position_seconds,
                'total_duration_seconds': duration_seconds,
                'completion_percentage': completion_percentage,
                'completion_status': 'completed' if is_completed else 'in_progress',
                'tracking_method': tracking_method,
                'last_watched_at': timezone.now(),
                'completed_at': timezone.now() if is_completed else None,
            }
        )

        if not created:
            progress_record.current_position_seconds = max(position_seconds, progress_record.current_position_seconds if not is_completed else position_seconds)
            if duration_seconds > 0:
                progress_record.total_duration_seconds = duration_seconds
            progress_record.completion_percentage = max(completion_percentage, progress_record.completion_percentage)
            progress_record.last_watched_at = timezone.now()
            progress_record.tracking_method = tracking_method

            if is_completed:
                progress_record.completion_status = 'completed'
                if not progress_record.completed_at:
                    progress_record.completed_at = timezone.now()
            elif progress_record.completion_status != 'completed':
                progress_record.completion_status = 'in_progress'

            if path_id:
                try:
                    progress_record.path_id = path_id
                except Exception:
                    pass

            progress_record.save()

        return Response({
            'status': 'success',
            'progress': UserLearningProgressSerializer(progress_record).data,
            'is_completed': is_completed,
            'completion_percentage': round(progress_record.completion_percentage, 1),
        })


class ToggleSaveLearningResourceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            resource = LearningResource.objects.get(id=pk)
        except LearningResource.DoesNotExist:
            return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)

        saved = SavedLearningResource.objects.filter(user=request.user, resource=resource).first()
        if saved:
            saved.delete()
            return Response({'is_saved': False, 'message': 'Removed from saved learning resources.'})
        else:
            SavedLearningResource.objects.create(user=request.user, resource=resource)
            return Response({'is_saved': True, 'message': 'Saved to your learning list.'})


class LogResourceClickView(APIView):
    """
    Record verified outbound click and return safe external destination URL.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            resource = LearningResource.objects.get(id=pk)
        except LearningResource.DoesNotExist:
            return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)

        resource.click_count += 1
        resource.save(update_fields=['click_count'])

        user = request.user if request.user.is_authenticated else None
        ResourceClickLog.objects.create(
            user=user,
            resource=resource,
            destination_url=resource.external_url,
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
        )

        # If user is authenticated, mark resource as touched via link_visited
        if user:
            prog, _ = UserLearningProgress.objects.get_or_create(
                user=user,
                resource=resource,
                defaults={
                    'completion_status': 'in_progress',
                    'tracking_method': 'link_visited',
                    'last_watched_at': timezone.now(),
                    'completion_percentage': 25.0,
                }
            )
            if prog.completion_status == 'not_started':
                prog.completion_status = 'in_progress'
                prog.last_watched_at = timezone.now()
                prog.save()

        return Response({
            'destination_url': resource.external_url,
            'title': resource.title,
            'provider': resource.provider,
            'click_count': resource.click_count
        })


class LearningPathListView(generics.ListAPIView):
    queryset = LearningPath.objects.prefetch_related('steps__resource').all()
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.AllowAny]


class LearningPathDetailView(generics.RetrieveAPIView):
    queryset = LearningPath.objects.prefetch_related('steps__resource').all()
    serializer_class = LearningPathSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]


class AdminLearningResourceView(APIView):
    """
    Ingest a new verified learning resource via URL or YouTube URL.
    Restricted to staff/superusers or authenticated admins.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff and not getattr(request.user, 'is_admin', False):
            return Response({'error': 'Only authorized administrators can ingest learning resources.'}, status=status.HTTP_403_FORBIDDEN)

        url = request.data.get('url', '').strip()
        if not url:
            return Response({'error': 'URL is required.'}, status=status.HTTP_400_BAD_REQUEST)

        title = request.data.get('title', '').strip()
        provider = request.data.get('provider', '').strip()
        description = request.data.get('description', '').strip()
        skills = request.data.get('skills', [])
        target_roles = request.data.get('target_roles', [])
        difficulty = request.data.get('difficulty', 'Beginner')
        pricing = request.data.get('pricing', 'free')

        # Check YouTube
        video_id, playlist_id = extract_youtube_info(url)
        resource_type = 'video' if video_id else ('playlist' if playlist_id else request.data.get('resource_type', 'course'))
        thumbnail = get_youtube_thumbnail_url(video_id) if video_id else request.data.get('thumbnail_url', '')

        if not title:
            title = f"Lesson: {video_id}" if video_id else url.split('/')[-1].replace('-', ' ').title()
        if not provider:
            provider = 'YouTube' if video_id else (url.split('//')[1].split('/')[0] if '//' in url else 'Web')

        # Check link health
        verif_result = verify_external_url(url)

        slug = slugify(title)
        counter = 1
        original_slug = slug
        while LearningResource.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1

        resource = LearningResource.objects.create(
            title=title,
            slug=slug,
            description=description or f"Curated {resource_type} for technical career advancement.",
            provider=provider,
            resource_type=resource_type,
            external_url=url,
            youtube_video_id=video_id or '',
            youtube_playlist_id=playlist_id or '',
            skills_covered=skills if isinstance(skills, list) else [s.strip() for s in str(skills).split(',') if s.strip()],
            target_roles=target_roles if isinstance(target_roles, list) else [r.strip() for r in str(target_roles).split(',') if r.strip()],
            difficulty=difficulty,
            pricing_classification=pricing,
            verification_status=verif_result['status'],
            thumbnail_url=thumbnail,
        )

        return Response({
            'message': 'Resource ingested successfully.',
            'resource': LearningResourceSerializer(resource, context={'request': request}).data,
            'verification': verif_result
        }, status=status.HTTP_201_CREATED)


class AdminVerifyResourceView(APIView):
    """
    Run on-demand link verification check.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_staff and not getattr(request.user, 'is_admin', False):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            resource = LearningResource.objects.get(id=pk)
        except LearningResource.DoesNotExist:
            return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)

        verif_result = verify_external_url(resource.external_url)
        resource.verification_status = verif_result['status']
        resource.last_verified_at = timezone.now()
        resource.save(update_fields=['verification_status', 'last_verified_at'])

        return Response({
            'id': str(resource.id),
            'title': resource.title,
            'external_url': resource.external_url,
            'verification_status': resource.verification_status,
            'detail': verif_result['detail'],
            'status_code': verif_result['status_code']
        })



# ----------------------------------------------------------------------
# 11. Company Intelligence Recommendations & Resume Assistant
# ----------------------------------------------------------------------

class RecommendedCompaniesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = CareerProfile.objects.get_or_create(user=request.user)
        user_skills = set(profile.skills or [])
        companies = Company.objects.filter(verification_status='verified')[:25]
        recommendations = []

        for comp in companies:
            active_jobs = JobPosting.objects.filter(
                company_name=comp.company_name,
                verification_status='verified_active'
            )
            job_count = active_jobs.count()

            matched_skills = set()
            matching_job_titles = []
            for j in active_jobs:
                all_jskills = (j.required_skills or []) + (j.preferred_skills or [])
                overlap = [s for s in all_jskills if s in user_skills or any(s.lower() == u.lower() for u in user_skills)]
                if overlap:
                    matched_skills.update(overlap)
                    matching_job_titles.append(j.title)

            if job_count > 0 and matched_skills:
                reason = f"Actively hiring for {job_count} role(s) matching your verified skills in {', '.join(list(matched_skills)[:3])}."
                score = min(96, 60 + len(matched_skills) * 8 + job_count * 4)
            elif job_count > 0:
                reason = f"Actively hiring for {job_count} engineering vacancy(ies) in your domain."
                score = 65
            elif comp.industry:
                reason = f"Recognized employer in {comp.industry} aligning with your profile interests."
                score = 50
            else:
                reason = "Verified employer in technology systems and digital infrastructure."
                score = 45

            recommendations.append({
                'company_id': comp.id,
                'company_name': comp.company_name,
                'slug': comp.slug,
                'industry': comp.industry or 'Technology',
                'description': comp.description,
                'headquarters': comp.headquarters or 'India',
                'office_locations': comp.office_locations or comp.locations or [],
                'careers_url': comp.careers_url or comp.website,
                'logo_url': comp.logo_url,
                'active_jobs_count': job_count,
                'matching_active_roles': list(dict.fromkeys(matching_job_titles))[:3],
                'matched_skills': list(matched_skills)[:5],
                'recommendation_reason': reason,
                'recommendation_score': score,
                'is_saved': SavedCompany.objects.filter(user=request.user, company=comp).exists()
            })

        recommendations.sort(key=lambda x: x['recommendation_score'], reverse=True)
        return Response(recommendations)


class ResumeImprovementAssistantView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        target_role = request.data.get('target_role', 'Software Engineer')
        profile, _ = CareerProfile.objects.get_or_create(user=request.user)
        latest_resume = ResumeDocument.objects.filter(user=request.user, parsing_status='parsed').order_by('-updated_at').first()
        resume_text = latest_resume.raw_text if latest_resume else ''

        analysis = ApplicationStudioService.analyze_resume_improvements(profile, resume_text, target_role=target_role)
        return Response(analysis)


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.db import connection
        db_ok = True
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            db_ok = False

        jobs_count = JobPosting.objects.filter(verification_status='verified_active').count()
        learning_count = LearningResource.objects.filter(verification_status='verified_active').count()
        ai_configured = bool(os.getenv('GEMINI_API_KEY'))

        return Response({
            'status': 'healthy' if db_ok else 'degraded',
            'database': 'connected' if db_ok else 'unreachable',
            'ai_provider': 'configured' if ai_configured else 'deterministic_fallback_active',
            'verified_active_jobs': jobs_count,
            'verified_learning_resources': learning_count,
            'timestamp': timezone.now().isoformat(),
            'platform': 'TrustHire Career Intelligence Platform v2.0'
        })


# ----------------------------------------------------------------------
# 11. Skill Competence Assessments & Project Verification
# ----------------------------------------------------------------------

class SkillAssessmentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        skill_filter = request.query_params.get('skill')
        difficulty_filter = request.query_params.get('difficulty')
        qs = SkillAssessment.objects.filter(is_active=True)
        if skill_filter:
            qs = qs.filter(skill_name__iexact=skill_filter)
        if difficulty_filter:
            qs = qs.filter(difficulty__iexact=difficulty_filter)

        serializer = SkillAssessmentSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class SkillAssessmentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug):
        try:
            assessment = SkillAssessment.objects.get(slug=slug, is_active=True)
        except SkillAssessment.DoesNotExist:
            return Response({'error': 'Assessment not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = SkillAssessmentSerializer(assessment, context={'request': request})
        return Response(serializer.data)


class SubmitAssessmentAttemptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        try:
            assessment = SkillAssessment.objects.get(slug=slug, is_active=True)
        except SkillAssessment.DoesNotExist:
            return Response({'error': 'Assessment not found.'}, status=status.HTTP_404_NOT_FOUND)

        answers = request.data.get('answers', {})
        if not isinstance(answers, dict):
            return Response({'error': 'Answers must be a JSON object mapping question_id to answer.'}, status=status.HTTP_400_BAD_REQUEST)

        attempt = AssessmentEngine.evaluate_attempt(
            user=request.user,
            assessment=assessment,
            candidate_answers=answers
        )

        serializer = AssessmentAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectSubmissionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        submissions = ProjectSubmission.objects.filter(user=request.user)
        serializer = ProjectSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)

    def post(self, request):
        title = request.data.get('title')
        repo_url = request.data.get('repository_url')
        if not title or not repo_url:
            return Response({'error': 'title and repository_url are required.'}, status=status.HTTP_400_BAD_REQUEST)

        skills = request.data.get('skills_demonstrated', [])
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(',') if s.strip()]

        task_id = request.data.get('task_id')
        task = None
        if task_id:
            task = RoadmapTask.objects.filter(id=task_id).first()

        submission = ProjectSubmission.objects.create(
            user=request.user,
            task=task,
            title=title,
            skills_demonstrated=skills,
            repository_url=repo_url,
            live_demo_url=request.data.get('live_demo_url', ''),
            deliverables_summary=request.data.get('deliverables_summary', ''),
            verification_status='verified',
            verification_notes='Self-submitted verified practical evidence repository.'
        )

        # Update profile with project-supported skills
        profile, _ = CareerProfile.objects.get_or_create(user=request.user)
        current_skills = profile.skills or []
        for s in skills:
            if not any((item.get('name', '').lower() == s.lower() if isinstance(item, dict) else item.lower() == s.lower()) for item in current_skills):
                current_skills.append({
                    'name': s,
                    'verification_tier': 'project_supported',
                    'evidence': f"Demonstrated in project: {title} ({repo_url})",
                    'verified_at': timezone.now().isoformat()
                })
        profile.skills = current_skills
        profile.save()

        # If linked to roadmap task, complete it
        if task:
            task.status = 'completed'
            task.completed_at = timezone.now()
            task.user_evidence = f"Repository deliverable submitted: {repo_url}"
            task.save()

        serializer = ProjectSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class JobApplyClickLogView(APIView):
    """
    TrustHire Section 12: Direct application tracking.
    Records outbound application click event, validates destination URL,
    and seamlessly updates the candidate's application tracker.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            job = JobPosting.objects.get(id=pk)
        except JobPosting.DoesNotExist:
            return Response({'error': 'Job posting not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Log click telemetry
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        JobApplicationClickLog.objects.create(
            user=request.user,
            job=job,
            destination_url=job.application_url,
            user_agent=user_agent
        )

        # Update or create application tracker entry
        track_status = request.data.get('status', 'applied')
        app, created = JobApplication.objects.get_or_create(
            user=request.user,
            job=job,
            defaults={
                'company_name': job.company_name,
                'job_title': job.title,
                'location': job.location,
                'application_url': job.application_url,
                'status': track_status,
                'applied_date': timezone.now().date() if track_status == 'applied' else None
            }
        )
        if not created and track_status != app.status:
            app.status = track_status
            if track_status == 'applied' and not app.applied_date:
                app.applied_date = timezone.now().date()
            app.save()

        return Response({
            'message': 'Application click recorded successfully.',
            'application_url': job.application_url,
            'job_title': job.title,
            'company_name': job.company_name,
            'tracked_application_id': str(app.id),
            'status': app.status
        })
