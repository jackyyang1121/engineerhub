# 貼文視圖檔案，定義 API 端點的邏輯，用於處理貼文相關的操作
# 功能：提供貼文列表查詢、新貼文建立、貼文詳情查詢/更新/刪除等 API，供前端 HomeScreen.tsx、PostDetailScreen.tsx 使用
# 資料來源：Post 模型（資料庫）
# 資料流向：前端發送 GET/POST/PUT/DELETE 請求，這裡查詢/儲存/更新/刪除資料後回傳 JSON 給前端

from rest_framework import generics, permissions, status  # 引入 REST framework 的通用視圖和權限模組
from django.db.models import Count  # 引入 Django 的計數功能，用於統計點讚數
from rest_framework.response import Response  # 引入 Response 用於自定義回應
from .models import Post, Like, Comment, Repost, Save, PostMedia, CodeBlock  # 引入貼文相關模型
from .serializers import PostSerializer, LikeSerializer, CommentSerializer, RepostSerializer, SaveSerializer  # 引入序列化器
from django.shortcuts import get_object_or_404

class PostListCreateView(generics.ListCreateAPIView):
    # 貼文列表與創建視圖，處理貼文列表顯示與新貼文創建
    # GET：前端會來這裡拿所有貼文資料（資料來源：Post.objects.all()）
    # POST：前端發文時會把資料丟給這裡，這裡會存進資料庫
    serializer_class = PostSerializer  # 指定使用的序列化器為 PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # 設定權限：認證用戶可創建貼文，未認證用戶只能讀取

    def get_queryset(self):
        # 首頁預設按最新貼文排序，讓新發的文能在首頁第一頁最上方
        return Post.objects.all().order_by('-created_at')

    def get_serializer_context(self):
        # 添加 request 到序列化器的 context 中
        context = super().get_serializer_context()
        return context

    def create(self, request, *args, **kwargs):
        # 處理貼文創建，包括多媒體和程式碼區塊
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user)

        # 處理多媒體檔案
        media_files = request.FILES.getlist('media')
        for i, media_file in enumerate(media_files):
            file_type = 'image' if media_file.content_type.startswith('image/') else 'video'
            PostMedia.objects.create(
                post=post,
                file=media_file,
                file_type=file_type,
                order=i
            )

        # 處理程式碼區塊
        code_blocks = request.data.getlist('code_blocks')
        for code_block in code_blocks:
            CodeBlock.objects.create(
                post=post,
                code=code_block.get('code'),
                language=code_block.get('language', 'text')
            )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    # 貼文詳情視圖，支援單篇貼文的讀取、更新和刪除
    # GET：前端會來這裡拿單篇貼文資料
    # PUT/PATCH：前端編輯貼文時會把資料丟給這裡，這裡會更新資料庫
    # DELETE：前端刪除貼文時會呼叫這裡
    queryset = Post.objects.all()  # 設定查詢集為所有貼文
    serializer_class = PostSerializer  # 指定使用的序列化器為 PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # 設定權限：認證用戶可更新和刪除，未認證用戶只能讀取

    def get_serializer_context(self):
        # 添加 request 到序列化器的 context 中
        context = super().get_serializer_context()
        return context

    def update(self, request, *args, **kwargs):
        # 處理貼文更新，包括多媒體和程式碼區塊
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        post = serializer.save()

        # 處理多媒體檔案更新
        if 'media' in request.FILES:
            # 刪除舊的多媒體檔案
            instance.media.all().delete()
            # 添加新的多媒體檔案
            media_files = request.FILES.getlist('media')
            for i, media_file in enumerate(media_files):
                file_type = 'image' if media_file.content_type.startswith('image/') else 'video'
                PostMedia.objects.create(
                    post=post,
                    file=media_file,
                    file_type=file_type,
                    order=i
                )

        # 處理程式碼區塊更新
        if 'code_blocks' in request.data:
            # 刪除舊的程式碼區塊
            instance.code_blocks.all().delete()
            # 添加新的程式碼區塊
            code_blocks = request.data.getlist('code_blocks')
            for code_block in code_blocks:
                CodeBlock.objects.create(
                    post=post,
                    code=code_block.get('code'),
                    language=code_block.get('language', 'text')
                )

        return Response(serializer.data)

class LikeCreateView(generics.CreateAPIView):
    # 點讚創建視圖，處理用戶對貼文的點讚操作
    serializer_class = LikeSerializer  # 指定使用的序列化器為 LikeSerializer
    permission_classes = [permissions.IsAuthenticated]  # 設定權限：僅認證用戶可點讚

    def create(self, request, *args, **kwargs):
        # 獲取貼文ID
        post_id = request.data.get('post')
        
        # 檢查是否已經點讚，如果已點讚則刪除點讚（取消點讚）
        try:
            existing_like = Like.objects.filter(
                user=request.user,
                post_id=post_id
            ).first()
            
            if existing_like:
                # 已存在點讚，則刪除（取消點讚）
                existing_like.delete()
                return Response(
                    {"detail": "已取消點讚"}, 
                    status=status.HTTP_200_OK
                )
        except Exception as e:
            pass
            
        # 創建新的點讚
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        post_id = self.request.data.get('post')
        post = get_object_or_404(Post, id=post_id)
        serializer.save(user=self.request.user, post=post)

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
