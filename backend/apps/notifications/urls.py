# apps/notifications/urls.py
# 通知應用路由檔案，定義通知 API 端點路徑
# 功能：將前端 API 請求導向對應的視圖處理
# 資料來源：前端發送的 HTTP 請求
# 資料流向：對應 views.py 的 NotificationListView

from django.urls import path
from .views import NotificationListView

urlpatterns = [
    # 定義通知列表的API端點，對應 NotificationListView
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
]