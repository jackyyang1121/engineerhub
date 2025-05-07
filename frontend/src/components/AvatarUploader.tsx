import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, RADIUS, SHADOW } from '../theme';

interface AvatarUploaderProps {
  avatarUrl?: string;
  onPick: (uri?: string) => void;
  size?: number;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ 
  avatarUrl, 
  onPick, 
  size = 96  // 預設大小為 96
}) => {
  const dynamicStyles = {
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
    } as ViewStyle,
    
    image: {
      width: size,
      height: size,
      borderRadius: size / 2,
    } as ImageStyle,
  };

  const iconSize = Math.max(16, size * 0.2);  // 圖標大小隨頭像大小變化
  const iconWrapSize = Math.max(24, size * 0.3);  // 圖標容器大小隨頭像大小變化

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => onPick()} 
        style={[styles.avatarBtn, dynamicStyles.container]} 
        activeOpacity={0.8}
      >
        <Image
          source={avatarUrl ? { uri: avatarUrl } : { uri: `https://placehold.co/${size}x${size}?text=Avatar` }}
          style={[styles.avatar, dynamicStyles.image]}
        />
        <View style={[
          styles.iconWrap,
          {
            borderRadius: iconWrapSize / 2,
            padding: iconWrapSize * 0.15,
          }
        ]}>
          <Ionicons name="camera" size={iconSize} color={COLORS.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarBtn: {
    ...SHADOW.md,
  },
  avatar: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  iconWrap: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
});

export default AvatarUploader; 