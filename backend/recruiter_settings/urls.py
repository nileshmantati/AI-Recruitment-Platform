from django.urls import path
from . import views

urlpatterns = [
    path('account/', views.AccountSettingsView.as_view(), name='account_settings'),
    path('notifications/', views.NotificationSettingsView.as_view(),
         name='notification_settings'),
    path('security/', views.SecuritySettingsView.as_view(),
         name='security_settings'),
    path('security/login-history/',
         views.LoginHistoryView.as_view(), name='login_history'),
    path('ai/', views.AISettingsView.as_view(), name='ai_settings'),
    path('workflow/', views.HiringWorkflowView.as_view(), name='workflow_settings'),
    path('integrations/', views.IntegrationSettingsView.as_view(),
         name='integration_settings'),
    path('appearance/', views.AppearanceSettingsView.as_view(),
         name='appearance_settings'),
    path('privacy/', views.PrivacySettingsView.as_view(), name='privacy_settings'),
    path('team/', views.TeamMembersView.as_view(), name='team_settings'),
]
