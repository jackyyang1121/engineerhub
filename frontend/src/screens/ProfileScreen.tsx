// 個人檔案頁面檔案，處理檔案讀取與更新功能

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, Image, SafeAreaView, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import axios from 'axios';  // 用於發送 HTTP 請求
import { useAuth } from '../context/AuthContext';  // 導入 useAuth hook
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

// ProfileScreen 組件，負責個人檔案頁面邏輯與畫面
const ProfileScreen: React.FC = () => {
  const { token } = useAuth();  // 使用 useAuth hook 獲取 token
  // 狀態：用戶名、電子信箱、手機號碼、技能、自介、錯誤訊息、載入狀態、更新狀態
  const [username, setUsername] = useState('');  // 儲存用戶名
  const [email, setEmail] = useState('');        // 儲存電子信箱
  const [phoneNumber, setPhoneNumber] = useState(''); // 儲存手機號碼
  const [skills, setSkills] = useState('');      // 儲存技能標籤
  const [bio, setBio] = useState('');            // 儲存自介
  const [error, setError] = useState('');        // 儲存錯誤訊息
  const [isLoading, setIsLoading] = useState(true);  // 控制載入中狀態
  const [isUpdating, setIsUpdating] = useState(false);  // 控制更新中狀態
  const [posts, setPosts] = useState<any[]>([]);  // 儲存用戶貼文列表

  // 頁面載入時獲取個人檔案資料
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        if (!token) return;
        const response = await axios.get('http://10.0.2.2:8000/api/users/profile/', {
          headers: { Authorization: `Token ${token}` },
        });
        const user = response.data;
        setUsername(user.username);
        setEmail(user.email);
        setPhoneNumber(user.phone_number);
        setSkills(user.skills.join(', '));
        setBio(user.bio);
        setError('');
      } catch (err) {
        setError('獲取個人檔案失敗');
      } finally {
        setIsLoading(false);
      }
    };
    const fetchUserPosts = async () => {
      try {
        if (!token) return;
        // 根據 apps/posts/posts/ 設定 API 路徑
        const response = await axios.get('http://10.0.2.2:8000/api/posts/posts/?user=current', {
          headers: { Authorization: `Token ${token}` },
        });
        setPosts(response.data.results || response.data);
      } catch (err) {
        // 可選：setError('獲取用戶貼文失敗');
      }
    };
    if (token) {  // 只有在有 token 時才執行
      fetchProfile();
      fetchUserPosts();
    }
  }, [token]);  // 依賴 token，當 token 改變時重新獲取資料

  // 處理個人檔案更新邏輯
  const handleUpdate = async () => {
    if (!username.trim() || !email.trim()) {
      setError('用戶名和電子信箱為必填欄位');
      return;
    }

    try {
      setIsUpdating(true);
      await axios.put('http://10.0.2.2:8000/api/users/profile/', {
        username,          // 傳送用戶名
        email,             // 傳送電子信箱
        phone_number: phoneNumber,  // 傳送手機號碼
        skills: skills.split(',').map(s => s.trim()),  // 將技能標籤轉為陣列並去除空格
        bio,               // 傳送自介
      }, {
        headers: { Authorization: `Token ${token}` },  // 使用 context 中的 token
      });
      console.log('更新成功');  // 輸出更新成功訊息
      setError('');  // 清空錯誤訊息
    } catch (err) {
      setError('更新失敗');  // 設定錯誤訊息
    } finally {
      setIsUpdating(false);
    }
  };

  // Skeleton 元件，用於載入中狀態的佔位顯示
  const SkeletonCard = () => (
    <View style={[styles.card, { opacity: 0.5 }]}> 
      <View style={{ width: '100%', height: 18, backgroundColor: COLORS.border, marginBottom: 10, borderRadius: 6 }} />
      <View style={{ width: '80%', height: 18, backgroundColor: COLORS.border, marginBottom: 10, borderRadius: 6 }} />
    </View>
  );

  // 載入中狀態顯示
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  // 畫面渲染
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={
          <>
            <View style={styles.headerSection}>
              <View style={styles.avatarRow}>
                <Image source={{ uri: 'https://placehold.co/100x100' }} style={styles.avatar} />
                <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={() => {/* TODO: 彈窗或跳轉編輯 */}} accessibilityLabel="編輯個人資料">
                  <Text style={styles.editBtnText}>編輯</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.bio}>{bio || '這裡是自我介紹...'}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}><Text style={styles.statNum}>123</Text><Text style={styles.statLabel}>貼文</Text></View>
                <View style={styles.statBox}><Text style={styles.statNum}>456</Text><Text style={styles.statLabel}>追蹤</Text></View>
                <View style={styles.statBox}><Text style={styles.statNum}>789</Text><Text style={styles.statLabel}>粉絲</Text></View>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>技能標籤（以逗號分隔）</Text>
              <TextInput 
                value={skills} 
                onChangeText={setSkills} 
                style={styles.input} 
                placeholderTextColor={COLORS.subText}
                placeholder="例如：React Native, TypeScript, UI/UX"
              />
              <Text style={styles.label}>自介</Text>
              <TextInput 
                value={bio} 
                onChangeText={setBio} 
                style={[styles.input, { height: 80 }]} 
                placeholderTextColor={COLORS.subText} 
                multiline
                placeholder="寫下你的自我介紹..."
              />
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              <TouchableOpacity 
                style={[styles.button, isUpdating && styles.buttonDisabled]} 
                onPress={handleUpdate} 
                activeOpacity={0.85}
                disabled={isUpdating}
                accessibilityLabel="更新個人資料"
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.buttonText}>更新</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={[styles.label, { marginTop: 24 }]}>我的貼文</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.card} accessibilityLabel="個人貼文卡片">
            <Text style={styles.content}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>尚無貼文</Text>}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="個人貼文列表"
      />
    </SafeAreaView>
  );
};

// 定義樣式
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerSection: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 20,
    marginBottom: 16,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
    ...SHADOW,
  },
  editBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    letterSpacing: 1,
  },
  username: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    marginBottom: 8,
  },
  bio: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    marginBottom: 16,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statNum: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.subText,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 20,
    marginBottom: 16,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    color: COLORS.subText,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    marginBottom: 8,
    letterSpacing: 0.5,
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
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOW,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    letterSpacing: 1,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: RADIUS.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    textAlign: 'center',
  },
  content: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    lineHeight: 22,
  },
  emptyText: {
    color: COLORS.subText,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    textAlign: 'center',
    marginTop: 24,
  },
});

export default ProfileScreen;  // 導出個人檔案頁面組件