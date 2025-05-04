# 私訊視圖檔案，定義 API 端點的邏輯

from rest_framework import generics, permissions
from .models import Message
from .serializers import MessageSerializer

class MessageListCreateView(generics.ListCreateAPIView):
    # 私訊列表與創建視圖
    serializer_class = MessageSerializer  # 使用私訊序列化器
    permission_classes = [permissions.IsAuthenticated]  # 僅認證用戶可訪問

    def get_queryset(self):
        # 獲取與當前用戶相關的私訊（發送或接收）
        user = self.request.user
        return Message.objects.filter(sender=user) | Message.objects.filter(recipient=user)

    def perform_create(self, serializer):
        # 設置私訊發送者為當前用戶
        serializer.save(sender=self.request.user)