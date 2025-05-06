// src/screens/PortfolioScreen.tsx
// 作品集頁面，展示用戶的專業作品和項目

import React, { useState, useEffect, useRef } from 'react';
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
  StatusBar
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, LAYOUT, ANIMATION } from '../theme';
import { useAuth } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PortfolioItem from '../components/PortfolioItem';
import PortfolioForm from '../components/PortfolioForm';
import { getMyPortfolios, createPortfolio, updatePortfolio, deletePortfolio, Portfolio } from '../api/portfolios';

const PortfolioScreen: React.FC = () => {
  const { token, user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // 動畫值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // 加載作品集數據
  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      const data = await getMyPortfolios(token);
      setPortfolios(data);
      setError('');
      
      // 第一次加載時的動畫
      if (isFirstLoad) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: ANIMATION.normal,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: ANIMATION.normal,
            useNativeDriver: true,
          })
        ]).start();
        setIsFirstLoad(false);
      }
    } catch (err) {
      setError('無法載入作品集，請稍後再試');
      console.error('Error fetching portfolios:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 首次載入
  useEffect(() => {
    fetchPortfolios();
  }, []);
  
  // 處理創建作品集
  const handleCreatePortfolio = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createPortfolio(token, data);
      await fetchPortfolios();
      setModalVisible(false);
      
      // 顯示成功提示
      Alert.alert('成功', '作品集已創建');
    } catch (err) {
      console.error('Error creating portfolio:', err);
      setError('創建作品集失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 處理更新作品集
  const handleUpdatePortfolio = async (data: any) => {
    if (!selectedPortfolio) return;
    
    try {
      setIsSubmitting(true);
      await updatePortfolio(token, selectedPortfolio.id, data);
      await fetchPortfolios();
      setModalVisible(false);
      setSelectedPortfolio(null);
      setIsEditing(false);
      
      // 顯示成功提示
      Alert.alert('成功', '作品集已更新');
    } catch (err) {
      console.error('Error updating portfolio:', err);
      setError('更新作品集失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 處理刪除作品集
  const handleDeletePortfolio = (portfolio: Portfolio) => {
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
              await deletePortfolio(token, portfolio.id);
              await fetchPortfolios();
              
              // 顯示成功提示
              Alert.alert('成功', '作品集已刪除');
            } catch (err) {
              console.error('Error deleting portfolio:', err);
              setError('刪除作品集失敗，請稍後再試');
            }
          }
        },
      ]
    );
  };
  
  // 打開編輯模態框
  const openEditModal = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsEditing(true);
    setModalVisible(true);
  };
  
  // 打開創建模態框
  const openCreateModal = () => {
    setSelectedPortfolio(null);
    setIsEditing(false);
    setModalVisible(true);
  };
  
  // 關閉模態框
  const closeModal = () => {
    // 提示用戶可能會遺失未保存的更改
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
  };
  
  // 渲染頁面標題
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>作品集</Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={openCreateModal}
      >
        <Ionicons name="add-outline" size={24} color={COLORS.primary} />
        <Text style={styles.addButtonText}>新建</Text>
      </TouchableOpacity>
    </View>
  );
  
  // 渲染空狀態
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="briefcase-outline" size={80} color={COLORS.subText} style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>沒有作品集</Text>
      <Text style={styles.emptySubtitle}>展示您的專業作品和項目，讓其他開發者看到您的技能</Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={openCreateModal}
      >
        <Text style={styles.emptyButtonText}>創建第一個作品集</Text>
      </TouchableOpacity>
    </View>
  );
  
  // 渲染載入狀態
  if (isLoading && isFirstLoad) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>載入作品集...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* 頁面標題 */}
      {renderHeader()}
      
      {/* 錯誤提示 */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      
      {/* 作品集列表 */}
      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <FlatList
          data={portfolios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PortfolioItem
              portfolio={item}
              isOwner={true}
              onEdit={() => openEditModal(item)}
              onDelete={() => handleDeletePortfolio(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshing={isLoading && !isFirstLoad}
          onRefresh={fetchPortfolios}
        />
      </Animated.View>
      
      {/* 添加按鈕 (FAB) */}
      {portfolios.length > 0 && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      )}
      
      {/* 創建/編輯模態框 */}
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
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <PortfolioForm
              initialValues={isEditing ? selectedPortfolio || undefined : undefined}
              onSubmit={isEditing ? handleUpdatePortfolio : handleCreatePortfolio}
              isLoading={isSubmitting}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.xl,
    color: COLORS.text,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  addButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.primary,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
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
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.error,
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
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.6,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
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
  },
  emptyButton: {
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
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl + LAYOUT.safeBottom,
    right: SPACING.lg,
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: `${COLORS.background}E6`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: COLORS.background,
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