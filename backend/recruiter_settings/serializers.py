from rest_framework import serializers
from .models import (
    NotificationSettings,
    SecuritySettings,
    LoginHistory,
    HiringWorkflow,
    HiringStage,
    TeamMember,
    AppearanceSettings,
    PrivacySettings,
    IntegrationSettings
)


class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = '__all__'
        read_only_fields = ('user',)


class SecuritySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecuritySettings
        fields = '__all__'
        read_only_fields = ('user',)


class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHistory
        fields = '__all__'


class HiringStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HiringStage
        fields = '__all__'


class HiringWorkflowSerializer(serializers.ModelSerializer):
    stages = HiringStageSerializer(many=True, read_only=True)

    class Meta:
        model = HiringWorkflow
        fields = '__all__'
        read_only_fields = ('company',)


class TeamMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = TeamMember
        fields = '__all__'
        read_only_fields = ('company',)


class AppearanceSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppearanceSettings
        fields = '__all__'
        read_only_fields = ('user',)


class PrivacySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivacySettings
        fields = '__all__'
        read_only_fields = ('user',)


class IntegrationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationSettings
        fields = '__all__'
        read_only_fields = ('company',)
