// src/screens/NotificationsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

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

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState('');
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:8000/api/notifications/', {
        headers: { Authorization: `Token YOUR_TOKEN_HERE` },
      });
      setNotifications(response.data);
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
      <TouchableOpacity 
        style={styles.notificationItem}
        onPress={() => {
          if (item.type === 'follow') {
            navigation.navigate('Profile', { userId: item.user.id });
          } else if (item.post_id) {
            navigation.navigate('PostDetail', { postId: item.post_id });
          }
        }}
      >
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
          >
            <Text style={styles.followButtonText}>追蹤</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  contentContainer: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  notificationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NotificationsScreen;