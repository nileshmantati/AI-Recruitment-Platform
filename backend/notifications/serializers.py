from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'actor_name',
            'event_type',
            'title',
            'message',
            'target_type',
            'target_id',
            'is_read',
            'created_at',
        ]
        read_only_fields = fields

    def get_actor_name(self, obj):
        if not obj.actor:
            return None
        full_name = obj.actor.get_full_name().strip()
        return full_name if full_name else obj.actor.username
