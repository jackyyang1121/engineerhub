# apps/notifications/views.py
# 通知視圖檔案，定義通知 API 端點邏輯
# 功能：查詢用戶通知列表，回傳給前端
# 資料來源：models.py 的 Notification
# 資料流向：API 回傳 JSON 給前端

from rest_framework import generics, permissions  # 引入通用 ListAPIView 與權限控制
from .models import Notification  # 通知模型
from .serializers import NotificationSerializer  # 通知序列化器

class NotificationListView(generics.ListAPIView):
    """
    通知列表視圖
    - GET: 取得當前用戶的所有通知，依創建時間降序排列
    - 權限：僅認證用戶
    - 回應：通知陣列
    """
    serializer_class = NotificationSerializer  # 指定序列化器為 NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]  # 限制僅認證用戶可訪問

    def get_queryset(self):
        # 返回當前用戶的通知，並按創建時間降序排列
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')