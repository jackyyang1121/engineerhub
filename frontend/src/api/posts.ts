// 貼文 API 檔案，處理所有與貼文相關的 API 請求
// 功能：提供貼文列表獲取、發文、點讚、留言等 API 呼叫
// 資料來源：後端 API 端點
// 資料流向：前端發送請求，後端處理後回傳資料

import axios from 'axios';
import { API_URL } from '../config';

// 獲取貼文列表
export const getPosts = async (token: string, page: number = 1) => {
  const response = await axios.get(`${API_URL}/api/posts/posts/?page=${page}`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// 發佈新貼文
export const createPost = async (token: string, data: {
  content: string;
  media?: File[];
  code_blocks?: Array<{ code: string; language: string; }>;
}) => {
  const formData = new FormData();
  formData.append('content', data.content);
  
  // 添加多媒體檔案
  if (data.media) {
    data.media.forEach((file, index) => {
      formData.append(`media`, file);
    });
  }
  
  // 添加程式碼區塊
  if (data.code_blocks) {
    data.code_blocks.forEach((block, index) => {
      formData.append(`code_blocks[${index}][code]`, block.code);
      formData.append(`code_blocks[${index}][language]`, block.language);
    });
  }

  const response = await axios.post(`${API_URL}/api/posts/posts/`, formData, {
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 點讚貼文
export const likePost = async (token: string, postId: number) => {
  const response = await axios.post(`${API_URL}/api/posts/likes/`, {
    post: postId
  }, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// 留言
export const commentPost = async (token: string, postId: number, content: string) => {
  const response = await axios.post(`${API_URL}/api/posts/comments/`, {
    post: postId,
    content
  }, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// 轉發貼文
export const repostPost = async (token: string, postId: number) => {
  const response = await axios.post(`${API_URL}/api/posts/reposts/`, {
    original_post: postId
  }, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// 儲存貼文
export const savePost = async (token: string, postId: number) => {
  const response = await axios.post(`${API_URL}/api/posts/saves/`, {
    post: postId
  }, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};
