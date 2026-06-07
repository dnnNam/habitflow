// src/screens/main/createHabit/CustomCategoryScreen.tsx
//
// Flow mới:
// - User điền name + chọn icon + chọn color
// - Bấm "Create & Continue" → gọi API tạo category → nhận về categoryId thật
// - Lưu categoryId vào draft → tự động chuyển sang ScheduleScreen (do slice set step='schedule')

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import GradientButton from '../../../components/GradientButton';
import Screen from '../../../components/Screen';
import AppTextField from '../../../components/AppTextField';
import GlassCard from '../../../components/GlassCard';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  setStep,
  submitCreateCategory,
} from '../../../features/createHabit/createHabitSlice';
import {
  selectCreateCategoryError,
  selectCreateCategoryStatus,
} from '../../../features/createHabit/createHabitSelectors';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../../theme';

// ── Preset data ───────────────────────────────────────────────────────────────

const PRESET_ICONS = [
  { key: 'favorite',          apiIcon: 'heart',    label: 'Heart'   },
  { key: 'bolt',              apiIcon: 'bolt',     label: 'Energy'  },
  { key: 'savings',           apiIcon: 'savings',  label: 'Finance' },
  { key: 'group',             apiIcon: 'group',    label: 'Social'  },
  { key: 'fitness-center',    apiIcon: 'fitness',  label: 'Fitness' },
  { key: 'menu-book',         apiIcon: 'book',     label: 'Book'    },
  { key: 'water-drop',        apiIcon: 'water',    label: 'Water'   },
  { key: 'bedtime',           apiIcon: 'sleep',    label: 'Sleep'   },
  { key: 'laptop-mac',        apiIcon: 'laptop',   label: 'Work'    },
  { key: 'cleaning-services', apiIcon: 'clean',    label: 'Clean'   },
  { key: 'self-improvement',  apiIcon: 'mind',     label: 'Mind'    },
  { key: 'restaurant',        apiIcon: 'food',     label: 'Food'    },
] as const;

const PRESET_COLORS = [
  '#a078ff',
  '#4edea3',
  '#adc6ff',
  '#ff8a65',
  '#f06292',
  '#26c6da',
  '#ffb74d',
  '#81c784',
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

export default function CustomCategoryScreen() {
  const dispatch = useAppDispatch();
  const createStatus = useAppSelector(selectCreateCategoryStatus);
  const createError = useAppSelector(selectCreateCategoryError);

  const [catName, setCatName] = useState('');
  const [catNameError, setCatNameError] = useState('');
  const [selectedIconKey, setSelectedIconKey] = useState<string>('favorite');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const isLoading = createStatus === 'loading';

  const selectedIconEntry = PRESET_ICONS.find((i) => i.key === selectedIconKey) ?? PRESET_ICONS[0];

  const handleSubmit = () => {
    if (!catName.trim()) {
      setCatNameError('Category name is required.');
      return;
    }
    // Gọi API tạo category; slice sẽ:
    //   1. Nhận về Category object có id thật
    //   2. Set draft.categoryId = category.id
    //   3. Set step = 'schedule'
    dispatch(
      submitCreateCategory({
        name: catName.trim(),
        icon: selectedIconEntry.apiIcon,
        color: selectedColor,
      }),
    );
  };

  return (
    <Screen
      bottomOverlay={
        <View style={styles.footer}>
          <GradientButton
            title="Create & Continue"
            icon="arrow-forward"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!catName.trim() || isLoading}
          />
        </View>
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => dispatch(setStep('name_category'))}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Custom Category</Text>
        <View style={styles.headerSpacer} />
      </View>

      <StepDots current={1} />

      {/* Live Preview */}
      <View style={styles.previewWrap}>
        <View style={[
          styles.previewCircle,
          { backgroundColor: `${selectedColor}22`, borderColor: selectedColor },
        ]}>
          <MaterialIcons
            name={selectedIconKey as keyof typeof MaterialIcons.glyphMap}
            size={36}
            color={selectedColor}
          />
        </View>
        <Text style={[styles.previewName, { color: selectedColor }]}>
          {catName.trim() || 'My Category'}
        </Text>
      </View>

      {/* Name */}
      <Text style={styles.sectionLabel}>Category Name</Text>
      <AppTextField
        icon="label"
        placeholder="e.g. Morning Routine"
        value={catName}
        onChangeText={(t) => {
          setCatName(t);
          if (t.trim()) setCatNameError('');
        }}
        error={catNameError}
        style={styles.mb}
      />

      {/* Icon picker */}
      <Text style={styles.sectionLabel}>Icon</Text>
      <GlassCard style={styles.iconGrid}>
        {PRESET_ICONS.map(({ key }) => {
          const isActive = selectedIconKey === key;
          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.75}
              onPress={() => setSelectedIconKey(key)}
              style={[
                styles.iconBtn,
                isActive && { borderColor: selectedColor, backgroundColor: `${selectedColor}1a` },
              ]}
            >
              <MaterialIcons
                name={key as keyof typeof MaterialIcons.glyphMap}
                size={24}
                color={isActive ? selectedColor : colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          );
        })}
      </GlassCard>

      {/* Color picker */}
      <Text style={[styles.sectionLabel, styles.mt]}>Color</Text>
      <GlassCard style={styles.colorRow}>
        {PRESET_COLORS.map((c) => {
          const isActive = selectedColor === c;
          return (
            <TouchableOpacity
              key={c}
              activeOpacity={0.8}
              onPress={() => setSelectedColor(c)}
              style={[
                styles.colorCircle,
                { backgroundColor: c },
                isActive && styles.colorCircleActive,
              ]}
            >
              {isActive && (
                <MaterialIcons name="check" size={14} color={colors.surfaceContainerLowest} />
              )}
            </TouchableOpacity>
          );
        })}
      </GlassCard>

      {createError ? (
        <Text style={styles.errorText}>{createError}</Text>
      ) : null}

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
  backBtn: {
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
  previewWrap: {
    alignItems: 'center',
    marginBottom: spacing.section,
    gap: spacing.md,
  },
  previewCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  mb: { marginBottom: spacing.section },
  mt: { marginTop: spacing.lg },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.md,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleActive: {
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: colors.white,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  bottomSpace: { height: 100 },
});