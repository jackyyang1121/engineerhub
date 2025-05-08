// api/posts.ts - 貼文API調用模組，處理所有貼文相關的HTTP請求
// 功能：提供貼文列表獲取、發文、點讚、留言等 API 呼叫
// 資料來源：後端 API 端點
// 資料流向：前端發送請求，後端處理後回傳資料

import axios from 'axios';
import { API_URL } from '../config';

// 定義 Post 類型
export interface Post {
  id: number;
  author: {
    id: number;
    username: string;
    avatar?: string;
  };
  content: string;
  media?: Array<{
    id: number;
    file: string;
    file_type: 'video' | 'image';
  }>;
  code_blocks?: Array<{
    id: number;
    code: string;
    language: string;
  }>;
  created_at: string;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_saved: boolean;
}

// 生成模擬貼文數據
export const generateMockPosts = (count = 10): Post[] => {
  const mockUsers = [
    { id: 101, username: '工程師小明', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 102, username: '設計師小華', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 103, username: '產品經理大雄', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 104, username: '前端工程師靜香', avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: 105, username: '後端專家胖虎', avatar: 'https://i.pravatar.cc/150?img=5' },
  ];
  
  const mockContents = [
    '今天學習了React Hook的使用，感覺比Class Component更加直觀和易用',
    '分享一下我最近完成的UI設計，使用了最新的設計趨勢，簡約但不簡單',
    '軟體開發中，溝通比寫程式更重要。良好的溝通能避免很多問題',
    'TypeScript真的能大幅提高代碼質量，強烈推薦給所有JavaScript開發者',
    '剛剛解決了一個棘手的bug，關鍵是要理解系統的整體架構',
    '在前端性能優化上，減少HTTP請求和壓縮資源是基本功',
    '後端開發中，資料庫索引的正確使用對性能有極大影響',
    '學習了新的CSS Grid佈局技術，比Flexbox更適合二維佈局',
    '良好的代碼應該是自文檔化的，但適當的註釋也很重要',
    '開發者應該多關注用戶體驗，技術只是實現目標的工具',
    '設計系統能大幅提高UI開發效率和一致性',
    '團隊協作中，Git分支管理策略至關重要',
    '自動化測試可以讓你更自信地重構代碼',
    'Docker讓環境配置變得簡單而可重複',
    '持續學習是工程師的基本修養',
  ];
  
  // 生成貼文列表
  return Array(count).fill(0).map((_, index) => {
    const timestamp = Date.now();
    const random = Math.random();
    const hasMedia = random > 0.6;
    const hasCodeBlock = !hasMedia && random > 0.3;
    const likeCount = Math.floor(Math.random() * 50);
    const commentCount = Math.floor(Math.random() * 20);
    const author = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const content = mockContents[Math.floor(Math.random() * mockContents.length)];
    const isLiked = Math.random() > 0.7;
    const isSaved = Math.random() > 0.8;
    
    // 創建基本貼文對象
    const post: Post = {
      id: timestamp - index * 1000 - Math.floor(Math.random() * 1000),
      author,
      content,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      like_count: likeCount,
      comment_count: commentCount,
      is_liked: isLiked,
      is_saved: isSaved,
    };
    
    // 添加媒體（圖片）
    if (hasMedia) {
      post.media = [{
        id: timestamp + 100 + index,
        file: `https://picsum.photos/500/300?random=${index}`,
        file_type: 'image'
      }];
    }
    
    // 添加代碼塊
    if (hasCodeBlock) {
      const codeTemplates = [
        {
          language: 'javascript',
          code: `
const greeting = (name) => {
  return \`Hello, \${name}!\`;
};

console.log(greeting('World'));
          `.trim()
        },
        {
          language: 'python',
          code: `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(fibonacci(i))
          `.trim()
        },
        {
          language: 'java',
          code: `
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
          `.trim()
        }
      ];
      
      const randomCode = codeTemplates[Math.floor(Math.random() * codeTemplates.length)];
      post.code_blocks = [{
        id: timestamp + 200 + index,
        language: randomCode.language,
        code: randomCode.code
      }];
    }
    
    return post;
  });
};

// 獲取貼文列表
export const getPosts = async (token: string, page: number = 1) => {
  try {
    // 更詳細的日誌輸出
    console.log('開始獲取貼文列表，API路徑:', `${API_URL}/api/posts/posts/?page=${page}`);
    console.log('使用的令牌前10個字元:', token.slice(0, 10) + '...');
    
    // 嘗試從API獲取資料
    const response = await axios.get(`${API_URL}/api/posts/posts/?page=${page}`, {
      headers: { Authorization: `Token ${token}` }
    });
    
    console.log('API 請求成功，返回數據條數:', response.data.results?.length || 0);
    return response.data;
  } catch (error: any) {
    // 改進的錯誤處理邏輯
    console.error('Error fetching posts:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // 檢查是否為401未授權錯誤
      if (error.response.status === 401) {
        console.warn('授權失敗 (401)，使用模擬數據');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    // 返回預先定義的模擬資料格式，與API返回結構保持一致
    console.log('返回模擬數據...');
    return { 
      results: generateMockPosts(15),
      next: page < 3 ? `${API_URL}/api/posts/posts/?page=${page+1}` : null, // 模擬分頁
      previous: page > 1 ? `${API_URL}/api/posts/posts/?page=${page-1}` : null,
      count: 45 // 模擬總數
    };
  }
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
