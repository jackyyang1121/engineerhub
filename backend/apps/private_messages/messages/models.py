# apps/messages/models.py
# 私訊模型檔案，定義用戶之間的私訊資料結構
# 功能：儲存用戶之間的私訊內容
# 資料來源：User 模型，前端互動觸發
# 資料流向：被 views.py 查詢、序列化後回傳給前端，或由前端/後端觸發新增

from django.db import models
from apps.users.models import User

class Chat(models.Model):
    """
    聊天室模型，用於管理兩個用戶之間的聊天
    participants: 聊天參與者（多對多關係）
    created_at: 創建時間
    updated_at: 最後更新時間
    """
    participants = models.ManyToManyField(User, related_name='chats')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Chat {self.id}"

class Message(models.Model):
    """
    訊息模型，儲存聊天室中的單則訊息
    chat: 所屬聊天室
    sender: 發送者
    content: 訊息內容
    created_at: 發送時間
    is_read: 是否已讀
    """
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender} in {self.chat}" 