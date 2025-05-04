# 私訊視圖檔案，定義 API 端點的邏輯
# 功能：提供私訊列表查詢與新私訊建立的 API，供前端 MessagesScreen.tsx 使用
# 資料來源：Message 模型（資料庫）
# 資料流向：前端發送 GET/POST 請求，這裡查詢/儲存資料後回傳 JSON 給前端

from rest_framework import generics, permissions  # 引入通用視圖與權限模組，處理 API 請求與權限驗證
from .models import Message  # 導入私訊模型，作為資料來源
from .serializers import MessageSerializer  # 導入私訊序列化器，將資料轉換為 JSON

class MessageListCreateView(generics.ListCreateAPIView):
    # 私訊列表與創建視圖
    # GET：前端會來這裡拿與自己有關的所有私訊資料
    # POST：前端發送新私訊時，會把資料丟給這裡，這裡會存進資料庫
    serializer_class = MessageSerializer  # 指定序列化器，決定回傳/接收哪些欄位
    permission_classes = [permissions.IsAuthenticated]  # 僅認證用戶可訪問

    def get_queryset(self):
        # 回傳與當前用戶有關的所有私訊（自己發送或接收的）
        # 資料來源：Message.objects.filter(sender=user) | Message.objects.filter(recipient=user)
        user = self.request.user
        return Message.objects.filter(sender=user) | Message.objects.filter(recipient=user)

    def perform_create(self, serializer):
        # 新增私訊時，自動將發送者設為當前登入用戶
        # 前端只需傳 recipient、content，這裡自動補 sender
        serializer.save(sender=self.request.user)