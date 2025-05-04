// 首頁（動態牆）頁面檔案，處理貼文串流、發文、無限滾動等功能

import React, { useState, useEffect } from 'react';  // 引入 React 核心功能與鉤子
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Platform, SafeAreaView } from 'react-native';  // 引入 React Native 核心組件
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';  // 引入 axios 用於發送 HTTP 請求
import { useAuth } from '../context/AuthContext';  // 導入 useAuth hook
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

// 定義 Post 介面
interface Post {
  id: number;
  author: {
    username: string;
    avatar?: string;
  };
  content: string;
  like_count: number;
}

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  PostDetail: undefined;
  Search: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

// Skeleton 元件
const SkeletonCard = () => (
  <View style={[styles.card, { opacity: 0.5 }]}> 
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.border, marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <View style={{ width: 80, height: 12, backgroundColor: COLORS.border, marginBottom: 6, borderRadius: 6 }} />
        <View style={{ width: 40, height: 10, backgroundColor: COLORS.border, borderRadius: 5 }} />
      </View>
    </View>
    <View style={{ width: '100%', height: 18, backgroundColor: COLORS.border, marginBottom: 10, borderRadius: 6 }} />
    <View style={{ width: '80%', height: 18, backgroundColor: COLORS.border, marginBottom: 10, borderRadius: 6 }} />
    <View style={{ flexDirection: 'row', marginTop: 2 }}>
      <View style={{ width: 40, height: 16, backgroundColor: COLORS.border, borderRadius: 8, marginRight: 10 }} />
      <View style={{ width: 40, height: 16, backgroundColor: COLORS.border, borderRadius: 8 }} />
    </View>
  </View>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { token } = useAuth();  // 使用 useAuth hook 獲取 token
  const [posts, setPosts] = useState<Post[]>([]);  // 使用 Post[] 型別
  const [content, setContent] = useState('');  // 定義狀態變數 content，用於儲存用戶輸入的發文內容
  const [error, setError] = useState('');  // 定義狀態變數 error，用於儲存錯誤訊息
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchPosts = async () => {
      try {
        if (!token) return;
        const response = await axios.get(`http://10.0.2.2:8000/api/posts/posts/?page=${page}`,
          { headers: { Authorization: `Token ${token}` } });
        if (page === 1) {
          setPosts(response.data.results || response.data);
        } else {
          setPosts(prev => [...prev, ...(response.data.results || response.data)]);
        }
        setHasMore(!!response.data.next);
      } catch (err) {
        setError('獲取推薦貼文失敗');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPosts();
  }, [token, page]);

  const handlePost = async () => {
    if (!content.trim()) {
      setError('貼文內容不能為空');
      return;
    }
    try {
      if (!token) return;
      await axios.post('http://10.0.2.2:8000/api/posts/posts/', {
        content,
      }, {
        headers: { Authorization: `Token ${token}` },
      });
      setContent('');
      const response = await axios.get(`http://10.0.2.2:8000/api/posts/posts/?page=1`, {
        headers: { Authorization: `Token ${token}` },
      });
      setPosts(response.data.results || response.data);
      setError('');
    } catch (err: any) {
      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError('發文失敗');
      }
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) setPage(p => p + 1);
  };

  if (loading && posts.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {[1,2,3].map(i => <SkeletonCard key={i} />)}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View style={styles.postBar}>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="分享新動態..."
              style={styles.postInput}
              placeholderTextColor={COLORS.subText}
              multiline
              accessibilityLabel="發文輸入框"
            />
            <View style={styles.postBarRow}>
              <TouchableOpacity style={styles.postBtn} onPress={handlePost} activeOpacity={0.85} accessibilityLabel="發佈按鈕">
                <Text style={styles.postBtnText}>發佈</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        stickyHeaderIndices={[0]}
        renderItem={({ item }) => (
          <View style={styles.card} accessibilityLabel="貼文卡片">
            <View style={styles.row}>
              <Image source={{ uri: item.author.avatar || 'https://placehold.co/40x40' }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.username}>{item.author.username}</Text>
                <Text style={styles.time}>2小時前</Text>
              </View>
            </View>
            <Text style={styles.content}>{item.content}</Text>
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} accessibilityLabel="點讚按鈕">
                <Text style={styles.iconText}>{item.like_count}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} accessibilityLabel="評論按鈕">
                <Text style={styles.iconText}>評論</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} accessibilityLabel="分享按鈕">
                <Text style={styles.iconText}>分享</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={[styles.listContent, { paddingTop: 16 }]}
        removeClippedSubviews
        initialNumToRender={8}
        windowSize={10}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        accessibilityLabel="貼文列表"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: 18,
    padding: 20,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  username: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  content: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  like: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
  },
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: 22,
    padding: 20,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.primary,
    marginBottom: 12,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOW,
  },
  buttonText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    letterSpacing: 1,
  },
  error: {
    color: COLORS.error,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  time: {
    color: COLORS.subText,
    fontSize: FONTS.size.xs,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  iconText: {
    color: COLORS.accent,
    fontSize: FONTS.size.sm,
    marginLeft: 4,
    fontFamily: FONTS.medium,
  },
  postBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingHorizontal: 20,
    paddingBottom: 12,
    ...SHADOW,
  },
  postInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    minHeight: 48,
    maxHeight: 120,
  },
  postBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  postBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
    paddingHorizontal: 28,
    ...SHADOW,
  },
  postBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    letterSpacing: 1,
  },
});

export default HomeScreen;  // 導出 HomeScreen 組件供其他檔案使用