# 用戶模型檔案，定義自定義用戶與個人檔案相關字段
# 功能：擴展 Django 內建 User，支援手機、技能、自介等欄位
# 資料來源：註冊/編輯時由前端傳入，API 讀取/更新
# 資料流向：被 views.py 查詢、序列化後回傳給前端，或由前端 POST/PUT 新增/修改

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

class UserManager(BaseUserManager):
    """
    自定義用戶管理器，繼承 BaseUserManager
    - create_user: 創建普通用戶
    - create_superuser: 創建超級用戶
    """
    
    def create_user(self, email, username, password=None, **extra_fields):
        """創建普通用戶"""
        if not email:
            raise ValueError(_('必須提供電子郵件'))
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        """創建超級用戶"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('超級用戶必須設置 is_staff=True'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('超級用戶必須設置 is_superuser=True'))
        
        return self.create_user(email, username, password, **extra_fields)

class User(AbstractUser):
    """
    自定義用戶模型，繼承 AbstractUser
    定義的新增欄位：
    - email: 電子郵件（唯一）
    - bio: 個人簡介
    - avatar: 頭像
    - background: 背景圖
    - is_private: 私密帳號標誌
    - last_online: 最後上線時間
    """
    email = models.EmailField(
        _('電子郵件'),
        unique=True,
        null=True,  # 允許為空，方便遷移
        blank=True,
        default=None  # 設定預設值為 None
    )
    bio = models.TextField(_('個人簡介'), blank=True, null=True)  # 個人簡介，可為空
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)  # 頭像，可為空
    background = models.ImageField(upload_to='backgrounds/', blank=True, null=True)  # 背景圖，可為空
    is_private = models.BooleanField(_('私密帳號'), default=False)  # 是否為私密帳號
    last_online = models.DateTimeField(_('最後上線時間'), default=timezone.now)  # 最後上線時間
    
    objects = UserManager()  # 使用自定義的用戶管理器
    
    USERNAME_FIELD = 'email'  # 設定用email作為登入帳號
    REQUIRED_FIELDS = ['username']  # 創建superuser時必填
    
    def __str__(self):
        return self.username
    
    class Meta:
        verbose_name = _('用戶')
        verbose_name_plural = _('用戶')

class Follow(models.Model):
    """
    追蹤關係模型
    - follower: 追蹤者（外鍵指向User）
    - following: 被追蹤者（外鍵指向User）
    - created_at: 建立時間
    - status: 追蹤狀態，用於私密帳號的追蹤請求
    """
    STATUS_CHOICES = (
        ('pending', '等待中'),
        ('accepted', '已接受'),
        ('rejected', '已拒絕'),
    )
    
    follower = models.ForeignKey(
        User, 
        related_name='following_relationships', 
        on_delete=models.CASCADE,
        verbose_name=_('追蹤者')
    )
    following = models.ForeignKey(
        User, 
        related_name='follower_relationships', 
        on_delete=models.CASCADE,
        verbose_name=_('被追蹤者')
    )
    created_at = models.DateTimeField(_('建立時間'), auto_now_add=True)
    status = models.CharField(
        _('狀態'), 
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='accepted'
    )
    
    class Meta:
        verbose_name = _('追蹤關係')
        verbose_name_plural = _('追蹤關係')
        # 確保一個用戶只能追蹤另一個用戶一次
        unique_together = ('follower', 'following')
        
    def __str__(self):
        return f"{self.follower.username} 追蹤 {self.following.username}"