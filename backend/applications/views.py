

# Create your views here.
import logging
# pyrefly: ignore [missing-import]
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Application
from .serializers import ApplicationSerializer
from ai_engine.tasks import process_resume_scoring
from django.shortcuts import get_object_or_404
from ai_engine.services import generate_interview_questions
from rest_framework.views import APIView
from ai_engine.tasks import send_status_update_email, send_interview_invitation
import threading
from django.db import connection


logger = logging.getLogger(__name__)


def _run_in_thread(task_func, *args):
    """Wrapper that ensures each thread gets its own Django DB connection."""
    def wrapper():
        try:
            task_func(*args)
        except Exception as e:
            logger.error(f"Background email task failed: {e}")
        finally:
            connection.close()
    threading.Thread(target=wrapper, daemon=True).start()

class ApplyJobView(generics.CreateAPIView):
    """
    POST: Candidate applies for a job and uploads/updates their resume.
    """
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    # CRITICAL: These parsers allow DRF to accept PDF file uploads
    parser_classes = [MultiPartParser, FormParser] 

    def create(self, request, *args, **kwargs):
        user = request.user
        
        # Security Check: Only candidates can apply
        if user.role != 'CANDIDATE':
            return Response({"error": "Only candidate accounts can apply for jobs."}, status=status.HTTP_403_FORBIDDEN)
        
        job_id = request.data.get('job')
        resume_file = request.FILES.get('resume')

        # Validate that the job exists and is active
        if not job_id:
            return Response({"error": "A job ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        from jobs.models import Job
        job = Job.objects.filter(id=job_id, is_active=True).first()
        if not job:
            return Response({"error": "This job does not exist or is no longer active."}, status=status.HTTP_404_NOT_FOUND)

        # Ensure the candidate has a profile
        if not hasattr(user, 'candidate_profile'):
            return Response({"error": "Candidate profile not found. Please contact support."}, status=status.HTTP_400_BAD_REQUEST)

        # Update candidate's profile with the new resume if provided
        if resume_file:
            user.candidate_profile.resume = resume_file
            user.candidate_profile.save()
        elif not user.candidate_profile.resume:
            return Response({"error": "A resume PDF is required to apply."}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent duplicate applications
        if Application.objects.filter(candidate=user.candidate_profile, job_id=job_id).exists():
            return Response({"error": "You have already applied for this job."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the Application
        application = Application.objects.create(
            candidate=user.candidate_profile,
            job=job
        )

        # TRIGGER THE AI ENGINE: Send task to Celery queue so the user doesn't wait
        try:
            _run_in_thread(process_resume_scoring, application.id)
        except Exception as e:
            # Don't let a broker/Redis failure crash the entire application submission
            logger.error(f"Failed to enqueue resume scoring task for application {application.id}: {e}")

        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class MyApplicationsListView(generics.ListAPIView):
    """
    GET: Candidate views their own applications with AI scores and feedback.
    """
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'candidate_profile'):
            return Application.objects.none()
        return Application.objects.filter(
            candidate=user.candidate_profile
        ).order_by('-applied_at')


class LatestApplicationsView(generics.ListAPIView):
    """
    GET: Recruiter views latest applicants.
    """
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(job__recruiter=self.request.user).order_by("-applied_at")[:5]

class AllRecruiterApplicationsView(generics.ListAPIView):
    """
    GET: Recruiter views all applicants across all their jobs.
    """
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(job__recruiter=self.request.user).order_by("-applied_at")

class JobApplicantsListView(generics.ListAPIView):
    """
    GET: Recruiter views all applicants for a specific job.
    """
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self): 
        job_id = self.kwargs['job_id']
        # 1. Filter applications for this specific job
        # 2. Ensure the logged-in recruiter actually posted this job
        # 3. Order candidates by AI resume score (highest first)
        return Application.objects.filter(
            job_id=job_id, 
            job__recruiter=self.request.user
        ).order_by('-resume_score')


class GenerateInterviewQuestionsView(generics.GenericAPIView):
    """
    GET: Generates custom interview questions for a specific application.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, application_id):
        # 1. Fetch the application securely
        application = get_object_or_404(Application, id=application_id)
        
        # Security Check: Ensure only the recruiter who posted the job can generate questions
        if application.job.recruiter != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        # 2. Extract context for the AI
        job = application.job
        feedback = application.ai_feedback or "No specific weaknesses identified."

        # 3. Call the AI Service
        try:
            ai_response = generate_interview_questions(job.title, job.description, feedback)
        except Exception as e:
            logger.error(f"AI Question Generation failed for application {application_id}: {e}")
            return Response(
                {"error": f"AI service error: {str(e)}", "questions": []},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(ai_response, status=status.HTTP_200_OK)


class UpdateApplicationStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, application_id):
        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        # Security: Only the recruiter of this job can update status
        if application.job.recruiter != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        valid_statuses = ['SHORTLISTED', 'REJECTED']

        if new_status not in valid_statuses:
            return Response({"error": "Invalid status provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Update Database
        application.status = new_status
        application.save()

        # Send email in background thread (non-blocking)
        _run_in_thread(send_status_update_email, application.id, new_status)

        return Response({
            "message": f"Application marked as {new_status}. Email notification is being sent.",
            "status": application.status
        }, status=status.HTTP_200_OK)

class ScheduleInterviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, application_id):
        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        # Security Check: Only the job's recruiter can schedule
        if application.job.recruiter != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)

        interview_datetime = request.data.get('interview_datetime')
        meeting_link = request.data.get('meeting_link')

        if not interview_datetime or not meeting_link:
            return Response({"error": "Date, time, and meeting link are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Update application status
        application.status = 'INTERVIEW_SCHEDULED'
        application.save()

        # Send email in background thread (non-blocking)
        _run_in_thread(send_interview_invitation, application.id, interview_datetime, meeting_link)

        return Response({
            "message": "Interview scheduled successfully! Invitation email is being sent.",
            "status": application.status
        }, status=status.HTTP_200_OK)