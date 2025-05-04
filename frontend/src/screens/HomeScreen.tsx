// 首頁檔案，顯示貼文列表並允許用戶發文

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import axios from 'axios';  // 用於發送 HTTP 請求

type Post = {
  id: number;
  author: { username: string };
  content: string;
};

const HomeScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);  // 儲存貼文列表
  const [content, setContent] = useState('');  // 儲存發文內容
  const [error, setError] = useState('');  // 儲存錯誤訊息

  useEffect(() => {
    // 頁面載入時獲取貼文列表
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:8000/api/posts/posts/', {
          headers: { Authorization: `Token YOUR_TOKEN_HERE` },  // 傳送認證 Token
        });
        setPosts(response.data);  // 設定貼文列表
      } catch (err) {
        setError('獲取貼文失敗');  // 設定錯誤訊息
      }
    };
    fetchPosts();  // 執行獲取資料函數
  }, []);  // 空依賴陣列，僅在初次渲染時執行

  const handlePost = async () => {
    // 處理發文邏輯
    try {
      await axios.post('http://10.0.2.2:8000/api/posts/posts/', {
        content,  // 傳送貼文內容
      }, {
        headers: { Authorization: `Token YOUR_TOKEN_HERE` },  // 傳送認證 Token
      });
      setContent('');  // 清空輸入框
      // 重新獲取貼文列表
      const response = await axios.get('http://10.0.2.2:8000/api/posts/posts/', {
        headers: { Authorization: `Token YOUR_TOKEN_HERE` },
      });
      setPosts(response.data);  // 更新貼文列表
    } catch (err) {
      setError('發文失敗');  // 設定錯誤訊息
    }
  };

  return (
    <View>
      <Text>發文</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="請輸入貼文內容"
      />
      <Button title="發文" onPress={handlePost} />  
      {error && <Text>{error}</Text>}  
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.author.username}: {item.content}</Text>
          </View>
        )}
      />  
    </View>
  );
};

export default HomeScreen;  // 導出首頁組件