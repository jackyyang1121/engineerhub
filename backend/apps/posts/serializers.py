# 貼文序列化器檔案，用於將模型資料轉換為 JSON 格式並傳遞給前端

from rest_framework import serializers  # 引入 REST framework 的序列化器模組
from .models import Post, Like, Comment, Repost, Save, PostMedia, CodeBlock  # 引入貼文相關模型
from apps.users.serializers import UserSerializer  # 引入用戶序列化器

class PostMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostMedia
        fields = ['id', 'file', 'file_type', 'order']
        read_only_fields = ['id']

class CodeBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeBlock
        fields = ['id', 'code', 'language']
        read_only_fields = ['id']

class PostSerializer(serializers.ModelSerializer):
    # 貼文序列化器，處理貼文資料的序列化與反序列化
    author = UserSerializer(read_only=True)  # 作者資訊只讀
    like_count = serializers.SerializerMethodField()  # 動態計算點讚數
    comment_count = serializers.SerializerMethodField()  # 動態計算留言數
    is_liked = serializers.SerializerMethodField()  # 當前用戶是否已點讚
    is_saved = serializers.SerializerMethodField()  # 當前用戶是否已儲存
    media = PostMediaSerializer(many=True, read_only=True)  # 多媒體檔案
    code_blocks = CodeBlockSerializer(many=True, read_only=True)  # 程式碼區塊

    class Meta:
        model = Post  # 指定關聯的模型為 Post
        fields = ['id', 'author', 'content', 'created_at', 'updated_at', 
                 'like_count', 'comment_count', 'is_liked', 'is_saved',
                 'media', 'code_blocks']  # 指定可序列化的字段
        read_only_fields = ['author', 'created_at', 'updated_at']  # 這些欄位只能讀取

    def get_like_count(self, obj):
        # 計算點讚數
        return obj.like_set.count()

    def get_comment_count(self, obj):
        # 計算留言數
        return obj.comment_set.count()

    def get_is_liked(self, obj):
        # 檢查當前用戶是否已點讚
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.like_set.filter(user=request.user).exists()
        return False

    def get_is_saved(self, obj):
        # 檢查當前用戶是否已儲存
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.save_set.filter(user=request.user).exists()
        return False

    def create(self, validated_data):
        # 創建貼文時自動設定作者為當前用戶
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['author'] = request.user
        return super().create(validated_data)

class LikeSerializer(serializers.ModelSerializer):
    # 點讚序列化器，處理點讚資料的序列化與反序列化
    class Meta:
        model = Like  # 指定關聯的模型為 Like
        fields = ['id', 'post', 'user', 'created_at']  # 指定可序列化的字段
        read_only_fields = ['user', 'created_at']  # 這些欄位只能讀取

class CommentSerializer(serializers.ModelSerializer):
    # 留言序列化器，處理留言資料的序列化與反序列化
    user = UserSerializer(read_only=True)  # 用戶資訊只讀

    class Meta:
        model = Comment  # 指定關聯的模型為 Comment
        fields = ['id', 'post', 'user', 'content', 'created_at']  # 指定可序列化的字段
        read_only_fields = ['user', 'created_at']  # 這些欄位只能讀取

class RepostSerializer(serializers.ModelSerializer):
    # 轉發序列化器，處理轉發資料的序列化與反序列化
    user = UserSerializer(read_only=True)  # 用戶資訊只讀

    class Meta:
        model = Repost  # 指定關聯的模型為 Repost
        fields = ['id', 'original_post', 'user', 'created_at']  # 指定可序列化的字段
        read_only_fields = ['user', 'created_at']  # 這些欄位只能讀取

class SaveSerializer(serializers.ModelSerializer):
    # 儲存貼文序列化器，處理儲存貼文資料的序列化與反序列化
    class Meta:
        model = Save  # 指定關聯的模型為 Save
        fields = ['id', 'post', 'user', 'created_at']  # 指定可序列化的字段
        read_only_fields = ['user', 'created_at']  # 這些欄位只能讀取