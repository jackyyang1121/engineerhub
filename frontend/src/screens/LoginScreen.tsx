// 登入頁面檔案，處理用戶登入功能

import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';  // 用於發送 HTTP 請求
import { StackNavigationProp } from '@react-navigation/stack';

// 定義導航參數型別
// RootStackParamList 定義了三個頁面：Login、Register、Profile
// 每個頁面都不需要額外的參數
// 用於型別安全的導航
// 這樣 navigation.navigate('Profile') 時會有型別提示
// 也方便未來擴充

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Profile: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

// 定義 LoginScreen 的 props 型別，包含 navigation
interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

// LoginScreen 組件，負責登入頁面邏輯與畫面
const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // 狀態：用戶名、密碼、錯誤訊息
  const [username, setUsername] = useState('');  // 儲存用戶名輸入
  const [password, setPassword] = useState('');  // 儲存密碼輸入
  const [error, setError] = useState('');        // 儲存錯誤訊息

  // 處理登入請求
  const handleLogin = async () => {
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

  // 畫面渲染
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
        secureTextEntry 
        placeholder="請輸入密碼"
      />
      <Button title="登入" onPress={handleLogin} />  
      {error && <Text>{error}</Text>} 
      <Button title="註冊" onPress={() => navigation.navigate('Register')} />
    </View>
  );
};

export default LoginScreen;  // 導出登入頁面組件