# 私訊應用路由檔案，定義 API 端點路徑
# 功能：註冊私訊相關 API 路徑，供前端 MessagesScreen.tsx 呼叫
# 資料來源：views.py 的 MessageListCreateView
# 資料流向：前端 GET/POST 請求會被導向對應視圖

from django.urls import path
from .views import MessageListCreateView  # 導入私訊列表/創建視圖

urlpatterns = [
    # /api/private_messages/messages/：
    #   GET：取得與自己有關的所有私訊（資料來源：Message 模型，資料流向：回傳 JSON 給前端）
    #   POST：新增一則私訊（資料來源：前端傳入，資料流向：存進資料庫）
    path('messages/', MessageListCreateView.as_view(), name='message-list-create'),  # 私訊列表與創建
]