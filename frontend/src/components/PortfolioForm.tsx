// 作品集表單組件，用於創建和編輯作品集
import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Portfolio, CreatePortfolioParams } from '../api/portfolios';
import * as ImagePicker from 'react-native-image-picker';
import { Video, ResizeMode } from 'expo-av';

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
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
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
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
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
          numberOfLines={5}
          textAlignVertical="top"
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>
      
      {/* 圖片上傳 */}
      <View style={styles.mediaSection}>
        <Text style={styles.label}>作品圖片</Text>
        
        {imagePreview ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imagePreview }} style={styles.preview} />
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => {
                setImage(null);
                setImagePreview(undefined);
              }}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleSelectImage}
          >
            <Ionicons name="image-outline" size={24} color={COLORS.accent} />
            <Text style={styles.uploadText}>選擇圖片</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* 視頻上傳 */}
      <View style={styles.mediaSection}>
        <Text style={styles.label}>作品影片</Text>
        
        {videoPreview ? (
          <View style={styles.previewContainer}>
            <Video
              source={{ uri: videoPreview }}
              style={styles.preview}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
            />
            <TouchableOpacity 
              style={styles.removeButton}
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
            style={styles.uploadButton}
            onPress={handleSelectVideo}
          >
            <Ionicons name="videocam-outline" size={24} color={COLORS.accent} />
            <Text style={styles.uploadText}>選擇影片</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* GitHub 連結 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>GitHub 連結</Text>
        <TextInput
          value={githubUrl}
          onChangeText={setGithubUrl}
          style={[styles.input, errors.githubUrl ? styles.inputError : null]}
          placeholder="https://github.com/username/repo"
          placeholderTextColor={COLORS.placeholder}
          autoCapitalize="none"
        />
        {errors.githubUrl && <Text style={styles.errorText}>{errors.githubUrl}</Text>}
      </View>
      
      {/* Demo 連結 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Demo 連結</Text>
        <TextInput
          value={demoUrl}
          onChangeText={setDemoUrl}
          style={[styles.input, errors.demoUrl ? styles.inputError : null]}
          placeholder="https://yourdemo.com"
          placeholderTextColor={COLORS.placeholder}
          autoCapitalize="none"
        />
        {errors.demoUrl && <Text style={styles.errorText}>{errors.demoUrl}</Text>}
      </View>
      
      {/* YouTube 連結 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>YouTube 連結</Text>
        <TextInput
          value={youtubeUrl}
          onChangeText={setYoutubeUrl}
          style={[styles.input, errors.youtubeUrl ? styles.inputError : null]}
          placeholder="https://youtube.com/watch?v=..."
          placeholderTextColor={COLORS.placeholder}
          autoCapitalize="none"
        />
        {errors.youtubeUrl && <Text style={styles.errorText}>{errors.youtubeUrl}</Text>}
      </View>
      
      {/* 提交按鈕 */}
      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Text style={styles.submitText}>
            {initialValues ? '保存修改' : '創建作品集'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
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
    minHeight: 120,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  mediaSection: {
    marginBottom: SPACING.md,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    height: 120,
  },
  uploadText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.accent,
    marginLeft: SPACING.xs,
  },
  previewContainer: {
    position: 'relative',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    height: 200,
  },
  preview: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.md,
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: `${COLORS.background}80`,
    borderRadius: RADIUS.full,
    padding: 2,
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    ...SHADOW.md,
  },
  submitText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.primary,
  },
});

export default PortfolioForm; 