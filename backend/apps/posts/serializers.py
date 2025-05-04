# 貼文序列化器檔案，用於將模型資料轉換為 JSON 格式

from rest_framework import serializers
from .models import Post, Like, Comment, Repost, Save

class PostSerializer(serializers.ModelSerializer):
    # 貼文序列化器
    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'created_at', 'updated_at']  # 可序列化的字段

class LikeSerializer(serializers.ModelSerializer):
    # 點讚序列化器
    class Meta:
        model = Like
        fields = ['id', 'post', 'user', 'created_at']  # 可序列化的字段

class CommentSerializer(serializers.ModelSerializer):
    # 留言序列化器
    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'content', 'created_at']  # 可序列化的字段

class RepostSerializer(serializers.ModelSerializer):
    # 轉發序列化器
    class Meta:
        model = Repost
        fields = ['id', 'original_post', 'user', 'created_at']  # 可序列化的字段

class SaveSerializer(serializers.ModelSerializer):
    # 儲存貼文序列化器
    class Meta:
        model = Save
        fields = ['id', 'post', 'user', 'created_at']  # 可序列化的字段