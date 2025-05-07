// API 配置文件
import { Platform } from 'react-native';

// 根據平台動態選擇API地址
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    // Android 模擬器使用10.0.2.2訪問主機
    return 'http://10.0.2.2:8000';
  } else if (Platform.OS === 'ios') {
    // iOS 模擬器使用localhost訪問主機
    return 'http://localhost:8000';
  }
  // 其他平台或實際設備使用IP地址
  return 'http://127.0.0.1:8000';
};

export const API_URL = getApiUrl();

// 环境配置
export const CONFIG = {
  // 全局設置
  GLOBAL: {
    // API請求超時時間(ms)
    REQUEST_TIMEOUT: 15000,
    // 緩存有效期(ms)
    CACHE_TTL: 5 * 60 * 1000,
  },
  
  // 開發環境設置
  DEV: {
    // 是否使用模擬數據
    USE_MOCK_DATA: true,
    // 是否顯示API日誌
    SHOW_API_LOGS: true,
    // 是否顯示調試信息
    DEBUG: true,
    // 是否跳過登入
    SKIP_LOGIN: false,
  },
  
  // 認證設置
  AUTH: {
    // Token存儲鍵
    TOKEN_KEY: '@authToken',
    // 刷新Token鍵
    REFRESH_TOKEN_KEY: '@refreshToken',
    // Token有效期(ms)
    TOKEN_TTL: 7 * 24 * 60 * 60 * 1000,
  },
  
  // 媒體文件設置
  MEDIA: {
    // 最大上傳文件大小(bytes)
    MAX_UPLOAD_SIZE: 10 * 1024 * 1024,
    // 支持的圖片類型
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    // 支持的視頻類型
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime'],
    // 圖片壓縮質量(0-1)
    IMAGE_COMPRESSION_QUALITY: 0.8,
  },
  
  // 錯誤處理
  ERROR: {
    // 默認錯誤消息
    DEFAULT_MESSAGE: '發生錯誤，請稍後再試',
    // 網絡錯誤消息
    NETWORK_ERROR: '網絡連接失敗，請檢查您的網絡',
    // 認證錯誤消息
    AUTH_ERROR: '認證失敗，請重新登錄',
    // 伺服器錯誤消息
    SERVER_ERROR: '伺服器錯誤，請稍後再試',
  }
};

// 導出默認配置
export default CONFIG;

// 判斷是否為開發環境
export const IS_DEV = __DEV__; 