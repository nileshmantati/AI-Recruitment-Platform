import logging
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


class NotificationPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 50


class NotificationListView(APIView):
    """
    GET: List the authenticated user's notifications, ordered by newest first.
    Query params:
        - unread_only (bool): If true, filters only unread notifications.
        - page (int): Page number.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Notification.objects.filter(
            recipient=request.user
        ).select_related('actor').order_by('-created_at')

        unread_only = request.query_params.get('unread_only', '').strip().lower()
        if unread_only in ['true', '1']:
            queryset = queryset.filter(is_read=False)

        paginator = NotificationPagination()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = NotificationSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificationUnreadCountView(APIView):
    """
    GET: Return the authenticated user's unread notification count.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)


class NotificationMarkReadView(APIView):
    """
    PATCH: Mark a specific notification as read.
    Enforces strict ownership check (recipient == request.user).
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        notification = get_object_or_404(
            Notification,
            id=pk,
            recipient=request.user
        )
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=['is_read'])

        return Response({
            "id": notification.id,
            "is_read": True,
            "message": "Notification marked as read."
        }, status=status.HTTP_200_OK)


class NotificationMarkAllReadView(APIView):
    """
    POST: Mark all unread notifications for the authenticated user as read.
    Uses a single efficient SQL UPDATE.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        updated_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)

        return Response({
            "message": "All notifications marked as read.",
            "updated_count": updated_count
        }, status=status.HTTP_200_OK)
