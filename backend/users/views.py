import secrets
from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, CandidateProfile, RecruiterProfile, PasswordResetOTP
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer, CandidateProfileSerializer, RecruiterProfileSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # Anyone can access this endpoint to sign up
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


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
            return Response({'error': f"No account found with username or email '{username_or_email}'."}, status=404)

        if not user.email:
            return Response({
                'error': f"User '{user.username}' does not have a registered email address. Please contact an administrator."
            }, status=400)

        # Generate 6-digit OTP
        otp = f"{secrets.randbelow(900000) + 100000}"

        # Invalidate previous unused OTPs
        PasswordResetOTP.objects.filter(user=user, is_used=False).update(is_used=True)

        # Create new OTP
        PasswordResetOTP.objects.create(user=user, otp=otp)
        print(f"\n==========================================")
        print(f"[PASSWORD RESET OTP] User: {user.username} | Email: {user.email} | OTP: {otp}")
        print(f"==========================================\n")

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

