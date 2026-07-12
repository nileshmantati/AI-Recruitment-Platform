from rest_framework import serializers
from .models import Application
from jobs.serializers import JobSerializer
from users.serializers import CandidateProfileSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    # Nesting job details and candidate name for a better frontend experience
    job_details = JobSerializer(source='job', read_only=True)
    candidate_name = serializers.CharField(source='candidate.user.username', read_only=True)
    candidate_details = CandidateProfileSerializer(source='candidate', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'job_details', 'candidate', 'candidate_name', 'candidate_details',
            'resume_score', 'ai_feedback', 'status', 'applied_at'
        ]
        # These fields are managed by the backend/AI, not the user submitting the form
        read_only_fields = ['candidate', 'resume_score', 'ai_feedback', 'status']