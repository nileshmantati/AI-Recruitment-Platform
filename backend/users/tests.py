from datetime import timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.hashers import make_password, check_password
from users.models import User, EmailVerificationOTP


class EmailVerificationTests(APITestCase):

    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.verify_url = reverse('verify-email')
        self.resend_url = reverse('resend-otp')

    def test_01_registration_creates_unverified_user_and_otp(self):
        """User registers, account is unverified, and a hashed OTP is created."""
        data = {
            'username': 'testcandidate',
            'email': 'candidate@test.com',
            'password': 'Password123!',
            'role': 'CANDIDATE'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data.get('success'))

        user = User.objects.get(username='testcandidate')
        self.assertFalse(user.is_email_verified)
        self.assertEqual(user.role, 'CANDIDATE')

        # Check OTP record
        otp_record = EmailVerificationOTP.objects.filter(user=user, is_used=False).first()
        self.assertIsNotNone(otp_record)
        self.assertNotEqual(otp_record.otp_hash, '')
        self.assertFalse(otp_record.is_used)
        self.assertEqual(otp_record.attempts, 0)

    def test_02_unverified_user_cannot_login(self):
        """Unverified user cannot obtain JWT tokens."""
        user = User.objects.create_user(
            username='unverified_user',
            email='unverified@test.com',
            password='Password123!',
            role='RECRUITER',
            is_email_verified=False
        )
        login_data = {
            'username': 'unverified_user',
            'password': 'Password123!',
            'role': 'RECRUITER'
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data.get('code'), 'email_not_verified')

    def test_03_correct_otp_verification_activates_user(self):
        """Valid OTP marks is_email_verified=True and invalidates the OTP."""
        user = User.objects.create_user(
            username='verify_me',
            email='verifyme@test.com',
            password='Password123!',
            role='CANDIDATE',
            is_email_verified=False
        )
        plain_otp = '456789'
        EmailVerificationOTP.objects.create(
            user=user,
            otp_hash=make_password(plain_otp),
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        verify_data = {
            'email_or_username': 'verifyme@test.com',
            'otp': plain_otp
        }
        response = self.client.post(self.verify_url, verify_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)

        # OTP is now marked as used
        otp_record = EmailVerificationOTP.objects.get(user=user)
        self.assertTrue(otp_record.is_used)

        # Now login must succeed and return JWT tokens
        login_data = {
            'username': 'verify_me',
            'password': 'Password123!',
            'role': 'CANDIDATE'
        }
        login_res = self.client.post(self.login_url, login_data)
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_res.data)
        self.assertIn('refresh', login_res.data)

    def test_04_incorrect_otp_increments_attempts(self):
        """Incorrect OTP returns remaining attempts and increments failure counter."""
        user = User.objects.create_user(
            username='wrong_otp_user',
            email='wrongotp@test.com',
            password='Password123!',
            role='CANDIDATE',
            is_email_verified=False
        )
        EmailVerificationOTP.objects.create(
            user=user,
            otp_hash=make_password('112233'),
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        response = self.client.post(self.verify_url, {
            'email_or_username': 'wrongotp@test.com',
            'otp': '999999'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('attempts_remaining'), 4)

        otp_record = EmailVerificationOTP.objects.get(user=user)
        self.assertEqual(otp_record.attempts, 1)

    def test_05_max_attempts_exceeded_locks_otp(self):
        """After 5 failed attempts, OTP is locked."""
        user = User.objects.create_user(
            username='lockout_user',
            email='lockout@test.com',
            password='Password123!',
            role='CANDIDATE',
            is_email_verified=False
        )
        otp_record = EmailVerificationOTP.objects.create(
            user=user,
            otp_hash=make_password('654321'),
            expires_at=timezone.now() + timedelta(minutes=5),
            attempts=4
        )

        # 5th failed attempt
        response = self.client.post(self.verify_url, {
            'email_or_username': 'lockout@test.com',
            'otp': '000000'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(response.data.get('max_attempts_exceeded'))

        # Even if they now enter the correct OTP, it is locked
        response_correct = self.client.post(self.verify_url, {
            'email_or_username': 'lockout@test.com',
            'otp': '654321'
        })
        self.assertEqual(response_correct.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(response_correct.data.get('max_attempts_exceeded'))

    def test_06_expired_otp_is_rejected(self):
        """Expired OTP (>5 minutes) cannot be used."""
        user = User.objects.create_user(
            username='expired_user',
            email='expired@test.com',
            password='Password123!',
            role='CANDIDATE',
            is_email_verified=False
        )
        EmailVerificationOTP.objects.create(
            user=user,
            otp_hash=make_password('778899'),
            expires_at=timezone.now() - timedelta(minutes=1)  # expired
        )

        response = self.client.post(self.verify_url, {
            'email_or_username': 'expired@test.com',
            'otp': '778899'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(response.data.get('is_expired'))

    def test_07_resend_cooldown_enforced(self):
        """Resending OTP within 60 seconds returns 429 Too Many Requests."""
        user = User.objects.create_user(
            username='cooldown_user',
            email='cooldown@test.com',
            password='Password123!',
            role='CANDIDATE',
            is_email_verified=False
        )
        # First OTP created just now
        EmailVerificationOTP.objects.create(
            user=user,
            otp_hash=make_password('123456'),
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        response = self.client.post(self.resend_url, {
            'email_or_username': 'cooldown@test.com'
        })
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn('cooldown', response.data)

    def test_08_recruiter_registration_and_verification(self):
        """Recruiter role registration and verification flow works end-to-end."""
        data = {
            'username': 'recruiter_jane',
            'email': 'jane@company.com',
            'password': 'SecurePassword123!',
            'role': 'RECRUITER'
        }
        res = self.client.post(self.register_url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data.get('role'), 'RECRUITER')

        user = User.objects.get(username='recruiter_jane')
        self.assertFalse(user.is_email_verified)
        self.assertEqual(user.role, 'RECRUITER')

        # RecruiterProfile created by signal
        self.assertTrue(hasattr(user, 'recruiter_profile'))

    def test_09_duplicate_verified_email_rejected(self):
        """Registering with an already verified email is rejected."""
        User.objects.create_user(
            username='existing_verified',
            email='alreadyverified@test.com',
            password='Password123!',
            is_email_verified=True
        )
        res = self.client.post(self.register_url, {
            'username': 'new_attempt',
            'email': 'alreadyverified@test.com',
            'password': 'Password123!',
            'role': 'CANDIDATE'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res.data)

    def test_10_reused_otp_rejected(self):
        """OTP cannot be used more than once."""
        user = User.objects.create_user(
            username='reuse_user',
            email='reuse@test.com',
            password='Password123!',
            is_email_verified=False
        )
        plain_otp = '555666'
        EmailVerificationOTP.objects.create(
            user=user,
            otp_hash=make_password(plain_otp),
            expires_at=timezone.now() + timedelta(minutes=5),
            is_used=True  # already used
        )
        res = self.client.post(self.verify_url, {
            'email_or_username': 'reuse@test.com',
            'otp': plain_otp
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_11_deactivated_account_cannot_verify_or_resend_otp(self):
        """A deactivated account (is_active=False) cannot verify OTP or request resend."""
        user = User.objects.create_user(
            username='deactivated_user',
            email='deactivated@test.com',
            password='Password123!',
            is_email_verified=False,
            is_active=False
        )
        EmailVerificationOTP.objects.create(
            user=user,
            otp_hash=make_password('123123'),
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        # Verification attempt must be forbidden (403)
        res_verify = self.client.post(self.verify_url, {
            'email_or_username': 'deactivated@test.com',
            'otp': '123123'
        })
        self.assertEqual(res_verify.status_code, status.HTTP_403_FORBIDDEN)

        # Resend attempt must be forbidden (403)
        res_resend = self.client.post(self.resend_url, {
            'email_or_username': 'deactivated@test.com'
        })
        self.assertEqual(res_resend.status_code, status.HTTP_403_FORBIDDEN)

    def test_12_registration_cooldown_enforced_on_retry(self):
        """Re-registering an unverified account within 60s is rate-limited (HTTP 429)."""
        data = {
            'username': 'cooldown_reg_user',
            'email': 'cooldownreg@test.com',
            'password': 'Password123!',
            'role': 'CANDIDATE'
        }
        res1 = self.client.post(self.register_url, data)
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Immediate re-registration attempt must hit 429 cooldown
        res2 = self.client.post(self.register_url, data)
        self.assertEqual(res2.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn('cooldown', res2.data)

    def test_13_mismatched_unverified_registration_rejected(self):
        """Cannot overwrite someone else's unverified username with a different email address."""
        User.objects.create_user(
            username='original_alice',
            email='alice@example.com',
            password='Password123!',
            is_email_verified=False
        )
        # Attempt to register with same username but different email
        res = self.client.post(self.register_url, {
            'username': 'original_alice',
            'email': 'mallory@evil.com',
            'password': 'NewPassword123!',
            'role': 'CANDIDATE'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', res.data)

    def test_14_resend_email_delivery_failure_returns_503(self):
        """When SMTP email delivery fails, resend endpoint returns HTTP 503 instead of false 200."""
        from unittest.mock import patch
        user = User.objects.create_user(
            username='smtp_fail_user',
            email='fail@test.com',
            password='Password123!',
            is_email_verified=False
        )
        # Set previous OTP in the past using .update() so cooldown doesn't block resend
        otp_rec = EmailVerificationOTP.objects.create(
            user=user,
            otp_hash=make_password('111222'),
            expires_at=timezone.now() - timedelta(minutes=2)
        )
        EmailVerificationOTP.objects.filter(pk=otp_rec.pk).update(
            created_at=timezone.now() - timedelta(seconds=70)
        )

        with patch('users.views.send_mail', side_effect=Exception('SMTP Connection Refused')):
            res = self.client.post(self.resend_url, {
                'email_or_username': 'fail@test.com'
            })
            self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
            self.assertFalse(res.data.get('email_sent'))

