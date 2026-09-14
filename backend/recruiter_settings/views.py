from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import (
    NotificationSettings,
    SecuritySettings,
    LoginHistory,
    HiringWorkflow,
    TeamMember,
    AppearanceSettings,
    PrivacySettings,
    IntegrationSettings
)
from companies.models import Company, CompanyAIPreferences
from users.models import User, RecruiterProfile
from .serializers import (
    NotificationSettingsSerializer,
    SecuritySettingsSerializer,
    LoginHistorySerializer,
    HiringWorkflowSerializer,
    TeamMemberSerializer,
    AppearanceSettingsSerializer,
    PrivacySettingsSerializer,
    IntegrationSettingsSerializer
)


class BaseSettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_company(self):
        try:
            return self.request.user.company
        except Company.DoesNotExist:
            return None


class AccountSettingsView(BaseSettingsView):
    def get(self, request):
        user = request.user
        data = {
            'email': user.email,
        }

        if user.role == User.Role.RECRUITER:
            try:
                profile = user.recruiter_profile
                data['first_name'] = profile.first_name
                data['last_name'] = profile.last_name
                data['phone'] = profile.phone
                data['position'] = profile.position
                data['profile_image'] = request.build_absolute_uri(
                    profile.profile_image.url) if profile.profile_image else None
                data['company'] = profile.company
            except RecruiterProfile.DoesNotExist:
                pass
        elif user.role == User.Role.CANDIDATE:
            try:
                profile = user.candidate_profile
                data['first_name'] = profile.first_name
                data['last_name'] = profile.last_name
                data['phone'] = profile.phone
                data['profile_image'] = request.build_absolute_uri(
                    profile.profile_image.url) if profile.profile_image else None
            except Exception:
                pass

        return Response(data)

    def put(self, request):
        user = request.user
        data = request.data

        if user.role == User.Role.RECRUITER:
            try:
                profile = user.recruiter_profile
                profile.first_name = data.get('first_name', profile.first_name)
                profile.last_name = data.get('last_name', profile.last_name)
                profile.phone = data.get('phone', profile.phone)
                profile.position = data.get('position', profile.position)
                if 'profile_image' in request.FILES:
                    profile.profile_image = request.FILES['profile_image']

                # Auto-sync company if it exists in the main Company model
                company = self.get_company()
                if company and not profile.company:
                    profile.company = company.name

                profile.save()
            except RecruiterProfile.DoesNotExist:
                pass
        elif user.role == User.Role.CANDIDATE:
            try:
                profile = user.candidate_profile
                profile.first_name = data.get('first_name', profile.first_name)
                profile.last_name = data.get('last_name', profile.last_name)
                profile.phone = data.get('phone', profile.phone)
                if 'profile_image' in request.FILES:
                    profile.profile_image = request.FILES['profile_image']
                profile.save()
            except Exception:
                pass

        return Response({"message": "Account updated successfully"})

    def delete(self, request):
        # Danger zone - deactivate/delete account
        action = request.data.get('action')
        if action == 'DEACTIVATE':
            request.user.is_active = False
            request.user.save()
            return Response({"message": "Account deactivated"})
        elif action == 'DELETE':
            request.user.delete()
            return Response({"message": "Account deleted"})
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)


class NotificationSettingsView(BaseSettingsView):
    def get(self, request):
        settings, _ = NotificationSettings.objects.get_or_create(
            user=request.user)
        serializer = NotificationSettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        settings, _ = NotificationSettings.objects.get_or_create(
            user=request.user)
        serializer = NotificationSettingsSerializer(
            settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SecuritySettingsView(BaseSettingsView):
    def get(self, request):
        settings, _ = SecuritySettings.objects.get_or_create(user=request.user)
        serializer = SecuritySettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data
        if 'current_password' in data and 'new_password' in data:
            if not user.check_password(data['current_password']):
                return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(data['new_password'])
            user.save()
            return Response({"message": "Password changed successfully"})

        settings, _ = SecuritySettings.objects.get_or_create(user=request.user)
        serializer = SecuritySettingsSerializer(
            settings, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginHistoryView(BaseSettingsView):
    def get(self, request):
        history = LoginHistory.objects.filter(
            user=request.user).order_by('-login_time')[:10]
        serializer = LoginHistorySerializer(history, many=True)
        return Response(serializer.data)


class AISettingsView(BaseSettingsView):
    def get(self, request):
        company = self.get_company()
        if not company:
            return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)

        settings, _ = CompanyAIPreferences.objects.get_or_create(
            company=company)
        data = {
            'enable_ai_screening': settings.enable_ai_screening,
            'enable_auto_shortlisting': settings.enable_auto_shortlisting,
            'minimum_resume_score': settings.minimum_resume_score,
            'minimum_experience_years': settings.minimum_experience_years,
            'preferred_skills': settings.preferred_skills,
            'blacklist_keywords': settings.blacklist_keywords,
        }
        return Response(data)

    def put(self, request):
        company = self.get_company()
        if not company:
            return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)

        settings, _ = CompanyAIPreferences.objects.get_or_create(
            company=company)
        data = request.data

        settings.enable_ai_screening = data.get(
            'enable_ai_screening', settings.enable_ai_screening)
        settings.enable_auto_shortlisting = data.get(
            'enable_auto_shortlisting', settings.enable_auto_shortlisting)
        settings.minimum_resume_score = data.get(
            'minimum_resume_score', settings.minimum_resume_score)
        settings.minimum_experience_years = data.get(
            'minimum_experience_years', settings.minimum_experience_years)
        settings.preferred_skills = data.get(
            'preferred_skills', settings.preferred_skills)
        settings.blacklist_keywords = data.get(
            'blacklist_keywords', settings.blacklist_keywords)
        settings.save()

        return Response({"message": "AI settings updated successfully"})


class HiringWorkflowView(BaseSettingsView):
    def get(self, request):
        company = self.get_company()
        if not company:
            return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)

        workflow, _ = HiringWorkflow.objects.get_or_create(company=company)
        serializer = HiringWorkflowSerializer(workflow)
        return Response(serializer.data)


class TeamMembersView(BaseSettingsView):
    def get(self, request):
        company = self.get_company()
        if not company:
            return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)

        members = TeamMember.objects.filter(company=company)
        serializer = TeamMemberSerializer(members, many=True)
        return Response(serializer.data)


class AppearanceSettingsView(BaseSettingsView):
    def get(self, request):
        settings, _ = AppearanceSettings.objects.get_or_create(
            user=request.user)
        serializer = AppearanceSettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        settings, _ = AppearanceSettings.objects.get_or_create(
            user=request.user)
        serializer = AppearanceSettingsSerializer(
            settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PrivacySettingsView(BaseSettingsView):
    def get(self, request):
        settings, _ = PrivacySettings.objects.get_or_create(user=request.user)
        serializer = PrivacySettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        settings, _ = PrivacySettings.objects.get_or_create(user=request.user)
        serializer = PrivacySettingsSerializer(
            settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IntegrationSettingsView(BaseSettingsView):
    def get(self, request):
        company = self.get_company()
        if not company:
            return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)

        integrations = IntegrationSettings.objects.filter(company=company)
        serializer = IntegrationSettingsSerializer(integrations, many=True)
        return Response(serializer.data)
