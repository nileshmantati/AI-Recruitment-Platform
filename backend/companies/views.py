from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import (
    Company,
    CompanyLocation,
    CompanyDocument,
    CompanyGallery
)
from .serializers import (
    CompanySerializer,
    CompanyLocationSerializer,
    CompanyDocumentSerializer,
    CompanyGallerySerializer
)


class IsRecruiter(permissions.BasePermission):
    """
    Custom permission to only allow recruiters to access company profiles.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'RECRUITER')


class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        # A recruiter should only see their own company
        return Company.objects.filter(user=self.request.user)

    def get_object(self):
        # Always return the current user's company profile for standard retrieve/update
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset)
        return obj

    def create(self, request, *args, **kwargs):
        # Upsert logic: if company exists, update it.
        company = self.get_queryset().first()

        # Remove logo and cover_banner from request.data if they are strings (URLs)
        # to prevent DRF ImageField validation errors.
        data = request.data.copy()
        if isinstance(data.get('logo'), str):
            data.pop('logo', None)
        if isinstance(data.get('cover_banner'), str):
            data.pop('cover_banner', None)

        if company:
            serializer = self.get_serializer(company, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        data = request.data.copy()
        if isinstance(data.get('logo'), str):
            data.pop('logo', None)
        if isinstance(data.get('cover_banner'), str):
            data.pop('cover_banner', None)

        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['GET'])
    def profile(self, request):
        try:
            company = self.get_queryset().first()
            if company:
                serializer = self.get_serializer(company)
                return Response(serializer.data)
            return Response({"detail": "Company profile not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['GET'])
    def completion(self, request):
        """
        Calculates and returns the profile completion percentage.
        """
        company = self.get_queryset().first()
        if not company:
            return Response({"completion": 0, "status": "incomplete"})

        score = 0

        # Basic Info (20%)
        if company.name and company.industry and company.email:
            score += 20
        # About (15%)
        if company.about and company.mission:
            score += 15
        # Contact (10%)
        if company.address and company.city and company.country:
            score += 10
        # Socials (5%)
        if hasattr(company, 'socials') and (company.socials.linkedin or company.socials.twitter):
            score += 5
        # Branding (10%)
        if hasattr(company, 'branding') and company.branding.primary_color:
            score += 10
        # AI Prefs (10%)
        if hasattr(company, 'ai_preferences'):
            score += 10
        # Locations (15%)
        if company.locations.exists():
            score += 15
        # Documents (15%)
        if company.documents.exists():
            score += 15

        return Response({
            "completion": score,
            "status": "completed" if score == 100 else "incomplete"
        })

    @action(detail=False, methods=['POST'])
    def logo(self, request):
        company, _ = Company.objects.get_or_create(
            user=request.user,
            defaults={'name': 'Draft Company', 'industry': 'Other'}
        )
        if 'logo' in request.FILES:
            company.logo = request.FILES['logo']
            company.save()
            return Response({"logo_url": request.build_absolute_uri(company.logo.url)})
        return Response({"detail": "No logo provided."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'])
    def banner(self, request):
        company, _ = Company.objects.get_or_create(
            user=request.user,
            defaults={'name': 'Draft Company', 'industry': 'Other'}
        )
        if 'banner' in request.FILES:
            company.cover_banner = request.FILES['banner']
            company.save()
            return Response({"banner_url": request.build_absolute_uri(company.cover_banner.url)})
        return Response({"detail": "No banner provided."}, status=status.HTTP_400_BAD_REQUEST)


class CompanyLocationViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyLocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return CompanyLocation.objects.filter(company__user=self.request.user)

    def perform_create(self, serializer):
        company = get_object_or_404(Company, user=self.request.user)
        serializer.save(company=company)


class CompanyDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyDocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return CompanyDocument.objects.filter(company__user=self.request.user)

    def perform_create(self, serializer):
        company = get_object_or_404(Company, user=self.request.user)
        serializer.save(company=company)


class CompanyGalleryViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyGallerySerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return CompanyGallery.objects.filter(company__user=self.request.user)

    def perform_create(self, serializer):
        company = get_object_or_404(Company, user=self.request.user)
        serializer.save(company=company)
