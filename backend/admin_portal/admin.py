from django.contrib import admin
from .models import AdminProfile, AuditLog


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_active', 'created_by', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'actor', 'action', 'target_type', 'target_id', 'ip_address')
    list_filter = ('action', 'target_type', 'timestamp')
    search_fields = ('actor__username', 'action', 'target_type', 'target_id', 'summary')
    readonly_fields = (
        'actor', 'action', 'target_type', 'target_id', 'target_repr',
        'summary', 'metadata', 'ip_address', 'user_agent', 'correlation_id', 'timestamp'
    )

    def has_add_permission(self, request):
        # Audit logs are generated strictly via system services
        return False

    def has_delete_permission(self, request, obj=None):
        # Audit logs cannot be deleted through the admin interface
        return False

    def has_change_permission(self, request, obj=None):
        # Audit logs are immutable
        return False
