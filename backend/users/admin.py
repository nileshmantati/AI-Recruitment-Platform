from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from admin_portal.models import AdminProfile
from .models import CandidateProfile, User, RecruiterProfile


class AdminProfileInline(admin.StackedInline):
    model = AdminProfile
    fk_name = 'user'
    can_delete = False
    verbose_name_plural = 'Admin Profile (Staff Permissions)'
    extra = 0
    fields = ('permissions', 'is_active', 'created_by')


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    inlines = [AdminProfileInline]
    list_display = ('username', 'email', 'role', 'is_staff', 'is_superuser', 'is_active')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Platform Details', {'fields': ('role', 'is_email_verified')}),
    )


admin.site.register(CandidateProfile)
admin.site.register(RecruiterProfile)
