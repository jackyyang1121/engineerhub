// 底部分頁導航器檔案，定義主頁、搜尋、通知、訊息、個人檔案等分頁

import React from 'react';
import { Text, StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import { COLORS, SHADOW, FONTS, SPACING, RADIUS } from '../theme';
import { BlurView } from '@react-native-community/blur';

// 定義頁面配置
const TAB_CONFIG = [
  {
    name: 'Home',
    component: HomeScreen,
    label: '首頁',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  {
    name: 'Search',
    component: SearchScreen,
    label: '搜尋',
    activeIcon: 'search',
    inactiveIcon: 'search-outline',
  },
  {
    name: 'Notifications',
    component: NotificationsScreen,
    label: '通知',
    activeIcon: 'notifications',
    inactiveIcon: 'notifications-outline',
    badge: 3,
  },
  {
    name: 'Messages',
    component: MessagesScreen,
    label: '訊息',
    activeIcon: 'chatbubble',
    inactiveIcon: 'chatbubble-outline',
  },
  {
    name: 'Profile',
    component: ProfileScreen,
    label: '我的',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
];

// 建立 Tab 導航器
const Tab = createBottomTabNavigator();

// TabNavigator 組件，定義底部分頁結構與圖示
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        // 找到對應的配置
        const tabConfig = TAB_CONFIG.find(tab => tab.name === route.name);
        
        return {
          tabBarIcon: ({ focused, color }) => {
            if (!tabConfig) return null;
            const iconName = focused ? tabConfig.activeIcon : tabConfig.inactiveIcon;
            return <Ionicons name={iconName} size={24} color={color} />;
          },
          tabBarLabel: ({ focused, color }) => {
            if (!tabConfig) return <Text style={{color}}>{route.name}</Text>;
            return (
              <Text 
                style={[
                  styles.tabLabel, 
                  {
                    color,
                    fontFamily: focused ? FONTS.bold : FONTS.regular
                  }
                ]}
              >
                {tabConfig.label}
              </Text>
            );
          },
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.subText,
          tabBarLabelStyle: {
            fontSize: FONTS.size.xs,
            fontFamily: FONTS.medium,
            marginTop: 2,
          },
          tabBarBackground: () => (
            Platform.OS === 'ios' ? (
              <BlurView
                style={styles.blurView}
                blurType="dark"
                blurAmount={10}
                reducedTransparencyFallbackColor={COLORS.background}
              />
            ) : null
          ),
        };
      }}
    >
      {TAB_CONFIG.map(tab => (
        <Tab.Screen 
          key={tab.name}
          name={tab.name} 
          component={tab.component}
          options={{
            tabBarBadge: tab.badge,
            tabBarBadgeStyle: tab.badge ? styles.badge : undefined,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

// 樣式
const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    height: Platform.OS === 'ios' ? 88 : 60,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    backgroundColor: COLORS.background,
    ...SHADOW.sm,
  },
  tabLabel: {
    fontSize: FONTS.size.xs,
    marginTop: 2,
  },
  badge: {
    backgroundColor: COLORS.accent,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 10,
  },
  blurView: {
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0,
  },
});

export default TabNavigator; 