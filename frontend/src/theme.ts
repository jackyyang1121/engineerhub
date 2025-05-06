// 全局主題設定，統一顏色、字體、圓角等設計變數
// COLORS: 定義全局顏色，包含主色、背景、卡片、文字、輔助色、錯誤、成功、陰影等
// FONTS: 定義全局字體與字級，方便跨平台統一
// RADIUS: 定義全局圓角，確保 UI 一致性
// SHADOW: 定義全局陰影效果，提升卡片層次感

import { Platform } from 'react-native';

// 定義顏色系統
const palette = {
  // 基础色板 - 采用黑蓝为主基調
  black: '#0A0E14',
  darkBlue: '#101720',
  navy: '#1A202C',
  midBlue: '#2D3748',
  gray: '#4A5568',
  lightGray: '#718096',
  silver: '#A0AEC0',
  lightSilver: '#CBD5E0',
  white: '#F7FAFC',
  
  // 强调色
  blue: '#3B82F6',
  lightBlue: '#63B3ED',
  indigo: '#5A67D8',
  purple: '#805AD5',
  
  // 功能色
  success: '#38B2AC',
  error: '#F56565',
  warning: '#ED8936',
  info: '#4299E1',
};

export const COLORS = {
  // 主色調 - 更现代的深色调
  primary: palette.black,
  secondary: palette.navy,
  tertiary: palette.midBlue,
  
  // 背景與區塊 - 更精致的层级关系
  background: palette.black,
  card: palette.darkBlue,
  elevated: palette.navy,
  border: palette.midBlue,
  divider: `${palette.midBlue}99`,
  
  // 文字與內容 - 更柔和的文本对比
  text: palette.white,
  subText: palette.lightSilver,
  placeholder: palette.silver,
  
  // 強調與互動 - 更丰富的强调色
  accent: palette.blue,
  accentLight: palette.lightBlue,
  accentDark: '#2563EB',
  highlight: palette.purple,
  
  // 狀態與反饋 - 更优雅的状态色
  success: palette.success,
  error: palette.error,
  warning: palette.warning,
  info: palette.info,
  
  // 漸變與半透明 - 更现代的玻璃效果
  overlay: 'rgba(10,14,20,0.6)',
  shimmer: 'rgba(255,255,255,0.05)',
  glass: 'rgba(10,14,20,0.85)',
  
  // 互動狀態 - 更精细的交互反馈
  active: palette.blue,
  inactive: palette.gray,
  pressed: palette.indigo,
  ripple: 'rgba(59,130,246,0.25)',
  
  // 梯度色 - 用于高级UI效果
  gradient: {
    primary: ['#0A0E14', '#1A202C'],
    accent: ['#3B82F6', '#805AD5'],
    card: ['#101720', '#1A202C'],
  }
};

// 确定跨平台字体
const getFontFamily = () => {
  if (Platform.OS === 'ios') {
    return {
      regular: 'SF Pro Text',
      medium: 'SF Pro Text',
      bold: 'SF Pro Text',
    };
  } else if (Platform.OS === 'android') {
    return {
      regular: 'Roboto',
      medium: 'Roboto',
      bold: 'Roboto',
    };
  } else {
    return {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    };
  }
};

export const FONTS = {
  // 字體系列 - 针对不同平台优化
  ...getFontFamily(),
  
  // 排版比例 - 更精确的文字尺寸系统
  size: {
    xxs: 10,
    xs: 12, 
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    title: 34,
  },
  
  // 行高比例
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // 字重設定 - 确保跨平台一致性
  weight: {
    regular: '400',
    medium: '500',
    bold: '700',
    black: '900',
  },
  
  // 字間距 - 更精细的调整
  letterSpacing: {
    tight: -0.6,
    normal: 0,
    wide: 0.6,
    extraWide: 1.2,
  },
};

export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const SHADOW = {
  // 基本陰影
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  // 淺層陰影 - 更微妙的层次感
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2.5,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2.5,
      elevation: 2,
    },
  }),
  
  // 中等陰影 - 更自然的阴影效果
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 4.5,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 4.5,
      elevation: 4,
    },
  }),
  
  // 深層陰影 - 更高级的立体感
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
  }),
  
  // 特殊陰影效果 - 更丰富的视觉层次
  inner: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 0, // Android 不支持內陰影
  },
  
  // 內光陰影 - 高级UI效果
  glow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
};

// 間距比例 - 更合理的间距系统
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// 動畫時間 - 更流畅的动画
export const ANIMATION = {
  fast: 180,
  normal: 270,
  slow: 450,
  spring: {
    damping: 14,
    stiffness: 180,
    mass: 1,
  }
};

// 佈局常量 - 考虑现代设备特性
export const LAYOUT = {
  fullWidth: '100%',
  contentWidth: '90%',
  maxContentWidth: 1080, // 最大内容宽度，适配平板
  safeTop: Platform.OS === 'ios' ? 47 : 0, // iOS安全区顶部
  safeBottom: Platform.OS === 'ios' ? 34 : 0, // iOS安全区底部
  navBarHeight: 56,
  tabBarHeight: Platform.OS === 'ios' ? 88 : 60,
  headerHeight: 60,
}; 