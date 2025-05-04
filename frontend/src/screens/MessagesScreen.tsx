// 訊息頁面檔案，處理用戶私訊與聊天室功能

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, Animated } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

// 定義訊息型別
interface Message {
  id: number;
  sender: { id: number; username: string };
  recipient: { id: number; username: string };
  content: string;
  created_at: string;
}

// 定義聊天室型別
interface Chat {
  id: number;
  user: { id: number; username: string };
  lastMessage: string;
  unread: boolean;
}

// Skeleton 元件，用於載入中狀態的佔位顯示
const SkeletonChat = () => (
  <View style={[styles.chatItem, { opacity: 0.5 }]}> 
    <View style={styles.avatar} />
    <View style={{ flex: 1 }}>
      <View style={{ width: 80, height: 12, backgroundColor: COLORS.border, marginBottom: 6, borderRadius: 6 }} />
      <View style={{ width: 40, height: 10, backgroundColor: COLORS.border, borderRadius: 5 }} />
    </View>
  </View>
);

// 訊息頁面組件
const MessagesScreen: React.FC = () => {
  const { token } = useAuth();  // 使用 useAuth hook 獲取 token
  const [chats, setChats] = useState<Chat[]>([]);  // 儲存聊天室列表
  const [messages, setMessages] = useState<Message[]>([]);  // 儲存訊息列表
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);  // 當前選中的聊天室
  const [content, setContent] = useState('');  // 新訊息內容
  const [recipient, setRecipient] = useState<number | null>(null);  // 當前聊天對象 ID
  const [error, setError] = useState('');  // 錯誤訊息
  const [loading, setLoading] = useState(false);  // 載入狀態
  const [sending, setSending] = useState(false);  // 發送中狀態
  const scrollY = useRef(new Animated.Value(0)).current;  // 用於動畫的滾動值

  // 頁面載入時獲取聊天室列表
  useEffect(() => {
    setLoading(true);
    fetchChats().finally(() => setLoading(false));
  }, [token]);

  // 根據選中的聊天室獲取訊息
  useEffect(() => {
    if (selectedChat) {
      setLoading(true);
      fetchMessages(selectedChat.user.id).finally(() => setLoading(false));
    }
  }, [selectedChat]);

  // 獲取聊天室列表
  const fetchChats = async () => {
    try {
      if (!token) return;
      const response = await axios.get('http://10.0.2.2:8000/api/messages/chats/', {
        headers: { Authorization: `Token ${token}` },
      });
      setChats(response.data.results || response.data);
    } catch (err) {
      setError('獲取聊天室失敗');
    }
  };

  // 獲取訊息列表
  const fetchMessages = async (userId: number) => {
    try {
      if (!token) return;
      const response = await axios.get(`http://10.0.2.2:8000/api/messages/messages/?user=${userId}`, {
        headers: { Authorization: `Token ${token}` },
      });
      setMessages(response.data.results || response.data);
      setRecipient(userId);
    } catch (err) {
      setError('獲取訊息失敗');
    }
  };

  // 發送訊息
  const handleSend = async () => {
    if (!content.trim() || !recipient) return;
    setSending(true);
    try {
      await axios.post('http://10.0.2.2:8000/api/messages/messages/', {
        recipient,
        content,
      }, {
        headers: { Authorization: `Token ${token}` },
      });
      setContent('');
      fetchMessages(recipient);
    } catch (err) {
      setError('發送訊息失敗');
    } finally {
      setSending(false);
    }
  };

  // 渲染聊天室項目
  const renderChat = ({ item }: { item: Chat }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => setSelectedChat(item)} activeOpacity={0.8} accessibilityLabel={`聊天室 ${item.user.username}`}> 
      <View style={styles.avatar} />
      <View style={styles.chatContent}>
        <Text style={styles.username}>{item.user.username}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      {item.unread && <Animated.View style={[styles.unreadDot, { opacity: scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0.5] }) }]} />} 
    </TouchableOpacity>
  );

  // 渲染訊息氣泡
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.sender.id === recipient ? styles.messageBubbleLeft : styles.messageBubbleRight]} accessibilityLabel={`訊息 ${item.content}`}> 
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.messageTime}>{item.created_at}</Text>
    </View>
  );

  // 載入中狀態顯示
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          {[1,2,3].map(i => <SkeletonChat key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  // 畫面渲染
  return (
    <SafeAreaView style={styles.safeArea}>
      {!selectedChat ? (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.inputRow}>
            <TextInput
              value={content}
              onChangeText={setContent}
              style={styles.input}
              placeholder="輸入訊息..."
              placeholderTextColor={COLORS.subText}
              accessibilityLabel="訊息輸入框"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending} activeOpacity={0.85} accessibilityLabel="發送訊息按鈕">
              {sending ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={styles.sendBtnText}>發送</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </SafeAreaView>
  );
};

// 定義樣式
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex1: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 18,
    marginBottom: 14,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
    backgroundColor: COLORS.border,
  },
  chatContent: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    fontFamily: FONTS.medium,
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: FONTS.size.md,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    marginLeft: 8,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  messageBubbleLeft: {
    backgroundColor: COLORS.card,
    alignSelf: 'flex-start',
  },
  messageBubbleRight: {
    backgroundColor: COLORS.accent,
    alignSelf: 'flex-end',
  },
  messageText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
  },
  messageTime: {
    color: COLORS.subText,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.xs,
    marginTop: 4,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
    paddingHorizontal: 18,
    ...SHADOW,
  },
  sendBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    letterSpacing: 1,
  },
  error: {
    color: COLORS.error,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default MessagesScreen;  // 導出訊息頁面組件 