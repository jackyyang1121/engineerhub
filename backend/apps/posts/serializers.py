# 貼文序列化器檔案，用於將模型資料轉換為 JSON 格式並傳遞給前端

from rest_framework import serializers  # 引入 REST framework 的序列化器模組
from .models import Post, Like, Comment, Repost, Save  # 引入貼文相關模型

class PostSerializer(serializers.ModelSerializer):
    # 貼文序列化器，處理貼文資料的序列化與反序列化
    like_count = serializers.IntegerField(read_only=True)  # 動態添加 like_count 字段，僅供讀取

    class Meta:
        model = Post  # 指定關聯的模型為 Post
        fields = ['id', 'author', 'content', 'created_at', 'updated_at', 'like_count']  # 指定可序列化的字段

class LikeSerializer(serializers.ModelSerializer):
    # 點讚序列化器，處理點讚資料的序列化與反序列化
    class Meta:
        model = Like  # 指定關聯的模型為 Like
        fields = ['id', 'post', 'user', 'created_at']  # 指定可序列化的字段

class CommentSerializer(serializers.ModelSerializer):
    # 留言序列化器，處理留言資料的序列化與反序列化
    class Meta:
        model = Comment  # 指定關聯的模型為 Comment
        fields = ['id', 'post', 'user', 'content', 'created_at']  # 指定可序列化的字段

class RepostSerializer(serializers.ModelSerializer):
    # 轉發序列化器，處理轉發資料的序列化與反序列化
    class Meta:
        model = Repost  # 指定關聯的模型為 Repost
        fields = ['id', 'original_post', 'user', 'created_at']  # 指定可序列化的字段

class SaveSerializer(serializers.ModelSerializer):
    # 儲存貼文序列化器，處理儲存貼文資料的序列化與反序列化
    class Meta:
        model = Save  # 指定關聯的模型為 Save
        fields = ['id', 'post', 'user', 'created_at']  # 指定可序列化的字段