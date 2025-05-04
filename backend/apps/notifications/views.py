# apps/notifications/views.py
from rest_framework import generics, permissions
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListAPIView):
    # 指定序列化器為NotificationSerializer
    serializer_class = NotificationSerializer
    # 限制僅認證用戶可訪問
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 返回當前用戶的通知，並按創建時間降序排列
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')