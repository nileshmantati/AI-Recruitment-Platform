from django.shortcuts import render

# Create your views here.
# jobs/views.py
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Job
from .serializers import JobSerializer

class JobListCreateView(generics.ListCreateAPIView):
    """
    GET: Lists all active jobs (Available to anyone, even unauthenticated users)
    POST: Creates a new job (Requires JWT Token + RECRUITER role)
    """
    queryset = Job.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = JobSerializer
    # Allow read-only for anyone, but require auth for POST
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 

    def perform_create(self, serializer):
        # Security Check: Ensure the user is actually a recruiter
        if self.request.user.role != 'RECRUITER':
            raise PermissionDenied("Only verified recruiters can post new jobs.")
        
        # Save the job with the currently logged-in user as the recruiter
        serializer.save(recruiter=self.request.user)

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve specific job details
    PUT/PATCH: Update job (Requires ownership)
    DELETE: Remove job (Requires ownership)
    """
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        # Security Check: Recruiters can only edit their own postings
        if self.get_object().recruiter != self.request.user:
            raise PermissionDenied("You do not have permission to edit this job posting.")
        serializer.save()

    def perform_destroy(self, instance):
        # Security Check: Recruiters can only delete their own postings
        if instance.recruiter != self.request.user:
            raise PermissionDenied("You do not have permission to delete this job posting.")
        instance.delete()


class MyJobsListView(generics.ListAPIView):
    """
    GET: Returns only jobs posted by the currently authenticated recruiter.
    """
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(
            recruiter=self.request.user,
            is_active=True
        ).order_by('-created_at')