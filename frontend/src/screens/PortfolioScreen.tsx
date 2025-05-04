// src/screens/PortfolioScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

interface Portfolio {
  id: number;
  title: string;
  description: string;
  link: string;
  image?: string;
}

const PortfolioScreen: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://10.0.2.2:8000/api/portfolios/portfolios/', {
          headers: { Authorization: `Token YOUR_TOKEN_HERE` },
        });
        setPortfolios(response.data);
        setError('');
      } catch (err) {
        setError('獲取作品集失敗');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortfolios();
  }, []);

  const handleAddPortfolio = async () => {
    if (!title.trim() || !description.trim() || !link.trim()) {
      setError('請填寫所有欄位');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('http://10.0.2.2:8000/api/portfolios/portfolios/', {
        title,
        description,
        link,
      }, {
        headers: { Authorization: `Token YOUR_TOKEN_HERE` },
      });
      setTitle('');
      setDescription('');
      setLink('');
      setError('');
      const response = await axios.get('http://10.0.2.2:8000/api/portfolios/portfolios/', {
        headers: { Authorization: `Token YOUR_TOKEN_HERE` },
      });
      setPortfolios(response.data);
    } catch (err) {
      setError('新增作品失敗');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!portfolios || portfolios.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>尚無作品，快去新增吧！</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={handleAddPortfolio}>
            <Text style={styles.addBtnText}>新增作品</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <FlatList
        data={portfolios}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card} accessibilityLabel="作品集卡片">
            <Image source={{ uri: item.image || 'https://placehold.co/120x120' }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <TouchableOpacity style={styles.linkBtn} activeOpacity={0.8} onPress={() => {}} accessibilityLabel="查看連結按鈕">
              <Text style={styles.linkBtnText}>查看連結</Text>
            </TouchableOpacity>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} accessibilityLabel="編輯作品按鈕">
                <Text style={styles.editBtnText}>編輯</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8} accessibilityLabel="刪除作品按鈕">
                <Text style={styles.deleteBtnText}>刪除</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={handleAddPortfolio}>
            <Text style={styles.addBtnText}>新增作品</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
};

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    margin: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: 18,
    padding: 16,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '48%',
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.md,
    marginBottom: 10,
    backgroundColor: COLORS.background,
  },
  title: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    marginBottom: 4,
    textAlign: 'center',
  },
  desc: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    marginBottom: 8,
    textAlign: 'center',
  },
  linkBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: 18,
    ...SHADOW,
  },
  linkBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginTop: 18,
    ...SHADOW,
  },
  addBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    letterSpacing: 1,
  },
  emptyText: {
    color: COLORS.subText,
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.md,
    marginBottom: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    width: '100%',
  },
  editBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: 18,
    ...SHADOW,
  },
  editBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    letterSpacing: 1,
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: 18,
    ...SHADOW,
  },
  deleteBtnText: {
    color: '#fff',
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    letterSpacing: 1,
  },
});

export default PortfolioScreen;