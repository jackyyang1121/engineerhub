# apps/private_messages/views.py
# 私訊視圖檔案，定義私訊 API 端點邏輯
# 功能：處理聊天室列表、訊息列表、發送訊息等請求
# 資料來源：models.py 的 Chat 和 Message
# 資料流向：API 回傳 JSON 給前端，或接收前端資料

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import PrivateMessage, PrivateMessageThread
from .serializers import PrivateMessageSerializer, PrivateMessageThreadSerializer
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action

class PrivateMessageThreadListView(generics.ListCreateAPIView):
    """
    聊天室列表視圖
    - GET: 取得當前用戶的所有聊天室
    - POST: 創建新的聊天室
    """
    serializer_class = PrivateMessageThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PrivateMessageThread.objects.filter(participants=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        thread = serializer.save()
        thread.participants.add(self.request.user)

class PrivateMessageListView(generics.ListCreateAPIView):
    """
    訊息列表視圖
    - GET: 取得指定聊天室的所有訊息
    - POST: 在指定聊天室發送新訊息
    """
    serializer_class = PrivateMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        thread_id = self.kwargs.get('thread_id')
        return PrivateMessage.objects.filter(thread_id=thread_id).order_by('created_at')

    def perform_create(self, serializer):
        thread_id = self.kwargs.get('thread_id')
        thread = PrivateMessageThread.objects.get(id=thread_id)
        serializer.save(sender=self.request.user, thread=thread)

class PrivateMessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing private messages
    """
    queryset = PrivateMessage.objects.all()
    serializer_class = PrivateMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter messages to only those in threads the user is part of
        """
        user = self.request.user
        return PrivateMessage.objects.filter(thread__participants=user).order_by('created_at')
    
    @action(detail=False, methods=['get'])
    def threads(self, request):
        """
        Get all message threads for the current user
        """
        user = request.user
        threads = PrivateMessageThread.objects.filter(participants=user)
        serializer = PrivateMessageThreadSerializer(threads, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def thread_messages(self, request):
        """
        Get all messages in a specific thread
        """
        thread_id = request.query_params.get('thread_id')
        if not thread_id:
            return Response({"error": "thread_id parameter is required"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        try:
            thread = PrivateMessageThread.objects.get(id=thread_id, participants=user)
        except PrivateMessageThread.DoesNotExist:
            return Response({"error": "Thread not found or you're not a participant"}, 
                            status=status.HTTP_404_NOT_FOUND)
        
        messages = PrivateMessage.objects.filter(thread=thread).order_by('created_at')
        serializer = PrivateMessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def send_message(self, request):
        """
        Send a new message in a thread
        """
        thread_id = request.data.get('thread_id')
        content = request.data.get('content')
        
        if not thread_id or not content:
            return Response({"error": "thread_id and content are required"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        try:
            thread = PrivateMessageThread.objects.get(id=thread_id, participants=user)
        except PrivateMessageThread.DoesNotExist:
            return Response({"error": "Thread not found or you're not a participant"}, 
                            status=status.HTTP_404_NOT_FOUND)
        
        message = PrivateMessage.objects.create(
            thread=thread,
            sender=user,
            content=content
        )
        
        serializer = PrivateMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark a message as read
        """
        try:
            message = PrivateMessage.objects.get(id=pk)
        except PrivateMessage.DoesNotExist:
            return Response({"error": "Message not found"}, 
                            status=status.HTTP_404_NOT_FOUND)
        
        user = request.user
        if user not in message.thread.participants.all():
            return Response({"error": "You don't have permission to access this message"}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        if message.sender != user:
            message.is_read = True
            message.save()
        
        serializer = PrivateMessageSerializer(message)
        return Response(serializer.data)