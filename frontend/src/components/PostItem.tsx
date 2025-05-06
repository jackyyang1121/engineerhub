// 貼文項目元件，用於顯示單一貼文
// 功能：顯示貼文內容、多媒體、程式碼區塊、互動按鈕
// 資料來源：貼文資料
// 資料流向：接收貼文資料，渲染貼文內容和互動功能

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Pressable } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, ANIMATION } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CodePreview from './CodePreview';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

type RootStackParamList = {
  Profile: { userId: number };
  PostDetail: { postId: number };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface PostItemProps {
  post: {
    id: number;
    author: {
      id: number;
      username: string;
      avatar?: string;
    };
    content: string;
    created_at: string;
    media?: Array<{
      id: number;
      file: string;
      file_type: 'image' | 'video';
    }>;
    code_blocks?: Array<{
      id: number;
      code: string;
      language: string;
    }>;
    like_count: number;
    comment_count: number;
    is_liked: boolean;
    is_saved: boolean;
  };
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
  onRepost: (postId: number) => void;
  onSave: (postId: number) => void;
}

const { width } = Dimensions.get('window');

const PostItem: React.FC<PostItemProps> = ({ post, onLike, onComment, onRepost, onSave }) => {
  const navigation = useNavigation<NavigationProp>();
  const [pressedAction, setPressedAction] = useState<string | null>(null);
  
  // 處理動畫效果
  const handlePressIn = (action: string) => {
    setPressedAction(action);
  };
  
  const handlePressOut = () => {
    setPressedAction(null);
  };
  
  // 獲取動作按鈕樣式（根據是否按下狀態）
  const getActionStyle = (action: string) => {
    return [
      styles.actionButton,
      pressedAction === action && styles.actionButtonPressed
    ];
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => navigation.navigate('Profile', { userId: post.author.id })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: post.author.avatar || 'https://placehold.co/200/darkgray/white?text=' + post.author.username.charAt(0).toUpperCase() }} 
            style={styles.avatar} 
          />
          <View style={styles.avatarBorder} />
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{post.author.username}</Text>
          <Text style={styles.time}>
            {formatDistanceToNow(new Date(post.created_at), { 
              addSuffix: true,
              locale: zhTW 
            })}
          </Text>
        </View>
      </TouchableOpacity>

      <Pressable 
        style={({ pressed }) => [styles.content, pressed && styles.contentPressed]}
        onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
      >
        <Text style={styles.text}>{post.content}</Text>

        {post.media && post.media.length > 0 && (
          <View style={styles.mediaContainer}>
            {post.media.map((item) => (
              <View key={item.id} style={styles.mediaWrapper}>
                <Image
                  source={{ uri: item.file }}
                  style={styles.media}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        )}

        {post.code_blocks && post.code_blocks.map((block) => (
          <CodePreview
            key={block.id}
            code={block.code}
            language={block.language}
          />
        ))}
      </Pressable>

      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => getActionStyle('like')}
          onPress={() => onLike(post.id)}
          onPressIn={() => handlePressIn('like')}
          onPressOut={handlePressOut}
          android_ripple={{ color: COLORS.ripple, borderless: true, radius: 20 }}
        >
          <Ionicons 
            name={post.is_liked ? "heart" : "heart-outline"} 
            size={22} 
            color={post.is_liked ? COLORS.error : COLORS.accent} 
          />
          <Text style={[styles.actionText, post.is_liked && styles.actionTextActive]}>
            {post.like_count > 0 ? post.like_count : ''}
          </Text>
        </Pressable>

        <Pressable 
          style={({ pressed }) => getActionStyle('comment')}
          onPress={() => onComment(post.id)}
          onPressIn={() => handlePressIn('comment')}
          onPressOut={handlePressOut}
          android_ripple={{ color: COLORS.ripple, borderless: true, radius: 20 }}
        >
          <Ionicons name="chatbubble-outline" size={21} color={COLORS.accent} />
          <Text style={styles.actionText}>
            {post.comment_count > 0 ? post.comment_count : ''}
          </Text>
        </Pressable>

        <Pressable 
          style={({ pressed }) => getActionStyle('repost')}
          onPress={() => onRepost(post.id)}
          onPressIn={() => handlePressIn('repost')}
          onPressOut={handlePressOut}
          android_ripple={{ color: COLORS.ripple, borderless: true, radius: 20 }}
        >
          <Ionicons name="repeat-outline" size={24} color={COLORS.accent} />
        </Pressable>

        <Pressable 
          style={({ pressed }) => getActionStyle('save')}
          onPress={() => onSave(post.id)}
          onPressIn={() => handlePressIn('save')}
          onPressOut={handlePressOut}
          android_ripple={{ color: COLORS.ripple, borderless: true, radius: 20 }}
        >
          <Ionicons 
            name={post.is_saved ? "bookmark" : "bookmark-outline"} 
            size={22} 
            color={post.is_saved ? COLORS.highlight : COLORS.accent} 
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
  },
  avatarBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    opacity: 0.7,
  },
  headerInfo: {
    flex: 1,
  },
  username: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginBottom: 2,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  time: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xs,
    color: COLORS.subText,
  },
  content: {
    padding: SPACING.md,
  },
  contentPressed: {
    backgroundColor: `${COLORS.elevated}40`, // 40% opacity
  },
  text: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    lineHeight: FONTS.size.md * FONTS.lineHeight.normal,
    marginBottom: SPACING.md,
  },
  mediaContainer: {
    marginBottom: SPACING.sm,
  },
  mediaWrapper: {
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  media: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.elevated, // 預載背景色
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  actionButtonPressed: {
    backgroundColor: `${COLORS.accent}15`, // 15% opacity
  },
  actionText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    marginLeft: 4,
    minWidth: 20, // 確保數字有固定最小寬度
  },
  actionTextActive: {
    color: COLORS.error,
  },
});

export default PostItem;
