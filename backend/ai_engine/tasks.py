# pyrefly: ignore [missing-import]
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .services import extract_text_from_pdf, evaluate_candidate_resume
from applications.models import Application


@shared_task
def process_resume_scoring(application_id):
    # 1. Fetch the application and job
    application = Application.objects.get(id=application_id)
    job = application.job

    # 2. Extract Text
    resume_path = application.candidate.resume.path
    resume_text = extract_text_from_pdf(resume_path)

    if not resume_text:
        application.status = 'ERROR'
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


@shared_task
def send_status_update_email(application_id, new_status):
    try:
        application = Application.objects.get(id=application_id)
        candidate_email = application.candidate.user.email
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

    except Exception as e:
        print(f"Error sending email: {e}")
        return str(e)


@shared_task
def send_interview_invitation(application_id, interview_datetime, meeting_link):
    try:
        application = Application.objects.get(id=application_id)
        candidate_email = application.candidate.user.email
        job_title = application.job.title
        candidate_name = application.candidate.first_name or application.candidate.user.username or "Candidate"

        subject = f"Interview Invitation: {job_title} at AI Recruitment Platform"

        message = f"""Hello {candidate_name},

Congratulations! We would like to invite you for an interview for the {job_title} role.

Your interview is scheduled for: {interview_datetime}

Meeting Link: {meeting_link}

Please ensure you join 5 minutes early. Our AI has matched your profile strongly with this role, and we are excited to speak with you!

Best Regards,
AI Recruitment Team
"""

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[candidate_email],
            fail_silently=False,
        )
        return f"Interview invite sent to {candidate_email}"

    except Exception as e:
        print(f"Error sending interview email: {e}")
        return str(e)
