from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet,
    CompanyLocationViewSet,
    CompanyDocumentViewSet,
    CompanyGalleryViewSet
)

router = DefaultRouter()
router.register(r'', CompanyViewSet, basename='company')
router.register(r'locations', CompanyLocationViewSet,
                basename='company-location')
router.register(r'documents', CompanyDocumentViewSet,
                basename='company-document')
router.register(r'gallery', CompanyGalleryViewSet, basename='company-gallery')

# Notice that router generates /company/ (which is the root), /company/profile/, etc.
# But because we will mount this at /api/company/, the endpoints will be /api/company/, /api/company/profile/, etc.

urlpatterns = [
    path('', include(router.urls)),
]
