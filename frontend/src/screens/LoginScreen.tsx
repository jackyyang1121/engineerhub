// 登入頁面檔案，處理用戶登入、表單驗證、錯誤顯示與跳轉

import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  ActivityIndicator,
  Animated
} from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, ANIMATION } from '../theme';
import { RootStackParamList } from '../types/navigation';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { setToken } = useAuth();
  // 狀態：電子郵件、密碼、錯誤訊息、載入中
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 動畫參數
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(25)).current;
  
  // 進入動畫
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION.normal,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION.normal,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // 處理登入請求
  const handleLogin = async () => {
    // 驗證
    if (!email.trim()) {
      setError('請輸入電子郵件');
      return;
    }
    if (!password) {
      setError('請輸入密碼');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://10.0.2.2:8000/api/users/login/', {
        email,
        password,
      });
      setToken(response.data.token);
      
      // 成功登入動畫
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIMATION.fast,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('MainApp', { screen: 'Home' });
      });
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError('登入失敗，請檢查網絡連接');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 畫面渲染
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateY }]
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>登入</Text>
            <Text style={styles.subtitle}>歡迎回來</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>電子郵件</Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              placeholder="請輸入您的電子郵件"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>密碼</Text>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              placeholder="請輸入您的密碼"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
              secureTextEntry
            />
          </View>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin} 
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.buttonText}>登入</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>沒有帳號？</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>立即註冊</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// 現代簡約高級樣式
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    width: '85%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.title,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 56,
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.error,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...SHADOW.md,
  },
  buttonText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    letterSpacing: FONTS.letterSpacing.wide,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    marginRight: SPACING.xs,
  },
  linkText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
  },
});

export default LoginScreen;