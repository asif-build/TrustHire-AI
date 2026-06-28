from django.db import models
from candidates.models import Candidate
from jobs.models import Job

class Ranking(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='rankings')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='rankings')
    
    semantic_score = models.FloatField(default=0.0)
    skill_score = models.FloatField(default=0.0)
    experience_score = models.FloatField(default=0.0)
    trajectory_score = models.FloatField(default=0.0)
    trust_score = models.FloatField(default=0.0)
    overall_score = models.FloatField(default=0.0)
    explanation = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('candidate', 'job')
        ordering = ['-overall_score']

    def __str__(self):
        return f"Rank for {self.job.title}: {self.candidate.user.email} - {self.overall_score}%"
