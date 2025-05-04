# 視圖檔案，定義 API 端點的邏輯

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserSerializer, RegisterSerializer
from .models import User
from apps.posts.models import Post
from apps.posts.serializers import PostSerializer

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

class SettingsView(generics.UpdateAPIView):
    # 用戶設定視圖，支援更新用戶設定
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]  # 僅允許已認證用戶訪問

    def get_object(self):
        # 返回當前登入用戶的資料以供更新
        return self.request.user

class SavedPostsView(generics.ListAPIView):
    # 已儲存貼文視圖，列出用戶儲存的貼文
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]  # 僅允許已認證用戶訪問

    def get_queryset(self):
        # 返回當前用戶儲存的貼文列表
        user = self.request.user
        return Post.objects.filter(save__user=user)  # 過濾出用戶儲存的貼文