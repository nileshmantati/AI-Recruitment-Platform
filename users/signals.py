from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, CandidateProfile


@receiver(post_save, sender=User)
def create_candidate_profile(sender, instance, created, **kwargs):
    """Auto-create a CandidateProfile whenever a CANDIDATE user is saved."""
    if instance.role == 'CANDIDATE':
        CandidateProfile.objects.get_or_create(user=instance)
