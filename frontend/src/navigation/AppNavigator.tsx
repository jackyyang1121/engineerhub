// 導航器檔案，整合所有頁面導航，負責全局 Stack 與 Tab 結構

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Ionicons from 'react-native-vector-icons/Ionicons';

// 頁面導入
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import MessagesScreen from '../screens/MessagesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import SavedPostsScreen from '../screens/SavedPostsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreatePostScreen from '../screens/CreatePostScreen';

// 導入主題和導航類型
import { COLORS, FONTS, SHADOW, SPACING, RADIUS } from '../theme';
import { RootStackParamList, TabParamList } from '../types/navigation';
import TabNavigator from './TabNavigator';
import { useAuth } from '../context/AuthContext';

// 建立導航器實例
const Stack = createNativeStackNavigator<RootStackParamList>();

// 全局導航堆疊
const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "MainApp" : "Login"}
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTitleStyle: {
            fontFamily: FONTS.bold,
            fontSize: FONTS.size.lg,
            color: COLORS.text,
          },
          headerTintColor: COLORS.text,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: COLORS.background,
          },
          animation: 'slide_from_right',
          animationDuration: 220,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          fullScreenGestureEnabled: true,
        }}
      >
        {/* 身份驗證相關頁面 */}
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
        
        {/* 主應用頁面 (底部標籤導航) */}
        <Stack.Screen 
          name="MainApp" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        
        {/* 內容詳情頁面 */}
        <Stack.Screen 
          name="PostDetail" 
          component={PostDetailScreen}
          options={{ 
            title: '貼文',
            animation: 'slide_from_bottom',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen 
          name="ChatScreen" 
          component={ChatScreen}
          options={({ route }) => ({ 
            title: route.params.otherUser.username,
            headerBackTitle: '',
            headerTitleAlign: 'center',
          })}
        />
        
        {/* 用戶配置文件相關頁面 */}
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={({ route }) => ({ 
            title: '個人檔案',
            headerBackTitle: '',
          })}
        />
        <Stack.Screen 
          name="Portfolio" 
          component={PortfolioScreen}
          options={{ 
            title: '作品集管理',
            headerBackTitle: '',
            headerTitleAlign: 'center',
          }}
        />
        
        {/* 工具和設置相關頁面 */}
        <Stack.Screen 
          name="SavedPosts" 
          component={SavedPostsScreen}
          options={{ 
            title: '已儲存',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            title: '設定',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen 
          name="CreatePost" 
          component={CreatePostScreen}
          options={{
            title: '發佈貼文',
            animation: 'slide_from_bottom',
            presentation: 'modal',
            headerBackTitle: '',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;