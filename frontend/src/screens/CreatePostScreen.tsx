import React, { useState, useRef } from 'react';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, ANIMATION, LAYOUT } from '../theme';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Keyboard,
  StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../api/posts';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import { FlatList } from 'react-native-gesture-handler';

// 發佈貼文頁面檔案，處理用戶發文、內容輸入、媒體上傳等功能

type RootStackParamList = {
  MainApp: {
    screen: string;
    params: {
      refresh?: boolean;
      newPost?: any; 
    }
  };
  CreatePost: undefined;
  // 其他頁面可依需求補充
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

// 定義媒體項目類型
type MediaItem = {
  uri: string;
  type: 'image' | 'video';
  name: string;
  size?: number;
};

// 定義代碼塊類型
type CodeBlock = {
  code: string;
  language: string;
};

const { width } = Dimensions.get('window');
const MEDIA_ITEM_WIDTH = width * 0.85;

const CreatePostScreen = () => {
  const { token, user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [showCodeInput, setShowCodeInput] = useState(false);
  
  // 動畫值
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // 處理選擇圖片或視頻
  const handleSelectMedia = () => {
    if (mediaItems.length >= 20) {
      Alert.alert('超出上傳限制', '最多只能上傳20個媒體文件');
      return;
    }
    
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'mixed',
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8 as any,
    };
    
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      
      if (response.errorCode) {
        Alert.alert('錯誤', response.errorMessage || '選擇媒體時發生錯誤');
        return;
      }
      
      if (response.assets && response.assets.length > 0) {
        const newItems = response.assets.map(asset => ({
          uri: asset.uri || '',
          type: (asset.type?.startsWith('image/') ? 'image' : 'video') as 'image' | 'video',
          name: asset.fileName || `media-${Date.now()}`,
          size: asset.fileSize
        }));
        
        setMediaItems(prev => [...prev, ...newItems]);
      }
    });
  };
  
  // 處理刪除媒體
  const handleRemoveMedia = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
  };
  
  // 處理添加代碼塊
  const handleAddCodeBlock = () => {
    if (!codeInput.trim()) {
      Alert.alert('錯誤', '代碼不能為空');
      return;
    }
    
    if (codeInput.split('\n').length > 100) {
      Alert.alert('錯誤', '代碼行數不能超過100行');
      return;
    }
    
    setCodeBlocks(prev => [
      ...prev, 
      { code: codeInput, language: codeLanguage }
    ]);
    
    setCodeInput('');
    setShowCodeInput(false);
    Keyboard.dismiss();
  };
  
  // 處理刪除代碼塊
  const handleRemoveCodeBlock = (index: number) => {
    setCodeBlocks(prev => prev.filter((_, i) => i !== index));
  };
  
  // 處理發布貼文
  const handlePost = async () => {
    if (!content.trim() && mediaItems.length === 0 && codeBlocks.length === 0) {
      setError('請添加文字、圖片、視頻或代碼');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 淡出動畫
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATION.normal,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 50,
          duration: ANIMATION.normal,
          useNativeDriver: true,
        })
      ]).start();
      
      // 創建 FormData
      const formData = new FormData();
      formData.append('content', content);
      
      // 添加媒體文件
      mediaItems.forEach((item, index) => {
        formData.append('media', {
          uri: item.uri,
          type: item.type === 'image' ? 'image/jpeg' : 'video/mp4',
          name: item.name
        });
      });
      
      // 添加代碼塊
      codeBlocks.forEach((block, index) => {
        formData.append(`code_blocks[${index}][code]`, block.code);
        formData.append(`code_blocks[${index}][language]`, block.language);
      });
      
      // 發送請求
      const response = await createPost(token, { 
        content,
        media: mediaItems as any,
        code_blocks: codeBlocks
      });
      
      // 重置表單
      setContent('');
      setMediaItems([]);
      setCodeBlocks([]);
      
      // 直接導航回首頁並傳遞新貼文
      navigation.navigate('MainApp', { 
        screen: 'Home',
        params: {
          refresh: true, 
          newPost: response 
        }
      });
    } catch (err) {
      setError('發文失敗，請稍後再試');
      
      // 顯示錯誤時恢復動畫
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION.normal,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION.normal,
          useNativeDriver: true,
        })
      ]).start();
    } finally {
      setLoading(false);
    }
  };
  
  // 渲染媒體預覽
  const renderMediaItem = ({ item, index }: { item: MediaItem; index: number }) => (
    <View style={styles.mediaPreviewContainer}>
      {item.type === 'image' ? (
        <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
      ) : (
        <View style={[styles.mediaPreview, styles.videoPreview]}>
          <Ionicons name="videocam" size={40} color={COLORS.accent} />
          <Text style={styles.videoText}>視頻</Text>
        </View>
      )}
      <TouchableOpacity 
        style={styles.removeMediaButton}
        onPress={() => handleRemoveMedia(index)}
      >
        <Ionicons name="close-circle" size={24} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );
  
  // 渲染代碼塊預覽
  const renderCodeBlock = ({ item, index }: { item: CodeBlock; index: number }) => (
    <View style={styles.codeBlockContainer}>
      <View style={styles.codeBlockHeader}>
        <Text style={styles.codeBlockLanguage}>{item.language}</Text>
        <TouchableOpacity 
          style={styles.removeCodeButton}
          onPress={() => handleRemoveCodeBlock(index)}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.codeBlockContent}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={styles.codeText}>{item.code}</Text>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* 頂部標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>創建貼文</Text>
        <TouchableOpacity 
          style={[styles.postButton, (!content.trim() && mediaItems.length === 0 && codeBlocks.length === 0) && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={loading || (!content.trim() && mediaItems.length === 0 && codeBlocks.length === 0)}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.postButtonText}>發佈</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Animated.ScrollView 
          style={[styles.scrollView, { opacity: fadeAnim }]}
          contentContainerStyle={[
            styles.scrollContent,
            { transform: [{ translateY: translateY }] }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.userInfoBar}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={20} color={COLORS.text} />
            </View>
            <Text style={styles.username}>{user?.username || '用戶'}</Text>
          </View>
          
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="分享你的想法..."
            style={styles.contentInput}
            placeholderTextColor={COLORS.subText}
            multiline
            maxLength={2000}
            autoFocus
          />
          
          {/* 媒體預覽區 */}
          {mediaItems.length > 0 && (
            <FlatList
              data={mediaItems}
              renderItem={renderMediaItem}
              keyExtractor={(_, index) => `media-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mediaList}
              pagingEnabled
              snapToInterval={MEDIA_ITEM_WIDTH + SPACING.md}
              decelerationRate="fast"
            />
          )}
          
          {/* 代碼塊輸入區 */}
          {showCodeInput && (
            <View style={styles.codeInputContainer}>
              <View style={styles.codeInputHeader}>
                <Text style={styles.codeInputTitle}>添加代碼</Text>
                <View style={styles.codeLanguageSelector}>
                  <TouchableOpacity 
                    style={[styles.languageOption, codeLanguage === 'javascript' && styles.languageOptionSelected]}
                    onPress={() => setCodeLanguage('javascript')}
                  >
                    <Text style={[styles.languageOptionText, codeLanguage === 'javascript' && styles.languageOptionTextSelected]}>JS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.languageOption, codeLanguage === 'python' && styles.languageOptionSelected]}
                    onPress={() => setCodeLanguage('python')}
                  >
                    <Text style={[styles.languageOptionText, codeLanguage === 'python' && styles.languageOptionTextSelected]}>Python</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.languageOption, codeLanguage === 'java' && styles.languageOptionSelected]}
                    onPress={() => setCodeLanguage('java')}
                  >
                    <Text style={[styles.languageOptionText, codeLanguage === 'java' && styles.languageOptionTextSelected]}>Java</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                value={codeInput}
                onChangeText={setCodeInput}
                placeholder="在此輸入代碼..."
                style={styles.codeTextInput}
                placeholderTextColor={COLORS.subText}
                multiline
                numberOfLines={10}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.codeActionsContainer}>
                <TouchableOpacity 
                  style={styles.cancelCodeButton}
                  onPress={() => {
                    setShowCodeInput(false);
                    setCodeInput('');
                  }}
                >
                  <Text style={styles.cancelCodeText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addCodeButton}
                  onPress={handleAddCodeBlock}
                  disabled={!codeInput.trim()}
                >
                  <Text style={styles.addCodeText}>添加</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* 已添加的代碼塊列表 */}
          {codeBlocks.length > 0 && (
            <View style={styles.codeBlocksList}>
              <Text style={styles.codeBlocksTitle}>代碼預覽</Text>
              {codeBlocks.map((block, index) => (
                <View key={`code-${index}`} style={styles.codeBlockContainer}>
                  <View style={styles.codeBlockHeader}>
                    <Text style={styles.codeBlockLanguage}>{block.language}</Text>
                    <TouchableOpacity 
                      style={styles.removeCodeButton}
                      onPress={() => handleRemoveCodeBlock(index)}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.codeBlockContent}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <Text style={styles.codeText}>{block.code}</Text>
                    </ScrollView>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </Animated.ScrollView>
        
        {/* 底部工具欄 */}
        <View style={styles.toolbar}>
          <TouchableOpacity 
            style={styles.toolbarButton}
            onPress={handleSelectMedia}
            disabled={mediaItems.length >= 20}
          >
            <Ionicons name="image-outline" size={24} color={mediaItems.length >= 20 ? COLORS.subText : COLORS.accent} />
            <Text style={[styles.toolbarButtonText, mediaItems.length >= 20 && styles.toolbarButtonTextDisabled]}>
              媒體
            </Text>
            {mediaItems.length > 0 && (
              <View style={styles.mediaCountBadge}>
                <Text style={styles.mediaCountText}>{mediaItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.toolbarButton}
            onPress={() => setShowCodeInput(true)}
            disabled={showCodeInput}
          >
            <Ionicons name="code-slash-outline" size={24} color={showCodeInput ? COLORS.subText : COLORS.accent} />
            <Text style={[styles.toolbarButtonText, showCodeInput && styles.toolbarButtonTextDisabled]}>
              代碼
            </Text>
            {codeBlocks.length > 0 && (
              <View style={styles.mediaCountBadge}>
                <Text style={styles.mediaCountText}>{codeBlocks.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
  },
  postButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    minWidth: 60,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: COLORS.inactive,
  },
  postButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.primary,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  userInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  username: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  contentInput: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    minHeight: 120,
    textAlignVertical: 'top',
    padding: 0,
    marginBottom: SPACING.lg,
  },
  mediaList: {
    paddingBottom: SPACING.md,
  },
  mediaPreviewContainer: {
    width: MEDIA_ITEM_WIDTH,
    height: 200,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginRight: SPACING.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.elevated}80`,
  },
  videoText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  removeMediaButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: `${COLORS.background}99`,
    borderRadius: RADIUS.full,
  },
  toolbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.xl,
    position: 'relative',
    paddingRight: SPACING.md,
  },
  toolbarButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    marginLeft: SPACING.xs,
  },
  toolbarButtonTextDisabled: {
    color: COLORS.subText,
  },
  mediaCountBadge: {
    position: 'absolute',
    top: -5,
    right: 0,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaCountText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.primary,
  },
  codeInputContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codeInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  codeInputTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  codeLanguageSelector: {
    flexDirection: 'row',
  },
  languageOption: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.elevated,
  },
  languageOptionSelected: {
    backgroundColor: COLORS.accent,
  },
  languageOptionText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
  },
  languageOptionTextSelected: {
    color: COLORS.primary,
  },
  codeTextInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontFamily: 'monospace',
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  codeActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
  },
  cancelCodeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  cancelCodeText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
  },
  addCodeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
  },
  addCodeText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
  },
  codeBlocksList: {
    marginBottom: SPACING.lg,
  },
  codeBlocksTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  codeBlockContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codeBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.elevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  codeBlockLanguage: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
  },
  removeCodeButton: {
    padding: SPACING.xs,
  },
  codeBlockContent: {
    maxHeight: 200,
    backgroundColor: '#282c34',
    padding: SPACING.sm,
  },
  codeText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
    color: '#e6e6e6',
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}20`,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.error,
  },
});

export default CreatePostScreen; 