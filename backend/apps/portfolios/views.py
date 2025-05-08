# portfolios/views.py - 作品集API視圖，處理作品集相關HTTP請求與響應
# 功能：提供作品集的CRUD操作、點讚、評論和媒體文件上傳等API端點
# 資料來源：前端請求與資料庫中的models.py
# 資料流向：處理請求並通過serializers.py序列化後回傳JSON
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import F
from .models import Portfolio, PortfolioCategory, PortfolioMedia, PortfolioComment, PortfolioLike
from .serializers import (
    PortfolioSerializer, PortfolioMinimalSerializer, PortfolioCategorySerializer,
    PortfolioMediaSerializer, PortfolioCommentSerializer
)
from apps.users.models import User

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    自定義權限：僅允許對象的擁有者編輯它
    """
    def has_object_permission(self, request, view, obj):
        # 讀取權限允許任何請求
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 寫入權限僅限擁有者
        return obj.user == request.user

class PortfolioCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """作品集分類視圖集，只提供讀取功能"""
    queryset = PortfolioCategory.objects.all()
    serializer_class = PortfolioCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class PortfolioViewSet(viewsets.ModelViewSet):
    """作品集視圖集"""
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'user__username']
    ordering_fields = ['created_at', 'updated_at', 'view_count', 'like_count']
    ordering = ['-is_featured', '-created_at']
    
    def get_queryset(self):
        """獲取查詢集，允許通過用戶篩選"""
        queryset = Portfolio.objects.all()
        
        # 從 URL 參數中獲取用戶 ID
        user_id = self.request.query_params.get('user_id')
        username = self.request.query_params.get('username')
        featured_only = self.request.query_params.get('featured_only') == 'true'
        
        # 如果提供了用戶 ID，篩選該用戶的作品集
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # 如果提供了用戶名，篩選該用戶的作品集
        if username:
            queryset = queryset.filter(user__username=username)
        
        # 如果請求只顯示特色作品，篩選特色作品
        if featured_only:
            queryset = queryset.filter(is_featured=True)
            
        return queryset
    
    def get_serializer_class(self):
        """根據請求獲取適合的序列化器"""
        if self.action == 'list':
            return PortfolioMinimalSerializer
        return PortfolioSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """獲取單個作品集詳情，並增加瀏覽次數"""
        instance = self.get_object()
        
        # 增加瀏覽次數
        instance.view_count = F('view_count') + 1
        instance.save(update_fields=['view_count'])
        instance.refresh_from_db()  # 刷新實例以獲取更新後的值
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """點讚/取消點讚作品集"""
        portfolio = self.get_object()
        user = request.user
        
        # 檢查是否已經點讚
        like_exists = PortfolioLike.objects.filter(
            portfolio=portfolio,
            user=user
        ).exists()
        
        if like_exists:
            # 如果已點讚，則取消點讚
            PortfolioLike.objects.filter(portfolio=portfolio, user=user).delete()
            portfolio.like_count = F('like_count') - 1
            message = "已取消點讚"
        else:
            # 如果未點讚，則添加點讚
            PortfolioLike.objects.create(portfolio=portfolio, user=user)
            portfolio.like_count = F('like_count') + 1
            message = "已點讚"
        
        portfolio.save(update_fields=['like_count'])
        portfolio.refresh_from_db()  # 刷新實例以獲取更新後的值
        
        return Response({
            "status": "success",
            "message": message,
            "like_count": portfolio.like_count
        })
    
    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        """為作品集添加評論"""
        portfolio = self.get_object()
        user = request.user
        content = request.data.get('content')
        
        if not content:
            return Response({
                "status": "error",
                "message": "評論內容不能為空"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 創建評論
        comment = PortfolioComment.objects.create(
            portfolio=portfolio,
            user=user,
            content=content
        )
        
        serializer = PortfolioCommentSerializer(comment)
        return Response({
            "status": "success",
            "message": "評論已發佈",
            "comment": serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """獲取作品集的所有評論"""
        portfolio = self.get_object()
        comments = portfolio.comments.all().order_by('-created_at')
        
        serializer = PortfolioCommentSerializer(comments, many=True)
        return Response(serializer.data)
    
class PortfolioMediaViewSet(viewsets.ModelViewSet):
    """作品集媒體文件視圖集"""
    serializer_class = PortfolioMediaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PortfolioMedia.objects.all()
    
    def perform_create(self, serializer):
        """創建媒體文件時，檢查用戶是否有權限"""
        portfolio_id = self.request.data.get('portfolio')
        portfolio = get_object_or_404(Portfolio, id=portfolio_id)
        
        # 確認當前用戶是作品集的擁有者
        if portfolio.user != self.request.user:
            return Response({
                "status": "error",
                "message": "你沒有權限為此作品集上傳媒體文件"
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 確定媒體類型
        file = self.request.data.get('file')
        if file:
            file_type = self.determine_file_type(file)
            serializer.save(portfolio=portfolio, media_type=file_type)
        else:
            serializer.save(portfolio=portfolio)
    
    def determine_file_type(self, file):
        """根據文件擴展名確定媒體類型"""
        name = file.name.lower()
        if name.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            return 'image'
        elif name.endswith(('.mp4', '.mov', '.avi', '.webm')):
            return 'video'
        return 'image'  # 默認為圖片
    
    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request):
        """批量上傳媒體文件"""
        portfolio_id = request.data.get('portfolio')
        portfolio = get_object_or_404(Portfolio, id=portfolio_id)
        
        # 確認當前用戶是作品集的擁有者
        if portfolio.user != request.user:
            return Response({
                "status": "error",
                "message": "你沒有權限為此作品集上傳媒體文件"
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 獲取所有文件
        files = request.FILES.getlist('files')
        if not files:
            return Response({
                "status": "error",
                "message": "請選擇至少一個文件"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 批量創建媒體文件
        created_media = []
        for index, file in enumerate(files):
            file_type = self.determine_file_type(file)
            media = PortfolioMedia.objects.create(
                portfolio=portfolio,
                file=file,
                media_type=file_type,
                order=index
            )
            created_media.append(media)
        
        serializer = PortfolioMediaSerializer(created_media, many=True)
        return Response({
            "status": "success",
            "message": f"已上傳 {len(created_media)} 個媒體文件",
            "media": serializer.data
        })

class UserPortfoliosViewSet(viewsets.ReadOnlyModelViewSet):
    """用戶作品集視圖集，用於獲取特定用戶的作品集"""
    serializer_class = PortfolioMinimalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # 從 URL 獲取用戶 ID
        user_id = self.kwargs.get('user_id')
        
        # 如果沒有提供 user_id，則使用當前用戶
        if not user_id:
            user_id = self.request.user.id
        
        # 獲取用戶
        user = get_object_or_404(User, id=user_id)
        
        # 獲取作品集，並按照特色和創建時間排序
        return user.portfolios.all().order_by('-is_featured', '-created_at')
    
    @action(detail=False, methods=['get'])
    def featured(self, request, user_id=None):
        """獲取用戶的特色作品集"""
        # 從 URL 獲取用戶 ID
        if not user_id:
            user_id = request.user.id
        
        # 獲取用戶
        user = get_object_or_404(User, id=user_id)
        
        # 獲取特色作品集
        featured_portfolios = user.portfolios.filter(is_featured=True).order_by('-created_at')
        
        serializer = self.get_serializer(featured_portfolios, many=True)
        return Response(serializer.data)