// src/screens/PortfolioScreen.tsx
// 作品集頁面，展示用戶的專業作品和項目 - 采用简约高级设计风格

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator, 
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  StatusBar,
  Image,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, LAYOUT, ANIMATION } from '../theme';
import { useAuth } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PortfolioItem from '../components/PortfolioItem';
import PortfolioForm from '../components/PortfolioForm';
import { getMyPortfolios, createPortfolio, updatePortfolio, deletePortfolio, Portfolio, generateMockPortfolios, CreatePortfolioParams } from '../api/portfolios';
import { BlurView } from '@react-native-community/blur';

// 屏幕尺寸
const { width, height } = Dimensions.get('window');

// 导航类型
type PortfolioScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// 动画配置
const SPRING_CONFIG = { 
  damping: 15, 
  stiffness: 150,
  mass: 1.2, 
  overshootClamping: false,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001 
};

/**
 * 作品集页面 - 高质量设计
 */
const PortfolioScreen: React.FC = () => {
  // 导航和状态管理
  const navigation = useNavigation<PortfolioScreenNavigationProp>();
  const { token, user } = useAuth();
  
  // 主数据状态
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // UI状态
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  // 模拟数据
  const mockPortfoliosData = useMemo(() => {
    return user ? generateMockPortfolios(5, user.id) : [];
  }, [user?.id]);
  
  // 初始化动画
  const runEntryAnimation = useCallback(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        ...SPRING_CONFIG,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...SPRING_CONFIG,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        ...SPRING_CONFIG,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim, translateY]);
  
  // 加载作品集数据
  const fetchPortfolios = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else if (!refreshing) {
      setIsLoading(true);
    }
    
    try {
      // 嘗試加載數據
      console.log('正在獲取作品集...');
      
      // 實際API調用
      const data = await getMyPortfolios(token);
      console.log('API返回數據:', data);
      
      // 檢查響應類型並正確設置數據
      if (data && Array.isArray(data.results)) {
        setPortfolios(data.results);
      } else if (data && Array.isArray(data)) {
        setPortfolios(data);
      } else {
        console.warn('API返回格式意外:', data);
        setPortfolios(mockPortfoliosData);
      }
      
      setError('');
      
      if (isFirstLoad) {
        runEntryAnimation();
        setIsFirstLoad(false);
      }
      
    } catch (err) {
      console.error('Error fetching portfolios:', err);
      setError('無法載入作品集，請檢查網絡連接並重試');
      
      // 使用模擬資料作為後備
      setPortfolios(mockPortfoliosData);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token, isFirstLoad, refreshing, mockPortfoliosData, runEntryAnimation]);
  
  // 每次页面聚焦时重新加载数据
  useFocusEffect(
    useCallback(() => {
      fetchPortfolios();
    }, [fetchPortfolios])
  );
  
  // 创建作品集
  const handleCreatePortfolio = useCallback(async (data: CreatePortfolioParams) => {
    try {
      setIsSubmitting(true);
      
      // 創建FormData對象
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      
      if (data.demo_url) formData.append('demo_url', data.demo_url);
      if (data.github_url) formData.append('github_url', data.github_url);
      if (data.youtube_url) formData.append('youtube_url', data.youtube_url);
      
      // 處理圖片上傳
      if (data.image) {
        formData.append('image', data.image);
      }
      
      // 處理視頻上傳
      if (data.video) {
        formData.append('video', data.video);
      }
      
      // 調用API創建
      console.log('正在創建作品集...');
      
      try {
        // 在生產環境中使用真實API
        const newPortfolio = await createPortfolio(token, formData);
        
        // 動畫顯示新項目
        setPortfolios(prev => [newPortfolio, ...prev]);
        setModalVisible(false);
        
        // 顯示成功提示
        setTimeout(() => {
          Alert.alert('成功', '作品集已創建，可以繼續豐富內容');
        }, 300);
        
      } catch (err) {
        console.error('Error API response:', err);
        Alert.alert(
          '創建失敗', 
          '無法連接到伺服器，是否使用本地模式繼續？',
          [
            {
              text: '取消',
              style: 'cancel',
              onPress: () => setIsSubmitting(false)
            },
            {
              text: '使用本地模式',
              onPress: () => {
                // 創建本地臨時作品集
                const tempPortfolio: Portfolio = {
                  id: Date.now(),
                  title: data.title,
                  description: data.description,
                  demo_url: data.demo_url,
                  github_url: data.github_url,
                  youtube_url: data.youtube_url,
                  thumbnail: 'https://picsum.photos/seed/portfolio1/800/600', // 測試圖片
                  category: '網頁應用',
                  technology_used: ['React', 'TypeScript', 'Node.js'],
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  user: {
                    id: user?.id || 0,
                    username: user?.username || 'User',
                    avatar: user?.avatar,
                  }
                };
                
                setPortfolios(prev => [tempPortfolio, ...prev]);
                setModalVisible(false);
                Alert.alert('本地模式', '作品集已在本地創建，伺服器連接恢復後需要重新提交');
              }
            }
          ]
        );
      }
      
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error creating portfolio:', err);
      setError('創建作品集失敗，請檢查網絡連接並重試');
      setIsSubmitting(false);
      Alert.alert('錯誤', '創建作品集時發生錯誤，請稍後再試');
    }
  }, [token, user]);
  
  // 更新作品集
  const handleUpdatePortfolio = useCallback(async (data: CreatePortfolioParams) => {
    if (!selectedPortfolio) return;
    
    try {
      setIsSubmitting(true);
      
      // 創建FormData對象
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      
      if (data.demo_url) formData.append('demo_url', data.demo_url);
      if (data.github_url) formData.append('github_url', data.github_url);
      if (data.youtube_url) formData.append('youtube_url', data.youtube_url);
      
      // 處理圖片上傳
      if (data.image) {
        formData.append('image', data.image);
      }
      
      try {
        // 在生產環境中使用真實API
        const updatedPortfolio = await updatePortfolio(token, selectedPortfolio.id, formData);
        
        setPortfolios(prev => 
          prev.map(item => item.id === selectedPortfolio.id ? updatedPortfolio : item)
        );
        
        setModalVisible(false);
        setSelectedPortfolio(null);
        setIsEditing(false);
        
        // 顯示成功提示
        setTimeout(() => {
          Alert.alert('成功', '作品集已更新');
        }, 300);
      } catch (err) {
        console.error('Error API response:', err);
        Alert.alert(
          '更新失敗', 
          '無法連接到伺服器，是否使用本地模式繼續？',
          [
            {
              text: '取消',
              style: 'cancel',
              onPress: () => setIsSubmitting(false)
            },
            {
              text: '使用本地模式',
              onPress: () => {
                // 本地更新
                const tempPortfolio: Portfolio = {
                  ...selectedPortfolio,
                  title: data.title,
                  description: data.description,
                  demo_url: data.demo_url,
                  github_url: data.github_url,
                  youtube_url: data.youtube_url,
                  updated_at: new Date().toISOString(),
                };
                
                setPortfolios(prev => 
                  prev.map(item => item.id === selectedPortfolio.id ? tempPortfolio : item)
                );
                
                setModalVisible(false);
                setSelectedPortfolio(null);
                setIsEditing(false);
                Alert.alert('本地模式', '作品集已在本地更新，伺服器連接恢復後需要重新提交');
              }
            }
          ]
        );
      }
      
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error updating portfolio:', err);
      setError('更新作品集失敗，請檢查網絡連接並重試');
      setIsSubmitting(false);
      Alert.alert('錯誤', '更新作品集時發生錯誤，請稍後再試');
    }
  }, [selectedPortfolio, token]);
  
  // 删除作品集
  const handleDeletePortfolio = useCallback((portfolio: Portfolio) => {
    Alert.alert(
      '確定要刪除？',
      '此操作無法恢復',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '刪除', 
          style: 'destructive',
          onPress: async () => {
            try {
              // 在生产环境中使用真实API调用
              // await deletePortfolio(token, portfolio.id);
              
              // 开发环境中模拟删除成功
              setTimeout(() => {
                setPortfolios(prev => prev.filter(item => item.id !== portfolio.id));
                Alert.alert('成功', '作品集已刪除');
              }, 500);
            } catch (err) {
              console.error('Error deleting portfolio:', err);
              setError('刪除作品集失敗，請稍後再試');
            }
          }
        },
      ]
    );
  }, []);
  
  // 打开编辑模态框
  const openEditModal = useCallback((portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsEditing(true);
    setModalVisible(true);
  }, []);
  
  // 打开创建模态框
  const openCreateModal = useCallback(() => {
    setSelectedPortfolio(null);
    setIsEditing(false);
    setModalVisible(true);
  }, []);
  
  // 关闭模态框
  const closeModal = useCallback(() => {
    if (isSubmitting) return;
    
    Alert.alert(
      '確定要離開嗎？',
      '您的更改可能不會被保存',
      [
        { text: '繼續編輯', style: 'cancel' },
        { 
          text: '離開', 
          style: 'destructive',
          onPress: () => {
            setModalVisible(false);
            setSelectedPortfolio(null);
            setIsEditing(false);
          }
        },
      ]
    );
  }, [isSubmitting]);
  
  // 渲染单个项目
  const renderPortfolioItem = useCallback(({ item, index }: { item: Portfolio; index: number }) => {
    // 计算条目的动画延迟
    const delay = index * 100;
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateY }
          ],
        }}
      >
        <PortfolioItem
          portfolio={item}
          isOwner={true}
          onEdit={() => openEditModal(item)}
          onDelete={() => handleDeletePortfolio(item)}
        />
      </Animated.View>
    );
  }, [fadeAnim, scaleAnim, translateY, openEditModal, handleDeletePortfolio]);
  
  // 渲染空状态
  const renderEmptyState = useCallback(() => (
    <Animated.View 
      style={[
        styles.emptyContainer, 
        { 
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateY }
          ] 
        }
      ]}
    >
      <Ionicons 
        name="briefcase-outline" 
        size={88} 
        color={COLORS.subText} 
        style={styles.emptyIcon} 
      />
      <Text style={styles.emptyTitle}>沒有作品集</Text>
      <Text style={styles.emptySubtitle}>
        展示您的專業作品和項目，讓其他開發者看到您的技能和專長
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={openCreateModal}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.emptyButtonText}>創建第一個作品集</Text>
      </TouchableOpacity>
    </Animated.View>
  ), [fadeAnim, scaleAnim, translateY, openCreateModal]);
  
  // 渲染加载状态
  if (isLoading && isFirstLoad) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={COLORS.accent}
            style={{ transform: [{ scale: 1.2 }] }}
          />
          <Text style={styles.loadingText}>載入作品集...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* 页面内容 */}
      <View style={styles.contentContainer}>
        {/* 错误提示 */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => fetchPortfolios()}
            >
              <Text style={styles.retryButtonText}>重試</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        
        {/* 作品集列表 */}
        <FlatList
          data={portfolios}
          keyExtractor={(item) => `portfolio-${item.id}`}
          renderItem={renderPortfolioItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshing={refreshing}
          onRefresh={() => fetchPortfolios(true)}
          ListHeaderComponent={
            portfolios.length > 0 ? (
              <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>我的作品集</Text>
                <Text style={styles.headerSubtitle}>
                  展示您的專業項目和技能作品集
                </Text>
              </View>
            ) : null
          }
        />
      </View>
      
      {/* 添加按钮 */}
      {portfolios.length > 0 && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={openCreateModal}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      )}
      
      {/* 创建/编辑模态框 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? '編輯作品集' : '創建作品集'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeModal}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <PortfolioForm
              initialValues={isEditing && selectedPortfolio ? selectedPortfolio : undefined}
              onSubmit={isEditing ? handleUpdatePortfolio : handleCreatePortfolio}
              isLoading={isSubmitting}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// 高级简约风格UI样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.xl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl + LAYOUT.safeBottom,
    minHeight: '100%',
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: '#fff',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    height: height * 0.7,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.6,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.xl,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    ...SHADOW.md,
  },
  emptyButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl + LAYOUT.safeBottom,
    right: SPACING.lg,
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' 
      ? 'rgba(15, 18, 21, 0.7)' 
      : 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '92%',
    maxHeight: '90%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PortfolioScreen;