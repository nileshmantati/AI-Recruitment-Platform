from django.db import models
from django.conf import settings
from .constants import AdminPermission


class AdminProfile(models.Model):
    """
    Stores administrative permissions and assignment metadata for Staff Admins.
    Super Admins bypass explicit profile checks via is_superuser=True.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='admin_profile'
    )
    permissions = models.JSONField(
        default=list,
        blank=True,
        help_text="List of granted permission identifier strings."
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Designates whether this admin profile is actively permitted."
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='created_staff_profiles'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Admin Profile"
        verbose_name_plural = "Admin Profiles"

    def __str__(self):
        status_label = "Active" if self.is_active else "Inactive"
        return f"AdminProfile({self.user.username}, status={status_label}, perms={len(self.permissions)})"

    def has_permission(self, permission_identifier: str) -> bool:
        """Returns True if the profile is active and explicitly contains the permission."""
        if not self.is_active:
            return False
        if not isinstance(self.permissions, list):
            return False
        return permission_identifier in self.permissions

    def clean_permissions(self):
        """Normalizes and deduplicates permissions against known valid identifiers."""
        if not isinstance(self.permissions, list):
            self.permissions = []
            return
        is_super = False
        try:
            is_super = getattr(self.user, 'is_superuser', False)
        except Exception:
            pass
        valid = set(AdminPermission.ALL_PERMISSIONS) if is_super else set(AdminPermission.STAFF_ASSIGNABLE_PERMISSIONS)
        cleaned = []
        for p in self.permissions:
            if isinstance(p, str):
                p_clean = p.strip()
                if p_clean in valid and p_clean not in cleaned:
                    cleaned.append(p_clean)
        self.permissions = cleaned

    def save(self, *args, **kwargs):
        self.clean_permissions()
        super().save(*args, **kwargs)


class AuditLog(models.Model):
    """
    Audit log tracking administrative actions and security-sensitive events.
    Generic target_type and target_id are used to prevent cascade deletion
    from destroying audit history when target records are modified or removed.
    """
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='admin_audit_logs'
    )
    action = models.CharField(max_length=100, db_index=True)
    target_type = models.CharField(max_length=100, blank=True, db_index=True)
    target_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    target_repr = models.CharField(max_length=255, blank=True)
    summary = models.CharField(max_length=500, blank=True)
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Sanitized structured change diffs and non-sensitive metadata."
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    correlation_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        indexes = [
            models.Index(fields=['actor', '-timestamp'], name='audit_actor_time_idx'),
            models.Index(fields=['action', '-timestamp'], name='audit_action_time_idx'),
            models.Index(fields=['target_type', 'target_id'], name='audit_target_idx'),
            models.Index(fields=['-timestamp'], name='audit_time_idx'),
        ]

    def __str__(self):
        actor_name = self.actor.username if self.actor else "System"
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {actor_name} -> {self.action} ({self.target_type}:{self.target_id})"
