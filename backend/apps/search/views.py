# 搜尋視圖檔案，定義搜尋用戶和貼文的 API 端點邏輯

from rest_framework.views import APIView  # 引入 REST framework 的 APIView 類，用於處理 API 請求
from rest_framework.response import Response  # 引入 Response 類，用於返回 API 響應
from rest_framework import status  # 引入 HTTP 狀態碼，用於標示響應狀態
from django.db.models import Q  # 引入 Q 物件，用於構建複雜的資料庫查詢
from apps.users.models import User  # 引入用戶模型，用於查詢用戶資料
from apps.posts.models import Post  # 引入貼文模型，用於查詢貼文資料
from apps.users.serializers import UserSerializer  # 引入用戶序列化器，用於將用戶資料轉換為 JSON 格式
from apps.posts.serializers import PostSerializer  # 引入貼文序列化器，用於將貼文資料轉換為 JSON 格式

class SearchView(APIView):
    # 搜尋視圖類，負責處理用戶和貼文的搜尋請求
    def get(self, request):
        # 處理 GET 請求，執行搜尋邏輯
        query = request.query_params.get('q', '')  # 從請求中獲取查詢參數 'q'，若無則預設為空字串
        if not query:
            # 若查詢字串為空，返回錯誤訊息並設置 HTTP 400 狀態碼
            return Response({"error": "請提供搜尋關鍵字"}, status=status.HTTP_400_BAD_REQUEST)

        # 搜尋用戶：根據用戶名或技能標籤進行模糊匹配
        users = User.objects.filter(
            Q(username__icontains=query) |  # 用戶名包含查詢字串（不區分大小寫）
            Q(skills__icontains=query)  # 技能標籤包含查詢字串（不區分大小寫）
        )
        user_serializer = UserSerializer(users, many=True)  # 將查詢到的用戶資料序列化為 JSON 格式

        # 搜尋貼文：根據貼文內容進行模糊匹配
        posts = Post.objects.filter(
            Q(content__icontains=query)  # 貼文內容包含查詢字串（不區分大小寫）
        )
        post_serializer = PostSerializer(posts, many=True)  # 將查詢到的貼文資料序列化為 JSON 格式

        # 構建並返回響應資料，包含用戶和貼文搜尋結果
        return Response({
            "users": user_serializer.data,  # 用戶搜尋結果數據
            "posts": post_serializer.data  # 貼文搜尋結果數據
        }, status=status.HTTP_200_OK)  # 返回成功狀態碼 200