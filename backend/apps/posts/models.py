# 貼文模型檔案，定義貼文、互動相關的資料模型

from django.db import models
from apps.users.models import User  # 導入用戶模型

class Post(models.Model):
    # 貼文模型
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='作者')  # 貼文作者
    content = models.TextField(verbose_name='內容')  # 貼文文字內容
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='創建時間')  # 創建時間
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')  # 更新時間

    def __str__(self):
        # 回傳貼文內容的前20個字
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