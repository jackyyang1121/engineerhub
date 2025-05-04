import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');  // 儲存用戶名
  const [password, setPassword] = useState('');  // 儲存密碼
  const [error, setError] = useState('');        // 儲存錯誤訊息

  const handleLogin = async () => {
    try {
      // 發送登入請求到後端
      const response = await axios.post('http://10.0.2.2:8000/api/users/login/', {
        username,
        password,
      });
      console.log('登入成功，Token:', response.data.token);
    } catch (err) {
      setError('登入失敗，請檢查憑證');
    }
  };

  return (
    <View>
      <Text>用戶名</Text>
      <TextInput value={username} onChangeText={setUsername} placeholder="請輸入用戶名" />
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

export default LoginScreen;