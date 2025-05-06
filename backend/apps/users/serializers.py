# 序列化器檔案，用於將模型資料轉換為 JSON 格式
# 功能：將 User 模型資料序列化為 JSON，或將前端傳入資料反序列化為模型物件
# 資料來源：models.py 的 User，前端註冊/編輯表單
# 資料流向：views.py 呼叫序列化器，API 回傳/接收 JSON

from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    用戶序列化器，用於個人檔案的讀取與更新
    fields: id, username, email, bio, avatar
    """
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'bio', 'avatar', 'followers_count', 'following_count']
        read_only_fields = ['id', 'followers_count', 'following_count']

    def get_followers_count(self, obj):
        return obj.follower_relationships.count()

    def get_following_count(self, obj):
        return obj.following_relationships.count()

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