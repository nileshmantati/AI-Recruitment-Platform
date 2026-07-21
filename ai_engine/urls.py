from django.urls import path
from . import views

urlpatterns = [
    path('analyze-resume/', views.analyze_resume, name='analyze-resume'),
]
