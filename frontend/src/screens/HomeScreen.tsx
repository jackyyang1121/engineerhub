// 首頁（動態牆）頁面檔案，處理貼文串流、發文、無限滾動等功能
// 功能：顯示貼文列表、發文按鈕、互動功能
// 資料來源：API 獲取的貼文資料
// 資料流向：從 API 獲取資料，渲染貼文列表，處理用戶互動

import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PostItem from '../components/PostItem';
import { getPosts, likePost, commentPost, repostPost, savePost } from '../api/posts';

type RootStackParamList = {
  Home: undefined;
  PostDetail: { postId: number };
  CreatePost: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Post {
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

const HomeScreen = () => {
  const { token } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 偵測 route.params.refresh
  useEffect(() => {
    // @ts-ignore
    if (route.params && route.params.refresh) {
      handleRefresh();
      // @ts-ignore
      route.params.refresh = false; // 清除狀態避免重複刷新
    }
  }, [route.params]);

  // 獲取貼文列表
  const fetchPosts = async (pageNum = 1, shouldRefresh = false) => {
    try {
      const response = await getPosts(token, pageNum);
      const results = Array.isArray(response.results) ? response.results : [];
      if (shouldRefresh) {
        setPosts(results);
      } else {
        setPosts(prev => [...prev, ...results]);
      }
      setHasMore(!!response.next);
    } catch (error) {
      console.error('獲取貼文失敗:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 初始載入
  useEffect(() => {
    fetchPosts();
  }, []);

  // 下拉刷新
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPosts(1, true);
  };

  // 上拉載入更多
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchPosts(page + 1);
    }
  };

  // 處理點讚
  const handleLike = async (postId: number) => {
    try {
      await likePost(token, postId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: !post.is_liked,
              like_count: post.is_liked ? post.like_count - 1 : post.like_count + 1
            }
          : post
      ));
    } catch (error) {
      console.error('點讚失敗:', error);
    }
  };

  // 處理留言
  const handleComment = (postId: number) => {
    navigation.navigate('PostDetail', { postId });
  };

  // 處理轉發
  const handleRepost = async (postId: number) => {
    try {
      await repostPost(token, postId);
      // 可以加入轉發成功的提示
    } catch (error) {
      console.error('轉發失敗:', error);
    }
  };

  // 處理儲存
  const handleSave = async (postId: number) => {
    try {
      await savePost(token, postId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, is_saved: !post.is_saved }
          : post
      ));
    } catch (error) {
      console.error('儲存失敗:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSpace}>
      </View>
      <TouchableOpacity
        style={styles.postBar}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.85}
      >
        <Text style={styles.postBarText}>在想什麼...</Text>
      </TouchableOpacity>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            onRepost={handleRepost}
            onSave={handleSave}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator color={COLORS.accent} style={styles.loader} />
          ) : null
        }
      />
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Ionicons name="create-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loader: {
    marginVertical: 20,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
  },
  postBar: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 18,
    margin: 16,
    marginBottom: 0,
  },
  postBarText: {
    color: COLORS.subText,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
  },
  headerSpace: {
    height: 48,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    // 可自訂美觀設計
  },
});

export default HomeScreen;