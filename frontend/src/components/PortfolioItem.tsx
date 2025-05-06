// 作品集项目组件，用于显示单个作品集卡片
// 设计理念：简约、高级、卡片式布局

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

  return (
    <TouchableOpacity 
      style={styles.portfolioItem}
      activeOpacity={0.9}
    >
      <View style={styles.thumbnailContainer}>
        {portfolio.thumbnail ? (
          <Image 
            source={{ uri: portfolio.thumbnail }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Ionicons 
              name={portfolioIconProps.name}
              size={40} 
              color={COLORS.subText} 
            />
          </View>
        )}
      </View>
      
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle} numberOfLines={1}>{portfolio.title}</Text>
          <Text style={styles.itemCategory}>{portfolio.category}</Text>
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
  );
};

const styles = StyleSheet.create({
  portfolioItem: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  thumbnailContainer: {
    height: ITEM_HEIGHT,
    width: '100%',
    backgroundColor: COLORS.elevated,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.accent}15`,
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
  itemCategory: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.accent,
    backgroundColor: `${COLORS.accent}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    marginLeft: SPACING.sm,
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
    backgroundColor: COLORS.elevated,
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
});

export default PortfolioItem; 