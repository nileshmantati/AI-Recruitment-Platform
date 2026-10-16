import secrets
import logging
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, CandidateProfile, RecruiterProfile, PasswordResetOTP, EmailVerificationOTP
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer, CandidateProfileSerializer, RecruiterProfileSerializer

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    """Handles registration of new users and sends a 6-digit email verification OTP."""
    permission_classes = (AllowAny,)

    def post(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()

        # Check if this email is registered to an already verified user
        existing_user_by_email = User.objects.filter(email__iexact=email).first() if email else None
        if existing_user_by_email and existing_user_by_email.is_email_verified:
            return Response(
                {'email': ['An account with this email address already exists. Please log in.']},
                status=400
            )

        # Check if username is taken by an already verified user
        existing_user_by_username = User.objects.filter(username__iexact=username).first() if username else None
        if existing_user_by_username and existing_user_by_username.is_email_verified:
            return Response(
                {'username': ['This username is already taken. Please choose another one.']},
                status=400
            )

        # Detect cross-account collision if email and username match different accounts
        if existing_user_by_email and existing_user_by_username and existing_user_by_email.pk != existing_user_by_username.pk:
            return Response(
                {'detail': 'Provided username and email address are associated with different accounts.'},
                status=400
            )

        # Prevent overwriting an unverified account's credentials with mismatched username/email
        if existing_user_by_username and not existing_user_by_username.is_email_verified:
            if email and existing_user_by_username.email.lower() != email.lower():
                return Response(
                    {'username': ['This username is already registered with a different email address.']},
                    status=400
                )

        if existing_user_by_email and not existing_user_by_email.is_email_verified:
            if username and existing_user_by_email.username.lower() != username.lower():
                return Response(
                    {'email': ['This email address is already registered with a different username.']},
                    status=400
                )

        # If user exists but is unverified, allow updating password & re-sending OTP safely
        unverified_user = existing_user_by_email or existing_user_by_username
        if unverified_user and not unverified_user.is_email_verified:
            if not unverified_user.is_active:
                return Response(
                    {'error': 'This account has been deactivated. Please contact support.'},
                    status=403
                )

            # Enforce 60s cooldown to prevent registration spam / OTP flood
            latest_otp = EmailVerificationOTP.objects.filter(user=unverified_user).order_by('-created_at').first()
            if latest_otp:
                elapsed = (timezone.now() - latest_otp.created_at).total_seconds()
                if elapsed < 60:
                    cooldown_left = int(60 - elapsed)
                    return Response({
                        'error': f"A verification code was recently sent. Please wait {cooldown_left}s before requesting a new code.",
                        'cooldown': cooldown_left,
                        'email': unverified_user.email,
                        'username': unverified_user.username
                    }, status=429)

            with transaction.atomic():
                password = request.data.get('password')
                if password:
                    unverified_user.set_password(password)
                role = request.data.get('role')
                if role:
                    unverified_user.role = role
                if email:
                    unverified_user.email = email
                unverified_user.save()

                _, email_sent = generate_and_send_verification_otp(unverified_user)

            message = (
                f"Verification code sent! Please check {mask_email(unverified_user.email)} to verify your account."
                if email_sent else
                f"Account updated! However, email delivery failed. Please click 'Resend code' to retry."
            )

            return Response({
                'success': True,
                'message': message,
                'email': unverified_user.email,
                'username': unverified_user.username,
                'role': unverified_user.role,
                'email_sent': email_sent
            }, status=201)

        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        with transaction.atomic():
            user = serializer.save()
            user.is_email_verified = False
            user.save()

            _, email_sent = generate_and_send_verification_otp(user)

        message = (
            f"Account created! A 6-digit verification code has been sent to {mask_email(user.email)}."
            if email_sent else
            f"Account created! However, email delivery failed. Please click 'Resend code' on the verification page."
        )

        return Response({
            'success': True,
            'message': message,
            'email': user.email,
            'username': user.username,
            'role': user.role,
            'email_sent': email_sent
        }, status=201)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view that returns user role along with JWT tokens."""
    serializer_class = CustomTokenObtainPairSerializer


class CurrentUserView(APIView):
    """Returns the currently authenticated user's details."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class CandidateProfileView(APIView):
    """Handles retrieving and updating candidate profile."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = CandidateProfileSerializer(
            profile, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = CandidateProfileSerializer(
            profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class RecruiterProfileView(APIView):
    """Handles retrieving and updating recruiter profile."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(
            profile, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(
            profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def put(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(
            profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


def mask_email(email: str) -> str:
    if not email or '@' not in email:
        return 'your email'
    name, domain = email.split('@', 1)
    if len(name) <= 2:
        masked_name = name[0] + '*'
    else:
        masked_name = name[0] + '*' * (len(name) - 2) + name[-1]
    return f"{masked_name}@{domain}"


def send_otp_email(user, otp):
    subject = "AI Recruiter - Password Reset Verification Code"
    message = (
        f"Hello {user.username},\n\n"
        f"Your password reset verification code is: {otp}\n\n"
        f"This code will expire in 10 minutes.\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"Best regards,\nAI Recruiter Team"
    )
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; padding: 12px 20px; border-radius: 12px; font-weight: bold; font-size: 18px;">
                AI Recruiter
            </div>
        </div>
        <h2 style="color: #1e293b; text-align: center; margin-bottom: 8px;">Password Reset Code</h2>
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 24px;">
            Use the verification code below to reset your password. This code will expire in <strong>10 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; background: #eef2ff; padding: 16px 28px; border-radius: 14px; border: 2px dashed #c7d2fe;">
                {otp}
            </span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
            If you did not request a password reset, you can safely ignore this email. Your account remains secure.
        </p>
    </div>
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send OTP email: {e}")
        return False


def send_verification_email(user, otp):
    """Sends a 6-digit email verification code expiring in 5 minutes."""
    subject = "AI Recruiter - Email Verification Code"
    message = (
        f"Hello {user.username},\n\n"
        f"Thank you for registering on AI Recruitment Platform!\n"
        f"Your 6-digit email verification code is: {otp}\n\n"
        f"This code will expire in 5 minutes.\n"
        f"If you did not create an account, please ignore this email.\n\n"
        f"Best regards,\nAI Recruiter Team"
    )
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; padding: 12px 20px; border-radius: 12px; font-weight: bold; font-size: 18px;">
                AI Recruiter
            </div>
        </div>
        <h2 style="color: #1e293b; text-align: center; margin-bottom: 8px;">Verify Your Email Address</h2>
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 24px;">
            Welcome to AI Recruitment Platform! Use the 6-digit verification code below to verify your account. This code expires in <strong>5 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; background: #eef2ff; padding: 16px 28px; border-radius: 14px; border: 2px dashed #c7d2fe;">
                {otp}
            </span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
            If you did not request this account, you can safely ignore this email.
        </p>
    </div>
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error("Failed to send email verification OTP: %s", e)
        return False


def generate_and_send_verification_otp(user):
    """Invalidates old OTPs, generates a 6-digit hashed OTP with 5min expiry, and emails the user."""
    with transaction.atomic():
        # Invalidate all prior unused OTPs
        EmailVerificationOTP.objects.filter(user=user, is_used=False).update(is_used=True)

        otp = f"{secrets.randbelow(900000) + 100000}"
        otp_hash = make_password(otp)
        expires_at = timezone.now() + timedelta(minutes=5)

        EmailVerificationOTP.objects.create(
            user=user,
            otp_hash=otp_hash,
            expires_at=expires_at
        )

    logger.info("Generated email verification OTP for user: %s", user.username)
    email_sent = send_verification_email(user, otp)
    return otp, email_sent


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username_or_email', '').strip()
        if not username_or_email:
            return Response({'error': 'Please provide your username or email address.'}, status=400)

        user = User.objects.filter(
            Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
        ).first()

        if not user:
            if '@' in username_or_email:
                return Response({
                    'error': "This email doesn't exist. Please verify your email or change your email."
                }, status=404)
            return Response({
                'error': "This account doesn't exist. Please verify your username/email or change your email."
            }, status=404)

        if not user.email:
            return Response({
                'error': f"User '{user.username}' does not have a registered email address. Please verify your email or change your email."
            }, status=400)

        # Generate 6-digit OTP
        otp = f"{secrets.randbelow(900000) + 100000}"

        with transaction.atomic():
            # Invalidate previous unused OTPs
            PasswordResetOTP.objects.filter(user=user, is_used=False).update(is_used=True)

            # Create new OTP
            PasswordResetOTP.objects.create(user=user, otp=otp)

        logger.info("Generated password reset OTP for user: %s", user.username)

        # Send email
        email_sent = send_otp_email(user, otp)
        masked = mask_email(user.email)

        return Response({
            'success': True,
            'message': f"A 6-digit verification code has been sent to {masked}.",
            'email': masked,
            'username': user.username,
            'email_sent': email_sent
        }, status=200)


class VerifyResetOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username_or_email', '').strip()
        otp = request.data.get('otp', '').strip()

        if not username_or_email or not otp:
            return Response({'error': 'Username/email and verification code are required.'}, status=400)

        user = User.objects.filter(
            Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
        ).first()

        if not user:
            return Response({'error': 'Account not found.'}, status=404)

        otp_record = PasswordResetOTP.objects.filter(
            user=user, otp=otp, is_used=False
        ).order_by('-created_at').first()

        if not otp_record or not otp_record.is_valid():
            return Response({'error': 'Invalid or expired verification code.'}, status=400)

        return Response({'success': True, 'message': 'Verification code confirmed.'}, status=200)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username_or_email', '').strip()
        otp = request.data.get('otp', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not username_or_email or not otp or not new_password:
            return Response({'error': 'Username/email, code, and new password are required.'}, status=400)

        if len(new_password) < 6:
            return Response({'error': 'New password must be at least 6 characters long.'}, status=400)

        user = User.objects.filter(
            Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
        ).first()

        if not user:
            return Response({'error': 'Account not found.'}, status=404)

        otp_record = PasswordResetOTP.objects.filter(
            user=user, otp=otp, is_used=False
        ).order_by('-created_at').first()

        if not otp_record or not otp_record.is_valid():
            return Response({'error': 'Invalid or expired verification code.'}, status=400)

        # Set new password
        user.set_password(new_password)
        user.save()

        # Invalidate OTP
        otp_record.is_used = True
        otp_record.save()

        return Response({
            'success': True,
            'message': 'Password has been successfully reset! You can now log in with your new password.',
            'username': user.username
        }, status=200)


class VerifyEmailView(APIView):
    """Verifies a user's email address using a hashed 6-digit OTP with attempt limiting and expiry."""
    permission_classes = [AllowAny]

    def post(self, request):
        email_or_username = (
            request.data.get('email_or_username') or
            request.data.get('email') or
            request.data.get('username') or
            ''
        ).strip()
        otp = str(request.data.get('otp', '')).strip()

        if not email_or_username:
            return Response({'error': 'Email address or username is required.'}, status=400)

        if not otp:
            return Response({'error': 'Verification code is required.'}, status=400)

        if len(otp) != 6 or not otp.isdigit():
            return Response({'error': 'Verification code must be exactly 6 digits.'}, status=400)

        user = User.objects.filter(
            Q(email__iexact=email_or_username) | Q(username__iexact=email_or_username)
        ).first()

        if not user:
            return Response({'error': 'No account found with this email or username.'}, status=404)

        if not user.is_active:
            return Response({'error': 'This account has been deactivated. Please contact support.'}, status=403)

        if user.is_email_verified:
            return Response({
                'success': True,
                'message': 'Your email is already verified. You can log in now.'
            }, status=200)

        with transaction.atomic():
            # Get latest unused OTP record with row lock to serialize concurrent attempts
            otp_record = EmailVerificationOTP.objects.select_for_update().filter(
                user=user, is_used=False
            ).order_by('-created_at').first()

            if not otp_record:
                return Response({
                    'error': 'No active verification code found. Please request a new code.',
                    'code': 'no_active_otp'
                }, status=400)

            if otp_record.is_expired():
                return Response({
                    'error': 'This verification code has expired (5-minute limit). Please request a new code.',
                    'code': 'otp_expired',
                    'is_expired': True
                }, status=400)

            if otp_record.attempts >= 5:
                return Response({
                    'error': 'Maximum verification attempts exceeded (5/5). Please request a new code.',
                    'code': 'max_attempts_exceeded',
                    'max_attempts_exceeded': True
                }, status=400)

            # Check OTP hash using verify method
            if not otp_record.verify(otp):
                otp_record.attempts += 1
                otp_record.save()
                attempts_remaining = max(0, 5 - otp_record.attempts)
                if attempts_remaining == 0:
                    return Response({
                        'error': 'Maximum verification attempts exceeded (5/5). Please request a new code.',
                        'code': 'max_attempts_exceeded',
                        'max_attempts_exceeded': True,
                        'attempts_remaining': 0
                    }, status=400)
                return Response({
                    'error': f"Invalid verification code. {attempts_remaining} attempt(s) remaining.",
                    'attempts_remaining': attempts_remaining
                }, status=400)

            # Successfully verified! Invalidate OTP and mark user verified
            otp_record.is_used = True
            otp_record.save()

            user.is_email_verified = True
            user.save()

        return Response({
            'success': True,
            'message': 'Email verified successfully! You can now log into your account.',
            'username': user.username,
            'email': user.email
        }, status=200)


class ResendOTPView(APIView):
    """Resends a new 6-digit email verification OTP with 60s cooldown enforcement."""
    permission_classes = [AllowAny]

    def post(self, request):
        email_or_username = (
            request.data.get('email_or_username') or
            request.data.get('email') or
            request.data.get('username') or
            ''
        ).strip()

        if not email_or_username:
            return Response({'error': 'Please provide your email address or username.'}, status=400)

        user = User.objects.filter(
            Q(email__iexact=email_or_username) | Q(username__iexact=email_or_username)
        ).first()

        if not user:
            return Response({'error': 'No account found with this email or username.'}, status=404)

        if not user.is_active:
            return Response({'error': 'This account has been deactivated. Please contact support.'}, status=403)

        if user.is_email_verified:
            return Response({
                'error': 'This account is already verified. You can log in directly.',
                'already_verified': True
            }, status=400)

        # Check 60-second resend cooldown
        latest_otp = EmailVerificationOTP.objects.filter(user=user).order_by('-created_at').first()
        if latest_otp:
            elapsed = (timezone.now() - latest_otp.created_at).total_seconds()
            if elapsed < 60:
                cooldown_left = int(60 - elapsed)
                return Response({
                    'error': f"Please wait {cooldown_left}s before requesting a new code.",
                    'cooldown': cooldown_left
                }, status=429)

        with transaction.atomic():
            _, email_sent = generate_and_send_verification_otp(user)

        masked = mask_email(user.email)
        if not email_sent:
            return Response({
                'error': 'Failed to deliver verification email due to a mail server error. Please try again shortly.',
                'email_sent': False
            }, status=503)

        return Response({
            'success': True,
            'message': f"A new verification code has been sent to {masked}.",
            'email': masked,
            'email_sent': True
        }, status=200)


