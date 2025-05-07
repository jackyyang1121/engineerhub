# apps/private_messages/urls.py
# 私訊應用路由檔案，定義私訊 API 端點路徑
# 功能：將前端 API 請求導向對應的視圖處理
# 資料來源：前端發送的 HTTP 請求
# 資料流向：對應 views.py 的視圖處理

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PrivateMessageViewSet, PrivateMessageThreadListView, PrivateMessageListView

# 創建路由器並註冊視圖集
router = DefaultRouter()
router.register(r'messages', PrivateMessageViewSet)

# 定義 URL 模式
urlpatterns = [
    # 包含路由器 URL
    path('', include(router.urls)),
    
    # 聊天線程相關路由
    path('threads/', PrivateMessageThreadListView.as_view(), name='thread-list'),
    path('threads/<int:thread_id>/messages/', PrivateMessageListView.as_view(), name='thread-messages'),
]