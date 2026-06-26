from django.urls import path
from .views import RecruiterAnalyticsView

urlpatterns = [
    path('recruiter-stats/', RecruiterAnalyticsView.as_view(), name='recruiter-stats'),
]