from rest_framework import generics, exceptions
from rest_framework.permissions import IsAuthenticated
from .models import Ranking
from .serializers import RankingSerializer
from utils.permissions import IsRecruiter, IsCandidate, IsAdminUser

class JobRankingsListView(generics.ListAPIView):
    serializer_class = RankingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        queryset = Ranking.objects.filter(job_id=job_id).order_by('-overall_score')

        # Access check: recruiters can view rankings for their own jobs; admins can view all.
        user = self.request.user
        if user.role == 'recruiter':
            recruiter = getattr(user, 'recruiter_profile', None)
            if not recruiter:
                raise exceptions.PermissionDenied("No recruiter profile associated with this account.")
            # Check if this job belongs to the recruiter
            if queryset.exists() and queryset.first().job.recruiter != recruiter:
                raise exceptions.PermissionDenied("You do not have permission to view rankings for this job.")
        elif user.role == 'candidate':
            raise exceptions.PermissionDenied("Candidates are not permitted to view candidate lists for jobs.")

        return queryset

class CandidateRankingsListView(generics.ListAPIView):
    serializer_class = RankingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        candidate_id = self.kwargs.get('candidate_id')
        queryset = Ranking.objects.filter(candidate_id=candidate_id).order_by('-overall_score')

        # Access check: candidates can view their own rankings; recruiters/admins can view any.
        user = self.request.user
        if user.role == 'candidate':
            candidate = getattr(user, 'candidate_profile', None)
            if not candidate or str(candidate.id) != str(candidate_id):
                # Check uuid or pk string matching
                raise exceptions.PermissionDenied("You do not have permission to view other candidates' rankings.")

        return queryset
