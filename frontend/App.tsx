// 應用程式入口檔案，設定應用主題和全局狀態

import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { COLORS, FONTS } from './src/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { CONFIG } from './src/config';

// 啟用原生畫面功能來提升導航性能
enableScreens(true);

// 錯誤邊界組件，捕獲並優雅處理渲染錯誤
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('應用錯誤:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>哎呀！發生錯誤</Text>
          <Text style={styles.errorMessage}>
            應用遇到了問題。請重新啟動應用。
          </Text>
          {CONFIG.DEV.SHOW_LOGS && (
            <Text style={styles.errorDetail}>
              {this.state.error?.toString()}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

// 載入指示器組件
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.accent} />
    <Text style={styles.loadingText}>載入中...</Text>
  </View>
);

// 主應用組件
const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 應用启动时的初始化工作
    const initApp = async () => {
      try {
        // 可以在這裡進行字型加載、資源預加載等初始化工作
        // 模擬資源加載
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsReady(true);
      } catch (error) {
        console.error('初始化失敗:', error);
        setIsReady(true); // 即使初始化失敗，也嘗試顯示應用
      }
    };
    
    initApp();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <LoadingScreen />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
          <AuthProvider>
            <AppNavigator />  
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

// 樣式定義
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.text,
    fontFamily: FONTS.medium,
    marginBottom: 20,
  },
  errorDetail: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.subText,
    textAlign: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    backgroundColor: COLORS.card,
  },
});

export default App;