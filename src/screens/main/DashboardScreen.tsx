import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../../components/BottomNavBar';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import Screen from '../../components/Screen';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProfile } from '../../features/auth/authSlice';
import { selectAccessToken, selectCurrentUser, selectProfileStatus } from '../../features/auth/authSelector';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../theme';

type DashboardNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Dashboard'>;

const habits = [
  { title: 'Meditation', meta: '15 mins', icon: 'self-improvement', done: true },
  { title: 'Hydration', meta: '1/2 Liters', icon: 'water-drop', active: true },
  { title: 'Reading', meta: '30 pages', icon: 'menu-book' },
] as const;

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

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const accessToken = useAppSelector(selectAccessToken);
  const profileStatus = useAppSelector(selectProfileStatus);

  useEffect(() => {
    if (accessToken && !user && profileStatus === 'idle') {
      dispatch(fetchProfile());
    }
  }, [accessToken, dispatch, profileStatus, user]);

  const displayName = user?.fullName ?? user?.name ?? 'HabitFlow user';
  const initials = getInitials(displayName);

  return (
    <Screen
      bottomOverlay={(
        <BottomNavBar
          activeTab="Today"
          onProfilePress={() => {
            dispatch(fetchProfile());
            navigation.navigate('Profile');
          }}
        />
      )}
    >
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
            <Text style={styles.pillText}>3/4 Habits</Text>
          </View>
          <View style={[styles.pill, styles.successPill]}>
            <Text style={[styles.pillText, styles.successText]}>12 Day Streak</Text>
          </View>
        </View>
      </GlassCard>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Daily Flow</Text>
        <TouchableOpacity activeOpacity={0.75} onPress={() => navigation.navigate('EmptyDashboard')}>
          <Text style={styles.sectionAction}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.habitRow}>
        {habits.map((habit) => (
          <HabitCard key={habit.title} {...habit} />
        ))}
      </View>

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
      <View style={styles.fabWrapper}>
        <GradientButton title="Add" icon="add" onPress={() => navigation.navigate('EmptyDashboard')} style={styles.fab} />
      </View>
    </Screen>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'H';
}

function ProgressRing({ progress }: { progress: number }) {
  const radiusValue = 38;
  const circumference = 2 * Math.PI * radiusValue;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={styles.progressWrap}>
      <Svg width={82} height={82} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r={radiusValue} fill="transparent" stroke={colors.surfaceContainerHighest} strokeWidth={8} />
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
  title,
  meta,
  icon,
  done = false,
  active = false,
}: {
  title: string;
  meta: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <GlassCard style={[styles.habitCard, done && styles.doneCard, active && styles.activeCard]}>
      <View style={styles.habitTop}>
        <View style={[styles.habitIcon, done && styles.doneIcon, active && styles.activeIcon]}>
          <MaterialIcons name={icon} size={18} color={done ? colors.tertiary : active ? colors.primary : colors.onSurfaceVariant} />
        </View>
        <View style={[styles.checkCircle, done && styles.checkedCircle]}>
          {done && <MaterialIcons name="check" size={14} color={colors.surfaceContainerLowest} />}
        </View>
      </View>
      <View>
        <Text style={styles.habitTitle}>{title}</Text>
        <Text style={[styles.habitMeta, active && styles.activeMeta]}>{meta}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
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
  habitRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.section,
  },
  habitCard: {
    flex: 1,
    minHeight: 132,
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
  },
  activeMeta: {
    color: colors.primary,
  },
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
  fabWrapper: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 96,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  bottomSpace: {
    height: 110,
  },
});
