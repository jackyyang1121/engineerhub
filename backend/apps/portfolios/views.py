# apps/portfolios/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Portfolio
from .serializers import PortfolioSerializer

User = get_user_model()

class PortfolioListCreateView(generics.ListCreateAPIView):
    """
    作品集列表和创建视图
    GET: 获取所有作品集列表
    POST: 创建新作品集
    """
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return Portfolio.objects.all().order_by('-updated_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PortfolioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    作品集详情、更新和删除视图
    GET: 获取作品集详情
    PUT/PATCH: 更新作品集
    DELETE: 删除作品集
    """
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return Portfolio.objects.all()
    
    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj
        
    def perform_update(self, serializer):
        # 确保只有作者可以更新
        portfolio = self.get_object()
        if portfolio.user != self.request.user:
            return Response(
                {"detail": "您没有权限执行此操作。"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()
        
    def perform_destroy(self, instance):
        # 确保只有作者可以删除
        if instance.user != self.request.user:
            return Response(
                {"detail": "您没有权限执行此操作。"},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.delete()


class UserPortfolioListView(generics.ListAPIView):
    """
    获取特定用户的作品集列表
    GET: 获取用户作品集列表
    """
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        user = get_object_or_404(User, pk=user_id)
        return Portfolio.objects.filter(user=user).order_by('-updated_at')


class MyPortfolioListView(generics.ListAPIView):
    """
    获取当前登录用户的作品集列表
    GET: 获取我的作品集列表
    """
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user).order_by('-updated_at')