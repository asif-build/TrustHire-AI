from rest_framework import serializers
from .models import Ranking
from candidates.serializers import CandidateSerializer
from jobs.serializers import JobSerializer

class RankingSerializer(serializers.ModelSerializer):
    candidate_detail = CandidateSerializer(source='candidate', read_only=True)
    job_detail = JobSerializer(source='job', read_only=True)

    class Meta:
        model = Ranking
        fields = [
            'id', 'candidate', 'candidate_detail', 'job', 'job_detail', 
            'semantic_score', 'skill_score', 'experience_score', 
            'trajectory_score', 'trust_score', 'overall_score', 'explanation', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
