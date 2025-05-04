import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import axios from 'axios';  // 用於發送 HTTP 請求
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';
import { StyleSheet } from 'react-native';

interface Message {
  id: number;
  sender: { username: string };
  recipient: { username: string };
  content: string;
}

// Skeleton 元件
const SkeletonBubble = () => (
  <View style={{ alignSelf: 'flex-start', backgroundColor: COLORS.border, borderRadius: 18, marginVertical: 6, padding: 12, width: 120, height: 24, opacity: 0.5 }} />
);

const MessagesScreen: React.FC = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);  // 儲存私訊列表
  const [content, setContent] = useState('');  // 儲存發送訊息內容
  const [recipient, setRecipient] = useState('');  // 儲存接收者用戶名
  const [error, setError] = useState('');  // 儲存錯誤訊息
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [bubbleLoading, setBubbleLoading] = useState(false);

  const chatList = [
    { id: '1', name: '小明', avatar: 'https://placehold.co/48x48', lastMsg: '哈囉！', time: '2分鐘前', unread: 2 },
    { id: '2', name: '小美', avatar: 'https://placehold.co/48x48', lastMsg: '明天見', time: '1小時前', unread: 0 },
  ];

  useEffect(() => {
    setLoading(true);
    // 頁面載入時獲取私訊列表
    const fetchMessages = async () => {
      try {
        // 修正 API 路徑，假設後端支援 private_messages/messages/
        const response = await axios.get('http://10.0.2.2:8000/api/private_messages/messages/', {
          headers: { Authorization: `Token ${token}` },
        });
        setMessages(response.data.results || response.data);
      } catch (err) {
        setError('獲取私訊失敗');
      }
    };
    if (token) fetchMessages().finally(() => setLoading(false));
  }, [token]);  // token 變動時重新獲取

  const handleSend = async () => {
    // 處理發送私訊邏輯
    try {
      await axios.post('http://10.0.2.2:8000/api/private_messages/messages/', {
        recipient,  // 傳送接收者用戶名
        content,  // 傳送訊息內容
      }, {
        headers: { Authorization: `Token ${token}` },
      });
      setContent('');  // 清空輸入框
      setRecipient('');  // 清空接收者輸入
      // 重新獲取私訊列表
      const response = await axios.get('http://10.0.2.2:8000/api/private_messages/messages/', {
        headers: { Authorization: `Token ${token}` },
      });
      setMessages(response.data.results || response.data);
    } catch (err) {
      setError('發送私訊失敗');
    }
  };

  // 聊天室未讀動畫
  const UnreadDot = ({ count }: { count: number }) => {
    const scale = new Animated.Value(1);
    React.useEffect(() => {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();
    }, [count]);
    return (
      <Animated.View style={[styles.unreadDot, { transform: [{ scale }] }]}> 
        <Text style={styles.unreadText}>{count}</Text>
      </Animated.View>
    );
  };

  if (view === 'list') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.header}>訊息</Text>
          {chatList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>尚無對話，快去和朋友聊天吧！</Text>
            </View>
          ) : (
            <FlatList
              data={chatList}
              keyExtractor={item => item.id}
              contentContainerStyle={[styles.listContent, { paddingTop: 16 }]}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.chatItem} onPress={() => { setSelectedChat(item.id); setView('chat'); }} activeOpacity={0.8} accessibilityLabel={`聊天室 ${item.name}`}>
                  <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
                  <View style={styles.chatInfo}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <Text style={styles.chatLastMsg}>{item.lastMsg}</Text>
                  </View>
                  <View style={styles.chatMeta}>
                    <Text style={styles.chatTime}>{item.time}</Text>
                    {item.unread > 0 && <UnreadDot count={item.unread} />}
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              accessibilityLabel="聊天室列表"
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setView('list')} style={styles.backBtn} activeOpacity={0.7} accessibilityLabel="返回聊天室列表">
            <Text style={styles.backBtnText}>{'<'} 返回</Text>
          </TouchableOpacity>
          <Image source={{ uri: 'https://placehold.co/48x48' }} style={styles.chatAvatar} />
          <Text style={styles.chatName}>小明</Text>
        </View>
        <FlatList
          data={bubbleLoading ? [1,2,3] : messages as any[]}
          keyExtractor={item => (typeof item === 'object' && item.id) ? item.id.toString() : item.toString()}
          contentContainerStyle={[styles.chatContent, { paddingTop: 16 }]}
          renderItem={({ item }) => (
            bubbleLoading && typeof item === 'number'
              ? <SkeletonBubble />
              : (typeof item === 'object' && item.sender)
                ? <View style={item.sender.username === '我' ? styles.bubbleRight : styles.bubbleLeft} accessibilityLabel={item.sender.username === '我' ? '我的訊息' : '對方訊息'}>
                    <Text style={styles.bubbleText}>{item.content}</Text>
                  </View>
                : null
          )}
          inverted
          showsVerticalScrollIndicator={false}
          accessibilityLabel="訊息氣泡列表"
        />
        <View style={styles.inputBar}>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="輸入訊息..."
            style={styles.input}
            placeholderTextColor={COLORS.subText}
            accessibilityLabel="訊息輸入框"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.85} accessibilityLabel="發送訊息按鈕">
            <Text style={styles.sendBtnText}>發送</Text>
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
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 80,
  },
  chatInfo: {
    flex: 1,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  sendBar: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
    margin: 18,
    marginBottom: 0,
    padding: 18,
  },
  header: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    marginBottom: 10,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOW,
  },
  buttonText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    letterSpacing: 1,
  },
  error: {
    color: COLORS.error,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    marginTop: 4,
    textAlign: 'center',
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginVertical: 6,
    padding: 12,
    maxWidth: '80%',
    ...SHADOW,
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    marginVertical: 6,
    padding: 12,
    maxWidth: '80%',
    ...SHADOW,
  },
  bubbleText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backBtn: {
    padding: 5,
  },
  backBtnText: {
    color: COLORS.accent,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  chatName: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  sendBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    padding: 12,
    marginLeft: 10,
  },
  sendBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  chatLastMsg: {
    color: COLORS.subText,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
  },
  chatTime: {
    color: COLORS.subText,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
  },
  unreadDot: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  unreadText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
  },
  emptyText: {
    color: COLORS.subText,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
  },
});

export default MessagesScreen;  // 導出私訊頁面組件 