from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsRecruiter
from .models import Recruiter
from .serializers import RecruiterSerializer
from jobs.models import Job
from candidates.models import Candidate
from rankings.models import Ranking

class RecruiterProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = RecruiterSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_object(self):
        recruiter, _ = Recruiter.objects.get_or_create(user=self.request.user)
        return recruiter

class RecruiterDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get(self, request):
        recruiter, _ = Recruiter.objects.get_or_create(user=request.user)
        
        # Calculate stats for the dashboard
        # 1. Total Jobs posted by this recruiter
        total_jobs = Job.objects.filter(recruiter=recruiter).count()

        # 2. Total Candidates registered in system
        total_candidates = Candidate.objects.count()

        # 3. Top Candidates (rankings across recruiter's jobs)
        top_rankings = Ranking.objects.filter(job__recruiter=recruiter).order_by('-overall_score')[:5]
        top_candidates = []
        for rank in top_rankings:
            top_candidates.append({
                "candidate_id": rank.candidate.id,
                "candidate_name": rank.candidate.user.full_name or rank.candidate.user.email,
                "job_title": rank.job.title,
                "overall_score": rank.overall_score,
                "trust_score": rank.trust_score,
                "experience_years": rank.candidate.experience_years
            })

        # 4. Average Trust Score of evaluated candidates
        all_rankings = Ranking.objects.filter(job__recruiter=recruiter)
        avg_trust_score = 0.0
        if all_rankings.exists():
            import numpy as np
            avg_trust_score = round(np.mean([r.trust_score for r in all_rankings]), 1)
        else:
            avg_trust_score = 75.0  # mock default

        # 5. Recent Applications
        recent_rankings = Ranking.objects.filter(job__recruiter=recruiter).order_by('-created_at')[:5]
        recent_applications = []
        for rank in recent_rankings:
            recent_applications.append({
                "job_id": rank.job.id,
                "job_title": rank.job.title,
                "candidate_name": rank.candidate.user.full_name or rank.candidate.user.email,
                "overall_score": rank.overall_score,
                "created_at": rank.created_at
            })

        return Response({
            "total_jobs": total_jobs,
            "total_candidates": total_candidates,
            "top_candidates": top_candidates,
            "average_trust_score": avg_trust_score,
            "recent_applications": recent_applications
        }, status=status.HTTP_200_OK)
