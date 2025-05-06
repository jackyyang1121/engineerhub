# apps/messages/urls.py
# 私訊應用路由檔案，定義私訊 API 端點路徑
# 功能：將前端 API 請求導向對應的視圖處理
# 資料來源：前端發送的 HTTP 請求
# 資料流向：對應 views.py 的視圖處理

from django.urls import path
from .views import ChatListView, MessageListView

urlpatterns = [
    # 聊天室相關路由
    path('chats/', ChatListView.as_view(), name='chat-list'),
    path('chats/<int:chat_id>/messages/', MessageListView.as_view(), name='message-list'),
] 