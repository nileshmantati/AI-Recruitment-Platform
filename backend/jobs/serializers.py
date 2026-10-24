from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    # This pulls the username from the related User model automatically
    recruiter_name = serializers.CharField(
        source='recruiter.username', read_only=True)
    applicants = serializers.IntegerField(read_only=True)
    company = serializers.SerializerMethodField()
    type = serializers.CharField(default='Full-time', required=False)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'required_skills',
            'salary', 'type', 'recruiter', 'recruiter_name', 'company',
            'applicants', 'created_at', 'is_active'
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
