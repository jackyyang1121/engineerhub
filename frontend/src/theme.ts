// 全局主題設定，統一顏色、字體、圓角等設計變數
// COLORS: 定義全局顏色，包含主色、背景、卡片、文字、輔助色、錯誤、成功、陰影等
// FONTS: 定義全局字體與字級，方便跨平台統一
// RADIUS: 定義全局圓角，確保 UI 一致性
// SHADOW: 定義全局陰影效果，提升卡片層次感

export const COLORS = {
  // 主色調
  primary: '#0F1215',      // 純黑主色（背景基底）
  secondary: '#1F2937',    // 深灰次色（卡片背景）
  tertiary: '#374151',     // 中灰三級色（邊框、分隔線）
  
  // 背景與區塊
  background: '#0F1215',   // 主背景色（深黑）
  card: '#1F2937',         // 卡片背景（深灰）
  elevated: '#2D3748',     // 提升元素（中灰）
  border: '#374151',       // 邊框顏色（淺灰）
  divider: '#1D283A',      // 分隔線（微亮的深灰）
  
  // 文字與內容
  text: '#F9FAFB',         // 主要文字（近白色）
  subText: '#9CA3AF',      // 次要文字（淺灰）
  placeholder: '#6B7280',  // 占位文字（中灰）
  
  // 強調與互動
  accent: '#3B82F6',       // 主強調色（藍色）
  accentLight: '#60A5FA',  // 淺強調色（亮藍）
  accentDark: '#2563EB',   // 深強調色（深藍）
  highlight: '#7C3AED',    // 次強調色（紫色系）
  
  // 狀態與反饋
  success: '#10B981',      // 成功色（綠色）
  error: '#EF4444',        // 錯誤色（紅色）
  warning: '#F59E0B',      // 警告色（橙色）
  info: '#3B82F6',         // 信息色（藍色）
  
  // 漸變與半透明
  overlay: 'rgba(0,0,0,0.5)',       // 遮罩層
  shimmer: 'rgba(255,255,255,0.05)', // 閃爍效果
  glass: 'rgba(15,18,21,0.85)',      // 毛玻璃效果
  
  // 互動狀態
  active: '#3B82F6',       // 活躍狀態
  inactive: '#4B5563',     // 非活躍狀態
  pressed: '#2563EB',      // 按下狀態
  ripple: 'rgba(59,130,246,0.3)',   // 波紋效果
};

export const FONTS = {
  // 字體系列
  regular: 'Noto Sans TC',
  medium: 'Noto Sans TC',
  bold: 'Noto Sans TC',
  
  // 排版比例
  size: {
    xxs: 10,  // 極小文字（小標籤、徽章）
    xs: 12,   // 超小字級（輔助說明、時間）
    sm: 14,   // 小字級（標籤、按鈕、次要文本）
    md: 16,   // 一般字級（內文、主要文本）
    lg: 18,   // 大字級（副標題、重要文本）
    xl: 20,   // 特大字級（主標題、強調文本）
    xxl: 24,  // 標題字級（頁面標題）
    title: 32,// 大標題（歡迎頁、啟動頁）
  },
  
  // 行高比例（fontSize 的倍數）
  lineHeight: {
    tight: 1.25,    // 緊湊行高（標題）
    normal: 1.5,    // 標準行高（內文）
    relaxed: 1.75,  // 寬鬆行高（長文本）
  },
  
  // 字重設定
  weight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  
  // 字間距
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

export const RADIUS = {
  none: 0,     // 無圓角
  xs: 4,       // 超小圓角（小元素）
  sm: 8,       // 小圓角（按鈕、輸入框）
  md: 12,      // 中圓角（卡片、標籤）
  lg: 16,      // 大圓角（浮動按鈕、大型卡片）
  xl: 24,      // 特大圓角（模態框）
  full: 9999,  // 完全圓形（頭像、徽章）
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
  
  // 淺層陰影（輕微立體感）
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // 中等陰影（卡片、按鈕）
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // 深層陰影（浮動按鈕、彈出框）
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // 特殊陰影效果
  inner: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 0, // Android 不支持內陰影
  },
  
  // 內光陰影（高亮邊緣）
  glow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
};

// 間距比例
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 動畫時間
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// 佈局常量
export const LAYOUT = {
  fullWidth: '100%',
  contentWidth: '90%',
  safeBottom: 34, // 安全區域底部間距
  navBarHeight: 56, // 導航欄高度
  tabBarHeight: 56, // 標籤欄高度
  headerHeight: 60, // 頁面頂部高度
}; 