# 用戶應用路由檔案，定義 API 端點路徑
# 功能：將前端 API 請求導向對應的視圖處理
# 資料來源：前端發送的 HTTP 請求
# 資料流向：對應 views.py 的各個 API class

from django.urls import path
from .views import RegisterView, LoginView, ProfileView, SettingsView, SavedPostsView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # 註冊端點，對應 RegisterView
    path('login/', LoginView.as_view(), name='login'),          # 登入端點，對應 LoginView
    path('profile/', ProfileView.as_view(), name='profile'),    # 個人檔案端點，對應 ProfileView
    path('settings/', SettingsView.as_view(), name='settings'), # 設定端點，對應 SettingsView
    path('saved-posts/', SavedPostsView.as_view(), name='saved-posts'), # 已儲存貼文端點，對應 SavedPostsView
]