import React, { useState } from 'react';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

// 發佈貼文頁面檔案，處理用戶發文、內容輸入、媒體上傳等功能

const CreatePostScreen = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handlePost = () => {
    // Implement the logic to handle posting the content
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.header}>發佈新貼文</Text>
            <View style={styles.mediaRow}>
              <TouchableOpacity style={styles.mediaBtn} activeOpacity={0.8} accessibilityLabel="上傳圖片按鈕">
                <Text style={styles.mediaBtnText}>圖片</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaBtn} activeOpacity={0.8} accessibilityLabel="上傳影片按鈕">
                <Text style={styles.mediaBtnText}>影片</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="分享你的想法..."
              style={styles.input}
              placeholderTextColor={COLORS.subText}
              multiline
              accessibilityLabel="貼文內容輸入框"
            />
            <TouchableOpacity style={styles.button} onPress={handlePost} activeOpacity={0.85} accessibilityLabel="發佈貼文按鈕">
              <Text style={styles.buttonText}>發佈</Text>
            </TouchableOpacity>
            {error && <Text style={styles.error}>{error}</Text>}
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 22,
    ...SHADOW,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  header: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.lg,
    marginBottom: 12,
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
    paddingVertical: 14,
    marginBottom: 12,
    minHeight: 80,
    maxHeight: 180,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOW,
  },
  buttonText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
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
  mediaRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  mediaBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 8,
    ...SHADOW,
  },
  mediaBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    letterSpacing: 1,
  },
});

export default CreatePostScreen; 