// src/screens/main/DashboardScreen.tsx
// Tích hợp check-in: mỗi HabitListItem có nút check-in, trạng thái log hôm nay
// hiển thị trực tiếp trên card. Tap vào CheckIn badge → mở CheckInModal.

import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../../components/BottomNavBar';
import GlassCard from '../../components/GlassCard';
import Screen from '../../components/Screen';
import ReminderModal from '../../components/ReminderModal';
import CheckInModal from '../../components/CheckInModal';           // <-- NEW
import EmptyDashboardScreen from './EmptyDashboardScreen';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { fetchProfile } from '../../features/auth/authSlice';
import { selectAccessToken, selectCurrentUser, selectProfileStatus } from '../../features/auth/authSelector';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../theme';
import {
  selectHabits,
  selectHabitsError,
  selectHabitsStatus,
  selectHabitsStatusUpdateId,
} from '../../features/habits/HabitSelector';
import { changeHabitStatus, fetchHabits } from '../../features/habits/habitsSlice';
import type { Habit, HabitStatus, RepeatType } from '../../types/habit';
import { fetchTodayLogs } from '../../features/habitLogs/habitLogsSlice';              // <-- NEW
import {
  selectTodayLogs,
  selectHabitLogsFetchStatus,
} from '../../features/habitLogs/habitLogsSelectors';                                   // <-- NEW
import type { HabitLog } from '../../types/habitLog';                                  // <-- NEW

type DashboardNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Dashboard'>;

type WeekBar = { day: string; value: number; active?: boolean };

const week: WeekBar[] = [
  { day: 'M', value: 1 },
  { day: 'T', value: 1 },
  { day: 'W', value: 0.6 },
  { day: 'T', value: 0.75, active: true },
  { day: 'F', value: 0 },
  { day: 'S', value: 0 },
  { day: 'S', value: 0 },
];

const GOAL_TYPE_LABELS: Record<string, string> = {
  boolean: 'Có / Không',
  count: 'Số lần',
  duration: 'Thời lượng',
  distance: 'Khoảng cách',
};

const GOAL_TYPE_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  boolean: 'check-circle-outline',
  count: 'tag',
  duration: 'schedule',
  distance: 'straighten',
};

const DAY_SHORT_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const STATUS_CYCLE: Record<HabitStatus, HabitStatus> = {
  active: 'paused',
  paused: 'archived',
  archived: 'active',
};

const STATUS_META: Record<HabitStatus, { label: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  active: { label: 'Active', icon: 'play-circle-outline' },
  paused: { label: 'Paused', icon: 'pause-circle-outline' },
  archived: { label: 'Archived', icon: 'archive' },
};

// ── Check-in status badge config ──────────────────────────────────

const LOG_STATUS_META: Record<string, {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bg: string;
}> = {
  completed: { label: 'Done',    icon: 'check-circle',      color: colors.tertiary,          bg: 'rgba(78,222,163,0.12)'  },
  partial:   { label: 'Partial', icon: 'timelapse',          color: colors.secondary,         bg: 'rgba(173,198,255,0.12)' },
  skipped:   { label: 'Skipped', icon: 'do-not-disturb',    color: colors.onSurfaceVariant,  bg: colors.surfaceContainerHigh },
  missed:    { label: 'Missed',  icon: 'cancel',            color: colors.error,             bg: 'rgba(255,180,171,0.1)'  },
  pending:   { label: 'Check In',icon: 'radio-button-off',  color: colors.primary,           bg: 'rgba(208,188,255,0.1)'  },
};

function describeSchedule(habit: Habit): string {
  const repeatType: RepeatType | undefined = habit.schedule?.repeatType;
  const config = habit.schedule?.repeatConfig ?? {};
  if (!repeatType) return 'No schedule';
  if (repeatType === 'daily') return 'Daily';
  if (repeatType === 'weekly') {
    const days = config.daysOfWeek ?? [];
    if (days.length === 0) return 'Weekly';
    return days.slice().sort((a, b) => a - b).map((d) => DAY_SHORT_LABELS[d - 1] ?? `?${d}`).join(', ');
  }
  if (repeatType === 'monthly') {
    const days = config.daysOfMonth ?? [];
    if (days.length === 0) return 'Monthly';
    return `Day ${days.slice().sort((a, b) => a - b).join(', ')} of month`;
  }
  if (repeatType === 'custom') {
    const interval = config.intervalDays;
    return interval ? `Every ${interval} day(s)` : 'Custom';
  }
  return repeatType;
}

function getCurrentStreak(habit: Habit): number { return habit.streak?.currentStreak ?? 0; }
function getLongestStreak(habit: Habit): number  { return habit.streak?.longestStreak ?? 0; }
function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'H';
}

// ── Dashboard ─────────────────────────────────────────────────────

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const accessToken = useAppSelector(selectAccessToken);
  const profileStatus = useAppSelector(selectProfileStatus);
  const habits = useAppSelector(selectHabits);
  const habitsStatus = useAppSelector(selectHabitsStatus);
  const habitsError = useAppSelector(selectHabitsError);
  const statusUpdateId = useAppSelector(selectHabitsStatusUpdateId);
  const todayLogs = useAppSelector(selectTodayLogs);                       // <-- NEW
  const logsFetchStatus = useAppSelector(selectHabitLogsFetchStatus);     // <-- NEW

  // Modal state
  const [reminderHabit, setReminderHabit] = useState<{ id: string; name: string } | null>(null);
  const [checkInHabit, setCheckInHabit] = useState<Habit | null>(null);   // <-- NEW

  useEffect(() => {
    if (accessToken && !user && profileStatus === 'idle') dispatch(fetchProfile());
  }, [accessToken, dispatch, profileStatus, user]);

  useEffect(() => {
    if (accessToken && habitsStatus === 'idle') dispatch(fetchHabits({ accessToken }));
  }, [accessToken, dispatch, habitsStatus]);

  // Fetch today's logs once after habits load
  useEffect(() => {
    if (accessToken && habitsStatus === 'succeeded' && logsFetchStatus === 'idle') {
      dispatch(fetchTodayLogs());
    }
  }, [accessToken, dispatch, habitsStatus, logsFetchStatus]);

  const displayName = user?.fullName ?? user?.name ?? 'HabitFlow user';
  const initials = getInitials(displayName);

  const activeHabits = habits.filter((h) => h.status === 'active');
  const completedToday = activeHabits.filter((h) => todayLogs[h.id]?.status === 'completed').length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, getCurrentStreak(h)), 0);
  const progressToday = activeHabits.length > 0 ? completedToday / activeHabits.length : 0;

  const handleCyclePress = (habit: Habit) => {
    dispatch(changeHabitStatus({ habitId: habit.id, status: STATUS_CYCLE[habit.status] }));
  };

  // ── Loading ────────────────────────────────────────────────────
  if (habitsStatus === 'idle' || habitsStatus === 'loading') {
    return (
      <Screen centered scroll={false}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your habits...</Text>
      </Screen>
    );
  }

  if (habitsStatus === 'succeeded' && habits.length === 0) {
    return <EmptyDashboardScreen />;
  }

  if (habitsStatus === 'failed') {
    return (
      <Screen centered scroll={false}>
        <View style={styles.errorBox}>
          <MaterialIcons name="wifi-off" size={40} color={colors.error} />
          <Text style={styles.errorTitle}>Could not load habits</Text>
          <Text style={styles.errorMessage}>{habitsError}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.retryButton}
            onPress={() => { if (accessToken) dispatch(fetchHabits({ accessToken })); }}
          >
            <MaterialIcons name="refresh" size={18} color={colors.white} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────
  return (
    <Screen
      bottomOverlay={(
        <>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CreateHabit')}
            style={styles.fab}
          >
            <Svg width={58} height={58} viewBox="0 0 58 58" style={styles.fabCircle}>
              <Defs>
                <SvgGradient id="fabGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={colors.primaryContainer} />
                  <Stop offset="1" stopColor={colors.secondaryContainer} />
                </SvgGradient>
              </Defs>
              <Circle cx="29" cy="29" r="28" fill="url(#fabGrad)" />
            </Svg>
            <View style={styles.fabIcon}>
              <MaterialIcons name="add" size={28} color={colors.white} />
            </View>
          </TouchableOpacity>
          <BottomNavBar
            activeTab="Today"
            onProfilePress={() => { dispatch(fetchProfile()); navigation.navigate('Profile'); }}
          />
        </>
      )}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.avatar}
          onPress={() => { dispatch(fetchProfile()); navigation.navigate('Profile'); }}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>HabitFlow</Text>
        <TouchableOpacity activeOpacity={0.75} style={styles.iconButton}>
          <MaterialIcons name="settings" size={21} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Focus card — now shows real today progress */}
      <GlassCard style={styles.focusCard}>
        <View style={styles.focusGlow} />
        <View style={styles.focusRow}>
          <View>
            <Text style={styles.focusTitle}>Today's Focus</Text>
            <Text style={styles.mutedText}>
              {completedToday === activeHabits.length && activeHabits.length > 0
                ? 'All done! 🎉'
                : `${completedToday} of ${activeHabits.length} habits done`}
            </Text>
          </View>
          <ProgressRing progress={progressToday} percent={Math.round(progressToday * 100)} />
        </View>
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{habits.length} Habits</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{activeHabits.length} Active</Text>
          </View>
          <View style={[styles.pill, styles.successPill]}>
            <Text style={[styles.pillText, styles.successText]}>Best streak {bestStreak}d</Text>
          </View>
        </View>
      </GlassCard>

      {/* Habit list */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Your Habits</Text>
        <Text style={styles.sectionCount}>{habits.length}</Text>
      </View>

      <View style={styles.habitList}>
        {habits.map((habit) => (
          <HabitListItem
            key={habit.id}
            habit={habit}
            todayLog={todayLogs[habit.id] ?? null}
            isUpdatingStatus={statusUpdateId === habit.id}
            onReminderPress={() => setReminderHabit({ id: habit.id, name: habit.name })}
            onStatusPress={() => handleCyclePress(habit)}
            onCheckInPress={() => setCheckInHabit(habit)}              // <-- NEW
          />
        ))}
      </View>

      {/* Weekly chart */}
      <GlassCard style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionLabel}>Weekly Momentum</Text>
          <Text style={styles.tinyStat}>{Math.round(progressToday * 100)}%</Text>
        </View>
        <View style={styles.chart}>
          {week.map((item, index) => (
            <View key={`${item.day}-${index}`} style={styles.barColumn}>
              <View style={styles.barShell}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${Math.max(item.value * 100, 6)}%` },
                    item.active && styles.activeBar,
                    item.value === 0 && styles.emptyBar,
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, item.active && styles.activeDay]}>{item.day}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <View style={styles.bottomSpace} />

      {/* Reminder modal */}
      <ReminderModal
        visible={!!reminderHabit}
        habitId={reminderHabit?.id ?? ''}
        habitName={reminderHabit?.name ?? ''}
        onClose={() => setReminderHabit(null)}
      />

      {/* Check-in modal */}
      {checkInHabit && (
        <CheckInModal
          visible={!!checkInHabit}
          habitId={checkInHabit.id}
          habitName={checkInHabit.name}
          goalType={checkInHabit.goalType}
          goalValue={checkInHabit.goalValue}
          goalUnit={checkInHabit.goalUnit}
          onClose={() => setCheckInHabit(null)}
        />
      )}
    </Screen>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function ProgressRing({ progress, percent }: { progress: number; percent: number }) {
  const r = 38;
  const circumference = 2 * Math.PI * r;
  return (
    <View style={styles.progressWrap}>
      <Svg width={82} height={82} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r={r} fill="transparent" stroke={colors.surfaceContainerHighest} strokeWidth={8} />
        <Circle
          cx="50" cy="50" r={r} fill="transparent"
          stroke={colors.primary} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          rotation="-90" origin="50, 50"
        />
      </Svg>
      <Text style={styles.progressText}>{percent}%</Text>
    </View>
  );
}

function HabitListItem({
  habit,
  todayLog,
  isUpdatingStatus,
  onReminderPress,
  onStatusPress,
  onCheckInPress,
}: {
  habit: Habit;
  todayLog: HabitLog | null;
  isUpdatingStatus: boolean;
  onReminderPress: () => void;
  onStatusPress: () => void;
  onCheckInPress: () => void;
}) {
  const active = habit.status === 'active';
  const paused = habit.status === 'paused';
  const done   = habit.status === 'archived';

  const goalIcon  = GOAL_TYPE_ICONS[habit.goalType] ?? 'track-changes';
  const goalLabel = GOAL_TYPE_LABELS[habit.goalType] ?? habit.goalType;
  const scheduleLabel  = describeSchedule(habit);
  const statusMeta     = STATUS_META[habit.status];
  const currentStreak  = getCurrentStreak(habit);
  const longestStreak  = getLongestStreak(habit);
  const categoryColor  = habit.category?.color ?? colors.primary;
  const categoryName   = habit.category?.name;

  // Check-in status for today
  const logStatus = todayLog?.status ?? 'pending';
  const logMeta   = LOG_STATUS_META[logStatus] ?? LOG_STATUS_META.pending;
  const canCheckIn = active && logStatus !== 'skipped' && logStatus !== 'missed';

  return (
    <GlassCard style={[
      styles.habitItem,
      active && styles.activeItem,
      done && styles.doneItem,
      paused && styles.pausedItem,
    ]}>
      {/* Top row: icon + title + bells */}
      <View style={styles.habitItemTop}>
        <View style={[styles.habitIcon, { backgroundColor: `${categoryColor}22` }]}>
          <MaterialIcons name="track-changes" size={18} color={categoryColor} />
        </View>
        <View style={styles.habitItemTitleWrap}>
          <Text style={styles.habitItemTitle} numberOfLines={1}>{habit.name}</Text>
          {categoryName
            ? <Text style={styles.habitItemCategory} numberOfLines={1}>{categoryName}</Text>
            : habit.description
              ? <Text style={styles.habitItemCategory} numberOfLines={1}>{habit.description}</Text>
              : null}
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onReminderPress}
          style={styles.reminderBellBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <MaterialIcons name="notifications" size={16} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Stat chips */}
      <View style={styles.statRow}>
        <View style={styles.statChip}>
          <MaterialIcons name={goalIcon} size={14} color={colors.onSurfaceVariant} />
          <Text style={styles.statChipText}>{goalLabel}</Text>
        </View>
        <View style={styles.statChip}>
          <MaterialIcons name="event-repeat" size={14} color={colors.onSurfaceVariant} />
          <Text style={styles.statChipText} numberOfLines={1}>{scheduleLabel}</Text>
        </View>
        <View style={[styles.statChip, styles.streakChip]}>
          <MaterialIcons name="local-fire-department" size={14} color={colors.tertiary} />
          <Text style={[styles.statChipText, styles.streakChipText]}>
            {currentStreak}d
            {longestStreak > currentStreak ? ` · best ${longestStreak}d` : ''}
          </Text>
        </View>
      </View>

      {/* Footer: start date + status + CHECK-IN button */}
      <View style={styles.habitItemFooter}>
        {/* Habit status (cycle badge) */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onStatusPress}
          disabled={isUpdatingStatus}
          style={[
            styles.statusBadge,
            active && styles.statusBadgeActive,
            paused && styles.statusBadgePaused,
            done && styles.statusBadgeArchived,
          ]}
        >
          {isUpdatingStatus ? (
            <ActivityIndicator size="small" color={colors.onSurface} />
          ) : (
            <>
              <MaterialIcons
                name={statusMeta.icon}
                size={12}
                color={active ? colors.tertiary : paused ? colors.secondary : colors.onSurfaceVariant}
              />
              <Text style={[
                styles.statusBadgeText,
                active && styles.statusBadgeTextActive,
                paused && styles.statusBadgeTextPaused,
              ]}>
                {statusMeta.label}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Check-in badge / button — only for active habits */}
        {active && (
          <TouchableOpacity
            activeOpacity={canCheckIn ? 0.75 : 1}
            onPress={canCheckIn ? onCheckInPress : undefined}
            style={[styles.checkInBadge, { backgroundColor: logMeta.bg }]}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <MaterialIcons name={logMeta.icon} size={14} color={logMeta.color} />
            <Text style={[styles.checkInBadgeText, { color: logMeta.color }]}>
              {logMeta.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </GlassCard>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingText: {
    color: colors.onSurfaceVariant, fontSize: fontSizes.body,
    marginTop: spacing.lg, textAlign: 'center',
  },
  errorBox: { alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl },
  errorTitle: { color: colors.onSurface, fontSize: fontSizes.title, fontWeight: fontWeights.bold, textAlign: 'center' },
  errorMessage: { color: colors.onSurfaceVariant, fontSize: fontSizes.body, textAlign: 'center', lineHeight: 24 },
  retryButton: {
    marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primaryContainer, paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md, borderRadius: radius.md,
  },
  retryText: { color: colors.white, fontSize: fontSizes.label, fontWeight: fontWeights.bold, letterSpacing: 0.8, textTransform: 'uppercase' },

  topBar: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xxl },
  avatar: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontWeight: fontWeights.bold },
  brand: { color: colors.primary, fontSize: fontSizes.title, fontWeight: fontWeights.extrabold },
  iconButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  focusCard: { marginBottom: spacing.section },
  focusGlow: {
    position: 'absolute', right: -28, top: -28, width: 110, height: 110,
    borderRadius: 55, backgroundColor: colors.primaryContainer, opacity: 0.14,
  },
  focusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  focusTitle: { color: colors.onSurface, fontSize: fontSizes.title, fontWeight: fontWeights.bold, marginBottom: 4 },
  mutedText: { color: colors.onSurfaceVariant, fontSize: fontSizes.body },
  progressWrap: { width: 82, height: 82, alignItems: 'center', justifyContent: 'center' },
  progressText: { position: 'absolute', color: colors.onSurface, fontSize: 17, fontWeight: fontWeights.bold, fontVariant: ['tabular-nums'] },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  pill: { borderRadius: radius.full, backgroundColor: colors.surfaceContainerHigh, paddingHorizontal: spacing.md, paddingVertical: 6 },
  successPill: { backgroundColor: 'rgba(78,222,163,0.12)' },
  pillText: { color: colors.primary, fontSize: fontSizes.label, fontWeight: fontWeights.bold },
  successText: { color: colors.tertiary },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  sectionLabel: { color: colors.onSurfaceVariant, fontSize: fontSizes.label, fontWeight: fontWeights.bold, letterSpacing: 1, textTransform: 'uppercase' },
  sectionCount: { color: colors.primary, fontSize: fontSizes.label, fontWeight: fontWeights.bold },

  habitList: { gap: spacing.md, marginBottom: spacing.section },
  habitItem: { gap: spacing.md },
  activeItem: { borderColor: 'rgba(208,188,255,0.38)' },
  doneItem: { backgroundColor: 'rgba(0,165,114,0.08)', borderColor: 'rgba(78,222,163,0.28)' },
  pausedItem: { opacity: 0.85 },

  habitItemTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  habitIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  habitItemTitleWrap: { flex: 1 },
  habitItemTitle: { color: colors.onSurface, fontSize: fontSizes.body, fontWeight: fontWeights.bold },
  habitItemCategory: { color: colors.onSurfaceVariant, fontSize: fontSizes.label, marginTop: 2 },
  reminderBellBtn: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },

  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHigh, paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  statChipText: { color: colors.onSurfaceVariant, fontSize: 11, fontWeight: fontWeights.semibold },
  streakChip: { backgroundColor: 'rgba(78,222,163,0.12)' },
  streakChipText: { color: colors.tertiary },

  habitItemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 6, backgroundColor: colors.surfaceContainerHigh,
    minHeight: 26, minWidth: 80, justifyContent: 'center',
  },
  statusBadgeActive:   { backgroundColor: 'rgba(78,222,163,0.14)' },
  statusBadgePaused:   { backgroundColor: 'rgba(173,198,255,0.14)' },
  statusBadgeArchived: { backgroundColor: colors.surfaceContainerHighest },
  statusBadgeText:     { color: colors.onSurfaceVariant, fontSize: 11, fontWeight: fontWeights.bold },
  statusBadgeTextActive: { color: colors.tertiary },
  statusBadgeTextPaused: { color: colors.secondary },

  // ── Check-in badge (NEW) ──
  checkInBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 6, minHeight: 26, justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  checkInBadgeText: { fontSize: 11, fontWeight: fontWeights.bold },

  chartCard: { gap: spacing.lg },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tinyStat: { color: colors.primary, fontSize: fontSizes.label, fontWeight: fontWeights.bold },
  chart: { height: 128, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barColumn: { alignItems: 'center', gap: spacing.sm },
  barShell: {
    width: 28, height: 92, borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerHigh, overflow: 'hidden', justifyContent: 'flex-end',
  },
  barFill: { width: '100%', backgroundColor: colors.tertiary, opacity: 0.85 },
  activeBar: { backgroundColor: colors.primary, opacity: 1 },
  emptyBar: { opacity: 0 },
  dayLabel: { color: colors.onSurfaceVariant, fontSize: fontSizes.label, fontWeight: fontWeights.semibold },
  activeDay: { color: colors.primary },

  fab: {
    position: 'absolute', right: spacing.xl, bottom: 96, width: 58, height: 58, borderRadius: 29,
    shadowColor: colors.primaryContainer, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 18, elevation: 8, zIndex: 20,
  },
  fabCircle: { position: 'absolute', top: 0, left: 0 },
  fabIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center' },
  bottomSpace: { height: 110 },
});
