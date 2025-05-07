// messages.ts
// 私訊 API 服務文件，集中處理與訊息相關的 API 請求
// 功能: 獲取聊天列表、獲取訊息、發送訊息、標記已讀等

import axios from 'axios';
import { API_URL, CONFIG } from '../config';

// API基礎URL
const MESSAGES_API_URL = `${API_URL}/api/private_messages`;

// API請求超時時間 (ms)
const TIMEOUT = CONFIG.GLOBAL.REQUEST_TIMEOUT || 10000;

// 創建帶超時的axios實例
const apiClient = axios.create({
  baseURL: MESSAGES_API_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 聊天室類型
export interface Chat {
  id: number;
  participants: Array<{
    id: number;
    username: string;
    avatar?: string;
  }>;
  last_message?: {
    content: string;
    created_at: string;
    is_read: boolean;
  };
  updated_at: string;
  unread_count: number;
}

// 訊息類型
export interface Message {
  id: number;
  chat: number;
  sender: {
    id: number;
    username: string;
    avatar?: string;
  };
  content: string;
  created_at: string;
  is_read: boolean;
  attachment?: {
    type: 'image' | 'video';
    url: string;
  };
}

/**
 * 獲取聊天室列表
 * @param token 用戶認證令牌
 * @returns 聊天室列表
 */
export const getChats = async (token: string): Promise<Chat[]> => {
  try {
    console.log('正在獲取聊天室列表...');
    const response = await apiClient.get('/chats/', {
      headers: { Authorization: `Token ${token}` }
    });
    console.log('獲取聊天室成功:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('獲取聊天室失敗:', error);
    console.error('錯誤狀態碼:', error.response?.status);
    console.error('錯誤詳情:', error.response?.data);
    
    // 開發環境使用模擬數據
    if (CONFIG.DEV.USE_MOCK_DATA) {
      console.warn('使用模擬數據回退...');
      return generateMockChats(5);
    }
    throw error;
  }
};

/**
 * 獲取特定聊天室的訊息
 * @param token 用戶認證令牌
 * @param chatId 聊天室 ID
 * @returns 訊息列表
 */
export const getChatMessages = async (token: string, chatId: number): Promise<Message[]> => {
  try {
    const response = await apiClient.get(`/chats/${chatId}/messages/`, {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('獲取聊天訊息失敗:', error);
    
    // 開發環境使用模擬數據
    if (CONFIG.DEV.USE_MOCK_DATA) {
      console.warn('使用模擬數據回退...');
      return generateMockMessages(chatId, 20);
    }
    throw error;
  }
};

/**
 * 在特定聊天室發送訊息
 * @param token 用戶認證令牌
 * @param chatId 聊天室 ID
 * @param content 訊息內容
 * @returns 發送的訊息
 */
export const sendMessage = async (token: string, chatId: number, content: string, attachment?: any): Promise<Message> => {
  try {
    // 創建FormData以支持附件上傳
    const formData = new FormData();
    formData.append('content', content);
    formData.append('chat', chatId.toString());
    
    if (attachment) {
      formData.append('attachment', attachment);
    }
    
    const response = await apiClient.post('/messages/', formData, {
      headers: { 
        Authorization: `Token ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('發送訊息失敗:', error);
    throw error;
  }
};

/**
 * 標記訊息為已讀
 * @param token 用戶認證令牌
 * @param messageId 訊息 ID
 * @returns 更新後的訊息
 */
export const markMessageAsRead = async (token: string, messageId: number): Promise<Message> => {
  try {
    const response = await apiClient.patch(
      `/messages/${messageId}/`,
      { is_read: true },
      { headers: { Authorization: `Token ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('標記訊息已讀失敗', error);
    throw error;
  }
};

/**
 * 創建新聊天室
 * @param token 用戶認證令牌
 * @param userId 對方用戶 ID
 * @returns 新建的聊天室
 */
export const createChat = async (token: string, userId: number): Promise<Chat> => {
  try {
    const response = await apiClient.post('/chats/', { user_id: userId }, {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('創建聊天室失敗:', error);
    throw error;
  }
};

/**
 * 上傳照片訊息
 * @param token 用戶認證令牌
 * @param chatId 聊天室 ID
 * @param imageUri 照片 URI
 * @returns 含附件的訊息
 */
export const uploadImageMessage = async (
  token: string,
  chatId: number,
  imageUri: string
): Promise<Message> => {
  try {
    const formData = new FormData();
    formData.append('attachment', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    const response = await apiClient.post(
      `/chats/${chatId}/messages/`,
      formData,
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('上傳照片失敗', error);
    throw error;
  }
};

// 生成模擬聊天室數據
export const generateMockChats = (count = 5): Chat[] => {
  return Array(count).fill(0).map((_, index) => ({
    id: 1000 + index,
    participants: [
      { id: 999 - index, username: `用戶${index + 1}`, avatar: `https://i.pravatar.cc/150?img=${30 + index}` },
      { id: 1, username: '我' }
    ],
    last_message: {
      content: `這是測試訊息 ${index + 1}`,
      created_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      is_read: Math.random() > 0.3
    },
    updated_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    unread_count: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0
  }));
};

// 生成模擬訊息數據
export const generateMockMessages = (chatId: number, count = 20): Message[] => {
  const otherUserId = 999 - (chatId - 1000);
  const messages: Message[] = [];
  
  for (let i = 0; i < count; i++) {
    const isFromMe = Math.random() > 0.5;
    const timeOffset = (count - i) * (Math.random() * 3600000 + 300000); // 更早的消息
    
    messages.push({
      id: Date.now() + i,
      chat: chatId,
      sender: {
        id: isFromMe ? 1 : otherUserId,
        username: isFromMe ? '我' : `用戶${chatId - 999}`,
        avatar: isFromMe ? undefined : `https://i.pravatar.cc/150?img=${30 + (chatId - 1000)}`
      },
      content: `這是第 ${i + 1} 條${isFromMe ? '發送' : '接收'}的測試訊息，時間: ${new Date(Date.now() - timeOffset).toLocaleTimeString()}`,
      created_at: new Date(Date.now() - timeOffset).toISOString(),
      is_read: isFromMe || Math.random() > 0.2
    });
  }
  
  return messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}; 