# 私訊序列化器檔案，用於將模型資料轉換為 JSON 格式
# 功能：將 Message 模型資料轉換為 JSON，供 API 回傳給前端，或將前端傳來的資料驗證後存進資料庫
# 資料來源：Message 模型
# 資料流向：views.py 呼叫，回傳給前端或接收前端資料

from rest_framework import serializers  # 引入 DRF 的序列化器
from .models import Message  # 導入私訊模型

class MessageSerializer(serializers.ModelSerializer):
    # 私訊序列化器，定義哪些欄位可被序列化/反序列化
    class Meta:
        model = Message  # 指定序列化對象為 Message 模型
        fields = ['id', 'sender', 'recipient', 'content', 'created_at']  # 可序列化的欄位，對應前端顯示/傳送