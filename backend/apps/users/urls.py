# 用戶應用路由檔案，定義 API 端點路徑

from django.urls import path
from .views import RegisterView, LoginView, ProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # 註冊端點
    path('login/', LoginView.as_view(), name='login'),          # 登入端點
    path('profile/', ProfileView.as_view(), name='profile'),    # 個人檔案端點
]