// 搜尋頁面檔案，處理用戶和貼文的搜尋功能

import React, { useState } from 'react';  // 引入 React 核心功能與 useState 鉤子，用於管理組件狀態
import { View, Text, TextInput, Button, FlatList } from 'react-native';  // 引入 React Native 核心組件，用於構建 UI
import axios from 'axios';  // 引入 axios 函數庫，用於發送 HTTP 請求到後端 API

interface User {
  id: number;
  username: string;
}

interface Post {
  id: number;
  author: { username: string };
  content: string;
}

const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');  // 定義狀態變數 query，用於儲存用戶輸入的搜尋關鍵字
  const [users, setUsers] = useState<User[]>([]);  // 定義狀態變數 users，用於儲存搜尋到的用戶列表
  const [posts, setPosts] = useState<Post[]>([]);  // 定義狀態變數 posts，用於儲存搜尋到的貼文列表
  const [error, setError] = useState('');  // 定義狀態變數 error，用於儲存搜尋過程中的錯誤訊息

  const handleSearch = async () => {
    // 處理搜尋邏輯，當用戶點擊搜尋按鈕時觸發此函數
    try {
      // 發送 GET 請求到後端搜尋 API，傳遞查詢參數 q
      const response = await axios.get(`http://10.0.2.2:8000/api/search/search/?q=${query}`, {
        headers: { Authorization: `Token YOUR_TOKEN_HERE` },  // 添加認證 Token 到請求頭，需替換為實際 Token
      });
      setUsers(response.data.users);  // 更新 users 狀態，儲存搜尋到的用戶資料
      setPosts(response.data.posts);  // 更新 posts 狀態，儲存搜尋到的貼文資料
      setError('');  // 清空錯誤訊息
    } catch (err) {
      setError('搜尋失敗，請稍後再試');  // 若請求失敗，設定錯誤訊息
    }
  };

  return (
    <View>
      <Text>搜尋</Text>
      <TextInput
        value={query}  
        onChangeText={setQuery} 
        placeholder="請輸入關鍵字"  
      />
      <Button title="搜尋" onPress={handleSearch} />  
      {error && <Text>{error}</Text>}  

      <Text>用戶搜尋結果</Text> 
      <FlatList
        data={users} 
        keyExtractor={(item) => item.id.toString()}  
        renderItem={({ item }) => (
          <View>
            <Text>{item.username}</Text> 
          </View>
        )}
      />  

      <Text>貼文搜尋結果</Text>  
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

export default SearchScreen;  // 導出 SearchScreen 組件，供導航器或其他檔案使用