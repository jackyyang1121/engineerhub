# 搜尋視圖檔案，定義搜尋用戶和貼文的 API 端點邏輯

from rest_framework.views import APIView  # 引入 REST framework 的 APIView 類，用於處理 API 請求
from rest_framework.response import Response  # 引入 Response 類，用於返回 API 響應
from rest_framework import status  # 引入 HTTP 狀態碼，用於標示響應狀態
from django.db.models import Q  # 引入 Q 物件，用於構建複雜的資料庫查詢
from apps.users.models import User  # 引入用戶模型，用於查詢用戶資料
from apps.posts.models import Post  # 引入貼文模型，用於查詢貼文資料
from apps.users.serializers import UserSerializer  # 引入用戶序列化器，用於將用戶資料轉換為 JSON 格式
from apps.posts.serializers import PostSerializer  # 引入貼文序列化器，用於將貼文資料轉換為 JSON 格式
from rest_framework.permissions import IsAuthenticated
from .models import RecentSearch
from .serializers import RecentSearchSerializer
from django.utils import timezone

class SearchView(APIView):
    """
    搜尋視圖類，負責處理用戶和貼文的搜尋請求
    - GET: 根據查詢參數 'q' 搜尋用戶（用戶名/技能）與貼文（內容）
    - 回傳格式：{"users": [...], "posts": [...]}
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # 處理 GET 請求，執行搜尋邏輯
        query = request.query_params.get('q', '')  # 從請求中獲取查詢參數 'q'，若無則預設為空字串
        if not query:
            # 若查詢字串為空，返回錯誤訊息並設置 HTTP 400 狀態碼
            return Response({"error": "請提供搜尋關鍵字"}, status=status.HTTP_400_BAD_REQUEST)

        # 搜尋用戶：根據用戶名進行模糊匹配
        users = User.objects.filter(
            Q(username__icontains=query)  # 用戶名包含查詢字串（不區分大小寫）
        )
        user_serializer = UserSerializer(users, many=True)  # 將查詢到的用戶資料序列化為 JSON 格式

        # 搜尋貼文：根據貼文內容進行模糊匹配
        posts = Post.objects.filter(
            Q(content__icontains=query)  # 貼文內容包含查詢字串（不區分大小寫）
        )
        post_serializer = PostSerializer(posts, many=True)  # 將查詢到的貼文資料序列化為 JSON 格式

        # 儲存搜尋記錄（如果有結果）
        if users.exists() or posts.exists():
            RecentSearch.objects.update_or_create(
                user=request.user,
                query=query,
                defaults={'created_at': timezone.now()}
            )

        # 構建並返回響應資料，包含用戶和貼文搜尋結果
        return Response({
            "users": user_serializer.data,  # 用戶搜尋結果數據
            "posts": post_serializer.data  # 貼文搜尋結果數據
        }, status=status.HTTP_200_OK)  # 返回成功狀態碼 200


class RecentSearchView(APIView):
    """
    近期搜尋紀錄視圖類
    - GET: 獲取當前用戶的近期搜尋紀錄
    - DELETE: 清除當前用戶的特定搜尋紀錄或全部搜尋紀錄
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """獲取當前用戶的近期搜尋紀錄"""
        recent_searches = RecentSearch.objects.filter(user=request.user)[:10]  # 只返回最近的10條記錄
        serializer = RecentSearchSerializer(recent_searches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request):
        """清除當前用戶的特定搜尋紀錄或全部搜尋紀錄"""
        search_id = request.query_params.get('id')
        
        if search_id:
            # 刪除特定搜尋紀錄
            try:
                search = RecentSearch.objects.get(id=search_id, user=request.user)
                search.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except RecentSearch.DoesNotExist:
                return Response({"error": "找不到該搜尋紀錄"}, status=status.HTTP_404_NOT_FOUND)
        else:
            # 刪除全部搜尋紀錄
            RecentSearch.objects.filter(user=request.user).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)