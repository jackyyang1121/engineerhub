import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface SkillTagsProps {
  skills: string[];
  editable?: boolean;
  onEdit?: () => void;
  containerStyle?: object;
  tagStyle?: object;
  textStyle?: object;
}

/**
 * 技能標籤組件 - 展示用戶的技能列表
 * @param skills 技能名稱陣列
 * @param editable 是否可編輯
 * @param onEdit 編輯回調函數
 * @param containerStyle 容器樣式
 * @param tagStyle 標籤樣式
 * @param textStyle 文字樣式
 */
const SkillTags: React.FC<SkillTagsProps> = ({ 
  skills = [], 
  editable = false,
  onEdit,
  containerStyle,
  tagStyle,
  textStyle
}) => {
  // 確保 skills 是陣列且有內容
  const validSkills = Array.isArray(skills) ? skills.filter(skill => skill && typeof skill === 'string') : [];
  
  if (validSkills.length === 0 && !editable) return null;
  
  return (
    <View style={[styles.container, containerStyle]}>
      {validSkills.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>技能</Text>
          <View style={styles.tagsContainer}>
            {validSkills.map((skill, idx) => (
              <View key={idx} style={[styles.tag, tagStyle]}>
                <Text style={[styles.text, textStyle]}>{skill}</Text>
              </View>
            ))}
            
            {editable && (
              <TouchableOpacity 
                style={[styles.tag, styles.editTag]} 
                onPress={onEdit}
              >
                <Ionicons name="add-outline" size={14} color={COLORS.accent} />
                <Text style={[styles.text, styles.editText]}>添加</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : editable ? (
        <TouchableOpacity style={styles.addFirstSkill} onPress={onEdit}>
          <Ionicons name="add-circle-outline" size={20} color={COLORS.accent} />
          <Text style={styles.addFirstSkillText}>添加你的專業技能</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    ...SHADOW.sm,
  },
  text: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
  },
  editTag: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    color: COLORS.accent,
    marginLeft: 2,
  },
  addFirstSkill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addFirstSkillText: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.accent,
    marginLeft: SPACING.xs,
  },
});

export default SkillTags; 