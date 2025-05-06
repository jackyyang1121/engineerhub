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

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://10.0.2.2:8000/api/private_messages';

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
    <Animated.View style={[styles.chatItem, { opacity }]} key={`skeleton-${index}-${Date.now()}`}>
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
  
  // 生成稳定的键值
  const getStableKey = useCallback((id: number) => {
    if (!stableKeys.has(id)) {
      stableKeys.set(id, `chat-${id}-${Date.now()}`);
    }
    return stableKeys.get(id) as string;
  }, [stableKeys]);
  
  // 獲取聊天室列表
  const fetchChats = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else if (!refreshing) {
      setLoading(true);
    }
    
    try {
      // MOCK DATA: 在此使用模擬數據替代 API 請求
      // const data = await getChats(token);
      
      // 使用setTimeout模拟网络请求
      const timeoutId = setTimeout(() => {
        if (isMounted.current) {
          // 为每个chat分配一个稳定的key
          const processedChats = mockChats.map(chat => ({
            ...chat,
            clientId: getStableKey(chat.id)
          }));
          
          setChats(processedChats);
          setError(null);
          setLoading(false);
          setRefreshing(false);
        }
      }, 800); // 模擬網絡延遲
      
      // 清理函数
      return () => clearTimeout(timeoutId);
    } catch (err) {
      console.error('獲取聊天室失敗:', err);
      if (isMounted.current) {
        setError('無法載入聊天列表，請檢查網路連接並重試');
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [token, refreshing, mockChats, getStableKey]);
  
  // 初始載入和清理
  useEffect(() => {
    const controller = new AbortController();
    fetchChats();
    return () => {
      controller.abort();
    };
  }, [fetchChats]);
  
  // 處理下拉刷新
  const handleRefresh = useCallback(() => {
    fetchChats(true);
  }, [fetchChats]);
  
  // 前往特定聊天室
  const handleChatPress = useCallback((chat: Chat) => {
    if (!user) return;
    
    const otherUser = getOtherParticipant(chat, user.id);
    navigation.navigate('ChatScreen', { 
      chatId: chat.id, 
      otherUser: otherUser
    });
  }, [navigation, user]);
  
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
    if (!user) return null;
    
    const otherUser = getOtherParticipant(item, user.id);
    const hasUnread = item.unread_count > 0;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.chatItem,
          pressed && styles.chatItemPressed
        ]}
        onPress={() => handleChatPress(item)}
        android_ripple={{ color: COLORS.ripple }}
      >
        {/* 頭像 */}
        <View style={styles.chatAvatarContainer}>
          <Image
            source={
              otherUser.avatar
                ? { uri: otherUser.avatar }
                : { uri: `https://ui-avatars.com/api/?name=${otherUser.username}&background=random&color=fff&size=100` }
            }
            style={styles.chatAvatar}
          />
          {/* 線上狀態指示器 - 這裡可根據後端添加實際在線狀態 */}
          {Math.random() > 0.7 && (
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
              {item.last_message?.content || '開始對話吧！'}
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
      </Pressable>
    );
  }, [user, handleChatPress]);
  
  // 使用memo缓存空列表状态，避免重复渲染
  const emptyListComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-ellipses-outline" size={60} color={COLORS.subText} />
      <Text style={styles.emptyTitle}>還沒有任何對話</Text>
      <Text style={styles.emptySubtitle}>
        開始與其他用戶交流想法與經驗
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        activeOpacity={0.8}
        onPress={() => {
          // 可導航到發現用戶頁面
          Alert.alert('發現用戶', '發現用戶功能將在後續版本推出');
        }}
      >
        <Text style={styles.emptyButtonText}>發現用戶</Text>
      </TouchableOpacity>
    </View>
  ), []);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* 頭部導航欄 */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            shadowOpacity: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.2],
            }),
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>訊息</Text>
            <View style={styles.headerSubtitleContainer}>
              <Text style={styles.headerSubtitle}>
                {chats.length > 0 ? `${chats.length} 個對話` : ''}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              // 這裡可導航到搜尋訊息頁面
              Alert.alert('搜尋訊息', '搜尋訊息功能將在後續版本推出');
            }}
          >
            <Ionicons name="search-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* 聊天列表 */}
      {loading && !refreshing ? (
        <Animated.View style={styles.loadingContainer}>
          {skeletonItems}
        </Animated.View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={item => item.clientId || `chat-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={emptyListComponent}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10} 
          removeClippedSubviews={Platform.OS === 'android'}
          getItemLayout={(data, index) => ({
            length: 84, // 固定高度
            offset: 84 * index,
            index,
          })}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
              progressBackgroundColor={COLORS.card}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      )}
      
      {/* 錯誤提示 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchChats()}
          >
            <Text style={styles.retryButtonText}>重試</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* 新建訊息浮動按鈕 */}
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.9}
        onPress={() => {
          // 這裡可導航到選擇聯絡人頁面
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    ...SHADOW.sm,
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
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xs,
    color: COLORS.subText,
    marginTop: 2,
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
  loadingContainer: {
    flex: 1,
    paddingTop: LAYOUT.headerHeight + SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  listContent: {
    paddingTop: LAYOUT.headerHeight + SPACING.md,
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
  chatItemPressed: {
    backgroundColor: COLORS.elevated,
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
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    ...SHADOW.md,
  },
  emptyButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.primary,
  },
  errorContainer: {
    position: 'absolute',
    bottom: SPACING.xxl,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: `${COLORS.error}22`,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOW.md,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.error,
    flex: 1,
  },
  retryButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  retryButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.xs,
    color: COLORS.background,
  },
  // 骨架屏樣式
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