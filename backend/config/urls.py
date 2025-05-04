# 主路由檔案，整合所有應用路由

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),          # 管理員介面路由
    path('api/users/', include('apps.users.urls')),  # 用戶應用 API 路由
    path('api/posts/', include('apps.posts.urls')),  # 貼文應用 API 路由
]