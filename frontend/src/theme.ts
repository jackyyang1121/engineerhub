// 全局主題設定，統一顏色、字體、圓角等設計變數
// COLORS: 定義全局顏色，包含主色、背景、卡片、文字、輔助色、錯誤、成功、陰影等
// FONTS: 定義全局字體與字級，方便跨平台統一
// RADIUS: 定義全局圓角，確保 UI 一致性
// SHADOW: 定義全局陰影效果，提升卡片層次感

export const COLORS = {
  primary: '#1A237E',        // 主色（按鈕、主標題）
  secondary: '#3949AB',      // 輔色（次要按鈕、標籤）
  background: '#181A20',     // 全局背景色（深色主題）
  card: '#232634',           // 卡片背景色
  border: '#353849',         // 邊框顏色
  text: '#F5F6FA',           // 主要文字顏色
  subText: '#A0A3B1',        // 次要文字顏色
  accent: '#FFB300',         // 強調色（互動、icon、重點）
  error: '#FF5252',          // 錯誤提示色
  success: '#00E676',        // 成功提示色
  shadow: 'rgba(20,20,40,0.18)', // 陰影顏色
};

export const FONTS = {
  regular: 'Noto Sans TC', // 預設字體
  medium: 'Noto Sans TC',  // 中等字重
  bold: 'Noto Sans TC',    // 粗體字重
  size: {
    xs: 12,   // 超小字級（輔助說明）
    sm: 14,   // 小字級（標籤、按鈕）
    md: 16,   // 一般字級（內文）
    lg: 18,   // 大字級（標題、副標）
    xl: 22,   // 特大字級（主標題）
    title: 28,// 頁面大標題
  },
};

export const RADIUS = {
  sm: 6,   // 小圓角（按鈕、輸入框）
  md: 12,  // 中圓角（卡片、彈窗）
  lg: 20,  // 大圓角（主要區塊）
};

export const SHADOW = {
  shadowColor: COLORS.shadow,           // 陰影顏色
  shadowOffset: { width: 0, height: 2 }, // 陰影偏移
  shadowOpacity: 0.12,                  // 陰影透明度
  shadowRadius: 8,                      // 陰影模糊半徑
  elevation: 4,                         // Android 陰影高度
}; 