# apps/portfolios/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Portfolio
from .serializers import PortfolioSerializer
from django.shortcuts import get_object_or_404

class PortfolioListCreateView(generics.ListCreateAPIView):
    """
    獲取所有作品集或創建新作品集
    - GET: 獲取作品集列表
    - POST: 創建新作品集
    """
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # 依照創建時間倒序排序，最新的作品集顯示在最前面
        return Portfolio.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context


class PortfolioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    獲取、更新或刪除特定作品集
    - GET: 獲取作品集詳情
    - PUT/PATCH: 更新作品集
    - DELETE: 刪除作品集
    """
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Portfolio.objects.all()
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # 檢查是否為作品集的擁有者
        if instance.user != request.user:
            return Response(
                {"detail": "您沒有權限刪除此作品集"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # 檢查是否為作品集的擁有者
        if instance.user != request.user:
            return Response(
                {"detail": "您沒有權限編輯此作品集"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)


class UserPortfolioListView(generics.ListAPIView):
    """
    獲取特定用戶的作品集列表
    - GET: 獲取目標用戶的作品集
    """
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return Portfolio.objects.filter(user_id=user_id).order_by('-created_at')


class MyPortfolioListView(generics.ListAPIView):
    """
    獲取當前登入用戶的作品集列表
    - GET: 獲取自己的作品集
    """
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user).order_by('-created_at')