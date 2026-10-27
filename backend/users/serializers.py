from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Q
from .models import User, CandidateProfile, RecruiterProfile
from rest_framework.exceptions import AuthenticationFailed


class UserSerializer(serializers.ModelSerializer):
    phone = serializers.SerializerMethodField()
    is_superuser = serializers.SerializerMethodField()
    is_staff = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'role', 'phone', 'is_email_verified',
            'is_superuser', 'is_staff', 'permissions'
        )

    def get_phone(self, obj):
        if hasattr(obj, 'candidate_profile') and obj.candidate_profile.phone:
            return obj.candidate_profile.phone
        if hasattr(obj, 'recruiter_profile') and obj.recruiter_profile.phone:
            return obj.recruiter_profile.phone
        return None

    def get_is_superuser(self, obj):
        return obj.is_superuser if obj.role == User.Role.ADMIN else False

    def get_is_staff(self, obj):
        return obj.is_staff if obj.role == User.Role.ADMIN else False

    def get_permissions(self, obj):
        if obj.role == User.Role.ADMIN:
            if obj.is_superuser:
                from admin_portal.constants import AdminPermission
                return list(AdminPermission.ALL_PERMISSIONS)
            elif hasattr(obj, 'admin_profile') and obj.admin_profile.is_active:
                return obj.admin_profile.permissions
        return []


class CandidateProfileSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = CandidateProfile
        fields = ('id', 'first_name', 'last_name', 'phone', 'profile_image', 'skills',
                  'experience', 'resume', 'portfolio_url', 'github_url', 'bio', 'email')

    def get_email(self, obj):
        return obj.user.email

    def get_profile_image(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None


class RecruiterProfileSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = RecruiterProfile
        fields = ('id', 'first_name', 'last_name', 'phone',
                  'profile_image', 'company', 'position', 'email')

    def get_email(self, obj):
        return obj.user.email

    def get_profile_image(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None


PUBLIC_REGISTRATION_ROLES = (User.Role.CANDIDATE, User.Role.RECRUITER)


class RegisterSerializer(serializers.ModelSerializer):
    # Ensures password isn't returned in JSON
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.CharField(required=False, default=User.Role.CANDIDATE)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role', 'phone')

    def validate_role(self, value):
        if not value:
            return User.Role.CANDIDATE
        value_clean = str(value).strip().upper()
        if value_clean not in PUBLIC_REGISTRATION_ROLES:
            raise serializers.ValidationError(
                "Invalid role. Public registration only allows 'CANDIDATE' or 'RECRUITER'."
            )
        return value_clean

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        role = validated_data.get('role', User.Role.CANDIDATE)
        if role not in PUBLIC_REGISTRATION_ROLES:
            role = User.Role.CANDIDATE

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=role
        )
        if phone:
            if user.role == User.Role.CANDIDATE and hasattr(user, 'candidate_profile'):
                user.candidate_profile.phone = phone
                user.candidate_profile.save()
            elif user.role == User.Role.RECRUITER and hasattr(user, 'recruiter_profile'):
                user.recruiter_profile.phone = phone
                user.recruiter_profile.save()

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that includes user role and username in the response."""
    role = serializers.CharField(write_only=True, required=False)

    def validate(self, attrs):
        # Allow case-insensitive login with either username or email
        username_or_email = attrs.get(self.username_field, '').strip()
        matched_user = None
        if username_or_email:
            matched_user = User.objects.filter(
                Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
            ).first()
            if matched_user:
                attrs[self.username_field] = matched_user.username

        provided_role = attrs.get('role')

        try:
            data = super().validate(attrs)
        except AuthenticationFailed:
            if matched_user and not matched_user.is_active and matched_user.check_password(attrs.get('password')):
                raise AuthenticationFailed("This account has been deactivated. Please contact support.")
            raise AuthenticationFailed("Invalid username, email, or password. Please check your credentials.")

        # Enforce that the role selected on the frontend matches the user's actual role without leaking account details
        if provided_role and self.user.role != provided_role:
            raise AuthenticationFailed(
                "Invalid credentials or role selected. Please check your login details and account type."
            )

        # Enforce email verification before issuing JWT tokens
        if not self.user.is_email_verified:
            raise AuthenticationFailed({
                'detail': 'Your email address is not verified. Please verify your email to log in.',
                'code': 'email_not_verified',
                'email': self.user.email,
                'username': self.user.username
            })

        # Record LoginHistory entry safely
        request = self.context.get('request')
        if request and self.user:
            try:
                from recruiter_settings.models import LoginHistory
                user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
                ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
                if ip and ',' in ip:
                    ip = ip.split(',')[0].strip()
                device_type = 'Mobile' if any(m in user_agent for m in ('Mobile', 'Android', 'iPhone', 'iPad')) else 'Desktop'
                browser_name = 'Other'
                if 'Chrome' in user_agent and 'Edg' not in user_agent:
                    browser_name = 'Chrome'
                elif 'Firefox' in user_agent:
                    browser_name = 'Firefox'
                elif 'Safari' in user_agent and 'Chrome' not in user_agent:
                    browser_name = 'Safari'
                elif 'Edg' in user_agent:
                    browser_name = 'Edge'

                LoginHistory.objects.create(
                    user=self.user,
                    device=device_type,
                    browser=browser_name,
                    ip_address=ip or '127.0.0.1'
                )
            except Exception:
                pass

        # Add extra fields to the response (not the token itself)
        data['role'] = self.user.role
        data['username'] = self.user.username
        data['user_id'] = self.user.id
        data['is_email_verified'] = self.user.is_email_verified
        if self.user.role == User.Role.ADMIN:
            data['is_superuser'] = self.user.is_superuser
            data['is_staff'] = self.user.is_staff
            if self.user.is_superuser:
                from admin_portal.constants import AdminPermission
                data['permissions'] = list(AdminPermission.ALL_PERMISSIONS)
            elif hasattr(self.user, 'admin_profile') and self.user.admin_profile.is_active:
                data['permissions'] = self.user.admin_profile.permissions
            else:
                data['permissions'] = []
        return data
