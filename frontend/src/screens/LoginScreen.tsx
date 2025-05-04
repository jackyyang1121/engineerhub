// 登入頁面檔案，處理用戶登入功能

import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';  // 用於發送 HTTP 請求
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

// 定義導航參數型別
// RootStackParamList 定義了三個頁面：Login、Register、Home
// 每個頁面都不需要額外的參數
// 用於型別安全的導航
// 這樣 navigation.navigate('Profile') 時會有型別提示
// 也方便未來擴充

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainApp: undefined;
  PostDetail: undefined;
  Home: undefined;
  Profile: undefined;
  Search: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

// 定義 LoginScreen 的 props 型別，包含 navigation
interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

// LoginScreen 組件，負責登入頁面邏輯與畫面
const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { setToken } = useAuth();
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
      setToken(response.data.token);
      navigation.replace('MainApp');  // 登入成功後導向底部分頁主頁
    } catch (err: any) {
      // 顯示具體的錯誤訊息
      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError('登入失敗，請檢查憑證');
      }
    }
  };

  // 畫面渲染
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.header}>登入</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="請輸入用戶名"
            style={styles.input}
            placeholderTextColor={COLORS.subText}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="請輸入密碼"
            style={styles.input}
            placeholderTextColor={COLORS.subText}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.buttonText}>登入</Text>
          </TouchableOpacity>
          {error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text style={styles.linkText}>沒有帳號？註冊</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// 新增精緻化樣式
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
  },
  header: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: FONTS.regular,
    fontSize: 20,
    color: COLORS.text,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 22,
    minWidth: 260,
    minHeight: 56,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOW,
  },
  buttonText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    letterSpacing: 1,
  },
  error: {
    color: COLORS.error,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    marginTop: 4,
    textAlign: 'center',
  },
  linkBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.accent,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;  // 導出登入頁面組件