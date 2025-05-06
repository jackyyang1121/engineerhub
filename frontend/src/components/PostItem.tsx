// 貼文項目元件，用於顯示單一貼文
// 功能：顯示貼文內容、多媒體、程式碼區塊、互動按鈕
// 資料來源：貼文資料
// 資料流向：接收貼文資料，渲染貼文內容和互動功能

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';
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

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => navigation.navigate('Profile', { userId: post.author.id })}
      >
        <Image 
          source={{ uri: post.author.avatar || 'https://placehold.co/40x40' }} 
          style={styles.avatar} 
        />
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

      <TouchableOpacity 
        style={styles.content}
        onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
      >
        <Text style={styles.text}>{post.content}</Text>

        {post.media && post.media.length > 0 && (
          <View style={styles.mediaContainer}>
            {post.media.map((item) => (
              <Image
                key={item.id}
                source={{ uri: item.file }}
                style={styles.media}
                resizeMode="cover"
              />
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
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
        >
          <Ionicons 
            name={post.is_liked ? "heart" : "heart-outline"} 
            size={24} 
            color={post.is_liked ? COLORS.error : COLORS.accent} 
          />
          <Text style={styles.actionText}>{post.like_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onComment(post.id)}
        >
          <Ionicons name="chatbubble-outline" size={24} color={COLORS.accent} />
          <Text style={styles.actionText}>{post.comment_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onRepost(post.id)}
        >
          <Ionicons name="repeat-outline" size={24} color={COLORS.accent} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onSave(post.id)}
        >
          <Ionicons 
            name={post.is_saved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={post.is_saved ? COLORS.accent : COLORS.accent} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: 16,
    padding: 16,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerInfo: {
    flex: 1,
  },
  username: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    marginBottom: 2,
  },
  time: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xs,
    color: COLORS.subText,
  },
  content: {
    marginBottom: 12,
  },
  text: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  mediaContainer: {
    marginBottom: 12,
  },
  media: {
    width: width - 64,
    height: 200,
    borderRadius: RADIUS.sm,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  actionText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    marginLeft: 4,
  },
});

export default PostItem;
