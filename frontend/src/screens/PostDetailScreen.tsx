// 貼文詳情頁面檔案，顯示貼文詳情並允許互動

import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import axios from 'axios';  // 用於發送 HTTP 請求
import { useAuth } from '../context/AuthContext';

// 定義 Post 型別
interface Post {
  id: number;
  author: { username: string };
  content: string;
  like_count?: number;
  comment_count?: number;
  repost_count?: number;
}

const PostDetailScreen: React.FC<{ route: any }> = ({ route }) => {
  const { token } = useAuth();
  const { postId } = route.params;  // 獲取路由傳遞的貼文 ID
  const [post, setPost] = useState<Post | null>(null);  // 儲存貼文詳情
  const [error, setError] = useState('');  // 儲存錯誤訊息
  const [comment, setComment] = useState(''); // 新增留言輸入框狀態

  useEffect(() => {
    // 頁面載入時獲取貼文詳情
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:8000/api/posts/posts/${postId}/`, {
          headers: { Authorization: `Token ${token}` },  // 動態傳入 Token
        });
        setPost(response.data);  // 設定貼文詳情
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

  if (!post) return <Text>載入中...</Text>;  // 貼文載入中的提示

  return (
    <View>
      <Text>{post.author.username}: {post.content}</Text>  
      <Text>點讚數：{post.like_count ?? 0}　留言數：{post.comment_count ?? 0}　轉發數：{post.repost_count ?? 0}</Text>
      <Button title="點讚" onPress={handleLike} />  
      <TextInput value={comment} onChangeText={setComment} placeholder="輸入留言..." />
      <Button title="留言" onPress={handleComment} />  
      <Button title="轉發" onPress={handleRepost} />  
      <Button title="儲存" onPress={handleSave} />  
      {error && <Text>{error}</Text>} 
    </View>
  );
};

export default PostDetailScreen;  // 導出貼文詳情頁面組件