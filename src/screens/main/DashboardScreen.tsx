// src/screens/main/DashboardScreen.tsx

import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../../components/BottomNavBar';
import GlassCard from '../../components/GlassCard';
import Screen from '../../components/Screen';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { fetchProfile } from '../../features/auth/authSlice';

import { selectAccessToken, selectCurrentUser, selectProfileStatus } from '../../features/auth/authSelector';

import type { MainStackParamList } from '../../navigation/MainNavigator';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../theme';
import { selectHabits, selectHabitsError, selectHabitsStatus } from '../../features/habits/HabitSelector';
import { fetchHabits } from '../../features/habits/habitsSlice';
import {
  fetchHabitLogs,
  submitHabitCheckIn,
  submitHabitSkip,
  submitProcessMissedHabitLogs,
} from '../../features/habitLogs/habitLogsSlice';
import {
  selectHabitLogsMutationStatus,
  selectTodayHabitLogByHabitId,
} from '../../features/habitLogs/habitLogsSelector';

type DashboardNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Dashboard'>;

type WeekBar = {
  day: string;
  value: number;
  active?: boolean;
};

const week: WeekBar[] = [
  { day: 'M', value: 1 },
  { day: 'T', value: 1 },
  { day: 'W', value: 0.6 },
  { day: 'T', value: 0.75, active: true },
  { day: 'F', value: 0 },
  { day: 'S', value: 0 },
  { day: 'S', value: 0 },
] as const;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const dispatch = useAppDispatch();

  // Auth state
  const user = useAppSelector(selectCurrentUser);
  const accessToken = useAppSelector(selectAccessToken);
  const profileStatus = useAppSelector(selectProfileStatus);

  // Habits state
  const habits = useAppSelector(selectHabits);
  const habitsStatus = useAppSelector(selectHabitsStatus);
  const habitsError = useAppSelector(selectHabitsError);
  const habitLogMutationStatus = useAppSelector(selectHabitLogsMutationStatus);
  const today = todayISO();

  // Dùng ref để tránh redirect nhiều lần khi re-render
  const hasRedirected = useRef(false);

  // 1. Fetch profile nếu chưa có
  useEffect(() => {
    if (accessToken && !user && profileStatus === 'idle') {
      dispatch(fetchProfile());
    }
  }, [accessToken, dispatch, profileStatus, user]);

  // 2. Fetch habits khi có accessToken và chưa fetch lần nào
  useEffect(() => {
    if (accessToken && habitsStatus === 'idle') {
      dispatch(fetchHabits({ accessToken }));
    }
  }, [accessToken, dispatch, habitsStatus]);

  useEffect(() => {
    if (accessToken) {
      dispatch(submitProcessMissedHabitLogs({ processUntilDate: today }));
      dispatch(fetchHabitLogs({ date: today }));
    }
  }, [accessToken, dispatch, today]);

  // 3. Sau khi fetch xong → redirect nếu không có habits
  useEffect(() => {
    if (habitsStatus !== 'succeeded') return;
    if (hasRedirected.current) return;

    hasRedirected.current = true;

    if (habits.length === 0) {
      // replace để user không thể bấm Back quay về màn hình trống
      navigation.replace('EmptyDashboard');
    }
  }, [habitsStatus, habits.length, navigation]);

  const displayName = user?.fullName ?? user?.name ?? 'HabitFlow user';
  const initials = getInitials(displayName);
  const isUpdatingLog = habitLogMutationStatus === 'loading';

  const handleCheckIn = (habitId: string) => {
    dispatch(submitHabitCheckIn({ habitId, logDate: today, progressValue: 1 }))
      .unwrap()
      .then(() => dispatch(fetchHabitLogs({ date: today })))
      .catch(() => undefined);
  };

  const handleSkip = (habitId: string) => {
    dispatch(submitHabitSkip({ habitId, payload: { logDate: today } }))
      .unwrap()
      .then(() => dispatch(fetchHabitLogs({ date: today })))
      .catch(() => undefined);
  };

  // ── Loading state ─────────────────────────────────────────────────
  if (habitsStatus === 'idle' || habitsStatus === 'loading') {
    return (
      <Screen centered scroll={false}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your habits...</Text>
      </Screen>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
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
            onPress={() => {
              hasRedirected.current = false;
              if (accessToken) {
                dispatch(fetchHabits({ accessToken }));
              }
            }}
          >
            <MaterialIcons name="refresh" size={18} color={colors.white} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // ── Main Dashboard UI ─────────────────────────────────────────────
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
                <SvgGradient id="dashboardFabGradient" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={colors.primaryContainer} />
                  <Stop offset="1" stopColor={colors.secondaryContainer} />
                </SvgGradient>
              </Defs>
              <Circle cx="29" cy="29" r="28" fill="url(#dashboardFabGradient)" />
            </Svg>
            <View style={styles.fabIcon}>
              <MaterialIcons name="add" size={28} color={colors.white} />
            </View>
          </TouchableOpacity>
          <BottomNavBar
            activeTab="Today"
            onStatsPress={() => navigation.navigate('Statistics')}
            onProfilePress={() => {
              dispatch(fetchProfile());
              navigation.navigate('Profile');
            }}
          />
        </>
      )}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.avatar}
          onPress={() => {
            dispatch(fetchProfile());
            navigation.navigate('Profile');
          }}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>HabitFlow</Text>
        <TouchableOpacity activeOpacity={0.75} style={styles.iconButton}>
          <MaterialIcons name="settings" size={21} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Focus card */}
      <GlassCard style={styles.focusCard}>
        <View style={styles.focusGlow} />
        <View style={styles.focusRow}>
          <View>
            <Text style={styles.focusTitle}>Today's Focus</Text>
            <Text style={styles.mutedText}>You're on a roll!</Text>
          </View>
          <ProgressRing progress={0.75} />
        </View>
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{habits.length} Habits</Text>
          </View>
          <View style={[styles.pill, styles.successPill]}>
            <Text style={[styles.pillText, styles.successText]}>12 Day Streak</Text>
          </View>
        </View>
      </GlassCard>

      {/* Daily Flow section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Daily Flow</Text>
        <TouchableOpacity activeOpacity={0.75} onPress={() => navigation.navigate('EmptyDashboard')}>
          <Text style={styles.sectionAction}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Habit cards — hiển thị tối đa 3 habit đầu từ API */}
      <View style={styles.habitRow}>
        {habits.slice(0, 3).map((habit) => (
          <HabitCard
            key={habit.id}
            habitId={habit.id}
            title={habit.name}
            meta={habit.goalType}
            status={habit.status}
            today={today}
            disabled={isUpdatingLog}
            onCheckIn={handleCheckIn}
            onSkip={handleSkip}
          />
        ))}
      </View>

      {/* Weekly chart */}
      <GlassCard style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionLabel}>Weekly Momentum</Text>
          <Text style={styles.tinyStat}>75%</Text>
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
    </Screen>
  );
}

// ── Helper functions ───────────────────────────────────────────────

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'H'
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function ProgressRing({ progress }: { progress: number }) {
  const radiusValue = 38;
  const circumference = 2 * Math.PI * radiusValue;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={styles.progressWrap}>
      <Svg width={82} height={82} viewBox="0 0 100 100">
        <Circle
          cx="50"
          cy="50"
          r={radiusValue}
          fill="transparent"
          stroke={colors.surfaceContainerHighest}
          strokeWidth={8}
        />
        <Circle
          cx="50"
          cy="50"
          r={radiusValue}
          fill="transparent"
          stroke={colors.primary}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          rotation="-90"
          origin="50, 50"
        />
      </Svg>
      <Text style={styles.progressText}>75%</Text>
    </View>
  );
}

function HabitCard({
  habitId,
  title,
  meta,
  status,
  today,
  disabled,
  onCheckIn,
  onSkip,
}: {
  habitId: string;
  title: string;
  meta: string;
  status: string;
  today: string;
  disabled: boolean;
  onCheckIn: (habitId: string) => void;
  onSkip: (habitId: string) => void;
}) {
  const done = status === 'archived';
  const active = status === 'active';
  const log = useAppSelector((state) => selectTodayHabitLogByHabitId(state, habitId, today));
  const isCompleted = log?.status === 'completed';
  const isSkipped = log?.status === 'skipped';

  return (
    <GlassCard style={[styles.habitCard, (done || isCompleted) && styles.doneCard, active && styles.activeCard]}>
      <View style={styles.habitTop}>
        <View style={[styles.habitIcon, (done || isCompleted) && styles.doneIcon, active && styles.activeIcon]}>
          <MaterialIcons
            name={isSkipped ? 'remove-circle-outline' : isCompleted ? 'check-circle' : 'track-changes'}
            size={18}
            color={(done || isCompleted) ? colors.tertiary : active ? colors.primary : colors.onSurfaceVariant}
          />
        </View>
        <View style={[styles.checkCircle, (done || isCompleted) && styles.checkedCircle]}>
          {(done || isCompleted) && <MaterialIcons name="check" size={14} color={colors.surfaceContainerLowest} />}
        </View>
      </View>
      <View>
        <Text style={styles.habitTitle} numberOfLines={1}>{title}</Text>
        <Text style={[styles.habitMeta, active && styles.activeMeta]}>
          {log?.status ?? meta}
        </Text>
      </View>
      <View style={styles.logActionRow}>
        <TouchableOpacity
          activeOpacity={0.78}
          disabled={disabled || isCompleted}
          onPress={() => onCheckIn(habitId)}
          style={[styles.logAction, isCompleted && styles.logActionDone]}
        >
          <MaterialIcons name="done" size={14} color={isCompleted ? colors.surfaceContainerLowest : colors.tertiary} />
          <Text style={[styles.logActionText, isCompleted && styles.logActionDoneText]}>
            Done
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.78}
          disabled={disabled || isSkipped}
          onPress={() => onSkip(habitId)}
          style={styles.skipAction}
        >
          <MaterialIcons name="skip-next" size={14} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Loading
  loadingText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.body,
    marginTop: spacing.lg,
    textAlign: 'center',
  },

  // Error
  errorBox: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  errorMessage: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: {
    color: colors.white,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Top bar
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontWeight: fontWeights.bold,
  },
  brand: {
    color: colors.primary,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.extrabold,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Focus card
  focusCard: {
    marginBottom: spacing.section,
  },
  focusGlow: {
    position: 'absolute',
    right: -28,
    top: -28,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primaryContainer,
    opacity: 0.14,
  },
  focusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  focusTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    marginBottom: 4,
  },
  mutedText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.body,
  },
  progressWrap: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    color: colors.onSurface,
    fontSize: 17,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  pill: {
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  successPill: {
    backgroundColor: 'rgba(78,222,163,0.12)',
  },
  pillText: {
    color: colors.primary,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  successText: {
    color: colors.tertiary,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionAction: {
    color: colors.primary,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },

  // Habit cards
  habitRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.section,
  },
  habitCard: {
    flex: 1,
    minHeight: 160,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  doneCard: {
    backgroundColor: 'rgba(0,165,114,0.08)',
    borderColor: 'rgba(78,222,163,0.28)',
  },
  activeCard: {
    borderColor: 'rgba(208,188,255,0.38)',
  },
  habitTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneIcon: {
    backgroundColor: 'rgba(78,222,163,0.16)',
  },
  activeIcon: {
    backgroundColor: 'rgba(208,188,255,0.14)',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCircle: {
    backgroundColor: colors.tertiary,
    borderColor: colors.tertiary,
  },
  habitTitle: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: fontWeights.bold,
  },
  habitMeta: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  activeMeta: {
    color: colors.primary,
  },
  logActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  logAction: {
    flex: 1,
    minHeight: 30,
    borderRadius: radius.full,
    backgroundColor: 'rgba(78,222,163,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  logActionDone: {
    backgroundColor: colors.tertiary,
  },
  logActionText: {
    color: colors.tertiary,
    fontSize: 10,
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
  },
  logActionDoneText: {
    color: colors.surfaceContainerLowest,
  },
  skipAction: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Chart
  chartCard: {
    gap: spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tinyStat: {
    color: colors.primary,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  chart: {
    height: 128,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  barShell: {
    width: 28,
    height: 92,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.tertiary,
    opacity: 0.85,
  },
  activeBar: {
    backgroundColor: colors.primary,
    opacity: 1,
  },
  emptyBar: {
    opacity: 0,
  },
  dayLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  activeDay: {
    color: colors.primary,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 96,
    width: 58,
    height: 58,
    borderRadius: 29,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 20,
  },
  fabCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fabIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpace: {
    height: 110,
  },
});
