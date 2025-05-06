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
  // 开发环境相关
  DEV: {
    // 是否启用模拟数据（不请求真实后端）
    USE_MOCK_DATA: true,
    // 是否显示日志
    SHOW_LOGS: true,
    // 是否跳过登录（自动登录）
    SKIP_LOGIN: false,
    // 模擬網絡延遲（毫秒）
    NETWORK_DELAY: 300,
    // 開發模式下的後端API
    DEV_API_URL: getApiUrl(),
    // 是否在模擬未授權時自動使用模擬帳號
    AUTO_MOCK_ON_FAIL: true,
  },
  
  // 全局设置
  GLOBAL: {
    // 默认页数大小
    PAGE_SIZE: 15,
    // 图片质量
    IMAGE_QUALITY: 0.8,
    // 最大上传图片大小（字节）
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    // 動畫持續時間（毫秒）
    ANIMATION_DURATION: 220,
    // 默認請求超時時間（毫秒）
    REQUEST_TIMEOUT: 10000,
  },
  
  // 缓存设置
  CACHE: {
    // 缓存过期时间（毫秒）
    EXPIRATION: 15 * 60 * 1000, // 15分钟
    // 圖片緩存時間（毫秒）
    IMAGE_EXPIRATION: 24 * 60 * 60 * 1000, // 24小時
    // 是否緩存首頁資料
    CACHE_HOME_DATA: true,
  },
  
  // UI 設置
  UI: {
    // 深色模式
    DARK_MODE: true,
    // 自動切換深色/淺色模式
    AUTO_DARK_MODE: true,
    // 平滑動畫
    SMOOTH_ANIMATIONS: true,
    // 是否使用原生元素
    USE_NATIVE_COMPONENTS: Platform.OS !== 'web',
  },
  
  // 安全設置
  SECURITY: {
    // Token 過期時間（天）
    TOKEN_EXPIRATION_DAYS: 7,
    // 是否加密本地存儲
    ENCRYPT_STORAGE: false,
  },
};

// 判斷是否為開發環境
export const IS_DEV = __DEV__; 