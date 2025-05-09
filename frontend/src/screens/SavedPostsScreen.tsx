// 已儲存貼文頁面檔案，處理用戶儲存的貼文顯示與管理

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import axios from 'axios';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

// 定義貼文型別
interface Post {
  id: number;
  content: string;
  author: {
    username: string;
    avatar?: string;
  };
}

// 已儲存貼文頁面組件
const SavedPostsScreen: React.FC = () => {
  // 已儲存貼文列表狀態，存放從 API 取得的資料
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);  // 已儲存貼文列表
  // 錯誤訊息狀態
  const [error, setError] = useState('');  // 錯誤訊息

  // 頁面載入時自動取得已儲存貼文
  useEffect(() => {
    // 取得已儲存貼文的函數
    const fetchSavedPosts = async () => {
      try {
        // 發送 GET 請求到後端 API，取得用戶已儲存貼文
        const response = await axios.get('http://10.0.2.2:8000/api/users/saved-posts/', {
          headers: { Authorization: `Token YOUR_TOKEN_HERE` },  // 使用認證 Token
        });
        setSavedPosts(response.data);  // 設置已儲存貼文數據
      } catch (err) {
        setError('獲取已儲存貼文失敗');  // 設置錯誤訊息
      }
    };
    fetchSavedPosts();  // 執行獲取貼文函數
  }, []);

  // 畫面渲染：若無已儲存貼文，顯示友善提示
  if (!savedPosts || savedPosts.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>尚無儲存貼文</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 畫面渲染：有已儲存貼文時顯示列表
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={savedPosts}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card} accessibilityLabel="儲存貼文卡片">
            <View style={styles.row}>
              {/* 貼文作者頭像 */}
              <Image source={{ uri: item.author.avatar || 'https://placehold.co/40x40' }} style={styles.avatar} />
              <View style={styles.userInfo}>
                {/* 貼文作者名稱 */}
                <Text style={styles.username}>{item.author.username}</Text>
                {/* 貼文時間（此處為假資料） */}
                <Text style={styles.time}>2小時前</Text>
              </View>
            </View>
            {/* 貼文內容 */}
            <Text style={styles.content}>{item.content}</Text>
            {/* 貼文互動按鈕列 */}
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} accessibilityLabel="點讚按鈕">
                <Text style={styles.iconText}>點讚</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} accessibilityLabel="評論按鈕">
                <Text style={styles.iconText}>評論</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeBtn} activeOpacity={0.7} accessibilityLabel="移除儲存按鈕">
                <Text style={styles.removeBtnText}>移除</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

// 樣式定義
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  userInfo: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: 18,
    padding: 20,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  username: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  time: {
    color: COLORS.subText,
    fontSize: FONTS.size.xs,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  content: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  iconText: {
    color: COLORS.accent,
    fontSize: FONTS.size.sm,
    marginLeft: 4,
    fontFamily: FONTS.medium,
  },
  emptyText: {
    color: COLORS.subText,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
  },
  removeBtn: {
    backgroundColor: '#FF3B30',
    borderRadius: RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginLeft: 8,
    ...SHADOW,
  },
  removeBtnText: {
    color: '#fff',
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    letterSpacing: 1,
  },
});

export default SavedPostsScreen;  // 導出已儲存貼文頁面組件