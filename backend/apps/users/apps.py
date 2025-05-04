# apps.py - 註冊 users 應用的 Django AppConfig 設定
# 此檔案用於告訴 Django 這個 app 的名稱與預設主鍵型別

from django.apps import AppConfig

# 定義 users app 的組態類別，繼承自 AppConfig
class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # 預設主鍵型別為 BigAutoField（自動遞增整數）
    name = 'apps.users'  # 指定此 app 的 Python 路徑（必須與實際目錄結構一致）
