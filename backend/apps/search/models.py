# models.py - 定義 search app 的資料模型
# 用於存儲搜尋紀錄、熱門關鍵字等資料表

from django.db import models
from apps.users.models import User

class RecentSearch(models.Model):
    """用戶近期搜尋記錄模型"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recent_searches')
    query = models.CharField(max_length=100)  # 搜尋關鍵字
    created_at = models.DateTimeField(auto_now_add=True)  # 搜尋時間
    
    class Meta:
        ordering = ['-created_at']  # 依照時間倒序排列，最新的搜尋排最前
        unique_together = ['user', 'query']  # 用戶和關鍵字組合唯一，避免重複
        
    def __str__(self):
        return f"{self.user.username}: {self.query}"
