from django.urls import path
from . import views

urlpatterns = [
    path('analyze-resume/', views.analyze_resume, name='analyze-resume'),
    path('mock-interview/generate-questions/', views.generate_mock_questions, name='mock-interview-questions'),
    path('mock-interview/evaluate-answer/', views.evaluate_mock_answer, name='mock-interview-evaluate'),
    path('job-description/generate/', views.generate_job_description, name='generate-job-description'),
    path('job-description/analyze-bias/', views.analyze_job_description_bias, name='analyze-job-description-bias'),
]
