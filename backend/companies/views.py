from collections import Counter
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from utils.permissions import IsRecruiter, IsAdminUser
from .models import Company
from .serializers import CompanySerializer
from career.models import JobPosting, SavedCompany
from career.serializers import JobPostingSerializer

class CompanyCreateView(generics.CreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsRecruiter | IsAdminUser]

class CompanyListView(generics.ListAPIView):
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Company.objects.all().order_by('company_name')
        tab = self.request.query_params.get('tab', 'all').strip().lower()
        search = self.request.query_params.get('search', '').strip()
        industry = self.request.query_params.get('industry', '').strip()
        country = self.request.query_params.get('country', '').strip()
        region = self.request.query_params.get('region', '').strip()
        city = self.request.query_params.get('city', '').strip()
        stage = self.request.query_params.get('stage', '').strip()
        location = self.request.query_params.get('location', '').strip()
        job_type = self.request.query_params.get('job_type', '').strip()
        experience_level = self.request.query_params.get('experience_level', '').strip()
        is_hiring = self.request.query_params.get('is_hiring', '').lower()

        # Primary Discovery Tabs
        if tab == 'india':
            qs = qs.filter(
                Q(region__iexact='India') |
                Q(country__iexact='India') |
                Q(headquarters__icontains='India') |
                Q(founding_location__icontains='India')
            )
        elif tab == 'global':
            qs = qs.exclude(
                Q(country__iexact='India') & Q(region__iexact='India')
            )
        elif tab == 'startups':
            qs = qs.filter(
                Q(is_startup=True) | Q(company_stage__in=['Startup', 'Growth'])
            )
        elif tab == 'hiring':
            hiring_companies = JobPosting.objects.filter(
                verification_status='verified_active'
            ).values_list('company_name', flat=True).distinct()
            qs = qs.filter(company_name__in=hiring_companies)

        # Search across companies and published job attributes
        if search:
            matching_job_companies = JobPosting.objects.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search)
            ).values_list('company_name', flat=True).distinct()

            qs = qs.filter(
                Q(company_name__icontains=search) |
                Q(canonical_name__icontains=search) |
                Q(domain__icontains=search) |
                Q(industry__icontains=search) |
                Q(description__icontains=search) |
                Q(headquarters__icontains=search) |
                Q(founding_location__icontains=search) |
                Q(company_name__in=matching_job_companies)
            )

        # Targeted Filters
        if industry and industry.lower() != 'all':
            qs = qs.filter(industry__iexact=industry)

        if country and country.lower() != 'all':
            qs = qs.filter(country__iexact=country)

        if region and region.lower() != 'all':
            qs = qs.filter(region__iexact=region)

        if stage and stage.lower() != 'all':
            qs = qs.filter(company_stage__iexact=stage)

        if city and city.lower() != 'all':
            qs = qs.filter(
                Q(headquarters__icontains=city) |
                Q(founding_location__icontains=city) |
                Q(locations__icontains=city) |
                Q(office_locations__icontains=city)
            )

        if location and location.lower() != 'all':
            loc_job_companies = JobPosting.objects.filter(
                location__icontains=location
            ).values_list('company_name', flat=True).distinct()
            qs = qs.filter(
                Q(headquarters__icontains=location) |
                Q(locations__icontains=location) |
                Q(company_name__in=loc_job_companies)
            )

        if job_type and job_type.lower() != 'all':
            jt_companies = JobPosting.objects.filter(
                Q(workplace_type__iexact=job_type) | Q(employment_type__icontains=job_type),
                verification_status='verified_active'
            ).values_list('company_name', flat=True).distinct()
            qs = qs.filter(company_name__in=jt_companies)

        if experience_level and experience_level.lower() != 'all':
            exp_companies = JobPosting.objects.filter(
                experience_level__iexact=experience_level,
                verification_status='verified_active'
            ).values_list('company_name', flat=True).distinct()
            qs = qs.filter(company_name__in=exp_companies)

        if is_hiring == 'true':
            hiring_company_names = JobPosting.objects.filter(
                verification_status='verified_active'
            ).values_list('company_name', flat=True).distinct()
            qs = qs.filter(company_name__in=hiring_company_names)

        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        all_companies = Company.objects.all()

        industries = sorted([i for i in all_companies.values_list('industry', flat=True).distinct() if i])
        countries = sorted([c for c in all_companies.values_list('country', flat=True).distinct() if c])
        regions = ['India', 'Global', 'North America', 'Europe', 'Asia-Pacific']
        stages = ['Startup', 'Growth', 'Enterprise', 'Public']

        locations = sorted(list(set(
            [c.split(',')[0].strip() for c in all_companies.values_list('headquarters', flat=True) if c] +
            [j.split(',')[0].strip() for j in JobPosting.objects.values_list('location', flat=True) if j]
        )))[:15]

        return Response({
            'count': len(response.data),
            'industries': industries,
            'countries': countries,
            'regions': regions,
            'stages': stages,
            'locations': locations,
            'job_types': ['Remote', 'Hybrid', 'Onsite'],
            'experience_levels': ['Junior', 'Mid', 'Senior', 'Lead', 'Staff'],
            'companies': response.data
        })

class CompanyDetailView(generics.RetrieveAPIView):
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_object(self):
        slug_or_pk = self.kwargs.get('slug')
        try:
            return Company.objects.get(slug=slug_or_pk)
        except Company.DoesNotExist:
            pass
        try:
            return Company.objects.get(id=int(slug_or_pk))
        except (ValueError, Company.DoesNotExist):
            pass
        return generics.get_object_or_404(Company, company_name__iexact=slug_or_pk)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Real skills evidence extracted directly from published vacancies
        active_jobs = JobPosting.objects.filter(
            Q(company=instance) | Q(company_name__iexact=instance.company_name),
            verification_status='verified_active'
        )
        all_skills = []
        role_titles = []
        for j in active_jobs:
            if j.required_skills:
                all_skills.extend(j.required_skills)
            if j.title:
                role_titles.append(j.title)

        skill_counts = Counter(all_skills).most_common(12)
        top_roles = [r[0] for r in Counter(role_titles).most_common(6)]

        data['skills_summary'] = [
            {'skill': item[0], 'mention_count': item[1]} for item in skill_counts
        ]
        data['top_roles'] = top_roles
        data['total_active_jobs'] = active_jobs.count()

        return Response(data)


class CompanyJobsListView(generics.ListAPIView):
    """
    Returns real, verified active vacancies for a specific company.
    """
    serializer_class = JobPostingSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        company = None
        try:
            company = Company.objects.get(slug=slug)
        except Company.DoesNotExist:
            company = Company.objects.filter(company_name__iexact=slug).first()

        if not company:
            return JobPosting.objects.none()

        return JobPosting.objects.filter(
            Q(company=company) | Q(company_name__iexact=company.company_name),
            verification_status='verified_active'
        ).order_by('-posted_at')


class CompanySaveToggleView(APIView):
    """
    Toggles saving / bookmarking a company for the authenticated candidate.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        company = generics.get_object_or_404(Company, slug=slug)
        saved = SavedCompany.objects.filter(user=request.user, company=company).first()

        if saved:
            saved.delete()
            return Response({'status': 'unfollowed', 'is_saved': False, 'message': f"Removed {company.company_name} from saved companies."})
        else:
            SavedCompany.objects.create(user=request.user, company=company)
            return Response({'status': 'saved', 'is_saved': True, 'message': f"Saved {company.company_name} to your watchlist."})


class CompanyUpdateView(generics.UpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsRecruiter | IsAdminUser]

    def get_object(self):
        company_id = self.request.data.get('id') or self.request.query_params.get('id')
        if not company_id:
            raise Response({"error": "Company ID is required to update."}, status=status.HTTP_400_BAD_REQUEST)
        return generics.get_object_or_404(Company, id=company_id)
