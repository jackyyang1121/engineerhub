import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ImageBackground,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, LAYOUT } from '../theme';
import FollowButton from './FollowButton';
import MessageButton from './MessageButton';

const { width } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = LAYOUT.headerHeight;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

interface ProfileHeaderSectionProps {
  profile: any;
  isMe: boolean;
  scrollY: Animated.Value;
  onFollowPress: () => void;
  onMessagePress: () => void;
  onEditProfile: () => void;
  onBackPress: () => void;
  onSettingsPress: () => void;
}

const ProfileHeaderSection: React.FC<ProfileHeaderSectionProps> = ({
  profile,
  isMe,
  scrollY,
  onFollowPress,
  onMessagePress,
  onEditProfile,
  onBackPress,
  onSettingsPress,
}) => {
  if (!profile) return null;

  // 计算动画值
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const avatarSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [88, 36],
    extrapolate: 'clamp',
  });

  const avatarMarginTop = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT - 44, 10],
    extrapolate: 'clamp',
  });

  const userNameOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const userNameSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 18],
    extrapolate: 'clamp',
  });

  const backgroundTheme = profile.theme_color || COLORS.accent;
  const gradientColors = [
    `${backgroundTheme}99`,
    `${backgroundTheme}66`,
    `${backgroundTheme}33`,
    'transparent',
  ];

  return (
    <>
      {/* 可以自定义主题颜色的头部背景 */}
      <Animated.View
        style={[
          styles.headerBackground,
          {
            height: headerHeight,
            backgroundColor: backgroundTheme,
          },
        ]}
      >
        {/* 自定义背景图 */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: scrollY.interpolate({
                inputRange: [0, HEADER_SCROLL_DISTANCE],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          {profile.background ? (
            <ImageBackground
              source={{ uri: profile.background }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            >
              <LinearGradient
                colors={gradientColors}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
              />
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={[backgroundTheme, `${backgroundTheme}77`]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
            />
          )}
        </Animated.View>

        {/* 顶部导航栏 */}
        <Animated.View
          style={[
            styles.navigationBar,
            {
              opacity: headerBackgroundOpacity,
              backgroundColor: COLORS.background,
            },
          ]}
        >
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <Animated.Text
            style={[
              styles.headerTitle,
              {
                opacity: userNameOpacity,
                fontSize: userNameSize,
              },
            ]}
          >
            {profile.display_name || profile.username}
          </Animated.Text>
          
          <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* 头像 */}
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            transform: [{ translateY: avatarMarginTop }],
          },
        ]}
      >
        <Animated.Image
          source={{ 
            uri: profile.avatar || 'https://i.pravatar.cc/300'
          }}
          style={[
            styles.avatar,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize,
            },
          ]}
        />
      </Animated.View>

      {/* 用户信息 */}
      <View style={styles.profileInfoContainer}>
        <View style={styles.nameSection}>
          <Text style={styles.displayName}>{profile.display_name || profile.username}</Text>
          {profile.username && profile.display_name && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}
        </View>

        {/* 位置和标题 */}
        <View style={styles.bioSection}>
          {profile.headline && (
            <Text style={styles.headline}>{profile.headline}</Text>
          )}
          
          {profile.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color={COLORS.accent} />
              <Text style={styles.location}>{profile.location}</Text>
            </View>
          )}
          
          {profile.website && (
            <TouchableOpacity style={styles.websiteContainer}>
              <Ionicons name="link-outline" size={16} color={COLORS.accent} />
              <Text style={styles.website} numberOfLines={1}>{profile.website}</Text>
            </TouchableOpacity>
          )}
          
          {profile.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}
        </View>

        {/* 追踪统计 */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statValue}>{profile.followers_count || 0}</Text>
            <Text style={styles.statLabel}>粉絲</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statValue}>{profile.following_count || 0}</Text>
            <Text style={styles.statLabel}>追蹤中</Text>
          </TouchableOpacity>
        </View>

        {/* 互动按钮组 */}
        <View style={styles.actionContainer}>
          {isMe ? (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={onEditProfile}
            >
              <Text style={styles.editButtonText}>編輯個人檔案</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtons}>
              <FollowButton 
                isFollowing={profile.is_following} 
                onPress={onFollowPress} 
              />
              <MessageButton onPress={onMessagePress} />
            </View>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  navigationBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: LAYOUT.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? LAYOUT.safeTop : StatusBar.currentHeight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${COLORS.card}77`,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${COLORS.card}77`,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  avatarContainer: {
    position: 'absolute',
    left: SPACING.lg,
    zIndex: 2,
  },
  avatar: {
    borderWidth: 3,
    borderColor: COLORS.background,
    ...SHADOW.lg,
  },
  profileInfoContainer: {
    marginTop: HEADER_MAX_HEIGHT + SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  nameSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  displayName: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.xl,
    color: COLORS.text,
    marginBottom: 2,
  },
  username: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
  },
  bioSection: {
    marginVertical: SPACING.sm,
  },
  headline: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  location: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    marginLeft: 4,
  },
  websiteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  website: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    marginLeft: 4,
    maxWidth: width - 100,
  },
  bio: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    lineHeight: 22,
    marginTop: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    marginVertical: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: SPACING.lg,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    marginLeft: 4,
  },
  actionContainer: {
    marginBottom: SPACING.md,
  },
  editButton: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
  },
});

export default ProfileHeaderSection; 