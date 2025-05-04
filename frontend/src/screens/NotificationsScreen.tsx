// src/screens/NotificationsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Notification {
  id: number;
  type: 'follow' | 'like' | 'comment';
  user: {
    id: number;
    username: string;
    avatar: string;
  };
  content?: string;
  post_id?: number;
  created_at: string;
}

// Skeleton 元件
const SkeletonNotification = () => (
  <View style={[styles.notificationItem, { opacity: 0.5 }]}> 
    <View style={styles.avatar} />
    <View style={{ flex: 1 }}>
      <View style={{ width: 80, height: 12, backgroundColor: COLORS.border, marginBottom: 6, borderRadius: 6 }} />
      <View style={{ width: 40, height: 10, backgroundColor: COLORS.border, borderRadius: 5 }} />
    </View>
  </View>
);

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState('');
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
  }, []);

  const fetchNotifications = async () => {
    try {
      // 修正 API 路徑，假設後端支援 notifications/notifications/
      const response = await axios.get('http://10.0.2.2:8000/api/notifications/notifications/', {
        headers: { Authorization: `Token YOUR_TOKEN_HERE` },
      });
      setNotifications(response.data.results || response.data);
    } catch (err) {
      setError('獲取通知失敗');
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      await axios.post(`http://10.0.2.2:8000/api/users/follow/${userId}/`, {}, {
        headers: { Authorization: `Token YOUR_TOKEN_HERE` },
      });
      // 更新通知狀態
      fetchNotifications();
    } catch (err) {
      setError('追蹤失敗');
    }
  };

  const handleNotificationPress = (item: Notification) => {
    // TODO: 根據 item.type 跳轉對應頁面
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const getNotificationText = () => {
      switch (item.type) {
        case 'follow':
          return '開始追蹤你';
        case 'like':
          return '喜歡了你的貼文';
        case 'comment':
          return `留言了你的貼文：${item.content}`;
        default:
          return '';
      }
    };

    return (
      <TouchableOpacity style={styles.notificationItem} onPress={() => handleNotificationPress(item)} activeOpacity={0.8} accessibilityLabel={`通知 ${getNotificationText()}`}> 
        <Image 
          source={{ uri: item.user.avatar }} 
          style={styles.avatar}
        />
        <View style={styles.contentContainer}>
          <Text style={styles.username}>{item.user.username}</Text>
          <Text style={styles.notificationText}>{getNotificationText()}</Text>
          <Text style={styles.time}>{item.created_at}</Text>
        </View>
        {item.type === 'follow' && (
          <TouchableOpacity 
            style={styles.followButton}
            onPress={() => handleFollow(item.user.id)}
            activeOpacity={0.8}
            accessibilityLabel="追蹤按鈕"
          >
            <Text style={styles.followButtonText}>追蹤</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          {[1,2,3].map(i => <SkeletonNotification key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listContainer, { paddingTop: 16 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: 14,
    ...SHADOW,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contentContainer: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    fontFamily: FONTS.medium,
    marginBottom: 2,
  },
  notificationText: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  time: {
    fontSize: FONTS.size.xs,
    color: COLORS.subText,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  followButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: RADIUS.lg,
    ...SHADOW,
  },
  followButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.size.sm,
    fontWeight: '600',
    fontFamily: FONTS.medium,
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
  },
});

export default NotificationsScreen;