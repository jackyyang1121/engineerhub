# apps/messages/serializers.py
# 私訊序列化器檔案，將模型資料轉換為 JSON 格式
# 功能：API 回傳私訊資料給前端，或接收前端資料反序列化
# 資料來源：models.py 的 Chat 和 Message
# 資料流向：views.py 呼叫序列化器，API 回傳/接收 JSON

from rest_framework import serializers
from .models import Chat, Message
from apps.users.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    """
    訊息序列化器，將 Message 模型序列化為 JSON
    """
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'created_at', 'is_read']
        read_only_fields = ['sender', 'created_at']

class ChatSerializer(serializers.ModelSerializer):
    """
    聊天室序列化器，將 Chat 模型序列化為 JSON
    """
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'participants', 'created_at', 'updated_at', 'last_message']

    def get_last_message(self, obj):
        """
        獲取聊天室最後一則訊息
        """
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return MessageSerializer(last_message).data
        return None 