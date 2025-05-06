// messages.ts
// 私訊 API 服務文件，集中處理與訊息相關的 API 請求
// 功能: 獲取聊天列表、獲取訊息、發送訊息、標記已讀等

import axios from 'axios';

const API_BASE_URL = 'http://10.0.2.2:8000/api/private_messages';

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
    const response = await axios.get(`${API_BASE_URL}/chats/`, {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('獲取聊天列表失敗', error);
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
    const response = await axios.get(`${API_BASE_URL}/chats/${chatId}/messages/`, {
      headers: { Authorization: `Token ${token}` },
    });
    // 將訊息按時間倒序排列，最新的在底部
    return response.data.reverse();
  } catch (error) {
    console.error('獲取訊息失敗', error);
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
export const sendMessage = async (token: string, chatId: number, content: string): Promise<Message> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/chats/${chatId}/messages/`,
      { content },
      { headers: { Authorization: `Token ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('發送訊息失敗', error);
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
    const response = await axios.patch(
      `${API_BASE_URL}/messages/${messageId}/`,
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
    const response = await axios.post(
      `${API_BASE_URL}/chats/`,
      { participant_id: userId },
      { headers: { Authorization: `Token ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('創建聊天室失敗', error);
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

    const response = await axios.post(
      `${API_BASE_URL}/chats/${chatId}/messages/`,
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