from django.test import TestCase
from users.models import User, RecruiterProfile
from jobs.models import Job
from jobs.serializers import JobSerializer
from companies.models import Company


class JobSerializerCompanyTests(TestCase):
    def setUp(self):
        self.recruiter = User.objects.create_user(
            username='recruiter_co_test',
            email='rec_co@test.com',
            password='Password123!',
            role='RECRUITER'
        )

    def test_job_serializer_resolves_company_from_company_model(self):
        Company.objects.create(
            user=self.recruiter,
            name='Acme Cyber Dynamics',
            industry='Technology',
            founded_year=2020
        )
        job = Job.objects.create(
            title='Staff Security Architect',
            description='Analyze and secure high-scale distributed systems.',
            recruiter=self.recruiter,
            salary='180000'
        )
        serializer = JobSerializer(job)
        self.assertEqual(serializer.data['company'], 'Acme Cyber Dynamics')
        self.assertEqual(serializer.data['title'], 'Staff Security Architect')

    def test_job_serializer_resolves_company_from_profile_fallback(self):
        recruiter2 = User.objects.create_user(
            username='recruiter_profile_test',
            email='rec_prof@test.com',
            password='Password123!',
            role='RECRUITER'
        )
        # RecruiterProfile is auto-created by signal
        profile = recruiter2.recruiter_profile
        profile.company = 'InnoTech Solutions'
        profile.save()

        job2 = Job.objects.create(
            title='Frontend Lead',
            description='Build next-gen React applications.',
            recruiter=recruiter2,
            salary='150000'
        )
        serializer = JobSerializer(job2)
        self.assertEqual(serializer.data['company'], 'InnoTech Solutions')
