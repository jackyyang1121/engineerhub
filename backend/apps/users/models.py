# 用戶模型檔案，定義自定義用戶與個人檔案相關字段

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # 自定義用戶模型，擴展 Django 內建用戶功能
    phone_number = models.CharField(
        max_length=15, 
        unique=True, 
        null=True, 
        blank=True, 
        verbose_name='手機號碼'  # 用戶手機號碼
    )
    email = models.EmailField(
        unique=True, 
        null=True, 
        blank=True, 
        verbose_name='電子信箱'  # 用戶電子信箱
    )
    skills = models.JSONField(
        default=list, 
        verbose_name='技能標籤'  # 用戶技能標籤，儲存為 JSON 陣列
    )
    bio = models.TextField(
        blank=True, 
        null=True, 
        verbose_name='自介'  # 用戶個人簡介
    )

    def __str__(self):
        # 回傳用戶名的字串表示
        return self.username

    class Meta:
        verbose_name = '用戶'  # 模型名稱
        verbose_name_plural = '用戶'  # 複數名稱