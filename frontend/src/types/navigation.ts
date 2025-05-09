// 導航型別定義檔案，定義應用程式所有頁面的導航參數型別

import { NavigatorScreenParams } from '@react-navigation/native';

// 定義根導航堆疊的參數型別
// 包含所有主要頁面的導航參數
export type RootStackParamList = {
  Login: undefined;  // 登入頁面，不需要額外參數
  Register: undefined;  // 註冊頁面，不需要額外參數
  MainApp: NavigatorScreenParams<TabParamList>;  // 主應用頁面，包含底部標籤導航參數，NavigatorScreenParams是React Navigation定義的型別，用於表示導航堆疊的參數。
  Profile: { userId?: number };  // 個人檔案頁面，可選的用戶 ID 參數
  PostDetail: { postId: number };  // 貼文詳情頁面，需要貼文 ID 參數
  Portfolio: undefined;  // 作品集頁面，不需要額外參數
  PortfolioScreen: undefined;  // 作品集列表页面
  SavedPosts: undefined;  // 已儲存貼文頁面，不需要額外參數
  Settings: undefined;  // 設定頁面，不需要額外參數
  CreatePost: undefined; // 發佈貼文頁面
  ChatScreen: { 
    chatId: number; 
    otherUser: { 
      id: number; 
      username: string; 
      avatar?: string     //?表示可選，表示這個屬性可以不存在，也可以是string型別，avatar是字串型別，表示用戶的頭像。
    } 
  }; // 聊天對話頁面，需要聊天ID和對話者資訊
};

// 定義底部標籤導航的參數型別
// 包含所有底部標籤頁面的導航參數
export type TabParamList = {
  Home: {
    refresh?: boolean;
    newPost?: any;
  };  // 首頁，可選的刷新和新貼文參數
  Search: undefined;  // 搜尋頁面，不需要額外參數
  Notifications: undefined;  // 通知頁面，不需要額外參數
  Messages: undefined;  // 訊息頁面，不需要額外參數
  Profile: undefined;  // 個人檔案頁面，不需要額外參數
}; 




/*
type：
用於定義 TypeScript 的靜態型別，只在編譯時用於型別檢查。
不會出現在編譯後的 JavaScript 程式碼中。
例如：TabParamList 是一個型別，告訴 TypeScript 某個物件應該有什麼結構，但它本身不是一個值。

const：
用於定義運行時的實際資料（值）。
會出現在編譯後的 JavaScript 程式碼中。
例如：RADIUS 是一個物件，包含具體的數值，供程式運行時使用。
*/
