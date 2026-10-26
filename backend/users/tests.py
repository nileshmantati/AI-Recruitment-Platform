from datetime import timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.hashers import make_password
from users.models import User, EmailVerificationOTP, PasswordResetOTP


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
        User.objects.create_user(
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
        EmailVerificationOTP.objects.create(
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

    def test_15_password_reset_otp_brute_force_lockout(self):
        """Entering incorrect OTP 5 times invalidates the OTP and returns 429 Too Many Requests."""
        user = User.objects.create_user(
            username='reset_target_user',
            email='target@test.com',
            password='TargetPassword123!',
            is_email_verified=True
        )
        otp_rec = PasswordResetOTP.objects.create(
            user=user,
            otp='999888'
        )
        verify_url = reverse('verify-reset-otp')

        # First 4 incorrect attempts return 400 with attempts remaining
        for i in range(1, 5):
            res = self.client.post(verify_url, {
                'username_or_email': user.username,
                'otp': '000000'
            })
            self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn(f"{5 - i} attempt(s) remaining", res.data.get('error', ''))

        # 5th incorrect attempt triggers lockout (429)
        res5 = self.client.post(verify_url, {
            'username_or_email': user.username,
            'otp': '000000'
        })
        self.assertEqual(res5.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

        # Ensure OTP record is now marked as used/invalidated in database
        otp_rec.refresh_from_db()
        self.assertTrue(otp_rec.is_used)

    def test_16_recruiter_settings_password_validation(self):
        """Updating password with less than 6 characters returns 400 Bad Request."""
        user = User.objects.create_user(
            username='recruiter_pwd_test',
            email='rec_pwd@test.com',
            password='OldSecurePassword123!',
            role='RECRUITER',
            is_email_verified=True
        )
        self.client.force_authenticate(user=user)
        url = reverse('security_settings')

        res = self.client.put(url, {
            'current_password': 'OldSecurePassword123!',
            'new_password': '123'  # Too short
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('at least 6 characters', res.data.get('error', ''))


class RegistrationRoleSecurityTests(APITestCase):
    """
    Automated security tests for Phase 1: Preventing public role escalation.
    Verifies that public registration and verification endpoints strictly reject
    administrative role injection, staff roles, and unauthorized role alterations.
    """

    def setUp(self):
        self.register_url = reverse('register')
        self.verify_url = reverse('verify-email')

    def test_01_registration_without_role_defaults_to_candidate(self):
        """Registering without specifying a role automatically defaults to CANDIDATE."""
        data = {
            'username': 'norole_candidate',
            'email': 'norole@example.com',
            'password': 'StrongPassword123!'
        }
        res = self.client.post(self.register_url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data.get('role'), 'CANDIDATE')

        user = User.objects.get(username='norole_candidate')
        self.assertEqual(user.role, User.Role.CANDIDATE)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(hasattr(user, 'candidate_profile'))

    def test_02_valid_candidate_registration(self):
        """Explicitly specifying role 'CANDIDATE' is permitted."""
        data = {
            'username': 'explicit_cand',
            'email': 'explicit_cand@example.com',
            'password': 'StrongPassword123!',
            'role': 'CANDIDATE'
        }
        res = self.client.post(self.register_url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data.get('role'), 'CANDIDATE')

        user = User.objects.get(username='explicit_cand')
        self.assertEqual(user.role, User.Role.CANDIDATE)

    def test_03_valid_recruiter_registration(self):
        """Explicitly specifying role 'RECRUITER' is permitted and creates recruiter profile."""
        data = {
            'username': 'explicit_rec',
            'email': 'explicit_rec@example.com',
            'password': 'StrongPassword123!',
            'role': 'RECRUITER'
        }
        res = self.client.post(self.register_url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data.get('role'), 'RECRUITER')

        user = User.objects.get(username='explicit_rec')
        self.assertEqual(user.role, User.Role.RECRUITER)
        self.assertTrue(hasattr(user, 'recruiter_profile'))

    def test_04_registration_with_admin_role_rejected(self):
        """Attempting to register with role 'ADMIN' is rejected with HTTP 400."""
        data = {
            'username': 'attacker_admin',
            'email': 'attacker_admin@example.com',
            'password': 'ExploitPassword123!',
            'role': 'ADMIN'
        }
        res = self.client.post(self.register_url, data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('role', res.data)
        self.assertFalse(User.objects.filter(username='attacker_admin').exists())

    def test_05_registration_with_staff_admin_role_rejected(self):
        """Attempting to register with any proposed staff admin role is rejected."""
        for disallowed_role in ['STAFF_ADMIN', 'STAFF', 'SUPERUSER', 'MODERATOR']:
            data = {
                'username': f"attacker_{disallowed_role.lower()}",
                'email': f"{disallowed_role.lower()}@example.com",
                'password': 'ExploitPassword123!',
                'role': disallowed_role
            }
            res = self.client.post(self.register_url, data)
            self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn('role', res.data)
            self.assertFalse(User.objects.filter(username=data['username']).exists())

    def test_06_unverified_resubmission_with_admin_role_rejected(self):
        """An unverified user attempting to alter role to 'ADMIN' during re-submission is blocked."""
        user = User.objects.create_user(
            username='unverified_target',
            email='target@example.com',
            password='InitialPassword123!',
            role=User.Role.CANDIDATE,
            is_email_verified=False
        )

        res = self.client.post(self.register_url, {
            'username': 'unverified_target',
            'email': 'target@example.com',
            'password': 'NewPassword123!',
            'role': 'ADMIN'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('role', res.data)

        user.refresh_from_db()
        self.assertEqual(user.role, User.Role.CANDIDATE)

    def test_07_unverified_resubmission_with_staff_admin_role_rejected(self):
        """An unverified user attempting to alter role to 'STAFF_ADMIN' during re-submission is blocked."""
        user = User.objects.create_user(
            username='unverified_staff_target',
            email='staff_target@example.com',
            password='InitialPassword123!',
            role=User.Role.CANDIDATE,
            is_email_verified=False
        )

        res = self.client.post(self.register_url, {
            'username': 'unverified_staff_target',
            'email': 'staff_target@example.com',
            'password': 'NewPassword123!',
            'role': 'STAFF_ADMIN'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('role', res.data)

        user.refresh_from_db()
        self.assertEqual(user.role, User.Role.CANDIDATE)

    def test_08_unverified_resubmission_cannot_alter_existing_role(self):
        """An unverified user cannot change their role from CANDIDATE to RECRUITER via re-submission."""
        user = User.objects.create_user(
            username='fixed_role_user',
            email='fixed@example.com',
            password='InitialPassword123!',
            role=User.Role.CANDIDATE,
            is_email_verified=False
        )

        res = self.client.post(self.register_url, {
            'username': 'fixed_role_user',
            'email': 'fixed@example.com',
            'password': 'NewPassword123!',
            'role': 'RECRUITER'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('role', res.data)
        self.assertIn('cannot be altered', res.data['role'][0])

        user.refresh_from_db()
        self.assertEqual(user.role, User.Role.CANDIDATE)

    def test_09_unverified_admin_account_cannot_be_targeted_via_public_registration(self):
        """A public re-registration attempt against an existing admin account is rejected."""
        admin_user = User.objects.create_user(
            username='pending_admin',
            email='admin@corp.com',
            password='AdminPassword123!',
            role=User.Role.ADMIN,
            is_staff=True,
            is_email_verified=False
        )

        res = self.client.post(self.register_url, {
            'username': 'pending_admin',
            'email': 'admin@corp.com',
            'password': 'HijackPassword123!',
            'role': 'CANDIDATE'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        admin_user.refresh_from_db()
        self.assertTrue(admin_user.check_password('AdminPassword123!'))
        self.assertEqual(admin_user.role, User.Role.ADMIN)

    def test_10_verification_attempt_cannot_alter_role(self):
        """Passing 'role: ADMIN' in verify-email request does not modify the user's role."""
        user = User.objects.create_user(
            username='verify_role_test',
            email='verify_role@example.com',
            password='Password123!',
            role=User.Role.CANDIDATE,
            is_email_verified=False
        )
        plain_otp = '849201'
        EmailVerificationOTP.objects.create(
            user=user,
            otp_hash=make_password(plain_otp),
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        res = self.client.post(self.verify_url, {
            'email_or_username': 'verify_role@example.com',
            'otp': plain_otp,
            'role': 'ADMIN'  # Malicious extra payload
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)
        self.assertEqual(user.role, User.Role.CANDIDATE)


