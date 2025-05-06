# 視圖檔案，定義 API 端點的邏輯
# 功能：處理用戶註冊、登入、個人檔案、設定、已儲存貼文等 API 請求
# 資料來源：前端傳入資料、models.py、serializers.py
# 資料流向：API 輸入/輸出 JSON，與前端互動

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserSerializer, RegisterSerializer
from .models import User
from apps.posts.models import Post
from apps.posts.serializers import PostSerializer
from rest_framework.views import APIView

class RegisterView(generics.CreateAPIView):
    """
    用戶註冊視圖
    - POST: 註冊新用戶，回傳 token
    - 欄位：username, email, phone_number, password, skills, bio
    - 回應：{"token": ...}
    """
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
    """
    用戶登入視圖
    - POST: 驗證用戶名與密碼，回傳 token
    - 欄位：username, password
    - 回應：{"token": ...} 或 {"error": ...}
    """
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
    """
    個人檔案視圖，支援讀取與更新
    - GET: 取得個人資料
    - PUT/PATCH: 更新個人資料
    - 權限：僅認證用戶
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

class FollowToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        target_user = User.objects.get(id=user_id)
        if target_user == request.user:
            return Response({'detail': '不能追蹤自己'}, status=status.HTTP_400_BAD_REQUEST)
        if target_user in request.user.following.all():
            request.user.following.remove(target_user)
            return Response({'detail': '已取消追蹤'})
        else:
            request.user.following.add(target_user)
            return Response({'detail': '已追蹤'})

class SettingsView(generics.UpdateAPIView):
    """
    用戶設定視圖，支援更新用戶設定
    - PUT/PATCH: 更新個人設定
    - 權限：僅認證用戶
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]  # 僅允許已認證用戶訪問

    def get_object(self):
        # 返回當前登入用戶的資料以供更新
        return self.request.user

class SavedPostsView(generics.ListAPIView):
    """
    已儲存貼文視圖，列出用戶儲存的貼文
    - GET: 取得已儲存貼文列表
    - 權限：僅認證用戶
    - 回應：貼文陣列
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]  # 僅允許已認證用戶訪問

    def get_queryset(self):
        # 返回當前用戶儲存的貼文列表
        user = self.request.user
        return Post.objects.filter(save__user=user)  # 過濾出用戶儲存的貼文