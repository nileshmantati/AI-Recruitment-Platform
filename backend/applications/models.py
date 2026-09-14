from django.db import models
from jobs.models import Job
from users.models import CandidateProfile


class Application(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('EVALUATED', 'Evaluated'),
        ('SHORTLISTED', 'Shortlisted'),
        ('REJECTED', 'Rejected'),
        ('INTERVIEW_SCHEDULED', 'Interview Scheduled'),
        ('ERROR', 'Error'),
    )

    candidate = models.ForeignKey(
        CandidateProfile, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE,
                            related_name='applications')
    resume_score = models.IntegerField(default=0)
    # Stores missing skills, strengths, etc.
    ai_feedback = models.JSONField(blank=True, null=True)
    status = models.CharField(
        max_length=25, choices=STATUS_CHOICES, default='PENDING')
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.candidate.user.username} -> {self.job.title}"
