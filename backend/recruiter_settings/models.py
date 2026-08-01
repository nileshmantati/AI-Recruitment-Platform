from django.db import models
from django.conf import settings
from companies.models import Company

class NotificationSettings(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_settings')
    email_notifications = models.BooleanField(default=True)
    browser_notifications = models.BooleanField(default=False)
    interview_reminders = models.BooleanField(default=True)
    new_applications = models.BooleanField(default=True)
    candidate_status_updates = models.BooleanField(default=True)
    resume_ai_completion = models.BooleanField(default=True)
    weekly_reports = models.BooleanField(default=False)
    product_updates = models.BooleanField(default=False)
    security_alerts = models.BooleanField(default=True)

    def __str__(self):
        return f"Notification Settings - {self.user.username}"

class SecuritySettings(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='security_settings')
    two_factor_auth = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Security Settings - {self.user.username}"

class LoginHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='login_history')
    device = models.CharField(max_length=255, blank=True, null=True)
    browser = models.CharField(max_length=255, blank=True, null=True)
    ip_address = models.CharField(max_length=50, blank=True, null=True)
    login_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Login - {self.user.username} at {self.login_time}"

class HiringWorkflow(models.Model):
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='hiring_workflow')
    name = models.CharField(max_length=255, default="Standard Pipeline")

    def __str__(self):
        return f"Workflow - {self.company.name}"

class HiringStage(models.Model):
    workflow = models.ForeignKey(HiringWorkflow, on_delete=models.CASCADE, related_name='stages')
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

class TeamMember(models.Model):
    ROLE_CHOICES = [
        ('OWNER', 'Owner'),
        ('ADMIN', 'Admin'),
        ('RECRUITER', 'Recruiter'),
        ('HIRING_MANAGER', 'Hiring Manager'),
        ('INTERVIEWER', 'Interviewer'),
    ]
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='team_members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='team_roles')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='RECRUITER')
    is_active = models.BooleanField(default=True)
    joined_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role} at {self.company.name}"

class AppearanceSettings(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appearance_settings')
    theme = models.CharField(max_length=20, choices=[('light', 'Light Mode'), ('dark', 'Dark Mode'), ('system', 'System Theme')], default='light')
    accent_color = models.CharField(max_length=50, default='blue')
    sidebar_style = models.CharField(max_length=20, choices=[('expanded', 'Expanded'), ('compact', 'Compact')], default='expanded')
    enable_animations = models.BooleanField(default=True)

    def __str__(self):
        return f"Appearance - {self.user.username}"

class PrivacySettings(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='privacy_settings')
    cookie_preferences = models.BooleanField(default=True)

    def __str__(self):
        return f"Privacy - {self.user.username}"

class IntegrationSettings(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='integrations')
    provider = models.CharField(max_length=100) # e.g., 'Google Calendar', 'Zoom', 'Slack'
    is_connected = models.BooleanField(default=False)
    connected_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.provider} Integration - {self.company.name}"
