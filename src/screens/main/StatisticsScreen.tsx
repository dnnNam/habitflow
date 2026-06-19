import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../../components/BottomNavBar';
import GlassCard from '../../components/GlassCard';
import Screen from '../../components/Screen';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchPeriodStatistics,
  fetchStatisticsOverview,
} from '../../features/statistics/statisticsSlice';
import {
  selectPeriodStatistics,
  selectStatisticsError,
  selectStatisticsOverview,
  selectStatisticsOverviewStatus,
  selectStatisticsPeriodStatus,
} from '../../features/statistics/statisticsSelector';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import type { DailyStatistic } from '../../types/statistics';

type StatisticsNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Statistics'>;

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getMonthRange(date = new Date()) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    from: first.toISOString().slice(0, 10),
    to: last.toISOString().slice(0, 10),
  };
}

function formatPercent(value?: number) {
  if (typeof value !== 'number') return '0%';
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
}

function formatNumber(value?: number) {
  return String(value ?? 0);
}

function dailyValue(day?: DailyStatistic) {
  const rate = day?.completionRate ?? day?.efficiency ?? 0;
  return rate <= 1 ? rate : rate / 100;
}

export default function StatisticsScreen() {
  const navigation = useNavigation<StatisticsNavigationProp>();
  const dispatch = useAppDispatch();
  const overview = useAppSelector(selectStatisticsOverview);
  const period = useAppSelector(selectPeriodStatistics);
  const overviewStatus = useAppSelector(selectStatisticsOverviewStatus);
  const periodStatus = useAppSelector(selectStatisticsPeriodStatus);
  const error = useAppSelector(selectStatisticsError);
  const isLoading = overviewStatus === 'loading' || periodStatus === 'loading';
  const hasFailed = overviewStatus === 'failed' || periodStatus === 'failed';

  useEffect(() => {
    const range = getMonthRange();
    dispatch(fetchStatisticsOverview({ period: 'month' }));
    dispatch(fetchPeriodStatistics(range));
  }, [dispatch]);

  const weekData = overview?.week ?? period?.days?.slice(-7) ?? [];
  const completionRate = period?.completionRate ?? overview?.overallEfficiency;

  const handleRetry = () => {
    const range = getMonthRange();
    dispatch(fetchStatisticsOverview({ period: 'month' }));
    dispatch(fetchPeriodStatistics(range));
  };

  return (
    <Screen
      bottomOverlay={(
        <BottomNavBar
          activeTab="Stats"
          onTodayPress={() => navigation.navigate('Dashboard')}
          onProfilePress={() => navigation.navigate('Profile')}
        />
      )}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.iconButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <MaterialIcons name="arrow-back" size={21} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.brand}>Statistics</Text>
        <TouchableOpacity activeOpacity={0.75} style={styles.iconButton} onPress={handleRetry}>
          <MaterialIcons name="refresh" size={21} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading && !overview && !period ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      ) : null}

      {hasFailed ? (
        <GlassCard style={styles.errorCard}>
          <MaterialIcons name="query-stats" size={34} color={colors.error} />
          <Text style={styles.errorTitle}>Could not load statistics</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.retryButton} onPress={handleRetry}>
            <MaterialIcons name="refresh" size={18} color={colors.white} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </GlassCard>
      ) : null}

      {!isLoading || overview || period ? (
        <>
          <GlassCard style={styles.heroCard}>
            <View>
              <Text style={styles.sectionLabel}>Overall Efficiency</Text>
              <Text style={styles.heroValue}>{formatPercent(completionRate)}</Text>
            </View>
            <ProgressRing progress={(completionRate ?? 0) <= 1 ? (completionRate ?? 0) : (completionRate ?? 0) / 100} />
          </GlassCard>

          <View style={styles.metricGrid}>
            <MetricCard
              icon="done-all"
              label="Completions"
              value={formatNumber(overview?.totalCompletions ?? period?.completedCount)}
              color={colors.tertiary}
            />
            <MetricCard
              icon="local-fire-department"
              label="Current Streak"
              value={formatNumber(overview?.currentStreak)}
              color={colors.primary}
            />
            <MetricCard
              icon="emoji-events"
              label="Best Streak"
              value={formatNumber(overview?.bestStreak ?? overview?.topStreak)}
              color={colors.secondary}
            />
            <MetricCard
              icon="event-busy"
              label="Missed"
              value={formatNumber(period?.missedCount)}
              color={colors.error}
            />
          </View>

          <GlassCard style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionLabel}>Weekly Flow</Text>
              <Text style={styles.rangeText}>
                {period?.from ?? getMonthRange().from} - {period?.to ?? getMonthRange().to}
              </Text>
            </View>
            <View style={styles.chart}>
              {WEEK_LABELS.map((label, index) => {
                const value = dailyValue(weekData[index]);
                return (
                  <View key={`${label}-${index}`} style={styles.barColumn}>
                    <View style={styles.barShell}>
                      <View style={[styles.barFill, { height: `${Math.max(value * 100, 5)}%` }]} />
                    </View>
                    <Text style={styles.dayLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>

          <GlassCard style={styles.breakdownCard}>
            <Text style={styles.sectionLabel}>Month Breakdown</Text>
            <BreakdownRow label="Completed" value={period?.completedCount} color={colors.tertiary} />
            <BreakdownRow label="Partial" value={period?.partialCount} color={colors.primary} />
            <BreakdownRow label="Skipped" value={period?.skippedCount} color={colors.secondary} />
            <BreakdownRow label="Missed" value={period?.missedCount} color={colors.error} />
          </GlassCard>
        </>
      ) : null}

      <View style={styles.bottomSpace} />
    </Screen>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <GlassCard style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}22` }]}>
        <MaterialIcons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </GlassCard>
  );
}

function BreakdownRow({ label, value, color }: { label: string; value?: number; color: string }) {
  return (
    <View style={styles.breakdownRow}>
      <View style={[styles.breakdownDot, { backgroundColor: color }]} />
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={styles.breakdownValue}>{formatNumber(value)}</Text>
    </View>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  return (
    <View style={styles.ringShell}>
      <Text style={styles.ringText}>{formatPercent(progress)}</Text>
    </View>
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
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },
  brand: {
    color: colors.primary,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.extrabold,
  },
  loadingBox: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.section,
  },
  loadingText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.body,
  },
  errorCard: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.section,
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
  },
  retryButton: {
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
    textTransform: 'uppercase',
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.section,
  },
  heroValue: {
    color: colors.onSurface,
    fontSize: fontSizes.display,
    fontWeight: fontWeights.extrabold,
    marginTop: spacing.sm,
    fontVariant: ['tabular-nums'],
  },
  ringShell: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 8,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },
  ringText: {
    color: colors.onSurface,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.section,
  },
  metricCard: {
    width: '47%',
    minHeight: 128,
    gap: spacing.sm,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    color: colors.onSurface,
    fontSize: fontSizes.title,
    fontWeight: fontWeights.extrabold,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  chartCard: {
    gap: spacing.lg,
    marginBottom: spacing.section,
  },
  chartHeader: {
    gap: spacing.xs,
  },
  rangeText: {
    color: colors.outline,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
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
    opacity: 0.9,
  },
  dayLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  breakdownCard: {
    gap: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownLabel: {
    flex: 1,
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  breakdownValue: {
    color: colors.onSurface,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  bottomSpace: {
    height: 110,
  },
});
