from rest_framework import serializers
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    # This pulls the username from the related User model automatically
    recruiter_name = serializers.CharField(source='recruiter.username', read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'required_skills', 
            'salary', 'recruiter', 'recruiter_name', 
            'created_at', 'is_active'
        ]
        # We make recruiter read-only because we will set it automatically from the requested user
        read_only_fields = ['recruiter', 'created_at']