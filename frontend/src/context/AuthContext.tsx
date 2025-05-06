// 用戶認證 Context，提供全局 token 狀態與操作方法

import React, { createContext, useState, useContext } from 'react';

// 定義用戶型別
interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
}

// 定義 Context 型別，包含 token、user 與相關方法
interface AuthContextType {
  token: string;  // 用戶認證 Token
  setToken: (token: string) => void;  // 設定 Token 的方法
  user: User | null;  // 用戶資訊
  setUser: (user: User | null) => void;  // 設定用戶資訊的方法
}

// 建立 Context 實例，初始值為 undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 組件，包裹全應用，提供 token 狀態
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // token 狀態，預設為空字串
  const [token, setToken] = useState<string>('');
  // user 狀態，預設為 null
  const [user, setUser] = useState<User | null>(null);

  // 將 token、user 與相關方法傳遞給所有子組件
  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook，方便在組件中取得 token、user 與相關方法
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');  // 必須在 AuthProvider 內使用
  }
  return context;
}; 