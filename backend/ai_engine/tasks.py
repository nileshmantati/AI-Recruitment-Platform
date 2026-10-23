import os
# pyrefly: ignore [missing-import]
from celery import shared_task
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from .services import extract_text_from_file, extract_text_from_pdf, evaluate_candidate_resume
from applications.models import Application
from applications.utils import generate_ics_calendar


@shared_task(bind=True, max_retries=3)
def process_resume_scoring(self, application_id):
    try:
        # 1. Fetch the application and job
        application = Application.objects.get(id=application_id)
        job = application.job

        # 2. Extract Text
        if not hasattr(application.candidate, 'resume') or not application.candidate.resume:
            application.status = 'ERROR'
            application.ai_feedback = {"error": "No resume attached to candidate profile."}
            application.save()
            return

        resume_path = application.candidate.resume.path
        if not os.path.exists(resume_path):
            application.status = 'ERROR'
            application.ai_feedback = {"error": "Resume file not found on disk."}
            application.save()
            return

        resume_text = extract_text_from_file(resume_path) or extract_text_from_pdf(resume_path)

        if not resume_text:
            application.status = 'ERROR'
            application.ai_feedback = {"error": "Could not extract text from the resume file."}
            application.save()
            return

        # 3. Call AI Service
        ai_results = evaluate_candidate_resume(resume_text, job.description)

        # 4. Update Database
        application.resume_score = ai_results.get('score', 0)
        # You could also save missing_skills and strengths to a JSONField on the model
        application.ai_feedback = ai_results
        application.status = 'EVALUATED'
        application.save()

        return f"Processed Application {application_id} with score {application.resume_score}"
    except Exception as exc:
        # Fallback to update status if possible, then retry
        try:
            app = Application.objects.get(id=application_id)
            app.status = 'ERROR'
            app.save()
        except Exception:
            pass
        if getattr(self.request, 'id', None):
            raise self.retry(exc=exc, countdown=60)
        raise exc


@shared_task(bind=True, max_retries=3)
def send_status_update_email(self, application_id, new_status):
    try:
        application = Application.objects.get(id=application_id)
        candidate_email = application.candidate.user.email
        if not candidate_email:
            return f"Application {application_id} candidate has no email, skipping status notification."
        candidate_name = application.candidate.first_name or application.candidate.user.username or "Candidate"
        job_title = application.job.title

        if new_status == 'SHORTLISTED':
            subject = f"Congratulations! You've been shortlisted for {job_title}"
            message = f"Hello {candidate_name},\n\nGreat news! Your resume scored well and the recruiter has shortlisted you for the {job_title} role.\n\nOur team will contact you shortly for the next interview rounds.\n\nBest Regards,\nAI Recruitment Team"

        elif new_status == 'REJECTED':
            subject = f"Update regarding your application for {job_title}"
            message = f"Hello {candidate_name},\n\nThank you for applying to the {job_title} role. After careful review by our AI and recruitment team, we have decided to move forward with other candidates at this time.\n\nKeep applying and all the best for your future endeavors.\n\nBest Regards,\nAI Recruitment Team"
        else:
            return "No email required for this status."

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[candidate_email],
            fail_silently=False,
        )
        return f"Email sent successfully to {candidate_email}"

    except Exception as exc:
        print(f"Error sending email: {exc}")
        if getattr(self.request, 'id', None):
            raise self.retry(exc=exc, countdown=60)
        raise exc


@shared_task(bind=True, max_retries=3)
def send_interview_invitation(self, application_id, interview_datetime, meeting_link, duration_minutes=45):
    try:
        application = Application.objects.select_related(
            'job__recruiter', 'candidate__user'
        ).get(id=application_id)
        candidate_email = application.candidate.user.email
        if not candidate_email:
            return f"Application {application_id} candidate has no email, skipping interview invitation."
        job_title = application.job.title
        candidate_name = application.candidate.first_name or application.candidate.user.username or "Candidate"

        recruiter = application.job.recruiter
        recruiter_name = recruiter.get_full_name() or recruiter.username or "Hiring Team"
        recruiter_email = recruiter.email or ""
        company_name = "AI Recruitment Platform"
        if hasattr(recruiter, 'recruiter_profile') and recruiter.recruiter_profile.company:
            company_name = recruiter.recruiter_profile.company

        sequence = 0
        if isinstance(application.ai_feedback, dict):
            sequence = application.ai_feedback.get('interview_sequence', 0)

        subject = f"Interview Invitation: {job_title} at {company_name}"

        message = f"""Hello {candidate_name},

Congratulations! We would like to invite you for an interview for the {job_title} role at {company_name}.

Interview Schedule Details:
• Date & Time: {interview_datetime}
• Duration: {duration_minutes} minutes
• Meeting Link: {meeting_link}
• Interviewer: {recruiter_name} ({recruiter_email if recruiter_email else 'Hiring Team'})

We have attached an official calendar invite (.ics) to this email. You can open and add it directly to your Google Calendar, Apple Calendar, or Microsoft Outlook with one click.

Please ensure you join 5 minutes early. We are excited to speak with you!

Best Regards,
{company_name} Recruitment Team
"""

        # Generate standard RFC 5545 .ics calendar attachment
        ics_content = None
        try:
            ics_content = generate_ics_calendar(
                application_id=application.id,
                job_title=job_title,
                candidate_name=candidate_name,
                candidate_email=candidate_email,
                recruiter_name=recruiter_name,
                recruiter_email=recruiter_email,
                interview_datetime=interview_datetime,
                duration_minutes=duration_minutes,
                meeting_link=meeting_link,
                company_name=company_name,
                sequence=sequence,
            )
        except Exception as ics_err:
            print(f"Warning: Failed to generate .ics attachment for email: {ics_err}")

        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.EMAIL_HOST_USER,
            to=[candidate_email],
        )

        if ics_content:
            email.attach(
                filename='interview-invitation.ics',
                content=ics_content,
                mimetype='text/calendar; charset=utf-8; method=REQUEST',
            )

        email.send(fail_silently=False)
        return f"Interview invite with calendar attachment sent to {candidate_email}"

    except Exception as exc:
        print(f"Error sending interview email: {exc}")
        if getattr(self.request, 'id', None):
            raise self.retry(exc=exc, countdown=60)
        raise exc

