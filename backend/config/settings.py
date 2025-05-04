# Django 專案設定檔案，包含資料庫與應用程式配置

from pathlib import Path

# 專案根目錄路徑
BASE_DIR = Path(__file__).resolve().parent.parent

# 安全性設定：請在生產環境中更改此值
SECRET_KEY = 'django-insecure-your-secret-key-here'

# 除錯模式，開發時設為 True
DEBUG = True

# 允許的域名，開發時設為所有
ALLOWED_HOSTS = ['*']

# 已安裝的應用程式
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',          # REST API 框架
    'rest_framework.authtoken', # Token 認證
    'apps.users',  # 自定義用戶應用
    'apps.posts',  
]

# 中間件設定
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# URL 配置
ROOT_URLCONF = 'config.urls'

# 模板設定
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI 應用
WSGI_APPLICATION = 'config.wsgi.application'

# 資料庫設定：使用 Postgres
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # Postgres 引擎
        'NAME': 'myapp_db',                         # 資料庫名稱
        'USER': 'user',                             # 資料庫用戶
        'PASSWORD': 'password',                     # 資料庫密碼
        'HOST': 'localhost',                        # 資料庫主機
        'PORT': '5433',                             # 資料庫端口
    }
}

# 自定義用戶模型
AUTH_USER_MODEL = 'users.User'

# 密碼驗證器
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# 國際化設定
LANGUAGE_CODE = 'zh-hant'  # 繁體中文
TIME_ZONE = 'Asia/Taipei'  # 台灣時區
USE_I18N = True
USE_TZ = True

# 靜態檔案設定
STATIC_URL = 'static/'

# 預設主鍵字段類型
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}