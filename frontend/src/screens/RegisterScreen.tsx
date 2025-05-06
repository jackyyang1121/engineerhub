// 註冊頁面檔案，處理用戶註冊、表單驗證、錯誤顯示與跳轉

import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, ANIMATION } from '../theme';
import { RootStackParamList } from '../types/navigation';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  // 狀態：用戶名、電子郵件、密碼、確認密碼、錯誤訊息、載入中
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<Record<string, string>>({});
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
  
  // 驗證表單
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // 驗證用戶名
    if (!username.trim()) {
      newErrors.username = '請輸入用戶名';
    } else if (username.length < 3) {
      newErrors.username = '用戶名至少需要3個字符';
    }
    
    // 驗證電子郵件
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = '請輸入電子郵件';
    } else if (!emailRegex.test(email)) {
      newErrors.email = '請輸入有效的電子郵件';
    }
    
    // 驗證密碼
    if (!password) {
      newErrors.password = '請輸入密碼';
    } else if (password.length < 6) {
      newErrors.password = '密碼至少需要6個字符';
    }
    
    // 驗證確認密碼
    if (password !== confirmPassword) {
      newErrors.confirmPassword = '兩次密碼不一致';
    }
    
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理註冊請求
  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://10.0.2.2:8000/api/users/register/', {
        username,
        email,
        password,
      });
      
      console.log('註冊成功，Token:', response.data.token);
      
      // 顯示成功動畫
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATION.fast,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: ANIMATION.fast,
          useNativeDriver: true,
        })
      ]).start(() => {
        // 導航到登入頁
        navigation.replace('Login');
      });
      
    } catch (err: any) {
      // 顯示具體的錯誤訊息
      if (err.response?.data) {
        const serverErrors: Record<string, string> = {};
        
        // 處理 Django 返回的錯誤格式
        if (typeof err.response.data === 'object') {
          Object.entries(err.response.data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              serverErrors[key] = value[0] as string;
            } else {
              serverErrors[key] = value as string;
            }
          });
        } else {
          serverErrors.general = JSON.stringify(err.response.data);
        }
        
        setError(serverErrors);
      } else {
        setError({ general: '註冊失敗，請檢查輸入資料' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染輸入框
  const renderInput = (
    label: string, 
    value: string, 
    setter: React.Dispatch<React.SetStateAction<string>>, 
    placeholder: string,
    isSecure = false,
    errorKey?: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        style={[
          styles.input,
          errorKey && error[errorKey] ? styles.inputError : {}
        ]}
        secureTextEntry={isSecure}
      />
      {errorKey && error[errorKey] && (
        <Text style={styles.errorText}>{error[errorKey]}</Text>
      )}
    </View>
  );

  // 畫面渲染
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
              <Text style={styles.title}>創建帳號</Text>
              <Text style={styles.subtitle}>開始探索工程師的世界</Text>
            </View>
            
            {error.general && (
              <View style={styles.generalError}>
                <Text style={styles.generalErrorText}>{error.general}</Text>
              </View>
            )}
            
            {renderInput('用戶名', username, setUsername, '請設定您的用戶名', false, 'username')}
            {renderInput('電子郵件', email, setEmail, '請輸入您的電子郵件', false, 'email')}
            {renderInput('密碼', password, setPassword, '請設定您的密碼', true, 'password')}
            {renderInput('確認密碼', confirmPassword, setConfirmPassword, '請再次輸入密碼', true, 'confirmPassword')}
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.buttonText}>註冊</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>已有帳號？</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>返回登入</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
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
    letterSpacing: FONTS.letterSpacing.normal,
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
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  generalError: {
    backgroundColor: `${COLORS.error}15`,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  generalErrorText: {
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
    marginTop: SPACING.md,
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

export default RegisterScreen;