import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Skill {
  id: number;
  name: string;
  category?: string;
  icon?: string;
}

interface EnhancedSkillTagsProps {
  skills: Skill[];
  editable?: boolean;
  onEdit?: () => void;
  themeColor?: string;
  containerStyle?: object;
}

/**
 * 增強版技能標籤組件 - 支持水平滾動和更現代的視覺效果
 * @param skills 技能對象陣列
 * @param editable 是否可編輯
 * @param onEdit 編輯回調函數
 * @param themeColor 主題顏色 (從用戶主題獲取)
 * @param containerStyle 容器樣式
 */
const EnhancedSkillTags: React.FC<EnhancedSkillTagsProps> = ({
  skills = [],
  editable = false,
  onEdit,
  themeColor = COLORS.accent,
  containerStyle,
}) => {
  // 確保 skills 是陣列且有內容
  const validSkills = Array.isArray(skills) ? skills.filter(skill => skill && typeof skill.name === 'string') : [];
  
  if (validSkills.length === 0 && !editable) return null;

  // 根據用戶主題設定標籤樣式
  const getTagStyle = (index: number) => {
    // 創建交替的標籤顏色陰影
    const opacity = 0.9 - (index % 3) * 0.2;
    return {
      backgroundColor: `${themeColor}${Math.floor(opacity * 100)}`,
    };
  };

  // 獲取標籤圖標
  const getSkillIcon = (skill: Skill) => {
    if (skill.icon) return skill.icon;
    
    // 根據類別選擇默認圖標
    switch (skill.category?.toLowerCase()) {
      case 'programming':
      case 'development':
        return 'code-slash-outline';
      case 'design':
        return 'color-palette-outline';
      case 'business':
        return 'briefcase-outline';
      case 'marketing':
        return 'megaphone-outline';
      default:
        return 'star-outline';
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>專業技能</Text>
        {editable && (
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={onEdit}
          >
            <Ionicons name="create-outline" size={16} color={COLORS.accent} />
            <Text style={styles.editText}>編輯</Text>
          </TouchableOpacity>
        )}
      </View>

      {validSkills.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {validSkills.map((skill, idx) => (
            <View 
              key={`skill-${skill.id || idx}`} 
              style={[styles.tag, getTagStyle(idx)]}
            >
              <Ionicons 
                name={getSkillIcon(skill)} 
                size={14} 
                color={COLORS.primary} 
                style={styles.tagIcon}
              />
              <Text style={styles.tagText}>{skill.name}</Text>
            </View>
          ))}
          
          {editable && (
            <TouchableOpacity 
              style={styles.addTag} 
              onPress={onEdit}
            >
              <Ionicons name="add-outline" size={16} color={themeColor} />
              <Text style={[styles.addText, { color: themeColor }]}>添加技能</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : editable ? (
        <TouchableOpacity style={styles.addFirstContainer} onPress={onEdit}>
          <View style={[styles.plusIcon, { backgroundColor: themeColor }]}>
            <Ionicons name="add" size={24} color={COLORS.background} />
          </View>
          <Text style={styles.addFirstText}>添加你的專業技能，讓大家更了解你</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    paddingVertical: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    marginRight: SPACING.sm,
    ...SHADOW.sm,
  },
  tagIcon: {
    marginRight: 6,
  },
  tagText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
  },
  addTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
  },
  addText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    marginLeft: 4,
  },
  addFirstContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.card}77`,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  plusIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  addFirstText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    flex: 1,
  },
});

export default EnhancedSkillTags; 