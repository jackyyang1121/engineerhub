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
  Platform
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

// 定義導航參數類型
type RootStackParamList = {
  Profile: { userId: number };
  Portfolio: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = LAYOUT.headerHeight;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// ProfileScreen 組件，負責個人檔案頁面邏輯與畫面
const ProfileScreen: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      // TODO: 換成你的 API 路徑
      const res = await fetch('http://10.0.2.2:8000/api/users/profile/', {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setProfile(data);
      setIsLoading(false);
    };
    const fetchPosts = async () => {
      const res = await fetch('http://10.0.2.2:8000/api/posts/posts/?user=current', {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setPosts(data.results || data);
    };
    const fetchPortfolios = async () => {
      const res = await fetch('http://10.0.2.2:8000/api/portfolios/', {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setPortfolios(data.results || data);
    };
    if (token) {
      fetchProfile();
      fetchPosts();
      fetchPortfolios();
    }
  }, [token]);

  useEffect(() => {
    if (profile) {
      setEditBio(profile.bio || '');
      setEditSkills((profile.skills || []).join(', '));
      setEditAvatar(profile.avatar || '');
    }
  }, [profile]);

  useEffect(() => {
    const listenerId = avatarSize.addListener(({ value }) => {
      setAvatarSizeValue(value);
    });
    return () => {
      avatarSize.removeListener(listenerId);
    };
  }, [avatarSize]);

  // 刪除貼文功能
  const handleDeletePost = async (postId: number) => {
    Alert.alert('確定要刪除這則貼文嗎？', '', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: async () => {
        try {
          await fetch(`http://10.0.2.2:8000/api/posts/posts/${postId}/`, {
            method: 'DELETE',
            headers: { Authorization: `Token ${token}` },
          });
          setPosts(posts.filter(p => p.id !== postId));
        } catch (err) {
          Alert.alert('刪除失敗');
        }
      }}
    ]);
  };

  // 編輯個人檔案功能
  const handleEditProfile = async () => {
    setEditLoading(true);
    try {
      const res = await fetch('http://10.0.2.2:8000/api/users/profile/', {
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
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditModalVisible(false);
      } else {
        Alert.alert('更新失敗');
      }
    } catch (err) {
      Alert.alert('更新失敗');
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

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.profileInfo}>
          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio || '這裡是自我介紹...'}</Text>
          
          <SkillTags skills={profile.skills || []} />
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{posts.length}</Text>
              <Text style={styles.statLabel}>貼文</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{profile.following_count}</Text>
              <Text style={styles.statLabel}>追蹤</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{profile.followers_count}</Text>
              <Text style={styles.statLabel}>粉絲</Text>
            </View>
          </View>
          
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
        
        {/* 作品集 */}
        {activeTab === 'portfolio' && (
          <View style={styles.contentContainer}>
            {/* 添加作品集管理按鈕 */}
            {isMe && (
              <TouchableOpacity 
                style={styles.portfolioManageButton}
                onPress={() => navigation.navigate('Portfolio')}
                activeOpacity={0.8}
              >
                <Ionicons name="briefcase-outline" size={18} color={COLORS.primary} />
                <Text style={styles.portfolioManageText}>管理作品集</Text>
              </TouchableOpacity>
            )}

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
                    {item.image && (
                      <Image source={{ uri: item.image }} style={styles.portfolioImage} />
                    )}
                    <View style={styles.portfolioContent}>
                      <Text style={styles.portfolioTitle}>{item.title}</Text>
                      <Text style={styles.portfolioDesc} numberOfLines={2}>{item.description}</Text>
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
              <View style={styles.avatarEditSection}>
                <AvatarUploader
                  avatarUrl={editAvatar}
                  onPick={() => {}}
                  size={100}
                />
                <TouchableOpacity style={styles.avatarEditButton}>
                  <Ionicons name="camera" size={18} color={COLORS.primary} />
                  <Text style={styles.avatarEditText}>更換頭像</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.label}>自我介紹</Text>
              <TextInput
                value={editBio}
                onChangeText={setEditBio}
                style={styles.input}
                placeholder="告訴大家你是誰..."
                placeholderTextColor={COLORS.placeholder}
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.label}>技能標籤 (以逗號分隔)</Text>
              <TextInput
                value={editSkills}
                onChangeText={setEditSkills}
                style={styles.input}
                placeholder="如：React Native, Node.js, UI Design"
                placeholderTextColor={COLORS.placeholder}
              />
              
              <View style={styles.inputFooter}>
                <Text style={styles.helperText}>添加你的專業技能，讓大家更了解你</Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.saveButton, editLoading && styles.saveButtonDisabled]}
                onPress={handleEditProfile}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.saveButtonText}>儲存更改</Text>
                )}
              </TouchableOpacity>
            </View>
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: LAYOUT.headerHeight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerTitleText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  avatarContainer: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: COLORS.background,
    zIndex: 20,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT + SPACING.lg,
    minHeight: Dimensions.get('window').height - LAYOUT.safeBottom,
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  username: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.xl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  bio: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.md,
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  statNum: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  editBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  editBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    marginLeft: SPACING.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    position: 'relative',
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
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
  },
  postContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  deleteBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: `${COLORS.error}99`,
    borderRadius: RADIUS.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  portfolioGrid: {
    flexDirection: 'column',
  },
  portfolioCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  portfolioImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.elevated,
  },
  portfolioContent: {
    padding: SPACING.md,
  },
  portfolioTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  portfolioDesc: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    marginBottom: SPACING.md,
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
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  link: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    marginTop: SPACING.md,
  },
  footer: {
    height: LAYOUT.safeBottom + SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: `${COLORS.primary}CC`,
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  avatarEditSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
    ...SHADOW.sm,
  },
  avatarEditText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
    marginLeft: 4,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 50,
  },
  inputFooter: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  helperText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xs,
    color: COLORS.subText,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    padding: SPACING.md,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.primary,
  },
  portfolioManageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  portfolioManageText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  emptyButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.md,
  },
  emptyButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
  },
});

export default ProfileScreen;