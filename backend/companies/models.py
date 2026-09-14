from django.db import models
from django.conf import settings


class Company(models.Model):
    # Step 1: Basic Information
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='company')
    name = models.CharField(max_length=255)
    tagline = models.CharField(max_length=255, blank=True, null=True)
    industry = models.CharField(max_length=100)
    size = models.CharField(max_length=50, blank=True, null=True)
    founded_year = models.IntegerField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    logo = models.ImageField(upload_to='company/logos/', blank=True, null=True)
    cover_banner = models.ImageField(
        upload_to='company/banners/', blank=True, null=True)

    # Step 2: About Company
    about = models.TextField(blank=True, null=True)
    mission = models.TextField(blank=True, null=True)
    vision = models.TextField(blank=True, null=True)
    why_join_us = models.TextField(blank=True, null=True)

    # Step 3: Contact Information (Headquarters / Primary)
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    google_map_link = models.URLField(blank=True, null=True)

    # Step 6: Company Culture
    WORKING_MODE_CHOICES = [
        ('REMOTE', 'Remote'),
        ('HYBRID', 'Hybrid'),
        ('ONSITE', 'Onsite'),
    ]
    working_mode = models.CharField(
        max_length=10, choices=WORKING_MODE_CHOICES, blank=True, null=True)
    working_days = models.CharField(
        max_length=100, blank=True, null=True)  # e.g., "Monday - Friday"
    working_hours = models.CharField(
        max_length=100, blank=True, null=True)  # e.g., "9:00 AM - 5:00 PM"
    benefits = models.JSONField(default=list, blank=True)
    perks = models.JSONField(default=list, blank=True)
    # e.g., "English, Spanish"
    languages = models.CharField(max_length=255, blank=True, null=True)
    dress_code = models.CharField(max_length=100, blank=True, null=True)

    # Meta
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class CompanySocial(models.Model):
    company = models.OneToOneField(
        Company, on_delete=models.CASCADE, related_name='socials')
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    youtube = models.URLField(blank=True, null=True)


class CompanyLocation(models.Model):
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='locations')
    name = models.CharField(max_length=100)  # e.g., "New York Office"
    country = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100)
    address = models.TextField()
    zip_code = models.CharField(max_length=20)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True)
    is_head_office = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.company.name} - {self.name}"


class CompanyDocument(models.Model):
    DOCUMENT_TYPES = [
        ('GST', 'GST Certificate'),
        ('PAN', 'PAN'),
        ('REG', 'Registration Certificate'),
        ('ISO', 'ISO Certificate'),
        ('OTHER', 'Other'),
    ]
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='documents')
    doc_type = models.CharField(max_length=10, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='company/documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)


class CompanyBranding(models.Model):
    company = models.OneToOneField(
        Company, on_delete=models.CASCADE, related_name='branding')
    primary_color = models.CharField(
        max_length=7, default='#0f172a')  # Hex color
    secondary_color = models.CharField(max_length=7, default='#3b82f6')
    theme = models.CharField(max_length=20, default='light')


class CompanyGallery(models.Model):
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='gallery_images')
    image = models.ImageField(upload_to='company/gallery/')
    caption = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class CompanyAIPreferences(models.Model):
    company = models.OneToOneField(
        Company, on_delete=models.CASCADE, related_name='ai_preferences')
    enable_ai_screening = models.BooleanField(default=True)
    enable_auto_shortlisting = models.BooleanField(default=False)
    minimum_resume_score = models.IntegerField(default=70)  # 0-100
    minimum_experience_years = models.IntegerField(default=0)
    preferred_skills = models.JSONField(default=list, blank=True)
    blacklist_keywords = models.JSONField(default=list, blank=True)
