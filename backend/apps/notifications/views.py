# apps/notifications/views.py
# 通知視圖檔案，定義通知 API 端點邏輯
# 功能：查詢用戶通知列表，標記通知為已讀，接受/拒絕請求，回傳給前端
# 資料來源：models.py 的 Notification
# 資料流向：API 回傳 JSON 給前端

from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import NotificationSerializer
from apps.users.models import User, Follow

class NotificationListView(generics.ListAPIView):
    """
    通知列表視圖
    - GET: 取得當前用戶的所有通知，依創建時間降序排列
    - 權限：僅認證用戶
    - 回應：通知陣列
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # 可以添加分頁類，目前設為 None

    def get_queryset(self):
        # 獲取當前用戶
        user = self.request.user
        
        # 獲取過濾參數
        notification_type = self.request.query_params.get('type')
        is_read = self.request.query_params.get('is_read')
        
        # 從資料庫獲取通知
        queryset = Notification.objects.filter(recipient=user)
        
        # 根據類型過濾
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
            
        # 根據已讀狀態過濾
        if is_read:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)
            
        # 依創建時間降序排列
        return queryset.order_by('-created_at')

class NotificationMarkReadView(views.APIView):
    """
    標記通知為已讀視圖
    - POST: 將特定通知標記為已讀
    - PATCH: 批量將通知標記為已讀
    - 權限：僅認證用戶
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, notification_id):
        """將單個通知標記為已讀"""
        user = request.user
        notification = get_object_or_404(Notification, id=notification_id, recipient=user)
        
        notification.is_read = True
        notification.save()
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)
    
    def patch(self, request):
        """批量將通知標記為已讀"""
        user = request.user
        
        # 從請求中獲取要標記的通知IDs，如果沒有，則標記所有
        notification_ids = request.data.get('notification_ids', [])
        
        if notification_ids:
            # 標記特定通知
            notifications = Notification.objects.filter(
                id__in=notification_ids, 
                recipient=user, 
                is_read=False
            )
        else:
            # 標記所有未讀通知
            notifications = Notification.objects.filter(
                recipient=user, 
                is_read=False
            )
        
        updated_count = notifications.update(is_read=True)
        
        return Response({
            'status': 'success', 
            'updated_count': updated_count
        })

class NotificationUnreadCountView(views.APIView):
    """
    獲取未讀通知數量視圖
    - GET: 獲取當前用戶的未讀通知數量
    - 權限：僅認證用戶
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """獲取當前用戶未讀通知數量"""
        user = request.user
        unread_count = Notification.objects.filter(
            recipient=user, 
            is_read=False
        ).count()
        
        return Response({
            'unread_count': unread_count
        })

class FollowRequestActionView(views.APIView):
    """
    處理追蹤請求動作視圖
    - POST: 接受或拒絕追蹤請求
    - 權限：僅認證用戶
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, notification_id):
        """接受或拒絕追蹤請求"""
        user = request.user
        action = request.data.get('action')  # 'accept' 或 'reject'
        
        if action not in ['accept', 'reject']:
            return Response(
                {'error': '無效的操作，必須是 accept 或 reject'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 獲取通知
        notification = get_object_or_404(
            Notification, 
            id=notification_id, 
            recipient=user, 
            notification_type='follow_request_received'
        )
        
        # 獲取發送追蹤請求的用戶
        sender = notification.sender
        
        if action == 'accept':
            # 接受追蹤請求：創建或更新追蹤關係
            follow, created = Follow.objects.get_or_create(
                follower=sender, 
                following=user
            )
            
            # 更新通知狀態
            notification.status = 'accepted'
            notification.save()
            
            # 創建追蹤接受通知給發送者
            Notification.objects.create(
                recipient=sender,
                sender=user,
                notification_type='follow_accepted'
            )
            
            return Response({'status': 'success', 'message': '已接受追蹤請求'})
        else:
            # 拒絕追蹤請求：更新通知狀態
            notification.status = 'rejected'
            notification.save()
            
            return Response({'status': 'success', 'message': '已拒絕追蹤請求'})