from rest_framework import serializers
from .models import Application
from jobs.serializers import JobSerializer
from users.serializers import CandidateProfileSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    # Nesting job details and candidate name for a better frontend experience
    job_details = JobSerializer(source='job', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    candidate_name = serializers.CharField(
        source='candidate.user.username', read_only=True)
    candidate_details = CandidateProfileSerializer(
        source='candidate', read_only=True)
    interview_date = serializers.SerializerMethodField()
    meeting_link = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'job_title', 'job_details', 'candidate', 'candidate_name', 'candidate_details',
            'resume_score', 'ai_feedback', 'status', 'applied_at', 'interview_date', 'meeting_link'
        ]
        # These fields are managed by the backend/AI, not the user submitting the form
        read_only_fields = ['candidate',
                            'resume_score', 'ai_feedback', 'status']

    def get_interview_date(self, obj):
        if obj.ai_feedback and isinstance(obj.ai_feedback, dict):
            return obj.ai_feedback.get('interview_datetime')
        return None

    def get_meeting_link(self, obj):
        if obj.ai_feedback and isinstance(obj.ai_feedback, dict):
            return obj.ai_feedback.get('meeting_link')
        return None

