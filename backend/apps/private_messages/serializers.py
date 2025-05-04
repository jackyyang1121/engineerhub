# 私訊序列化器檔案，用於將模型資料轉換為 JSON 格式

from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    # 私訊序列化器
    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'content', 'created_at']  # 可序列化的字段