// 用戶認證 Context，提供全局 token 狀態與操作方法

import React, { createContext, useState, useContext } from 'react';

// 定義 Context 型別，包含 token 與 setToken 方法
interface AuthContextType {
  token: string;  // 用戶認證 Token
  setToken: (token: string) => void;  // 設定 Token 的方法
}

// 建立 Context 實例，初始值為 undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 組件，包裹全應用，提供 token 狀態
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // token 狀態，預設為空字串
  const [token, setToken] = useState<string>('');

  // 將 token 與 setToken 傳遞給所有子組件
  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook，方便在組件中取得 token 與 setToken
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');  // 必須在 AuthProvider 內使用
  }
  return context;
}; 