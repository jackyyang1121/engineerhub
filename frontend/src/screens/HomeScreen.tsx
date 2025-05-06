// 首頁（動態牆）頁面檔案，處理貼文串流、發文、無限滾動等功能
// 功能：顯示貼文列表、發文按鈕、互動功能
// 資料來源：API 獲取的貼文資料
// 資料流向：從 API 獲取資料，渲染貼文列表，處理用戶互動

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  SafeAreaView, 
  ActivityIndicator,
  Animated,
  StatusBar,
  Platform,
  Pressable,
  RefreshControl,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, LAYOUT, ANIMATION } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PostItem from '../components/PostItem';
import { getPosts, likePost, commentPost, repostPost, savePost } from '../api/posts';
import { BlurView } from '@react-native-community/blur'; 

type RootStackParamList = {
  Home: {
    refresh?: boolean;
    newPost?: Post;
  };
  PostDetail: { postId: number };
  CreatePost: undefined;
  Profile: { userId?: number };
  Notifications: undefined;
  Messages: undefined;
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
  const { token, user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // 動畫值
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp'
  });
  
  const headerElevation = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 3],
    extrapolate: 'clamp'
  });

  // 偵測 route.params
  useEffect(() => {
    if (route.params) {
      const params = route.params as {refresh?: boolean; newPost?: Post};
      // 如果有 newPost 參數，直接將新貼文添加到頂部
      if (params.newPost) {
        setPosts(prev => [params.newPost as Post, ...prev]);
        // 清除參數，避免重複添加
        params.newPost = undefined;
      } 
      // 如果有 refresh 參數，則重新獲取貼文列表
      else if (params.refresh) {
        handleRefresh();
        // 清除狀態避免重複刷新
        params.refresh = false;
      }
    }
  }, [route.params]);

  // 獲取貼文列表
  const fetchPosts = async (pageNum = 1, shouldRefresh = false) => {
    try {
      // 嘗試從API獲取貼文
      const response = await getPosts(token, pageNum);
      const results = Array.isArray(response.results) ? response.results : [];
      
      // 如果API返回數據，使用API數據
      if (results.length > 0) {
        if (shouldRefresh) {
          setPosts(results);
        } else {
          setPosts(prev => [...prev, ...results]);
        }
        setHasMore(!!response.next);
      } 
      // 如果API沒有返回數據，則使用模擬數據 (僅用於開發)
      else {
        // 使用模擬貼文數據
        const mockPosts = generateMockPosts();
        setPosts(shouldRefresh ? mockPosts : (prev => [...prev, ...mockPosts]));
        setHasMore(false);
      }
    } catch (error) {
      console.error('獲取貼文失敗:', error);
      // 使用模擬貼文數據作為備用
      const mockPosts = generateMockPosts();
      setPosts(shouldRefresh ? mockPosts : (prev => [...prev, ...mockPosts]));
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 生成模擬貼文數據
  // MOCK-DATA-START - 生產環境可移除
  const generateMockPosts = () => {
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
    return Array(15).fill(0).map((_, index) => {
      const random = Math.random();
      const hasMedia = random > 0.6;
      const hasCodeBlock = !hasMedia && random > 0.3;
      const likeCount = Math.floor(Math.random() * 50);
      const commentCount = Math.floor(Math.random() * 20);
      const author = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const content = mockContents[Math.floor(Math.random() * mockContents.length)];
      const isLiked = Math.random() > 0.7;
      const isSaved = Math.random() > 0.8;
      const timestamp = Date.now();
      
      // 創建基本貼文對象
      const post: Post = {
        id: timestamp - index * 1000 - Math.floor(Math.random() * 1000), // 使用當前時間戳、索引和隨機數組合作為唯一ID
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
  // MOCK-DATA-END

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

  // 渲染頭部
  const renderHeader = () => {
    return (
      <Animated.View style={[
        styles.header,
        { 
          opacity: headerOpacity,
          elevation: headerElevation,
          shadowOpacity: headerElevation.interpolate({inputRange: [0, 3], outputRange: [0, 0.3]})
        }
      ]}>
        {Platform.OS === 'ios' && (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={8}
            reducedTransparencyFallbackColor={COLORS.background}
          />
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>EngHub</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Messages')}
            >
              <Ionicons name="paper-plane-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  // 渲染發文區塊
  const renderPostBar = () => {
    return (
      <Pressable
        style={({pressed}) => [styles.postBar, pressed && styles.postBarPressed]}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <View style={styles.postBarContent}>
          <TouchableOpacity 
            style={styles.avatarButton}
            onPress={() => navigation.navigate('Profile', { userId: user?.id })}
          >
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={16} color={COLORS.text} />
            </View>
          </TouchableOpacity>
          <Text style={styles.postBarText}>在想什麼...</Text>
        </View>
        <View style={styles.postBarOptions}>
          <View style={styles.postBarOptionItem}>
            <Ionicons name="image-outline" size={20} color={COLORS.accent} />
          </View>
          <View style={styles.postBarOptionItem}>
            <Ionicons name="code-slash-outline" size={20} color={COLORS.accent} />
          </View>
        </View>
      </Pressable>
    );
  };

  // 列表空狀態
  const renderEmptyList = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={48} color={COLORS.subText} />
        <Text style={styles.emptyText}>尚無任何貼文</Text>
        <Text style={styles.emptySubText}>成為第一個發佈貼文的人吧！</Text>
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.emptyButtonText}>立即發佈</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* 渲染頂部導航欄 */}
      {renderHeader()}
      
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
        keyExtractor={item => `post-${item.id}-${item.created_at}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
            progressBackgroundColor={COLORS.card}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderPostBar}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator color={COLORS.accent} style={styles.loader} />
          ) : hasMore ? (
            <View style={styles.listFooter}>
              <Text style={styles.footerText}>上拉載入更多...</Text>
            </View>
          ) : posts.length > 0 ? (
            <View style={styles.listFooter}>
              <Text style={styles.footerText}>已無更多內容</Text>
            </View>
          ) : null
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
      
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.85}
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : COLORS.background,
    zIndex: 100,
    ...SHADOW.md,
  },
  headerContent: {
    height: LAYOUT.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.xl,
    color: COLORS.text,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  listContent: {
    paddingTop: LAYOUT.headerHeight + SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingBottom: LAYOUT.safeBottom + SPACING.xxl,
    minHeight: '100%',
  },
  postBar: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  postBarPressed: {
    backgroundColor: COLORS.elevated,
  },
  postBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  avatarButton: {
    marginRight: SPACING.sm,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  postBarText: {
    color: COLORS.placeholder,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    flex: 1,
  },
  postBarOptions: {
    flexDirection: 'row',
    padding: SPACING.sm,
    backgroundColor: COLORS.card,
  },
  postBarOptionItem: {
    marginRight: SPACING.md,
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
  loader: {
    marginVertical: SPACING.lg,
  },
  listFooter: {
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  footerText: {
    color: COLORS.subText,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
  },
  createButton: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    marginTop: SPACING.xxl,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    ...SHADOW.md,
  },
  emptyButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.primary,
  },
});

export default HomeScreen;