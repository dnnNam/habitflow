// src/screens/main/createHabit/NameCategoryScreen.tsx
//
// Flow mới:
// - Không gọi API fetch categories nữa
// - Hiển thị danh sách default categories local (icon, name, color định sẵn)
// - Nếu chọn "Custom" → sang CustomCategoryScreen để tạo category mới
// - Sau khi chọn xong → lưu selectedCategory vào draft (dạng object local, chưa có id thật)
// - Continue → sang ScheduleScreen

import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import GlassCard from '../../../components/GlassCard';
import GradientButton from '../../../components/GradientButton';
import Screen from '../../../components/Screen';
import AppTextField from '../../../components/AppTextField';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  setStep,
  updateDraft,
} from '../../../features/createHabit/createHabitSlice';
import {
  selectHabitDraft,
} from '../../../features/createHabit/createHabitSelectors';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../../theme';

// ── Default categories (local, không cần API) ─────────────────────────────────

export interface LocalCategory {
  key: string;         // unique key để identify (dùng làm categoryId tạm nếu không custom)
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  apiIcon: string;     // icon string gửi lên API nếu cần
}

export const DEFAULT_CATEGORIES: LocalCategory[] = [
  { key: 'health',   name: 'Health',   icon: 'favorite',           color: '#f06292', apiIcon: 'heart'    },
  { key: 'fitness',  name: 'Fitness',  icon: 'fitness-center',     color: '#a078ff', apiIcon: 'fitness'  },
  { key: 'mind',     name: 'Mind',     icon: 'self-improvement',   color: '#adc6ff', apiIcon: 'mind'     },
  { key: 'water',    name: 'Water',    icon: 'water-drop',         color: '#26c6da', apiIcon: 'water'    },
  { key: 'sleep',    name: 'Sleep',    icon: 'bedtime',            color: '#7986cb', apiIcon: 'sleep'    },
  { key: 'finance',  name: 'Finance',  icon: 'savings',            color: '#ffb74d', apiIcon: 'savings'  },
  { key: 'social',   name: 'Social',   icon: 'group',              color: '#4edea3', apiIcon: 'group'    },
  { key: 'book',     name: 'Learning', icon: 'menu-book',          color: '#81c784', apiIcon: 'book'     },
  { key: 'work',     name: 'Work',     icon: 'laptop-mac',         color: '#ff8a65', apiIcon: 'laptop'   },
  { key: 'food',     name: 'Food',     icon: 'restaurant',         color: '#ffb4ab', apiIcon: 'food'     },
  { key: 'clean',    name: 'Clean',    icon: 'cleaning-services',  color: '#80cbc4', apiIcon: 'clean'    },
  { key: 'energy',   name: 'Energy',   icon: 'bolt',               color: '#ffd54f', apiIcon: 'bolt'     },
];

// ── Step dots ─────────────────────────────────────────────────────────────────

function StepDots({ current }: { current: number }) {
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[styles.dot, i === current && styles.dotActive, i < current && styles.dotDone]}
        />
      ))}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

export default function NameCategoryScreen({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectHabitDraft);

  const [nameError, setNameError] = useState('');
  // selectedKey = key của DEFAULT_CATEGORIES đang được chọn (undefined = chưa chọn)
  const [selectedKey, setSelectedKey] = useState<string | undefined>(
    draft.selectedCategoryKey ?? undefined,
  );

  const handleSelectDefault = (cat: LocalCategory) => {
    setSelectedKey(cat.key);
    // Lưu vào draft: không có categoryId thật, chỉ lưu key + metadata để
    // ScheduleScreen / API biết phải tạo category trước hay dùng thẳng key
    dispatch(updateDraft({
      selectedCategoryKey: cat.key,
      selectedCategoryName: cat.name,
      selectedCategoryIcon: cat.apiIcon,
      selectedCategoryColor: cat.color,
      categoryId: undefined, // chưa có id thật từ API
    }));
  };

  const handleAddCustom = () => {
    dispatch(setStep('custom_category'));
  };

  const handleContinue = () => {
    if (!draft.name.trim()) {
      setNameError('Habit name is required.');
      return;
    }
    dispatch(setStep('schedule'));
  };

  return (
    <Screen
      bottomOverlay={
        <View style={styles.footer}>
          <GradientButton
            title="Continue"
            icon="arrow-forward"
            onPress={handleContinue}
            disabled={!draft.name.trim()}
          />
        </View>
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.75} onPress={onClose} style={styles.closeBtn}>
          <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Habit</Text>
        <View style={styles.headerSpacer} />
      </View>

      <StepDots current={0} />

      <Text style={styles.sectionTitle}>What do you want to achieve?</Text>

      {/* Name input */}
      <AppTextField
        icon="edit"
        placeholder="e.g. Read for 30 minutes"
        value={draft.name}
        onChangeText={(text) => {
          dispatch(updateDraft({ name: text }));
          if (text.trim()) setNameError('');
        }}
        error={nameError}
        style={styles.nameInput}
      />

      {/* Goal Type */}
      <Text style={styles.sectionLabel}>Goal Type</Text>
      <View style={styles.goalRow}>
        {(['boolean', 'count', 'duration', 'distance'] as const).map((g) => (
          <TouchableOpacity
            key={g}
            activeOpacity={0.75}
            onPress={() => dispatch(updateDraft({ goalType: g }))}
            style={[styles.goalChip, draft.goalType === g && styles.goalChipActive]}
          >
            <Text style={[styles.goalChipText, draft.goalType === g && styles.goalChipTextActive]}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category */}
      <Text style={styles.sectionLabel}>Category</Text>

      <View style={styles.categoryGrid}>
        {DEFAULT_CATEGORIES.map((cat) => {
          const isSelected = selectedKey === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              activeOpacity={0.75}
              onPress={() => handleSelectDefault(cat)}
              style={[styles.categoryChip, isSelected && styles.categoryChipActive, isSelected && { borderColor: cat.color }]}
            >
              <View
                style={[
                  styles.categoryIconWrap,
                  { backgroundColor: `${cat.color}22` },
                  isSelected && { backgroundColor: `${cat.color}33` },
                ]}
              >
                <MaterialIcons name={cat.icon} size={22} color={cat.color} />
              </View>
              <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive, isSelected && { color: cat.color }]}>
                {cat.name}
              </Text>
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: cat.color }]}>
                  <MaterialIcons name="check" size={11} color={colors.surfaceContainerLowest} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Custom category tile */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleAddCustom}
          style={[
            styles.categoryChip,
            styles.addCustomChip,
            selectedKey === '__custom__' && styles.categoryChipActive,
          ]}
        >
          <View style={[styles.categoryIconWrap, styles.addCustomIcon]}>
            <MaterialIcons name="add" size={22} color={colors.onSurfaceVariant} />
          </View>
          <Text style={styles.categoryLabel}>Custom</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpace} />
    </Screen>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    marginBottom: spacing.lg,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },
  headerTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
  },
  headerSpacer: { width: 34 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.section,
  },
  dot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceContainerHighest,
  },
  dotActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  dotDone: { backgroundColor: colors.tertiary },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.headline,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xl,
  },
  nameInput: {
    marginBottom: spacing.section,
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  goalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.section,
  },
  goalChip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  goalChipActive: {
    backgroundColor: 'rgba(208,188,255,0.15)',
    borderColor: colors.primary,
  },
  goalChipText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  goalChipTextActive: { color: colors.primary },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryChip: {
    width: '47%',
    minHeight: 100,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(19,27,46,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    position: 'relative',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(208,188,255,0.07)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  addCustomChip: {
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCustomIcon: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  categoryLabel: {
    color: colors.onSurface,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    textAlign: 'center',
  },
  categoryLabelActive: {
    fontWeight: fontWeights.bold,
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  bottomSpace: { height: 100 },
});