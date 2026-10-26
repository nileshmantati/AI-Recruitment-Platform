"""
admin_portal/constants.py

Stable permission identifiers and role constants for the Admin Portal.
"""


class AdminPermission:
    # 1. Dashboard Overview
    DASHBOARD_VIEW = 'dashboard.view'

    # 2. User Management
    USERS_VIEW = 'users.view'
    USERS_MANAGE = 'users.manage'

    # 3. Recruiter Verification
    RECRUITERS_VERIFY = 'recruiters.verify'

    # 4. Job Management & Moderation
    JOBS_VIEW = 'jobs.view'
    JOBS_MODERATE = 'jobs.moderate'

    # 5. Application Management
    APPLICATIONS_VIEW = 'applications.view'

    # 6. Analytics
    ANALYTICS_VIEW = 'analytics.view'

    # 7. AI Monitoring
    AI_MONITORING_VIEW = 'ai_monitoring.view'

    # 8. Audit Logs
    AUDIT_LOGS_VIEW = 'audit_logs.view'

    # 9. Super Admin Exclusive Capabilities
    STAFF_ADMINS_MANAGE = 'staff_admins.manage'
    PLATFORM_SETTINGS_MANAGE = 'platform_settings.manage'

    # Complete tuple of all recognized admin permissions
    ALL_PERMISSIONS = (
        DASHBOARD_VIEW,
        USERS_VIEW,
        USERS_MANAGE,
        RECRUITERS_VERIFY,
        JOBS_VIEW,
        JOBS_MODERATE,
        APPLICATIONS_VIEW,
        ANALYTICS_VIEW,
        AI_MONITORING_VIEW,
        AUDIT_LOGS_VIEW,
        STAFF_ADMINS_MANAGE,
        PLATFORM_SETTINGS_MANAGE,
    )

    # Permissions that can be granted to Staff Admins
    STAFF_ASSIGNABLE_PERMISSIONS = (
        DASHBOARD_VIEW,
        USERS_VIEW,
        USERS_MANAGE,
        RECRUITERS_VERIFY,
        JOBS_VIEW,
        JOBS_MODERATE,
        APPLICATIONS_VIEW,
        ANALYTICS_VIEW,
        AI_MONITORING_VIEW,
        AUDIT_LOGS_VIEW,
    )

    # Permissions strictly reserved for Super Admins
    SUPER_ADMIN_EXCLUSIVE = (
        STAFF_ADMINS_MANAGE,
        PLATFORM_SETTINGS_MANAGE,
    )
