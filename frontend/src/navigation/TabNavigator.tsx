// 底部分頁導航器檔案，定義主頁、搜尋、通知、訊息、個人檔案等分頁

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MessagesScreen from '../screens/MessagesScreen';

// 建立 Tab 導航器
const Tab = createBottomTabNavigator();

// TabNavigator 組件，定義底部分頁結構與圖示
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // 根據 route.name 設定底部圖示
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
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
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: '#E5E5E5',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      {/* 定義底部分頁的每個頁面與對應組件 */}
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: '首頁',
          tabBarLabel: '首頁'
        }} 
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ 
          title: '搜尋',
          tabBarLabel: '搜尋'
        }} 
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ 
          title: '通知',
          tabBarLabel: '通知'
        }} 
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen} 
        options={{ 
          title: '訊息',
          tabBarLabel: '訊息'
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: '個人檔案',
          tabBarLabel: '個人檔案'
        }} 
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;  // 導出底部分頁導航器供 AppNavigator 使用 