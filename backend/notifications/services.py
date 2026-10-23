import logging
from datetime import timedelta
from django.utils import timezone
from .models import Notification

logger = logging.getLogger(__name__)


def create_notification(
    recipient,
    actor=None,
    event_type="",
    title="",
    message="",
    target_type="",
    target_id=None
):
    """
    Safely creates a notification record in the database.

    Guarantees:
    - Never raises an unhandled exception that could break business transactions.
    - Does not notify an actor of their own action.
    - Performs lightweight deduplication for repeat events on the same resource within 10 seconds.
    """
    if not recipient or not getattr(recipient, 'id', None):
        return None

    # Do not notify the actor of their own action
    if actor and getattr(actor, 'id', None) == recipient.id:
        return None

    try:
        # Lightweight deduplication: check if an identical notification was created recently
        recent = Notification.objects.filter(
            recipient=recipient,
            event_type=event_type,
            target_type=target_type,
            target_id=target_id,
            created_at__gte=timezone.now() - timedelta(seconds=10)
        ).first()

        if recent:
            return recent

        return Notification.objects.create(
            recipient=recipient,
            actor=actor,
            event_type=event_type,
            title=title,
            message=message,
            target_type=target_type,
            target_id=target_id,
        )
    except Exception as exc:
        logger.error(
            f"Error creating notification ({event_type}) for user {getattr(recipient, 'id', None)}: {exc}"
        )
        return None
