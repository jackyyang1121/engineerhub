// 個人檔案頁面檔案，處理檔案讀取與更新功能

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator, FlatList, Linking, Image, Modal, TextInput, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';
import SkillTags from '../components/SkillTags';
import AvatarUploader from '../components/AvatarUploader';
import FollowButton from '../components/FollowButton';
import MessageButton from '../components/MessageButton';
import PostItem from '../components/PostItem';

// ProfileScreen 組件，負責個人檔案頁面邏輯與畫面
const ProfileScreen: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMe, setIsMe] = useState(true); // 假設目前只看自己
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      // TODO: 換成你的 API 路徑
      const res = await fetch('http://10.0.2.2:8000/api/users/profile/', {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setProfile(data);
      setIsLoading(false);
    };
    const fetchPosts = async () => {
      const res = await fetch('http://10.0.2.2:8000/api/posts/posts/?user=current', {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setPosts(data.results || data);
    };
    const fetchPortfolios = async () => {
      const res = await fetch('http://10.0.2.2:8000/api/portfolios/', {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setPortfolios(data.results || data);
    };
    if (token) {
      fetchProfile();
      fetchPosts();
      fetchPortfolios();
    }
  }, [token]);

  useEffect(() => {
    if (profile) {
      setEditBio(profile.bio || '');
      setEditSkills((profile.skills || []).join(', '));
      setEditAvatar(profile.avatar || '');
    }
  }, [profile]);

  // 刪除貼文功能
  const handleDeletePost = async (postId: number) => {
    Alert.alert('確定要刪除這則貼文嗎？', '', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: async () => {
        try {
          await fetch(`http://10.0.2.2:8000/api/posts/posts/${postId}/`, {
            method: 'DELETE',
            headers: { Authorization: `Token ${token}` },
          });
          setPosts(posts.filter(p => p.id !== postId));
        } catch (err) {
          Alert.alert('刪除失敗');
        }
      }}
    ]);
  };

  // 編輯個人檔案功能
  const handleEditProfile = async () => {
    setEditLoading(true);
    try {
      const res = await fetch('http://10.0.2.2:8000/api/users/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          username: profile.username,
          email: profile.email,
          phone_number: profile.phone_number,
          bio: editBio,
          skills: editSkills.split(',').map(s => s.trim()).filter(Boolean),
          avatar: editAvatar,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditModalVisible(false);
      } else {
        Alert.alert('更新失敗');
      }
    } catch (err) {
      Alert.alert('更新失敗');
    } finally {
      setEditLoading(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <AvatarUploader avatarUrl={profile.avatar} onPick={() => setEditModalVisible(true)} />
          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio || '這裡是自我介紹...'}</Text>
          <SkillTags skills={profile.skills || []} />
          <View style={styles.statsRow}>
            <View style={styles.statBox}><Text style={styles.statNum}>{posts.length}</Text><Text style={styles.statLabel}>貼文</Text></View>
            <View style={styles.statBox}><Text style={styles.statNum}>{profile.following_count}</Text><Text style={styles.statLabel}>追蹤</Text></View>
            <View style={styles.statBox}><Text style={styles.statNum}>{profile.followers_count}</Text><Text style={styles.statLabel}>粉絲</Text></View>
          </View>
          <View style={styles.actionRow}>
            {isMe ? (
              <TouchableOpacity style={styles.editBtn} activeOpacity={0.85} onPress={() => setEditModalVisible(true)}>
                <Text style={styles.editBtnText}>編輯個人檔案</Text>
              </TouchableOpacity>
            ) : (
              <>
                <FollowButton isFollowing={false} onPress={() => {}} />
                <MessageButton onPress={() => {}} />
              </>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>作品集</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioRow}>
          {portfolios.length === 0 ? (
            <Text style={styles.emptyText}>尚無作品</Text>
          ) : portfolios.map((item, idx) => (
            <View key={idx} style={styles.portfolioCard}>
              {item.image && <Image source={{ uri: item.image }} style={styles.portfolioImage} />}
              <Text style={styles.portfolioTitle}>{item.title}</Text>
              <Text style={styles.portfolioDesc}>{item.description}</Text>
              <View style={styles.linkRow}>
                {item.github_url ? <TouchableOpacity onPress={() => Linking.openURL(item.github_url)}><Text style={styles.link}>GitHub</Text></TouchableOpacity> : null}
                {item.demo_url ? <TouchableOpacity onPress={() => Linking.openURL(item.demo_url)}><Text style={styles.link}>Demo</Text></TouchableOpacity> : null}
                {item.youtube_url ? <TouchableOpacity onPress={() => Linking.openURL(item.youtube_url)}><Text style={styles.link}>YouTube</Text></TouchableOpacity> : null}
              </View>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>歷史貼文</Text>
        {posts.length === 0 ? (
          <Text style={styles.emptyText}>尚無貼文</Text>
        ) : posts.map(post => (
          <View key={post.id} style={{ position: 'relative' }}>
            <PostItem post={post} onLike={() => {}} onComment={() => {}} onRepost={() => {}} onSave={() => {}} />
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeletePost(post.id)}>
              <Text style={styles.deleteBtnText}>刪除</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>編輯個人檔案</Text>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <AvatarUploader avatarUrl={editAvatar} onPick={() => {}} />
              <TouchableOpacity style={styles.editBtn} onPress={() => {}}>
                <Text style={styles.editBtnText}>選擇新頭像（暫不支援）</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>自介</Text>
            <TextInput
              value={editBio}
              onChangeText={setEditBio}
              style={styles.input}
              placeholder="自我介紹..."
              multiline
            />
            <Text style={styles.label}>技能標籤（以逗號分隔）</Text>
            <TextInput
              value={editSkills}
              onChangeText={setEditSkills}
              style={styles.input}
              placeholder="如：Python, React, AI"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity style={[styles.editBtn, { marginRight: 8 }]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.editBtnText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile} disabled={editLoading}>
                <Text style={styles.editBtnText}>{editLoading ? '儲存中...' : '儲存'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  username: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 2,
  },
  bio: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    color: COLORS.subText,
    marginBottom: 8,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  statBox: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  statNum: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.accent,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  editBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: 32,
    ...SHADOW,
  },
  editBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  portfolioRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  portfolioCard: {
    width: 220,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginRight: 16,
    padding: 14,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  portfolioImage: {
    width: '100%',
    height: 120,
    borderRadius: RADIUS.sm,
    marginBottom: 8,
  },
  portfolioTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.accent,
    marginBottom: 2,
  },
  portfolioDesc: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.text,
    marginBottom: 6,
  },
  linkRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  link: {
    color: COLORS.accent,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    marginRight: 12,
    textDecorationLine: 'underline',
  },
  emptyText: {
    color: COLORS.subText,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    textAlign: 'center',
    marginVertical: 16,
  },
  deleteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  deleteBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 24,
    ...SHADOW,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    marginTop: 12,
    marginBottom: 4,
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
    marginBottom: 8,
  },
});

export default ProfileScreen;  // 導出個人檔案頁面組件