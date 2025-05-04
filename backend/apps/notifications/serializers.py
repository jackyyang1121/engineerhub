# apps/notifications/serializers.py
# 通知序列化器檔案，將 Notification 模型資料轉換為 JSON 格式
# 功能：API 回傳通知資料給前端，或接收前端資料反序列化
# 資料來源：models.py 的 Notification
# 資料流向：views.py 呼叫序列化器，API 回傳/接收 JSON

from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    """
    通知序列化器，將 Notification 模型序列化為 JSON
    fields: id, sender, notification_type, post, comment, created_at, is_read
    """
    class Meta:
        # 指定序列化的模型為Notification
        model = Notification
        # 定義需要序列化的字段
        fields = ['id', 'sender', 'notification_type', 'post', 'comment', 'created_at', 'is_read']