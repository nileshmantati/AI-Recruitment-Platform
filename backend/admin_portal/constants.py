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


ASSIGNABLE_PERMISSION_METADATA = (
    {
        "id": AdminPermission.DASHBOARD_VIEW,
        "name": "Dashboard Overview",
        "description": "Access dashboard overview, KPIs, and aggregate platform statistics.",
        "category": "Dashboard"
    },
    {
        "id": AdminPermission.USERS_VIEW,
        "name": "View Users",
        "description": "Browse and search candidate, recruiter, and company profiles.",
        "category": "User Management"
    },
    {
        "id": AdminPermission.USERS_MANAGE,
        "name": "Manage Users",
        "description": "Activate or deactivate standard candidate and recruiter accounts.",
        "category": "User Management"
    },
    {
        "id": AdminPermission.RECRUITERS_VERIFY,
        "name": "Recruiter Verification",
        "description": "Review recruiter verification documents and approve company verifications.",
        "category": "Moderation"
    },
    {
        "id": AdminPermission.JOBS_VIEW,
        "name": "View Jobs",
        "description": "Inspect all job listings, requirements, and application counts.",
        "category": "Job Moderation"
    },
    {
        "id": AdminPermission.JOBS_MODERATE,
        "name": "Moderate Jobs",
        "description": "Activate, deactivate, or suspend active job postings.",
        "category": "Job Moderation"
    },
    {
        "id": AdminPermission.APPLICATIONS_VIEW,
        "name": "View Applications",
        "description": "View candidate job applications and resume screening details.",
        "category": "Applications"
    },
    {
        "id": AdminPermission.ANALYTICS_VIEW,
        "name": "Analytics & Reports",
        "description": "View platform hiring trends, application volumes, and score distributions.",
        "category": "Analytics"
    },
    {
        "id": AdminPermission.AI_MONITORING_VIEW,
        "name": "AI Monitoring",
        "description": "Monitor AI resume evaluation rates, success rates, and scoring health.",
        "category": "AI Engine"
    },
    {
        "id": AdminPermission.AUDIT_LOGS_VIEW,
        "name": "Audit Logs",
        "description": "Inspect administrative audit logs and security activity tracking.",
        "category": "Security"
    },
)
