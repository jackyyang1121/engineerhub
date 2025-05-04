# 序列化器檔案，用於將模型資料轉換為 JSON 格式

from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    # 用戶序列化器，用於個人檔案的讀取與更新
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'skills', 'bio']  # 可序列化的字段

class RegisterSerializer(serializers.ModelSerializer):
    # 註冊序列化器，處理用戶註冊資料
    password = serializers.CharField(write_only=True)  # 密碼字段，只寫不讀

    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'password', 'skills', 'bio']  # 註冊所需字段

    def create(self, validated_data):
        # 創建新用戶的邏輯
        user = User.objects.create_user(
            username=validated_data['username'],           # 設置用戶名
            email=validated_data.get('email'),             # 設置電子信箱（可選）
            phone_number=validated_data.get('phone_number'), # 設置手機號碼（可選）
            password=validated_data['password']            # 設置密碼
        )
        user.skills = validated_data.get('skills', [])     # 設置技能標籤，預設為空陣列
        user.bio = validated_data.get('bio', '')           # 設置自介，預設為空字串
        user.save()                                        # 儲存用戶資料
        return user