import logging
from datetime import datetime, timedelta
from django.db import transaction
from django.db.models import Avg, Count, Max, Min, Q
from django.db.models.functions import TruncDate
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import User
from companies.models import Company
from jobs.models import Job
from applications.models import Application
from ai_engine.models import ResumeAnalysis

from .models import AdminProfile, AuditLog
from .constants import AdminPermission, ASSIGNABLE_PERMISSION_METADATA
from .permissions import HasAdminPermission
from .services import (
    log_admin_action,
    provision_staff_admin,
    update_staff_admin_permissions,
    deactivate_admin_account,
    activate_admin_account,
)
from .serializers import (
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AdminUserStatusUpdateSerializer,
    AdminRecruiterListSerializer,
    AdminRecruiterDetailSerializer,
    AdminRecruiterVerificationSerializer,
    AdminJobListSerializer,
    AdminJobModerationSerializer,
    AdminAuditLogSerializer,
    StaffAdminProfileSerializer,
    StaffAdminProvisionSerializer,
    StaffAdminPermissionsUpdateSerializer,
)

logger = logging.getLogger(__name__)


class StandardAdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ==========================================
# 1. Dashboard Statistics
# ==========================================

class AdminDashboardStatsView(APIView):
    """
    GET /api/admin/dashboard/stats/
    Returns aggregated platform metrics across users, jobs, applications, and companies.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.DASHBOARD_VIEW

    def get(self, request):
        # 1. User metrics
        total_users = User.objects.count()
        candidates_count = User.objects.filter(role=User.Role.CANDIDATE).count()
        recruiters_count = User.objects.filter(role=User.Role.RECRUITER).count()
        staff_admins_count = User.objects.filter(role=User.Role.ADMIN, is_staff=True, is_superuser=False).count()
        super_admins_count = User.objects.filter(is_superuser=True).count()
        active_users_count = User.objects.filter(is_active=True).count()
        inactive_users_count = User.objects.filter(is_active=False).count()
        verified_email_count = User.objects.filter(is_email_verified=True).count()
        unverified_email_count = User.objects.filter(is_email_verified=False).count()

        # 2. Job metrics
        total_jobs = Job.objects.count()
        active_jobs = Job.objects.filter(is_active=True).count()
        inactive_jobs = Job.objects.filter(is_active=False).count()

        # 3. Application metrics
        total_applications = Application.objects.count()
        status_counts_qs = Application.objects.values('status').annotate(count=Count('id'))
        status_dict = {item['status']: item['count'] for item in status_counts_qs}
        for st_choice, _ in Application.STATUS_CHOICES:
            status_dict.setdefault(st_choice, 0)

        # 4. Company verification metrics
        total_companies = Company.objects.count()
        verified_companies = Company.objects.filter(is_verified=True).count()
        pending_companies = Company.objects.filter(is_verified=False).count()

        return Response({
            'users': {
                'total': total_users,
                'candidates': candidates_count,
                'recruiters': recruiters_count,
                'staff_admins': staff_admins_count,
                'super_admins': super_admins_count,
                'active': active_users_count,
                'inactive': inactive_users_count,
                'email_verified': verified_email_count,
                'email_unverified': unverified_email_count,
            },
            'jobs': {
                'total': total_jobs,
                'active': active_jobs,
                'inactive': inactive_jobs,
            },
            'applications': {
                'total': total_applications,
                'by_status': status_dict,
            },
            'companies': {
                'total': total_companies,
                'verified': verified_companies,
                'pending_verification': pending_companies,
            }
        }, status=status.HTTP_200_OK)


# ==========================================
# 2. User Management
# ==========================================

class AdminUserListView(APIView):
    """
    GET /api/admin/users/
    Paginated user list with role, active status, email verification, and search filters.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.USERS_VIEW

    def get(self, request):
        # Auto-heal: Ensure any user designated as Staff Admin has an AdminProfile record
        staff_without_profile = User.objects.filter(
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=False,
            admin_profile__isnull=True
        )
        for u in staff_without_profile:
            AdminProfile.objects.get_or_create(user=u, defaults={'permissions': []})

        qs = User.objects.all().select_related(
            'candidate_profile', 'recruiter_profile', 'company', 'admin_profile'
        ).order_by('-date_joined')

        # Filter by role
        role_param = request.query_params.get('role')
        if role_param:
            qs = qs.filter(role=role_param.strip().upper())

        # Filter by active status
        active_param = request.query_params.get('is_active')
        if active_param is not None:
            if active_param.lower() in ('true', '1'):
                qs = qs.filter(is_active=True)
            elif active_param.lower() in ('false', '0'):
                qs = qs.filter(is_active=False)

        # Filter by email verification
        verified_param = request.query_params.get('is_email_verified')
        if verified_param is not None:
            if verified_param.lower() in ('true', '1'):
                qs = qs.filter(is_email_verified=True)
            elif verified_param.lower() in ('false', '0'):
                qs = qs.filter(is_email_verified=False)

        # Search across username, email, first_name, last_name
        search_query = request.query_params.get('search')
        if search_query:
            term = search_query.strip()
            qs = qs.filter(
                Q(username__icontains=term) |
                Q(email__icontains=term) |
                Q(first_name__icontains=term) |
                Q(last_name__icontains=term)
            )

        paginator = StandardAdminPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = AdminUserListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminUserDetailView(APIView):
    """
    GET /api/admin/users/<id>/
    Retrieves full details for a specific user.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.USERS_VIEW

    def get(self, request, user_id):
        user = get_object_or_404(
            User.objects.select_related('candidate_profile', 'recruiter_profile', 'company', 'admin_profile'),
            pk=user_id
        )
        serializer = AdminUserDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUserStatusView(APIView):
    """
    PATCH /api/admin/users/<id>/status/
    Toggles user active/inactive status safely with strict security invariants and audit logging.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.USERS_MANAGE

    def patch(self, request, user_id):
        serializer = AdminUserStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['is_active']
        reason = serializer.validated_data.get('reason', '')

        target_user = get_object_or_404(User, pk=user_id)

        # Invariant 1: Cannot modify own status
        if target_user.pk == request.user.pk:
            raise PermissionDenied("You cannot modify your own administrative status.")

        # Invariant 2: Staff Admin cannot deactivate or modify Super Admins
        if target_user.is_superuser and not request.user.is_superuser:
            raise PermissionDenied("Staff Admins cannot modify Super Admin accounts.")

        # Invariant 3: Staff Admin cannot deactivate or modify other Staff Admins
        if target_user.is_staff and not request.user.is_superuser:
            raise PermissionDenied("Only Super Admins are authorized to modify staff administrative accounts.")

        with transaction.atomic():
            # Invariant 4: Protect the last active Super Admin
            if target_user.is_superuser and not new_status:
                active_superusers = User.objects.select_for_update().filter(is_superuser=True, is_active=True).count()
                if active_superusers <= 1:
                    raise ValidationError("Cannot deactivate the last remaining active Super Admin account.")

            old_status = target_user.is_active
            target_user.is_active = new_status
            target_user.save(update_fields=['is_active'])

            # Update AdminProfile if present
            if hasattr(target_user, 'admin_profile'):
                target_user.admin_profile.is_active = new_status
                target_user.admin_profile.save(update_fields=['is_active'])

            action_name = "USER_ACCOUNT_ACTIVATED" if new_status else "USER_ACCOUNT_DEACTIVATED"
            log_admin_action(
                actor=request.user,
                action=action_name,
                target_type="USER",
                target_id=target_user.id,
                target_repr=target_user.username,
                summary=f"User '{target_user.username}' (ID {target_user.id}) status changed from {old_status} to {new_status}. Reason: {reason or 'No reason provided'}",
                changes={'previous_is_active': old_status, 'new_is_active': new_status, 'reason': reason},
                request=request
            )

        return Response(AdminUserListSerializer(target_user).data, status=status.HTTP_200_OK)


class AdminUserPromoteToStaffView(APIView):
    """
    POST /api/admin/users/<id>/promote-to-staff/
    Promotes an existing user (Candidate or Recruiter) to Staff Admin,
    assigning them explicit permissions. Strictly Superadmin exclusive.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.STAFF_ADMINS_MANAGE

    def post(self, request, user_id):
        target_user = get_object_or_404(User, pk=user_id)

        if target_user.is_superuser:
            raise ValidationError("Target user is already a Super Admin.")

        serializer = StaffAdminPermissionsUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cleaned_permissions = serializer.validated_data['permissions']

        with transaction.atomic():
            old_role = target_user.role
            target_user.role = User.Role.ADMIN
            target_user.is_staff = True
            target_user.is_email_verified = True
            target_user.save(update_fields=['role', 'is_staff', 'is_email_verified'])

            profile, _ = AdminProfile.objects.get_or_create(
                user=target_user,
                defaults={'created_by': request.user}
            )
            profile.permissions = cleaned_permissions
            profile.is_active = True
            if not profile.created_by:
                profile.created_by = request.user
            profile.save()

            log_admin_action(
                actor=request.user,
                action="USER_PROMOTED_TO_STAFF",
                target_type="USER",
                target_id=target_user.id,
                target_repr=target_user.username,
                summary=f"User '{target_user.username}' (formerly {old_role}) promoted to Staff Admin with {len(cleaned_permissions)} permissions.",
                changes={"previous_role": old_role, "new_role": "ADMIN", "permissions": cleaned_permissions},
                request=request
            )

        return Response(StaffAdminProfileSerializer(profile).data, status=status.HTTP_200_OK)


class AdminUserDemoteFromStaffView(APIView):
    """
    POST /api/admin/users/<id>/demote-from-staff/
    Reverts a Staff Admin back to Candidate or Recruiter role. Strictly Superadmin exclusive.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.STAFF_ADMINS_MANAGE

    def post(self, request, user_id):
        target_user = get_object_or_404(User, pk=user_id)

        if target_user.is_superuser:
            raise PermissionDenied("Cannot demote a Super Admin account.")

        if target_user.pk == request.user.pk:
            raise PermissionDenied("You cannot demote your own account.")

        if not target_user.is_staff and target_user.role != User.Role.ADMIN:
            raise ValidationError("Target user is not a Staff Admin.")

        target_role = (request.data.get('role') or User.Role.CANDIDATE).strip().upper()
        if target_role not in (User.Role.CANDIDATE, User.Role.RECRUITER):
            raise ValidationError("Target role must be either CANDIDATE or RECRUITER.")

        with transaction.atomic():
            target_user.role = target_role
            target_user.is_staff = False
            target_user.save(update_fields=['role', 'is_staff'])

            if hasattr(target_user, 'admin_profile'):
                target_user.admin_profile.permissions = []
                target_user.admin_profile.is_active = False
                target_user.admin_profile.save(update_fields=['permissions', 'is_active'])

            log_admin_action(
                actor=request.user,
                action="USER_DEMOTED_FROM_STAFF",
                target_type="USER",
                target_id=target_user.id,
                target_repr=target_user.username,
                summary=f"Staff Admin '{target_user.username}' demoted to {target_role}.",
                changes={"previous_role": "ADMIN", "new_role": target_role},
                request=request
            )

        return Response(AdminUserListSerializer(target_user).data, status=status.HTTP_200_OK)


# ==========================================
# 3. Recruiter Verification
# ==========================================

class AdminRecruiterListView(APIView):
    """
    GET /api/admin/recruiters/
    Lists recruiters and associated companies for verification review.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.RECRUITERS_VERIFY

    def get(self, request):
        qs = User.objects.filter(role=User.Role.RECRUITER).select_related(
            'recruiter_profile', 'company'
        ).prefetch_related('company__documents').order_by('-date_joined')

        # Filter by verification status
        verified_param = request.query_params.get('is_verified')
        if verified_param is not None:
            if verified_param.lower() in ('true', '1'):
                qs = qs.filter(company__is_verified=True)
            elif verified_param.lower() in ('false', '0'):
                qs = qs.filter(Q(company__isnull=True) | Q(company__is_verified=False))

        search_query = request.query_params.get('search')
        if search_query:
            term = search_query.strip()
            qs = qs.filter(
                Q(username__icontains=term) |
                Q(email__icontains=term) |
                Q(company__name__icontains=term) |
                Q(recruiter_profile__company__icontains=term) |
                Q(company__industry__icontains=term)
            )

        paginator = StandardAdminPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = AdminRecruiterListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminRecruiterDetailView(APIView):
    """
    GET /api/admin/recruiters/<id>/
    Retrieves detailed recruiter verification profile including company documents.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.RECRUITERS_VERIFY

    def get(self, request, user_id):
        user = get_object_or_404(
            User.objects.filter(role=User.Role.RECRUITER).select_related('recruiter_profile', 'company'),
            pk=user_id
        )
        serializer = AdminRecruiterDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminRecruiterVerificationView(APIView):
    """
    PATCH /api/admin/recruiters/<id>/verification/
    Updates verification status for a recruiter's company with audit logging.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.RECRUITERS_VERIFY

    def patch(self, request, user_id):
        serializer = AdminRecruiterVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        is_verified = serializer.validated_data['is_verified']
        reason = serializer.validated_data.get('reason', '')

        recruiter_user = get_object_or_404(User.objects.filter(role=User.Role.RECRUITER), pk=user_id)

        with transaction.atomic():
            company, created = Company.objects.get_or_create(
                user=recruiter_user,
                defaults={
                    'name': (
                        recruiter_user.recruiter_profile.company
                        if hasattr(recruiter_user, 'recruiter_profile') and recruiter_user.recruiter_profile.company
                        else f"{recruiter_user.username}'s Company"
                    ),
                    'industry': 'General'
                }
            )

            old_verified = company.is_verified
            company.is_verified = is_verified
            company.save(update_fields=['is_verified'])

            action_name = "RECRUITER_VERIFIED" if is_verified else "RECRUITER_UNVERIFIED"
            log_admin_action(
                actor=request.user,
                action=action_name,
                target_type="COMPANY",
                target_id=company.id,
                target_repr=company.name,
                summary=f"Company '{company.name}' verification set to {is_verified} for recruiter '{recruiter_user.username}'. Reason: {reason or 'No reason provided'}",
                changes={'previous_is_verified': old_verified, 'new_is_verified': is_verified, 'reason': reason},
                request=request
            )

        return Response(AdminRecruiterDetailSerializer(recruiter_user).data, status=status.HTTP_200_OK)


# ==========================================
# 4. Job Moderation
# ==========================================

class AdminJobListView(APIView):
    """
    GET /api/admin/jobs/
    Lists platform jobs with active status filters, search, and pagination.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.JOBS_VIEW

    def get(self, request):
        qs = Job.objects.select_related(
            'recruiter', 'recruiter__company', 'recruiter__recruiter_profile'
        ).annotate(application_count=Count('applications')).order_by('-created_at')

        # Filter by is_active
        active_param = request.query_params.get('is_active')
        if active_param is not None:
            if active_param.lower() in ('true', '1'):
                qs = qs.filter(is_active=True)
            elif active_param.lower() in ('false', '0'):
                qs = qs.filter(is_active=False)

        # Search title, description, company, or recruiter
        search_query = request.query_params.get('search')
        if search_query:
            term = search_query.strip()
            qs = qs.filter(
                Q(title__icontains=term) |
                Q(description__icontains=term) |
                Q(recruiter__username__icontains=term) |
                Q(recruiter__company__name__icontains=term)
            )

        paginator = StandardAdminPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = AdminJobListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminJobDetailView(APIView):
    """
    GET /api/admin/jobs/<id>/
    Retrieves full details for a specific job.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.JOBS_VIEW

    def get(self, request, job_id):
        job = get_object_or_404(
            Job.objects.select_related('recruiter', 'recruiter__company', 'recruiter__recruiter_profile')
            .annotate(application_count=Count('applications')),
            pk=job_id
        )
        serializer = AdminJobListSerializer(job)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminJobModerationView(APIView):
    """
    PATCH /api/admin/jobs/<id>/moderation/
    Deactivates or reactivates a job posting without hard deleting records.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.JOBS_MODERATE

    def patch(self, request, job_id):
        serializer = AdminJobModerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        is_active = serializer.validated_data['is_active']
        reason = serializer.validated_data.get('reason', '')

        job = get_object_or_404(Job.objects.select_related('recruiter'), pk=job_id)

        with transaction.atomic():
            old_status = job.is_active
            job.is_active = is_active
            job.save(update_fields=['is_active'])

            action_name = "JOB_ACTIVATED" if is_active else "JOB_DEACTIVATED"
            log_admin_action(
                actor=request.user,
                action=action_name,
                target_type="JOB",
                target_id=job.id,
                target_repr=job.title,
                summary=f"Job '{job.title}' (ID {job.id}) active status set to {is_active}. Reason: {reason or 'No reason provided'}",
                changes={'previous_is_active': old_status, 'new_is_active': is_active, 'reason': reason},
                request=request
            )

        # Refetch with annotation for serializer
        job_annotated = Job.objects.annotate(application_count=Count('applications')).get(pk=job.id)
        return Response(AdminJobListSerializer(job_annotated).data, status=status.HTTP_200_OK)


# ==========================================
# 5. Application Analytics
# ==========================================

class AdminAnalyticsView(APIView):
    """
    GET /api/admin/analytics/
    Aggregated application metrics, score distributions, and daily trends over a bounded date range.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.ANALYTICS_VIEW

    def get(self, request):
        now = timezone.now()

        # Parse date range, defaulting to last 30 days
        end_date_str = request.query_params.get('end_date')
        start_date_str = request.query_params.get('start_date')

        end_date = parse_date(end_date_str) if end_date_str else now.date()
        start_date = parse_date(start_date_str) if start_date_str else (now - timedelta(days=30)).date()

        if not start_date or not end_date:
            raise ValidationError("Invalid date format. Please use YYYY-MM-DD.")

        if start_date > end_date:
            raise ValidationError("start_date cannot be after end_date.")

        # Enforce maximum 365-day query range
        if (end_date - start_date).days > 365:
            raise ValidationError("Analytics date range cannot exceed 365 days.")

        start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
        end_dt = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))

        app_qs = Application.objects.filter(applied_at__range=(start_dt, end_dt))

        # 1. Total applications in range
        total_in_range = app_qs.count()

        # 2. Status breakdown in range
        status_counts = app_qs.values('status').annotate(count=Count('id'))
        status_breakdown = {item['status']: item['count'] for item in status_counts}
        for st_choice, _ in Application.STATUS_CHOICES:
            status_breakdown.setdefault(st_choice, 0)

        # 3. Score metrics (for evaluated applications)
        evaluated_qs = app_qs.filter(
            status__in=['EVALUATED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW_SCHEDULED']
        )
        score_aggregates = evaluated_qs.aggregate(
            avg_score=Avg('resume_score'),
            min_score=Min('resume_score'),
            max_score=Max('resume_score')
        )

        score_distribution = {
            'below_50': evaluated_qs.filter(resume_score__lt=50).count(),
            '50_to_69': evaluated_qs.filter(resume_score__gte=50, resume_score__lt=70).count(),
            '70_to_84': evaluated_qs.filter(resume_score__gte=70, resume_score__lt=85).count(),
            '85_and_above': evaluated_qs.filter(resume_score__gte=85).count(),
        }

        # 4. Daily trends
        daily_trends = list(
            app_qs.annotate(date=TruncDate('applied_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        # Format date as ISO string
        formatted_trends = [
            {'date': str(item['date']), 'applications': item['count']}
            for item in daily_trends
        ]

        # 5. Top 5 jobs by application volume in range
        top_jobs = list(
            Job.objects.filter(applications__applied_at__range=(start_dt, end_dt))
            .annotate(application_count=Count('applications'))
            .order_by('-application_count')[:5]
            .values('id', 'title', 'application_count')
        )

        return Response({
            'date_range': {
                'start_date': str(start_date),
                'end_date': str(end_date),
            },
            'total_applications': total_in_range,
            'status_breakdown': status_breakdown,
            'score_metrics': {
                'average': round(score_aggregates['avg_score'] or 0, 1),
                'min': score_aggregates['min_score'] or 0,
                'max': score_aggregates['max_score'] or 0,
                'distribution': score_distribution,
            },
            'daily_trends': formatted_trends,
            'top_jobs': top_jobs,
        }, status=status.HTTP_200_OK)


# ==========================================
# 6. AI Monitoring
# ==========================================

class AdminAIMonitoringView(APIView):
    """
    GET /api/admin/ai-monitoring/
    Aggregates AI resume evaluation outcomes and performance stats from database records without invoking external APIs.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.AI_MONITORING_VIEW

    def get(self, request):
        total_apps = Application.objects.count()
        evaluated_apps = Application.objects.filter(
            status__in=['EVALUATED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW_SCHEDULED']
        ).count()
        pending_apps = Application.objects.filter(status='PENDING').count()
        failed_apps = Application.objects.filter(status='ERROR').count()

        completed_total = evaluated_apps + failed_apps
        success_rate = (
            round((evaluated_apps / completed_total) * 100, 1)
            if completed_total > 0
            else 100.0
        )

        app_score_agg = Application.objects.filter(
            status__in=['EVALUATED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW_SCHEDULED']
        ).aggregate(avg_score=Avg('resume_score'))

        # Standalone resume analysis records
        total_analyses = ResumeAnalysis.objects.count()
        analysis_agg = ResumeAnalysis.objects.aggregate(
            avg_ai_score=Avg('ai_score'),
            avg_match=Avg('match_percentage'),
            avg_relevancy=Avg('experience_relevancy')
        )

        return Response({
            'application_evaluations': {
                'total_applications': total_apps,
                'evaluated_count': evaluated_apps,
                'pending_evaluation_count': pending_apps,
                'failed_evaluation_count': failed_apps,
                'success_rate_percent': success_rate,
                'average_resume_score': round(app_score_agg['avg_score'] or 0, 1),
            },
            'standalone_resume_analyses': {
                'total_analyses': total_analyses,
                'average_ai_score': round(analysis_agg['avg_ai_score'] or 0, 1),
                'average_match_percentage': round(analysis_agg['avg_match'] or 0, 1),
                'average_experience_relevancy': round(analysis_agg['avg_relevancy'] or 0, 1),
            },
            'instrumentation_notice': (
                "Live Gemini API latency, token consumption, and external API cost metrics "
                "are not persisted in the database schema and represent future instrumentation work."
            )
        }, status=status.HTTP_200_OK)


# ==========================================
# 7. Audit Logs
# ==========================================

class AdminAuditLogListView(APIView):
    """
    GET /api/admin/audit-logs/
    Read-only, paginated audit log listing with action, actor, target, and date filters.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.AUDIT_LOGS_VIEW

    def get(self, request):
        qs = AuditLog.objects.select_related('actor').order_by('-timestamp')

        # Filter by action
        action_param = request.query_params.get('action')
        if action_param:
            qs = qs.filter(action=action_param.strip().upper())

        # Filter by target_type
        target_type_param = request.query_params.get('target_type')
        if target_type_param:
            qs = qs.filter(target_type=target_type_param.strip().upper())

        # Filter by actor_username
        actor_param = request.query_params.get('actor')
        if actor_param:
            qs = qs.filter(actor__username__icontains=actor_param.strip())

        # Date range filtering
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if start_date_str:
            s_date = parse_date(start_date_str)
            if s_date:
                s_dt = timezone.make_aware(datetime.combine(s_date, datetime.min.time()))
                qs = qs.filter(timestamp__gte=s_dt)

        if end_date_str:
            e_date = parse_date(end_date_str)
            if e_date:
                e_dt = timezone.make_aware(datetime.combine(e_date, datetime.max.time()))
                qs = qs.filter(timestamp__lte=e_dt)

        # Free search
        search_query = request.query_params.get('search')
        if search_query:
            term = search_query.strip()
            qs = qs.filter(
                Q(summary__icontains=term) |
                Q(target_repr__icontains=term) |
                Q(action__icontains=term)
            )

        paginator = StandardAdminPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = AdminAuditLogSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


# ==========================================
# 8. Staff Admin Management (Super Admin Exclusive)
# ==========================================

class AdminStaffAdminListCreateView(APIView):
    """
    GET /api/admin/staff-admins/
    POST /api/admin/staff-admins/
    Listing and provisioning for Staff Admin accounts. Accessible strictly to Super Admins.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.STAFF_ADMINS_MANAGE

    def get(self, request):
        # Auto-heal: Ensure any user designated as Staff Admin has an AdminProfile record
        staff_without_profile = User.objects.filter(
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=False,
            admin_profile__isnull=True
        )
        for u in staff_without_profile:
            AdminProfile.objects.get_or_create(user=u, defaults={'permissions': []})

        qs = AdminProfile.objects.select_related('user', 'created_by').filter(
            user__role=User.Role.ADMIN,
            user__is_staff=True,
            user__is_superuser=False
        ).order_by('-created_at')

        serializer = StaffAdminProfileSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = StaffAdminProvisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        staff_user, admin_profile = provision_staff_admin(
            super_admin=request.user,
            username=data['username'],
            email=data['email'],
            password=data['password'],
            permissions=data['permissions'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            request=request
        )

        return Response(
            StaffAdminProfileSerializer(admin_profile).data,
            status=status.HTTP_201_CREATED
        )


class AdminStaffAssignablePermissionsView(APIView):
    """
    GET /api/admin/staff-admins/assignable-permissions/
    Returns list of permissions that can be assigned to Staff Admins,
    along with user-friendly metadata. Accessible strictly to Super Admins.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.STAFF_ADMINS_MANAGE

    def get(self, request):
        return Response(list(ASSIGNABLE_PERMISSION_METADATA), status=status.HTTP_200_OK)


class AdminStaffAdminPermissionsView(APIView):
    """
    PATCH /api/admin/staff-admins/<id>/permissions/
    Updates the permissions of an existing Staff Admin account. Super Admin exclusive.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.STAFF_ADMINS_MANAGE

    def patch(self, request, user_id):
        serializer = StaffAdminPermissionsUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_user = get_object_or_404(User, pk=user_id)
        new_permissions = serializer.validated_data['permissions']

        updated_profile = update_staff_admin_permissions(
            super_admin=request.user,
            target_user=target_user,
            new_permissions=new_permissions,
            request=request
        )

        return Response(
            StaffAdminProfileSerializer(updated_profile).data,
            status=status.HTTP_200_OK
        )


class AdminStaffAdminStatusView(APIView):
    """
    PATCH /api/admin/staff-admins/<id>/status/
    Activates or deactivates a Staff Admin account. Super Admin exclusive.
    """
    permission_classes = [HasAdminPermission]
    required_admin_permission = AdminPermission.STAFF_ADMINS_MANAGE

    def patch(self, request, user_id):
        serializer = AdminUserStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['is_active']
        reason = serializer.validated_data.get('reason', '')

        target_user = get_object_or_404(User, pk=user_id)

        if not new_status:
            deactivate_admin_account(
                super_admin=request.user,
                target_user=target_user,
                reason=reason,
                request=request
            )
        else:
            activate_admin_account(
                super_admin=request.user,
                target_user=target_user,
                reason=reason,
                request=request
            )

        profile = getattr(target_user, 'admin_profile', None)
        if profile:
            profile.refresh_from_db()
            return Response(StaffAdminProfileSerializer(profile).data, status=status.HTTP_200_OK)

        return Response(AdminUserListSerializer(target_user).data, status=status.HTTP_200_OK)
