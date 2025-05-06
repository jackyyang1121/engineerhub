// 搜尋頁面檔案，處理用戶和貼文的搜尋功能

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator, 
  StatusBar,
  StyleSheet,
  Platform,
  Pressable,
  Image,
  Animated,
  Keyboard,
  RefreshControl,
  Alert
} from 'react-native';
import axios from 'axios';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, ANIMATION, LAYOUT } from '../theme';
import { useAuth } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

// 定義頁面導航類型
type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// 定義用戶類型
interface User {
  id: number;
  username: string;
  bio?: string;
  avatar?: string;
}

// 定義貼文類型
interface Post {
  id: number;
  content: string;
  author: User;
  created_at: string;
}

// 定義近期搜尋類型
interface RecentSearch {
  id: number;
  query: string;
  created_at: string;
}

// 結果項組件 - 用戶卡片
const UserResultCard = ({ user, onPress }: { user: User; onPress: () => void }) => (
  <TouchableOpacity 
    style={styles.userCard} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.userAvatar}>
      {user.avatar ? (
        <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
      ) : (
        <Ionicons name="person" size={20} color={COLORS.subText} />
      )}
    </View>
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{user.username}</Text>
      {user.bio && <Text style={styles.userBio} numberOfLines={1}>{user.bio}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.subText} />
  </TouchableOpacity>
);

// 結果項組件 - 貼文卡片
const PostResultCard = ({ post, onPress }: { post: Post; onPress: () => void }) => (
  <TouchableOpacity 
    style={styles.postCard} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.postHeader}>
      <View style={styles.smallAvatar}>
        {post.author.avatar ? (
          <Image source={{ uri: post.author.avatar }} style={styles.smallAvatarImage} />
        ) : (
          <Ionicons name="person" size={14} color={COLORS.subText} />
        )}
      </View>
      <Text style={styles.postAuthor}>{post.author.username}</Text>
      <Text style={styles.postTime}>{post.created_at}</Text>
    </View>
    <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
  </TouchableOpacity>
);

// 近期搜尋項組件
const RecentSearchItem = ({ item, onPress, onDelete }: { 
  item: RecentSearch; 
  onPress: () => void; 
  onDelete: () => void 
}) => (
  <View style={styles.recentSearchItem}>
    <TouchableOpacity 
      style={styles.recentSearchContent} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="time-outline" size={18} color={COLORS.subText} style={styles.recentSearchIcon} />
      <Text style={styles.recentSearchText}>{item.query}</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={styles.recentSearchDelete} 
      onPress={onDelete}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="close" size={16} color={COLORS.subText} />
    </TouchableOpacity>
  </View>
);

// Skeleton 元件，用於載入中狀態
const SkeletonLoader = ({ type }: { type: 'user' | 'post' }) => (
  <View style={[
    type === 'user' ? styles.userCard : styles.postCard, 
    { opacity: 0.5 }
  ]}> 
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
      </View>
    </View>
  </View>
);

// 搜尋頁面組件
const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  
  // 動畫值
  const searchBarY = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  
  // 獲取近期搜尋紀錄
  const fetchRecentSearches = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get('http://10.0.2.2:8000/api/search/recent-searches/', {
        headers: { Authorization: `Token ${token}` },
      });
      setRecentSearches(response.data);
    } catch (err) {
      console.error('Failed to fetch recent searches:', err);
    }
  };
  
  // 頁面加載時獲取近期搜尋
  useEffect(() => {
    fetchRecentSearches();
    
    // 監聽鍵盤顯示/隱藏
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        Animated.timing(contentOpacity, {
          toValue: 0.97,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // 處理搜尋請求
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) {
      setShowRecentSearches(true);
      setUsers([]);
      setPosts([]);
      return;
    }
    
    setLoading(true);
    setShowRecentSearches(false);
    
    try {
      if (!token) return;
      
      const response = await axios.get(`http://10.0.2.2:8000/api/search/search/?q=${searchQuery}`, {
        headers: { Authorization: `Token ${token}` },
      });
      
      setUsers(response.data.users || []);
      setPosts(response.data.posts || []);
      setError('');
      
      // 搜尋完成後重新獲取近期搜尋
      fetchRecentSearches();
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('搜尋失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 處理清除單個近期搜尋
  const handleDeleteRecentSearch = async (id: number) => {
    if (!token) return;
    
    try {
      await axios.delete(`http://10.0.2.2:8000/api/search/recent-searches/?id=${id}`, {
        headers: { Authorization: `Token ${token}` },
      });
      
      // 從畫面上移除已刪除的紀錄
      setRecentSearches(prev => prev.filter(search => search.id !== id));
    } catch (err) {
      console.error('Failed to delete recent search:', err);
    }
  };
  
  // 處理清除所有近期搜尋
  const handleClearAllRecentSearches = () => {
    Alert.alert(
      '清除搜尋記錄',
      '確定要清除全部搜尋記錄嗎？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '確定', 
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            
            try {
              await axios.delete('http://10.0.2.2:8000/api/search/recent-searches/', {
                headers: { Authorization: `Token ${token}` },
              });
              
              // 清空近期搜尋列表
              setRecentSearches([]);
            } catch (err) {
              console.error('Failed to clear all recent searches:', err);
            }
          }
        },
      ]
    );
  };
  
  // 處理刷新
  const onRefresh = async () => {
    setRefreshing(true);
    
    if (query.trim()) {
      await handleSearch();
    } else {
      await fetchRecentSearches();
    }
    
    setRefreshing(false);
  };
  
  // 合併搜尋結果，分組顯示
  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.loadersContainer}>
          {[1, 2, 3].map(i => <SkeletonLoader key={`user-skeleton-${i}-${Date.now()}`} type="user" />)}
          {[1, 2].map(i => <SkeletonLoader key={`post-skeleton-${i}-${Date.now()}`} type="post" />)}
        </View>
      );
    }
    
    if (users.length === 0 && posts.length === 0 && query.trim()) {
      return (
        <View style={styles.emptyResultsContainer}>
          <Ionicons name="search-outline" size={64} color={COLORS.subText} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>沒有找到相符的結果</Text>
          <Text style={styles.emptySubtitle}>請嘗試不同的搜尋關鍵字或確認拼字</Text>
        </View>
      );
    }
    
    return (
      <>
        {users.length > 0 && (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>用戶</Text>
            {users.map(user => (
              <UserResultCard 
                key={`user-result-${user.id}`} 
                user={user} 
                onPress={() => navigation.navigate('Profile', { userId: user.id })} 
              />
            ))}
          </View>
        )}
        
        {posts.length > 0 && (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>貼文</Text>
            {posts.map(post => (
              <PostResultCard 
                key={`post-result-${post.id}`} 
                post={post} 
                onPress={() => navigation.navigate('PostDetail', { postId: post.id })} 
              />
            ))}
          </View>
        )}
      </>
    );
  };
  
  // 渲染近期搜尋列表
  const renderRecentSearches = () => {
    if (recentSearches.length === 0) {
      return (
        <View style={styles.noRecentContainer}>
          <Text style={styles.noRecentText}>沒有近期搜尋紀錄</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.recentSearchesContainer}>
        <View style={styles.recentSearchesHeader}>
          <Text style={styles.recentSearchesTitle}>近期搜尋</Text>
          <TouchableOpacity onPress={handleClearAllRecentSearches}>
            <Text style={styles.clearAllText}>清除全部</Text>
          </TouchableOpacity>
        </View>
        
        {recentSearches.map(item => (
          <RecentSearchItem 
            key={`recent-search-${item.id}`}
            item={item}
            onPress={() => {
              setQuery(item.query);
              handleSearch(item.query);
            }}
            onDelete={() => handleDeleteRecentSearch(item.id)}
          />
        ))}
      </View>
    );
  };
  
  // 畫面渲染
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <Animated.View 
        style={[
          styles.searchBarContainer,
          {
            transform: [{ translateY: searchBarY }],
            opacity: contentOpacity
          }
        ]}
      >
        <Pressable style={styles.inputContainer} onPress={() => { /* 確保整個輸入框都可點擊 */ }}>
          <Ionicons name="search" size={20} color={COLORS.subText} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={text => {
              setQuery(text);
              if (text.trim() === '') {
                setShowRecentSearches(true);
                setUsers([]);
                setPosts([]);
              }
            }}
            placeholder="搜尋用戶或貼文..."
            placeholderTextColor={COLORS.placeholder}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch()}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setQuery('');
                setShowRecentSearches(true);
                setUsers([]);
                setPosts([]);
              }}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.subText} />
            </TouchableOpacity>
          )}
        </Pressable>
        {query.length > 0 && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => {
              setQuery('');
              setShowRecentSearches(true);
              setUsers([]);
              setPosts([]);
              Keyboard.dismiss();
            }}
          >
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      
      <Animated.View style={[styles.scrollView, { opacity: contentOpacity }]}>
        <FlatList
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
            />
          }
          data={[{ key: 'search-content-item' }]} // 單個項目，用於渲染所有內容
          renderItem={() => (
            <>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              
              {showRecentSearches && query.trim() === '' ? renderRecentSearches() : renderSearchResults()}
            </>
          )}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

// 高級設計風格樣式
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? SPACING.md : SPACING.md + 10,
    paddingBottom: SPACING.md + 5,
    ...SHADOW.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : SPACING.sm - 2,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.xs : 0,
    paddingHorizontal: SPACING.xs,
    height: '100%', // 確保占滿整個高度
    marginLeft: SPACING.xs,
  },
  clearButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  cancelButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  cancelText: {
    color: COLORS.accent,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: LAYOUT.safeBottom + SPACING.xxl,
  },
  loadersContainer: {
    paddingTop: SPACING.md,
  },
  resultSection: {
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    marginBottom: SPACING.sm,
    letterSpacing: FONTS.letterSpacing.wide,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.full,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: 2,
  },
  userBio: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
  },
  postCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  smallAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.full,
  },
  postAuthor: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  postTime: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xs,
    color: COLORS.subText,
  },
  postContent: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  emptyResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyIcon: {
    marginBottom: SPACING.md,
    opacity: 0.5,
  },
  emptyTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.error,
  },
  recentSearchesContainer: {
    marginTop: SPACING.md,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recentSearchesTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    letterSpacing: FONTS.letterSpacing.wide,
  },
  clearAllText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recentSearchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentSearchIcon: {
    marginRight: SPACING.sm,
  },
  recentSearchText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  recentSearchDelete: {
    padding: SPACING.xs,
  },
  noRecentContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  noRecentText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
  },
  skeletonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    marginRight: SPACING.md,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonTitle: {
    height: 18,
    width: '50%',
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.xs,
    marginBottom: SPACING.xs,
  },
  skeletonSubtitle: {
    height: 14,
    width: '80%',
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.xs,
  },
});

export default SearchScreen;