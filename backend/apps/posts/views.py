# 貼文視圖檔案，定義 API 端點的邏輯

from rest_framework import generics, permissions
from .models import Post, Like, Comment, Repost, Save
from .serializers import PostSerializer, LikeSerializer, CommentSerializer, RepostSerializer, SaveSerializer

class PostListCreateView(generics.ListCreateAPIView):
    # 貼文列表與創建視圖
    queryset = Post.objects.all()  # 獲取所有貼文
    serializer_class = PostSerializer  # 使用貼文序列化器
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # 認證用戶可創建，未認證用戶可讀

    def perform_create(self, serializer):
        # 設置貼文作者為當前用戶
        serializer.save(author=self.request.user)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    # 貼文詳情視圖，支援讀取、更新和刪除
    queryset = Post.objects.all()  # 獲取所有貼文
    serializer_class = PostSerializer  # 使用貼文序列化器
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # 認證用戶可更新和刪除

class LikeCreateView(generics.CreateAPIView):
    # 點讚創建視圖
    serializer_class = LikeSerializer  # 使用點讚序列化器
    permission_classes = [permissions.IsAuthenticated]  # 僅認證用戶可點讚

    def perform_create(self, serializer):
        # 設置點讚用戶為當前用戶
        serializer.save(user=self.request.user)

class CommentCreateView(generics.CreateAPIView):
    # 留言創建視圖
    serializer_class = CommentSerializer  # 使用留言序列化器
    permission_classes = [permissions.IsAuthenticated]  # 僅認證用戶可留言

    def perform_create(self, serializer):
        # 設置留言用戶為當前用戶
        serializer.save(user=self.request.user)

class RepostCreateView(generics.CreateAPIView):
    # 轉發創建視圖
    serializer_class = RepostSerializer  # 使用轉發序列化器
    permission_classes = [permissions.IsAuthenticated]  # 僅認證用戶可轉發

    def perform_create(self, serializer):
        # 設置轉發用戶為當前用戶
        serializer.save(user=self.request.user)

class SaveCreateView(generics.CreateAPIView):
    # 儲存貼文創建視圖
    serializer_class = SaveSerializer  # 使用儲存貼文序列化器
    permission_classes = [permissions.IsAuthenticated]  # 僅認證用戶可儲存

    def perform_create(self, serializer):
        # 設置儲存用戶為當前用戶
        serializer.save(user=self.request.user)
