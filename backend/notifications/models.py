from django.db import models
from django.conf import settings


class Notification(models.Model):
    EVENT_CHOICES = (
        ('APPLICATION_SUBMITTED', 'Application Submitted'),
        ('NEW_APPLICATION', 'New Application Received'),
        ('APPLICATION_SHORTLISTED', 'Application Shortlisted'),
        ('APPLICATION_REJECTED', 'Application Rejected'),
        ('APPLICATION_STATUS_UPDATED', 'Application Status Updated'),
        ('INTERVIEW_SCHEDULED', 'Interview Scheduled'),
        ('INTERVIEW_RESCHEDULED', 'Interview Rescheduled'),
    )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        db_index=True,
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='actor_notifications',
    )
    event_type = models.CharField(
        max_length=50,
        choices=EVENT_CHOICES,
        db_index=True
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    target_type = models.CharField(max_length=50, blank=True, default='')
    target_id = models.IntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read'], name='notif_recip_read_idx'),
            models.Index(fields=['recipient', '-created_at'], name='notif_recip_created_idx'),
        ]

    def __str__(self):
        return f"Notification({self.recipient.username}, {self.event_type}, read={self.is_read})"
