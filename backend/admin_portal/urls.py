from django.urls import path
from .views import (
    AdminDashboardStatsView,
    AdminUserListView,
    AdminUserDetailView,
    AdminUserStatusView,
    AdminUserPromoteToStaffView,
    AdminUserDemoteFromStaffView,
    AdminRecruiterListView,
    AdminRecruiterDetailView,
    AdminRecruiterVerificationView,
    AdminJobListView,
    AdminJobDetailView,
    AdminJobModerationView,
    AdminAnalyticsView,
    AdminAIMonitoringView,
    AdminAuditLogListView,
    AdminStaffAdminListCreateView,
    AdminStaffAssignablePermissionsView,
    AdminStaffAdminPermissionsView,
    AdminStaffAdminStatusView,
)

app_name = 'admin_portal'

urlpatterns = [
    # 1. Dashboard Overview
    path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='dashboard-stats'),

    # 2. User Management
    path('users/', AdminUserListView.as_view(), name='user-list'),
    path('users/<int:user_id>/', AdminUserDetailView.as_view(), name='user-detail'),
    path('users/<int:user_id>/status/', AdminUserStatusView.as_view(), name='user-status'),
    path('users/<int:user_id>/promote-to-staff/', AdminUserPromoteToStaffView.as_view(), name='user-promote-to-staff'),
    path('users/<int:user_id>/demote-from-staff/', AdminUserDemoteFromStaffView.as_view(), name='user-demote-from-staff'),

    # 3. Recruiter Verification
    path('recruiters/', AdminRecruiterListView.as_view(), name='recruiter-list'),
    path('recruiters/<int:user_id>/', AdminRecruiterDetailView.as_view(), name='recruiter-detail'),
    path('recruiters/<int:user_id>/verification/', AdminRecruiterVerificationView.as_view(), name='recruiter-verification'),

    # 4. Job Moderation
    path('jobs/', AdminJobListView.as_view(), name='job-list'),
    path('jobs/<int:job_id>/', AdminJobDetailView.as_view(), name='job-detail'),
    path('jobs/<int:job_id>/moderation/', AdminJobModerationView.as_view(), name='job-moderation'),

    # 5. Application Analytics
    path('analytics/', AdminAnalyticsView.as_view(), name='analytics'),

    # 6. AI Monitoring
    path('ai-monitoring/', AdminAIMonitoringView.as_view(), name='ai-monitoring'),

    # 7. Audit Logs
    path('audit-logs/', AdminAuditLogListView.as_view(), name='audit-logs'),

    # 8. Staff Admin Management (Super Admin Exclusive)
    path('staff-admins/', AdminStaffAdminListCreateView.as_view(), name='staff-admin-list-create'),
    path('staff-admins/assignable-permissions/', AdminStaffAssignablePermissionsView.as_view(), name='staff-admin-assignable-permissions'),
    path('staff-admins/<int:user_id>/permissions/', AdminStaffAdminPermissionsView.as_view(), name='staff-admin-permissions'),
    path('staff-admins/<int:user_id>/status/', AdminStaffAdminStatusView.as_view(), name='staff-admin-status'),
]
