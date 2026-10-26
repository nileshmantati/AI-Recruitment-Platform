from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from users.models import User
from .constants import AdminPermission


class HasAdminPermission(permissions.BasePermission):
    """
    DRF permission class that enforces administrative access control.
    
    Access Rules:
    1. Unauthenticated requests return False (triggers DRF 401 Unauthorized).
    2. Inactive accounts raise PermissionDenied (403 Forbidden).
    3. Candidates and Recruiters raise PermissionDenied (403 Forbidden).
    4. Super Admins (is_superuser=True and role=ADMIN) have unrestricted access.
    5. Staff Admins (is_staff=True, is_superuser=False and role=ADMIN) must have
       an active AdminProfile with the specific required permission.
    6. If the endpoint requires a Super Admin exclusive permission
       (e.g., 'staff_admins.manage' or 'platform_settings.manage'),
       Staff Admins are rejected with 403 Forbidden.
    7. Fail Closed: If view does not define required_admin_permission,
       access is strictly restricted to Super Admins.
    """
    message = "You do not have administrative permission to access this resource."

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            # Let DRF handle standard 401 Not Authenticated
            return False

        if not user.is_active:
            raise PermissionDenied("This account is inactive. Please contact support.")

        # Ensure user has the ADMIN role
        if getattr(user, 'role', None) != User.Role.ADMIN:
            raise PermissionDenied("Administrative credentials required.")

        # Super Admin: unrestricted access
        if user.is_superuser:
            return True

        # Candidate or Recruiter or non-staff user must never gain admin access
        if not user.is_staff:
            raise PermissionDenied("Staff administrative privileges required.")

        # Determine required permission from view (supports string, list, dict mapping, or callable)
        if hasattr(view, 'get_required_admin_permission') and callable(view.get_required_admin_permission):
            required_perm = view.get_required_admin_permission()
        elif isinstance(getattr(view, 'required_admin_permission', None), dict):
            action = getattr(view, 'action', None) or request.method.lower()
            required_perm = view.required_admin_permission.get(action)
        else:
            required_perm = getattr(view, 'required_admin_permission', None)

        # Fail closed: Endpoints without an explicit permission require Super Admin
        if not required_perm:
            raise PermissionDenied("This administrative endpoint requires Super Admin privileges.")

        # Block Staff Admins from accessing Super-Admin-exclusive actions
        if isinstance(required_perm, (list, tuple, set)):
            if any(p in AdminPermission.SUPER_ADMIN_EXCLUSIVE for p in required_perm):
                raise PermissionDenied("This operation can only be performed by a Super Admin.")
        elif required_perm in AdminPermission.SUPER_ADMIN_EXCLUSIVE:
            raise PermissionDenied("This operation can only be performed by a Super Admin.")

        # Retrieve and validate Staff Admin profile
        profile = getattr(user, 'admin_profile', None)
        if not profile or not profile.is_active:
            raise PermissionDenied("No active administrative profile found for this staff account.")

        # Verify assigned permission(s)
        if isinstance(required_perm, (list, tuple, set)):
            if all(profile.has_permission(p) for p in required_perm):
                return True
        elif profile.has_permission(required_perm):
            return True

        raise PermissionDenied("You do not possess the required administrative permission.")

    def has_object_permission(self, request, view, obj):
        """Re-enforces admin permission checks on object-level access."""
        return self.has_permission(request, view)


class IsSuperAdmin(permissions.BasePermission):
    """
    Strict permission class that only allows authenticated, active Super Admins.
    """
    message = "Super Admin privileges required."

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False

        if not user.is_active:
            raise PermissionDenied("This account is inactive.")

        if getattr(user, 'role', None) != User.Role.ADMIN or not user.is_superuser:
            raise PermissionDenied("Super Admin privileges required.")

        return True

    def has_object_permission(self, request, view, obj):
        """Re-enforces super admin checks on object-level access."""
        return self.has_permission(request, view)
