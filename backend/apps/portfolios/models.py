# apps/portfolios/models.py
from django.db import models
from django.conf import settings

class Portfolio(models.Model):
    # 定義作品集模型
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='portfolios')  # 關聯到用戶
    title = models.CharField(max_length=255)  # 作品標題
    description = models.TextField(blank=True)  # 作品描述
    image = models.ImageField(upload_to='portfolio_images/', blank=True, null=True)  # 作品圖片
    video = models.FileField(upload_to='portfolio_videos/', blank=True, null=True)  # 作品影片
    github_url = models.URLField(blank=True, null=True)  # GitHub連結
    demo_url = models.URLField(blank=True, null=True)  # 示範連結
    youtube_url = models.URLField(blank=True, null=True)  # YouTube連結
    created_at = models.DateTimeField(auto_now_add=True)  # 創建時間
    updated_at = models.DateTimeField(auto_now=True)  # 更新時間

    def __str__(self):
        return self.title