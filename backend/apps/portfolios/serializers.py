# apps/portfolios/serializers.py
from rest_framework import serializers
from .models import Portfolio
from apps.users.serializers import UserSerializer

class PortfolioSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Portfolio
        fields = ['id', 'user', 'title', 'description', 'image', 'image_url', 
                 'video', 'video_url', 'github_url', 'demo_url', 'youtube_url', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None
    
    def get_video_url(self, obj):
        if obj.video:
            return obj.video.url
        return None
        
    def create(self, validated_data):
        user = self.context['request'].user
        portfolio = Portfolio.objects.create(user=user, **validated_data)
        return portfolio