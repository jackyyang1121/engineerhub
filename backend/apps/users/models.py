from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # 自定義用戶模型，支援手機號碼和電子信箱
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    skills = models.JSONField(default=list)  # 儲存技能標籤

    def __str__(self):
        return self.username