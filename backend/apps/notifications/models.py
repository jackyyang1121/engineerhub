# apps/notifications/models.py
# 通知模型檔案，定義用戶通知相關的資料模型
# 功能：儲存所有用戶之間的通知資料，供 API 查詢與建立
# 資料來源：User、Post、Comment 模型，前端互動觸發
# 資料流向：被 views.py 查詢、序列化後回傳給前端，或由前端/後端觸發新增

from django.db import models
from apps.users.models import User  # 導入用戶模型，作為通知發送者與接收者
from apps.posts.models import Post, Comment  # 導入貼文與評論模型，作為通知關聯對象

class Notification(models.Model):
    """
    通知模型，儲存一則用戶之間的通知
    recipient: 通知接收者（User 外鍵）
    sender: 通知發送者（User 外鍵）
    notification_type: 通知類型（追蹤、按讚、留言...）
    post: 相關貼文（可選）
    comment: 相關評論（可選）
    created_at: 創建時間
    is_read: 是否已讀
    """
    # 定義通知類型的選擇，包含追蹤請求、追蹤接受、按讚和留言
    NOTIFICATION_TYPES = (
        ('follow_request', '追蹤請求'),
        ('follow_accepted', '追蹤已接受'),
        ('like', '按讚'),
        ('comment', '留言'),
    )
    
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='notifications'
    )  # 通知接收者
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_notifications'
    )  # 通知發送者
    notification_type = models.CharField(
        max_length=20, choices=NOTIFICATION_TYPES
    )  # 通知類型
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, null=True, blank=True
    )  # 相關貼文（可選）
    comment = models.ForeignKey(
        Comment, on_delete=models.CASCADE, null=True, blank=True
    )  # 相關評論（可選）
    created_at = models.DateTimeField(auto_now_add=True)  # 通知創建時間
    is_read = models.BooleanField(default=False)  # 是否已讀

    def __str__(self):
        # 返回通知的字符串表示，方便在管理介面查看
        return f"{self.sender} 發送了一個 {self.notification_type} 給 {self.recipient}"