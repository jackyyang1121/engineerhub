// 首頁檔案，顯示推薦貼文列表並允許用戶發文，實現滑動式頁面瀏覽

import React, { useState, useEffect } from 'react';  // 引入 React 核心功能與鉤子
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';  // 引入 React Native 核心組件
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';  // 引入 axios 用於發送 HTTP 請求
import { useAuth } from '../context/AuthContext';  // 導入 useAuth hook

// 定義 Post 介面
interface Post {
  id: number;
  author: {
    username: string;
  };
  content: string;
  like_count: number;
}

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  PostDetail: undefined;
  Search: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { token } = useAuth();  // 使用 useAuth hook 獲取 token
  const [posts, setPosts] = useState<Post[]>([]);  // 使用 Post[] 型別
  const [content, setContent] = useState('');  // 定義狀態變數 content，用於儲存用戶輸入的發文內容
  const [error, setError] = useState('');  // 定義狀態變數 error，用於儲存錯誤訊息

  useEffect(() => {
    // 使用 useEffect 在組件初次渲染時獲取推薦貼文列表
    const fetchPosts = async () => {
      try {
        // 發送 GET 請求到後端 API 獲取貼文列表
        const response = await axios.get('http://10.0.2.2:8000/api/posts/posts/', {
          headers: { Authorization: `Token ${token}` },  // 使用 context 中的 token
        });
        setPosts(response.data);  // 將獲取的貼文資料更新到 posts 狀態
      } catch (err) {
        setError('獲取推薦貼文失敗');  // 若請求失敗，設定錯誤訊息
      }
    };
    if (token) {  // 只有在有 token 時才執行
      fetchPosts();
    }
  }, [token]);  // 依賴 token，當 token 改變時重新獲取資料

  const handlePost = async () => {
    // 處理發文邏輯，當用戶點擊發文按鈕時觸發
    if (!content.trim()) {
      setError('貼文內容不能為空');
      return;
    }
    try {
      // 發送 POST 請求到後端 API 創建新貼文
      await axios.post('http://10.0.2.2:8000/api/posts/posts/', {
        content,  // 傳送用戶輸入的貼文內容
      }, {
        headers: { Authorization: `Token ${token}` },  // 使用 context 中的 token
      });
      setContent('');  // 發文成功後清空輸入框
      // 重新獲取最新的推薦貼文列表
      const response = await axios.get('http://10.0.2.2:8000/api/posts/posts/', {
        headers: { Authorization: `Token ${token}` },  // 使用 context 中的 token
      });
      setPosts(response.data);  // 更新貼文列表狀態
      setError(''); // 發文成功清空錯誤訊息
    } catch (err) {
      setError('發文失敗');  // 若發文失敗，設定錯誤訊息
    }
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View>
          <Text>{item.author.username}: {item.content}</Text>
          <Text>點讚數: {item.like_count}</Text>
        </View>
      )}
      ListHeaderComponent={
        <View>
          <Text>發文</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="請輸入貼文內容"
          />
          <Button title="發文" onPress={handlePost} />
          {error && <Text>{error}</Text>}
        </View>
      }
      contentContainerStyle={{ padding: 24, paddingTop: 48, paddingBottom: 24 }}
    />
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default HomeScreen;  // 導出 HomeScreen 組件供其他檔案使用