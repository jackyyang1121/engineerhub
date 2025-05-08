# portfolios/serializers.py - 作品集數據序列化器，負責API數據轉換和驗證
# 功能：將Portfolio模型轉換為JSON響應，以及將前端請求轉換為模型數據
# 資料來源：models.py中的Portfolio及相關模型
# 資料流向：連接views.py與models.py，轉換和驗證API數據
from rest_framework import serializers
from .models import Portfolio, PortfolioCategory, PortfolioMedia, PortfolioComment, PortfolioLike
from apps.users.serializers import UserMinimalSerializer, SkillSerializer

class PortfolioCategorySerializer(serializers.ModelSerializer):
    """作品集分類序列化器"""
    class Meta:
        model = PortfolioCategory
        fields = ['id', 'name', 'icon']

class PortfolioMediaSerializer(serializers.ModelSerializer):
    """作品集媒體文件序列化器"""
    class Meta:
        model = PortfolioMedia
        fields = ['id', 'file', 'media_type', 'title', 'description', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']

class PortfolioCommentSerializer(serializers.ModelSerializer):
    """作品集評論序列化器"""
    user = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = PortfolioComment
        fields = ['id', 'user', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class PortfolioMinimalSerializer(serializers.ModelSerializer):
    """
    簡化的作品集序列化器
    適用於列表顯示，不包含詳細內容
    """
    user = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 'title', 'summary', 'user', 'cover_image',
            'view_count', 'like_count', 'created_at', 'is_featured'
        ]
        read_only_fields = ['id', 'user', 'view_count', 'like_count', 'created_at']

class PortfolioSerializer(serializers.ModelSerializer):
    """
    完整的作品集序列化器
    包含所有作品集詳情，用於詳情頁
    """
    user = UserMinimalSerializer(read_only=True)
    category = PortfolioCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=PortfolioCategory.objects.all(),
        write_only=True,
        required=False,
        source='category'
    )
    skills_used = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=serializers.PrimaryKeyRelatedField(
            queryset=serializers.ReadOnlyField(source='id')
        ),
        many=True,
        write_only=True,
        required=False,
        source='skills_used'
    )
    media = PortfolioMediaSerializer(many=True, read_only=True)
    comments = PortfolioCommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 'user', 'title', 'description', 'summary', 'is_featured',
            'category', 'category_id', 'skills_used', 'skill_ids',
            'cover_image', 'github_url', 'demo_url', 'youtube_url', 
            'app_store_url', 'google_play_url', 'project_start_date', 
            'project_end_date', 'created_at', 'updated_at', 'view_count', 
            'like_count', 'media', 'comments', 'comments_count', 'is_liked'
        ]
        read_only_fields = [
            'id', 'user', 'created_at', 'updated_at', 
            'view_count', 'like_count', 'is_liked', 'comments_count'
        ]
    
    def get_comments_count(self, obj):
        """獲取評論數量"""
        return obj.comments.count()
    
    def get_is_liked(self, obj):
        """當前用戶是否已點讚此作品集"""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return PortfolioLike.objects.filter(
                portfolio=obj,
                user=request.user
            ).exists()
        return False
    
    def create(self, validated_data):
        """創建作品集"""
        # 從當前請求獲取用戶
        request = self.context.get('request')
        validated_data['user'] = request.user
        
        # 首先處理技能標籤
        skills = validated_data.pop('skills_used', [])
        
        # 創建作品集
        portfolio = Portfolio.objects.create(**validated_data)
        
        # 添加技能標籤
        if skills:
            portfolio.skills_used.set(skills)
        
        return portfolio
    
    def update(self, instance, validated_data):
        """更新作品集"""
        # 處理技能標籤
        skills = validated_data.pop('skills_used', None)
        
        # 更新其他字段
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # 如果有提供技能標籤，更新技能標籤
        if skills is not None:
            instance.skills_used.set(skills)
        
        instance.save()
        return instance