# apps/notifications/serializers.py
# 通知序列化器檔案，將 Notification 模型資料轉換為 JSON 格式
# 功能：API 回傳通知資料給前端，或接收前端資料反序列化
# 資料來源：models.py 的 Notification
# 資料流向：views.py 呼叫序列化器，API 回傳/接收 JSON

from rest_framework import serializers
from .models import Notification
from apps.users.serializers import UserSerializer
from apps.posts.serializers import PostSerializer, CommentSerializer

class NotificationSerializer(serializers.ModelSerializer):
    """
    通知序列化器，將 Notification 模型序列化為 JSON
    """
    # 深度序列化關聯用戶以返回詳細資訊
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    
    # 提供簡化訪問相關帖子和評論內容的方法
    post_id = serializers.SerializerMethodField()
    comment_content = serializers.SerializerMethodField()
    
    class Meta:
        # 指定序列化的模型為Notification
        model = Notification
        # 定義需要序列化的字段
        fields = [
            'id', 
            'recipient', 
            'sender', 
            'notification_type', 
            'post_id', 
            'comment_content', 
            'created_at', 
            'is_read',
            'status',
            'content'
        ]
        
    def get_post_id(self, obj):
        """獲取相關貼文ID"""
        if obj.post:
            return obj.post.id
        return None
        
    def get_comment_content(self, obj):
        """獲取相關評論內容"""
        if obj.comment:
            return obj.comment.content
        return None