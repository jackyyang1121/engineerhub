import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../theme';
import AvatarUploader from './AvatarUploader';

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profileData: any) => Promise<boolean>;
  profile: any;
  themeColor?: string;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  onClose,
  onSave,
  profile,
  themeColor = COLORS.accent,
}) => {
  const [editedProfile, setEditedProfile] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedThemeColor, setSelectedThemeColor] = useState(themeColor);

  // 預定義的主題顏色
  const themeColors = [
    '#3B82F6', // 藍色
    '#10B981', // 綠色
    '#EC4899', // 粉色
    '#F59E0B', // 橙色
    '#6366F1', // 靛藍
    '#8B5CF6', // 紫色
    '#EF4444', // 紅色
    '#06B6D4', // 青色
  ];

  // 當profile改變時更新編輯表單
  useEffect(() => {
    if (profile) {
      setEditedProfile({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        headline: profile.headline || '',
        location: profile.location || '',
        website: profile.website || '',
        avatar: profile.avatar || '',
        background: profile.background || '',
        theme_color: profile.theme_color || themeColor,
        show_follower_count: profile.show_follower_count !== false,
        is_private: profile.is_private || false,
      });
      
      if (profile.theme_color) {
        setSelectedThemeColor(profile.theme_color);
      }
    }
  }, [profile, visible]);

  // 處理表單變更
  const handleChange = (key: string, value: any) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // 處理主題顏色選擇
  const handleColorSelection = (color: string) => {
    setSelectedThemeColor(color);
    handleChange('theme_color', color);
  };

  // 處理保存
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const success = await onSave(editedProfile);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('保存失敗', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={10}
            reducedTransparencyFallbackColor={COLORS.background}
          />
          
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.modalContainer}>
                <View style={styles.header}>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                  <Text style={styles.title}>編輯個人檔案</Text>
                  <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.saveButton, { backgroundColor: selectedThemeColor }]}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Text style={styles.saveButtonText}>保存</Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.scrollView}>
                  {/* 背景和頭像編輯 */}
                  <View style={styles.imageSection}>
                    <View style={styles.backgroundContainer}>
                      {editedProfile.background ? (
                        <Image
                          source={{ uri: editedProfile.background }}
                          style={styles.backgroundImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.placeholderBackground, { backgroundColor: selectedThemeColor }]} />
                      )}
                      
                      <TouchableOpacity style={styles.editBackgroundButton}>
                        <Ionicons name="image-outline" size={20} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.avatarContainer}>
                      <AvatarUploader
                        avatarUrl={editedProfile.avatar}
                        onPick={(uri) => uri && handleChange('avatar', uri)}
                        size={80}
                      />
                    </View>
                  </View>
                  
                  {/* 表單字段 */}
                  <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>顯示名稱</Text>
                      <TextInput
                        style={styles.input}
                        value={editedProfile.display_name}
                        onChangeText={(value) => handleChange('display_name', value)}
                        placeholder="顯示名稱"
                        placeholderTextColor={COLORS.placeholder}
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>用戶名</Text>
                      <TextInput
                        style={styles.input}
                        value={editedProfile.username}
                        onChangeText={(value) => handleChange('username', value)}
                        placeholder="用戶名"
                        placeholderTextColor={COLORS.placeholder}
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>頭銜</Text>
                      <TextInput
                        style={styles.input}
                        value={editedProfile.headline}
                        onChangeText={(value) => handleChange('headline', value)}
                        placeholder="例如：軟體工程師 / UI設計師"
                        placeholderTextColor={COLORS.placeholder}
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>個人簡介</Text>
                      <TextInput
                        style={[styles.input, styles.multilineInput]}
                        value={editedProfile.bio}
                        onChangeText={(value) => handleChange('bio', value)}
                        placeholder="介紹一下你自己..."
                        placeholderTextColor={COLORS.placeholder}
                        multiline
                        numberOfLines={4}
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>所在地</Text>
                      <TextInput
                        style={styles.input}
                        value={editedProfile.location}
                        onChangeText={(value) => handleChange('location', value)}
                        placeholder="例如：台北市 / 台灣"
                        placeholderTextColor={COLORS.placeholder}
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>網站</Text>
                      <TextInput
                        style={styles.input}
                        value={editedProfile.website}
                        onChangeText={(value) => handleChange('website', value)}
                        placeholder="例如：https://your-website.com"
                        placeholderTextColor={COLORS.placeholder}
                        autoCapitalize="none"
                        keyboardType="url"
                      />
                    </View>
                    
                    {/* 主題顏色選擇器 */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>主題顏色</Text>
                      <View style={styles.colorPickerContainer}>
                        {themeColors.map((color) => (
                          <TouchableOpacity
                            key={color}
                            style={[
                              styles.colorOption,
                              { backgroundColor: color },
                              selectedThemeColor === color && styles.selectedColorOption,
                            ]}
                            onPress={() => handleColorSelection(color)}
                          >
                            {selectedThemeColor === color && (
                              <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    
                    {/* 隱私設定 */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>隱私設定</Text>
                      
                      <TouchableOpacity
                        style={styles.toggleOption}
                        onPress={() => handleChange('show_follower_count', !editedProfile.show_follower_count)}
                      >
                        <Text style={styles.toggleLabel}>顯示追蹤者數量</Text>
                        <View style={[
                          styles.toggleSwitch,
                          editedProfile.show_follower_count && { backgroundColor: selectedThemeColor }
                        ]}>
                          <View style={[
                            styles.toggleDot,
                            editedProfile.show_follower_count && styles.toggleDotActive
                          ]} />
                        </View>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.toggleOption}
                        onPress={() => handleChange('is_private', !editedProfile.is_private)}
                      >
                        <Text style={styles.toggleLabel}>私密帳號</Text>
                        <View style={[
                          styles.toggleSwitch,
                          editedProfile.is_private && { backgroundColor: selectedThemeColor }
                        ]}>
                          <View style={[
                            styles.toggleDot,
                            editedProfile.is_private && styles.toggleDotActive
                          ]} />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    marginHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    width: '100%',
    overflow: 'hidden',
    ...SHADOW.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  saveButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.primary,
  },
  scrollView: {
    maxHeight: 600,
  },
  imageSection: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  backgroundContainer: {
    height: 120,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBackground: {
    width: '100%',
    height: '100%',
  },
  editBackgroundButton: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.background}CC`,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  avatarContainer: {
    position: 'absolute',
    left: SPACING.lg,
    bottom: -40,
  },
  formSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  colorPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: COLORS.text,
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  toggleLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  toggleSwitch: {
    width: 46,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    padding: 2,
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.subText,
  },
  toggleDotActive: {
    backgroundColor: COLORS.primary,
    transform: [{ translateX: 22 }],
  },
});

export default ProfileEditModal; 