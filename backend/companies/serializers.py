from django.conf import settings
from rest_framework import serializers
from .models import (
    Company,
    CompanySocial,
    CompanyLocation,
    CompanyDocument,
    CompanyBranding,
    CompanyGallery,
    CompanyAIPreferences
)


class CompanySocialSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySocial
        exclude = ('id', 'company')


class CompanyLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyLocation
        exclude = ('company',)


class CompanyDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyDocument
        exclude = ('company',)


class CompanyBrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyBranding
        exclude = ('id', 'company')


class CompanyGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyGallery
        exclude = ('company',)


class CompanyAIPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyAIPreferences
        exclude = ('id', 'company')


class CompanySerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    cover_banner = serializers.SerializerMethodField()
    socials = CompanySocialSerializer(required=False, allow_null=True)
    branding = CompanyBrandingSerializer(required=False, allow_null=True)
    ai_preferences = CompanyAIPreferencesSerializer(required=False, allow_null=True)
    locations = CompanyLocationSerializer(many=True, read_only=True)
    documents = CompanyDocumentSerializer(many=True, read_only=True)
    gallery_images = CompanyGallerySerializer(many=True, read_only=True)

    class Meta:
        model = Company
        exclude = ('user',)
        read_only_fields = ('is_verified', 'created_at', 'updated_at')

    def get_logo(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request is not None:
                url = request.build_absolute_uri(obj.logo.url)
                if (request.is_secure() or getattr(settings, 'SECURE_PROXY_SSL_HEADER', None)) and url.startswith('http://'):
                    url = 'https://' + url[7:]
                return url
            return obj.logo.url
        return None

    def get_cover_banner(self, obj):
        if obj.cover_banner:
            request = self.context.get('request')
            if request is not None:
                url = request.build_absolute_uri(obj.cover_banner.url)
                if (request.is_secure() or getattr(settings, 'SECURE_PROXY_SSL_HEADER', None)) and url.startswith('http://'):
                    url = 'https://' + url[7:]
                return url
            return obj.cover_banner.url
        return None

    def _sync_recruiter_company_name(self, company):
        recruiter_profile = getattr(company.user, 'recruiter_profile', None)
        if recruiter_profile is not None and company.name:
            synced_name = company.name[:100]
            if recruiter_profile.company != synced_name:
                recruiter_profile.company = synced_name
                recruiter_profile.save(update_fields=['company'])

    def create(self, validated_data):
        socials_data = validated_data.pop('socials', None) or {}
        branding_data = validated_data.pop('branding', None) or {}
        ai_prefs_data = validated_data.pop('ai_preferences', None) or {}

        company = Company.objects.create(**validated_data)

        CompanySocial.objects.create(company=company, **socials_data)
        CompanyBranding.objects.create(company=company, **branding_data)
        CompanyAIPreferences.objects.create(company=company, **ai_prefs_data)
        self._sync_recruiter_company_name(company)

        return company

    def update(self, instance, validated_data):
        socials_data = validated_data.pop('socials', None)
        branding_data = validated_data.pop('branding', None)
        ai_prefs_data = validated_data.pop('ai_preferences', None)

        # Update Company fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        self._sync_recruiter_company_name(instance)

        # Update Socials
        if socials_data is not None:
            socials, _ = CompanySocial.objects.get_or_create(company=instance)
            for attr, value in socials_data.items():
                setattr(socials, attr, value)
            socials.save()

        # Update Branding
        if branding_data is not None:
            branding, _ = CompanyBranding.objects.get_or_create(
                company=instance)
            for attr, value in branding_data.items():
                setattr(branding, attr, value)
            branding.save()

        # Update AI Preferences
        if ai_prefs_data is not None:
            ai_prefs, _ = CompanyAIPreferences.objects.get_or_create(
                company=instance)
            for attr, value in ai_prefs_data.items():
                setattr(ai_prefs, attr, value)
            ai_prefs.save()

        return instance
