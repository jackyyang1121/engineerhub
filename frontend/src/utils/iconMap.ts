// 圖示映射文件，統一管理所有應用程式內使用的圖示
// 使用 Ionicons 圖示庫，方便日後整體替換或修改
// 命名規則：[功能][類型]Icon，例如：homeTabIcon, likeActionIcon 等

import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../theme';

// 圖示類型定義
export type IconType = {
  name: string;
  size?: number;
  color?: string;
  focusedName?: string; // 選中/激活狀態時的圖示名稱
  focusedColor?: string; // 選中/激活狀態時的顏色
};

// 標籤欄圖示
export const TAB_ICONS = {
  home: {
    name: 'home-outline',
    focusedName: 'home',
    size: 24,
    color: COLORS.subText,
    focusedColor: COLORS.accent,
  },
  search: {
    name: 'search-outline',
    focusedName: 'search',
    size: 24,
    color: COLORS.subText,
    focusedColor: COLORS.accent,
  },
  notifications: {
    name: 'notifications-outline',
    focusedName: 'notifications',
    size: 24,
    color: COLORS.subText,
    focusedColor: COLORS.accent,
  },
  messages: {
    name: 'chatbubble-outline',
    focusedName: 'chatbubble',
    size: 24,
    color: COLORS.subText,
    focusedColor: COLORS.accent,
  },
  profile: {
    name: 'person-outline',
    focusedName: 'person',
    size: 24,
    color: COLORS.subText,
    focusedColor: COLORS.accent,
  }
};

// 操作圖示
export const ACTION_ICONS = {
  like: {
    name: 'heart-outline',
    focusedName: 'heart',
    size: 22,
    color: COLORS.subText,
    focusedColor: COLORS.error,
  },
  comment: {
    name: 'chatbubble-outline',
    focusedName: 'chatbubble',
    size: 22,
    color: COLORS.subText,
    focusedColor: COLORS.accent,
  },
  share: {
    name: 'arrow-redo-outline',
    focusedName: 'arrow-redo',
    size: 22,
    color: COLORS.subText,
    focusedColor: COLORS.accent,
  },
  save: {
    name: 'bookmark-outline',
    focusedName: 'bookmark',
    size: 22,
    color: COLORS.subText,
    focusedColor: COLORS.accent,
  },
  add: {
    name: 'add-outline',
    size: 24,
    color: COLORS.primary,
  },
  create: {
    name: 'create-outline',
    size: 24,
    color: COLORS.primary,
  },
  more: {
    name: 'ellipsis-horizontal',
    size: 20,
    color: COLORS.subText,
  }
};

// 導航圖示
export const NAVIGATION_ICONS = {
  back: {
    name: 'arrow-back',
    size: 24,
    color: COLORS.text,
  },
  close: {
    name: 'close',
    size: 24,
    color: COLORS.text,
  },
  settings: {
    name: 'settings-outline',
    size: 24,
    color: COLORS.text,
  }
};

// 媒體圖示
export const MEDIA_ICONS = {
  image: {
    name: 'image-outline',
    size: 24,
    color: COLORS.accent,
  },
  video: {
    name: 'videocam-outline',
    size: 24,
    color: COLORS.accent,
  },
  code: {
    name: 'code-slash-outline',
    size: 24,
    color: COLORS.accent,
  }
};

// 狀態圖示
export const STATUS_ICONS = {
  success: {
    name: 'checkmark-circle-outline',
    size: 22,
    color: COLORS.success,
  },
  error: {
    name: 'alert-circle-outline',
    size: 22,
    color: COLORS.error,
  },
  warning: {
    name: 'warning-outline',
    size: 22,
    color: COLORS.warning,
  },
  info: {
    name: 'information-circle-outline',
    size: 22,
    color: COLORS.info,
  }
};

// 資料夾圖示
export const FOLDER_ICONS = {
  portfolio: {
    name: 'briefcase-outline',
    size: 24,
    color: COLORS.accent,
  },
  projects: {
    name: 'folder-outline',
    size: 24,
    color: COLORS.accent,
  }
};

// 通用圖示
export const COMMON_ICONS = {
  user: {
    name: 'person-outline',
    focusedName: 'person',
    size: 24,
    color: COLORS.text,
  },
  edit: {
    name: 'pencil-outline',
    size: 22,
    color: COLORS.text,
  },
  delete: {
    name: 'trash-outline',
    size: 22,
    color: COLORS.error,
  },
  calendar: {
    name: 'calendar-outline',
    size: 22,
    color: COLORS.text,
  },
  link: {
    name: 'link-outline',
    size: 22,
    color: COLORS.text,
  },
  location: {
    name: 'location-outline',
    size: 22,
    color: COLORS.text,
  },
  phone: {
    name: 'call-outline',
    size: 22,
    color: COLORS.text,
  },
  mail: {
    name: 'mail-outline',
    size: 22,
    color: COLORS.text,
  },
  send: {
    name: 'send-outline',
    size: 22,
    color: COLORS.accent,
  },
  add: {
    name: 'add-outline',
    size: 24,
    color: COLORS.text,
  },
  portfolio: {
    name: 'briefcase-outline',
    focusedName: 'briefcase',
    size: 22,
    color: COLORS.text,
    focusedColor: COLORS.accent,
  }
};

// 獲取圖示參數的輔助函數
export const getIconProps = (
  icon: IconType, 
  isFocused: boolean = false
) => {
  return {
    name: isFocused && icon.focusedName ? icon.focusedName : icon.name,
    size: icon.size || 24,
    color: isFocused && icon.focusedColor ? icon.focusedColor : (icon.color || COLORS.text)
  };
};

export default {
  TAB_ICONS,
  ACTION_ICONS,
  NAVIGATION_ICONS,
  MEDIA_ICONS,
  STATUS_ICONS,
  FOLDER_ICONS,
  COMMON_ICONS,
  getIconProps
}; 