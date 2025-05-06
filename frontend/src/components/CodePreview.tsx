// 程式碼預覽元件，用於顯示貼文中的程式碼區塊
// 功能：支援展開/收起、複製程式碼
// 資料來源：貼文中的程式碼區塊
// 資料流向：接收程式碼和語言，渲染程式碼

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';
import Clipboard from '@react-native-clipboard/clipboard';
import Ionicons from 'react-native-vector-icons/Ionicons';


interface CodePreviewProps {
  code: string;
  language: string;
  maxHeight?: number;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code, language, maxHeight = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 複製程式碼到剪貼簿
  const handleCopy = () => {
    Clipboard.setString(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.language}>{language}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
            <Ionicons 
              name={isCopied ? "checkmark" : "copy-outline"} 
              size={20} 
              color={COLORS.accent} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsExpanded(!isExpanded)} 
            style={styles.expandButton}
          >
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={COLORS.accent} 
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView 
        style={[
          styles.codeContainer,
          !isExpanded && { maxHeight }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.codeText}>{code}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  language: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    padding: 4,
    marginRight: 8,
  },
  expandButton: {
    padding: 4,
  },
  codeContainer: {
    backgroundColor: COLORS.background,
    padding: 12,
  },
  codeText: {
    fontFamily: 'monospace', // 使用標準的 monospace 字體
    fontSize: FONTS.size.sm,
    color: COLORS.text,
  },
});

export default CodePreview;
