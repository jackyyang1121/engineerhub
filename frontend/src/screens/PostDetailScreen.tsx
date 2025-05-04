// 貼文詳情頁面檔案，處理單一貼文的顯示、互動、留言等功能

import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Image, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, SafeAreaView } from 'react-native';
import axios from 'axios';  // 用於發送 HTTP 請求
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

// 定義 Post 型別
interface Post {
  id: number;
  author: { username: string, avatar?: string };
  content: string;
  like_count?: number;
  comment_count?: number;
  repost_count?: number;
}

interface Comment {
  id: number;
  user: { username: string };
  text: string;
}

const PostDetailScreen: React.FC<{ route: any }> = ({ route }) => {
  const { token } = useAuth();
  const { postId } = route.params;  // 獲取路由傳遞的貼文 ID
  const [post, setPost] = useState<Post | null>(null);  // 儲存貼文詳情
  const [error, setError] = useState('');  // 儲存錯誤訊息
  const [comment, setComment] = useState(''); // 新增留言輸入框狀態
  const [comments, setComments] = useState<Comment[]>([]); // 儲存評論

  useEffect(() => {
    // 頁面載入時獲取貼文詳情
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:8000/api/posts/posts/${postId}/`, {
          headers: { Authorization: `Token ${token}` },  // 動態傳入 Token
        });
        setPost(response.data);  // 設定貼文詳情
        setComments(response.data.comments); // 設定評論
      } catch (err) {
        setError('獲取貼文詳情失敗');  // 設定錯誤訊息
      }
    };
    fetchPost();  // 執行獲取資料函數
  }, [postId, token]);  // 依賴 postId, token

  const handleLike = async () => {
    // 處理點讚邏輯
    try {
      await axios.post('http://10.0.2.2:8000/api/posts/likes/', {
        post: postId,  // 傳送貼文 ID
      }, {
        headers: { Authorization: `Token ${token}` },  // 動態傳入 Token
      });
      console.log('點讚成功');  // 輸出成功訊息
    } catch (err) {
      setError('點讚失敗');  // 設定錯誤訊息
    }
  };

  const handleComment = async () => {
    // 處理留言邏輯（此處僅為示範，實際應有留言輸入）
    try {
      await axios.post('http://10.0.2.2:8000/api/posts/comments/', {
        post: postId,  // 傳送貼文 ID
        content: comment,  // 使用輸入框內容
      }, {
        headers: { Authorization: `Token ${token}` },  // 動態傳入 Token
      });
      setComment(''); // 清空留言框
      console.log('留言成功');  // 輸出成功訊息
    } catch (err) {
      setError('留言失敗');  // 設定錯誤訊息
    }
  };

  const handleRepost = async () => {
    // 處理轉發邏輯
    try {
      await axios.post('http://10.0.2.2:8000/api/posts/reposts/', {
        original_post: postId,  // 傳送原貼文 ID
      }, {
        headers: { Authorization: `Token ${token}` },  // 動態傳入 Token
      });
      console.log('轉發成功');  // 輸出成功訊息
    } catch (err) {
      setError('轉發失敗');  // 設定錯誤訊息
    }
  };

  const handleSave = async () => {
    // 處理儲存貼文邏輯
    try {
      await axios.post('http://10.0.2.2:8000/api/posts/saves/', {
        post: postId,  // 傳送貼文 ID
      }, {
        headers: { Authorization: `Token ${token}` },  // 動態傳入 Token
      });
      console.log('儲存成功');  // 輸出成功訊息
    } catch (err) {
      setError('儲存失敗');  // 設定錯誤訊息
    }
  };

  if (!post) return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={comments}
          keyExtractor={(item: Comment) => item.id.toString()}
          ListHeaderComponent={
            <>
              <View style={styles.headerRow}>
                <Image source={{ uri: post.author.avatar || 'https://placehold.co/56x56' }} style={styles.avatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{post.author.username}</Text>
                  <Text style={styles.time}>2小時前</Text>
                </View>
              </View>
              <Text style={styles.content}>{post.content}</Text>
              <View style={styles.footerRow}>
                <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={handleLike}>
                  <Text style={styles.iconText}>點讚</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                  <Text style={styles.iconText}>評論</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={handleRepost}>
                  <Text style={styles.iconText}>分享</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          renderItem={({ item }: { item: Comment }) => (
            <View style={styles.commentCard}>
              <Text style={styles.commentUser}>{item.user.username}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.inputBar}>
          <TextInput 
            style={styles.input} 
            placeholder="發表留言..." 
            placeholderTextColor={COLORS.subText}
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity style={styles.sendBtn} activeOpacity={0.85} onPress={handleComment}>
            <Text style={styles.sendBtnText}>送出</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  userInfo: {
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  username: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: 4,
  },
  time: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
  },
  content: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  iconBtn: {
    padding: 8,
  },
  iconText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
  },
  commentCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  commentUser: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginBottom: 4,
  },
  commentText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  sendBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendBtnText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
  },
});

export default PostDetailScreen;  // 導出貼文詳情頁面組件