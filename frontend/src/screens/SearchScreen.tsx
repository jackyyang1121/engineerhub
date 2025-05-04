// 搜尋頁面檔案，處理用戶和貼文的搜尋功能

import React, { useState } from 'react';  // 引入 React 核心功能與 useState 鉤子，用於管理組件狀態
import { View, Text, TextInput, Button, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, SectionList, SafeAreaView } from 'react-native';  // 引入 React Native 核心組件，用於構建 UI
import axios from 'axios';  // 引入 axios 函數庫，用於發送 HTTP 請求到後端 API
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';
import { StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

// 定義用戶型別
interface User {
  id: number;
  username: string;
}

// 定義貼文型別
interface Post {
  id: number;
  author: { username: string };
  content: string;
}

// Skeleton 元件，用於載入中狀態的佔位顯示
const SkeletonResult = () => (
  <View style={[styles.resultCard, { opacity: 0.5 }]}> 
    <View style={{ width: '60%', height: 18, backgroundColor: COLORS.border, borderRadius: 6 }} />
  </View>
);

// 搜尋頁面組件
const SearchScreen: React.FC = () => {
  const { token } = useAuth();  // 使用 useAuth hook 獲取 token
  const [query, setQuery] = useState('');  // 定義狀態變數 query，用於儲存用戶輸入的搜尋關鍵字
  const [users, setUsers] = useState<User[]>([]);  // 定義狀態變數 users，用於儲存搜尋到的用戶列表
  const [posts, setPosts] = useState<Post[]>([]);  // 定義狀態變數 posts，用於儲存搜尋到的貼文列表
  const [error, setError] = useState('');  // 定義狀態變數 error，用於儲存搜尋過程中的錯誤訊息
  const [loading, setLoading] = useState(false);  // 定義狀態變數 loading，用於控制載入中狀態

  // 處理搜尋請求
  const handleSearch = async () => {
    setLoading(true);
    try {
      if (!token) return;
      // 根據 apps/search/search/ 設定 API 路徑
      const response = await axios.get(`http://10.0.2.2:8000/api/search/search/?q=${query}`, {
        headers: { Authorization: `Token ${token}` },
      });
      setUsers(response.data.users);  // 更新 users 狀態，儲存搜尋到的用戶資料
      setPosts(response.data.posts);  // 更新 posts 狀態，儲存搜尋到的貼文資料
      setError('');  // 清空錯誤訊息
    } catch (err) {
      setError('搜尋失敗，請稍後再試');  // 若請求失敗，設定錯誤訊息
    } finally {
      setLoading(false);
    }
  };

  // 載入中狀態顯示
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {[1,2,3].map(i => <SkeletonResult key={i} />)}
      </SafeAreaView>
    );
  }

  // 合併搜尋結果，避免 SectionList 型別錯誤
  const mergedResults = [
    ...users.map(u => ({ type: 'user', ...u })),
    ...posts.map(p => ({ type: 'post', ...p })),
  ];

  // 畫面渲染
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={mergedResults}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        style={styles.container}
        contentContainerStyle={[styles.listContent, { paddingTop: 16 }]}
        ListHeaderComponent={
          <View style={styles.stickyHeader}>
            <View style={styles.card}>
              <Text style={styles.header}>搜尋</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="請輸入關鍵字"
                style={styles.input}
                placeholderTextColor={COLORS.subText}
                accessibilityLabel="搜尋輸入框"
              />
              <TouchableOpacity style={styles.button} onPress={handleSearch} activeOpacity={0.85} accessibilityLabel="搜尋按鈕">
                <Text style={styles.buttonText}>搜尋</Text>
              </TouchableOpacity>
              {error && <Text style={styles.error}>{error}</Text>}
            </View>
          </View>
        }
        stickyHeaderIndices={[0]}
        renderItem={({ item }) => (
          item.type === 'user' ? (
            <View style={styles.resultCard} accessibilityLabel="用戶搜尋結果卡片">
              <Text style={styles.sectionTitle}>用戶搜尋結果</Text>
              <Text style={styles.resultText}>{(item as any).username}</Text>
            </View>
          ) : (
            <View style={styles.resultCard} accessibilityLabel="貼文搜尋結果卡片">
              <Text style={styles.sectionTitle}>貼文搜尋結果</Text>
              <Text style={styles.resultText}>{(item as any).author.username}: {(item as any).content}</Text>
            </View>
          )
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>查無結果，請嘗試其他關鍵字</Text>}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="搜尋結果列表"
      />
    </SafeAreaView>
  );
};

// 定義樣式
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  stickyHeader: {
    backgroundColor: COLORS.background,
    zIndex: 10,
    paddingTop: 0,
    paddingBottom: 0,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 22,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  header: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    marginBottom: 12,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOW,
  },
  buttonText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    letterSpacing: 1,
  },
  error: {
    color: COLORS.error,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    color: COLORS.subText,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    padding: 14,
    marginBottom: 10,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
  },
  emptyText: {
    color: COLORS.subText,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    textAlign: 'center',
    marginTop: 24,
  },
});

export default SearchScreen;  // 導出搜尋頁面組件