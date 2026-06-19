// src/screens/main/createHabit/ScheduleScreen.tsx

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import GlassCard from '../../../components/GlassCard';
import GradientButton from '../../../components/GradientButton';
import Screen from '../../../components/Screen';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import {
  setStep,
  submitCreateHabit,
  updateDraft,
} from '../../../features/createHabit/createHabitSlice';
import {
  selectCreateHabitError,
  selectCreateHabitStatus,
  selectHabitDraft,
} from '../../../features/createHabit/createHabitSelectors';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../../theme';
import type { RepeatType } from '../../../types/habit';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

const FREQUENCY_OPTIONS: { label: string; value: RepeatType; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { label: 'Daily', value: 'daily', icon: 'calendar-today' },
  { label: 'Weekly', value: 'weekly', icon: 'view-week' },
  { label: 'Monthly', value: 'monthly', icon: 'calendar-month' },
];

export default function ScheduleScreen() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectHabitDraft);
  const createStatus = useAppSelector(selectCreateHabitStatus);
  const createError = useAppSelector(selectCreateHabitError);

  // For weekly: track selected days (ISO 1=Mon..7=Sun)
  const [selectedDays, setSelectedDays] = useState<number[]>(
    draft.repeatConfig.daysOfWeek ?? [1, 2, 3, 4, 5],
  );
  const [scheduleError, setScheduleError] = useState('');

  const isLoading = createStatus === 'loading';
  const hasWeeklyDays = draft.repeatType !== 'weekly' || selectedDays.length > 0;

  const toggleDay = (isoDay: number) => {
    setScheduleError('');
    setSelectedDays((prev) =>
      prev.includes(isoDay) ? prev.filter((d) => d !== isoDay) : [...prev, isoDay].sort(),
    );
  };

  const handleFrequencyChange = (freq: RepeatType) => {
    setScheduleError('');
    dispatch(updateDraft({ repeatType: freq, repeatConfig: {} }));
  };

  const handleCreate = () => {
    if (!hasWeeklyDays) {
      setScheduleError('Select at least one day.');
      return;
    }

    const repeatConfig =
      draft.repeatType === 'weekly'
        ? { daysOfWeek: selectedDays }
        : draft.repeatType === 'monthly'
        ? { daysOfMonth: [1] }
        : {};
    // Pass repeatConfig directly to avoid async state-update race condition
    dispatch(submitCreateHabit({ repeatConfig }));
  };

  return (
    <Screen
      bottomOverlay={
        <View style={styles.footer}>
          <GradientButton
            title="Create Habit"
            icon="rocket-launch"
            onPress={handleCreate}
            loading={isLoading}
            disabled={!hasWeeklyDays}
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
        <Text style={styles.headerTitle}>Schedule</Text>
        <View style={styles.headerSpacer} />
      </View>

      <StepDots current={2} />

      {/* Habit preview pill */}
      <View style={styles.habitPreview}>
        <MaterialIcons name="track-changes" size={16} color={colors.primary} />
        <Text style={styles.habitPreviewText} numberOfLines={1}>{draft.name}</Text>
      </View>

      {/* Frequency */}
      <Text style={styles.sectionLabel}>Frequency</Text>
      <View style={styles.freqRow}>
        {FREQUENCY_OPTIONS.map(({ label, value, icon }) => {
          const isActive = draft.repeatType === value;
          return (
            <TouchableOpacity
              key={value}
              activeOpacity={0.75}
              onPress={() => handleFrequencyChange(value)}
              style={[styles.freqCard, isActive && styles.freqCardActive]}
            >
              <MaterialIcons
                name={icon}
                size={24}
                color={isActive ? colors.primary : colors.onSurfaceVariant}
              />
              <Text style={[styles.freqLabel, isActive && styles.freqLabelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Day selector (only for weekly) */}
      {draft.repeatType === 'weekly' && (
        <>
          <Text style={[styles.sectionLabel, styles.mt]}>Days of Week</Text>
          <GlassCard style={styles.daysCard}>
            <View style={styles.daysRow}>
              {DAYS.map((day, i) => {
                const isoDay = i + 1;
                const isSelected = selectedDays.includes(isoDay);
                return (
                  <TouchableOpacity
                    key={`${day}-${i}`}
                    activeOpacity={0.75}
                    onPress={() => toggleDay(isoDay)}
                    style={[styles.dayBtn, isSelected && styles.dayBtnActive]}
                  >
                    <Text style={[styles.dayBtnText, isSelected && styles.dayBtnTextActive]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.daysHint, scheduleError && styles.daysHintError]}>
              {selectedDays.length === 0
                ? (scheduleError || 'Select at least one day')
                : selectedDays.map((d) => DAY_LABELS[d - 1]).join(', ')}
            </Text>
          </GlassCard>
        </>
      )}

      {/* Start Date */}
      <Text style={[styles.sectionLabel, styles.mt]}>Start Date</Text>
      <GlassCard style={styles.dateCard}>
        <MaterialIcons name="event" size={20} color={colors.primary} />
        <Text style={styles.dateText}>{draft.startDate}</Text>
        <Text style={styles.dateMeta}>Today</Text>
      </GlassCard>

      {createError ? (
        <Text style={styles.errorText}>{createError}</Text>
      ) : null}

      <View style={styles.bottomSpace} />
    </Screen>
  );
}

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
  habitPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(208,188,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignSelf: 'center',
    marginBottom: spacing.section,
    maxWidth: '90%',
  },
  habitPreviewText: {
    color: colors.primary,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  mt: { marginTop: spacing.section },
  freqRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  freqCard: {
    flex: 1,
    paddingVertical: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(19,27,46,0.78)',
    alignItems: 'center',
    gap: spacing.sm,
  },
  freqCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(208,188,255,0.1)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  freqLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  freqLabelActive: {
    color: colors.primary,
  },
  daysCard: {
    gap: spacing.md,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayBtnText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  dayBtnTextActive: {
    color: colors.surfaceContainerLowest,
  },
  daysHint: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    textAlign: 'center',
  },
  daysHintError: {
    color: colors.error,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dateText: {
    color: colors.onSurface,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
  dateMeta: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  bottomSpace: { height: 80 },
});
