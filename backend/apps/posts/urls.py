# 貼文應用路由檔案，定義 API 端點路徑

from django.urls import path
from .views import (
    PostListCreateView, PostDetailView, LikeCreateView, 
    CommentCreateView, RepostCreateView, SaveCreateView
)

urlpatterns = [
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),  # 貼文列表與創建
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),  # 貼文詳情
    path('likes/', LikeCreateView.as_view(), name='like-create'),  # 創建點讚
    path('comments/', CommentCreateView.as_view(), name='comment-create'),  # 創建留言
    path('reposts/', RepostCreateView.as_view(), name='repost-create'),  # 創建轉發
    path('saves/', SaveCreateView.as_view(), name='save-create'),  # 創建儲存貼文
]