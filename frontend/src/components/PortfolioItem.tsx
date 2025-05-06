// 作品集項組件，展示單個作品的詳情卡片
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Linking,
  Dimensions,
  Platform 
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Portfolio } from '../api/portfolios';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface PortfolioItemProps {
  portfolio: Portfolio;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = width - SPACING.lg * 2;

type RootStackParamList = {
  PortfolioDetail: { portfolioId: number };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const PortfolioItem: React.FC<PortfolioItemProps> = ({ 
  portfolio, 
  onEdit, 
  onDelete,
  isOwner = false
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [videoError, setVideoError] = useState(false);
  
  const hasLinks = !!(portfolio.github_url || portfolio.demo_url || portfolio.youtube_url);
  
  // 處理鏈接跳轉
  const handleOpenLink = (url: string | undefined) => {
    if (!url) return;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`無法打開鏈接: ${url}`);
      }
    });
  };
  
  // 渲染各種鏈接按鈕
  const renderLinks = () => {
    return (
      <View style={styles.linksContainer}>
        {portfolio.github_url && (
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleOpenLink(portfolio.github_url)}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-github" size={16} color={COLORS.text} />
            <Text style={styles.linkText}>GitHub</Text>
          </TouchableOpacity>
        )}
        
        {portfolio.demo_url && (
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleOpenLink(portfolio.demo_url)}
            activeOpacity={0.7}
          >
            <Ionicons name="globe-outline" size={16} color={COLORS.text} />
            <Text style={styles.linkText}>Demo</Text>
          </TouchableOpacity>
        )}
        
        {portfolio.youtube_url && (
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleOpenLink(portfolio.youtube_url)}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-youtube" size={16} color="#FF0000" />
            <Text style={styles.linkText}>YouTube</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 媒體區域：圖片或視頻 */}
      <TouchableOpacity 
        style={styles.mediaContainer}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PortfolioDetail', { portfolioId: portfolio.id })}
      >
        {portfolio.video_url && !videoError ? (
          <Video
            source={{ uri: portfolio.video_url }}
            style={styles.mediaContent}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            isLooping
            onError={() => setVideoError(true)}
          />
        ) : portfolio.image_url ? (
          <Image 
            source={{ uri: portfolio.image_url }} 
            style={styles.mediaContent} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.mediaContent, styles.placeholderMedia]}>
            <Ionicons name="image-outline" size={48} color={COLORS.subText} />
          </View>
        )}
        
        {/* 媒體標籤 */}
        {portfolio.video_url && !videoError && (
          <View style={styles.mediaTag}>
            <Ionicons name="videocam" size={12} color={COLORS.background} />
            <Text style={styles.mediaTagText}>影片</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {/* 內容區域 */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{portfolio.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{portfolio.description}</Text>
        
        {/* 鏈接區域 */}
        {hasLinks && renderLinks()}
        
        {/* 操作按鈕（只有擁有者可見） */}
        {isOwner && (
          <View style={styles.actionsContainer}>
            {onEdit && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={onEdit}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={16} color={COLORS.text} />
                <Text style={styles.actionText}>編輯</Text>
              </TouchableOpacity>
            )}
            
            {onDelete && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={onDelete}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.text} />
                <Text style={styles.actionText}>刪除</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOW.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mediaContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  mediaContent: {
    width: '100%',
    height: '100%',
  },
  placeholderMedia: {
    backgroundColor: COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaTag: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaTagText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.background,
    marginLeft: 3,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    marginBottom: SPACING.md,
    lineHeight: FONTS.size.md * FONTS.lineHeight.normal,
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  linkText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent,
    marginRight: SPACING.sm,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.text,
    marginLeft: 3,
  }
});

export default PortfolioItem; 