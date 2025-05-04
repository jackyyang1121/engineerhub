# apps/portfolios/models.py
from django.db import models
from apps.users.models import User

class Portfolio(models.Model):
    # 定義作品集模型
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolios')  # 關聯到用戶
    title = models.CharField(max_length=100)  # 作品標題
    description = models.TextField()  # 作品描述
    image = models.ImageField(upload_to='portfolio_images/', null=True, blank=True)  # 作品圖片
    video = models.FileField(upload_to='portfolio_videos/', null=True, blank=True)  # 作品影片
    link = models.URLField(null=True, blank=True)  # 作品連結
    created_at = models.DateTimeField(auto_now_add=True)  # 創建時間

    def __str__(self):
        return self.title