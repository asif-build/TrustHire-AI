import uuid
from django.db import models
from django.conf import settings

class CareerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='career_profile')
    headline = models.CharField(max_length=255, blank=True, default='')
    summary = models.TextField(blank=True, default='')
    
    # Structured Career Data
    education = models.JSONField(default=list, blank=True)
    work_experience = models.JSONField(default=list, blank=True)
    projects = models.JSONField(default=list, blank=True)
    skills = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    languages = models.JSONField(default=list, blank=True)
    career_interests = models.JSONField(default=list, blank=True)
    
    # Job Preferences
    preferred_job_titles = models.JSONField(default=list, blank=True)
    preferred_locations = models.JSONField(default=list, blank=True)
    workplace_preference = models.CharField(
        max_length=50,
        choices=(
            ('remote', 'Remote'),
            ('hybrid', 'Hybrid'),
            ('onsite', 'On-site'),
            ('any', 'Flexible / Any'),
        ),
        default='any'
    )
    employment_type_preference = models.CharField(
        max_length=50,
        choices=(
            ('full-time', 'Full-time'),
            ('contract', 'Contract'),
            ('part-time', 'Part-time'),
            ('internship', 'Internship'),
            ('any', 'Any'),
        ),
        default='full-time'
    )
    experience_level = models.CharField(
        max_length=50,
        choices=(
            ('entry', 'Entry Level (0-2 YOE)'),
            ('mid', 'Mid Level (2-5 YOE)'),
            ('senior', 'Senior (5-8 YOE)'),
            ('lead', 'Lead / Staff (8+ YOE)'),
        ),
        default='mid'
    )
    salary_preference_min = models.FloatField(null=True, blank=True)
    salary_preference_max = models.FloatField(null=True, blank=True)
    salary_currency = models.CharField(max_length=10, default='USD')
    
    # Avatar & Identity Persona
    avatar_type = models.CharField(
        max_length=20,
        choices=(
            ('illustrated', 'Illustrated'),
            ('uploaded', 'Uploaded'),
        ),
        default='illustrated'
    )
    avatar_id = models.CharField(max_length=50, default='avatar-01', blank=True)
    custom_avatar_url = models.TextField(blank=True, default='')

    # Authoritative Confirmation flag
    is_confirmed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Career Profile: {self.user.email} ({self.headline or 'Candidate'})"


class ResumeDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='career_resumes')
    file = models.FileField(upload_to='career_resumes/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20)  # 'pdf', 'docx'
    file_size = models.IntegerField(default=0)
    raw_text = models.TextField(blank=True, default='')
    extracted_data = models.JSONField(default=dict, blank=True)
    parsing_status = models.CharField(
        max_length=30,
        choices=(
            ('pending', 'Pending Parsing'),
            ('parsed', 'Successfully Parsed'),
            ('failed', 'Parsing Failed'),
            ('ocr_required', 'Scanned Document (OCR Required)'),
        ),
        default='pending'
    )
    parsing_error = models.TextField(blank=True, default='')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"ResumeDocument: {self.file_name} ({self.user.email})"


class JobSource(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    source_type = models.CharField(
        max_length=50,
        choices=(
            ('greenhouse', 'Greenhouse Job Board'),
            ('lever', 'Lever Postings API'),
            ('custom', 'Permitted Employer Feed'),
        ),
        default='greenhouse'
    )
    board_token = models.CharField(max_length=100, blank=True, default='')
    endpoint_url = models.CharField(max_length=500, blank=True, default='')
    is_active = models.BooleanField(default=True)
    last_sync_at = models.DateTimeField(null=True, blank=True)
    sync_status = models.CharField(max_length=50, default='idle')
    sync_error = models.TextField(blank=True, default='')
    total_jobs_fetched = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"JobSource: {self.name} ({self.source_type} - {self.board_token or self.slug})"


class JobPosting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source = models.ForeignKey(JobSource, on_delete=models.SET_NULL, null=True, blank=True, related_name='postings')
    company = models.ForeignKey('companies.Company', on_delete=models.SET_NULL, null=True, blank=True, related_name='career_job_postings')
    source_name = models.CharField(max_length=100, default='trusthire', db_index=True)
    external_id = models.CharField(max_length=255, db_index=True)
    company_name = models.CharField(max_length=255, db_index=True)
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True, default='', db_index=True)
    workplace_type = models.CharField(
        max_length=50,
        choices=(
            ('remote', 'Remote'),
            ('hybrid', 'Hybrid'),
            ('onsite', 'On-site'),
            ('unspecified', 'Unspecified'),
        ),
        default='unspecified',
        db_index=True
    )
    employment_type = models.CharField(max_length=50, default='Full-time')
    experience_level = models.CharField(max_length=50, default='Mid')
    
    required_skills = models.JSONField(default=list, blank=True)
    preferred_skills = models.JSONField(default=list, blank=True)
    
    salary_min = models.FloatField(null=True, blank=True)
    salary_max = models.FloatField(null=True, blank=True)
    salary_currency = models.CharField(max_length=10, default='USD')
    salary_text = models.CharField(max_length=100, blank=True, default='')
    
    application_url = models.URLField(max_length=1000)
    posted_at = models.DateTimeField(null=True, blank=True)
    last_verified_at = models.DateTimeField(auto_now=True, db_index=True)
    verification_status = models.CharField(
        max_length=50,
        choices=(
            ('verified_active', 'Verified Active Listing'),
            ('unverified', 'Unverified Listing'),
            ('closed', 'Closed / Inactive Listing'),
        ),
        default='verified_active'
    )
    raw_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('source_name', 'external_id')
        ordering = ['-posted_at', '-created_at']

    def __str__(self):
        return f"{self.title} at {self.company_name} [{self.source_name}]"


class JobMatch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_matches')
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='candidate_matches')
    overall_score = models.FloatField(default=0.0)  # 0 to 100
    
    # Requirement-by-requirement breakdown
    matched_requirements = models.JSONField(default=list, blank=True)
    partially_matched_requirements = models.JSONField(default=list, blank=True)
    missing_requirements = models.JSONField(default=list, blank=True)
    
    # Verification classification: declared vs evidenced vs independently verified
    declared_skills = models.JSONField(default=list, blank=True)
    evidenced_skills = models.JSONField(default=list, blank=True)
    verified_skills = models.JSONField(default=list, blank=True)
    
    explanation = models.TextField(blank=True, default='')
    constraints_analysis = models.JSONField(default=dict, blank=True)
    methodology_version = models.CharField(max_length=50, default='v1.2-explainable')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'job')
        ordering = ['-overall_score']

    def __str__(self):
        return f"Match: {self.user.email} -> {self.job.title} ({self.overall_score}%)"


class TailoredDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tailored_documents')
    job = models.ForeignKey(JobPosting, on_delete=models.SET_NULL, null=True, blank=True, related_name='tailored_docs')
    document_type = models.CharField(
        max_length=50,
        choices=(
            ('tailored_resume', 'Tailored Resume'),
            ('cover_letter', 'Tailored Cover Letter'),
            ('improvement_plan', 'Skill Improvement Plan'),
        ),
        default='tailored_resume'
    )
    title = models.CharField(max_length=255)
    target_role = models.CharField(max_length=255, blank=True, default='')
    content = models.TextField()  # Markdown / Text
    structured_content = models.JSONField(default=dict, blank=True)
    coverage_report = models.JSONField(default=dict, blank=True)
    unsupported_claims_review = models.JSONField(default=list, blank=True)  # Hallucination audit
    version = models.IntegerField(default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_document_type_display()}: {self.title} for {self.user.email}"


class InterviewSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interview_sessions')
    job = models.ForeignKey(JobPosting, on_delete=models.SET_NULL, null=True, blank=True, related_name='interview_prep_sessions')
    role_title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    
    # Grounded questions: technical, role-specific, behavioral, project-based
    questions = models.JSONField(default=list, blank=True)
    user_answers = models.JSONField(default=dict, blank=True)
    feedback = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=30,
        choices=(
            ('active', 'Active Session'),
            ('completed', 'Completed'),
        ),
        default='active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Interview Prep: {self.role_title} @ {self.company_name} ({self.user.email})"


class JobApplication(models.Model):
    STATUS_CHOICES = (
        ('interested', 'Interested'),
        ('preparing', 'Preparing Application'),
        ('applied', 'Applied'),
        ('assessment', 'Online Assessment'),
        ('interview', 'Interviewing'),
        ('offer', 'Offer Received'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tracked_applications')
    job = models.ForeignKey(JobPosting, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    
    company_name = models.CharField(max_length=255)
    job_title = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, default='')
    application_url = models.URLField(max_length=1000, blank=True, default='')
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='interested', db_index=True)
    applied_date = models.DateField(null=True, blank=True)
    interview_date = models.DateTimeField(null=True, blank=True)
    salary_offered = models.CharField(max_length=100, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    
    tailored_resume = models.ForeignKey(TailoredDocument, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    tailored_cover_letter = models.ForeignKey(TailoredDocument, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    
    history = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"App: {self.job_title} at {self.company_name} ({self.status}) for {self.user.email}"


# =====================================================================
# COMPANY INTELLIGENCE & INDIVIDUALISED CAREER ROADMAP MODELS
# =====================================================================

class CareerRoadmap(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active Roadmap'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='career_roadmaps')
    company = models.ForeignKey('companies.Company', on_delete=models.SET_NULL, null=True, blank=True, related_name='roadmaps')
    company_name = models.CharField(max_length=255, db_index=True)
    target_role = models.CharField(max_length=255, db_index=True)
    job = models.ForeignKey(JobPosting, on_delete=models.SET_NULL, null=True, blank=True, related_name='roadmaps')
    
    # Explainable Readiness Score & Gap Breakdown
    readiness_score = models.FloatField(default=0.0)  # 0 to 100
    readiness_summary = models.TextField(blank=True, default='')
    baseline_skills = models.JSONField(default=list, blank=True)
    target_requirements = models.JSONField(default=list, blank=True)
    skill_gap_analysis = models.JSONField(default=dict, blank=True)
    methodology_disclaimer = models.TextField(
        default="Readiness score is an explainable estimation comparing verified profile evidence against published role requirements. It is not an employer hiring decision.",
        blank=True
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='active', db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Roadmap: {self.target_role} @ {self.company_name} for {self.user.email}"


class RoadmapPhase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roadmap = models.ForeignKey(CareerRoadmap, on_delete=models.CASCADE, related_name='phases')
    phase_number = models.IntegerField(default=1)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    estimated_weeks = models.IntegerField(default=2)
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order', 'phase_number']

    def __str__(self):
        return f"Phase {self.phase_number}: {self.title} ({self.roadmap.target_role})"


class RoadmapTask(models.Model):
    STATUS_CHOICES = (
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )
    PRIORITY_CHOICES = (
        ('high', 'High Priority'),
        ('medium', 'Medium Priority'),
        ('low', 'Low Priority'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phase = models.ForeignKey(RoadmapPhase, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    explanation = models.TextField()
    why_it_matters = models.TextField()
    related_requirement = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='todo', db_index=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    estimated_effort = models.CharField(max_length=100, default='6–10 hours (estimated)')
    prerequisites = models.JSONField(default=list, blank=True)
    completion_criteria = models.TextField(blank=True, default='')
    evidence_guide = models.TextField(blank=True, default='')
    user_evidence = models.TextField(blank=True, default='')
    order = models.IntegerField(default=1)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Task: {self.title} [{self.status}]"


class TaskLearningResource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(RoadmapTask, on_delete=models.CASCADE, related_name='learning_resources')
    title = models.CharField(max_length=255)
    provider = models.CharField(max_length=150)
    url = models.URLField(max_length=500)
    associated_skill = models.CharField(max_length=100)
    difficulty_level = models.CharField(max_length=50, default='Intermediate')
    is_free = models.BooleanField(default=True)
    is_official_documentation = models.BooleanField(default=False)
    verified_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Resource: {self.title} ({self.provider})"


class TaskProjectRecommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(RoadmapTask, on_delete=models.CASCADE, related_name='project_recommendations')
    title = models.CharField(max_length=255)
    objective = models.TextField()
    why_relevant = models.TextField()
    skills_demonstrated = models.JSONField(default=list, blank=True)
    implementation_milestones = models.JSONField(default=list, blank=True)
    deliverables = models.JSONField(default=list, blank=True)
    evaluation_criteria = models.TextField(blank=True, default='')
    extension_ideas = models.JSONField(default=list, blank=True)
    verified_repo_url = models.URLField(max_length=500, blank=True, default='')
    is_open_source_reference = models.BooleanField(default=False)

    def __str__(self):
        return f"Project: {self.title}"


class SavedJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='saved_by_users')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'job')
        ordering = ['-created_at']

    def __str__(self):
        return f"Saved: {self.job.title} for {self.user.email}"


class SavedCompany(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_companies')
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='saved_by_users')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'company')
        ordering = ['-created_at']

    def __str__(self):
        return f"Saved Company: {self.company.company_name} for {self.user.email}"


# =====================================================================
# LEARNING HUB & CAREER READINESS TRACKER MODELS
# =====================================================================

class LearningResource(models.Model):
    TYPE_CHOICES = (
        ('video', 'YouTube Video'),
        ('playlist', 'YouTube Playlist'),
        ('course', 'Interactive Course'),
        ('documentation', 'Official Documentation'),
        ('project', 'Hands-on Project Guide'),
        ('certification_guide', 'Certification Preparation'),
    )
    DIFFICULTY_CHOICES = (
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    )
    PRICING_CHOICES = (
        ('free', '100% Free'),
        ('free_with_paid_cert', 'Free Content (Optional Paid Certificate)'),
        ('paid', 'Paid'),
        ('unknown', 'Unknown / Unverified Pricing'),
    )
    VERIFICATION_STATUS_CHOICES = (
        ('verified_active', 'Verified Active'),
        ('needs_verification', 'Needs Verification'),
        ('temporarily_unavailable', 'Temporarily Unavailable'),
        ('removed_by_provider', 'Removed / Inaccessible'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    provider = models.CharField(max_length=150, db_index=True)  # e.g. FreeCodeCamp, MDN Web Docs, AWS
    resource_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='video', db_index=True)
    
    # Genuine destination & Video Identifiers
    external_url = models.URLField(max_length=1000)
    youtube_video_id = models.CharField(max_length=50, blank=True, default='', db_index=True)
    youtube_playlist_id = models.CharField(max_length=100, blank=True, default='')
    
    # Skills & Target Roles taxonomy
    skills_covered = models.JSONField(default=list, blank=True)
    target_roles = models.JSONField(default=list, blank=True)
    
    difficulty = models.CharField(max_length=50, choices=DIFFICULTY_CHOICES, default='Beginner')
    estimated_duration = models.CharField(max_length=100, default='1 hour')
    duration_seconds = models.FloatField(default=0.0)  # Total seconds for progress calculation
    
    pricing_classification = models.CharField(max_length=50, choices=PRICING_CHOICES, default='free')
    is_official_documentation = models.BooleanField(default=False)
    certification_available = models.BooleanField(default=False)
    
    verification_status = models.CharField(
        max_length=50,
        choices=VERIFICATION_STATUS_CHOICES,
        default='verified_active',
        db_index=True
    )
    last_verified_at = models.DateTimeField(auto_now=True)
    thumbnail_url = models.URLField(max_length=1000, blank=True, default='')
    click_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.provider}) [{self.get_resource_type_display()}]"


class LearningPath(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    target_role = models.CharField(max_length=150, db_index=True)
    target_industry = models.CharField(max_length=100, default='Technology')
    difficulty = models.CharField(max_length=50, default='Beginner to Advanced')
    estimated_weeks = models.IntegerField(default=8)
    is_featured = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['target_role', 'title']

    def __str__(self):
        return f"Path: {self.title} ({self.target_role})"


class LearningPathStep(models.Model):
    PHASE_CHOICES = (
        ('fundamentals', '1. Fundamentals'),
        ('core_technical', '2. Core Technical Skills'),
        ('applied_practice', '3. Applied Practice'),
        ('portfolio_projects', '4. Portfolio Projects'),
        ('interview_prep', '5. Interview Preparation'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='steps')
    resource = models.ForeignKey(LearningResource, on_delete=models.CASCADE, related_name='path_steps')
    step_number = models.IntegerField(default=1)
    phase_category = models.CharField(max_length=50, choices=PHASE_CHOICES, default='fundamentals')
    learning_objective = models.TextField(blank=True, default='')
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['path', 'order', 'step_number']
        unique_together = ('path', 'step_number')

    def __str__(self):
        return f"Step {self.step_number}: {self.resource.title} in {self.path.title}"


class UserLearningProgress(models.Model):
    STATUS_CHOICES = (
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )
    METHOD_CHOICES = (
        ('youtube_player_observed', 'Observed via Embedded Player'),
        ('manual_self_report', 'Self-Reported Completion'),
        ('link_visited', 'Visited Resource Link'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='learning_progress')
    resource = models.ForeignKey(LearningResource, on_delete=models.CASCADE, related_name='user_progress')
    path = models.ForeignKey(LearningPath, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_progress')
    
    # Playback & Progress Metrics
    current_position_seconds = models.FloatField(default=0.0)
    total_duration_seconds = models.FloatField(default=0.0)
    completion_percentage = models.FloatField(default=0.0)  # Clamped 0.0 - 100.0
    completion_status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='not_started', db_index=True)
    
    last_watched_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    tracking_method = models.CharField(max_length=50, choices=METHOD_CHOICES, default='youtube_player_observed')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'resource')
        ordering = ['-last_watched_at', '-updated_at']

    def __str__(self):
        return f"Progress: {self.user.email} -> {self.resource.title} ({self.completion_percentage:.1f}%)"


class SavedLearningResource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_learning_resources')
    resource = models.ForeignKey(LearningResource, on_delete=models.CASCADE, related_name='saved_by_users')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'resource')
        ordering = ['-created_at']

    def __str__(self):
        return f"Saved Resource: {self.resource.title} for {self.user.email}"


class ResourceClickLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    resource = models.ForeignKey(LearningResource, on_delete=models.CASCADE, related_name='click_logs')
    destination_url = models.URLField(max_length=1000)
    clicked_at = models.DateTimeField(auto_now_add=True)
    user_agent = models.CharField(max_length=500, blank=True, default='')

    def __str__(self):
        return f"Click: {self.resource.title} at {self.clicked_at}"


# =====================================================================
# COMPETENCE ASSESSMENTS, PROJECT SUBMISSIONS & APPLICATION TELEMETRY
# =====================================================================

class SkillAssessment(models.Model):
    ASSESSMENT_TYPES = (
        ('quiz', 'Concept & Knowledge Quiz'),
        ('code_challenge', 'Code Implementation Challenge'),
        ('sql_challenge', 'SQL Query Challenge'),
        ('scenario', 'Architecture & Scenario Review'),
    )
    DIFFICULTY_LEVELS = (
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True)
    skill_name = models.CharField(max_length=100, db_index=True)
    assessment_type = models.CharField(max_length=50, choices=ASSESSMENT_TYPES, default='quiz', db_index=True)
    difficulty = models.CharField(max_length=50, choices=DIFFICULTY_LEVELS, default='Intermediate')
    time_limit_minutes = models.IntegerField(default=15)
    passing_score = models.FloatField(default=70.0)
    description = models.TextField(blank=True, default='')
    questions = models.JSONField(default=list, blank=True)
    evaluation_rubric = models.TextField(blank=True, default='')
    version = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['skill_name', 'difficulty']

    def __str__(self):
        return f"{self.title} ({self.skill_name} - {self.get_assessment_type_display()})"


class AssessmentAttempt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assessment_attempts')
    assessment = models.ForeignKey(SkillAssessment, on_delete=models.CASCADE, related_name='attempts')
    answers = models.JSONField(default=dict, blank=True)
    score = models.FloatField(default=0.0)  # 0.0 to 100.0
    passed = models.BooleanField(default=False, db_index=True)
    feedback = models.JSONField(default=dict, blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.email} -> {self.assessment.title} ({self.score:.1f}% - {'PASSED' if self.passed else 'FAILED'})"


class ProjectSubmission(models.Model):
    STATUS_CHOICES = (
        ('submitted', 'Submitted for Review'),
        ('verified', 'Verified Practical Competence'),
        ('needs_work', 'Needs Additional Work'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_submissions')
    task = models.ForeignKey(RoadmapTask, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_submissions')
    title = models.CharField(max_length=255)
    skills_demonstrated = models.JSONField(default=list, blank=True)
    repository_url = models.URLField(max_length=500)
    live_demo_url = models.URLField(max_length=500, blank=True, default='')
    deliverables_summary = models.TextField(blank=True, default='')
    verification_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='verified', db_index=True)
    verification_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Project: {self.title} by {self.user.email} [{self.verification_status}]"


class JobApplicationClickLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='job_application_clicks')
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='application_clicks')
    destination_url = models.URLField(max_length=1000)
    clicked_at = models.DateTimeField(auto_now_add=True)
    user_agent = models.CharField(max_length=500, blank=True, default='')

    def __str__(self):
        return f"App Click: {self.job.title} at {self.clicked_at}"



