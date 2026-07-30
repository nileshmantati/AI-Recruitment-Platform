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
    socials = CompanySocialSerializer(required=False)
    branding = CompanyBrandingSerializer(required=False)
    ai_preferences = CompanyAIPreferencesSerializer(required=False)
    locations = CompanyLocationSerializer(many=True, read_only=True)
    documents = CompanyDocumentSerializer(many=True, read_only=True)
    gallery_images = CompanyGallerySerializer(many=True, read_only=True)

    class Meta:
        model = Company
        exclude = ('user',)
        read_only_fields = ('is_verified', 'created_at', 'updated_at')

    def create(self, validated_data):
        socials_data = validated_data.pop('socials', {})
        branding_data = validated_data.pop('branding', {})
        ai_prefs_data = validated_data.pop('ai_preferences', {})
        
        company = Company.objects.create(**validated_data)
        
        CompanySocial.objects.create(company=company, **socials_data)
        CompanyBranding.objects.create(company=company, **branding_data)
        CompanyAIPreferences.objects.create(company=company, **ai_prefs_data)
        
        return company

    def update(self, instance, validated_data):
        socials_data = validated_data.pop('socials', None)
        branding_data = validated_data.pop('branding', None)
        ai_prefs_data = validated_data.pop('ai_preferences', None)

        # Update Company fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Socials
        if socials_data is not None:
            socials, _ = CompanySocial.objects.get_or_create(company=instance)
            for attr, value in socials_data.items():
                setattr(socials, attr, value)
            socials.save()

        # Update Branding
        if branding_data is not None:
            branding, _ = CompanyBranding.objects.get_or_create(company=instance)
            for attr, value in branding_data.items():
                setattr(branding, attr, value)
            branding.save()

        # Update AI Preferences
        if ai_prefs_data is not None:
            ai_prefs, _ = CompanyAIPreferences.objects.get_or_create(company=instance)
            for attr, value in ai_prefs_data.items():
                setattr(ai_prefs, attr, value)
            ai_prefs.save()

        return instance
