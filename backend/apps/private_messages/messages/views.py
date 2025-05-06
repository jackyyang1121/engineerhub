# apps/messages/views.py
# 私訊視圖檔案，定義私訊 API 端點邏輯
# 功能：處理聊天室列表、訊息列表、發送訊息等請求
# 資料來源：models.py 的 Chat 和 Message
# 資料流向：API 回傳 JSON 給前端，或接收前端資料

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer

class ChatListView(generics.ListCreateAPIView):
    """
    聊天室列表視圖
    - GET: 取得當前用戶的所有聊天室
    - POST: 創建新的聊天室
    """
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(participants=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        chat = serializer.save()
        chat.participants.add(self.request.user)

class MessageListView(generics.ListCreateAPIView):
    """
    訊息列表視圖
    - GET: 取得指定聊天室的所有訊息
    - POST: 在指定聊天室發送新訊息
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        chat_id = self.kwargs.get('chat_id')
        return Message.objects.filter(chat_id=chat_id).order_by('created_at')

    def perform_create(self, serializer):
        chat_id = self.kwargs.get('chat_id')
        chat = Chat.objects.get(id=chat_id)
        serializer.save(sender=self.request.user, chat=chat) 