from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, CandidateProfile, RecruiterProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Auto-create the appropriate profile whenever a user is saved."""
    if instance.role == User.Role.CANDIDATE:
        CandidateProfile.objects.get_or_create(user=instance)
    elif instance.role == User.Role.RECRUITER:
        RecruiterProfile.objects.get_or_create(user=instance)
