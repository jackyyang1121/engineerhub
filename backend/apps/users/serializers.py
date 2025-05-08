# users/serializers.py - 用戶數據序列化器，定義API數據轉換和驗證邏輯
# 功能：將 User 模型資料序列化為 JSON，或將前端傳入資料反序列化為模型物件
# 資料來源：models.py 的 User，前端註冊/編輯表單
# 資料流向：views.py 呼叫序列化器，API 回傳/接收 JSON

from rest_framework import serializers
from .models import User, Skill, Follow

class SkillSerializer(serializers.ModelSerializer):
    """技能標籤序列化器"""
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'icon']

class UserMinimalSerializer(serializers.ModelSerializer):
    """
    簡化的用戶序列化器，提供基本用戶信息
    主要用於列表顯示、關聯查詢等場景
    """
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'avatar']
    
    def get_display_name(self, obj):
        return obj.get_display_name()

class UserSerializer(serializers.ModelSerializer):
    """
    用戶序列化器，用於個人檔案的讀取與更新
    包含完整的用戶個人檔案信息
    """
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='skills'
    )
    display_name = serializers.CharField(required=False)
    is_following = serializers.SerializerMethodField()
    featured_portfolios = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'display_name', 'bio', 'avatar', 'background',
            'headline', 'website', 'location', 'skills', 'skill_ids',
            'followers_count', 'following_count', 'theme_color',
            'show_follower_count', 'is_private', 'is_following',
            'featured_portfolios'
        ]
        read_only_fields = [
            'id', 'followers_count', 'following_count', 
            'is_following', 'featured_portfolios'
        ]

    def get_followers_count(self, obj):
        """獲取接受的追蹤者數量"""
        return obj.follower_relationships.filter(status='accepted').count()

    def get_following_count(self, obj):
        """獲取正在追蹤的數量"""
        return obj.following_relationships.filter(status='accepted').count()
    
    def get_is_following(self, obj):
        """當前用戶是否正在追蹤此用戶"""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return Follow.objects.filter(
                follower=request.user, 
                following=obj,
                status='accepted'
            ).exists()
        return False
    
    def get_featured_portfolios(self, obj):
        """獲取特色作品集"""
        # 從 Portfolio 模型中獲取特色作品集
        # 限制最多 4 個特色作品集
        from apps.portfolios.serializers import PortfolioMinimalSerializer
        featured_portfolios = obj.portfolios.filter(is_featured=True)[:4]
        return PortfolioMinimalSerializer(featured_portfolios, many=True, context=self.context).data

    def validate(self, data):
        # 確保 username 不為空
        if 'username' in data and (data['username'] is None or not data['username'].strip()):
            raise serializers.ValidationError({"username": "用戶名不能為空"})
        
        # email 可以為空，但不能是空字串
        if 'email' in data and data['email'] is not None and not data['email'].strip():
            data['email'] = None
            
        return data

    def validate_avatar(self, value):
        # 如果前端傳來空字串，將其設為 None
        if value == '':
            return None
        return value
    
    def validate_background(self, value):
        # 如果前端傳來空字串，將其設為 None
        if value == '':
            return None
        return value

class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    個人檔案更新序列化器
    提供更多字段驗證和自定義更新邏輯
    """
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='skills'
    )
    
    class Meta:
        model = User
        fields = [
            'bio', 'avatar', 'background', 'headline', 
            'website', 'location', 'skill_ids', 'display_name',
            'theme_color', 'show_follower_count', 'is_private'
        ]
    
    def update(self, instance, validated_data):
        # 將所有字段更新到實例
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class FollowSerializer(serializers.ModelSerializer):
    """追蹤關係序列化器"""
    follower = UserMinimalSerializer(read_only=True)
    following = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    """
    註冊序列化器，處理用戶註冊資料
    fields: username, email, password
    """
    password = serializers.CharField(write_only=True)  # 密碼字段，只寫不讀，回應時不顯示

    class Meta:
        model = User
        fields = ['username', 'email', 'password']  # 註冊所需字段

    def create(self, validated_data):
        # 創建新用戶的邏輯，將前端傳入資料建立 User 物件
        user = User.objects.create_user(
            username=validated_data['username'],  # 設置用戶名
            email=validated_data['email'],        # 設置電子郵件
            password=validated_data['password']   # 設置密碼
        )
        return user

class LoginSerializer(serializers.Serializer):
    """
    登入序列化器，處理用戶登入資料
    fields: identifier(用戶名或電子郵件), password
    """
    identifier = serializers.CharField(help_text="用戶名或電子郵件")
    password = serializers.CharField()