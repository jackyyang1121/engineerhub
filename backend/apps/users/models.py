# 用戶模型檔案，定義自定義用戶與個人檔案相關字段
# 功能：擴展 Django 內建 User，支援手機、技能、自介等欄位
# 資料來源：註冊/編輯時由前端傳入，API 讀取/更新
# 資料流向：被 views.py 查詢、序列化後回傳給前端，或由前端 POST/PUT 新增/修改

from django.contrib.auth.models import AbstractUser  # 導入 Django 內建 User 抽象類
from django.db import models

class User(AbstractUser):
    """
    自定義用戶模型，擴展 Django 內建用戶功能
    phone_number: 手機號碼（唯一，可空）
    email: 電子信箱（唯一，可空）
    skills: 技能標籤（JSON 陣列）
    bio: 個人簡介
    """
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