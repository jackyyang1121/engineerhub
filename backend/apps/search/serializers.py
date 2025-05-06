# 搜尋相關的序列化器

from rest_framework import serializers
from .models import RecentSearch

class RecentSearchSerializer(serializers.ModelSerializer):
    """近期搜尋序列化器"""
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    
    class Meta:
        model = RecentSearch
        fields = ['id', 'query', 'created_at']
        read_only_fields = ['id', 'created_at']
