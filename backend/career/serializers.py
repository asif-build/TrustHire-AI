from rest_framework import serializers
from .models import (
    CareerProfile, ResumeDocument, JobSource, JobPosting,
    JobMatch, TailoredDocument, InterviewSession, JobApplication,
    CareerRoadmap, RoadmapPhase, RoadmapTask,
    TaskLearningResource, TaskProjectRecommendation,
    SavedJob, SavedCompany,
    LearningResource, LearningPath, LearningPathStep,
    UserLearningProgress, SavedLearningResource,
    SkillAssessment, AssessmentAttempt, ProjectSubmission, JobApplicationClickLog
)

class CareerProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = CareerProfile
        fields = [
            'id', 'user_email', 'full_name', 'headline', 'summary',
            'education', 'work_experience', 'projects', 'skills',
            'certifications', 'languages', 'career_interests',
            'preferred_job_titles', 'preferred_locations',
            'workplace_preference', 'employment_type_preference',
            'experience_level', 'salary_preference_min', 'salary_preference_max',
            'salary_currency', 'is_confirmed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_email', 'full_name', 'created_at', 'updated_at']


class ResumeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeDocument
        fields = [
            'id', 'file_name', 'file_type', 'file_size',
            'parsing_status', 'parsing_error', 'extracted_data',
            'is_primary', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class JobPostingSerializer(serializers.ModelSerializer):
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = [
            'id', 'source_name', 'external_id', 'company_name',
            'title', 'description', 'location', 'workplace_type',
            'employment_type', 'experience_level', 'required_skills',
            'preferred_skills', 'salary_min', 'salary_max',
            'salary_currency', 'salary_text', 'application_url',
            'posted_at', 'last_verified_at', 'verification_status',
            'created_at', 'is_saved'
        ]

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saved_by_users.filter(user=request.user).exists()
        return False


class JobMatchSerializer(serializers.ModelSerializer):
    job = JobPostingSerializer(read_only=True)

    class Meta:
        model = JobMatch
        fields = [
            'id', 'job', 'overall_score', 'matched_requirements',
            'partially_matched_requirements', 'missing_requirements',
            'declared_skills', 'evidenced_skills', 'verified_skills',
            'explanation', 'constraints_analysis', 'methodology_version',
            'created_at', 'updated_at'
        ]


class TailoredDocumentSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company_name', read_only=True)

    class Meta:
        model = TailoredDocument
        fields = [
            'id', 'job', 'job_title', 'company_name', 'document_type',
            'title', 'target_role', 'content', 'structured_content',
            'coverage_report', 'unsupported_claims_review', 'version',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InterviewSessionSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = InterviewSession
        fields = [
            'id', 'job', 'job_title', 'role_title', 'company_name',
            'questions', 'user_answers', 'feedback', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class JobApplicationSerializer(serializers.ModelSerializer):
    job_details = JobPostingSerializer(source='job', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_details', 'company_name', 'job_title',
            'location', 'application_url', 'status', 'applied_date',
            'interview_date', 'salary_offered', 'notes',
            'tailored_resume', 'tailored_cover_letter', 'history',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ---------------------------------------------------------------------------
# ROADMAP & SAVED SERIALIZERS
# ---------------------------------------------------------------------------

class TaskLearningResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskLearningResource
        fields = [
            'id', 'title', 'provider', 'url', 'associated_skill',
            'difficulty_level', 'is_free', 'is_official_documentation', 'verified_date'
        ]


class TaskProjectRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskProjectRecommendation
        fields = [
            'id', 'title', 'objective', 'why_relevant', 'skills_demonstrated',
            'implementation_milestones', 'deliverables', 'evaluation_criteria',
            'extension_ideas', 'verified_repo_url', 'is_open_source_reference'
        ]


class RoadmapTaskSerializer(serializers.ModelSerializer):
    learning_resources = TaskLearningResourceSerializer(many=True, read_only=True)
    project_recommendations = TaskProjectRecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = RoadmapTask
        fields = [
            'id', 'title', 'explanation', 'why_it_matters', 'related_requirement',
            'status', 'priority', 'estimated_effort', 'prerequisites',
            'completion_criteria', 'evidence_guide', 'user_evidence',
            'order', 'completed_at', 'created_at', 'updated_at',
            'learning_resources', 'project_recommendations'
        ]


class RoadmapPhaseSerializer(serializers.ModelSerializer):
    tasks = RoadmapTaskSerializer(many=True, read_only=True)
    total_tasks = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()

    class Meta:
        model = RoadmapPhase
        fields = [
            'id', 'phase_number', 'title', 'description', 'estimated_weeks',
            'order', 'tasks', 'total_tasks', 'completed_tasks'
        ]

    def get_total_tasks(self, obj):
        return obj.tasks.count()

    def get_completed_tasks(self, obj):
        return obj.tasks.filter(status='completed').count()


class CareerRoadmapSerializer(serializers.ModelSerializer):
    total_tasks_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = CareerRoadmap
        fields = [
            'id', 'company_name', 'target_role', 'job', 'readiness_score',
            'readiness_summary', 'baseline_skills', 'target_requirements',
            'skill_gap_analysis', 'methodology_disclaimer', 'status',
            'created_at', 'updated_at', 'total_tasks_count',
            'completed_tasks_count', 'progress_percentage'
        ]

    def get_total_tasks_count(self, obj):
        return RoadmapTask.objects.filter(phase__roadmap=obj).count()

    def get_completed_tasks_count(self, obj):
        return RoadmapTask.objects.filter(phase__roadmap=obj, status='completed').count()

    def get_progress_percentage(self, obj):
        total = self.get_total_tasks_count(obj)
        if total == 0:
            return 0.0
        completed = self.get_completed_tasks_count(obj)
        return round((completed / total) * 100, 1)


class CareerRoadmapDetailSerializer(CareerRoadmapSerializer):
    phases = RoadmapPhaseSerializer(many=True, read_only=True)

    class Meta(CareerRoadmapSerializer.Meta):
        fields = CareerRoadmapSerializer.Meta.fields + ['phases']


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobPostingSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'notes', 'created_at']


class SavedCompanySerializer(serializers.ModelSerializer):
    company = serializers.SerializerMethodField()

    class Meta:
        model = SavedCompany
        fields = ['id', 'company', 'notes', 'created_at']

    def get_company(self, obj):
        from companies.serializers import CompanySerializer
        return CompanySerializer(obj.company, context=self.context).data


# =====================================================================
# LEARNING PLATFORM SERIALIZERS
# =====================================================================

class UserLearningProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLearningProgress
        fields = [
            'id', 'current_position_seconds', 'total_duration_seconds',
            'completion_percentage', 'completion_status',
            'last_watched_at', 'completed_at', 'tracking_method'
        ]


class LearningResourceSerializer(serializers.ModelSerializer):
    user_progress = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = LearningResource
        fields = [
            'id', 'title', 'slug', 'description', 'provider',
            'resource_type', 'external_url', 'youtube_video_id',
            'youtube_playlist_id', 'skills_covered', 'target_roles',
            'difficulty', 'estimated_duration', 'duration_seconds',
            'pricing_classification', 'is_official_documentation',
            'certification_available', 'verification_status',
            'last_verified_at', 'thumbnail_url', 'click_count',
            'user_progress', 'is_saved', 'created_at'
        ]

    def get_user_progress(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return None
        progress = UserLearningProgress.objects.filter(user=request.user, resource=obj).first()
        if progress:
            return UserLearningProgressSerializer(progress).data
        return None

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return SavedLearningResource.objects.filter(user=request.user, resource=obj).exists()


class LearningPathStepSerializer(serializers.ModelSerializer):
    resource = LearningResourceSerializer(read_only=True)

    class Meta:
        model = LearningPathStep
        fields = [
            'id', 'step_number', 'phase_category', 'learning_objective',
            'order', 'resource'
        ]


class LearningPathSerializer(serializers.ModelSerializer):
    steps = LearningPathStepSerializer(many=True, read_only=True)
    total_steps = serializers.SerializerMethodField()
    completed_steps = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = LearningPath
        fields = [
            'id', 'title', 'slug', 'description', 'target_role',
            'target_industry', 'difficulty', 'estimated_weeks',
            'is_featured', 'total_steps', 'completed_steps',
            'progress_percentage', 'steps', 'created_at'
        ]

    def get_total_steps(self, obj):
        return obj.steps.count()

    def get_completed_steps(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return 0
        step_resource_ids = obj.steps.values_list('resource_id', flat=True)
        return UserLearningProgress.objects.filter(
            user=request.user,
            resource_id__in=step_resource_ids,
            completion_status='completed'
        ).count()

    def get_progress_percentage(self, obj):
        total = self.get_total_steps(obj)
        if total == 0:
            return 0.0
        completed = self.get_completed_steps(obj)
        return round((completed / total) * 100, 1)


class SavedLearningResourceSerializer(serializers.ModelSerializer):
    resource = LearningResourceSerializer(read_only=True)

    class Meta:
        model = SavedLearningResource
        fields = ['id', 'resource', 'notes', 'created_at']


class SkillAssessmentSerializer(serializers.ModelSerializer):
    user_attempt = serializers.SerializerMethodField()
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = SkillAssessment
        fields = [
            'id', 'title', 'slug', 'skill_name', 'assessment_type',
            'difficulty', 'time_limit_minutes', 'passing_score',
            'description', 'questions', 'evaluation_rubric',
            'version', 'is_active', 'question_count', 'user_attempt',
            'created_at'
        ]

    def get_question_count(self, obj):
        return len(obj.questions or [])

    def get_user_attempt(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return None
        latest = obj.attempts.filter(user=request.user).order_by('-completed_at').first()
        if latest:
            return {
                'id': str(latest.id),
                'score': latest.score,
                'passed': latest.passed,
                'completed_at': latest.completed_at
            }
        return None

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # If candidate request, sanitize questions so 'correct_answer' is not exposed
        request = self.context.get('request')
        is_staff = request and request.user and request.user.is_staff
        if not is_staff and 'questions' in ret and isinstance(ret['questions'], list):
            sanitized = []
            for q in ret['questions']:
                if isinstance(q, dict):
                    q_copy = dict(q)
                    q_copy.pop('correct_answer', None)
                    q_copy.pop('correct_option_index', None)
                    q_copy.pop('rubric_key', None)
                    sanitized.append(q_copy)
                else:
                    sanitized.append(q)
            ret['questions'] = sanitized
        return ret


class AssessmentAttemptSerializer(serializers.ModelSerializer):
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)
    skill_name = serializers.CharField(source='assessment.skill_name', read_only=True)

    class Meta:
        model = AssessmentAttempt
        fields = [
            'id', 'assessment', 'assessment_title', 'skill_name',
            'answers', 'score', 'passed', 'feedback', 'completed_at'
        ]
        read_only_fields = ['id', 'score', 'passed', 'feedback', 'completed_at']


class ProjectSubmissionSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ProjectSubmission
        fields = [
            'id', 'user_email', 'task', 'title', 'skills_demonstrated',
            'repository_url', 'live_demo_url', 'deliverables_summary',
            'verification_status', 'verification_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_email', 'created_at', 'updated_at']


class JobApplicationClickLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplicationClickLog
        fields = ['id', 'job', 'destination_url', 'clicked_at', 'user_agent']
        read_only_fields = ['id', 'clicked_at']


