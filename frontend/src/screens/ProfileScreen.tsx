// 個人檔案頁面檔案，處理檔案讀取與更新功能

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList, 
  Linking, 
  Image, 
  Modal, 
  TextInput, 
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, ANIMATION, LAYOUT } from '../theme';
import SkillTags from '../components/SkillTags';
import AvatarUploader from '../components/AvatarUploader';
import FollowButton from '../components/FollowButton';
import MessageButton from '../components/MessageButton';
import PostItem from '../components/PostItem';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';

// 定義導航參數類型
type RootStackParamList = {
  Profile: { userId: number };
  Portfolio: undefined;
  PostDetail: { postId: number };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = LAYOUT.headerHeight;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// 作品集區塊組件，用於顯示在個人檔案頁面中
const ProfilePortfolioSection = ({ portfolios, isMe, navigation }: { 
  portfolios: any[];
  isMe: boolean;
  navigation: any;
}) => {
  // 如果沒有作品集，顯示空狀態
  if (portfolios.length === 0) {
    return (
      <View style={portfolioStyles.emptyContainer}>
        <Ionicons name="briefcase-outline" size={32} color={COLORS.subText} />
        <Text style={portfolioStyles.emptyText}>尚無作品集</Text>
        {isMe && (
          <TouchableOpacity
            style={portfolioStyles.addButton}
            onPress={() => navigation.navigate('Portfolio')}
          >
            <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
            <Text style={portfolioStyles.addButtonText}>添加作品集</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // 顯示作品集列表
  return (
    <View style={portfolioStyles.container}>
      <View style={portfolioStyles.header}>
        <Text style={portfolioStyles.title}>作品集</Text>
        {isMe && (
          <TouchableOpacity 
            style={portfolioStyles.manageButton}
            onPress={() => navigation.navigate('Portfolio')}
          >
            <Text style={portfolioStyles.manageText}>管理</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.accent} />
          </TouchableOpacity>
        )}
      </View>

      {/* 作品集橫向滾動列表 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={portfolioStyles.scrollContent}
      >
        {portfolios.map((portfolio, index) => (
          <TouchableOpacity 
            key={`portfolio-${portfolio.id}`}
            style={portfolioStyles.card}
            activeOpacity={0.8}
            onPress={() => {
              // 可以導航到作品集詳情頁面
              Alert.alert('作品集', `${portfolio.title}\n\n${portfolio.description}`);
            }}
          >
            {/* 作品集縮圖或背景 */}
            <View style={portfolioStyles.thumbnailContainer}>
              <Image
                source={{ uri: portfolio.thumbnail || `https://picsum.photos/seed/portfolio${index}/800/600` }}
                style={portfolioStyles.thumbnail}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
                style={portfolioStyles.gradient}
              />
            </View>

            {/* 作品集信息 */}
            <View style={portfolioStyles.cardContent}>
              <Text style={portfolioStyles.cardTitle} numberOfLines={1}>
                {portfolio.title}
              </Text>
              
              {/* 技術標籤 */}
              {portfolio.technology_used && portfolio.technology_used.length > 0 && (
                <View style={portfolioStyles.techContainer}>
                  {portfolio.technology_used.slice(0, 3).map((tech: string, i: number) => (
                    <View key={`tech-${i}`} style={portfolioStyles.techBadge}>
                      <Text style={portfolioStyles.techText}>{tech}</Text>
                    </View>
                  ))}
                  {portfolio.technology_used.length > 3 && (
                    <View style={portfolioStyles.techBadge}>
                      <Text style={portfolioStyles.techText}>+{portfolio.technology_used.length - 3}</Text>
                    </View>
                  )}
                </View>
              )}
              
              {/* 鏈接圖標 */}
              <View style={portfolioStyles.linksContainer}>
                {portfolio.github_url && (
                  <TouchableOpacity
                    style={portfolioStyles.linkIcon}
                    onPress={() => Linking.openURL(portfolio.github_url)}
                  >
                    <Ionicons name="logo-github" size={20} color={COLORS.text} />
                  </TouchableOpacity>
                )}
                
                {portfolio.demo_url && (
                  <TouchableOpacity
                    style={portfolioStyles.linkIcon}
                    onPress={() => Linking.openURL(portfolio.demo_url)}
                  >
                    <Ionicons name="globe-outline" size={20} color={COLORS.text} />
                  </TouchableOpacity>
                )}
                
                {portfolio.youtube_url && (
                  <TouchableOpacity
                    style={portfolioStyles.linkIcon}
                    onPress={() => Linking.openURL(portfolio.youtube_url)}
                  >
                    <Ionicons name="logo-youtube" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {/* 顯示更多按鈕 */}
        {portfolios.length > 3 && isMe && (
          <TouchableOpacity
            style={portfolioStyles.viewAllCard}
            onPress={() => navigation.navigate('Portfolio')}
          >
            <Ionicons name="grid-outline" size={24} color={COLORS.accent} />
            <Text style={portfolioStyles.viewAllText}>查看全部</Text>
            <Text style={portfolioStyles.viewAllCount}>
              {portfolios.length} 個作品集
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const portfolioStyles = StyleSheet.create({
  container: {
    marginVertical: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    marginRight: 2,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  card: {
    width: 240,
    height: 180,
    marginRight: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    ...SHADOW.md,
  },
  thumbnailContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  techContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  techBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginRight: 4,
    marginBottom: 4,
  },
  techText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xxs,
    color: '#FFFFFF',
  },
  linksContainer: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  viewAllCard: {
    width: 160,
    height: 180,
    marginRight: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.md,
  },
  viewAllText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  viewAllCount: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  addButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
    marginLeft: 4,
  },
});

// ProfileScreen 組件，負責個人檔案頁面邏輯與畫面
const ProfileScreen: React.FC = () => {
  const { token, user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMe, setIsMe] = useState(true); // 假設目前只看自己
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'portfolio'
  
  // 滾動動畫值
  const scrollY = useRef(new Animated.Value(0)).current;
  const avatarSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [88, 36],
    extrapolate: 'clamp',
  });

  const [avatarSizeValue, setAvatarSizeValue] = useState<number>(88);

  // 加載個人資料和貼文
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      
      try {
        // 獲取個人資料
        console.log('獲取個人資料...');
        const profileRes = await fetch('http://10.0.2.2:8000/api/users/profile/', {
          headers: { Authorization: `Token ${token}` },
        });
        
        if (!profileRes.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const profileData = await profileRes.json();
        setProfile(profileData);
        
        // 獲取用戶貼文
        console.log('獲取用戶貼文...');
        const postsRes = await fetch('http://10.0.2.2:8000/api/posts/posts/?user=current', {
          headers: { Authorization: `Token ${token}` },
        });
        
        if (!postsRes.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const postsData = await postsRes.json();
        setPosts(postsData.results || postsData);
        
        // 獲取作品集
        console.log('獲取作品集...');
        try {
          // 嘗試兩個可能的API端點
          let portfoliosData;
          try {
            const portfoliosRes = await fetch('http://10.0.2.2:8000/api/portfolios/my-portfolios/', {
              headers: { Authorization: `Token ${token}` },
            });
            
            if (portfoliosRes.ok) {
              portfoliosData = await portfoliosRes.json();
            } else {
              throw new Error('First endpoint failed');
            }
          } catch (e) {
            // 嘗試備用端點
            console.log('嘗試備用作品集API端點...');
            const portfoliosRes = await fetch('http://10.0.2.2:8000/api/portfolios/portfolios/', {
              headers: { Authorization: `Token ${token}` },
            });
            
            if (!portfoliosRes.ok) {
              throw new Error('Both portfolio endpoints failed');
            }
            
            portfoliosData = await portfoliosRes.json();
          }
          
          setPortfolios(portfoliosData.results || portfoliosData || []);
        } catch (e) {
          console.error('獲取作品集失敗:', e);
          setPortfolios([]);
        }
      } catch (error) {
        console.error('獲取資料失敗:', error);
        // 使用模擬數據作為後備
        if (!profile) {
          setProfile({
            id: 1,
            username: user?.username || '用戶',
            bio: '這是一個簡短的自我介紹，描述您的專業背景和興趣。',
            skills: ['React Native', 'TypeScript', 'UI Design'],
            following_count: 123,
            followers_count: 456,
            avatar: user?.avatar || 'https://i.pravatar.cc/300'
          });
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };
    
    if (token) {
      fetchAllData();
    }
  }, [token, user]);

  // 更新編輯表單的值
  useEffect(() => {
    if (profile) {
      setEditBio(profile.bio || '');
      setEditSkills((profile.skills || []).join(', '));
      setEditAvatar(profile.avatar || '');
    }
  }, [profile]);

  // 監聽頭像大小變化
  useEffect(() => {
    const listenerId = avatarSize.addListener(({ value }) => {
      setAvatarSizeValue(value);
    });
    return () => {
      avatarSize.removeListener(listenerId);
    };
  }, [avatarSize]);

  // 下拉刷新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // 重新加載所有數據
    try {
      // 獲取個人資料
      const profileRes = await fetch('http://10.0.2.2:8000/api/users/profile/', {
        headers: { Authorization: `Token ${token}` },
      });
      
      if (!profileRes.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const profileData = await profileRes.json();
      setProfile(profileData);
      
      // 獲取用戶貼文
      const postsRes = await fetch('http://10.0.2.2:8000/api/posts/posts/?user=current', {
        headers: { Authorization: `Token ${token}` },
      });
      
      if (!postsRes.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const postsData = await postsRes.json();
      setPosts(postsData.results || postsData);
      
      // 嘗試獲取作品集
      try {
        const portfoliosRes = await fetch('http://10.0.2.2:8000/api/portfolios/my-portfolios/', {
          headers: { Authorization: `Token ${token}` },
        });
        
        if (portfoliosRes.ok) {
          const portfoliosData = await portfoliosRes.json();
          setPortfolios(portfoliosData.results || portfoliosData || []);
        }
      } catch (e) {
        console.error('刷新作品集失敗:', e);
      }
    } catch (error) {
      console.error('刷新資料失敗:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 刪除貼文功能
  const handleDeletePost = async (postId: number) => {
    Alert.alert('確定要刪除這則貼文嗎？', '', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: async () => {
        try {
          const response = await fetch(`http://10.0.2.2:8000/api/posts/posts/${postId}/`, {
            method: 'DELETE',
            headers: { Authorization: `Token ${token}` },
          });
          
          if (!response.ok) {
            throw new Error('刪除失敗');
          }
          
          // 更新貼文列表
          setPosts(posts.filter(p => p.id !== postId));
        } catch (err) {
          console.error('刪除貼文錯誤:', err);
          Alert.alert('刪除失敗', '無法刪除貼文，請稍後再試');
        }
      }}
    ]);
  };

  // 編輯個人檔案功能
  const handleEditProfile = async () => {
    setEditLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:8000/api/users/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          username: profile.username,
          email: profile.email,
          phone_number: profile.phone_number,
          bio: editBio,
          skills: editSkills.split(',').map(s => s.trim()).filter(Boolean),
          avatar: editAvatar,
        }),
      });
      
      if (!response.ok) {
        throw new Error('更新失敗');
      }
      
      const data = await response.json();
      setProfile(data);
      setEditModalVisible(false);
    } catch (err) {
      console.error('更新個人檔案錯誤:', err);
      Alert.alert('更新失敗', '無法更新個人檔案，請稍後再試');
    } finally {
      setEditLoading(false);
    }
  };
  
  // 動畫值計算
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolateRight: 'clamp',
  });
  
  const avatarTop = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT - 44, HEADER_MIN_HEIGHT / 2 - 18],
    extrapolate: 'clamp',
  });
  
  const avatarLeft = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [width / 2 - 44, SPACING.lg],
    extrapolate: 'clamp',
  });

  // 加載中狀態
  if (isLoading || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>載入個人檔案...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* 動畫頭部 */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.View 
          style={[
            styles.headerBackground, 
            { 
              opacity: headerOpacity,
              ...(Platform.OS === 'android' ? { backgroundColor: COLORS.background } : {})
            }
          ]}
        >
          {Platform.OS === 'ios' && (
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={10}
              reducedTransparencyFallbackColor={COLORS.background}
            />
          )}
        </Animated.View>
        
        <Animated.View style={[styles.headerTitle, { opacity: headerTitleOpacity }]}>
          <Text style={styles.headerTitleText}>{profile.username}</Text>
        </Animated.View>
        
        <Animated.Image 
          source={{ uri: 'https://images.unsplash.com/photo-1550645612-83f5d594b671?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }} 
          style={[
            styles.coverImage,
            {
              transform: [{ scale: imageScale }]
            }
          ]}
        />
        
        <Animated.View 
          style={[
            styles.avatarContainer, 
            {
              width: avatarSizeValue, 
              height: avatarSizeValue,
              top: avatarTop,
              left: avatarLeft,
              transform: [{ translateX: -44 }, { translateY: 0 }]
            }
          ]}
        >
          <AvatarUploader
            avatarUrl={profile.avatar}
            onPick={() => setEditModalVisible(true)}
            size={avatarSizeValue}
          />
        </Animated.View>
      </Animated.View>
      
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
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
      >
        {/* 個人資訊區塊 */}
        <View style={styles.profileInfo}>
          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio || '這裡是自我介紹...'}</Text>
          
          <SkillTags 
            skills={profile.skills || []} 
            editable={isMe}
            onEdit={() => setEditModalVisible(true)}
          />
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{posts.length}</Text>
              <Text style={styles.statLabel}>貼文</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{profile.following_count || 0}</Text>
              <Text style={styles.statLabel}>追蹤</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{profile.followers_count || 0}</Text>
              <Text style={styles.statLabel}>粉絲</Text>
            </View>
          </View>
          
          {/* 作品集區塊 */}
          <ProfilePortfolioSection 
            portfolios={portfolios}
            isMe={isMe} 
            navigation={navigation} 
          />
          
          <View style={styles.actionRow}>
            {isMe ? (
              <TouchableOpacity 
                style={styles.editBtn} 
                activeOpacity={0.85} 
                onPress={() => setEditModalVisible(true)}
              >
                <Ionicons name="pencil" size={16} color={COLORS.primary} />
                <Text style={styles.editBtnText}>編輯個人檔案</Text>
              </TouchableOpacity>
            ) : (
              <>
                <FollowButton isFollowing={false} onPress={() => {}} />
                <MessageButton onPress={() => {}} />
              </>
            )}
          </View>
        </View>
        
        {/* 內容標籤頁 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'posts' && styles.activeTabButton]} 
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons 
              name="grid-outline" 
              size={22} 
              color={activeTab === 'posts' ? COLORS.accent : COLORS.subText} 
            />
            <Text 
              style={[
                styles.tabButtonText, 
                activeTab === 'posts' && styles.activeTabButtonText
              ]}
            >
              貼文
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'portfolio' && styles.activeTabButton]} 
            onPress={() => setActiveTab('portfolio')}
          >
            <Ionicons 
              name="briefcase-outline" 
              size={22} 
              color={activeTab === 'portfolio' ? COLORS.accent : COLORS.subText}
            />
            <Text 
              style={[
                styles.tabButtonText, 
                activeTab === 'portfolio' && styles.activeTabButtonText
              ]}
            >
              作品集
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* 貼文 */}
        {activeTab === 'posts' && (
          <View style={styles.contentContainer}>
            {posts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color={COLORS.subText} />
                <Text style={styles.emptyText}>尚無貼文</Text>
              </View>
            ) : (
              posts.map(post => (
                <View key={post.id} style={styles.postContainer}>
                  <PostItem post={post} onLike={() => {}} onComment={() => {}} onRepost={() => {}} onSave={() => {}} />
                  {isMe && (
                    <TouchableOpacity 
                      style={styles.deleteBtn} 
                      onPress={() => handleDeletePost(post.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.text} />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}
        
        {/* 作品集詳細展示頁籤 */}
        {activeTab === 'portfolio' && (
          <View style={styles.contentContainer}>
            {portfolios.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="briefcase-outline" size={48} color={COLORS.subText} />
                <Text style={styles.emptyText}>尚無作品</Text>
                {isMe && (
                  <TouchableOpacity 
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate('Portfolio')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emptyButtonText}>添加作品集</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.portfolioGrid}>
                {portfolios.map((item, idx) => (
                  <View key={idx} style={styles.portfolioCard}>
                    {/* 作品集縮圖 */}
                    <View style={styles.portfolioImageContainer}>
                      <Image 
                        source={{ 
                          uri: item.image || item.thumbnail || `https://picsum.photos/seed/portfolio${idx}/800/600` 
                        }} 
                        style={styles.portfolioImage} 
                      />
                    </View>
                    
                    <View style={styles.portfolioContent}>
                      <Text style={styles.portfolioTitle}>{item.title}</Text>
                      <Text style={styles.portfolioDesc} numberOfLines={2}>{item.description}</Text>
                      
                      {/* 技術標籤 */}
                      {item.technology_used && item.technology_used.length > 0 && (
                        <View style={styles.techTagsContainer}>
                          {item.technology_used.slice(0, 3).map((tech: string, i: number) => (
                            <View key={`tech-${i}`} style={styles.techTag}>
                              <Text style={styles.techTagText}>{tech}</Text>
                            </View>
                          ))}
                          {item.technology_used.length > 3 && (
                            <View style={styles.techTag}>
                              <Text style={styles.techTagText}>+{item.technology_used.length - 3}</Text>
                            </View>
                          )}
                        </View>
                      )}
                      
                      {/* 項目連結 */}
                      <View style={styles.linkRow}>
                        {item.github_url && (
                          <TouchableOpacity 
                            style={styles.linkButton}
                            onPress={() => Linking.openURL(item.github_url)}
                          >
                            <Ionicons name="logo-github" size={16} color={COLORS.text} />
                            <Text style={styles.link}>GitHub</Text>
                          </TouchableOpacity>
                        )}
                        
                        {item.demo_url && (
                          <TouchableOpacity 
                            style={styles.linkButton}
                            onPress={() => Linking.openURL(item.demo_url)}
                          >
                            <Ionicons name="open-outline" size={16} color={COLORS.text} />
                            <Text style={styles.link}>Demo</Text>
                          </TouchableOpacity>
                        )}
                        
                        {item.youtube_url && (
                          <TouchableOpacity 
                            style={styles.linkButton}
                            onPress={() => Linking.openURL(item.youtube_url)}
                          >
                            <Ionicons name="logo-youtube" size={16} color={COLORS.text} />
                            <Text style={styles.link}>YouTube</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        
        <View style={styles.footer} />
      </Animated.ScrollView>
      
      {/* 編輯個人檔案對話框 */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>編輯個人檔案</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>頭像</Text>
                <AvatarUploader
                  avatarUrl={editAvatar}
                  onPick={(uri?: string) => uri && setEditAvatar(uri)}
                  size={100}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>自我介紹</Text>
                <TextInput
                  style={styles.textArea}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="寫下一些關於自己的介紹..."
                  placeholderTextColor={COLORS.subText}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>技能標籤 (用逗號分隔)</Text>
                <TextInput
                  style={styles.input}
                  value={editSkills}
                  onChangeText={setEditSkills}
                  placeholder="React Native, TypeScript, UI Design..."
                  placeholderTextColor={COLORS.subText}
                />
              </View>
              
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  editLoading && styles.saveButtonDisabled
                ]}
                onPress={handleEditProfile}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.saveButtonText}>儲存</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
    </View>
      </Modal>
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
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    zIndex: 2,
  },
  headerTitle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 4 : 8,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  headerTitleText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT,
    resizeMode: 'cover',
    zIndex: 1,
  },
  avatarContainer: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: COLORS.background,
    overflow: 'hidden',
    zIndex: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT + SPACING.lg,
    minHeight: height,
  },
  profileInfo: {
    paddingHorizontal: SPACING.lg,
  },
  username: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.xl,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  bio: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  statBox: {
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
  },
  statNum: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    ...SHADOW.sm,
  },
  editBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.lg,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  tabButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    marginLeft: SPACING.xs,
  },
  activeTabButtonText: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  emptyButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
  },
  postContainer: {
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  deleteBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: `${COLORS.error}30`,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  portfolioGrid: {
    marginTop: SPACING.md,
  },
  portfolioCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  portfolioImageContainer: {
    height: 180,
    width: '100%',
  },
  portfolioImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  portfolioContent: {
    padding: SPACING.md,
  },
  portfolioTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  portfolioDesc: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  techTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.xs,
  },
  techTag: {
    backgroundColor: COLORS.elevated,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  techTagText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xxs,
    color: COLORS.subText,
  },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  link: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.text,
    marginLeft: 4,
  },
  footer: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.primary,
  },
});

export default ProfileScreen;