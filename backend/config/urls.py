# 主路由檔案，整合所有應用路由

from django.contrib import admin  # 引入管理員介面，用於後台管理
from django.urls import path, include  # 引入 path 和 include 函數，用於定義和整合路由

urlpatterns = [
    path('admin/', admin.site.urls),  # 管理員介面路由，提供後台管理功能
    path('api/users/', include('apps.users.urls')),  # 用戶應用 API 路由，處理用戶相關請求
    path('api/posts/', include('apps.posts.urls')),  # 貼文應用 API 路由，處理貼文相關請求
    path('api/search/', include('apps.search.urls')),  # 搜尋應用 API 路由，處理搜尋相關請求
    path('api/notifications/', include('apps.notifications.urls')),  # 通知應用 API 路由，處理通知相關請求
    path('api/portfolios/', include('apps.portfolios.urls')),  # 作品集應用 API 路由，處理作品集相關請求
    path('api/private_messages/', include('apps.private_messages.urls')), # 私訊應用 API 路由，處理私訊相關請求    
]

# 添加靜態文件和媒體文件的URL配置
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)