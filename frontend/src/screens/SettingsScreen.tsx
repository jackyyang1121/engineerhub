// 設定頁面檔案，處理用戶個人設定、帳號管理、支援與登出等功能

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    Alert.alert(
      '確認登出',
      '您確定要登出嗎？',
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '確認',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await AsyncStorage.removeItem('token');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('錯誤', '登出時發生錯誤，請稍後再試');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const sections = [
    {
      title: '帳號',
      items: [
        { 
          title: '個人檔案', 
          icon: 'person-outline',
          onPress: () => navigation.navigate('Profile' as never)
        },
        { 
          title: '已儲存貼文', 
          icon: 'bookmark-outline',
          onPress: () => navigation.navigate('SavedPosts' as never)
        },
        { 
          title: '作品集', 
          icon: 'briefcase-outline',
          onPress: () => navigation.navigate('Portfolio' as never)
        },
      ]
    },
    {
      title: '隱私與安全',
      items: [
        { 
          title: '隱私設定', 
          icon: 'lock-closed-outline',
          onPress: () => Alert.alert('提示', '此功能開發中')
        },
        { 
          title: '通知設定', 
          icon: 'notifications-outline',
          onPress: () => Alert.alert('提示', '此功能開發中')
        },
        { 
          title: '帳號安全', 
          icon: 'shield-checkmark-outline',
          onPress: () => Alert.alert('提示', '此功能開發中')
        },
      ]
    },
    {
      title: '支援',
      items: [
        { 
          title: '幫助中心', 
          icon: 'help-circle-outline',
          onPress: () => Alert.alert('提示', '此功能開發中')
        },
        { 
          title: '回報問題', 
          icon: 'bug-outline',
          onPress: () => Alert.alert('提示', '此功能開發中')
        },
        { 
          title: '關於我們', 
          icon: 'information-circle-outline',
          onPress: () => Alert.alert('提示', '此功能開發中')
        },
      ]
    },
    {
      title: '其他',
      items: [
        { 
          title: '清除快取', 
          icon: 'trash-outline',
          onPress: () => Alert.alert('提示', '此功能開發中')
        },
        { 
          title: '登出', 
          icon: 'log-out-outline',
          onPress: handleLogout,
          color: '#FF3B30'
        },
      ]
    }
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.item,
                    itemIndex === section.items.length - 1 && styles.lastItem
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemLeft}>
                    <Ionicons 
                      name={item.icon} 
                      size={22} 
                      color={item.color || COLORS.accent} 
                      style={styles.itemIcon}
                    />
                    <Text style={[styles.itemTitle, item.color && { color: item.color }]}>
                      {item.title}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.subText} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.subText,
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 20,
    fontFamily: FONTS.medium,
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginHorizontal: 16,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
});

export default SettingsScreen;