from django.conf import settings
from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    # This pulls the username from the related User model automatically
    recruiter_name = serializers.CharField(
        source='recruiter.username', read_only=True)
    applicants = serializers.IntegerField(read_only=True)
    company = serializers.SerializerMethodField()
    company_details = serializers.SerializerMethodField()
    type = serializers.CharField(default='Full-time', required=False)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'required_skills',
            'salary', 'type', 'recruiter', 'recruiter_name', 'company',
            'company_details', 'applicants', 'created_at', 'is_active'
        ]
        # We make recruiter read-only because we will set it automatically from the requested user
        read_only_fields = ['recruiter', 'created_at']

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        raw_type = data.get('type') or data.get('employment_type')
        if not raw_type or not str(raw_type).strip():
            data['type'] = 'Full-time'
        else:
            data['type'] = str(raw_type).strip()
        return super().to_internal_value(data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # If type is empty or standard default, infer from description if specified
        current_type = ret.get('type')
        if not current_type or current_type == 'Full-time':
            desc = instance.description or ''
            for candidate in ['Internship', 'Part-time', 'Contract', 'Remote']:
                if f'Employment Type:</strong>&nbsp;{candidate}' in desc or f'Employment Type:</strong> {candidate}' in desc or f'Employment Type: {candidate}' in desc or f'Employment&nbsp;Type:</strong>&nbsp;{candidate}' in desc:
                    ret['type'] = candidate
                    break
        return ret

    def get_company(self, obj):
        if hasattr(obj.recruiter, 'company') and obj.recruiter.company and obj.recruiter.company.name:
            return obj.recruiter.company.name
        if hasattr(obj.recruiter, 'recruiter_profile') and obj.recruiter.recruiter_profile and obj.recruiter.recruiter_profile.company:
            return obj.recruiter.recruiter_profile.company
        return obj.recruiter.username

    def get_company_details(self, obj):
        recruiter = getattr(obj, 'recruiter', None)
        if not recruiter:
            return None
        company = getattr(recruiter, 'company', None)
        if not company:
            profile = getattr(recruiter, 'recruiter_profile', None)
            if profile and profile.company:
                return {
                    'name': profile.company,
                    'tagline': None,
                    'industry': 'Other',
                    'size': None,
                    'website': None,
                    'city': None,
                    'country': None,
                    'logo': None,
                    'cover_banner': None,
                    'is_verified': profile.is_company_verified,
                }
            return None

        request = self.context.get('request')
        logo_url = None
        if company.logo:
            if request is not None:
                logo_url = request.build_absolute_uri(company.logo.url).replace(':10000', '')
                if (request.is_secure() or getattr(settings, 'SECURE_PROXY_SSL_HEADER', None)) and logo_url.startswith('http://'):
                    logo_url = 'https://' + logo_url[7:]
            else:
                logo_url = company.logo.url

        banner_url = None
        if company.cover_banner:
            if request is not None:
                banner_url = request.build_absolute_uri(company.cover_banner.url).replace(':10000', '')
                if (request.is_secure() or getattr(settings, 'SECURE_PROXY_SSL_HEADER', None)) and banner_url.startswith('http://'):
                    banner_url = 'https://' + banner_url[7:]
            else:
                banner_url = company.cover_banner.url

        return {
            'id': company.id,
            'name': company.name,
            'tagline': company.tagline,
            'industry': company.industry,
            'size': company.size,
            'founded_year': company.founded_year,
            'website': company.website,
            'email': company.email,
            'phone': company.phone,
            'logo': logo_url,
            'cover_banner': banner_url,
            'about': company.about,
            'mission': company.mission,
            'vision': company.vision,
            'why_join_us': company.why_join_us,
            'country': company.country,
            'state': company.state,
            'city': company.city,
            'address': company.address,
            'postal_code': company.postal_code,
            'google_map_link': company.google_map_link,
            'working_mode': company.working_mode,
            'working_days': company.working_days,
            'working_hours': company.working_hours,
            'benefits': company.benefits or [],
            'perks': company.perks or [],
            'languages': company.languages,
            'is_verified': company.is_verified,
        }
