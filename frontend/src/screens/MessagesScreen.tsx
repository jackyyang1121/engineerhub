// 私訊頁面，處理用戶聊天對話與即時訊息功能
// 設計理念: 簡約、高級、直覺的聊天體驗，參考 Thread 與 Instagram 的設計語言

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  StatusBar,
  Animated,
  Easing,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Alert,
  Dimensions,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, ANIMATION, LAYOUT } from '../theme';
import { getChats } from '../api/messages';  // 引入 API 服務
import { API_URL } from '../config';  // 引入 API URL

const { width } = Dimensions.get('window');
const API_BASE_URL = `${API_URL}/api/private_messages`;

// 定義類型
interface Chat {
  id: number;
  clientId?: string;
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

interface Message {
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

type RootStackParamList = {
  MessagesScreen: undefined;
  ChatScreen: { chatId: number; otherUser: { id: number; username: string; avatar?: string } };
  Profile: { userId: number };
  SearchScreen: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

// 獲取對話者資訊 (聊天中非當前使用者的參與者)
const getOtherParticipant = (chat: Chat, currentUserId: number) => {
  return chat.participants.find(p => p.id !== currentUserId) || chat.participants[0];
};

// 格式化時間的輔助函數
const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return '昨天';
  } else if (new Date().getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return format(date, 'EEEE', { locale: zhTW });
  } else {
    return format(date, 'MM/dd');
  }
};

// 骨架屏組件 - 用於載入中狀態
const ChatSkeleton = ({ index }: { index: number }) => {
  const opacity = useRef(new Animated.Value(0.5)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  return (
    <Animated.View 
      style={[styles.chatItem, { opacity }]} 
      key={`skeleton-${index}-${Date.now()}`}
    >
      <View style={styles.chatAvatarSkeleton} />
      <View style={styles.chatContentSkeleton}>
        <View style={styles.chatNameSkeleton} />
        <View style={styles.chatMessageSkeleton} />
      </View>
      <View style={styles.chatTimeSkeleton} />
    </Animated.View>
  );
};

// 主要私訊頁面組件
const MessagesScreen: React.FC = () => {
  const { token, user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [useMockData, setUseMockData] = useState(true); // 預設使用模擬數據
  
  // 模擬聊天數據 - 僅用於展示，正式開發時可刪除
  const mockChats: Chat[] = useMemo(() => [
    {
      id: 1001,
      participants: [
        { id: 999, username: '設計師小明', avatar: 'https://i.pravatar.cc/150?img=33' },
        { id: user?.id || 1, username: user?.username || 'Me' }
      ],
      last_message: {
        content: '你的設計稿我看過了，非常棒！想約個時間討論細節。',
        created_at: new Date().toISOString(),
        is_read: false
      },
      updated_at: new Date().toISOString(),
      unread_count: 3
    },
    {
      id: 1002,
      participants: [
        { id: 998, username: '工程師大方', avatar: 'https://i.pravatar.cc/150?img=58' },
        { id: user?.id || 1, username: user?.username || 'Me' }
      ],
      last_message: {
        content: '我剛解決了那個 bug，程式碼已經推到 GitHub 上了',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_read: true
      },
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      unread_count: 0
    },
    {
      id: 1003,
      participants: [
        { id: 997, username: '產品經理小華', avatar: 'https://i.pravatar.cc/150?img=41' },
        { id: user?.id || 1, username: user?.username || 'Me' }
      ],
      last_message: {
        content: '下週一要開 sprint planning，你有時間參加嗎？',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: true
      },
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      unread_count: 0
    },
    {
      id: 1004,
      participants: [
        { id: 996, username: '前端大神小玉', avatar: 'https://i.pravatar.cc/150?img=47' },
        { id: user?.id || 1, username: user?.username || 'Me' }
      ],
      last_message: {
        content: 'React 18 的 concurrent mode 真的很強大，你看了嗎？',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: false
      },
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      unread_count: 1
    },
    {
      id: 1005,
      participants: [
        { id: 995, username: '後端專家阿強', avatar: 'https://i.pravatar.cc/150?img=60' },
        { id: user?.id || 1, username: user?.username || 'Me' }
      ],
      last_message: {
        content: '資料庫優化完成了，查詢速度提升了 50%',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: true
      },
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      unread_count: 0
    },
    // 更多假聊天數據
    {
      id: 1006,
      participants: [
        { id: 994, username: 'UI設計師阿良', avatar: 'https://i.pravatar.cc/150?img=12' },
        { id: user?.id || 1, username: user?.username || 'Me' }
      ],
      last_message: {
        content: '新的組件設計已經上傳到 Figma，你有空看一下嗎？',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: true
      },
      updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      unread_count: 0
    },
    {
      id: 1007,
      participants: [
        { id: 993, username: '資安專家小安', avatar: 'https://i.pravatar.cc/150?img=15' },
        { id: user?.id || 1, username: user?.username || 'Me' }
      ],
      last_message: {
        content: '我們需要更新授權邏輯，有發現一些潛在的安全問題',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: true
      },
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      unread_count: 0
    },
    {
      id: 1008,
      participants: [
        { id: 992, username: 'DevOps工程師大雄', avatar: 'https://i.pravatar.cc/150?img=22' },
        { id: user?.id || 1, username: user?.username || 'Me' }
      ],
      last_message: {
        content: 'CI/CD pipeline已經設置好了，現在每次提交都會自動部署',
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: true
      },
      updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      unread_count: 0
    },
    {
      id: 1009,
      participants: [
        { id: 991, username: '數據分析師靜香', avatar: 'https://i.pravatar.cc/150?img=25' },
        { id: user?.id || 1, username: user?.username || 'Me' }
      ],
      last_message: {
        content: '用戶行為分析報告已經完成，發現了一些有趣的使用模式',
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: true
      },
      updated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      unread_count: 0
    },
    {
      id: 1010,
      participants: [
        { id: 990, username: '技術總監胖虎', avatar: 'https://i.pravatar.cc/150?img=28' },
        { id: user?.id || 1, username: user?.username || 'Me' }
      ],
      last_message: {
        content: '下週要開技術評審會議，請準備好你負責的部分',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: true
      },
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      unread_count: 0
    },
    {
      id: 1011,
      participants: [
        { id: 989, username: 'QA測試工程師小夢', avatar: 'https://i.pravatar.cc/150?img=29' },
        { id: user?.id || 1, username: user?.username || 'Me' }
      ],
      last_message: {
        content: '最新版本的測試已完成，發現了幾個邊界條件的問題',
        created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: false
      },
      updated_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      unread_count: 2
    },
    {
      id: 1012,
      participants: [
        { id: 988, username: '創業投資人小李', avatar: 'https://i.pravatar.cc/150?img=32' },
        { id: user?.id || 1, username: user?.username || 'Me' }
      ],
      last_message: {
        content: '你的創業計畫書很有潛力，我們可以約時間詳談',
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: true
      },
      updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      unread_count: 0
    }
  ], [user]);
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 记录已挂载状态以避免内存泄漏
  const isMounted = useRef(true);
  // 创建不可变的key集合
  const stableKeys = useRef(new Map<number, string>()).current;
  
  // 滾動動畫
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 30, 60],
    outputRange: [0, 0.7, 1],
    extrapolate: 'clamp',
  });
  
  // 确保组件卸载时清理
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // 立即在組件掛載時設置模擬數據
  useEffect(() => {
    console.log('組件掛載，初始化...');
    if (useMockData && mockChats.length > 0) {
      console.log(`發現 ${mockChats.length} 條模擬聊天數據`);
      const initialChats = mockChats.map(chat => ({
        ...chat,
        clientId: `chat-${chat.id}-${Date.now()}`
      }));
      setChats(initialChats);
      setLoading(false);
      console.log('初始模擬數據已設置完成');
    }
  }, [mockChats, useMockData]);
  
  // When the component mounts, immediately set up chats and force a refresh
  useEffect(() => {
    console.log('初始化聊天界面...');
    fetchChats();
    
    // Debug logs
    console.log('用戶信息:', user);
    console.log('模擬數據模式:', useMockData ? '開啟' : '關閉');
  }, []);
  
  // 生成稳定的键值
  const getStableKey = useCallback((id: number) => {
    if (!stableKeys.has(id)) {
      stableKeys.set(id, `chat-${id}-${Date.now()}`);
    }
    return stableKeys.get(id) as string;
  }, [stableKeys]);
  
  // 獲取聊天室列表
  const fetchChats = useCallback(async (showRefresh = false) => {
    console.log('fetchChats 被調用, useMockData =', useMockData);
    
    if (showRefresh) {
      setRefreshing(true);
    } else if (!refreshing) {
      setLoading(true);
    }
    
    // 處理模擬數據
    const getProcessedMockChats = () => {
      console.log('生成模擬聊天數據...');
      return mockChats.map(chat => ({
        ...chat,
        clientId: getStableKey(chat.id)
      }));
    };
    
    // 如果使用模擬數據，直接返回
    if (useMockData) {
      console.log('使用模擬數據模式');
      const processedMockChats = getProcessedMockChats();
      console.log(`處理了 ${processedMockChats.length} 條模擬對話`);
      
      setChats(processedMockChats);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    // 如果不使用模擬數據，嘗試 API 請求
    try {
      console.log('嘗試從 API 獲取聊天列表...');
      console.log('API路徑:', `${API_BASE_URL}/chats/`);
      
      // 建立請求
      const response = await axios.get(`${API_BASE_URL}/chats/`, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API請求成功，狀態碼:', response.status);
      
      if (isMounted.current) {
        if (response.data && Array.isArray(response.data)) {
          console.log(`收到 ${response.data.length} 條聊天記錄`);
          const processedChats = response.data.map((chat: any) => ({
            ...chat,
            clientId: getStableKey(chat.id)
          }));
          
          setChats(processedChats);
          setError(null);
        } else {
          console.warn('API返回格式不符預期，使用模擬數據');
          setChats(getProcessedMockChats());
          setError('API返回格式不符預期，使用模擬數據');
        }
      }
    } catch (err: any) {
      console.error('獲取聊天室失敗:', err.message);
      
      // 詳細的錯誤日誌
      if (err.response) {
        console.error('錯誤響應狀態:', err.response.status);
      }
      
      if (isMounted.current) {
        // 使用模擬數據作為後備
        console.log('因API請求失敗，使用模擬數據');
        setChats(getProcessedMockChats());
        setError('無法連接到伺服器，顯示模擬數據');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [token, refreshing, useMockData, mockChats, getStableKey]);
  
  // 當模擬數據狀態變化時重新加載
  useEffect(() => {
    console.log('模擬數據狀態變化:', useMockData ? '啟用' : '禁用');
    fetchChats();
    
    // 顯示切換提示
    if (isMounted.current) {
      const message = useMockData 
        ? '已切換到模擬數據模式' 
        : '已切換到真實 API 模式';
      setError(message);
      
      // 3秒後清除提示
      setTimeout(() => {
        if (isMounted.current) {
          setError(null);
        }
      }, 3000);
    }
  }, [useMockData, fetchChats]);
  
  // 處理下拉刷新
  const handleRefresh = useCallback(() => {
    fetchChats(true);
  }, [fetchChats]);
  
  // 使用memo缓存骨架屏组件，避免重复渲染
  const skeletonItems = useMemo(() => {
    const items = [];
    for (let i = 0; i < 5; i++) {
      items.push(
        <ChatSkeleton key={`skeleton-${i}`} index={i} />
      );
    }
    return items;
  }, []);
  
  // 渲染聊天項目 - 使用useCallback优化性能
  const renderChatItem = useCallback(({ item }: { item: Chat }) => {
    // 確保有用戶且有其他參與者
    const otherUser = item.participants.find(p => p.id !== (user?.id || 0)) || item.participants[0];
    const hasUnread = item.unread_count > 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        activeOpacity={0.7}
        onPress={() => {
          // 導航到聊天室詳情頁面，確保帶上必要的參數
          console.log("導航到聊天室:", item.id, otherUser);
          navigation.navigate('ChatScreen', { 
            chatId: item.id, 
            otherUser: {
              id: otherUser.id,
              username: otherUser.username,
              avatar: otherUser.avatar || `https://i.pravatar.cc/150?img=${10 + (item.id % 30)}`
            }
          });
        }}
      >
        {/* 頭像 */}
        <View style={styles.chatAvatarContainer}>
          <Image
            source={{ uri: otherUser.avatar || `https://i.pravatar.cc/150?img=${10 + (item.id % 30)}` }}
            style={styles.chatAvatar}
          />
          {Math.random() > 0.5 && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        
        {/* 聊天內容 */}
        <View style={styles.chatContent}>
          <Text style={styles.chatName} numberOfLines={1}>
            {otherUser.username}
          </Text>
          
          <View style={styles.lastMessageRow}>
            <Text
              style={[
                styles.lastMessage,
                hasUnread && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {item.last_message?.content || '開始新對話吧！'}
            </Text>
            
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unread_count > 99 ? '99+' : item.unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* 時間與狀態 */}
        <View style={styles.chatMeta}>
          <Text style={styles.chatTime}>
            {item.last_message
              ? formatMessageTime(item.last_message.created_at)
              : formatMessageTime(item.updated_at)}
          </Text>
          
          {item.last_message && (
            <View style={styles.messageStatus}>
              {item.last_message.is_read ? (
                <Ionicons name="checkmark-done" size={16} color={COLORS.accent} />
              ) : (
                <Ionicons name="checkmark" size={16} color={COLORS.subText} />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [user, navigation]);
  
  // 使用memo缓存空列表状态，避免重复渲染
  const emptyListComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="chatbubble-ellipses-outline" size={60} color={`${COLORS.accent}50`} />
      </View>
      <Text style={styles.emptyTitle}>還沒有對話</Text>
      <Text style={styles.emptySubtitle}>
        開始與其他開發者交流想法與經驗
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        activeOpacity={0.8}
        onPress={() => {
          // 導航到搜尋頁面或主頁
          navigation.navigate('SearchScreen');
        }}
      >
        <Text style={styles.emptyButtonText}>發現用戶</Text>
      </TouchableOpacity>
    </View>
  ), [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* 頭部導航欄 */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>訊息</Text>
          </View>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              Alert.alert('搜尋訊息', '搜尋訊息功能將在後續版本推出');
            }}
          >
            <Ionicons name="search-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 主要內容區 */}
      <View style={styles.mainContainer}>
        {/* 聊天列表 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            {skeletonItems}
          </View>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => `chat-${item.id}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={emptyListComponent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.accent}
                colors={[COLORS.accent]}
                progressBackgroundColor={COLORS.card}
              />
            }
          />
        )}
      </View>
      
      {/* 新建訊息浮動按鈕 */}
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.7}
        onPress={() => {
          Alert.alert('新訊息', '選擇聯絡人的功能將在後續版本推出');
        }}
      >
        <Ionicons name="create-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// 樣式定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.divider,
    paddingBottom: SPACING.sm,
  },
  headerContent: {
    height: LAYOUT.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  headerTitleContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.xl,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  mainContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  listContent: {
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.card,
    ...SHADOW.sm,
  },
  chatAvatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.elevated,
    borderWidth: 1.5,
    borderColor: `${COLORS.accent}30`,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  chatContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  chatName: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: 4,
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    flex: 1,
  },
  unreadMessage: {
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  unreadBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: SPACING.xs,
  },
  unreadCount: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.primary,
  },
  chatMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 40,
  },
  chatTime: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xxs,
    color: COLORS.subText,
    marginBottom: 4,
  },
  messageStatus: {
    height: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.elevated}80`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    ...SHADOW.md,
  },
  emptyButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.primary,
  },
  chatAvatarSkeleton: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.elevated,
    marginRight: SPACING.md,
  },
  chatContentSkeleton: {
    flex: 1,
  },
  chatNameSkeleton: {
    width: '60%',
    height: 16,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.xs,
    marginBottom: 8,
  },
  chatMessageSkeleton: {
    width: '80%',
    height: 14,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.xs,
  },
  chatTimeSkeleton: {
    width: 32,
    height: 12,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.xs,
  },
});

export default MessagesScreen; 