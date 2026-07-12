from django.urls import path
from .views import ApplyJobView, GenerateInterviewQuestionsView, JobApplicantsListView, UpdateApplicationStatusView, ScheduleInterviewView, MyApplicationsListView, LatestApplicationsView, AllRecruiterApplicationsView

urlpatterns = [
    path('apply/', ApplyJobView.as_view(), name='apply-job'),
    path('my/', MyApplicationsListView.as_view(), name='my-applications'),
    path('latest/', LatestApplicationsView.as_view(), name='latest-applications'),
    path('all/', AllRecruiterApplicationsView.as_view(), name='all-applications'),
    path('jobs/<int:job_id>/applicants/', JobApplicantsListView.as_view(), name='job-applicants'),
    path('<int:application_id>/generate-questions/', GenerateInterviewQuestionsView.as_view(), name='generate-questions'),
    path('<int:application_id>/status/', UpdateApplicationStatusView.as_view(), name='update-status'),
    path('<int:application_id>/schedule/', ScheduleInterviewView.as_view(), name='schedule-interview'),
]