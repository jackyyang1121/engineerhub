# 貼文模型檔案，定義貼文、互動相關的資料模型
# 功能：儲存所有用戶發佈的貼文資料，供 API 查詢與建立
# 資料來源：User 模型（作者）、content 由前端傳入
# 資料流向：被 views.py 查詢、序列化後回傳給前端，或由前端 POST 新增

from django.db import models
from apps.users.models import User  # 導入用戶模型，作為貼文作者

class Post(models.Model):
    # 貼文模型，儲存一則用戶發佈的貼文
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='作者')  # 貼文作者，來源：User
    content = models.TextField(verbose_name='內容')  # 貼文內容，來源：前端傳入
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='創建時間')  # 貼文創建時間，自動產生
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')  # 貼文更新時間，自動產生

    def __str__(self):
        # 回傳貼文內容的前20個字，方便管理介面顯示
        return self.content[:20]

    class Meta:
        verbose_name = '貼文'  # 模型名稱
        verbose_name_plural = '貼文'  # 複數名稱

class Like(models.Model):
    # 點讚模型
    post = models.ForeignKey(Post, on_delete=models.CASCADE, verbose_name='貼文')  # 關聯的貼文
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='用戶')  # 點讚的用戶
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='創建時間')  # 創建時間

    class Meta:
        unique_together = ('post', 'user')  # 確保每個用戶對每篇貼文只能點讚一次
        verbose_name = '點讚'  # 模型名稱
        verbose_name_plural = '點讚'  # 複數名稱

class Comment(models.Model):
    # 留言模型
    post = models.ForeignKey(Post, on_delete=models.CASCADE, verbose_name='貼文')  # 關聯的貼文
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='用戶')  # 留言的用戶
    content = models.TextField(verbose_name='內容')  # 留言內容
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='創建時間')  # 創建時間

    def __str__(self):
        # 回傳留言內容的前20個字
        return self.content[:20]

    class Meta:
        verbose_name = '留言'  # 模型名稱
        verbose_name_plural = '留言'  # 複數名稱

class Repost(models.Model):
    # 轉發模型
    original_post = models.ForeignKey(Post, related_name='reposts', on_delete=models.CASCADE, verbose_name='原貼文')  # 原貼文
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='用戶')  # 轉發的用戶
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='創建時間')  # 創建時間

    class Meta:
        verbose_name = '轉發'  # 模型名稱
        verbose_name_plural = '轉發'  # 複數名稱

class Save(models.Model):
    # 儲存貼文模型
    post = models.ForeignKey(Post, on_delete=models.CASCADE, verbose_name='貼文')  # 關聯的貼文
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='用戶')  # 儲存的用戶
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='創建時間')  # 創建時間

    class Meta:
        unique_together = ('post', 'user')  # 確保每個用戶對每篇貼文只能儲存一次
        verbose_name = '儲存貼文'  # 模型名稱
        verbose_name_plural = '儲存貼文'  # 複數名稱