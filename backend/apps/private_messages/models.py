# 私訊模型檔案，定義私訊相關的資料模型

from django.db import models
from apps.users.models import User  # 導入用戶模型

class Message(models.Model):
    # 私訊模型
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', verbose_name='發送者')  # 訊息發送者
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages', verbose_name='接收者')  # 訊息接收者
    content = models.TextField(verbose_name='內容')  # 訊息文字內容
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='創建時間')  # 創建時間

    def __str__(self):
        # 回傳訊息內容的前20個字
        return self.content[:20]

    class Meta:
        verbose_name = '私訊'  # 模型名稱
        verbose_name_plural = '私訊'  # 複數名稱