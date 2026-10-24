

from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User
from jobs.models import Job
from ai_engine.services import (
    sanitize_job_html,
    scan_content_for_bias_rules,
    generate_job_description_studio,
    analyze_job_description_bias_service
)


class JobDescriptionStudioTests(APITestCase):
    def setUp(self):
        self.generate_url = reverse('generate-job-description')
        self.bias_url = reverse('analyze-job-description-bias')
        self.jobs_url = reverse('job-list-create')

        # Recruiter user
        self.recruiter = User.objects.create_user(
            username='recruiter_studio',
            email='rec_studio@example.com',
            password='Password123!',
            role=User.Role.RECRUITER,
            is_email_verified=True
        )

        # Candidate user
        self.candidate = User.objects.create_user(
            username='candidate_studio',
            email='cand_studio@example.com',
            password='Password123!',
            role=User.Role.CANDIDATE,
            is_email_verified=True
        )

    def test_unauthenticated_user_cannot_generate(self):
        """Unauthenticated requests are rejected with 401."""
        response = self.client.post(self.generate_url, {
            'title': 'Frontend Developer',
            'experience_level': 'Mid-Level (3-5 years)'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_candidate_cannot_generate(self):
        """Candidates cannot access recruiter job studio endpoints."""
        self.client.force_authenticate(user=self.candidate)
        response = self.client.post(self.generate_url, {
            'title': 'Frontend Developer',
            'experience_level': 'Mid-Level (3-5 years)'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_candidate_cannot_analyze_bias(self):
        """Candidates cannot invoke the bias analysis endpoint."""
        self.client.force_authenticate(user=self.candidate)
        response = self.client.post(self.bias_url, {
            'content': 'We need a senior engineer.'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_missing_required_fields_returns_400(self):
        """Omitting title or experience_level triggers validation error."""
        self.client.force_authenticate(user=self.recruiter)

        # Missing title
        res1 = self.client.post(self.generate_url, {'experience_level': 'Senior'})
        self.assertEqual(res1.status_code, status.HTTP_400_BAD_REQUEST)

        # Missing experience level
        res2 = self.client.post(self.generate_url, {'title': 'Backend Developer'})
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_recruiter_generates_job_description_successfully(self):
        """Recruiter successfully generates structured job description."""
        self.client.force_authenticate(user=self.recruiter)
        payload = {
            'title': 'Full Stack Developer',
            'experience_level': 'Mid-Level (3-5 years)',
            'work_mode': 'Remote',
            'location': 'Bengaluru',
            'employment_type': 'Full-time',
            'currency': 'INR'
        }
        response = self.client.post(self.generate_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn('role_summary', data)
        self.assertIn('responsibilities', data)
        self.assertIn('required_skills', data)
        self.assertIn('compensation', data)
        self.assertIn('job_description_html', data)
        self.assertIn('bias_analysis', data)
        self.assertGreaterEqual(data['bias_analysis']['score'], 0)
        self.assertLessEqual(data['bias_analysis']['score'], 100)

    def test_bias_analysis_detects_exclusionary_buzzwords(self):
        """Content containing 'ninja', 'rockstar', or 'aggressive' flags findings."""
        self.client.force_authenticate(user=self.recruiter)
        exclusionary_text = "<p>We are seeking a rockstar ninja developer who is aggressive and young and energetic.</p>"
        response = self.client.post(self.bias_url, {'content': exclusionary_text})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn('score', data)
        self.assertIn('findings', data)
        self.assertGreater(len(data['findings']), 0)
        self.assertLess(data['score'], 85)

    def test_html_sanitizer_removes_dangerous_tags(self):
        """Sanitizer strips script, iframe, and onclick while dropping inner script contents."""
        dirty_html = '<p>Good text</p><script>alert("xss")</script><style>body {display:none;}</style><strong onclick="hack()">Safe bold</strong><iframe src="evil.com"></iframe>'
        clean = sanitize_job_html(dirty_html)
        self.assertNotIn('<script>', clean)
        self.assertNotIn('<iframe>', clean)
        self.assertNotIn('<style>', clean)
        self.assertNotIn('onclick', clean)
        self.assertNotIn('alert', clean)
        self.assertNotIn('display:none', clean)
        self.assertIn('<p>Good text</p>', clean)
        self.assertIn('<strong>Safe bold</strong>', clean)

    def test_job_serializer_handles_empty_type_gracefully(self):
        """JobSerializer normalizes empty or whitespace type to 'Full-time'."""
        from jobs.serializers import JobSerializer
        data = {'title': 'QA Lead', 'description': 'Testing...', 'type': ''}
        serializer = JobSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data.get('type'), 'Full-time')

    def test_existing_manual_job_creation_unaffected(self):
        """Manual job creation through /api/jobs/ continues working without issue."""
        self.client.force_authenticate(user=self.recruiter)
        job_data = {
            'title': 'DevOps Architect',
            'description': 'Manage Kubernetes clusters and CI/CD pipelines.',
            'required_skills': ['Kubernetes', 'Docker', 'Terraform'],
            'salary': '2500000'
        }
        response = self.client.post(self.jobs_url, job_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Job.objects.filter(title='DevOps Architect').count(), 1)

