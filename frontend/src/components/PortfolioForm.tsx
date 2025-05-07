// 作品集表單組件，用於創建和編輯作品集
// 設計理念：簡約、高級、現代風格的表單，參考Figma和Notion的設計語言

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  Keyboard,
  Dimensions,
  KeyboardAvoidingView
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Portfolio, CreatePortfolioParams } from '../api/portfolios';
import * as ImagePicker from 'react-native-image-picker';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface PortfolioFormProps {
  onSubmit: (data: CreatePortfolioParams) => Promise<void>;
  initialValues?: Portfolio;
  isLoading?: boolean;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ 
  onSubmit, 
  initialValues,
  isLoading = false
}) => {
  // 表單狀態
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [githubUrl, setGithubUrl] = useState(initialValues?.github_url || '');
  const [demoUrl, setDemoUrl] = useState(initialValues?.demo_url || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialValues?.youtube_url || '');
  
  // 媒體狀態
  const [image, setImage] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialValues?.image_url);
  const [video, setVideo] = useState<any>(null);
  const [videoPreview, setVideoPreview] = useState<string | undefined>(initialValues?.video_url);
  
  // 表單錯誤
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 動畫值
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(20)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // 鍵盤監聽
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    // 初始動畫
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // 選擇圖片
  const handleSelectImage = () => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8 as any,
      maxWidth: 1200,
      maxHeight: 1200,
    };
    
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      
      if (response.errorCode) {
        Alert.alert('錯誤', response.errorMessage || '選擇圖片時發生錯誤');
        return;
      }
      
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setImage({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `image-${Date.now()}.jpg`
        });
        setImagePreview(asset.uri);
      }
    });
  };
  
  // 選擇視頻
  const handleSelectVideo = () => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'video',
      quality: 0.8 as any,
    };
    
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      
      if (response.errorCode) {
        Alert.alert('錯誤', response.errorMessage || '選擇視頻時發生錯誤');
        return;
      }
      
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setVideo({
          uri: asset.uri,
          type: asset.type || 'video/mp4',
          name: asset.fileName || `video-${Date.now()}.mp4`
        });
        setVideoPreview(asset.uri);
      }
    });
  };
  
  // 驗證表單
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = '標題不能為空';
    }
    
    if (!description.trim()) {
      newErrors.description = '描述不能為空';
    }
    
    // 驗證鏈接格式
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
    
    if (githubUrl && !urlPattern.test(githubUrl)) {
      newErrors.githubUrl = 'GitHub 連結格式不正確';
    }
    
    if (demoUrl && !urlPattern.test(demoUrl)) {
      newErrors.demoUrl = 'Demo 連結格式不正確';
    }
    
    if (youtubeUrl && !urlPattern.test(youtubeUrl)) {
      newErrors.youtubeUrl = 'YouTube 連結格式不正確';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 提交表單
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const formData: CreatePortfolioParams = {
      title,
      description,
      github_url: githubUrl || undefined,
      demo_url: demoUrl || undefined,
      youtube_url: youtubeUrl || undefined,
      image: image,
      video: video
    };
    
    try {
      await onSubmit(formData);
    } catch (error) {
      Alert.alert('提交失敗', '保存作品集時發生錯誤，請稍後再試');
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }]
            }
          ]}
        >
          {/* 圖片上傳區域 - 設計成為頂部圖片區域 */}
          <View style={styles.mediaHeader}>
            {imagePreview ? (
              <View style={styles.headerPreviewContainer}>
                <Image source={{ uri: imagePreview }} style={styles.headerPreview} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.5)']}
                  style={styles.headerGradient}
                />
                <TouchableOpacity 
                  style={styles.headerRemoveButton}
                  onPress={() => {
                    setImage(null);
                    setImagePreview(undefined);
                  }}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.background} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.changeHeaderButton}
                  onPress={handleSelectImage}
                >
                  <Text style={styles.changeHeaderText}>更換圖片</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.headerUploadButton}
                onPress={handleSelectImage}
              >
                <Ionicons name="image-outline" size={36} color={COLORS.accent} />
                <Text style={styles.headerUploadText}>點擊上傳封面圖片</Text>
                <Text style={styles.headerUploadSubText}>
                  建議尺寸: 1200 x 800 像素
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 標題輸入 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>標題 *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={[styles.input, errors.title ? styles.inputError : null]}
              placeholder="作品標題"
              placeholderTextColor={COLORS.placeholder}
            />
            {errors.title && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{errors.title}</Text>
              </View>
            )}
          </View>
          
          {/* 描述輸入 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>描述 *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={[styles.textArea, errors.description ? styles.inputError : null]}
              placeholder="詳細描述您的作品..."
              placeholderTextColor={COLORS.placeholder}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            {errors.description && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{errors.description}</Text>
              </View>
            )}
          </View>
          
          {/* 連結部分 */}
          <View style={styles.linksSection}>
            <Text style={styles.sectionTitle}>作品連結</Text>
            
            {/* GitHub 連結 */}
            <View style={styles.inputContainer}>
              <View style={styles.labelWithIcon}>
                <Ionicons name="logo-github" size={18} color={COLORS.text} />
                <Text style={styles.label}>GitHub 連結</Text>
              </View>
              <TextInput
                value={githubUrl}
                onChangeText={setGithubUrl}
                style={[styles.input, errors.githubUrl ? styles.inputError : null]}
                placeholder="https://github.com/username/repo"
                placeholderTextColor={COLORS.placeholder}
                autoCapitalize="none"
              />
              {errors.githubUrl && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{errors.githubUrl}</Text>
                </View>
              )}
            </View>
            
            {/* Demo 連結 */}
            <View style={styles.inputContainer}>
              <View style={styles.labelWithIcon}>
                <Ionicons name="globe-outline" size={18} color={COLORS.text} />
                <Text style={styles.label}>Demo 連結</Text>
              </View>
              <TextInput
                value={demoUrl}
                onChangeText={setDemoUrl}
                style={[styles.input, errors.demoUrl ? styles.inputError : null]}
                placeholder="https://yourdemo.com"
                placeholderTextColor={COLORS.placeholder}
                autoCapitalize="none"
              />
              {errors.demoUrl && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{errors.demoUrl}</Text>
                </View>
              )}
            </View>
            
            {/* YouTube 連結 */}
            <View style={styles.inputContainer}>
              <View style={styles.labelWithIcon}>
                <Ionicons name="logo-youtube" size={18} color={COLORS.text} />
                <Text style={styles.label}>YouTube 連結</Text>
              </View>
              <TextInput
                value={youtubeUrl}
                onChangeText={setYoutubeUrl}
                style={[styles.input, errors.youtubeUrl ? styles.inputError : null]}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor={COLORS.placeholder}
                autoCapitalize="none"
              />
              {errors.youtubeUrl && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{errors.youtubeUrl}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* 視頻上傳 */}
          <View style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>作品影片</Text>
            
            {videoPreview ? (
              <View style={styles.videoPreviewContainer}>
                <Video
                  source={{ uri: videoPreview }}
                  style={styles.videoPreview}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                />
                <TouchableOpacity 
                  style={styles.removeVideoButton}
                  onPress={() => {
                    setVideo(null);
                    setVideoPreview(undefined);
                  }}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.videoUploadButton}
                onPress={handleSelectVideo}
              >
                <Ionicons name="videocam-outline" size={28} color={COLORS.accent} />
                <Text style={styles.videoUploadText}>上傳演示影片</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* 提交按鈕 */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name={initialValues ? "save-outline" : "add-circle-outline"} size={20} color={COLORS.primary} />
                <Text style={styles.submitText}>
                  {initialValues ? '保存修改' : '創建作品集'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SPACING.xxl,
  },
  formContainer: {
    paddingBottom: SPACING.xxl,
  },
  mediaHeader: {
    width: '100%',
    height: 200,
    marginBottom: SPACING.lg,
  },
  headerUploadButton: {
    width: '100%',
    height: '100%',
    backgroundColor: `${COLORS.elevated}80`,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  headerUploadText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.accent,
    marginTop: SPACING.sm,
  },
  headerUploadSubText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xs,
    color: COLORS.subText,
    marginTop: SPACING.xs,
  },
  headerPreviewContainer: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  headerPreview: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.md,
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerRemoveButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: `${COLORS.error}40`,
    borderRadius: RADIUS.full,
    padding: 4,
  },
  changeHeaderButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: `${COLORS.accent}90`,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  changeHeaderText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.background,
  },
  inputContainer: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.md,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 0,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    height: 48,
  },
  textArea: {
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xs,
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
  linksSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  mediaSection: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  videoUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    height: 100,
    marginTop: SPACING.xs,
  },
  videoUploadText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.accent,
    marginLeft: SPACING.sm,
  },
  videoPreviewContainer: {
    position: 'relative',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    height: 200,
    marginTop: SPACING.xs,
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.md,
  },
  removeVideoButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: `${COLORS.background}80`,
    borderRadius: RADIUS.full,
    padding: 4,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.md,
    ...SHADOW.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
});

export default PortfolioForm; 