# 視圖檔案，定義 API 端點的邏輯

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserSerializer, RegisterSerializer

class RegisterView(generics.CreateAPIView):
    # 用戶註冊視圖
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]  # 允許未認證用戶訪問

    def post(self, request, *args, **kwargs):
        # 處理註冊請求
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # 驗證資料
        user = serializer.save()                   # 儲存用戶
        token, _ = Token.objects.get_or_create(user=user)  # 創建或獲取 Token
        return Response({"token": token.key})      # 回傳 Token

class LoginView(generics.GenericAPIView):
    # 用戶登入視圖
    permission_classes = [permissions.AllowAny]  # 允許未認證用戶訪問

    def post(self, request, *args, **kwargs):
        # 處理登入請求
        username = request.data.get("username")    # 獲取用戶名
        password = request.data.get("password")    # 獲取密碼
        user = authenticate(username=username, password=password)  # 驗證憑證
        if user:
            token, _ = Token.objects.get_or_create(user=user)  # 創建或獲取 Token
            return Response({"token": token.key})  # 回傳 Token
        return Response({"error": "無效的憑證"}, status=400)  # 回傳錯誤訊息

class ProfileView(generics.RetrieveUpdateAPIView):
    # 個人檔案視圖，支援讀取與更新
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]  # 僅認證用戶可訪問

    def get_object(self):
        # 回傳當前登入用戶的資料
        return self.request.user