// 導航器檔案，整合所有頁面導航，負責全局 Stack 與 Tab 結構

import React from 'react';  // 引入 React 核心功能，用於構建組件
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types/navigation';
import LoginScreen from '../screens/LoginScreen';  // 導入登入頁面組件
import RegisterScreen from '../screens/RegisterScreen';  // 導入註冊頁面組件
import ProfileScreen from '../screens/ProfileScreen';  // 導入個人檔案頁面組件
import HomeScreen from '../screens/HomeScreen';  // 導入首頁組件
import PostDetailScreen from '../screens/PostDetailScreen';  // 導入貼文詳情頁面組件
import SearchScreen from '../screens/SearchScreen';  // 導入搜尋頁面組件
import MessagesScreen from '../screens/MessagesScreen';  // 導入私訊頁面組件
import PortfolioScreen from '../screens/PortfolioScreen';  // 導入作品集頁面組件
import SavedPostsScreen from '../screens/SavedPostsScreen';  // 導入已儲存貼文頁面組件
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

// 建立 Stack 與 Tab 導航器，型別分別對應 RootStackParamList、TabParamList
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// TabNavigator 組件，定義底部分頁導航與圖示
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // 根據 route.name 設定底部圖示
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: '#E5E5E5',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        headerShown: false,
      })}
    >
      {/* 定義底部分頁的每個頁面與對應組件 */}
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首頁' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: '搜尋' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: '通知' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ title: '訊息' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '我的' }} />
    </Tab.Navigator>
  );
};

// AppNavigator 組件，定義全局 Stack 導航結構
const AppNavigator = () => {
  return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          animation: 'slide_from_right',
          animationDuration: 200,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          fullScreenGestureEnabled: true,
        }}
      >
        {/* 登入、註冊、主頁（底部分頁）、貼文詳情、個人檔案、作品集、已儲存、設定等頁面 */}
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
          options={({ route }) => ({ 
            title: '貼文詳情',
            animation: 'slide_from_bottom',
          })}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={({ route }) => ({ 
            title: '個人檔案',
            animation: 'slide_from_right',
          })}
        />
        <Stack.Screen 
          name="Portfolio" 
          component={PortfolioScreen}
          options={{ 
            title: '作品集',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="SavedPosts" 
          component={SavedPostsScreen}
          options={{ 
            title: '已儲存',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            title: '設定',
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
  );
};

export default AppNavigator;  // 導出全局導航器供 App 使用