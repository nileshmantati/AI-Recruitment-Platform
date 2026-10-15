from django.urls import path
from . import views

urlpatterns = [
    path('analyze-resume/', views.analyze_resume, name='analyze-resume'),
    path('mock-interview/generate-questions/', views.generate_mock_questions, name='mock-interview-questions'),
    path('mock-interview/evaluate-answer/', views.evaluate_mock_answer, name='mock-interview-evaluate'),
]
