# 搜尋應用路由檔案，定義搜尋 API 端點路徑

from django.urls import path  # 引入 path 函數，用於定義 URL 路由
from .views import SearchView  # 引入搜尋視圖，用於處理搜尋請求

urlpatterns = [
    path('search/', SearchView.as_view(), name='search'),  # 定義搜尋 API 端點路徑，映射到 SearchView
]