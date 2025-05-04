// 個人檔案頁面檔案，處理檔案讀取與更新功能

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import axios from 'axios';  // 用於發送 HTTP 請求

// ProfileScreen 組件，負責個人檔案頁面邏輯與畫面
const ProfileScreen: React.FC = () => {
  // 狀態：用戶名、電子信箱、手機號碼、技能、自介、錯誤訊息
  const [username, setUsername] = useState('');  // 儲存用戶名
  const [email, setEmail] = useState('');        // 儲存電子信箱
  const [phoneNumber, setPhoneNumber] = useState(''); // 儲存手機號碼
  const [skills, setSkills] = useState('');      // 儲存技能標籤
  const [bio, setBio] = useState('');            // 儲存自介
  const [error, setError] = useState('');        // 儲存錯誤訊息

  // 頁面載入時獲取個人檔案資料
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:8000/api/users/profile/', {
          headers: { Authorization: `Token YOUR_TOKEN_HERE` },  // 傳送認證 Token
        });
        const user = response.data;  // 獲取用戶資料
        setUsername(user.username);  // 設定用戶名
        setEmail(user.email);        // 設定電子信箱
        setPhoneNumber(user.phone_number);  // 設定手機號碼
        setSkills(user.skills.join(', '));  // 將技能陣列轉為字串
        setBio(user.bio);            // 設定自介
      } catch (err) {
        setError('獲取個人檔案失敗');  // 設定錯誤訊息
      }
    };
    fetchProfile();  // 執行獲取資料函數
  }, []);  // 空依賴陣列，僅在初次渲染時執行

  // 處理個人檔案更新邏輯
  const handleUpdate = async () => {
    try {
      await axios.put('http://10.0.2.2:8000/api/users/profile/', {
        username,          // 傳送用戶名
        email,             // 傳送電子信箱
        phone_number: phoneNumber,  // 傳送手機號碼
        skills: skills.split(','),  // 將技能標籤轉為陣列
        bio,               // 傳送自介
      }, {
        headers: { Authorization: `Token YOUR_TOKEN_HERE` },  // 傳送認證 Token
      });
      console.log('更新成功');  // 輸出更新成功訊息
    } catch (err) {
      setError('更新失敗');  // 設定錯誤訊息
    }
  };

  // 畫面渲染
  return (
    <View>
      <Text>用戶名</Text>
      <TextInput value={username} onChangeText={setUsername} />
      <Text>電子信箱</Text>
      <TextInput value={email} onChangeText={setEmail} />
      <Text>手機號碼</Text>
      <TextInput value={phoneNumber} onChangeText={setPhoneNumber} />
      <Text>技能標籤（以逗號分隔）</Text>
      <TextInput value={skills} onChangeText={setSkills} />
      <Text>自介</Text>
      <TextInput value={bio} onChangeText={setBio} />
      <Button title="更新" onPress={handleUpdate} /> 
      {error ? <Text>{error}</Text> : null} 
    </View>
  );
};

export default ProfileScreen;  // 導出個人檔案頁面組件