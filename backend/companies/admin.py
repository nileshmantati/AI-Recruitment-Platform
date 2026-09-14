from django.contrib import admin
from .models import (
    Company,
    CompanySocial,
    CompanyLocation,
    CompanyDocument,
    CompanyBranding,
    CompanyGallery,
    CompanyAIPreferences
)


class CompanySocialInline(admin.StackedInline):
    model = CompanySocial
    can_delete = False


class CompanyBrandingInline(admin.StackedInline):
    model = CompanyBranding
    can_delete = False


class CompanyAIPreferencesInline(admin.StackedInline):
    model = CompanyAIPreferences
    can_delete = False


class CompanyLocationInline(admin.StackedInline):
    model = CompanyLocation
    extra = 1


class CompanyDocumentInline(admin.TabularInline):
    model = CompanyDocument
    extra = 1


class CompanyGalleryInline(admin.TabularInline):
    model = CompanyGallery
    extra = 1


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'user', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'industry', 'working_mode')
    search_fields = ('name', 'user__username', 'email')
    inlines = [
        CompanySocialInline,
        CompanyBrandingInline,
        CompanyAIPreferencesInline,
        CompanyLocationInline,
        CompanyDocumentInline,
        CompanyGalleryInline
    ]


@admin.register(CompanyLocation)
class CompanyLocationAdmin(admin.ModelAdmin):
    list_display = ('company', 'name', 'city', 'country', 'is_head_office')


@admin.register(CompanyDocument)
class CompanyDocumentAdmin(admin.ModelAdmin):
    list_display = ('company', 'doc_type', 'uploaded_at')


@admin.register(CompanyGallery)
class CompanyGalleryAdmin(admin.ModelAdmin):
    list_display = ('company', 'caption', 'uploaded_at')
