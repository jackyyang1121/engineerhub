// 導航器檔案，整合所有頁面導航

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';      // 導入登入頁面
import RegisterScreen from '../screens/RegisterScreen'; // 導入註冊頁面
import TabNavigator from './TabNavigator';
import PostDetailScreen from '../screens/PostDetailScreen'; // 導入貼文詳情頁面
import { AuthProvider } from '../context/AuthContext';

const Stack = createStackNavigator();  // 創建堆疊導航器

const AppNavigator: React.FC = () => {
  return (
    <AuthProvider>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainApp" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PostDetail" 
          component={PostDetailScreen}
          options={{ title: '貼文詳情' }}
        />
      </Stack.Navigator>
    </AuthProvider>
  );
};

export default AppNavigator;  // 導出導航器組件