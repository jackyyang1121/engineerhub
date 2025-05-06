# apps/portfolios/urls.py
from django.urls import path
from .views import (
    PortfolioListCreateView, 
    PortfolioDetailView, 
    UserPortfolioListView,
    MyPortfolioListView
)

urlpatterns = [
    path('portfolios/', PortfolioListCreateView.as_view(), name='portfolio-list-create'),
    path('portfolios/<int:pk>/', PortfolioDetailView.as_view(), name='portfolio-detail'),
    path('users/<int:user_id>/portfolios/', UserPortfolioListView.as_view(), name='user-portfolio-list'),
    path('my-portfolios/', MyPortfolioListView.as_view(), name='my-portfolio-list'),
]