import io
from django.test import TestCase, RequestFactory
from django.core.exceptions import ValidationError
from django.core.management import call_command, CommandError
from django.urls import reverse
from rest_framework.test import APIRequestFactory, APIClient, force_authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied

from users.models import User, CandidateProfile, RecruiterProfile
from companies.models import Company
from jobs.models import Job
from applications.models import Application
from ai_engine.models import ResumeAnalysis

from .models import AdminProfile, AuditLog
from .constants import AdminPermission
from .permissions import HasAdminPermission, IsSuperAdmin
from .services import (
    log_admin_action,
    sanitize_audit_metadata,
    provision_staff_admin,
    update_staff_admin_permissions,
    deactivate_admin_account,
    activate_admin_account
)


# Test API Views to verify permission enforcement
class DashboardView(APIView):
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.DASHBOARD_VIEW

    def get(self, request):
        return Response({"status": "dashboard_granted"})


class StaffAdminsManageView(APIView):
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.STAFF_ADMINS_MANAGE

    def post(self, request):
        return Response({"status": "manage_granted"})


class MultiPermView(APIView):
    permission_classes = [HasAdminPermission]
    required_admin_permission = [AdminPermission.USERS_VIEW, AdminPermission.USERS_MANAGE]

    def get(self, request):
        return Response({"status": "users_manage_granted"})


class FailClosedView(APIView):
    permission_classes = [HasAdminPermission]
    # No required_admin_permission defined -> must fail closed to superuser only

    def get(self, request):
        return Response({"status": "fail_closed_granted"})


class SuperAdminOnlyView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        return Response({"status": "super_admin_only_granted"})


class ActionDictView(APIView):
    permission_classes = [HasAdminPermission]
    required_admin_permission = {
        'get': AdminPermission.JOBS_VIEW,
        'post': AdminPermission.JOBS_MODERATE
    }

    def get(self, request):
        return Response({"status": "jobs_view_granted"})

    def post(self, request):
        return Response({"status": "jobs_moderate_granted"})


class AdminPermissionEnforcementTests(TestCase):
    """
    Tests for Admin identity verification and DRF permission enforcement.
    Covers: Super Admin, Staff Admin, Candidate, Recruiter, Inactive, and Tampering.
    """

    def setUp(self):
        self.rf = APIRequestFactory()

        # 1. Super Admin
        self.super_admin = User.objects.create_superuser(
            username="superadmin",
            email="superadmin@example.com",
            password="SuperPassword123!",
            role=User.Role.ADMIN
        )

        # 2. Staff Admin with dashboard.view
        self.staff_admin = User.objects.create_user(
            username="staffadmin",
            email="staffadmin@example.com",
            password="StaffPassword123!",
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=False,
            is_email_verified=True
        )
        self.staff_profile = AdminProfile.objects.create(
            user=self.staff_admin,
            permissions=[AdminPermission.DASHBOARD_VIEW, AdminPermission.USERS_VIEW],
            is_active=True,
            created_by=self.super_admin
        )

        # 3. Staff Admin without profile
        self.orphan_staff = User.objects.create_user(
            username="orphanstaff",
            email="orphanstaff@example.com",
            password="StaffPassword123!",
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=False,
            is_email_verified=True
        )

        # 4. Candidate
        self.candidate = User.objects.create_user(
            username="candidate1",
            email="candidate1@example.com",
            password="CandidatePass123!",
            role=User.Role.CANDIDATE,
            is_staff=False,
            is_superuser=False,
            is_email_verified=True
        )

        # 5. Recruiter
        self.recruiter = User.objects.create_user(
            username="recruiter1",
            email="recruiter1@example.com",
            password="RecruiterPass123!",
            role=User.Role.RECRUITER,
            is_staff=False,
            is_superuser=False,
            is_email_verified=True
        )

    def test_super_admin_receives_all_permissions(self):
        """Super Admin has unrestricted access to all admin endpoints."""
        view = DashboardView.as_view()
        request = self.rf.get("/api/admin/dashboard/")
        force_authenticate(request, user=self.super_admin)
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Super Admin exclusive view
        view_manage = StaffAdminsManageView.as_view()
        req_manage = self.rf.post("/api/admin/staff-admins/")
        force_authenticate(req_manage, user=self.super_admin)
        res_manage = view_manage(req_manage)
        self.assertEqual(res_manage.status_code, status.HTTP_200_OK)

        # View without required_admin_permission attribute
        view_fail_closed = FailClosedView.as_view()
        req_fc = self.rf.get("/api/admin/fail-closed/")
        force_authenticate(req_fc, user=self.super_admin)
        res_fc = view_fail_closed(req_fc)
        self.assertEqual(res_fc.status_code, status.HTTP_200_OK)

    def test_staff_admin_receives_only_assigned_permissions(self):
        """Staff Admin can access endpoints matching assigned permissions."""
        view = DashboardView.as_view()
        request = self.rf.get("/api/admin/dashboard/")
        force_authenticate(request, user=self.staff_admin)
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_staff_admin_denied_for_unassigned_permissions(self):
        """Staff Admin is denied (403) when lacking required permission."""
        # MultiPermView requires USERS_VIEW AND USERS_MANAGE; staff_admin only has USERS_VIEW
        view = MultiPermView.as_view()
        request = self.rf.get("/api/admin/users/manage/")
        force_authenticate(request, user=self.staff_admin)
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_admin_denied_for_super_admin_exclusive_permissions(self):
        """Staff Admin is strictly denied for Super Admin exclusive permissions."""
        view = StaffAdminsManageView.as_view()
        request = self.rf.post("/api/admin/staff-admins/")
        force_authenticate(request, user=self.staff_admin)
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_admin_with_no_profile_is_denied(self):
        """Staff Admin lacking an AdminProfile is denied with 403."""
        view = DashboardView.as_view()
        request = self.rf.get("/api/admin/dashboard/")
        force_authenticate(request, user=self.orphan_staff)
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_admin_with_inactive_profile_is_denied(self):
        """Staff Admin with is_active=False on profile is denied with 403."""
        self.staff_profile.is_active = False
        self.staff_profile.save()

        view = DashboardView.as_view()
        request = self.rf.get("/api/admin/dashboard/")
        force_authenticate(request, user=self.staff_admin)
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_candidate_and_recruiter_denied_admin_access(self):
        """Candidates and Recruiters are always denied access (403)."""
        view = DashboardView.as_view()

        # Candidate
        req_cand = self.rf.get("/api/admin/dashboard/")
        force_authenticate(req_cand, user=self.candidate)
        res_cand = view(req_cand)
        self.assertEqual(res_cand.status_code, status.HTTP_403_FORBIDDEN)

        # Recruiter
        req_rec = self.rf.get("/api/admin/dashboard/")
        force_authenticate(req_rec, user=self.recruiter)
        res_rec = view(req_rec)
        self.assertEqual(res_rec.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_request_denied(self):
        """Unauthenticated requests are denied with 401."""
        view = DashboardView.as_view()
        request = self.rf.get("/api/admin/dashboard/")
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_inactive_user_denied(self):
        """Inactive user accounts are denied with 403."""
        self.staff_admin.is_active = False
        self.staff_admin.save()

        view = DashboardView.as_view()
        request = self.rf.get("/api/admin/dashboard/")
        force_authenticate(request, user=self.staff_admin)
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_supplied_role_or_permission_tampering_fails(self):
        """Client sending role='ADMIN' or custom permissions in payload/params cannot bypass access control."""
        view = DashboardView.as_view()

        # Candidate attempts to inject role=ADMIN in body and query params
        req = self.rf.get("/api/admin/dashboard/?role=ADMIN&permissions=dashboard.view&is_staff=true")
        force_authenticate(req, user=self.candidate)
        response = view(request=req)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_is_super_admin_permission_class(self):
        """IsSuperAdmin rejects non-superusers."""
        view = SuperAdminOnlyView.as_view()

        # Super admin passes
        req1 = self.rf.get("/api/admin/super/")
        force_authenticate(req1, user=self.super_admin)
        res1 = view(req1)
        self.assertEqual(res1.status_code, status.HTTP_200_OK)

        # Staff admin rejected
        req2 = self.rf.get("/api/admin/super/")
        force_authenticate(req2, user=self.staff_admin)
        res2 = view(req2)
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)

    def test_view_with_dict_required_admin_permission(self):
        """Action-based dictionary permission mapping works correctly per HTTP method/action."""
        view = ActionDictView.as_view()

        # Staff has JOBS_VIEW (not JOBS_MODERATE): GET should succeed, POST should be forbidden
        self.staff_profile.permissions = [AdminPermission.JOBS_VIEW]
        self.staff_profile.save()

        get_req = self.rf.get("/api/admin/jobs/")
        force_authenticate(get_req, user=self.staff_admin)
        get_res = view(get_req)
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)

        post_req = self.rf.post("/api/admin/jobs/")
        force_authenticate(post_req, user=self.staff_admin)
        post_res = view(post_req)
        self.assertEqual(post_res.status_code, status.HTTP_403_FORBIDDEN)

    def test_has_object_permission_delegates_to_has_permission(self):
        """Object-level permission checks re-enforce admin authorization."""
        perm = HasAdminPermission()
        view = DashboardView()

        raw_req_cand = self.rf.get("/api/admin/dashboard/")
        force_authenticate(raw_req_cand, user=self.candidate)
        drf_req_cand = view.initialize_request(raw_req_cand)

        with self.assertRaises(PermissionDenied):
            perm.has_object_permission(drf_req_cand, view, obj=self.candidate)

        raw_req_super = self.rf.get("/api/admin/dashboard/")
        force_authenticate(raw_req_super, user=self.super_admin)
        drf_req_super = view.initialize_request(raw_req_super)
        self.assertTrue(perm.has_object_permission(drf_req_super, view, obj=self.candidate))

    def test_admin_profile_save_cleans_and_strips_exclusive_permissions_for_staff(self):
        """AdminProfile.save strips super admin exclusive permissions and duplicate permissions for staff."""
        temp_staff = User.objects.create_user(
            username="clean_staff_test",
            email="cleanstaff@example.com",
            password="StaffPass123!",
            role=User.Role.ADMIN,
            is_staff=True
        )
        profile = AdminProfile.objects.create(
            user=temp_staff,
            permissions=[
                AdminPermission.JOBS_VIEW,
                AdminPermission.JOBS_VIEW,  # duplicate
                AdminPermission.STAFF_ADMINS_MANAGE,  # exclusive
                "invalid.permission.identifier"
            ]
        )
        self.assertEqual(profile.permissions, [AdminPermission.JOBS_VIEW])


class StaffAdminProvisioningServiceTests(TestCase):
    """
    Tests for backend Staff Admin provisioning, permission modifications,
    and Super Admin protection rules.
    """

    def setUp(self):
        self.super_admin = User.objects.create_superuser(
            username="main_admin",
            email="main_admin@example.com",
            password="AdminPassword123!",
            role=User.Role.ADMIN
        )
        self.candidate = User.objects.create_user(
            username="normal_user",
            email="normal@example.com",
            password="UserPass123!",
            role=User.Role.CANDIDATE
        )

    def test_super_admin_can_provision_staff_admin(self):
        """Super Admin can provision a valid Staff Admin account."""
        staff_user, profile = provision_staff_admin(
            super_admin=self.super_admin,
            username="newstaff",
            email="newstaff@example.com",
            password="StaffPassword123!",
            permissions=[AdminPermission.DASHBOARD_VIEW, AdminPermission.JOBS_VIEW]
        )
        self.assertEqual(staff_user.role, User.Role.ADMIN)
        self.assertTrue(staff_user.is_staff)
        self.assertFalse(staff_user.is_superuser)
        self.assertTrue(staff_user.is_email_verified)
        self.assertEqual(profile.permissions, [AdminPermission.DASHBOARD_VIEW, AdminPermission.JOBS_VIEW])
        self.assertTrue(profile.is_active)
        self.assertEqual(profile.created_by, self.super_admin)

    def test_non_super_admin_cannot_provision_staff_admin(self):
        """Candidates, Recruiters, and Staff Admins cannot provision Staff Admins."""
        with self.assertRaises(ValidationError) as cm:
            provision_staff_admin(
                super_admin=self.candidate,
                username="hackerstaff",
                email="hacker@example.com",
                password="StaffPassword123!",
                permissions=[AdminPermission.DASHBOARD_VIEW]
            )
        self.assertIn("Only active Super Admins", str(cm.exception))

    def test_cannot_assign_super_admin_exclusive_permissions_to_staff(self):
        """Staff Admins cannot be granted exclusive permissions (e.g. staff_admins.manage)."""
        with self.assertRaises(ValidationError) as cm:
            provision_staff_admin(
                super_admin=self.super_admin,
                username="greedy_staff",
                email="greedy@example.com",
                password="StaffPassword123!",
                permissions=[AdminPermission.STAFF_ADMINS_MANAGE]
            )
        self.assertIn("reserved exclusively for Super Admins", str(cm.exception))

    def test_cannot_assign_unrecognized_permissions(self):
        """Arbitrary strings cannot be assigned as permissions."""
        with self.assertRaises(ValidationError) as cm:
            provision_staff_admin(
                super_admin=self.super_admin,
                username="arbitrary_staff",
                email="arbitrary@example.com",
                password="StaffPassword123!",
                permissions=["invalid.arbitrary.permission"]
            )
        self.assertIn("Unrecognized permission identifier", str(cm.exception))

    def test_super_admin_can_update_staff_permissions(self):
        """Super Admin can update an existing Staff Admin's permissions."""
        staff_user, profile = provision_staff_admin(
            super_admin=self.super_admin,
            username="modstaff",
            email="modstaff@example.com",
            password="StaffPassword123!",
            permissions=[AdminPermission.DASHBOARD_VIEW]
        )
        updated_profile = update_staff_admin_permissions(
            super_admin=self.super_admin,
            target_user=staff_user,
            new_permissions=[AdminPermission.JOBS_VIEW, AdminPermission.JOBS_MODERATE]
        )
        self.assertEqual(updated_profile.permissions, [AdminPermission.JOBS_VIEW, AdminPermission.JOBS_MODERATE])

    def test_staff_admin_cannot_self_escalate_or_update_permissions(self):
        """Staff Admin cannot call update_staff_admin_permissions to self-escalate."""
        staff_user, profile = provision_staff_admin(
            super_admin=self.super_admin,
            username="selfstaff",
            email="selfstaff@example.com",
            password="StaffPassword123!",
            permissions=[AdminPermission.DASHBOARD_VIEW]
        )
        with self.assertRaises(ValidationError) as cm:
            update_staff_admin_permissions(
                super_admin=staff_user,
                target_user=staff_user,
                new_permissions=[AdminPermission.USERS_MANAGE]
            )
        self.assertIn("Only active Super Admins", str(cm.exception))

    def test_last_super_admin_protection(self):
        """The last active Super Admin cannot be deactivated."""
        with self.assertRaises(ValidationError) as cm:
            deactivate_admin_account(
                super_admin=self.super_admin,
                target_user=self.super_admin,
                reason="Test self-deactivation"
            )
        self.assertIn("Cannot deactivate the last remaining active Super Admin", str(cm.exception))

    def test_deactivate_staff_admin_account(self):
        """Super Admin can deactivate a Staff Admin account and profile."""
        staff_user, profile = provision_staff_admin(
            super_admin=self.super_admin,
            username="deactstaff",
            email="deactstaff@example.com",
            password="StaffPassword123!",
            permissions=[AdminPermission.DASHBOARD_VIEW]
        )
        deactivated_user = deactivate_admin_account(
            super_admin=self.super_admin,
            target_user=staff_user,
            reason="Violation of security policy"
        )
        self.assertFalse(deactivated_user.is_active)
        profile.refresh_from_db()
        self.assertFalse(profile.is_active)

    def test_provision_staff_admin_validates_email_format(self):
        """provision_staff_admin rejects invalid email addresses."""
        with self.assertRaises(ValidationError) as cm:
            provision_staff_admin(
                super_admin=self.super_admin,
                username="bademailstaff",
                email="not-an-email",
                password="StaffPassword123!",
                permissions=[AdminPermission.DASHBOARD_VIEW]
            )
        self.assertIn("A valid email address is required", str(cm.exception))

    def test_provision_staff_admin_rejects_none_permissions(self):
        """provision_staff_admin rejects None or invalid permission collections."""
        with self.assertRaises(ValidationError) as cm:
            provision_staff_admin(
                super_admin=self.super_admin,
                username="nonepermstaff",
                email="noneperm@example.com",
                password="StaffPassword123!",
                permissions=None
            )
        self.assertIn("Permissions list is required", str(cm.exception))

    def test_update_staff_admin_permissions_rejects_none_permissions(self):
        """update_staff_admin_permissions rejects None permissions."""
        staff_user, _ = provision_staff_admin(
            super_admin=self.super_admin,
            username="permstaff",
            email="permstaff@example.com",
            password="StaffPassword123!",
            permissions=[AdminPermission.DASHBOARD_VIEW]
        )
        with self.assertRaises(ValidationError) as cm:
            update_staff_admin_permissions(
                super_admin=self.super_admin,
                target_user=staff_user,
                new_permissions=None
            )
        self.assertIn("Permissions list is required", str(cm.exception))

    def test_deactivate_admin_account_rejects_non_admin_target(self):
        """deactivate_admin_account rejects deactivation attempts on candidate/recruiter accounts."""
        with self.assertRaises(ValidationError) as cm:
            deactivate_admin_account(
                super_admin=self.super_admin,
                target_user=self.candidate,
                reason="Attempting non-admin deactivation"
            )
        self.assertIn("Target user is not an administrative user", str(cm.exception))


class AuditLogServiceTests(TestCase):
    """
    Tests for AuditLog creation, network context capture,
    and strict recursive secret scrubbing.
    """

    def setUp(self):
        self.rf = RequestFactory()
        self.super_admin = User.objects.create_superuser(
            username="audit_admin",
            email="audit@example.com",
            password="AuditPassword123!",
            role=User.Role.ADMIN
        )

    def test_log_admin_action_creates_record_with_context(self):
        """log_admin_action records action, target, actor, IP, and user-agent."""
        request = self.rf.post(
            "/api/admin/test/",
            HTTP_X_FORWARDED_FOR="198.51.100.42, 10.0.0.1",
            HTTP_USER_AGENT="TestClient/1.0"
        )

        entry = log_admin_action(
            actor=self.super_admin,
            action="TEST_ACTION",
            target_type="TEST_TARGET",
            target_id=123,
            target_repr="Target #123",
            summary="A test administrative action was performed.",
            changes={"status": "approved", "notes": "all good"},
            request=request,
            correlation_id="corr-xyz-789"
        )

        self.assertIsNotNone(entry)
        self.assertEqual(entry.actor, self.super_admin)
        self.assertEqual(entry.action, "TEST_ACTION")
        self.assertEqual(entry.target_type, "TEST_TARGET")
        self.assertEqual(entry.target_id, "123")
        self.assertEqual(entry.ip_address, "198.51.100.42")
        self.assertEqual(entry.user_agent, "TestClient/1.0")
        self.assertEqual(entry.correlation_id, "corr-xyz-789")
        self.assertEqual(entry.metadata["status"], "approved")

    def test_secret_scrubbing_redacts_sensitive_keys(self):
        """sanitize_audit_metadata recursively scrubs passwords, OTPs, tokens, and secrets."""
        dirty_payload = {
            "username": "candidate_jane",
            "password": "SuperSecretPassword123!",
            "nested_auth": {
                "otp": "654321",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "api_key": "gemini-api-key-test-123",
                "safe_info": "safe string"
            },
            "token_list": [
                {"token": "secret_session_token", "label": "auth_header"},
                {"cvv": "123", "card_number": "4111222233334444"}
            ]
        }

        cleaned = sanitize_audit_metadata(dirty_payload)

        self.assertEqual(cleaned["username"], "candidate_jane")
        self.assertEqual(cleaned["password"], "[REDACTED]")
        self.assertEqual(cleaned["nested_auth"]["otp"], "[REDACTED]")
        self.assertEqual(cleaned["nested_auth"]["refresh_token"], "[REDACTED]")
        self.assertEqual(cleaned["nested_auth"]["api_key"], "[REDACTED]")
        self.assertEqual(cleaned["nested_auth"]["safe_info"], "safe string")
        self.assertEqual(cleaned["token_list"][0]["token"], "[REDACTED]")
        self.assertEqual(cleaned["token_list"][0]["label"], "auth_header")
        self.assertEqual(cleaned["token_list"][1]["cvv"], "[REDACTED]")
        self.assertEqual(cleaned["token_list"][1]["card_number"], "[REDACTED]")

    def test_secret_scrubbing_compound_keys_and_token_counters(self):
        """sanitize_audit_metadata redacts compound secret keys while preserving token counters."""
        payload = {
            "auth_token": "bearer-token-123",
            "webhook_secret": "whsec_test_secret_key",
            "private_key": "-----BEGIN PRIVATE KEY-----",
            "prompt_tokens": 150,
            "completion_tokens": 45,
            "total_tokens": 195
        }
        cleaned = sanitize_audit_metadata(payload)
        self.assertEqual(cleaned["auth_token"], "[REDACTED]")
        self.assertEqual(cleaned["webhook_secret"], "[REDACTED]")
        self.assertEqual(cleaned["private_key"], "[REDACTED]")
        self.assertEqual(cleaned["prompt_tokens"], 150)
        self.assertEqual(cleaned["completion_tokens"], 45)
        self.assertEqual(cleaned["total_tokens"], 195)

    def test_extract_client_ip_handles_ports_and_invalid_ips(self):
        """extract_client_ip strips port numbers and discards malformed IP strings."""
        from .services import extract_client_ip

        req_with_port = self.rf.get("/", HTTP_X_FORWARDED_FOR="192.168.1.1:8080")
        self.assertEqual(extract_client_ip(req_with_port), "192.168.1.1")

        req_with_ipv6_port = self.rf.get("/", HTTP_X_FORWARDED_FOR="[2001:db8::1]:8080")
        self.assertEqual(extract_client_ip(req_with_ipv6_port), "2001:db8::1")

        req_invalid = self.rf.get("/", HTTP_X_FORWARDED_FOR="invalid_ip_string")
        self.assertIsNone(extract_client_ip(req_invalid))

    def test_audit_log_preserves_target_when_target_deleted(self):
        """Generic target fields ensure audit log remains intact if target is deleted."""
        temp_user = User.objects.create_user(
            username="temp_user",
            email="temp@example.com",
            password="TempPass123!"
        )
        entry = log_admin_action(
            actor=self.super_admin,
            action="USER_DELETED",
            target_type="USER",
            target_id=temp_user.id,
            target_repr=temp_user.username,
            summary="User account scheduled for deletion."
        )
        temp_user_id = str(temp_user.id)
        temp_user.delete()

        # Audit log still exists
        entry.refresh_from_db()
        self.assertEqual(entry.target_id, temp_user_id)
        self.assertEqual(entry.target_repr, "temp_user")


class AdminRestApiTests(TestCase):
    """
    Integration tests for all Phase 3 Admin REST API endpoints:
    Dashboard stats, User management, Recruiter verification, Job moderation,
    Analytics, AI monitoring, Audit logs, and Staff Admin provisioning.
    """

    def setUp(self):
        self.client = APIClient()

        # 1. Super Admin
        self.super_admin = User.objects.create_superuser(
            username="super_api_admin",
            email="super_api@example.com",
            password="SuperPassword123!",
            role=User.Role.ADMIN
        )

        # 2. Staff Admin with all staff-assignable permissions
        self.staff_full = User.objects.create_user(
            username="staff_full",
            email="staff_full@example.com",
            password="StaffPassword123!",
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=False,
            is_email_verified=True
        )
        self.staff_full_profile = AdminProfile.objects.create(
            user=self.staff_full,
            permissions=list(AdminPermission.STAFF_ASSIGNABLE_PERMISSIONS),
            is_active=True,
            created_by=self.super_admin
        )

        # 3. Staff Admin with limited permissions (dashboard.view only)
        self.staff_limited = User.objects.create_user(
            username="staff_limited",
            email="staff_limited@example.com",
            password="StaffPassword123!",
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=False,
            is_email_verified=True
        )
        self.staff_limited_profile = AdminProfile.objects.create(
            user=self.staff_limited,
            permissions=[AdminPermission.DASHBOARD_VIEW],
            is_active=True,
            created_by=self.super_admin
        )

        # 4. Candidate user
        self.candidate_user = User.objects.create_user(
            username="candidate_api_user",
            email="cand_api@example.com",
            password="CandidatePass123!",
            role=User.Role.CANDIDATE,
            is_email_verified=True
        )
        self.candidate_profile = CandidateProfile.objects.get(user=self.candidate_user)

        # 5. Recruiter user and company
        self.recruiter_user = User.objects.create_user(
            username="recruiter_api_user",
            email="rec_api@example.com",
            password="RecruiterPass123!",
            role=User.Role.RECRUITER,
            is_email_verified=True
        )
        self.recruiter_profile = RecruiterProfile.objects.get(user=self.recruiter_user)
        self.company = Company.objects.create(
            user=self.recruiter_user,
            name="AlphaTech Innovations",
            industry="Software",
            is_verified=False
        )

        # 6. Job
        self.job = Job.objects.create(
            title="Senior Python Architect",
            description="Build scalable distributed services.",
            required_skills=["Python", "Django", "PostgreSQL"],
            salary="$150,000",
            recruiter=self.recruiter_user,
            is_active=True
        )

        # 7. Application
        self.application = Application.objects.create(
            candidate=self.candidate_profile,
            job=self.job,
            resume_score=85,
            status='EVALUATED'
        )

        # 8. ResumeAnalysis
        self.resume_analysis = ResumeAnalysis.objects.create(
            filename="sample_resume.pdf",
            ai_score=90,
            match_percentage=88,
            experience_relevancy=85
        )

    # ---------------------------------------------------------
    # 1. Authentication & Role Boundary Tests
    # ---------------------------------------------------------

    def test_unauthenticated_requests_rejected(self):
        """Unauthenticated requests to admin endpoints return HTTP 401."""
        endpoints = [
            "/api/admin/dashboard/stats/",
            "/api/admin/users/",
            f"/api/admin/users/{self.candidate_user.id}/",
            "/api/admin/recruiters/",
            "/api/admin/jobs/",
            "/api/admin/analytics/",
            "/api/admin/ai-monitoring/",
            "/api/admin/audit-logs/",
            "/api/admin/staff-admins/",
        ]
        for url in endpoints:
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED, f"Failed at {url}")

    def test_candidate_and_recruiter_denied_all_admin_endpoints(self):
        """Candidates and Recruiters receive HTTP 403 on all admin endpoints."""
        endpoints = [
            "/api/admin/dashboard/stats/",
            "/api/admin/users/",
            f"/api/admin/users/{self.candidate_user.id}/",
            "/api/admin/recruiters/",
            "/api/admin/jobs/",
            "/api/admin/analytics/",
            "/api/admin/ai-monitoring/",
            "/api/admin/audit-logs/",
            "/api/admin/staff-admins/",
        ]
        for user in [self.candidate_user, self.recruiter_user]:
            self.client.force_authenticate(user=user)
            for url in endpoints:
                response = self.client.get(url)
                self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN, f"User {user} was not denied at {url}")

    # ---------------------------------------------------------
    # 2. Dashboard Statistics Tests
    # ---------------------------------------------------------

    def test_dashboard_stats_endpoint(self):
        """Authorized admin receives accurate aggregated stats; staff lacking permission is denied."""
        # Staff with permission succeeds
        self.client.force_authenticate(user=self.staff_full)
        response = self.client.get("/api/admin/dashboard/stats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn('users', data)
        self.assertIn('jobs', data)
        self.assertIn('applications', data)
        self.assertIn('companies', data)

        self.assertGreaterEqual(data['users']['total'], 4)
        self.assertGreaterEqual(data['jobs']['total'], 1)
        self.assertGreaterEqual(data['applications']['total'], 1)
        self.assertEqual(data['applications']['by_status']['EVALUATED'], 1)

        # Staff without permission is denied
        self.staff_limited_profile.permissions = []
        self.staff_limited_profile.save()
        self.client.force_authenticate(user=self.staff_limited)
        denied_res = self.client.get("/api/admin/dashboard/stats/")
        self.assertEqual(denied_res.status_code, status.HTTP_403_FORBIDDEN)

    # ---------------------------------------------------------
    # 3. User Management Tests
    # ---------------------------------------------------------

    def test_users_list_and_detail(self):
        """Admin can list and view users without leaking password hashes or sensitive fields."""
        self.client.force_authenticate(user=self.staff_full)

        # List
        list_res = self.client.get("/api/admin/users/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        results = list_res.json()['results']
        self.assertGreaterEqual(len(results), 4)

        # Verify password is not in serialized data
        for u in results:
            self.assertNotIn('password', u)
            self.assertNotIn('password_hash', u)

        # Detail
        detail_res = self.client.get(f"/api/admin/users/{self.candidate_user.id}/")
        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)
        detail_data = detail_res.json()
        self.assertEqual(detail_data['username'], self.candidate_user.username)
        self.assertEqual(detail_data['profile']['type'], 'CANDIDATE')

        # Filter by role
        cand_res = self.client.get("/api/admin/users/?role=CANDIDATE")
        self.assertTrue(all(item['role'] == 'CANDIDATE' for item in cand_res.json()['results']))

    def test_user_status_management_invariants(self):
        """User status toggle respects permissions, protects superusers, and prevents self-deactivation."""
        self.client.force_authenticate(user=self.staff_full)

        # 1. Staff with users.manage can deactivate regular candidate
        patch_res = self.client.patch(
            f"/api/admin/users/{self.candidate_user.id}/status/",
            {"is_active": False, "reason": "Terms violation"}
        )
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.candidate_user.refresh_from_db()
        self.assertFalse(self.candidate_user.is_active)

        # Verify audit log was recorded
        audit = AuditLog.objects.filter(target_type="USER", target_id=str(self.candidate_user.id)).first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.action, "USER_ACCOUNT_DEACTIVATED")

        # 2. Staff Admin CANNOT modify Super Admin status
        deny_super = self.client.patch(
            f"/api/admin/users/{self.super_admin.id}/status/",
            {"is_active": False}
        )
        self.assertEqual(deny_super.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Staff Admin CANNOT modify other Staff Admin status
        deny_staff = self.client.patch(
            f"/api/admin/users/{self.staff_limited.id}/status/",
            {"is_active": False}
        )
        self.assertEqual(deny_staff.status_code, status.HTTP_403_FORBIDDEN)

        # 4. Super Admin CANNOT deactivate oneself
        self.client.force_authenticate(user=self.super_admin)
        deny_self = self.client.patch(
            f"/api/admin/users/{self.super_admin.id}/status/",
            {"is_active": False}
        )
        self.assertEqual(deny_self.status_code, status.HTTP_403_FORBIDDEN)

    # ---------------------------------------------------------
    # 4. Recruiter Verification Tests
    # ---------------------------------------------------------

    def test_recruiter_verification_endpoint(self):
        """Staff with recruiters.verify can view and verify recruiter company with audit logging."""
        self.client.force_authenticate(user=self.staff_full)

        # List recruiters
        list_res = self.client.get("/api/admin/recruiters/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(list_res.json()['results']), 1)

        # Detail
        det_res = self.client.get(f"/api/admin/recruiters/{self.recruiter_user.id}/")
        self.assertEqual(det_res.status_code, status.HTTP_200_OK)
        self.assertEqual(det_res.json()['company']['name'], "AlphaTech Innovations")

        # Verify company
        patch_res = self.client.patch(
            f"/api/admin/recruiters/{self.recruiter_user.id}/verification/",
            {"is_verified": True, "reason": "Verified corporate documents"}
        )
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertTrue(self.company.is_verified)

        # Verify audit log
        audit = AuditLog.objects.filter(target_type="COMPANY", target_id=str(self.company.id)).first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.action, "RECRUITER_VERIFIED")

        # Staff without permission is denied
        self.client.force_authenticate(user=self.staff_limited)
        denied_res = self.client.patch(
            f"/api/admin/recruiters/{self.recruiter_user.id}/verification/",
            {"is_verified": False}
        )
        self.assertEqual(denied_res.status_code, status.HTTP_403_FORBIDDEN)

    # ---------------------------------------------------------
    # 5. Job Moderation Tests
    # ---------------------------------------------------------

    def test_job_moderation_endpoint_does_not_delete(self):
        """Job moderation toggles active status without deleting job or application records."""
        self.client.force_authenticate(user=self.staff_full)

        # List jobs
        list_res = self.client.get("/api/admin/jobs/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(list_res.json()['results']), 1)

        # Deactivate job
        mod_res = self.client.patch(
            f"/api/admin/jobs/{self.job.id}/moderation/",
            {"is_active": False, "reason": "Duplicate posting"}
        )
        self.assertEqual(mod_res.status_code, status.HTTP_200_OK)
        self.job.refresh_from_db()
        self.assertFalse(self.job.is_active)

        # Verify application still exists (no cascade deletion)
        self.assertTrue(Application.objects.filter(job=self.job).exists())

        # Audit log verified
        audit = AuditLog.objects.filter(target_type="JOB", target_id=str(self.job.id)).first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.action, "JOB_DEACTIVATED")

        # Staff without jobs.moderate is denied
        self.client.force_authenticate(user=self.staff_limited)
        denied_res = self.client.patch(
            f"/api/admin/jobs/{self.job.id}/moderation/",
            {"is_active": True}
        )
        self.assertEqual(denied_res.status_code, status.HTTP_403_FORBIDDEN)

    # ---------------------------------------------------------
    # 6. Analytics Tests
    # ---------------------------------------------------------

    def test_analytics_endpoint_and_date_validation(self):
        """Analytics endpoint returns aggregated metrics and validates date range parameters."""
        self.client.force_authenticate(user=self.staff_full)

        # Valid default query
        res = self.client.get("/api/admin/analytics/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIn('total_applications', data)
        self.assertIn('score_metrics', data)
        self.assertIn('daily_trends', data)
        self.assertIn('top_jobs', data)

        # Invalid date format returns 400
        bad_format_res = self.client.get("/api/admin/analytics/?start_date=not-a-date")
        self.assertEqual(bad_format_res.status_code, status.HTTP_400_BAD_REQUEST)

        # Inverted date range returns 400
        inverted_res = self.client.get("/api/admin/analytics/?start_date=2026-12-31&end_date=2026-01-01")
        self.assertEqual(inverted_res.status_code, status.HTTP_400_BAD_REQUEST)

        # Date range exceeding 365 days returns 400
        too_long_res = self.client.get("/api/admin/analytics/?start_date=2024-01-01&end_date=2026-01-01")
        self.assertEqual(too_long_res.status_code, status.HTTP_400_BAD_REQUEST)

    # ---------------------------------------------------------
    # 7. AI Monitoring Tests
    # ---------------------------------------------------------

    def test_ai_monitoring_endpoint(self):
        """AI monitoring returns database aggregations and instrumentation notice without calling Gemini."""
        self.client.force_authenticate(user=self.staff_full)

        res = self.client.get("/api/admin/ai-monitoring/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()

        self.assertIn('application_evaluations', data)
        self.assertIn('standalone_resume_analyses', data)
        self.assertIn('instrumentation_notice', data)
        self.assertGreaterEqual(data['application_evaluations']['evaluated_count'], 1)
        self.assertGreaterEqual(data['standalone_resume_analyses']['total_analyses'], 1)

    # ---------------------------------------------------------
    # 8. Audit Logs Tests
    # ---------------------------------------------------------

    def test_audit_logs_read_only_and_filters(self):
        """Audit logs endpoint is read-only, paginated, and supports action filtering."""
        self.client.force_authenticate(user=self.staff_full)

        # Create test audit entry
        log_admin_action(
            actor=self.super_admin,
            action="SPECIAL_AUDIT_ACTION",
            summary="Test audit entry"
        )

        res = self.client.get("/api/admin/audit-logs/?action=SPECIAL_AUDIT_ACTION")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.json()['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['action'], "SPECIAL_AUDIT_ACTION")

        # Mutating audit logs is prohibited (HTTP 405)
        post_res = self.client.post("/api/admin/audit-logs/", {"action": "NEW"})
        self.assertEqual(post_res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        delete_res = self.client.delete("/api/admin/audit-logs/")
        self.assertEqual(delete_res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    # ---------------------------------------------------------
    # 9. Staff Admin Management Tests (Super Admin Exclusive)
    # ---------------------------------------------------------

    def test_staff_admin_management_super_admin_exclusive(self):
        """Only Super Admins can list, provision, update permissions, or toggle status of Staff Admins."""
        # 1. Staff Admins are denied all staff-admin endpoints (403)
        self.client.force_authenticate(user=self.staff_full)

        deny_list = self.client.get("/api/admin/staff-admins/")
        self.assertEqual(deny_list.status_code, status.HTTP_403_FORBIDDEN)

        deny_create = self.client.post("/api/admin/staff-admins/", {
            "username": "hacker_staff",
            "email": "hacker@test.com",
            "password": "Password123!",
            "permissions": [AdminPermission.DASHBOARD_VIEW]
        })
        self.assertEqual(deny_create.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Super Admin can list staff admins
        self.client.force_authenticate(user=self.super_admin)
        list_res = self.client.get("/api/admin/staff-admins/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)

        # 3. Super Admin can provision a new Staff Admin
        create_res = self.client.post("/api/admin/staff-admins/", {
            "username": "api_provisioned_staff",
            "email": "provisioned@example.com",
            "password": "StaffPassword123!",
            "permissions": [AdminPermission.DASHBOARD_VIEW, AdminPermission.JOBS_VIEW]
        })
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        new_staff_id = create_res.json()['user_id']

        # 4. Super Admin can update permissions
        perm_res = self.client.patch(
            f"/api/admin/staff-admins/{new_staff_id}/permissions/",
            {"permissions": [AdminPermission.JOBS_VIEW, AdminPermission.JOBS_MODERATE]}
        )
        self.assertEqual(perm_res.status_code, status.HTTP_200_OK)
        self.assertEqual(
            perm_res.json()['permissions'],
            [AdminPermission.JOBS_VIEW, AdminPermission.JOBS_MODERATE]
        )

        # 5. Super Admin can deactivate and reactivate staff admin status
        deact_res = self.client.patch(
            f"/api/admin/staff-admins/{new_staff_id}/status/",
            {"is_active": False, "reason": "Temporary suspension"}
        )
        self.assertEqual(deact_res.status_code, status.HTTP_200_OK)
        self.assertFalse(deact_res.json()['is_active'])

        react_res = self.client.patch(
            f"/api/admin/staff-admins/{new_staff_id}/status/",
            {"is_active": True, "reason": "Reinstated"}
        )
        self.assertEqual(react_res.status_code, status.HTTP_200_OK)
        self.assertTrue(react_res.json()['is_active'])


class ComprehensiveRBACTests(TestCase):
    """
    Focused test suite covering all 12 primary RBAC and administrative security requirements:
    1. Public registration cannot create Superadmin or Staff Admin.
    2. Candidate and Recruiter cannot access administrative endpoints.
    3. Staff Admin cannot access Superadmin-only endpoints.
    4. Staff Admin cannot perform actions without corresponding permission.
    5. Staff Admin with job_moderation can moderate jobs but cannot manage users without user_management.
    6. Staff Admin cannot grant permissions, promote themselves, or modify protected role fields.
    7. Superadmin can manage Staff Admin accounts and their allowed permissions.
    8. Unauthorized and unauthenticated requests return appropriate status codes (401 vs 403).
    9. Object-level authorization prevents unauthorized resource modifications.
    10. Revoked permissions are enforced immediately on subsequent backend requests.
    11. Critical administrative safeguards prevent accidental loss of the last Superadmin account.
    12. bootstrap_superadmin management command securely provisions the initial Superadmin.
    """

    def setUp(self):
        self.client = APIClient()

        # Super Admin
        self.super_admin = User.objects.create_superuser(
            username="test_superadmin",
            email="superadmin@airecruitment.com",
            password="SuperPassword123!",
            role=User.Role.ADMIN
        )

        # Candidate
        self.candidate = User.objects.create_user(
            username="test_candidate_user",
            email="candidate@airecruitment.com",
            password="CandidatePassword123!",
            role=User.Role.CANDIDATE,
            is_email_verified=True
        )

        # Recruiter
        self.recruiter = User.objects.create_user(
            username="test_recruiter_user",
            email="recruiter@airecruitment.com",
            password="RecruiterPassword123!",
            role=User.Role.RECRUITER,
            is_email_verified=True
        )

        # Staff Admin with job_moderation only
        self.job_moderator_staff = User.objects.create_user(
            username="job_mod_staff",
            email="jobmod@airecruitment.com",
            password="StaffPassword123!",
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=False,
            is_email_verified=True
        )
        self.job_mod_profile = AdminProfile.objects.create(
            user=self.job_moderator_staff,
            permissions=[AdminPermission.JOBS_VIEW, AdminPermission.JOBS_MODERATE],
            created_by=self.super_admin
        )

        # Create a sample job for moderation tests
        self.sample_job = Job.objects.create(
            recruiter=self.recruiter,
            title="Senior Full-Stack Engineer",
            description="Leading AI development team",
            type="Full-time",
            is_active=True
        )

    def test_01_public_registration_cannot_create_superadmin_or_staff_admin(self):
        """Attacker passes role=ADMIN, is_staff=True, is_superuser=True to public register."""
        attack_payloads = [
            {"username": "hacker1", "email": "h1@test.com", "password": "Password123!", "role": "ADMIN"},
            {"username": "hacker2", "email": "h2@test.com", "password": "Password123!", "role": "SUPERADMIN"},
            {"username": "hacker3", "email": "h3@test.com", "password": "Password123!", "is_staff": True},
            {"username": "hacker4", "email": "h4@test.com", "password": "Password123!", "is_superuser": True},
        ]
        for payload in attack_payloads:
            res = self.client.post("/api/users/register/", payload)
            if res.status_code == 201:
                # If registration succeeded (e.g. ignoring is_staff/is_superuser fields), verify role was NOT escalated
                created_user = User.objects.get(username=payload['username'])
                self.assertNotEqual(created_user.role, User.Role.ADMIN)
                self.assertFalse(created_user.is_staff)
                self.assertFalse(created_user.is_superuser)
            else:
                self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_02_candidate_and_recruiter_cannot_access_administrative_endpoints(self):
        """Candidates and Recruiters must receive 403 Forbidden on all admin endpoints."""
        endpoints = [
            "/api/admin/dashboard/stats/",
            "/api/admin/users/",
            "/api/admin/jobs/",
            "/api/admin/analytics/",
            "/api/admin/audit-logs/",
            "/api/admin/staff-admins/",
        ]
        for user in [self.candidate, self.recruiter]:
            self.client.force_authenticate(user=user)
            for url in endpoints:
                res = self.client.get(url)
                self.assertEqual(
                    res.status_code,
                    status.HTTP_403_FORBIDDEN,
                    f"User {user.username} with role {user.role} was not denied access to {url}"
                )

    def test_03_staff_admin_cannot_access_superadmin_only_endpoints(self):
        """Staff Admin cannot access Superadmin exclusive management endpoints."""
        self.client.force_authenticate(user=self.job_moderator_staff)

        # Cannot list or create staff admins
        res_list = self.client.get("/api/admin/staff-admins/")
        self.assertEqual(res_list.status_code, status.HTTP_403_FORBIDDEN)

        res_create = self.client.post("/api/admin/staff-admins/", {
            "username": "unauthorized_staff",
            "email": "unauth@test.com",
            "password": "Password123!",
            "permissions": [AdminPermission.DASHBOARD_VIEW]
        })
        self.assertEqual(res_create.status_code, status.HTTP_403_FORBIDDEN)

        # Cannot access assignable-permissions endpoint
        res_perms = self.client.get("/api/admin/staff-admins/assignable-permissions/")
        self.assertEqual(res_perms.status_code, status.HTTP_403_FORBIDDEN)

    def test_04_staff_admin_cannot_perform_actions_without_corresponding_permission(self):
        """Staff Admin with only jobs permissions cannot view users, audit logs, or analytics."""
        self.client.force_authenticate(user=self.job_moderator_staff)

        # Denied users view
        res_users = self.client.get("/api/admin/users/")
        self.assertEqual(res_users.status_code, status.HTTP_403_FORBIDDEN)

        # Denied analytics view
        res_analytics = self.client.get("/api/admin/analytics/")
        self.assertEqual(res_analytics.status_code, status.HTTP_403_FORBIDDEN)

        # Denied audit logs view
        res_audit = self.client.get("/api/admin/audit-logs/")
        self.assertEqual(res_audit.status_code, status.HTTP_403_FORBIDDEN)

    def test_05_staff_admin_with_job_moderation_can_moderate_jobs_but_not_manage_users(self):
        """Staff Admin can perform authorized job moderation but cannot manage user statuses."""
        self.client.force_authenticate(user=self.job_moderator_staff)

        # Can view jobs
        res_jobs = self.client.get("/api/admin/jobs/")
        self.assertEqual(res_jobs.status_code, status.HTTP_200_OK)

        # Can moderate job (deactivate job)
        res_mod = self.client.patch(
            f"/api/admin/jobs/{self.sample_job.id}/moderation/",
            {"is_active": False, "reason": "Violates job posting policy"}
        )
        self.assertEqual(res_mod.status_code, status.HTTP_200_OK)
        self.sample_job.refresh_from_db()
        self.assertFalse(self.sample_job.is_active)

        # Cannot modify candidate user status
        res_user_status = self.client.patch(
            f"/api/admin/users/{self.candidate.id}/status/",
            {"is_active": False, "reason": "Unauthorized attempt"}
        )
        self.assertEqual(res_user_status.status_code, status.HTTP_403_FORBIDDEN)

    def test_06_staff_admin_cannot_grant_permissions_or_escalate_themselves(self):
        """Staff Admin cannot call permissions endpoint to grant themselves or others permissions."""
        self.client.force_authenticate(user=self.job_moderator_staff)

        # Attempt to grant full permissions
        res = self.client.patch(
            f"/api/admin/staff-admins/{self.job_moderator_staff.id}/permissions/",
            {"permissions": [AdminPermission.USERS_MANAGE, AdminPermission.STAFF_ADMINS_MANAGE]}
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Verify permissions were not changed in database
        self.job_mod_profile.refresh_from_db()
        self.assertEqual(
            self.job_mod_profile.permissions,
            [AdminPermission.JOBS_VIEW, AdminPermission.JOBS_MODERATE]
        )

    def test_07_superadmin_can_manage_staff_admins_and_allowed_permissions(self):
        """Superadmin has full lifecycle management of Staff Admin accounts."""
        self.client.force_authenticate(user=self.super_admin)

        # 1. Provision new Staff Admin
        create_res = self.client.post("/api/admin/staff-admins/", {
            "username": "lifecycle_staff",
            "email": "lifecycle@airecruitment.com",
            "password": "SecurePassword123!",
            "permissions": [AdminPermission.DASHBOARD_VIEW]
        })
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        new_staff_id = create_res.json()['user_id']

        # 2. Update allowed permissions
        perm_res = self.client.patch(
            f"/api/admin/staff-admins/{new_staff_id}/permissions/",
            {"permissions": [AdminPermission.DASHBOARD_VIEW, AdminPermission.ANALYTICS_VIEW]}
        )
        self.assertEqual(perm_res.status_code, status.HTTP_200_OK)
        self.assertEqual(
            set(perm_res.json()['permissions']),
            {AdminPermission.DASHBOARD_VIEW, AdminPermission.ANALYTICS_VIEW}
        )

        # 3. Super Admin cannot grant SUPER_ADMIN_EXCLUSIVE to Staff Admin
        invalid_perm_res = self.client.patch(
            f"/api/admin/staff-admins/{new_staff_id}/permissions/",
            {"permissions": [AdminPermission.STAFF_ADMINS_MANAGE]}
        )
        self.assertEqual(invalid_perm_res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_08_unauthorized_and_unauthenticated_status_codes(self):
        """Unauthenticated requests must return 401 Unauthorized."""
        self.client.force_authenticate(user=None)
        res = self.client.get("/api/admin/dashboard/stats/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_09_revoked_permissions_enforced_immediately(self):
        """When permission is revoked, subsequent requests are immediately blocked."""
        # 1. Staff Admin starts with jobs.view permission
        self.client.force_authenticate(user=self.job_moderator_staff)
        res_before = self.client.get("/api/admin/jobs/")
        self.assertEqual(res_before.status_code, status.HTTP_200_OK)

        # 2. Superadmin revokes jobs.view
        self.job_mod_profile.permissions = [AdminPermission.DASHBOARD_VIEW]
        self.job_mod_profile.save()

        # 3. Subsequent request by Staff Admin must now fail with 403
        res_after = self.client.get("/api/admin/jobs/")
        self.assertEqual(res_after.status_code, status.HTTP_403_FORBIDDEN)

    def test_10_critical_safeguard_prevents_deactivating_last_active_superadmin(self):
        """Platform safeguards prevent deactivating the last remaining active Super Admin."""
        # Ensure only 1 active superadmin
        self.assertEqual(User.objects.filter(is_superuser=True, is_active=True).count(), 1)

        self.client.force_authenticate(user=self.super_admin)

        # 1. Self status modification is rejected
        res_self = self.client.patch(
            f"/api/admin/users/{self.super_admin.id}/status/",
            {"is_active": False}
        )
        self.assertEqual(res_self.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Direct service function raises ValidationError
        with self.assertRaises(ValidationError) as ctx:
            deactivate_admin_account(
                super_admin=self.super_admin,
                target_user=self.super_admin,
                reason="Should be blocked"
            )
        self.assertIn("last remaining active Super Admin", str(ctx.exception))

    def test_11_bootstrap_superadmin_command(self):
        """bootstrap_superadmin management command securely creates the initial Superadmin."""
        out = io.StringIO()
        err = io.StringIO()

        # 1. Create a fresh Superadmin via command
        call_command(
            'bootstrap_superadmin',
            '--username=bootstrap_admin',
            '--email=bootstrap@airecruitment.com',
            '--password=BootstrapPassword123!',
            '--no-input',
            stdout=out,
            stderr=err
        )

        created_admin = User.objects.get(username="bootstrap_admin")
        self.assertTrue(created_admin.is_superuser)
        self.assertTrue(created_admin.is_staff)
        self.assertEqual(created_admin.role, User.Role.ADMIN)
        self.assertTrue(created_admin.is_email_verified)

        # Verify audit log was recorded
        log_entry = AuditLog.objects.filter(
            action="SUPER_ADMIN_BOOTSTRAPPED",
            target_repr="bootstrap_admin"
        ).first()
        self.assertIsNotNone(log_entry)
        # Verify password is not in metadata
        self.assertNotIn("password", str(log_entry.metadata))

        # 2. Running again with same username informs user without error or duplication
        out_dup = io.StringIO()
        call_command(
            'bootstrap_superadmin',
            '--username=bootstrap_admin',
            '--email=bootstrap@airecruitment.com',
            '--password=BootstrapPassword123!',
            '--no-input',
            stdout=out_dup
        )
        self.assertIn("already exists", out_dup.getvalue())

        # 3. Running with existing non-admin username fails safely
        with self.assertRaises(CommandError) as ctx:
            call_command(
                'bootstrap_superadmin',
                f'--username={self.candidate.username}',
                '--email=newemail@test.com',
                '--password=BootstrapPassword123!',
                '--no-input'
            )
        self.assertIn("non-superadmin user", str(ctx.exception))

        # 4. Short password fails
        with self.assertRaises(CommandError) as ctx:
            call_command(
                'bootstrap_superadmin',
                '--username=short_pw_admin',
                '--email=short@test.com',
                '--password=short',
                '--no-input'
            )
        self.assertIn("at least 8 characters", str(ctx.exception))

    def test_12_staff_assignable_permissions_endpoint_accessible_only_to_superadmin(self):
        """GET /api/admin/staff-admins/assignable-permissions/ returns metadata to Superadmin, 403 to others."""
        # 1. Super Admin access
        self.client.force_authenticate(user=self.super_admin)
        res = self.client.get("/api/admin/staff-admins/assignable-permissions/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        perm_ids = [item['id'] for item in data]
        self.assertIn(AdminPermission.JOBS_MODERATE, perm_ids)
        self.assertIn(AdminPermission.USERS_MANAGE, perm_ids)
        # Super Admin exclusive permissions must NEVER be in assignable list
        self.assertNotIn(AdminPermission.STAFF_ADMINS_MANAGE, perm_ids)

        # 2. Staff Admin access -> 403
        self.client.force_authenticate(user=self.job_moderator_staff)
        res_staff = self.client.get("/api/admin/staff-admins/assignable-permissions/")
        self.assertEqual(res_staff.status_code, status.HTTP_403_FORBIDDEN)

    def test_13_superadmin_can_promote_candidate_to_staff_admin(self):
        """Superadmin can promote a candidate to staff admin with explicitly assigned permissions."""
        fresh_candidate = User.objects.create_user(
            username="promotable_candidate",
            email="promotable@test.com",
            password="Password123!",
            role=User.Role.CANDIDATE
        )

        # 1. Staff Admin cannot promote users
        self.client.force_authenticate(user=self.job_moderator_staff)
        res_staff = self.client.post(
            f"/api/admin/users/{fresh_candidate.id}/promote-to-staff/",
            {"permissions": [AdminPermission.JOBS_VIEW]},
            format='json'
        )
        self.assertEqual(res_staff.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Superadmin promotes successfully
        self.client.force_authenticate(user=self.super_admin)
        res_super = self.client.post(
            f"/api/admin/users/{fresh_candidate.id}/promote-to-staff/",
            {"permissions": [AdminPermission.JOBS_VIEW, AdminPermission.JOBS_MODERATE]},
            format='json'
        )
        self.assertEqual(res_super.status_code, status.HTTP_200_OK)

        fresh_candidate.refresh_from_db()
        self.assertEqual(fresh_candidate.role, User.Role.ADMIN)
        self.assertTrue(fresh_candidate.is_staff)
        self.assertFalse(fresh_candidate.is_superuser)
        self.assertEqual(
            set(fresh_candidate.admin_profile.permissions),
            {AdminPermission.JOBS_VIEW, AdminPermission.JOBS_MODERATE}
        )

    def test_14_superadmin_can_demote_staff_admin(self):
        """Superadmin can demote a staff admin back to candidate or recruiter."""
        # 1. Staff Admin cannot demote others or self
        self.client.force_authenticate(user=self.job_moderator_staff)
        res_staff = self.client.post(
            f"/api/admin/users/{self.job_moderator_staff.id}/demote-from-staff/",
            {"role": "CANDIDATE"},
            format='json'
        )
        self.assertEqual(res_staff.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Superadmin demotes staff to CANDIDATE
        self.client.force_authenticate(user=self.super_admin)
        res_demote = self.client.post(
            f"/api/admin/users/{self.job_moderator_staff.id}/demote-from-staff/",
            {"role": "CANDIDATE"},
            format='json'
        )
        self.assertEqual(res_demote.status_code, status.HTTP_200_OK)

        self.job_moderator_staff.refresh_from_db()
        self.assertEqual(self.job_moderator_staff.role, User.Role.CANDIDATE)
        self.assertFalse(self.job_moderator_staff.is_staff)
        self.assertEqual(self.job_moderator_staff.admin_profile.permissions, [])
        self.assertFalse(self.job_moderator_staff.admin_profile.is_active)

        # 3. Demoting a non-staff user is rejected
        res_invalid = self.client.post(
            f"/api/admin/users/{self.job_moderator_staff.id}/demote-from-staff/",
            {"role": "CANDIDATE"},
            format='json'
        )
        self.assertEqual(res_invalid.status_code, status.HTTP_400_BAD_REQUEST)
