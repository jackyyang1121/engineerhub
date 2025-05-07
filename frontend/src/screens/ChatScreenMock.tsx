// 聊天頁面模擬數據生成器

import { format } from 'date-fns';

// 定義訊息類型
export interface MockMessage {
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

// 建立緩存系統，確保同一個聊天室在不同頁面使用相同的模擬數據
const mockMessagesCache: Record<string, MockMessage[]> = {};

// 專業開發相關對話內容模板
const CONVERSATION_TEMPLATES = [
  // React Native討論
  [
    { sender: 'other', content: "你好，聽說你在找React Native開發者？" },
    { sender: 'user', content: "是的，我們團隊正在開發一個跨平台應用" },
    { sender: 'other', content: "太好了，我有3年RN經驗。你們的項目用了哪些主要技術棧？" },
    { sender: 'user', content: "我們使用TypeScript、Redux和Styled Components" },
    { sender: 'other', content: "很適合我，我之前的項目也是用這些技術" },
    { sender: 'user', content: "太棒了！你有時間討論一下細節嗎？" },
    { sender: 'other', content: "當然，我們可以安排視訊會議" },
  ],
  
  // UI設計討論
  [
    { sender: 'other', content: "嗨，看到你分享的UI設計很棒！" },
    { sender: 'user', content: "謝謝！那是我最近的一個作品" },
    { sender: 'other', content: "你用什麼工具做設計？Figma？" },
    { sender: 'user', content: "對，主要用Figma，有時候也用Sketch" },
    { sender: 'other', content: "我正在尋找一個設計師合作開發一個金融App" },
    { sender: 'user', content: "聽起來很有趣，可以分享更多細節嗎？" },
    { sender: 'other', content: "當然，這是針對年輕投資者的理財應用..." },
  ],
  
  // 後端技術討論
  [
    { sender: 'other', content: "你好，看到你在技術論壇分享的Node.js優化經驗很棒" },
    { sender: 'user', content: "謝謝！那是我們團隊最近處理高流量API的實踐" },
    { sender: 'other', content: "我們正面臨類似問題，特別是數據庫查詢優化方面" },
    { sender: 'user', content: "MongoDB還是MySQL？不同數據庫優化方向差很多" },
    { sender: 'other', content: "我們用的是PostgreSQL，主要是復雜查詢效能問題" },
    { sender: 'user', content: "PostgreSQL是個好選擇，我可以分享一些查詢優化的經驗" },
    { sender: 'other', content: "太感謝了，這正是我們需要的！" },
  ],
  
  // 求職相關
  [
    { sender: 'other', content: "你好，看到你在LinkedIn上的資料，我們公司正在招資深前端工程師" },
    { sender: 'user', content: "你好，感謝關注。我對新機會持開放態度" },
    { sender: 'other', content: "我們是一家健康科技新創，正在開發用戶分析平台" },
    { sender: 'user', content: "聽起來很有挑戰性，你們的技術方向是？" },
    { sender: 'other', content: "主要是React生態系，後端是Node.js和GraphQL" },
    { sender: 'user', content: "正好是我的專長領域，可以分享更多職位細節嗎？" },
    { sender: 'other', content: "當然，我會發職位說明給你，什麼時間方便面談？" },
  ],
];

// 為特定聊天ID生成確定性的對話內容
const PREDEFINED_CONVERSATIONS: Record<number, {template: number, lastMessage: string, additionalMessages?: {sender: 'user' | 'other', content: string}[]}> = {
  1001: { 
    template: 0, 
    lastMessage: "你的設計稿我看過了，非常棒！想約個時間討論細節。",
    additionalMessages: [
      { sender: 'other', content: "嗨，我是設計師小明" },
      { sender: 'user', content: "你好小明，很高興認識你" },
      { sender: 'other', content: "我們團隊最近需要UI/UX設計師" },
      { sender: 'user', content: "正好，我最近完成了幾個設計項目" },
      { sender: 'other', content: "太好了，你能分享一下你的作品集嗎？" },
      { sender: 'user', content: "當然，我已經發了連結給你" },
      { sender: 'other', content: "收到了，我會盡快查看" },
      { sender: 'other', content: "你的設計稿我看過了，非常棒！想約個時間討論細節。" }
    ]
  },
  1002: { 
    template: 2, 
    lastMessage: "我剛解決了那個 bug，程式碼已經推到 GitHub 上了",
    additionalMessages: [
      { sender: 'other', content: "我們應用中的搜索功能有些問題" },
      { sender: 'user', content: "是查詢效能問題嗎？" },
      { sender: 'other', content: "對，特別是在大數據量時" }
    ]
  },
  1003: { 
    template: 3, 
    lastMessage: "下週一要開 sprint planning，你有時間參加嗎？",
    additionalMessages: [
      { sender: 'other', content: "我們需要討論下一個迭代的功能優先級" },
      { sender: 'user', content: "好的，我已經準備好了需求列表" }
    ]
  },
  1004: { 
    template: 0, 
    lastMessage: "React 18 的 concurrent mode 真的很強大，你看了嗎？",
    additionalMessages: [
      { sender: 'other', content: "嘿，你有關注最新的React更新嗎？" },
      { sender: 'user', content: "有的，但還沒機會深入研究" }
    ]
  },
  1005: { template: 2, lastMessage: "資料庫優化完成了，查詢速度提升了 50%" },
  1006: { template: 1, lastMessage: "新的組件設計已經上傳到 Figma，你有空看一下嗎？" },
  1007: { template: 2, lastMessage: "我們需要更新授權邏輯，有發現一些潛在的安全問題" },
  1008: { template: 2, lastMessage: "CI/CD pipeline已經設置好了，現在每次提交都會自動部署" },
  1009: { template: 2, lastMessage: "用戶行為分析報告已經完成，發現了一些有趣的使用模式" },
  1010: { template: 3, lastMessage: "下週要開技術評審會議，請準備好你負責的部分" },
  1011: { template: 0, lastMessage: "最新版本的測試已完成，發現了幾個邊界條件的問題" },
  1012: { template: 3, lastMessage: "你的創業計畫書很有潛力，我們可以約時間詳談" },
};

/**
 * 生成模擬聊天訊息
 * @param user 當前用戶
 * @param otherUser 對話對象
 * @param chatId 聊天室ID
 * @param count 訊息數量
 * @returns 模擬訊息列表
 */
export function generateMockMessages(
  user: { id: number; username: string; avatar?: string },
  otherUser: { id: number; username: string; avatar?: string },
  chatId: number = 0,
  count = 10
): MockMessage[] {
  // 檢查緩存中是否已存在該聊天室的訊息
  const cacheKey = `chat_${chatId}_${otherUser.id}`;
  if (mockMessagesCache[cacheKey] && mockMessagesCache[cacheKey].length > 0) {
    console.log('使用緩存的模擬訊息:', cacheKey);
    return mockMessagesCache[cacheKey];
  }
  
  // 確定使用哪個模板 - 對於已知的聊天ID，使用預定義的模板
  let templateIndex = Math.floor(Math.random() * CONVERSATION_TEMPLATES.length);
  let lastMessageOverride = '';
  let additionalMessages: {sender: 'user' | 'other', content: string}[] | undefined;
  
  if (PREDEFINED_CONVERSATIONS[chatId]) {
    templateIndex = PREDEFINED_CONVERSATIONS[chatId].template;
    lastMessageOverride = PREDEFINED_CONVERSATIONS[chatId].lastMessage;
    additionalMessages = PREDEFINED_CONVERSATIONS[chatId].additionalMessages;
  }
  
  const template = CONVERSATION_TEMPLATES[templateIndex];
  const messages: MockMessage[] = [];
  const now = new Date();
  
  // 創建基於時間的訊息
  for (let i = 0; i < Math.min(template.length, count); i++) {
    const entry = template[i];
    const timeOffset = (template.length - i) * (10 * 60 * 1000); // 每條訊息間隔10分鐘
    const messageDate = new Date(now.getTime() - timeOffset);
    
    const sender = entry.sender === 'user' ? user : otherUser;
    
    messages.push({
      id: Date.now() - i,
      sender: {
        id: sender.id,
        username: sender.username,
        avatar: sender.avatar
      },
      content: entry.content,
      created_at: messageDate.toISOString(),
      is_read: true
    });
  }
  
  // 添加額外的預設消息（如果有設定）
  if (additionalMessages && additionalMessages.length > 0) {
    console.log(`為聊天室 ${chatId} 添加 ${additionalMessages.length} 條額外預設消息`);
    
    for (let i = 0; i < additionalMessages.length; i++) {
      const entry = additionalMessages[i];
      // 額外消息的時間比模板消息更近
      const timeOffset = (additionalMessages.length - i) * (5 * 60 * 1000); // 每條額外訊息間隔5分鐘
      const messageDate = new Date(now.getTime() - timeOffset - 1000); // 確保比最後的消息早一點
      
      const sender = entry.sender === 'user' ? user : otherUser;
      
      // 確保最後一條消息不重複添加
      const isLastMessage = entry.content === lastMessageOverride && 
                           sender.id === otherUser.id &&
                           i === additionalMessages.length - 1;
      
      if (!isLastMessage || !messages.some(msg => msg.content === entry.content)) {
        messages.push({
          id: Date.now() - 10000 - i,
          sender: {
            id: sender.id,
            username: sender.username,
            avatar: sender.avatar
          },
          content: entry.content,
          created_at: messageDate.toISOString(),
          is_read: true
        });
      }
    }
    
    // 對消息按時間排序
    messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  
  // 添加預設的最後一條訊息（如果有設定）
  if (lastMessageOverride && chatId in PREDEFINED_CONVERSATIONS) {
    // 確保最後一條訊息在聊天室中顯示，無論是否已經存在於模板中
    // 檢查這條訊息是否已經存在於消息列表中
    const lastMessageExists = messages.some(msg => 
      msg.sender.id === otherUser.id && msg.content === lastMessageOverride
    );
    
    if (!lastMessageExists) {
      // 如果不存在，則添加這條訊息
      const newMessage: MockMessage = {
        id: Date.now() + 1000,
        sender: {
          id: otherUser.id,
          username: otherUser.username,
          avatar: otherUser.avatar
        },
        content: lastMessageOverride,
        created_at: new Date().toISOString(),
        is_read: false
      };
      
      messages.push(newMessage);
      console.log(`已添加最後一條預設訊息: "${lastMessageOverride}" 到聊天室 ${chatId}`);
    }
  }
  
  // 最後一條訊息可能未讀
  if (messages.length > 0 && messages[messages.length - 1].sender.id === otherUser.id) {
    messages[messages.length - 1].is_read = false;
  }
  
  // 保存到緩存
  mockMessagesCache[cacheKey] = messages;
  
  return messages;
}

/**
 * 生成隨機訊息
 * @param sender 發送者
 * @returns 隨機訊息內容
 */
export function generateRandomMessage(sender: { id: number; username: string; avatar?: string }): MockMessage {
  const randomMessages = [
    "你最近在忙什麼項目？",
    "我剛看了你的作品集，非常不錯！",
    "有沒有興趣參與一個開源項目？",
    "下週有技術研討會，你有興趣參加嗎？",
    "你用過最新版的React了嗎？效能提升很明顯",
    "推薦一個設計工具給你，最近發現很好用",
    "有沒有推薦的技術學習資源？",
    "我們可以討論一下這個技術方案嗎？"
  ];
  
  return {
    id: Date.now(),
    sender: {
      id: sender.id,
      username: sender.username,
      avatar: sender.avatar
    },
    content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
    created_at: new Date().toISOString(),
    is_read: false
  };
}

/**
 * 添加訊息到特定聊天室的緩存
 * @param chatId 聊天室ID
 * @param otherUserId 對方用戶ID
 * @param message 要添加的訊息
 */
export function addMessageToCache(
  chatId: number, 
  otherUserId: number, 
  message: MockMessage
): void {
  const cacheKey = `chat_${chatId}_${otherUserId}`;
  if (!mockMessagesCache[cacheKey]) {
    mockMessagesCache[cacheKey] = [];
  }
  
  mockMessagesCache[cacheKey].push(message);
}

/**
 * 獲取聊天緩存
 */
export function getMockMessageCache(): Record<string, MockMessage[]> {
  return mockMessagesCache;
}

/**
 * 清除指定聊天室的緩存，用於測試
 * @param chatId 聊天室ID
 * @param otherUserId 對方用戶ID
 */
export function clearChatCache(chatId: number, otherUserId: number): void {
  const cacheKey = `chat_${chatId}_${otherUserId}`;
  if (mockMessagesCache[cacheKey]) {
    delete mockMessagesCache[cacheKey];
    console.log(`已清除聊天室 ${chatId} 的緩存數據`);
  }
}

/**
 * 初始化聊天緩存，確保在進入聊天室前已有對應的消息數據
 * @param user 當前用戶
 * @param otherUser 對話對象
 * @param chatId 聊天室ID
 */
export function initializeChatCache(
  user: { id: number; username: string; avatar?: string },
  otherUser: { id: number; username: string; avatar?: string },
  chatId: number
): void {
  const cacheKey = `chat_${chatId}_${otherUser.id}`;
  
  // 檢查是否已有緩存
  if (!mockMessagesCache[cacheKey] || mockMessagesCache[cacheKey].length === 0) {
    console.log(`為聊天室 ${chatId} 初始化緩存數據`);
    
    // 生成模擬數據並保存到緩存
    generateMockMessages(user, otherUser, chatId, 15);
    console.log(`已為聊天室 ${chatId} 創建緩存，包含 ${mockMessagesCache[cacheKey]?.length || 0} 條消息`);
  }
} 