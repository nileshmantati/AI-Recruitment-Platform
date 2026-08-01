from django.contrib import admin
from .models import NotificationSettings, SecuritySettings, LoginHistory, HiringWorkflow, HiringStage, TeamMember, AppearanceSettings, PrivacySettings, IntegrationSettings

admin.site.register(NotificationSettings)
admin.site.register(SecuritySettings)
admin.site.register(LoginHistory)
admin.site.register(HiringWorkflow)
admin.site.register(HiringStage)
admin.site.register(TeamMember)
admin.site.register(AppearanceSettings)
admin.site.register(PrivacySettings)
admin.site.register(IntegrationSettings)

