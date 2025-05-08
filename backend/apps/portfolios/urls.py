# portfolios/urls.py - 作品集API路由配置，定義URL路徑與視圖的映射關係
# 功能：設置REST API端點路徑，將URL請求映射到對應的視圖處理函數
# 資料流向：接收URL請求並轉發到views.py中的視圖進行處理
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PortfolioViewSet, 
    PortfolioCategoryViewSet, 
    PortfolioMediaViewSet,
    UserPortfoliosViewSet
)

# 創建默認的Router
router = DefaultRouter()
router.register(r'portfolios', PortfolioViewSet, basename='portfolio')
router.register(r'categories', PortfolioCategoryViewSet, basename='portfolio-category')
router.register(r'media', PortfolioMediaViewSet, basename='portfolio-media')

# 用戶作品集路由
user_portfolio_router = DefaultRouter()
user_portfolio_router.register(r'portfolios', UserPortfoliosViewSet, basename='user-portfolio')

urlpatterns = [
    # API路由
    path('', include(router.urls)),
    
    # 用戶作品集路由
    path('users/<int:user_id>/', include(user_portfolio_router.urls)),
]