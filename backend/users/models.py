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
    is_email_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} - {self.role}"

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.Role.ADMIN
            self.is_email_verified = True
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


class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_otps')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        from django.utils import timezone
        from datetime import timedelta
        # Valid for 10 minutes and not used
        return not self.is_used and (timezone.now() - self.created_at) < timedelta(minutes=10)

    def __str__(self):
        return f"Reset OTP for {self.user.username} ({self.otp})"


class EmailVerificationOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verification_otps')
    otp_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at

    def is_valid(self):
        return not self.is_used and not self.is_expired() and self.attempts < 5

    def verify(self, plain_otp):
        from django.contrib.auth.hashers import check_password
        if not self.is_valid():
            return False
        return check_password(plain_otp, self.otp_hash)

    def __str__(self):
        return f"Email Verification OTP for {self.user.username} (Used: {self.is_used}, Attempts: {self.attempts})"


