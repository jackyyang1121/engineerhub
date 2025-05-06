// 作品集 API 文件，处理所有与作品集相关的 API 请求
// 功能：提供作品集列表获取、创建、更新、删除等 API 调用
// 数据来源：后端 API 端点
// 数据流向：前端发送请求，后端处理后返回数据

import axios from 'axios';
import { API_URL, CONFIG } from '../config';

// 定义作品集类型
export interface Portfolio {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  demo_url?: string;
  github_url?: string;
  youtube_url?: string;
  image_url?: string;
  video_url?: string;
  category: string;
  technology_used: string[];
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
}

// 创建作品集参数类型
export interface CreatePortfolioParams {
  title: string;
  description: string;
  github_url?: string;
  demo_url?: string;
  youtube_url?: string;
  image?: any;
  video?: any;
}

// API请求超时时间 (ms)
const TIMEOUT = CONFIG.GLOBAL.REQUEST_TIMEOUT || 10000;

// 创建带超时的 axios 实例
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加响应拦截器，统一处理错误
apiClient.interceptors.response.use(
  response => response,
  error => {
    // 记录详细错误信息
    console.error('API错误详情:', {
      endpoint: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    // 继续抛出错误以便上层处理
    return Promise.reject(error);
  }
);

// 获取所有作品集
export const getAllPortfolios = async (token: string) => {
  try {
    const response = await apiClient.get('/api/portfolios/portfolios/', {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error: any) {
    console.error('获取作品集失败:', error);
    if (CONFIG.DEV.USE_MOCK_DATA) {
      console.warn('使用模拟数据回退...');
      return { results: generateMockPortfolios(10) };
    }
    throw error;
  }
};

// 获取用户的作品集列表
export const getUserPortfolios = async (token: string, userId: number) => {
  try {
    const response = await apiClient.get(`/api/portfolios/users/${userId}/portfolios/`, {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('获取用户作品集失败:', error);
    if (CONFIG.DEV.USE_MOCK_DATA) {
      console.warn('使用模拟数据回退...');
      return { results: generateMockPortfolios(5, userId) };
    }
    throw error;
  }
};

// 获取当前用户的作品集列表
export const getMyPortfolios = async (token: string) => {
  try {
    const response = await apiClient.get('/api/portfolios/my-portfolios/', {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error: any) {
    // 详细记录错误，便于调试
    console.error('获取我的作品集失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误详情:', error.response?.data);
    
    // 开发环境使用模拟数据
    if (CONFIG.DEV.USE_MOCK_DATA) {
      console.warn('API请求失败，使用模拟数据回退...');
      return { results: generateMockPortfolios(5) };
    }
    throw error;
  }
};

// 获取单个作品集详情
export const getPortfolioDetail = async (token: string, portfolioId: number) => {
  try {
    const response = await apiClient.get(`/api/portfolios/portfolios/${portfolioId}/`, {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('获取作品集详情失败:', error);
    if (CONFIG.DEV.USE_MOCK_DATA) {
      // 根据ID查找或生成一个模拟的portfolio
      console.warn('使用模拟数据回退...');
      return generateMockPortfolios(1)[0];
    }
    throw error;
  }
};

// 创建新作品集
export const createPortfolio = async (token: string, portfolioData: FormData) => {
  try {
    const response = await apiClient.post('/api/portfolios/portfolios/', portfolioData, {
      headers: { 
        Authorization: `Token ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('创建作品集失败:', error);
    
    // 显示详细错误
    if (error.response) {
      console.error('服务器响应:', error.response.data);
    }
    
    // 开发环境创建模拟成功响应
    if (CONFIG.DEV.USE_MOCK_DATA) {
      console.warn('使用模拟数据...');
      // 简单提取有用数据
      const mockResponse: Partial<Portfolio> = {
        id: Date.now(),
        title: '新项目',
        description: '项目描述',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        thumbnail: 'https://picsum.photos/seed/portfolio1/800/600',
        category: '网页应用',
        technology_used: ['React', 'TypeScript', 'Node.js'],
      };
      return mockResponse as Portfolio;
    }
    throw error;
  }
};

// 更新作品集
export const updatePortfolio = async (token: string, portfolioId: number, portfolioData: FormData) => {
  try {
    const response = await apiClient.patch(`/api/portfolios/portfolios/${portfolioId}/`, portfolioData, {
      headers: { 
        Authorization: `Token ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('更新作品集失败:', error);
    if (CONFIG.DEV.USE_MOCK_DATA) {
      console.warn('使用模拟数据...');
      return {
        id: portfolioId,
        updated_at: new Date().toISOString(),
        title: '更新的项目',
        description: '更新的描述',
        thumbnail: 'https://picsum.photos/seed/portfolio1/800/600',
        category: '网页应用',
        technology_used: ['React', 'TypeScript', 'Node.js'],
      } as Portfolio;
    }
    throw error;
  }
};

// 删除作品集
export const deletePortfolio = async (token: string, portfolioId: number) => {
  try {
    await apiClient.delete(`/api/portfolios/portfolios/${portfolioId}/`, {
      headers: { Authorization: `Token ${token}` }
    });
    return true;
  } catch (error) {
    console.error('删除作品集失败:', error);
    if (CONFIG.DEV.USE_MOCK_DATA) {
      console.warn('开发环境中模拟删除成功');
      return true;
    }
    throw error;
  }
};

// 生成模拟作品集数据（开发测试用）
export const generateMockPortfolios = (count = 3, userId = 1): Portfolio[] => {
  const categories = ['网页应用', '移动应用', 'API服务', '桌面应用', 'IoT项目'];
  const techs = [
    'React', 'React Native', 'Vue.js', 'Angular', 'Node.js', 
    'Django', 'Flask', 'Express', 'Spring Boot', 'Laravel',
    'PostgreSQL', 'MongoDB', 'MySQL', 'Firebase', 'Redis',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy'
  ];
  
  return Array(count).fill(0).map((_, index) => {
    // 随机选择3-5项技术
    const techCount = Math.floor(Math.random() * 3) + 3;
    const randomTechs = new Set();
    while (randomTechs.size < techCount) {
      randomTechs.add(techs[Math.floor(Math.random() * techs.length)]);
    }
    
    return {
      id: Date.now() + index,
      title: `项目${index + 1}: ${['智能应用', '电商平台', '数据分析工具', '社交网络', '内容管理系统'][index % 5]}`,
      description: `这是一个${['创新', '高效', '直观', '强大', '灵活'][index % 5]}的项目，使用最新技术栈开发，解决了实际问题。`,
      thumbnail: `https://picsum.photos/seed/portfolio${index}/800/600`,
      demo_url: Math.random() > 0.3 ? `https://example.com/demo${index}` : undefined,
      category: categories[index % categories.length],
      technology_used: Array.from(randomTechs) as string[],
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        id: userId,
        username: `用户${userId}`,
        avatar: `https://i.pravatar.cc/150?img=${userId}`
      }
    };
  });
}; 