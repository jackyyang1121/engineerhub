# apps/portfolios/urls.py
from django.urls import path
from .views import PortfolioListCreateView

urlpatterns = [
    path('portfolios/', PortfolioListCreateView.as_view(), name='portfolio-list-create'),
]