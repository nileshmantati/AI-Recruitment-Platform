

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from jobs.models import Job
from applications.models import Application
from django.db.models import Count

class RecruiterAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 1. Ensure user is a recruiter
        if request.user.role != 'RECRUITER':
            return Response({"error": "Unauthorized"}, status=403)

        # 2. Get Basic Card Stats
        total_jobs = Job.objects.filter(recruiter=request.user).count()
        total_applications = Application.objects.filter(job__recruiter=request.user).count()
        shortlisted = Application.objects.filter(job__recruiter=request.user, status='SHORTLISTED').count()

        # 3. Get Chart Data (Applications per Job)
        # Using Django's annotate to count applications for each job efficiently
        jobs_with_counts = Job.objects.filter(recruiter=request.user).annotate(app_count=Count('applications'))
        
        # Formatting data specifically for Recharts
        chart_data = [
            {
                "name": job.title[:15] + "..." if len(job.title) > 15 else job.title, # Truncate long names
                "applicants": job.app_count
            }
            for job in jobs_with_counts
        ]

        return Response({
            "total_jobs": total_jobs,
            "total_applications": total_applications,
            "shortlisted": shortlisted,
            "chart_data": chart_data
        })