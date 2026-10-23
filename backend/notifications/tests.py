from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from notifications.models import Notification
from notifications.services import create_notification
from jobs.models import Job
from users.models import CandidateProfile, RecruiterProfile
from applications.models import Application

User = get_user_model()


class NotificationModelAndServiceTests(TestCase):
    def setUp(self):
        self.candidate_user = User.objects.create_user(
            username='candidate1',
            email='candidate1@example.com',
            password='password123',
            role='CANDIDATE'
        )
        self.recruiter_user = User.objects.create_user(
            username='recruiter1',
            email='recruiter1@example.com',
            password='password123',
            role='RECRUITER'
        )
        self.other_user = User.objects.create_user(
            username='candidate2',
            email='candidate2@example.com',
            password='password123',
            role='CANDIDATE'
        )

    def test_create_notification_success(self):
        notif = create_notification(
            recipient=self.candidate_user,
            actor=self.recruiter_user,
            event_type='APPLICATION_SHORTLISTED',
            title='Shortlisted',
            message='You have been shortlisted.',
            target_type='APPLICATION',
            target_id=10
        )
        self.assertIsNotNone(notif)
        self.assertEqual(notif.recipient, self.candidate_user)
        self.assertEqual(notif.actor, self.recruiter_user)
        self.assertEqual(notif.event_type, 'APPLICATION_SHORTLISTED')
        self.assertFalse(notif.is_read)

    def test_actor_cannot_notify_self(self):
        notif = create_notification(
            recipient=self.recruiter_user,
            actor=self.recruiter_user,
            event_type='NEW_APPLICATION',
            title='Test',
            message='Self notification'
        )
        self.assertIsNone(notif)
        self.assertEqual(Notification.objects.count(), 0)

    def test_deduplication_prevents_duplicate_events(self):
        notif1 = create_notification(
            recipient=self.candidate_user,
            actor=self.recruiter_user,
            event_type='APPLICATION_SHORTLISTED',
            title='Shortlisted',
            message='You have been shortlisted.',
            target_type='APPLICATION',
            target_id=99
        )
        self.assertIsNotNone(notif1)

        # Immediate duplicate
        notif2 = create_notification(
            recipient=self.candidate_user,
            actor=self.recruiter_user,
            event_type='APPLICATION_SHORTLISTED',
            title='Shortlisted',
            message='You have been shortlisted.',
            target_type='APPLICATION',
            target_id=99
        )
        self.assertEqual(notif1.id, notif2.id)
        self.assertEqual(Notification.objects.filter(recipient=self.candidate_user).count(), 1)


class NotificationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='password123',
            role='CANDIDATE'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='password123',
            role='RECRUITER'
        )

        # Create 3 notifications for user1 (2 unread, 1 read)
        self.n1 = Notification.objects.create(
            recipient=self.user1,
            actor=self.user2,
            event_type='APPLICATION_SUBMITTED',
            title='Submitted',
            message='Application submitted successfully.',
            is_read=False
        )
        self.n2 = Notification.objects.create(
            recipient=self.user1,
            actor=self.user2,
            event_type='APPLICATION_SHORTLISTED',
            title='Shortlisted',
            message='Application shortlisted.',
            is_read=False
        )
        self.n3 = Notification.objects.create(
            recipient=self.user1,
            actor=self.user2,
            event_type='APPLICATION_STATUS_UPDATED',
            title='Status update',
            message='Status updated.',
            is_read=True
        )

        # Create 1 notification for user2
        self.n_user2 = Notification.objects.create(
            recipient=self.user2,
            actor=self.user1,
            event_type='NEW_APPLICATION',
            title='New applicant',
            message='New application received.',
            is_read=False
        )

    def test_unauthenticated_request_rejected(self):
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.patch(f'/api/notifications/{self.n1.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.post('/api/notifications/mark-all-read/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_only_sees_own_notifications(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 3)

        ids = [item['id'] for item in results]
        self.assertIn(self.n1.id, ids)
        self.assertIn(self.n2.id, ids)
        self.assertIn(self.n3.id, ids)
        self.assertNotIn(self.n_user2.id, ids)

    def test_unread_count_accurate(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('unread_count'), 2)

        self.client.force_authenticate(user=self.user2)
        response = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('unread_count'), 1)

    def test_mark_single_notification_read(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(f'/api/notifications/{self.n1.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('is_read'))

        self.n1.refresh_from_db()
        self.assertTrue(self.n1.is_read)

        # Unread count should now be 1
        count_res = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(count_res.data.get('unread_count'), 1)

    def test_user_cannot_mark_other_users_notification_as_read(self):
        self.client.force_authenticate(user=self.user1)
        # Attempt to mark user2's notification as read
        response = self.client.patch(f'/api/notifications/{self.n_user2.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.n_user2.refresh_from_db()
        self.assertFalse(self.n_user2.is_read)

    def test_mark_all_read_affects_only_current_user(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post('/api/notifications/mark-all-read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('updated_count'), 2)

        # Verify all user1 notifications are now read
        self.assertEqual(Notification.objects.filter(recipient=self.user1, is_read=False).count(), 0)

        # Verify user2 notification remains unread
        self.n_user2.refresh_from_db()
        self.assertFalse(self.n_user2.is_read)

    def test_filter_unread_only(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/notifications/?unread_only=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 2)
        for item in results:
            self.assertFalse(item['is_read'])


class NotificationWorkflowIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter = User.objects.create_user(
            username='hiring_lead',
            email='lead@company.com',
            password='password123',
            role='RECRUITER'
        )
        self.recruiter_profile = self.recruiter.recruiter_profile
        self.recruiter_profile.company = 'Apex Tech'
        self.recruiter_profile.save()

        self.candidate = User.objects.create_user(
            username='john_doe',
            email='john@example.com',
            password='password123',
            role='CANDIDATE'
        )
        self.candidate_profile = self.candidate.candidate_profile
        self.candidate_profile.first_name = 'John'
        self.candidate_profile.last_name = 'Doe'
        self.candidate_profile.save()

        self.job = Job.objects.create(
            recruiter=self.recruiter,
            title='Backend Engineer',
            description='Django and Python skills required',
            is_active=True
        )

        self.application = Application.objects.create(
            candidate=self.candidate_profile,
            job=self.job,
            status='PENDING'
        )

    def test_status_update_creates_candidate_notification(self):
        self.client.force_authenticate(user=self.recruiter)
        url = f'/api/applications/{self.application.id}/status/'
        
        # Recruiter marks candidate as SHORTLISTED
        res = self.client.patch(url, {'status': 'SHORTLISTED'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Check candidate received shortlisted notification
        notif = Notification.objects.filter(
            recipient=self.candidate,
            event_type='APPLICATION_SHORTLISTED'
        ).first()
        self.assertIsNotNone(notif)
        self.assertIn("shortlisted", notif.message.lower())
        self.assertEqual(notif.target_id, self.application.id)
        self.assertEqual(notif.actor, self.recruiter)

        # Recruiter should NOT receive notification for their own action
        self.assertEqual(Notification.objects.filter(recipient=self.recruiter).count(), 0)

    def test_failed_status_update_does_not_create_notification(self):
        self.client.force_authenticate(user=self.recruiter)
        url = f'/api/applications/{self.application.id}/status/'

        # Invalid status
        res = self.client.patch(url, {'status': 'NON_EXISTENT_STATUS'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Notification.objects.count(), 0)

    def test_interview_scheduled_and_rescheduled_notifications(self):
        self.client.force_authenticate(user=self.recruiter)
        url = f'/api/applications/{self.application.id}/schedule/'

        # Initial schedule
        res1 = self.client.post(url, {
            'interview_datetime': '2026-11-01T10:00',
            'meeting_link': 'https://meet.google.com/test-room',
            'duration_minutes': 30
        }, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)

        sched_notif = Notification.objects.filter(
            recipient=self.candidate,
            event_type='INTERVIEW_SCHEDULED'
        ).first()
        self.assertIsNotNone(sched_notif)
        self.assertIn("scheduled", sched_notif.message.lower())

        # Reschedule
        res2 = self.client.post(url, {
            'interview_datetime': '2026-11-02T14:00',
            'meeting_link': 'https://meet.google.com/test-room-2',
            'duration_minutes': 45
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)

        resched_notif = Notification.objects.filter(
            recipient=self.candidate,
            event_type='INTERVIEW_RESCHEDULED'
        ).first()
        self.assertIsNotNone(resched_notif)
        self.assertIn("rescheduled", resched_notif.message.lower())

