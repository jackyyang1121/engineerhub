# apps/notifications/models.py
from django.db import models
from apps.users.models import User
from apps.posts.models import Post, Comment

class Notification(models.Model):
    # 定義通知類型的選擇，包含追蹤請求、追蹤接受、按讚和留言
    NOTIFICATION_TYPES = (
        ('follow_request', '追蹤請求'),
        ('follow_accepted', '追蹤已接受'),
        ('like', '按讚'),
        ('comment', '留言'),
    )
    
    # 接收者：關聯到User模型，表示通知的接收對象
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    # 發送者：關聯到User模型，表示通知的發送對象
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    # 通知類型：從NOTIFICATION_TYPES中選擇
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    # 相關貼文：可選字段，與Post模型關聯
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)
    # 相關評論：可選字段，與Comment模型關聯
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    # 創建時間：自動記錄通知創建的時間
    created_at = models.DateTimeField(auto_now_add=True)
    # 是否已讀：默認為未讀
    is_read = models.BooleanField(default=False)

    def __str__(self):
        # 返回通知的字符串表示，方便在管理介面查看
        return f"{self.sender} 發送了一個 {self.notification_type} 給 {self.recipient}"