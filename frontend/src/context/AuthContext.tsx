// 用戶認證 Context，提供全局 token 狀態與操作方法

import React, { createContext, useState, useContext, useEffect } from 'react';
import { CONFIG } from '../config';   
import AsyncStorage from '@react-native-async-storage/async-storage';   //AsyncStorage 是 React Native 提供的一個用於存儲和檢索數據的 API，允許在應用程式中保存和檢索數據。
import { Alert } from 'react-native';

// 存储键名
const TOKEN_STORAGE_KEY = '@auth:token';
const USER_STORAGE_KEY = '@auth:user';
const LAST_LOGIN_KEY = '@auth:last_login';

// 定義用戶型別
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;        //? 表示該屬性是可選的，可以不存在，bio 是個人簡介
  followers_count?: number;
  following_count?: number;
  skills?: string[];    //技能標籤
}

// 定義模擬用戶資料    測試用
const MOCK_USER: User = {
  id: 1001,
  username: '測試用戶',
  email: 'test@example.com',
  avatar: 'https://i.pravatar.cc/150?img=12',
  bio: '這是一個測試用戶，用於開發環境測試使用。擁有軟體開發技能，熱愛探索新技術。',
  followers_count: 128,
  following_count: 76,
  skills: ['React Native', 'TypeScript', 'UI/UX', 'Node.js'],
};

// 定義 Context 型別，包含 token、user 與相關方法
interface AuthContextType {
  token: string;  // 用戶認證 Token
  setToken: (token: string) => void;  // 設定 Token 的方法，void 表示沒有返回值，(token: string) 表示接受一個字串參數。
  user: User | null;  // 用戶資訊
  setUser: (user: User | null) => void;  // 設定用戶資訊的方法，(user: User | null) 表示接受一個 User 或 null 參數，void 表示沒有返回值。
  logout: () => void;  // 登出方法，void 表示沒有返回值。
  isAuthenticated: boolean;  // 是否已認證
  isMockUser: boolean;  // 是否為模擬用戶
  isLoading: boolean;  // 是否正在載入
  login: (email: string, password: string) => Promise<boolean>; // 登入方法，(email: string, password: string) 表示接受兩個字串參數，Promise<boolean> 表示返回一個布爾值的 Promise。
}

// 建立 Context 實例，初始值為 undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 組件，包裹全應用，提供 token 狀態
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // token 狀態，預設為空字串
  const [token, setTokenState] = useState<string>('');
  // user 狀態，預設為 null
  const [user, setUserState] = useState<User | null>(null);
  // 追蹤是否為模擬用戶
  const [isMockUser, setIsMockUser] = useState<boolean>(false);
  // 追蹤載入狀態
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // 追蹤登入錯誤
  const [loginError, setLoginError] = useState<string | null>(null);

  // 設置 token 並存儲於持久化存儲
  const setToken = async (newToken: string) => {
    //async 函數的主要功用是允許在函數內部使用 await 關鍵字，await 用於暫停函數執行，直到指定的 Promise 解析（resolved）或拒絕（rejected）。
    try {
      // 存儲到 AsyncStorage
      if (newToken) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        // 記錄最後登入時間
        await AsyncStorage.setItem(LAST_LOGIN_KEY, new Date().toISOString());
      } else {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      }
      
      // 更新狀態
      setTokenState(newToken);
      
      // 檢查是否為模擬 token
      const isMock = newToken.startsWith('mock-token');
      setIsMockUser(isMock);
      
      // 如果是模擬 token，設置模擬用戶
      if (isMock && !user) {
        setUser(MOCK_USER);
      }
    } catch (error) {
      console.error('設置 token 失敗:', error);
    }
  };
  
  // 設置用戶並存儲於持久化存儲
  const setUser = async (newUser: User | null) => {
    try {
      // 存儲到 AsyncStorage
      if (newUser) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      } else {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
      }
      
      // 更新狀態
      setUserState(newUser);
    } catch (error) {
      console.error('設置用戶失敗:', error);
    }
  };
  
  // 登入功能
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setLoginError(null);
      
      // 模擬API請求延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 在開發環境中，使用模擬數據
      if (__DEV__ || CONFIG.DEV.USE_MOCK_DATA) {
        // 簡單的帳號密碼檢查，實際中應該通過API驗證
        if (email.trim() && password.trim()) {
          // 設置模擬token和用戶資料
          await setToken(`mock-token-${Date.now()}`);
          await setUser({
            ...MOCK_USER,
            email: email,
            username: email.split('@')[0],
          });
          setIsLoading(false);
          return true;
        } else {
          setLoginError('請輸入有效的帳號和密碼');
          setIsLoading(false);
          return false;
        }
      }
      
      // 實際API請求登入，這裡先使用模擬數據
      await setToken(`mock-token-${Date.now()}`);
      await setUser(MOCK_USER);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('登入失敗:', error);
      setLoginError('登入失敗，請稍後再試');
      setIsLoading(false);
      
      // 顯示錯誤提示
      Alert.alert('登入失敗', '無法連接到伺服器，使用模擬帳號登入？', [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '使用模擬帳號',
          onPress: async () => {
            await setToken(`mock-token-fallback-${Date.now()}`);
            await setUser(MOCK_USER);
          }
        }
      ]);
      
      return false;
    }
  };
  
  // 登出功能
  const logout = async () => {
    // 清除 token 和 user
    setToken('');
    setUser(null);
    setIsMockUser(false);
    
    // 清除存儲
    try {
      await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
    } catch (error) {
      console.error('登出清除存儲失敗:', error);
    }
  };
  
  // 啟動時從存儲加載 token 和 user
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        setIsLoading(true);
        
        // 如果配置為跳過登入，直接設置模擬資料
        if (CONFIG.DEV.SKIP_LOGIN) {
          console.log('配置為跳過登入，使用模擬帳號');
          setTokenState('mock-token-auto');
          setUserState(MOCK_USER);
          setIsMockUser(true);
          setIsLoading(false);
          return;
        } else {
          console.log('未跳過登入，嘗試從存儲加載認證資料');
        }
        
        // 從存儲載入 token
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken) {
          console.log('存儲中找到令牌');
          setTokenState(storedToken);
          setIsMockUser(storedToken.startsWith('mock-token'));
          
          // 從存儲載入用戶資料
          const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
          if (storedUser) {
            console.log('存儲中找到用戶資料');
            setUserState(JSON.parse(storedUser));
          } else if (storedToken.startsWith('mock-token')) {
            // 如果是模擬 token 但沒有用戶資料，設置模擬用戶
            console.log('使用模擬用戶資料');
            setUserState(MOCK_USER);
          }
          
          // 檢查 token 是否過期（超過7天）
          const lastLogin = await AsyncStorage.getItem(LAST_LOGIN_KEY);
          if (lastLogin) {
            const lastLoginDate = new Date(lastLogin);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays > 7) {
              // Token 過期，自動登出
              console.log('Token 已過期，自動登出');
              await logout();
            }
          }
        } else {
          console.log('未找到存儲的令牌，需要登入');
        }
      } catch (error) {
        console.error('載入認證數據失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAuthData();
  }, []);
  
  // 判斷是否已認證
  const isAuthenticated = !!token && !!user;

  // 將 token、user 與相關方法傳遞給所有子組件
  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        setToken, 
        user, 
        setUser, 
        logout, 
        isAuthenticated,
        isMockUser,
        isLoading,
        login
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// useAuth hook，方便在組件中取得 token、user 與相關方法
export const useAuth = () => {
  const context = useContext(AuthContext);    //useContext 是 React 提供的一個 Hook，用於在函數組件中訪問上下文對象。
  if (!context) {    //如果 context 為 null，則拋出錯誤，表示 useAuth 必須在 AuthProvider 內使用。
    throw new Error('useAuth must be used within an AuthProvider');  // 必須在 AuthProvider 內使用
  }
  return context;
}; 