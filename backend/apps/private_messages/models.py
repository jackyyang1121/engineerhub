# apps/private_messages/models.py
# 私訊模型檔案，定義用戶之間的私訊資料結構
# 功能：儲存用戶之間的私訊內容
# 資料來源：User 模型，前端互動觸發
# 資料流向：被 views.py 查詢、序列化後回傳給前端，或由前端/後端觸發新增

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class PrivateMessageThread(models.Model):
    """
    A thread between users for private messaging
    """
    participants = models.ManyToManyField(User, related_name='message_threads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        participant_names = ', '.join([user.username for user in self.participants.all()])
        return f"Thread between {participant_names}"
    
    @property
    def last_message(self):
        """Get the last message in this thread"""
        return self.messages.order_by('-created_at').first()
    
    @property
    def unread_count(self):
        """Get the number of unread messages in this thread for the request user"""
        # This is a placeholder, actual implementation would depend on request context
        return self.messages.filter(is_read=False).count()

class PrivateMessage(models.Model):
    """
    A private message within a thread
    """
    thread = models.ForeignKey(PrivateMessageThread, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.username} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        verbose_name = '私訊'  # 模型名稱
        verbose_name_plural = '私訊'  # 複數名稱