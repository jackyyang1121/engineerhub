import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

const { width } = Dimensions.get('window');

interface Tab {
  key: string;
  title: string;
  icon?: string;
  count?: number;
}

interface ProfileTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  themeColor?: string;
  containerStyle?: object;
}

const ProfileTabBar: React.FC<ProfileTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  themeColor = COLORS.accent,
  containerStyle,
}) => {
  // 計算每個標籤的寬度
  const tabWidth = width / tabs.length;
  
  // 動畫值
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  
  // 找到當前活動標籤的索引
  const activeIndex = tabs.findIndex((tab) => tab.key === activeTab);
  
  // 當活動標籤變更時，動畫更新指示器位置
  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: activeIndex * tabWidth,
      useNativeDriver: true,
      tension: 300,
      friction: 30,
    }).start();
  }, [activeTab, activeIndex, tabWidth]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, { width: tabWidth }]}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && { color: themeColor, fontFamily: FONTS.bold },
              ]}
            >
              {tab.title}
            </Text>
            
            {tab.count !== undefined && tab.count > 0 && (
              <View
                style={[
                  styles.countBadge,
                  activeTab === tab.key && { backgroundColor: themeColor },
                ]}
              >
                <Text style={styles.countText}>
                  {tab.count > 999 ? '999+' : tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* 活動標籤指示器 */}
      <Animated.View
        style={[
          styles.indicator,
          { 
            width: tabWidth * 0.5,
            backgroundColor: themeColor,
            transform: [
              { 
                translateX: Animated.add(
                  indicatorPosition,
                  tabWidth * 0.25 // 將指示器置中
                )
              }
            ] 
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    position: 'relative',
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 48,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
  },
  countBadge: {
    backgroundColor: COLORS.subText,
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xxs,
    color: COLORS.primary,
  },
  indicator: {
    height: 3,
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderTopLeftRadius: RADIUS.sm,
    borderTopRightRadius: RADIUS.sm,
  },
});

export default ProfileTabBar; 