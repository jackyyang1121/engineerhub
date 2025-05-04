import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import axios from 'axios';  // 用於發送 HTTP 請求
import { useAuth } from '../context/AuthContext';

interface Message {
  id: number;
  sender: { username: string };
  recipient: { username: string };
  content: string;
}

const MessagesScreen: React.FC = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);  // 儲存私訊列表
  const [content, setContent] = useState('');  // 儲存發送訊息內容
  const [recipient, setRecipient] = useState('');  // 儲存接收者用戶名
  const [error, setError] = useState('');  // 儲存錯誤訊息

  useEffect(() => {
    // 頁面載入時獲取私訊列表
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:8000/api/messages/messages/', {
          headers: { Authorization: `Token ${token}` },  // 傳送認證 Token
        });
        setMessages(response.data);  // 設定私訊列表
      } catch (err) {
        setError('獲取私訊失敗');  // 設定錯誤訊息
      }
    };
    if (token) fetchMessages();  // 有 token 才執行
  }, [token]);  // token 變動時重新獲取

  const handleSend = async () => {
    // 處理發送私訊邏輯
    try {
      await axios.post('http://10.0.2.2:8000/api/messages/messages/', {
        recipient,  // 傳送接收者用戶名
        content,  // 傳送訊息內容
      }, {
        headers: { Authorization: `Token ${token}` },  // 傳送認證 Token
      });
      setContent('');  // 清空輸入框
      setRecipient('');  // 清空接收者輸入
      // 重新獲取私訊列表
      const response = await axios.get('http://10.0.2.2:8000/api/messages/messages/', {
        headers: { Authorization: `Token ${token}` },
      });
      setMessages(response.data);  // 更新私訊列表
    } catch (err) {
      setError('發送私訊失敗');  // 設定錯誤訊息
    }
  };

  return (
    <View>
      <Text>發送私訊</Text>
      <TextInput
        value={recipient}
        onChangeText={setRecipient}
        placeholder="接收者用戶名"
      />
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="請輸入訊息內容"
      />
      <Button title="發送" onPress={handleSend} /> 
      {error && <Text>{error}</Text>}  
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.sender.username} 發送給 {item.recipient.username}: {item.content}</Text>
          </View>
        )}
      />  
    </View>
  );
};

export default MessagesScreen;  // 導出私訊頁面組件 