from rest_framework import status, exceptions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from services.ai_service import AIService
from candidates.models import Candidate
from jobs.models import Job
from resumes.models import ResumeAnalysis
from rankings.models import Ranking

class AIAnalyzeJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_text = request.data.get('job_text')
        if not job_text:
            return Response({"error": "job_text is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        result = AIService.analyze_job(job_text)
        return Response(result, status=status.HTTP_200_OK)

class AIAnalyzeResumeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        resume_text = request.data.get('resume_text')
        if not resume_text:
            return Response({"error": "resume_text is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        result = AIService.analyze_resume(resume_text)
        return Response(result, status=status.HTTP_200_OK)

class AIRankCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        candidate_id = request.data.get('candidate_id')
        job_id = request.data.get('job_id')
        if not candidate_id or not job_id:
            return Response({"error": "Both candidate_id and job_id are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        candidate = generics.get_object_or_404(Candidate, id=candidate_id) if hasattr(Candidate.objects, 'get') else Candidate.objects.get(id=candidate_id)
        job = Job.objects.get(id=job_id)
        
        # Get latest resume analysis
        resume_analysis = ResumeAnalysis.objects.filter(candidate=candidate).last()
        resume_data = {}
        if resume_analysis:
            resume_data = {
                "skills": resume_analysis.skills,
                "education": resume_analysis.education,
                "employment_history": resume_analysis.employment_history,
                "career_timeline": resume_analysis.career_timeline
            }
            
        job_analysis = getattr(job, 'analysis', None)
        job_data = {}
        if job_analysis:
            job_data = {
                "must_have_skills": job_analysis.must_have_skills,
                "nice_to_have_skills": job_analysis.nice_to_have_skills,
                "experience_required": job_analysis.experience_required
            }
        else:
            job_data = {
                "must_have_skills": ["Python", "Django"],
                "nice_to_have_skills": ["React"],
                "experience_required": job.experience_required
            }

        # Calculate scores using ranker
        rank_result = AIService.rank_candidate(resume_data, job_data)
        
        # Generate trust score
        trust_result = AIService.generate_trust_report(candidate, resume_data)
        trust_score = trust_result.get('trust_score', 75.0)

        # Generate trajectory score
        trajectory_result = AIService.evaluate_career_trajectory(resume_data)
        trajectory_score = trajectory_result.get('velocity_score', 75.0)

        overall_score = round(
            (rank_result.get('semantic_score', 70.0) * 0.35) +
            (rank_result.get('skill_score', 70.0) * 0.25) +
            (rank_result.get('experience_score', 70.0) * 0.15) +
            (trajectory_score * 0.15) +
            (trust_score * 0.10), 1
        )

        # Update or create Ranking
        ranking, created = Ranking.objects.update_or_create(
            candidate=candidate,
            job=job,
            defaults={
                "semantic_score": rank_result.get('semantic_score', 70.0),
                "skill_score": rank_result.get('skill_score', 70.0),
                "experience_score": rank_result.get('experience_score', 70.0),
                "trajectory_score": trajectory_score,
                "trust_score": trust_score,
                "overall_score": overall_score,
                "explanation": rank_result.get('explanation', '')
            }
        )

        from rankings.serializers import RankingSerializer
        return Response({
            "detail": "Candidate matched and ranked successfully.",
            "ranking": RankingSerializer(ranking).data
        }, status=status.HTTP_200_OK)

class AIGenerateTrustReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        candidate_id = request.data.get('candidate_id')
        if not candidate_id:
            return Response({"error": "candidate_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        candidate = Candidate.objects.get(id=candidate_id)
        latest_analysis = ResumeAnalysis.objects.filter(candidate=candidate).last()
        resume_data = {}
        if latest_analysis:
            resume_data = {
                "skills": latest_analysis.skills,
                "education": latest_analysis.education
            }
            
        result = AIService.generate_trust_report(candidate, resume_data)
        return Response(result, status=status.HTTP_200_OK)

class AICareerTrajectoryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        candidate_id = request.data.get('candidate_id')
        if not candidate_id:
            return Response({"error": "candidate_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        candidate = Candidate.objects.get(id=candidate_id)
        latest_analysis = ResumeAnalysis.objects.filter(candidate=candidate).last()
        resume_data = {}
        if latest_analysis:
            resume_data = {
                "skills": latest_analysis.skills,
                "education": latest_analysis.education,
                "employment_history": latest_analysis.employment_history,
                "career_timeline": latest_analysis.career_timeline
            }
            
        result = AIService.evaluate_career_trajectory(resume_data)
        return Response(result, status=status.HTTP_200_OK)

# Import helper
from django.shortcuts import get_object_or_404
from rest_framework import generics
