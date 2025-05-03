import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';

const RegisterScreen: React.FC = () => {
  const [username, setUsername] = useState('');      // 儲存用戶名
  const [email, setEmail] = useState('');            // 儲存電子信箱
  const [phoneNumber, setPhoneNumber] = useState(''); // 儲存手機號碼
  const [password, setPassword] = useState('');      // 儲存密碼
  const [skills, setSkills] = useState('');          // 儲存技能標籤
  const [error, setError] = useState('');            // 儲存錯誤訊息

  const handleRegister = async () => {
    try {
      // 發送註冊請求到後端，技能以逗號分隔轉為陣列
      const response = await axios.post('http://10.0.2.2:8000/api/users/register/', {
        username,
        email,
        phone_number: phoneNumber,
        password,
        skills: skills.split(','),
      });
      console.log('註冊成功，Token:', response.data.token);
    } catch (err) {
      setError('註冊失敗，請檢查輸入');
    }
  };

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
      <Button title="註冊" onPress={handleRegister} />
      {error && <Text>{error}</Text>}
    </View>
  );
};

export default RegisterScreen;