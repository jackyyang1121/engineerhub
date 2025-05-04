// 註冊頁面檔案，處理用戶註冊功能

import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';  // 用於發送 HTTP 請求

// RegisterScreen 組件，負責註冊頁面邏輯與畫面
const RegisterScreen: React.FC = () => {
  // 狀態：用戶名、電子信箱、手機號碼、密碼、技能、自介、錯誤訊息
  const [username, setUsername] = useState('');      // 儲存用戶名輸入
  const [email, setEmail] = useState('');            // 儲存電子信箱輸入
  const [phoneNumber, setPhoneNumber] = useState(''); // 儲存手機號碼輸入
  const [password, setPassword] = useState('');      // 儲存密碼輸入
  const [skills, setSkills] = useState('');          // 儲存技能標籤輸入
  const [bio, setBio] = useState('');                // 儲存自介輸入
  const [error, setError] = useState('');            // 儲存錯誤訊息

  // 處理註冊請求
  const handleRegister = async () => {
    try {
      const response = await axios.post('http://10.0.2.2:8000/api/users/register/', {
        username,          // 傳送用戶名
        email,             // 傳送電子信箱
        phone_number: phoneNumber,  // 傳送手機號碼
        password,          // 傳送密碼
        skills: skills.split(','),  // 將技能標籤轉為陣列
        bio,               // 傳送自介
      });
      console.log('註冊成功，Token:', response.data.token);  // 輸出註冊成功的 Token
    } catch (err) {
      setError('註冊失敗，請檢查輸入');  // 設定錯誤訊息
    }
  };

  // 畫面渲染
  return (
    <View>
      <Text>用戶名</Text>
      <TextInput value={username} onChangeText={setUsername} placeholder="請輸入用戶名" />
      <Text>電子信箱</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="請輸入電子信箱" />
      <Text>手機號碼</Text>
      <TextInput value={phoneNumber} onChangeText={setPhoneNumber} placeholder="請輸入手機號碼" />
      <Text>密碼</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry  
        placeholder="請輸入密碼"
      />
      <Text>技能標籤（以逗號分隔）</Text>
      <TextInput value={skills} onChangeText={setSkills} placeholder="如：Python, Java" />
      <Text>自介</Text>
      <TextInput value={bio} onChangeText={setBio} placeholder="請輸入自介" />
      <Button title="註冊" onPress={handleRegister} /> 
      {error && <Text>{error}</Text>} 
    </View>
  );
};

export default RegisterScreen;  // 導出註冊頁面組件