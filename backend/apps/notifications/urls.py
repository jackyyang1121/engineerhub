# apps/notifications/urls.py
from django.urls import path
from .views import NotificationListView

urlpatterns = [
    # 定義通知列表的API端點
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
]