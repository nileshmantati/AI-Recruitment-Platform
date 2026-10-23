from datetime import datetime, timedelta
from django.urls import reverse
from django.core import mail
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User, CandidateProfile, RecruiterProfile
from jobs.models import Job
from applications.models import Application
from applications.utils import (
    escape_ical_text,
    fold_ical_line,
    parse_interview_datetime,
    generate_ics_calendar,
)
from ai_engine.tasks import send_interview_invitation


class ICalendarUtilsTests(TestCase):
    def test_escape_ical_text(self):
        raw = "Hello, world; this is a \\ test\nwith newlines\r\nand more."
        escaped = escape_ical_text(raw)
        self.assertIn(r"Hello\, world\;", escaped)
        self.assertIn(r"\\ test", escaped)
        self.assertIn(r"\nwith newlines\nand more.", escaped)

    def test_fold_ical_line(self):
        short_line = "SUMMARY:Short line"
        self.assertEqual(fold_ical_line(short_line), short_line)

        long_line = "DESCRIPTION:" + "A" * 150
        folded = fold_ical_line(long_line, max_bytes=75)
        self.assertIn('\r\n ', folded)
        # Verify no segment exceeds 75 octets
        for segment in folded.split('\r\n '):
            self.assertLessEqual(len(segment.encode('utf-8')), 75)

    def test_parse_interview_datetime(self):
        dt = parse_interview_datetime("2026-10-25T14:30")
        self.assertIsNotNone(dt.tzinfo)
        self.assertEqual(dt.year, 2026)
        self.assertEqual(dt.month, 10)
        self.assertEqual(dt.day, 25)

    def test_generate_ics_calendar_structure(self):
        ics = generate_ics_calendar(
            application_id=42,
            job_title="Senior Python Engineer",
            candidate_name="Alice Smith",
            candidate_email="alice@example.com",
            recruiter_name="Bob Jones",
            recruiter_email="bob@recruiter.com",
            interview_datetime="2026-10-25T14:30",
            duration_minutes=45,
            meeting_link="https://meet.google.com/abc-defg-hij",
            company_name="TechCorp",
            sequence=1,
        )

        self.assertTrue(ics.startswith("BEGIN:VCALENDAR"))
        self.assertTrue(ics.endswith("END:VCALENDAR\r\n"))
        self.assertIn("VERSION:2.0", ics)
        self.assertIn("METHOD:REQUEST", ics)
        self.assertIn("BEGIN:VEVENT", ics)
        self.assertIn("UID:interview-42@airecruitmentplatform.com", ics)
        self.assertIn("SEQUENCE:1", ics)
        self.assertIn("SUMMARY:Interview: Senior Python Engineer at TechCorp", ics)
        self.assertIn("LOCATION:https://meet.google.com/abc-defg-hij", ics)
        self.assertIn("URL:https://meet.google.com/abc-defg-hij", ics)
        self.assertIn("ORGANIZER;CN=Bob Jones:mailto:bob@recruiter.com", ics)
        self.assertIn("ATTENDEE;", ics)
        self.assertIn("alice@example.com", ics)
        self.assertIn("END:VEVENT", ics)


class InterviewCalendarAPITests(APITestCase):
    def setUp(self):
        # Create recruiter
        self.recruiter_user = User.objects.create_user(
            username='recruiter_jane',
            email='recruiter@company.com',
            password='Password123!',
            role=User.Role.RECRUITER,
            is_email_verified=True,
        )
        self.recruiter_profile = self.recruiter_user.recruiter_profile
        self.recruiter_profile.company = 'Acme Corp'
        self.recruiter_profile.save()

        # Create other recruiter (for unauthorized checks)
        self.other_recruiter = User.objects.create_user(
            username='recruiter_other',
            email='other@company.com',
            password='Password123!',
            role=User.Role.RECRUITER,
            is_email_verified=True,
        )

        # Create candidate
        self.candidate_user = User.objects.create_user(
            username='candidate_john',
            email='candidate@domain.com',
            password='Password123!',
            role=User.Role.CANDIDATE,
            is_email_verified=True,
        )
        self.candidate_profile = self.candidate_user.candidate_profile
        self.candidate_profile.first_name = 'John'
        self.candidate_profile.last_name = 'Doe'
        self.candidate_profile.save()

        # Create other candidate (for unauthorized checks)
        self.other_candidate = User.objects.create_user(
            username='candidate_other',
            email='other_candidate@domain.com',
            password='Password123!',
            role=User.Role.CANDIDATE,
            is_email_verified=True,
        )
        self.other_candidate_profile = self.other_candidate.candidate_profile
        self.other_candidate_profile.first_name = 'Other'
        self.other_candidate_profile.last_name = 'User'
        self.other_candidate_profile.save()

        # Create job
        self.job = Job.objects.create(
            title='Backend Architect',
            description='Design distributed services.',
            recruiter=self.recruiter_user,
            required_skills=['Python', 'Django', 'Celery'],
        )

        # Create application with scheduled interview
        self.application = Application.objects.create(
            job=self.job,
            candidate=self.candidate_profile,
            status='INTERVIEW_SCHEDULED',
            ai_feedback={
                'interview_datetime': '2026-10-25T14:30',
                'meeting_link': 'https://meet.google.com/test-room',
                'duration_minutes': 45,
                'interview_sequence': 0,
            }
        )

        self.calendar_url = reverse('interview-calendar-invite', kwargs={'application_id': self.application.id})
        self.schedule_url = reverse('schedule-interview', kwargs={'application_id': self.application.id})

    def test_unauthenticated_cannot_download_calendar(self):
        response = self.client.get(self.calendar_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthorized_candidate_cannot_download_calendar(self):
        self.client.force_authenticate(user=self.other_candidate)
        response = self.client.get(self.calendar_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthorized_recruiter_cannot_download_calendar(self):
        self.client.force_authenticate(user=self.other_recruiter)
        response = self.client.get(self.calendar_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_candidate_owner_downloads_calendar(self):
        self.client.force_authenticate(user=self.candidate_user)
        response = self.client.get(self.calendar_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/calendar; charset=utf-8')
        self.assertIn(f'attachment; filename="interview-{self.application.id}.ics"', response['Content-Disposition'])
        body = response.content.decode('utf-8')
        self.assertIn("BEGIN:VCALENDAR", body)
        self.assertIn("Backend Architect", body)
        self.assertIn("Acme Corp", body)
        self.assertIn("https://meet.google.com/test-room", body)

    def test_recruiter_owner_downloads_calendar(self):
        self.client.force_authenticate(user=self.recruiter_user)
        response = self.client.get(self.calendar_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/calendar; charset=utf-8')

    def test_calendar_fails_if_not_scheduled(self):
        unscheduled_app = Application.objects.create(
            job=self.job,
            candidate=self.candidate_profile,
            status='PENDING',
            ai_feedback={}
        )
        url = reverse('interview-calendar-invite', kwargs={'application_id': unscheduled_app.id})
        self.client.force_authenticate(user=self.candidate_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_schedule_interview_updates_data_and_sequence(self):
        self.client.force_authenticate(user=self.recruiter_user)
        payload = {
            'interview_datetime': '2026-11-01T10:00',
            'meeting_link': 'https://meet.google.com/rescheduled-room',
            'duration_minutes': 60,
        }
        response = self.client.post(self.schedule_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'INTERVIEW_SCHEDULED')
        self.assertEqual(response.data['duration_minutes'], 60)

        # Verify database state
        self.application.refresh_from_db()
        self.assertEqual(self.application.ai_feedback['interview_datetime'], '2026-11-01T10:00')
        self.assertEqual(self.application.ai_feedback['meeting_link'], 'https://meet.google.com/rescheduled-room')
        self.assertEqual(self.application.ai_feedback['duration_minutes'], 60)
        self.assertEqual(self.application.ai_feedback['interview_sequence'], 1)

    def test_email_notification_with_ics_attachment(self):
        mail.outbox.clear()
        send_interview_invitation(
            application_id=self.application.id,
            interview_datetime='2026-10-25T14:30',
            meeting_link='https://meet.google.com/test-room',
            duration_minutes=45,
        )

        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertIn('candidate@domain.com', sent_email.to)
        self.assertIn('Interview Invitation: Backend Architect at Acme Corp', sent_email.subject)
        self.assertIn('https://meet.google.com/test-room', sent_email.body)
        self.assertEqual(len(sent_email.attachments), 1)
        filename, content, mimetype = sent_email.attachments[0]
        self.assertEqual(filename, 'interview-invitation.ics')
        self.assertIn('text/calendar', mimetype)
        self.assertIn('BEGIN:VCALENDAR', content)
        self.assertIn('UID:interview-', content)
