// 作品集 API 函數庫，處理所有與作品集相關的 API 請求
import axios from 'axios';
import { API_URL } from '../config';

// 作品集數據接口
export interface Portfolio {
  id: number;
  title: string;
  description: string;
  image?: string;
  image_url?: string;
  video?: string;
  video_url?: string;
  github_url?: string;
  demo_url?: string;
  youtube_url?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
}

// 創建作品集參數接口
export interface CreatePortfolioParams {
  title: string;
  description: string;
  image?: File;
  video?: File;
  github_url?: string;
  demo_url?: string;
  youtube_url?: string;
}

// 獲取用戶作品集列表
export const getUserPortfolios = async (token: string, userId: number) => {
  const response = await axios.get(`${API_URL}/api/portfolios/users/${userId}/portfolios/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data as Portfolio[];
};

// 獲取自己的作品集列表
export const getMyPortfolios = async (token: string) => {
  const response = await axios.get(`${API_URL}/api/portfolios/my-portfolios/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data as Portfolio[];
};

// 獲取單個作品集詳情
export const getPortfolioDetail = async (token: string, portfolioId: number) => {
  const response = await axios.get(`${API_URL}/api/portfolios/portfolios/${portfolioId}/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data as Portfolio;
};

// 創建新作品集
export const createPortfolio = async (token: string, data: CreatePortfolioParams) => {
  const formData = new FormData();
  
  // 添加基本文本字段
  formData.append('title', data.title);
  formData.append('description', data.description);
  
  // 添加可選的 URL 字段
  if (data.github_url) formData.append('github_url', data.github_url);
  if (data.demo_url) formData.append('demo_url', data.demo_url);
  if (data.youtube_url) formData.append('youtube_url', data.youtube_url);
  
  // 添加媒體文件
  if (data.image) formData.append('image', data.image);
  if (data.video) formData.append('video', data.video);
  
  const response = await axios.post(`${API_URL}/api/portfolios/portfolios/`, formData, {
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data as Portfolio;
};

// 更新作品集
export const updatePortfolio = async (token: string, portfolioId: number, data: Partial<CreatePortfolioParams>) => {
  const formData = new FormData();
  
  // 只添加已提供的字段
  if (data.title !== undefined) formData.append('title', data.title);
  if (data.description !== undefined) formData.append('description', data.description);
  if (data.github_url !== undefined) formData.append('github_url', data.github_url);
  if (data.demo_url !== undefined) formData.append('demo_url', data.demo_url);
  if (data.youtube_url !== undefined) formData.append('youtube_url', data.youtube_url);
  if (data.image) formData.append('image', data.image);
  if (data.video) formData.append('video', data.video);
  
  const response = await axios.patch(`${API_URL}/api/portfolios/portfolios/${portfolioId}/`, formData, {
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data as Portfolio;
};

// 刪除作品集
export const deletePortfolio = async (token: string, portfolioId: number) => {
  await axios.delete(`${API_URL}/api/portfolios/portfolios/${portfolioId}/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return true;
}; 