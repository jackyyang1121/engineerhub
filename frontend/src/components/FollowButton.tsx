import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

interface FollowButtonProps {
  isFollowing: boolean;
  onPress: () => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ isFollowing, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.button, isFollowing ? styles.unfollow : styles.follow]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.text, isFollowing ? styles.unfollowText : styles.followText]}>
        {isFollowing ? '取消追蹤' : '追蹤'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: 24,
    ...SHADOW,
    marginRight: 8,
  },
  follow: {
    backgroundColor: COLORS.accent,
  },
  unfollow: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
  },
  followText: {
    color: COLORS.primary,
  },
  unfollowText: {
    color: COLORS.accent,
  },
});

export default FollowButton; 