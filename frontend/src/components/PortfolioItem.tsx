// 作品集项目组件，用于显示单个作品集卡片
// 设计理念：简约、高级、卡片式布局，靈感來自Dribbble和Behance

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Animated,
  Pressable
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../theme';
import { getIconProps, FOLDER_ICONS } from '../utils/iconMap';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.85;
const ITEM_HEIGHT = ITEM_WIDTH * 0.65;

// 定义作品集类型
export interface Portfolio {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  demo_url?: string;
  github_url?: string;
  youtube_url?: string;
  category: string;
  technology_used: string[];
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
}

interface PortfolioItemProps {
  portfolio: Portfolio;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const PortfolioItem: React.FC<PortfolioItemProps> = ({ portfolio, isOwner, onEdit, onDelete }) => {
  // 获取图标属性
  const portfolioIconProps = getIconProps(FOLDER_ICONS.portfolio);
  const [showOptions, setShowOptions] = useState(false);
  
  // 切換選項菜單
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };
  
  // 處理外部鏈接點擊
  const handleLinkPress = (url?: string) => {
    if (!url) return;
    // 這裡應該處理打開外部鏈接
    console.log('Opening URL:', url);
  };

  return (
    <Animated.View style={styles.container}>
      <TouchableOpacity 
        style={styles.portfolioItem}
        activeOpacity={0.95}
        onPress={toggleOptions}
        onLongPress={toggleOptions}
      >
        <View style={styles.thumbnailContainer}>
          {portfolio.thumbnail ? (
            <>
              <Image 
                source={{ uri: portfolio.thumbnail }} 
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.thumbnailGradient}
              />
            </>
          ) : (
            <View style={styles.placeholderThumbnail}>
              <Ionicons 
                name={portfolioIconProps.name}
                size={40} 
                color={COLORS.subText} 
              />
            </View>
          )}
          
          {/* 外部鏈接圖標 */}
          <View style={styles.linkIconsContainer}>
            {portfolio.github_url && (
              <TouchableOpacity 
                style={styles.linkIconButton}
                onPress={() => handleLinkPress(portfolio.github_url)}
              >
                <Ionicons name="logo-github" size={18} color={COLORS.text} />
              </TouchableOpacity>
            )}
            
            {portfolio.demo_url && (
              <TouchableOpacity 
                style={styles.linkIconButton}
                onPress={() => handleLinkPress(portfolio.demo_url)}
              >
                <Ionicons name="open-outline" size={18} color={COLORS.text} />
              </TouchableOpacity>
            )}
            
            {portfolio.youtube_url && (
              <TouchableOpacity 
                style={styles.linkIconButton}
                onPress={() => handleLinkPress(portfolio.youtube_url)}
              >
                <Ionicons name="logo-youtube" size={18} color={COLORS.text} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* 類別標籤 */}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{portfolio.category}</Text>
          </View>
        </View>
        
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle} numberOfLines={1}>{portfolio.title}</Text>
            
            {isOwner && (
              <TouchableOpacity 
                style={styles.optionsButton}
                onPress={toggleOptions}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.subText} />
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.itemDescription} numberOfLines={2}>
            {portfolio.description}
          </Text>
          
          <View style={styles.techContainer}>
            {portfolio.technology_used.slice(0, 3).map((tech, index) => (
              <View key={`tech-${index}`} style={styles.techTag}>
                <Text style={styles.techText}>{tech}</Text>
              </View>
            ))}
            {portfolio.technology_used.length > 3 && (
              <View style={styles.moreTechTag}>
                <Text style={styles.moreTechText}>+{portfolio.technology_used.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
      
      {/* 選項菜單 */}
      {showOptions && isOwner && (
        <View style={styles.optionsMenu}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => {
              setShowOptions(false);
              onEdit();
            }}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.text} />
            <Text style={styles.optionText}>編輯</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, styles.deleteOption]}
            onPress={() => {
              setShowOptions(false);
              onDelete();
            }}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={[styles.optionText, styles.deleteOptionText]}>刪除</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* 遮罩層 */}
      {showOptions && (
        <Pressable 
          style={styles.overlay}
          onPress={() => setShowOptions(false)}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  portfolioItem: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW.md,
    zIndex: 1,
    elevation: 5,
  },
  thumbnailContainer: {
    height: ITEM_HEIGHT,
    width: '100%',
    backgroundColor: COLORS.elevated,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.accent}15`,
  },
  linkIconsContainer: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
  },
  linkIconButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.background}90`,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
    ...SHADOW.sm,
  },
  categoryTag: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: `${COLORS.primary}90`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  categoryText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.accent,
  },
  itemContent: {
    padding: SPACING.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  itemTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    flex: 1,
  },
  optionsButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  itemDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  techContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  techTag: {
    backgroundColor: `${COLORS.accent}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  techText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.subText,
  },
  moreTechTag: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  moreTechText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.text,
  },
  optionsMenu: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    zIndex: 2,
    ...SHADOW.lg,
    width: 120,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  optionText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  deleteOption: {
    marginTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  deleteOptionText: {
    color: COLORS.error,
  },
  overlay: {
    position: 'absolute',
    top: -SPACING.lg,
    left: -SPACING.lg,
    right: -SPACING.lg,
    bottom: -SPACING.lg,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});

export default PortfolioItem; 