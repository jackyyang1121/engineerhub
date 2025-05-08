# portfolios/models.py - 作品集數據模型，定義作品集、媒體文件、評論等資料結構
# 功能：存儲用戶的專案作品集、媒體文件、評論和點讚
# 資料來源：用戶上傳與創建
# 資料流向：被views.py查詢，通過API回傳給前端
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
import os

def validate_file_extension(value):
    """驗證上傳的文件擴展名"""
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.webm']
    if not ext.lower() in valid_extensions:
        raise ValidationError(_('不支持的文件格式。支持的格式：jpg, jpeg, png, gif, webp, mp4, mov, avi, webm'))

class PortfolioCategory(models.Model):
    """作品集分類模型"""
    name = models.CharField(_('分類名稱'), max_length=100)
    icon = models.CharField(_('圖標代碼'), max_length=50, blank=True, null=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = _('作品集分類')
        verbose_name_plural = _('作品集分類')
        ordering = ['name']

class Portfolio(models.Model):
    """
    作品集模型 - 用戶可以展示的項目和作品
    """
    # 基本信息
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='portfolios',
        verbose_name=_('用戶')
    )
    title = models.CharField(_('標題'), max_length=255)
    description = models.TextField(_('描述'), blank=True)
    summary = models.CharField(_('簡短摘要'), max_length=200, blank=True, null=True)
    is_featured = models.BooleanField(_('特色作品'), default=False, help_text=_('設為特色作品將會在個人資料頁優先顯示'))
    
    # 分類與技能標籤
    category = models.ForeignKey(
        PortfolioCategory, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True,
        related_name='portfolios',
        verbose_name=_('分類')
    )
    skills_used = models.ManyToManyField(
        'users.Skill', 
        blank=True, 
        related_name='used_in_portfolios',
        verbose_name=_('使用的技能')
    )
    
    # 多媒體與連結
    cover_image = models.ImageField(
        _('封面圖片'),
        upload_to='portfolio_covers/', 
        blank=True, 
        null=True,
        help_text=_('建議尺寸：1200x630，將在個人檔案頁面顯示')
    )
    github_url = models.URLField(_('GitHub連結'), blank=True, null=True)
    demo_url = models.URLField(_('示範連結'), blank=True, null=True)
    youtube_url = models.URLField(_('YouTube連結'), blank=True, null=True)
    app_store_url = models.URLField(_('App Store連結'), blank=True, null=True)
    google_play_url = models.URLField(_('Google Play連結'), blank=True, null=True)
    
    # 時間信息
    project_start_date = models.DateField(_('項目開始日期'), blank=True, null=True)
    project_end_date = models.DateField(_('項目結束日期'), blank=True, null=True)
    created_at = models.DateTimeField(_('創建時間'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新時間'), auto_now=True)
    
    # 統計數據
    view_count = models.PositiveIntegerField(_('瀏覽次數'), default=0)
    like_count = models.PositiveIntegerField(_('點讚次數'), default=0)
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = _('作品集')
        verbose_name_plural = _('作品集')
        ordering = ['-is_featured', '-created_at']
    
    def increase_view_count(self):
        """增加瀏覽次數"""
        self.view_count += 1
        self.save(update_fields=['view_count'])

class PortfolioMedia(models.Model):
    """作品集媒體文件模型 - 用於儲存作品集的多媒體文件"""
    MEDIA_TYPE_CHOICES = (
        ('image', _('圖片')),
        ('video', _('影片')),
    )
    
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='media',
        verbose_name=_('作品集')
    )
    file = models.FileField(
        _('媒體文件'),
        upload_to='portfolio_media/',
        validators=[validate_file_extension]
    )
    media_type = models.CharField(_('媒體類型'), max_length=10, choices=MEDIA_TYPE_CHOICES)
    title = models.CharField(_('標題'), max_length=100, blank=True, null=True)
    description = models.TextField(_('描述'), blank=True, null=True)
    order = models.PositiveIntegerField(_('排序'), default=0)
    created_at = models.DateTimeField(_('創建時間'), auto_now_add=True)
    
    def __str__(self):
        return f"{self.portfolio.title} - {self.get_media_type_display()} {self.order}"
    
    class Meta:
        verbose_name = _('作品集媒體')
        verbose_name_plural = _('作品集媒體')
        ordering = ['portfolio', 'order', 'created_at']

class PortfolioComment(models.Model):
    """作品集評論模型"""
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='comments',
        verbose_name=_('作品集')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        verbose_name=_('用戶')
    )
    content = models.TextField(_('評論內容'))
    created_at = models.DateTimeField(_('創建時間'), auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} on {self.portfolio.title}"
    
    class Meta:
        verbose_name = _('作品集評論')
        verbose_name_plural = _('作品集評論')
        ordering = ['-created_at']

class PortfolioLike(models.Model):
    """作品集點讚模型"""
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='likes',
        verbose_name=_('作品集')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        verbose_name=_('用戶')
    )
    created_at = models.DateTimeField(_('創建時間'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('作品集點讚')
        verbose_name_plural = _('作品集點讚')
        unique_together = ('portfolio', 'user')  # 確保一個用戶只能給一個作品集點讚一次