import ipaddress
import logging
from typing import Any, Dict, List, Optional
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from users.models import User
from .models import AdminProfile, AuditLog
from .constants import AdminPermission

logger = logging.getLogger(__name__)

# Keys that must never be recorded in audit logs
SENSITIVE_FIELD_NAMES = {
    'password', 'password1', 'password2', 'new_password', 'current_password',
    'old_password', 'confirm_password', 'password_hash', 'user_password',
    'token', 'access_token', 'refresh_token', 'auth_token', 'session_token',
    'reset_token', 'jwt', 'bearer',
    'secret', 'secret_key', 'client_secret', 'webhook_secret', 'app_secret',
    'api_key', 'apikey', 'gemini_api_key', 'private_key',
    'otp', 'otp_code', 'otp_hash', 'code', 'verification_code',
    'authorization', 'cookie', 'cookies', 'sessionid',
    'credit_card', 'card_number', 'cvv', 'pin'
}

# Substring indicators that represent credentials
SENSITIVE_SUBSTRINGS = ('password', 'secret', 'api_key', 'apikey', 'private_key')


def sanitize_audit_metadata(data: Any) -> Any:
    """
    Recursively redacts sensitive values such as passwords, OTPs,
    and tokens from audit log payloads.
    """
    if isinstance(data, dict):
        cleaned = {}
        for k, v in data.items():
            key_clean = str(k).lower().replace('-', '_').strip()
            # Direct match or credential substring match (avoiding non-secret counters like prompt_tokens)
            is_sensitive = (
                key_clean in SENSITIVE_FIELD_NAMES or
                any(sub in key_clean for sub in SENSITIVE_SUBSTRINGS)
            )
            if is_sensitive:
                cleaned[k] = '[REDACTED]'
            else:
                cleaned[k] = sanitize_audit_metadata(v)
        return cleaned
    elif isinstance(data, (list, tuple)):
        return [sanitize_audit_metadata(item) for item in data]
    return data


def extract_client_ip(request) -> Optional[str]:
    """Extracts and validates client IP address safely from standard proxy headers."""
    if not request or not hasattr(request, 'META'):
        return None
    raw_ip = None
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        raw_ip = x_forwarded.split(',')[0].strip()
    else:
        raw_ip = request.META.get('REMOTE_ADDR')

    if not raw_ip:
        return None

    # Strip port if present (e.g. "192.168.1.1:8080" or "[2001:db8::1]:8080")
    candidate_ip = raw_ip.strip()
    if candidate_ip.startswith('[') and ']' in candidate_ip:
        candidate_ip = candidate_ip.split(']')[0].lstrip('[')
    elif ':' in candidate_ip and '.' in candidate_ip:
        candidate_ip = candidate_ip.split(':')[0]

    try:
        ipaddress.ip_address(candidate_ip)
        return candidate_ip
    except ValueError:
        return None


def log_admin_action(
    actor: Optional[User] = None,
    action: str = "",
    target_type: str = "",
    target_id: Any = None,
    target_repr: str = "",
    summary: str = "",
    changes: Optional[Dict[str, Any]] = None,
    request=None,
    correlation_id: Optional[str] = None,
    fail_silently: bool = False
) -> Optional[AuditLog]:
    """
    Creates an AuditLog record with sanitized metadata and network context.
    """
    try:
        ip_addr = extract_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''
        sanitized_meta = sanitize_audit_metadata(changes or {})

        str_target_id = str(target_id) if target_id is not None else None

        audit_entry = AuditLog.objects.create(
            actor=actor,
            action=action,
            target_type=target_type,
            target_id=str_target_id,
            target_repr=str(target_repr)[:255],
            summary=str(summary)[:500],
            metadata=sanitized_meta,
            ip_address=ip_addr,
            user_agent=user_agent,
            correlation_id=correlation_id
        )
        return audit_entry
    except Exception as exc:
        logger.error(f"Audit log recording failed for action '{action}': {exc}", exc_info=True)
        if not fail_silently:
            raise exc
        return None


def provision_staff_admin(
    super_admin: User,
    username: str,
    email: str,
    password: str,
    permissions: List[str],
    first_name: str = '',
    last_name: str = '',
    request=None
) -> tuple[User, AdminProfile]:
    """
    Provisions a new Staff Admin account with an explicitly assigned permission set.
    Only active Super Admins are authorized to provision Staff Admins.
    """
    if not super_admin or not super_admin.is_authenticated or not super_admin.is_superuser:
        raise ValidationError("Only active Super Admins are authorized to provision staff admins.")

    if not super_admin.is_active:
        raise ValidationError("Acting Super Admin account is inactive.")

    if not username or not username.strip():
        raise ValidationError("Username is required.")

    if not email or not email.strip():
        raise ValidationError("Email is required.")

    clean_username = username.strip()
    clean_email = email.strip().lower()

    try:
        validate_email(clean_email)
    except ValidationError:
        raise ValidationError("A valid email address is required.")

    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long.")

    if permissions is None or not isinstance(permissions, (list, tuple, set)):
        raise ValidationError("Permissions list is required.")

    # Validate permissions against staff assignable set
    cleaned_permissions = []
    for perm in permissions:
        if not isinstance(perm, str):
            continue
        p = perm.strip()
        if p in AdminPermission.SUPER_ADMIN_EXCLUSIVE:
            raise ValidationError(
                f"Permission '{p}' is reserved exclusively for Super Admins and cannot be granted to Staff Admins."
            )
        if p not in AdminPermission.STAFF_ASSIGNABLE_PERMISSIONS:
            raise ValidationError(f"Unrecognized permission identifier: '{p}'.")
        if p not in cleaned_permissions:
            cleaned_permissions.append(p)

    with transaction.atomic():
        if User.objects.filter(username__iexact=clean_username).exists():
            raise ValidationError(f"A user with username '{clean_username}' already exists.")

        if User.objects.filter(email__iexact=clean_email).exists():
            raise ValidationError(f"A user with email '{clean_email}' already exists.")

        staff_user = User.objects.create_user(
            username=clean_username,
            email=clean_email,
            password=password,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=False,
            is_email_verified=True
        )

        admin_profile = AdminProfile.objects.create(
            user=staff_user,
            permissions=cleaned_permissions,
            created_by=super_admin
        )

        log_admin_action(
            actor=super_admin,
            action="STAFF_ADMIN_PROVISIONED",
            target_type="USER",
            target_id=staff_user.id,
            target_repr=staff_user.username,
            summary=f"Super Admin '{super_admin.username}' provisioned Staff Admin '{staff_user.username}' with {len(cleaned_permissions)} permissions.",
            changes={"assigned_permissions": cleaned_permissions},
            request=request
        )

    return staff_user, admin_profile


def update_staff_admin_permissions(
    super_admin: User,
    target_user: User,
    new_permissions: List[str],
    request=None
) -> AdminProfile:
    """
    Updates the permissions of an existing Staff Admin account.
    Staff Admins cannot modify their own permissions or other staff permissions.
    """
    if not super_admin or not super_admin.is_authenticated or not super_admin.is_superuser:
        raise ValidationError("Only active Super Admins are authorized to update staff permissions.")

    if not super_admin.is_active:
        raise ValidationError("Acting Super Admin account is inactive.")

    if target_user.pk == super_admin.pk:
        raise ValidationError("Super Admins cannot modify their own permissions via staff management.")

    if target_user.is_superuser:
        raise ValidationError("Super Admin permissions are fixed and cannot be modified as Staff Admin.")

    if not target_user.is_staff or target_user.role != User.Role.ADMIN:
        raise ValidationError("Target user is not a Staff Admin.")

    if new_permissions is None or not isinstance(new_permissions, (list, tuple, set)):
        raise ValidationError("Permissions list is required.")

    # Validate permissions
    cleaned_permissions = []
    for perm in new_permissions:
        if not isinstance(perm, str):
            continue
        p = perm.strip()
        if p in AdminPermission.SUPER_ADMIN_EXCLUSIVE:
            raise ValidationError(
                f"Permission '{p}' is reserved exclusively for Super Admins and cannot be granted to Staff Admins."
            )
        if p not in AdminPermission.STAFF_ASSIGNABLE_PERMISSIONS:
            raise ValidationError(f"Unrecognized permission identifier: '{p}'.")
        if p not in cleaned_permissions:
            cleaned_permissions.append(p)

    with transaction.atomic():
        profile, _ = AdminProfile.objects.get_or_create(user=target_user)
        old_permissions = list(profile.permissions)
        profile.permissions = cleaned_permissions
        profile.save()

        log_admin_action(
            actor=super_admin,
            action="STAFF_PERMISSIONS_UPDATED",
            target_type="USER",
            target_id=target_user.id,
            target_repr=target_user.username,
            summary=f"Permissions updated for Staff Admin '{target_user.username}'.",
            changes={
                "previous_permissions": old_permissions,
                "new_permissions": cleaned_permissions
            },
            request=request
        )

    return profile


def deactivate_admin_account(
    super_admin: User,
    target_user: User,
    reason: str = "",
    request=None
) -> User:
    """
    Deactivates an administrative user. Protects against deactivating
    the last remaining active Super Admin with atomic row-level locks.
    """
    if not super_admin or not super_admin.is_authenticated or not super_admin.is_superuser:
        raise ValidationError("Only active Super Admins are authorized to deactivate admin accounts.")

    if not super_admin.is_active:
        raise ValidationError("Acting Super Admin account is inactive.")

    if target_user.role != User.Role.ADMIN and not target_user.is_staff and not target_user.is_superuser:
        raise ValidationError("Target user is not an administrative user.")

    with transaction.atomic():
        # Guard the last remaining active Super Admin with atomic select_for_update lock
        if target_user.is_superuser:
            active_superusers = User.objects.select_for_update().filter(is_superuser=True, is_active=True).count()
            if active_superusers <= 1:
                raise ValidationError("Cannot deactivate the last remaining active Super Admin account.")

        target_user.is_active = False
        target_user.save(update_fields=['is_active'])

        if hasattr(target_user, 'admin_profile'):
            target_user.admin_profile.is_active = False
            target_user.admin_profile.save(update_fields=['is_active'])

        log_admin_action(
            actor=super_admin,
            action="ADMIN_ACCOUNT_DEACTIVATED",
            target_type="USER",
            target_id=target_user.id,
            target_repr=target_user.username,
            summary=f"Admin account '{target_user.username}' deactivated. Reason: {reason or 'No reason provided'}",
            changes={"reason": reason, "is_active": False},
            request=request
        )

    return target_user


def activate_admin_account(
    super_admin: User,
    target_user: User,
    reason: str = "",
    request=None
) -> User:
    """
    Activates a previously deactivated administrative user and their AdminProfile.
    Only active Super Admins are authorized.
    """
    if not super_admin or not super_admin.is_authenticated or not super_admin.is_superuser:
        raise ValidationError("Only active Super Admins are authorized to activate admin accounts.")

    if not super_admin.is_active:
        raise ValidationError("Acting Super Admin account is inactive.")

    if target_user.role != User.Role.ADMIN and not target_user.is_staff and not target_user.is_superuser:
        raise ValidationError("Target user is not an administrative user.")

    with transaction.atomic():
        target_user.is_active = True
        target_user.save(update_fields=['is_active'])

        if hasattr(target_user, 'admin_profile'):
            target_user.admin_profile.is_active = True
            target_user.admin_profile.save(update_fields=['is_active'])

        log_admin_action(
            actor=super_admin,
            action="ADMIN_ACCOUNT_ACTIVATED",
            target_type="USER",
            target_id=target_user.id,
            target_repr=target_user.username,
            summary=f"Admin account '{target_user.username}' activated. Reason: {reason or 'No reason provided'}",
            changes={"reason": reason, "is_active": True},
            request=request
        )

    return target_user
