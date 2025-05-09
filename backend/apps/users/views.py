# users/views.py - 用戶相關API視圖，定義用戶註冊、登入、個人檔案等REST API端點
# 功能：處理用戶註冊、登入、個人檔案、設定、已儲存貼文等 API 請求
# 資料來源：前端傳入資料、models.py、serializers.py
# 資料流向：API 輸入/輸出 JSON，與前端互動

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .models import User
from apps.posts.models import Post
from apps.posts.serializers import PostSerializer
from rest_framework.views import APIView
from .models import Skill

class RegisterView(generics.CreateAPIView):
    """
    用戶註冊視圖
    - POST: 註冊新用戶，回傳 token
    - 欄位：username, email, password
    - 回應：{"token": ...}
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]  # 允許未認證用戶訪問

    def post(self, request, *args, **kwargs):
        # 處理註冊請求
        serializer = self.get_serializer(data=request.data)    #self.get_serializer(data=request.data) 是 Django REST framework 提供的一個方法，用於獲取序列化器實例。
        serializer.is_valid(raise_exception=True)  # 驗證資料
        user = serializer.save()                   # 儲存用戶
        token, _ = Token.objects.get_or_create(user=user)  # 創建或獲取 Token
        return Response({"token": token.key})      # 回傳 Token

class LoginView(generics.GenericAPIView):
    """
    用戶登入視圖
    - POST: 驗證用戶名/電子郵件與密碼，回傳 token
    - 欄位：identifier(用戶名或電子郵件), password
    - 回應：{"token": ...} 或 {"error": ...}
    """
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]  # 允許未認證用戶訪問

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        identifier = serializer.validated_data['identifier']
        password = serializer.validated_data['password']
        
        # 判斷是用戶名還是電子郵件
        if '@' in identifier:
            # 使用電子郵件登入
            try:
                user = User.objects.get(email=identifier)
            except User.DoesNotExist:
                return Response({"error": "無效的電子郵件或密碼"}, status=400)
        else:
            # 使用用戶名登入
            try:
                user = User.objects.get(username=identifier)
            except User.DoesNotExist:
                return Response({"error": "無效的用戶名或密碼"}, status=400)
        
        # 驗證密碼
        if user.check_password(password):
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key})
        
        return Response({"error": "無效的登入資訊"}, status=400)

class ProfileView(APIView):
    """
    個人檔案視圖，支援讀取與更新
    - GET: 取得個人資料
    - PUT/PATCH: 更新個人資料
    - 權限：僅認證用戶
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        print("Received data:", request.data)
        
        # 自行處理每個欄位，避開序列化器驗證問題
        if 'username' in request.data and request.data['username']:
            user.username = request.data['username']
            
        if 'email' in request.data:
            if request.data['email'] and request.data['email'].strip():
                user.email = request.data['email']
            else:
                user.email = None
                
        if 'phone_number' in request.data:
            if request.data['phone_number'] and request.data['phone_number'].strip():
                user.phone_number = request.data['phone_number']
            else:
                user.phone_number = None
                
        if 'bio' in request.data:
            user.bio = request.data['bio']
            
        if 'skills' in request.data:
            # 確保 skills 是列表
            if isinstance(request.data['skills'], list):
                # 過濾空字串
                skill_names = [skill.strip() for skill in request.data['skills'] if isinstance(skill, str) and skill.strip()]
                # 獲取或創建對應的技能對象
                skill_objects = []
                for skill_name in skill_names:
                    skill_obj, created = Skill.objects.get_or_create(name=skill_name)
                    skill_objects.append(skill_obj)
                # 使用set方法設置多對多關係
                user.skills.set(skill_objects)
            else:
                return Response({"skills": "技能必須為陣列"}, status=status.HTTP_400_BAD_REQUEST)
        
        # 對於 avatar，忽略空字串和其他非檔案值
        if 'avatar' in request.data and hasattr(request.data['avatar'], 'name'):
            user.avatar = request.data['avatar']
        
        # 儲存用戶資料
        try:
            user.save()
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except Exception as e:
            print("Save error:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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