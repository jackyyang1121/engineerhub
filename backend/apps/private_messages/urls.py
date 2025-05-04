# 私訊應用路由檔案，定義 API 端點路徑

from django.urls import path
from .views import MessageListCreateView

urlpatterns = [
    path('messages/', MessageListCreateView.as_view(), name='message-list-create'),  # 私訊列表與創建
]