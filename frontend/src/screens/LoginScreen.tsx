// 登入頁面檔案，處理用戶登入功能

import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';  // 用於發送 HTTP 請求
import { StackNavigationProp } from '@react-navigation/stack';

// 定義導航參數型別
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Profile: undefined;
};
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');  // 儲存用戶名輸入
  const [password, setPassword] = useState('');  // 儲存密碼輸入
  const [error, setError] = useState('');        // 儲存錯誤訊息

  const handleLogin = async () => {
    // 處理登入邏輯
    try {
      const response = await axios.post('http://10.0.2.2:8000/api/users/login/', {
        username,  // 傳送用戶名
        password,  // 傳送密碼
      });
      console.log('登入成功，Token:', response.data.token);  // 輸出登入成功的 Token
      navigation.navigate('Profile'); // 登入成功後跳轉到個人頁面
    } catch (err) {
      setError('登入失敗，請檢查憑證');  // 設定錯誤訊息
    }
  };

  return (
    <View>
      <Text>用戶名</Text>
      <TextInput 
        value={username} 
        onChangeText={setUsername} 
        placeholder="請輸入用戶名" 
      />
      <Text>密碼</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry  // 隱藏密碼輸入
        placeholder="請輸入密碼"
      />
      <Button title="登入" onPress={handleLogin} />  // 登入按鈕
      {error && <Text>{error}</Text>}  // 顯示錯誤訊息
      <Button title="註冊" onPress={() => navigation.navigate('Register')} />
    </View>
  );
};

export default LoginScreen;  // 導出登入頁面組件