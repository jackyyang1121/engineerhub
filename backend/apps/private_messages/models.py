# 私訊模型檔案，定義私訊相關的資料模型
# 功能：儲存所有用戶之間的私訊資料，供 API 查詢與建立
# 資料來源：User 模型（發送者、接收者）、content 由前端傳入
# 資料流向：被 views.py 查詢、序列化後回傳給前端，或由前端 POST 新增

from django.db import models
from apps.users.models import User  # 導入用戶模型，作為發送者與接收者

class Message(models.Model):
    """
    私訊模型，儲存一則用戶之間的訊息
    sender: 發送者（User 外鍵）
    recipient: 接收者（User 外鍵）
    content: 訊息內容
    created_at: 創建時間
    """
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_messages', verbose_name='發送者'
    )  # 訊息發送者，來源：User
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='received_messages', verbose_name='接收者'
    )  # 訊息接收者，來源：User
    content = models.TextField(verbose_name='內容')  # 訊息內容，來源：前端傳入
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='創建時間')  # 訊息創建時間，自動產生

    def __str__(self):
        # 回傳訊息內容的前20個字，方便管理介面顯示
        return self.content[:20]

    class Meta:
        verbose_name = '私訊'  # 模型名稱
        verbose_name_plural = '私訊'  # 複數名稱