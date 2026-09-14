from django.urls import path
from .views import JobListCreateView, JobDetailView, MyJobsListView

urlpatterns = [
    path('', JobListCreateView.as_view(), name='job-list-create'),
    path('my/', MyJobsListView.as_view(),
         name='my-jobs'),  # Recruiter's own jobs
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
]
