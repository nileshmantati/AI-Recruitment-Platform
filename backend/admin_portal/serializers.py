from rest_framework import serializers
from django.contrib.auth import get_user_model
from companies.models import Company, CompanyDocument
from jobs.models import Job
from applications.models import Application
from .models import AdminProfile, AuditLog
from .constants import AdminPermission

User = get_user_model()


# ==========================================
# 1. User Management Serializers
# ==========================================

class AdminUserListSerializer(serializers.ModelSerializer):
    """Safe, read-only serializer for administrative user listing."""
    phone = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_active', 'is_staff', 'is_superuser',
            'is_email_verified', 'date_joined', 'last_login',
            'phone', 'company_name'
        )
        read_only_fields = fields

    def get_phone(self, obj):
        if hasattr(obj, 'candidate_profile') and obj.candidate_profile.phone:
            return obj.candidate_profile.phone
        if hasattr(obj, 'recruiter_profile') and obj.recruiter_profile.phone:
            return obj.recruiter_profile.phone
        return None

    def get_company_name(self, obj):
        if hasattr(obj, 'company') and obj.company.name:
            return obj.company.name
        if hasattr(obj, 'recruiter_profile') and obj.recruiter_profile.company:
            return obj.recruiter_profile.company
        return None


class AdminUserDetailSerializer(AdminUserListSerializer):
    """Safe, comprehensive serializer for individual user inspection."""
    profile = serializers.SerializerMethodField()

    class Meta(AdminUserListSerializer.Meta):
        fields = AdminUserListSerializer.Meta.fields + ('profile',)
        read_only_fields = fields

    def get_profile(self, obj):
        if obj.role == User.Role.CANDIDATE and hasattr(obj, 'candidate_profile'):
            p = obj.candidate_profile
            return {
                'type': 'CANDIDATE',
                'first_name': p.first_name,
                'last_name': p.last_name,
                'skills': p.skills,
                'experience': p.experience,
                'portfolio_url': p.portfolio_url,
                'github_url': p.github_url,
                'bio': p.bio,
                'has_resume': bool(p.resume),
            }
        elif obj.role == User.Role.RECRUITER and hasattr(obj, 'recruiter_profile'):
            p = obj.recruiter_profile
            company_verified = obj.company.is_verified if hasattr(obj, 'company') else False
            return {
                'type': 'RECRUITER',
                'first_name': p.first_name,
                'last_name': p.last_name,
                'company': p.company,
                'position': p.position,
                'company_verified': company_verified,
            }
        elif obj.role == User.Role.ADMIN and hasattr(obj, 'admin_profile'):
            ap = obj.admin_profile
            return {
                'type': 'ADMIN',
                'permissions': ap.permissions,
                'is_active': ap.is_active,
                'created_by': ap.created_by.username if ap.created_by else None,
                'created_at': ap.created_at,
            }
        return None


class AdminUserStatusUpdateSerializer(serializers.Serializer):
    """Validates user account status toggle."""
    is_active = serializers.BooleanField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500, default='')


# ==========================================
# 2. Recruiter Verification Serializers
# ==========================================

class AdminRecruiterCompanySerializer(serializers.ModelSerializer):
    """Company details for verification inspection."""
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = (
            'id', 'name', 'tagline', 'industry', 'size', 'founded_year',
            'website', 'email', 'phone', 'is_verified', 'created_at',
            'country', 'state', 'city', 'document_count'
        )
        read_only_fields = fields

    def get_document_count(self, obj):
        return obj.documents.count()


class AdminRecruiterListSerializer(serializers.ModelSerializer):
    """Serializer for recruiter verification overview."""
    company = AdminRecruiterCompanySerializer(read_only=True)
    phone = serializers.SerializerMethodField()
    position = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_email_verified', 'date_joined',
            'phone', 'position', 'company'
        )
        read_only_fields = fields

    def get_phone(self, obj):
        if hasattr(obj, 'recruiter_profile'):
            return obj.recruiter_profile.phone
        return None

    def get_position(self, obj):
        if hasattr(obj, 'recruiter_profile'):
            return obj.recruiter_profile.position
        return None


class AdminRecruiterDetailSerializer(AdminRecruiterListSerializer):
    """Full detail view including uploaded documents for recruiter verification."""
    documents = serializers.SerializerMethodField()

    class Meta(AdminRecruiterListSerializer.Meta):
        fields = AdminRecruiterListSerializer.Meta.fields + ('documents',)
        read_only_fields = fields

    def get_documents(self, obj):
        if hasattr(obj, 'company'):
            return [
                {
                    'id': doc.id,
                    'doc_type': doc.doc_type,
                    'file_url': doc.file.url if doc.file else None,
                    'uploaded_at': doc.uploaded_at,
                }
                for doc in obj.company.documents.all()
            ]
        return []


class AdminRecruiterVerificationSerializer(serializers.Serializer):
    """Validates verification state update for a recruiter company."""
    is_verified = serializers.BooleanField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500, default='')


# ==========================================
# 3. Job Moderation Serializers
# ==========================================

class AdminJobListSerializer(serializers.ModelSerializer):
    """Job listing for administrative moderation."""
    recruiter_username = serializers.CharField(source='recruiter.username', read_only=True)
    recruiter_email = serializers.CharField(source='recruiter.email', read_only=True)
    company_name = serializers.SerializerMethodField()
    application_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Job
        fields = (
            'id', 'title', 'description', 'required_skills', 'salary',
            'type', 'is_active', 'created_at', 'recruiter_id',
            'recruiter_username', 'recruiter_email', 'company_name',
            'application_count'
        )
        read_only_fields = fields

    def get_company_name(self, obj):
        if hasattr(obj.recruiter, 'company') and obj.recruiter.company.name:
            return obj.recruiter.company.name
        if hasattr(obj.recruiter, 'recruiter_profile') and obj.recruiter.recruiter_profile.company:
            return obj.recruiter.recruiter_profile.company
        return None


class AdminJobModerationSerializer(serializers.Serializer):
    """Validates job active/inactive moderation toggle."""
    is_active = serializers.BooleanField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500, default='')


# ==========================================
# 4. Audit Log Serializers
# ==========================================

class AdminAuditLogSerializer(serializers.ModelSerializer):
    """Safe read-only serializer for administrative audit logs."""
    actor_username = serializers.CharField(source='actor.username', read_only=True, default='System')
    actor_email = serializers.CharField(source='actor.email', read_only=True, default='')

    class Meta:
        model = AuditLog
        fields = (
            'id', 'timestamp', 'actor_id', 'actor_username', 'actor_email',
            'action', 'target_type', 'target_id', 'target_repr', 'summary',
            'metadata', 'ip_address', 'user_agent', 'correlation_id'
        )
        read_only_fields = fields


# ==========================================
# 5. Staff Admin Management Serializers
# ==========================================

class StaffAdminProfileSerializer(serializers.ModelSerializer):
    """Staff Admin listing and detail serializer."""
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_active = serializers.BooleanField(source='user.is_active', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    last_login = serializers.DateTimeField(source='user.last_login', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, default='')

    class Meta:
        model = AdminProfile
        fields = (
            'id', 'user_id', 'username', 'email', 'first_name', 'last_name',
            'user_active', 'is_active', 'permissions', 'created_by_username',
            'created_at', 'updated_at', 'date_joined', 'last_login'
        )
        read_only_fields = fields


class StaffAdminProvisionSerializer(serializers.Serializer):
    """Validates Staff Admin provisioning inputs."""
    username = serializers.CharField(required=True, min_length=3, max_length=150)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, min_length=8, write_only=True)
    permissions = serializers.ListField(
        child=serializers.CharField(),
        required=True,
        allow_empty=True
    )
    first_name = serializers.CharField(required=False, allow_blank=True, default='')
    last_name = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_permissions(self, value):
        from .constants import AdminPermission
        for p in value:
            if p in AdminPermission.SUPER_ADMIN_EXCLUSIVE:
                raise serializers.ValidationError(
                    f"Permission '{p}' is reserved for Super Admins and cannot be assigned to Staff Admins."
                )
            if p not in AdminPermission.STAFF_ASSIGNABLE_PERMISSIONS:
                raise serializers.ValidationError(f"Unrecognized permission identifier: '{p}'.")
        return list(dict.fromkeys(value))  # deduplicate preserving order


class StaffAdminPermissionsUpdateSerializer(serializers.Serializer):
    """Validates permissions update for an existing Staff Admin."""
    permissions = serializers.ListField(
        child=serializers.CharField(),
        required=True,
        allow_empty=True
    )

    def validate_permissions(self, value):
        from .constants import AdminPermission
        for p in value:
            if p in AdminPermission.SUPER_ADMIN_EXCLUSIVE:
                raise serializers.ValidationError(
                    f"Permission '{p}' is reserved for Super Admins and cannot be assigned to Staff Admins."
                )
            if p not in AdminPermission.STAFF_ASSIGNABLE_PERMISSIONS:
                raise serializers.ValidationError(f"Unrecognized permission identifier: '{p}'.")
        return list(dict.fromkeys(value))
