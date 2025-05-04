// 已儲存貼文頁面檔案，顯示用戶儲存的貼文

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import axios from 'axios';

interface Post {
  id: number;
  content: string;
  author: {
    username: string;
  };
}

const SavedPostsScreen: React.FC = () => {
  // 定義狀態變數以儲存已儲存貼文和錯誤訊息
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);  // 已儲存貼文列表
  const [error, setError] = useState('');  // 錯誤訊息

  useEffect(() => {
    // 頁面載入時獲取已儲存貼文
    const fetchSavedPosts = async () => {
      try {
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

  return (
    <View>
      <Text>已儲存貼文</Text>
      {error && <Text>{error}</Text>}  {/* 顯示錯誤訊息 */}
      <FlatList
        data={savedPosts}  // 數據來源
        keyExtractor={(item) => item.id.toString()}  // 提取唯一鍵
        renderItem={({ item }) => (
          <View>
            <Text>{item.author.username}: {item.content}</Text>  {/* 顯示貼文作者與內容 */}
          </View>
        )}
      />
    </View>
  );
};

export default SavedPostsScreen;