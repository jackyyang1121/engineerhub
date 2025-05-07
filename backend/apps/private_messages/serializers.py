# apps/private_messages/serializers.py
# 私訊序列化器檔案，將模型資料轉換為 JSON 格式
# 功能：API 回傳私訊資料給前端，或接收前端資料反序列化
# 資料來源：models.py 的 Chat 和 Message
# 資料流向：views.py 呼叫序列化器，API 回傳/接收 JSON

from rest_framework import serializers
from .models import PrivateMessage, PrivateMessageThread
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class PrivateMessageThreadSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = PrivateMessageThread
        fields = ['id', 'participants', 'created_at', 'updated_at', 'last_message', 'unread_count']

    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return PrivateMessageSerializer(last_message).data
        return None

    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()

class PrivateMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = PrivateMessage
        fields = ['id', 'thread', 'sender', 'content', 'created_at', 'is_read']
        read_only_fields = ['sender', 'is_read']