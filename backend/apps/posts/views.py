# 貼文視圖檔案，定義 API 端點的邏輯，用於處理貼文相關的操作

from rest_framework import generics, permissions  # 引入 REST framework 的通用視圖和權限模組
from django.db.models import Count  # 引入 Django 的計數功能，用於統計點讚數
from .models import Post, Like, Comment, Repost, Save  # 引入貼文相關模型
from .serializers import PostSerializer, LikeSerializer, CommentSerializer, RepostSerializer, SaveSerializer  # 引入序列化器

class PostListCreateView(generics.ListCreateAPIView):
    # 貼文列表與創建視圖，處理貼文列表顯示與新貼文創建
    serializer_class = PostSerializer  # 指定使用的序列化器為 PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # 設定權限：認證用戶可創建貼文，未認證用戶只能讀取

    def get_queryset(self):
        # 自定義查詢集，獲取所有貼文並按熱門程度排序
        # 使用 annotate 動態添加 like_count 字段，計算每個貼文的點讚數
        # order_by 按點讚數 (like_count) 和創建時間 (created_at) 降序排序
        return Post.objects.all().annotate(like_count=Count('like')).order_by('-like_count', '-created_at')

    def perform_create(self, serializer):
        # 執行創建貼文時，將當前登入用戶設為貼文作者
        serializer.save(author=self.request.user)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    # 貼文詳情視圖，支援單篇貼文的讀取、更新和刪除
    queryset = Post.objects.all()  # 設定查詢集為所有貼文
    serializer_class = PostSerializer  # 指定使用的序列化器為 PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # 設定權限：認證用戶可更新和刪除，未認證用戶只能讀取

class LikeCreateView(generics.CreateAPIView):
    # 點讚創建視圖，處理用戶對貼文的點讚操作
    serializer_class = LikeSerializer  # 指定使用的序列化器為 LikeSerializer
    permission_classes = [permissions.IsAuthenticated]  # 設定權限：僅認證用戶可點讚

    def perform_create(self, serializer):
        # 執行點讚創建時，將當前登入用戶設為點讚者
        serializer.save(user=self.request.user)

class CommentCreateView(generics.CreateAPIView):
    # 留言創建視圖，處理用戶對貼文的留言操作
    serializer_class = CommentSerializer  # 指定使用的序列化器為 CommentSerializer
    permission_classes = [permissions.IsAuthenticated]  # 設定權限：僅認證用戶可留言

    def perform_create(self, serializer):
        # 執行留言創建時，將當前登入用戶設為留言者
        serializer.save(user=self.request.user)

class RepostCreateView(generics.CreateAPIView):
    # 轉發創建視圖，處理用戶對貼文的轉發操作
    serializer_class = RepostSerializer  # 指定使用的序列化器為 RepostSerializer
    permission_classes = [permissions.IsAuthenticated]  # 設定權限：僅認證用戶可轉發

    def perform_create(self, serializer):
        # 執行轉發創建時，將當前登入用戶設為轉發者
        serializer.save(user=self.request.user)

class SaveCreateView(generics.CreateAPIView):
    # 儲存貼文創建視圖，處理用戶儲存貼文的操作
    serializer_class = SaveSerializer  # 指定使用的序列化器為 SaveSerializer
    permission_classes = [permissions.IsAuthenticated]  # 設定權限：僅認證用戶可儲存貼文

    def perform_create(self, serializer):
        # 執行儲存貼文時，將當前登入用戶設為儲存者
        serializer.save(user=self.request.user)
