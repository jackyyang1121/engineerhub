# apps/notifications/serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        # 指定序列化的模型為Notification
        model = Notification
        # 定義需要序列化的字段
        fields = ['id', 'sender', 'notification_type', 'post', 'comment', 'created_at', 'is_read']