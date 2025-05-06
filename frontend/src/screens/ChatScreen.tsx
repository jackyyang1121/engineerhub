// 私訊聊天頁面，處理單一對話的消息流與互動
// 設計理念: 簡約高級的聊天體驗，聚焦於使用者間的流暢溝通

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  StatusBar,
  Animated,
  ActivityIndicator,
  Pressable,
  Keyboard,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, isToday, isYesterday, formatDistance } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import axios from 'axios';
import * as ImagePicker from 'react-native-image-picker';
import { ImagePickerResponse } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, ANIMATION, LAYOUT } from '../theme';
import { getChatMessages, sendMessage, markMessageAsRead, uploadImageMessage } from '../api/messages';

const API_BASE_URL = 'http://10.0.2.2:8000/api/private_messages';

// 定義類型
interface Message {
  id: number;
  sender: {
    id: number;
    username: string;
    avatar?: string;
  };
  content: string;
  created_at: string;
  is_read: boolean;
  attachment?: {
    type: 'image' | 'video';
    url: string;
  };
}

type RootStackParamList = {
  MessagesScreen: undefined;
  ChatScreen: { chatId: number; otherUser: { id: number; username: string; avatar?: string } };
  Profile: { userId: number };
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

// 格式化時間的輔助函數
const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return `昨天 ${format(date, 'HH:mm')}`;
  } else {
    return format(date, 'MM/dd HH:mm');
  }
};

// 格式化日期分隔線的輔助函數
const formatDateSeparator = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return '今天';
  } else if (isYesterday(date)) {
    return '昨天';
  } else {
    return format(date, 'yyyy年MM月dd日');
  }
};

// 判斷是否需要顯示新的日期分隔線
const shouldShowDateSeparator = (current: Message, previous?: Message): boolean => {
  if (!previous) return true;
  
  const currentDate = new Date(current.created_at).setHours(0, 0, 0, 0);
  const previousDate = new Date(previous.created_at).setHours(0, 0, 0, 0);
  
  return currentDate !== previousDate;
};

// 聊天頁面組件
const ChatScreen: React.FC = () => {
  const { token, user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatScreenRouteProp>();
  const { chatId, otherUser } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  
  // 獲取訊息列表
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getChatMessages(token, chatId);
      setMessages(data); // 已經在 API 中反轉了順序
      setError(null);
      
      // 模擬將所有訊息標記為已讀
      // 實際應用應該調用後端 API 批量標記已讀
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.sender.id === otherUser.id && !msg.is_read 
              ? { ...msg, is_read: true } 
              : msg
          )
        );
      }, 2000);
    } catch (err) {
      console.error('獲取訊息失敗:', err);
      setError('無法載入訊息，請檢查網路連接並重試');
    } finally {
      setLoading(false);
    }
  }, [chatId, token, otherUser.id]);

  // 初始載入
  useEffect(() => {
    fetchMessages();
    
    // 設定導航標題
    navigation.setOptions({
      title: otherUser.username,
      headerTitleStyle: {
        fontFamily: FONTS.bold,
        fontSize: FONTS.size.lg,
        color: COLORS.text,
      },
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('Profile', { userId: otherUser.id })}
        >
          <Ionicons name="information-circle-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      ),
    });
    
    // 模擬接收新消息 (真實環境應使用WebSocket)
    const intervalId = setInterval(() => {
      if (Math.random() > 0.8) {
        const randomMessages = [
          '這是一個範例訊息',
          '我看過你的作品，很不錯！',
          '希望能有機會合作',
          '你熟悉React Native嗎？',
          '想跟你討論一個專案',
        ];
        
        const newMessage: Message = {
          id: Date.now(),
          sender: {
            id: otherUser.id,
            username: otherUser.username,
            avatar: otherUser.avatar,
          },
          content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          created_at: new Date().toISOString(),
          is_read: false,
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // 隨機模擬對方輸入中狀態
        if (Math.random() > 0.7) {
          setTyping(true);
          setTimeout(() => setTyping(false), 2000 + Math.random() * 3000);
        }
      }
    }, 15000); // 每15秒有可能收到新消息
    
    return () => clearInterval(intervalId);
  }, [chatId, fetchMessages, navigation, otherUser]);
  
  // 當消息列表更新時，自動滾動到底部
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, loading]);
  
  // 發送訊息
  const handleSend = async () => {
    if (!content.trim() || !user) return;
    
    const tempId = Date.now(); // 臨時 ID 用於追蹤本地消息
    
    // 先在介面顯示待發送的消息
    const newMessage: Message = {
      id: tempId,
      sender: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
      content: content.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
    };
    
    setSending(true);
    setMessages(prev => [...prev, newMessage]);
    setContent('');
    
    try {
      // 使用 API 服務發送消息
      const sentMessage = await sendMessage(token, chatId, content.trim());
      
      // 更新消息列表，用服務器返回的消息替換臨時消息
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? sentMessage : msg
        )
      );
      
    } catch (err) {
      console.error('發送訊息失敗:', err);
      Alert.alert('發送失敗', '請檢查網路連接後重試');
      
      // 移除剛剛"假"添加的消息
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setSending(false);
    }
  };
  
  // 選擇照片
  const handlePickImage = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1280,
      maxHeight: 1280,
    }, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      } else if (response.errorCode) {
        Alert.alert('錯誤', '選擇照片時發生錯誤');
        return;
      }
      
      if (response.assets && response.assets[0] && response.assets[0].uri) {
        const selectedImage = response.assets[0].uri;
        
        // 先顯示本地照片預覽
        const tempId = Date.now();
        const previewMessage: Message = {
          id: tempId,
          sender: {
            id: user?.id || 0,
            username: user?.username || '',
            avatar: user?.avatar,
          },
          content: '',
          created_at: new Date().toISOString(),
          is_read: false,
          attachment: {
            type: 'image',
            url: selectedImage,
          },
        };
        
        setMessages(prev => [...prev, previewMessage]);
        
        try {
          // 在實際環境中，應調用 API 上傳圖片
          // const uploadedMessage = await uploadImageMessage(token, chatId, selectedImage);
          // setMessages(prev => prev.map(msg => msg.id === tempId ? uploadedMessage : msg));
          
          // 目前只顯示模擬成功上傳的信息
          Alert.alert('功能開發中', '照片預覽功能已展示，完整發送功能將在後續版本推出');
        } catch (error) {
          console.error('上傳照片失敗:', error);
          Alert.alert('上傳失敗', '請檢查網路連接後重試');
          
          // 移除預覽消息
          setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
      }
    });
  };
  
  // 渲染消息項目
  const renderMessageItem = ({ item, index }: { item: Message, index: number }) => {
    const isCurrentUser = item.sender.id === user?.id;
    const previousMessage = index > 0 ? messages[index - 1] : undefined;
    const showDateSeparator = shouldShowDateSeparator(item, previousMessage);
    
    return (
      <>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {formatDateSeparator(item.created_at)}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isCurrentUser ? styles.messageContainerRight : styles.messageContainerLeft
        ]}>
          {!isCurrentUser && (
            <TouchableOpacity 
              style={styles.messageAvatar}
              onPress={() => navigation.navigate('Profile', { userId: item.sender.id })}
            >
              <Image
                source={
                  item.sender.avatar
                    ? { uri: item.sender.avatar }
                    : { uri: `https://ui-avatars.com/api/?name=${item.sender.username}&background=random&color=fff&size=100` }
                }
                style={styles.avatarImage}
              />
            </TouchableOpacity>
          )}
          
          <View style={[
            styles.messageBubble,
            isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft
          ]}>
            {item.attachment && (
              <Pressable
                onPress={() => {
                  setSelectedImage(item.attachment?.url || null);
                  setImageModalVisible(true);
                }}
              >
                <Image
                  source={{ uri: item.attachment.url }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              </Pressable>
            )}
            
            {item.content.trim() && (
              <Text style={[
                styles.messageText,
                isCurrentUser ? styles.messageTextRight : styles.messageTextLeft
              ]}>
                {item.content}
              </Text>
            )}
            
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>
                {formatMessageTime(item.created_at)}
              </Text>
              
              {isCurrentUser && (
                <View style={styles.messageStatus}>
                  <Ionicons
                    name={item.is_read ? "checkmark-done" : "checkmark"}
                    size={14}
                    color={item.is_read ? COLORS.accent : COLORS.subText}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </>
    );
  };
  
  // 渲染輸入工具欄
  const renderInputToolbar = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handlePickImage}
        >
          <Ionicons name="image-outline" size={24} color={COLORS.accent} />
        </TouchableOpacity>
        
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="輸入訊息..."
          placeholderTextColor={COLORS.placeholder}
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            !content.trim() && styles.sendButtonDisabled
          ]}
          disabled={!content.trim() || sending}
          onPress={handleSend}
        >
          {sending ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons 
              name="send" 
              size={20} 
              color={content.trim() ? COLORS.primary : COLORS.background} 
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
  
  // 顯示"對方正在輸入"狀態
  const renderTypingIndicator = () => (
    typing ? (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>{otherUser.username} 正在輸入</Text>
          <View style={styles.typingDots}>
            <Animated.View style={styles.typingDot} />
            <Animated.View style={[styles.typingDot, { marginLeft: 4 }]} />
            <Animated.View style={[styles.typingDot, { marginLeft: 4 }]} />
          </View>
        </View>
      </View>
    ) : null
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* 消息列表 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>載入訊息中...</Text>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={48} color={COLORS.subText} />
                <Text style={styles.emptyText}>沒有訊息</Text>
                <Text style={styles.emptySubtext}>跟 {otherUser.username} 說聲嗨吧！</Text>
              </View>
            }
          />
          
          {renderTypingIndicator()}
          {renderInputToolbar()}
        </>
      )}
      
      {/* 圖片預覽模態框 */}
      <Modal
        visible={imageModalVisible}
        transparent
        onRequestClose={() => setImageModalVisible(false)}
      >
        <Pressable 
          style={styles.imageModalContainer}
          onPress={() => setImageModalVisible(false)}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close-circle" size={36} color={COLORS.text} />
          </TouchableOpacity>
        </Pressable>
      </Modal>
      
      {/* 錯誤提示 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchMessages}
          >
            <Text style={styles.retryButtonText}>重試</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// 樣式定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    marginTop: SPACING.md,
  },
  messagesContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    marginTop: SPACING.xs,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dateSeparatorText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.subText,
    backgroundColor: `${COLORS.accent}20`,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    maxWidth: '80%',
  },
  messageContainerLeft: {
    alignSelf: 'flex-start',
  },
  messageContainerRight: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    marginRight: SPACING.xs,
    alignSelf: 'flex-end',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
  },
  messageBubble: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    maxWidth: '100%',
  },
  messageBubbleLeft: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: RADIUS.xs,
  },
  messageBubbleRight: {
    backgroundColor: COLORS.accent,
    borderBottomRightRadius: RADIUS.xs,
  },
  messageText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    marginBottom: 4,
  },
  messageTextLeft: {
    color: COLORS.text,
  },
  messageTextRight: {
    color: COLORS.primary,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xxs,
    color: COLORS.subText,
    marginRight: 4,
  },
  messageStatus: {
    width: 16,
    alignItems: 'center',
  },
  typingContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    maxWidth: '70%',
  },
  typingText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xs,
    color: COLORS.subText,
    marginRight: SPACING.xs,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.background,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.inactive,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: `${COLORS.primary}E6`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '70%',
    borderRadius: RADIUS.md,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}80`,
  },
  errorContainer: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: `${COLORS.error}22`,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOW.md,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.error,
    flex: 1,
  },
  retryButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  retryButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.xs,
    color: COLORS.background,
  },
});

export default ChatScreen; 