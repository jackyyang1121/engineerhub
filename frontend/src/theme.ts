// 全局主題設定，統一顏色、字體、圓角等設計變數

export const COLORS = {
  primary: '#1A237E',
  secondary: '#3949AB',
  background: '#181A20',
  card: '#232634',
  border: '#353849',
  text: '#F5F6FA',
  subText: '#A0A3B1',
  accent: '#FFB300',
  error: '#FF5252',
  success: '#00E676',
  shadow: 'rgba(20,20,40,0.18)',
};

export const FONTS = {
  regular: 'Noto Sans TC', // 可根據平台自訂
  medium: 'Noto Sans TC',
  bold: 'Noto Sans TC',
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    title: 28,
  },
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 20,
};

export const SHADOW = {
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 8,
  elevation: 4,
}; 