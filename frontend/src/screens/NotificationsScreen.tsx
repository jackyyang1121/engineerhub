// src/screens/NotificationsScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
  Dimensions,
  Platform,
  Pressable
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, LAYOUT, ANIMATION } from '../theme';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types/navigation';

// 定義導航屬性類型
type NavigationProp = StackNavigationProp<RootStackParamList>;

// 獲取螢幕寬度
const { width } = Dimensions.get('window');

// 定義通知型別
interface Notification {
  id: number;
  type: 
    | 'follow' 
    | 'like' 
    | 'comment' 
    | 'follow_request_received' 
    | 'follow_request_sent'
    | 'follow_accepted';
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
  content?: string;
  post_id?: number;
  request_status?: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  is_read: boolean;
}

// 骨架屏組件 - 用於載入中狀態
const NotificationSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.notificationItem, { opacity: pulseAnim }]}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonText} />
        <View style={styles.skeletonTime} />
      </View>
      <View style={styles.skeletonAction} />
    </Animated.View>
  );
};

// 主要通知頁面組件
const NotificationsScreen: React.FC = () => {
  const { token, user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 用於頭部動畫
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 30, 60],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp',
  });
  
  // 獲取通知列表
  const fetchNotifications = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else if (!refreshing) {
      setLoading(true);
    }
    
    try {
      if (!token) return;
      
      const response = await axios.get('http://10.0.2.2:8000/api/notifications/notifications/', {
        headers: { Authorization: `Token ${token}` },
      });
      
      // 模擬包含所有新通知類型的資料，實際應該由後端返回
      const mockData: Notification[] = [
        {
          id: 1,
          type: 'follow_request_received',
          user: {
            id: 101,
            username: 'developer123',
            avatar: 'https://ui-avatars.com/api/?name=D&background=random'
          },
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: false
        },
        {
          id: 2,
          type: 'follow_request_sent',
          user: {
            id: 102,
            username: 'designer456',
            avatar: 'https://ui-avatars.com/api/?name=U&background=random'
          },
          request_status: 'pending',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          is_read: true
        },
        {
          id: 3,
          type: 'follow_request_sent',
          user: {
            id: 103,
            username: 'product789',
            avatar: 'https://ui-avatars.com/api/?name=P&background=random'
          },
          request_status: 'accepted',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          is_read: true
        },
        {
          id: 4,
          type: 'like',
          user: {
            id: 104,
            username: 'techfan101',
            avatar: 'https://ui-avatars.com/api/?name=T&background=random'
          },
          post_id: 201,
          created_at: new Date(Date.now() - 10800000).toISOString(),
          is_read: false
        },
        {
          id: 5,
          type: 'comment',
          user: {
            id: 105,
            username: 'coder202',
            avatar: 'https://ui-avatars.com/api/?name=C&background=random'
          },
          post_id: 201,
          content: '這個專案看起來很棒！想了解更多詳情。',
          created_at: new Date(Date.now() - 14400000).toISOString(),
          is_read: false
        },
        {
          id: 6,
          type: 'follow',
          user: {
            id: 106,
            username: 'newuser303',
            avatar: 'https://ui-avatars.com/api/?name=N&background=random'
          },
          created_at: new Date(Date.now() - 172800000).toISOString(),
          is_read: true
        },
        {
          id: 7,
          type: 'follow_accepted',
          user: {
            id: 107,
            username: 'senior_dev',
            avatar: 'https://ui-avatars.com/api/?name=S&background=random'
          },
          created_at: new Date(Date.now() - 259200000).toISOString(),
          is_read: true
        }
      ];
      
      // 實際應用中應使用 response.data，這裡為了展示所有類型用模擬資料
      setNotifications(mockData);
      setError(null);
    } catch (err) {
      console.error('獲取通知失敗:', err);
      setError('無法載入通知，請檢查網路連接並重試');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, refreshing]);
  
  // 初始載入
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token, fetchNotifications]);
  
  // 處理下拉刷新
  const handleRefresh = () => {
    fetchNotifications(true);
  };
  
  // 處理追蹤按鈕點擊
  const handleFollow = async (userId: number) => {
    try {
      await axios.post(`http://10.0.2.2:8000/api/users/follow/${userId}/`, {}, {
        headers: { Authorization: `Token ${token}` },
      });
      
      // 更新UI狀態以反映追蹤成功
      setNotifications(prev => 
        prev.map(notification => 
          notification.user.id === userId && notification.type === 'follow_request_received'
            ? { ...notification, type: 'follow' as const }
            : notification
        )
      );
      
      // 顯示成功提示
      Alert.alert('成功', '已成功追蹤此用戶');
    } catch (err) {
      console.error('追蹤失敗:', err);
      Alert.alert('錯誤', '追蹤失敗，請稍後再試');
    }
  };
  
  // 處理接受追蹤請求
  const handleAcceptRequest = async (userId: number, notificationId: number) => {
    try {
      // 實際應用需要發送接受請求的API
      await axios.post(`http://10.0.2.2:8000/api/users/accept_follow/${userId}/`, {}, {
        headers: { Authorization: `Token ${token}` },
      });
      
      // 更新UI狀態以反映接受成功
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId
            ? { ...notification, type: 'follow' as const }
            : notification
        )
      );
    } catch (err) {
      console.error('接受追蹤請求失敗:', err);
      Alert.alert('錯誤', '無法接受追蹤請求，請稍後再試');
    }
  };
  
  // 處理拒絕追蹤請求
  const handleRejectRequest = async (userId: number, notificationId: number) => {
    try {
      // 實際應用需要發送拒絕請求的API
      await axios.post(`http://10.0.2.2:8000/api/users/reject_follow/${userId}/`, {}, {
        headers: { Authorization: `Token ${token}` },
      });
      
      // 從列表中移除此通知
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      } catch (err) {
      console.error('拒絕追蹤請求失敗:', err);
      Alert.alert('錯誤', '無法拒絕追蹤請求，請稍後再試');
    }
  };
  
  // 處理通知點擊
  const handleNotificationPress = (notification: Notification) => {
    // 將通知標記為已讀
    setNotifications(prev => 
      prev.map(item => 
        item.id === notification.id
          ? { ...item, is_read: true }
          : item
      )
    );
    
    // 根據通知類型導航到對應頁面
    switch (notification.type) {
      case 'follow':
      case 'follow_request_received':
      case 'follow_request_sent':
      case 'follow_accepted':
        // 導航到該用戶的個人檔案
        navigation.navigate('Profile', { userId: notification.user.id });
        break;
      case 'like':
      case 'comment':
        if (notification.post_id) {
          // 導航到該貼文詳情
          navigation.navigate('PostDetail', { postId: notification.post_id });
        }
        break;
    }
  };
  
  // 格式化通知時間
  const formatNotificationTime = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: zhTW 
      });
    } catch {
      return '剛剛';
    }
  };
  
  // 獲取通知圖標
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'follow':
        return <Ionicons name="person-add" size={18} color={COLORS.accent} />;
      case 'follow_accepted':
        return <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />;
      case 'follow_request_received':
        return <Ionicons name="person-add" size={18} color={COLORS.warning} />;
      case 'follow_request_sent':
        return <Ionicons name="paper-plane" size={18} color={COLORS.accent} />;
      case 'like':
        return <Ionicons name="heart" size={18} color={COLORS.error} />;
      case 'comment':
        return <Ionicons name="chatbubble" size={18} color={COLORS.highlight} />;
      default:
        return <Ionicons name="notifications" size={18} color={COLORS.accent} />;
    }
  };
  
  // 獲取通知文字描述
  const getNotificationText = (notification: Notification): string => {
    switch (notification.type) {
      case 'follow':
        return '開始追蹤你';
      case 'follow_accepted':
        return '接受了你的追蹤請求';
      case 'follow_request_received':
        return '請求追蹤你';
      case 'follow_request_sent':
        return notification.request_status === 'pending' 
          ? '你發送了追蹤請求' 
          : '接受了你的追蹤請求';
      case 'like':
        return '喜歡了你的貼文';
      case 'comment':
        return '在你的貼文留言';
      default:
        return '';
    }
  };
  
  // 渲染通知項目
  const renderNotificationItem = ({ item }: { item: Notification }) => {
  return (
      <Pressable
        style={({ pressed }) => [
          styles.notificationItem,
          !item.is_read && styles.unreadNotification,
          pressed && styles.notificationItemPressed
        ]}
        onPress={() => handleNotificationPress(item)}
        android_ripple={{ color: COLORS.ripple, borderless: false }}
      >
        {/* 用戶頭像 */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('Profile', { userId: item.user.id })}
        >
          <Image
            source={{ 
              uri: item.user.avatar || `https://ui-avatars.com/api/?name=${item.user.username.charAt(0)}&background=random&color=fff&size=100` 
            }}
            style={styles.avatar}
          />
          <View style={styles.iconBadge}>
            {getNotificationIcon(item.type)}
          </View>
        </TouchableOpacity>
        
        {/* 通知內容 */}
        <View style={styles.contentContainer}>
          <View style={styles.contentHeader}>
            <Text style={styles.username} numberOfLines={1}>
              {item.user.username}
            </Text>
            <Text style={styles.time}>{formatNotificationTime(item.created_at)}</Text>
          </View>
          
          <Text style={styles.notificationText}>
            {getNotificationText(item)}
          </Text>
          
          {item.content && (
            <Text style={styles.commentContent} numberOfLines={2}>
              "{item.content}"
            </Text>
          )}
          
          {/* 追蹤請求相關操作按鈕 */}
          {item.type === 'follow_request_received' && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAcceptRequest(item.user.id, item.id)}
              >
                <Text style={styles.acceptButtonText}>接受</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRejectRequest(item.user.id, item.id)}
              >
                <Text style={styles.rejectButtonText}>拒絕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* 追蹤回饋按鈕 */}
        {(item.type === 'follow' || item.type === 'follow_accepted') && (
          <TouchableOpacity
            style={styles.followButton}
            onPress={() => handleFollow(item.user.id)}
          >
            <Text style={styles.followButtonText}>追蹤</Text>
          </TouchableOpacity>
        )}
        
        {/* 追蹤請求狀態指示 */}
        {item.type === 'follow_request_sent' && item.request_status === 'pending' && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>等待中</Text>
          </View>
        )}
      </Pressable>
    );
  };
  
  // 渲染標題欄
  const renderHeader = () => (
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
      {Platform.OS === 'ios' && (
        <Animated.View style={StyleSheet.absoluteFill} />
      )}
      
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>通知</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            // 將所有通知標記為已讀
            setNotifications(prev => prev.map(item => ({ ...item, is_read: true })));
            Alert.alert('已將全部通知標記為已讀');
          }}
        >
          <Ionicons name="checkmark-done-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
  
  // 渲染空通知提示
  const renderEmptyNotifications = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={64} color={COLORS.subText} />
      <Text style={styles.emptyTitle}>沒有通知</Text>
      <Text style={styles.emptyText}>
        當有人與你互動時，相關通知將顯示在這裡
      </Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* 標題欄 */}
      {renderHeader()}
      
      {/* 通知列表 */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4].map(i => (
            <NotificationSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyNotifications}
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
            onPress={() => fetchNotifications()}
          >
            <Text style={styles.retryButtonText}>重試</Text>
          </TouchableOpacity>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    paddingTop: LAYOUT.headerHeight + SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  listContent: {
    paddingTop: LAYOUT.headerHeight + SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    minHeight: '100%',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  notificationItemPressed: {
    backgroundColor: COLORS.elevated,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.elevated,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
    ...SHADOW.sm,
  },
  contentContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  username: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    flex: 1,
  },
  time: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xxs,
    color: COLORS.subText,
    marginLeft: SPACING.xs,
  },
  notificationText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    marginBottom: SPACING.xs,
  },
  commentContent: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    fontStyle: 'italic',
    backgroundColor: COLORS.elevated,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xs,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  actionButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
    ...SHADOW.sm,
  },
  acceptButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rejectButtonText: {
    color: COLORS.subText,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
  },
  followButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    alignSelf: 'center',
    minWidth: 64,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  followButtonText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
  },
  statusContainer: {
    alignSelf: 'center',
    paddingVertical: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xxs,
    color: COLORS.subText,
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
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    textAlign: 'center',
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
  skeletonAvatar: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.elevated,
    marginRight: SPACING.md,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonTitle: {
    width: '60%',
    height: 16,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.xs,
    marginBottom: 8,
  },
  skeletonText: {
    width: '80%',
    height: 14,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.xs,
    marginBottom: 6,
  },
  skeletonTime: {
    width: '40%',
    height: 10,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.xs,
  },
  skeletonAction: {
    width: 60,
    height: 26,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.full,
    alignSelf: 'center',
  }
})

export default NotificationsScreen;