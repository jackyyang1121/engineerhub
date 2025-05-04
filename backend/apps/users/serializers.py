# 序列化器檔案，用於將模型資料轉換為 JSON 格式
# 功能：將 User 模型資料序列化為 JSON，或將前端傳入資料反序列化為模型物件
# 資料來源：models.py 的 User，前端註冊/編輯表單
# 資料流向：views.py 呼叫序列化器，API 回傳/接收 JSON

from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    用戶序列化器，用於個人檔案的讀取與更新
    fields: id, username, email, phone_number, skills, bio
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'skills', 'bio']  # 可序列化的字段

class RegisterSerializer(serializers.ModelSerializer):
    """
    註冊序列化器，處理用戶註冊資料
    fields: username, email, phone_number, password, skills, bio
    """
    password = serializers.CharField(write_only=True)  # 密碼字段，只寫不讀，回應時不顯示

    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'password', 'skills', 'bio']  # 註冊所需字段

    def create(self, validated_data):
        # 創建新用戶的邏輯，將前端傳入資料建立 User 物件
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