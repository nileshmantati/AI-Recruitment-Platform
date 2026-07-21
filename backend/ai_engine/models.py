from django.db import models


class ResumeAnalysis(models.Model):
    """Stores the result of an AI resume analysis for a standalone (non-application) upload."""

    filename = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    # Core scores
    ai_score = models.IntegerField(default=0)           # 0-100
    match_percentage = models.IntegerField(default=0)   # 0-100
    job_role = models.CharField(max_length=255, default='General Role')
    experience_relevancy = models.IntegerField(default=0)  # 0-100

    # AI structured feedback (stored as JSON arrays)
    owned_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    ai_strategy = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.filename} — Score: {self.ai_score}"
