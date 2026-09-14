# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        RECRUITER = 'RECRUITER', 'Recruiter'
        CANDIDATE = 'CANDIDATE', 'Candidate'

    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.CANDIDATE)

    def __str__(self):
        return f"{self.username} - {self.role}"

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.Role.ADMIN
        super().save(*args, **kwargs)


class CandidateProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='candidate_profile')
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    profile_image = models.ImageField(
        upload_to='profile_images/', blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)
    experience = models.CharField(max_length=50, blank=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)

    # Professional additions
    portfolio_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Candidate Profile: {self.user.username}"


class RecruiterProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='recruiter_profile')
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    profile_image = models.ImageField(
        upload_to='profile_images/', blank=True, null=True)
    company = models.CharField(max_length=100, blank=True)

    # Professional additions
    position = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Recruiter Profile: {self.user.username}"
