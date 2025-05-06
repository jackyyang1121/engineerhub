import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, RADIUS, SHADOW } from '../theme';

interface AvatarUploaderProps {
  avatarUrl?: string;
  onPick: () => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ avatarUrl, onPick }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPick} style={styles.avatarBtn} activeOpacity={0.8}>
        <Image
          source={avatarUrl ? { uri: avatarUrl } : { uri: 'https://placehold.co/96x96?text=Avatar' }}
          style={styles.avatar}
        />
        <View style={styles.iconWrap}>
          <Ionicons name="camera" size={20} color={COLORS.primary} />
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
    borderRadius: 48,
    ...SHADOW,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  iconWrap: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
});

export default AvatarUploader; 