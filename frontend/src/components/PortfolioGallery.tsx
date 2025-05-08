import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 0.62;

interface Portfolio {
  id: number;
  title: string;
  summary?: string;
  cover_image?: string;
  view_count?: number;
  like_count?: number;
  is_featured?: boolean;
  github_url?: string;
  demo_url?: string;
  youtube_url?: string;
  app_store_url?: string;
  google_play_url?: string;
}

interface PortfolioGalleryProps {
  portfolios: Portfolio[];
  title?: string;
  onViewAll?: () => void;
  onPortfolioPress: (portfolio: Portfolio) => void;
  themeColor?: string;
  isOwner?: boolean;
}

/**
 * 作品集畫廊組件 - 支持特色作品集展示
 */
const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  portfolios = [],
  title = '特色作品',
  onViewAll,
  onPortfolioPress,
  themeColor = COLORS.accent,
  isOwner = false,
}) => {
  if (!portfolios || portfolios.length === 0) {
    return isOwner ? (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: `${themeColor}33` }]}>
          <Ionicons name="briefcase-outline" size={40} color={themeColor} />
        </View>
        <Text style={styles.emptyTitle}>展示你的作品集</Text>
        <Text style={styles.emptySubtitle}>
          上傳你的專案作品，向大家展示你的技術實力
        </Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: themeColor }]}
          onPress={onViewAll}
        >
          <Ionicons name="add" size={20} color={COLORS.primary} />
          <Text style={styles.addButtonText}>創建作品集</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  }

  // 渲染作品集卡片
  const renderPortfolioCard = ({ item, index }: { item: Portfolio; index: number }) => {
    // 獲取一個顏色陰影，根據作品集在列表中的位置
    const getBackgroundColor = () => {
      const baseOpacity = 0.8;
      const opacity = baseOpacity - (index % 3) * 0.15;
      return `${themeColor}${Math.floor(opacity * 100)}`;
    };

    // 外部鏈接圖標
    const renderLinkIcons = () => {
      return (
        <View style={styles.linkIconsContainer}>
          {item.github_url && (
            <TouchableOpacity
              style={styles.linkIcon}
              onPress={() => Linking.openURL(item.github_url!)}
            >
              <Ionicons name="logo-github" size={18} color={COLORS.text} />
            </TouchableOpacity>
          )}
          
          {item.demo_url && (
            <TouchableOpacity
              style={styles.linkIcon}
              onPress={() => Linking.openURL(item.demo_url!)}
            >
              <Ionicons name="globe-outline" size={18} color={COLORS.text} />
            </TouchableOpacity>
          )}
          
          {item.youtube_url && (
            <TouchableOpacity
              style={styles.linkIcon}
              onPress={() => Linking.openURL(item.youtube_url!)}
            >
              <Ionicons name="logo-youtube" size={18} color={COLORS.text} />
            </TouchableOpacity>
          )}
        </View>
      );
    };

    // 渲染統計信息
    const renderStats = () => {
      return (
        <View style={styles.statsContainer}>
          {typeof item.view_count === 'number' && (
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color={COLORS.text} />
              <Text style={styles.statText}>{item.view_count}</Text>
            </View>
          )}
          
          {typeof item.like_count === 'number' && (
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={14} color={COLORS.text} />
              <Text style={styles.statText}>{item.like_count}</Text>
            </View>
          )}
          
          {item.is_featured && (
            <View style={[styles.featuredBadge, { backgroundColor: themeColor }]}>
              <Ionicons name="star" size={12} color={COLORS.primary} />
              <Text style={styles.featuredText}>特色</Text>
            </View>
          )}
        </View>
      );
    };

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => onPortfolioPress(item)}
      >
        <View style={styles.cardImageContainer}>
          {item.cover_image ? (
            <Image
              source={{ uri: item.cover_image }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: getBackgroundColor() }]}>
              <Ionicons name="cube-outline" size={40} color={COLORS.primary} />
            </View>
          )}
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.cardGradient}
          />
          
          {renderLinkIcons()}
          {renderStats()}
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.summary && (
            <Text style={styles.cardSummary} numberOfLines={2}>
              {item.summary}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onViewAll && portfolios.length > 0 && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={[styles.viewAllText, { color: themeColor }]}>查看全部</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={portfolios}
        renderItem={renderPortfolioCard}
        keyExtractor={(item) => `portfolio-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + SPACING.md}
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  viewAllText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  cardImageContainer: {
    width: '100%',
    height: CARD_HEIGHT,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  linkIconsContainer: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.background}77`,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  statsContainer: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.background}66`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
  },
  statText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.text,
    marginLeft: 4,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.xs,
  },
  featuredText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.xs,
    color: COLORS.primary,
    marginLeft: 2,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSummary: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    lineHeight: 20,
  },
  emptyContainer: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
  },
  addButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
});

export default PortfolioGallery; 