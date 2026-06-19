import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../../components/BottomNavBar';
import GlassCard from '../../components/GlassCard';
import Screen from '../../components/Screen';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
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
type StatsTab = 'Overview' | 'Insights' | 'Heatmap' | 'Focus';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TABS: StatsTab[] = ['Overview', 'Insights', 'Heatmap', 'Focus'];

function getMonthRange(date = new Date()) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    from: first.toISOString().slice(0, 10),
    to: last.toISOString().slice(0, 10),
  };
}

function normalizeRate(value?: number) {
  if (typeof value !== 'number') return 0;
  return Math.max(0, Math.min(value <= 1 ? value : value / 100, 1));
}

function formatPercent(value?: number) {
  return `${Math.round(normalizeRate(value) * 100)}%`;
}

function formatNumber(value?: number) {
  return String(value ?? 0);
}

function dailyValue(day?: DailyStatistic) {
  return normalizeRate(day?.completionRate ?? day?.efficiency);
}

function formatHours(hours: number) {
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  return `${whole}h ${minutes}m`;
}

export default function StatisticsScreen() {
  const navigation = useNavigation<StatisticsNavigationProp>();
  const dispatch = useAppDispatch();
  const overview = useAppSelector(selectStatisticsOverview);
  const period = useAppSelector(selectPeriodStatistics);
  const overviewStatus = useAppSelector(selectStatisticsOverviewStatus);
  const periodStatus = useAppSelector(selectStatisticsPeriodStatus);
  const error = useAppSelector(selectStatisticsError);
  const [activeTab, setActiveTab] = useState<StatsTab>('Overview');

  const isLoading = overviewStatus === 'loading' || periodStatus === 'loading';
  const hasFailed = overviewStatus === 'failed' || periodStatus === 'failed';
  const range = useMemo(() => getMonthRange(), []);

  useEffect(() => {
    dispatch(fetchStatisticsOverview({ period: 'month' }));
    dispatch(fetchPeriodStatistics(range));
  }, [dispatch, range]);

  const weekData = overview?.week ?? period?.days?.slice(-7) ?? [];
  const completionRate = period?.completionRate ?? overview?.overallEfficiency;
  const completed = overview?.totalCompletions ?? period?.completedCount ?? 0;
  const bestStreak = overview?.bestStreak ?? overview?.topStreak ?? 0;
  const currentStreak = overview?.currentStreak ?? 0;
  const focusHours = Math.max(1.5, Math.round((completed / 3) * 10) / 10);

  const handleRetry = () => {
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
        <Text style={styles.brand}>HabitFlow</Text>
        <TouchableOpacity activeOpacity={0.75} style={styles.iconButton} onPress={handleRetry}>
          <MaterialIcons name="refresh" size={21} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScroller}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.78}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
          {activeTab === 'Overview' ? (
            <OverviewTab
              completionRate={completionRate}
              weekData={weekData}
              bestStreak={bestStreak}
              currentStreak={currentStreak}
              completed={completed}
              focusHours={focusHours}
            />
          ) : null}
          {activeTab === 'Insights' ? (
            <InsightsTab
              completionRate={completionRate}
              bestStreak={bestStreak}
              completed={completed}
              missed={period?.missedCount}
            />
          ) : null}
          {activeTab === 'Heatmap' ? (
            <HeatmapTab periodDays={period?.days ?? []} completed={completed} completionRate={completionRate} />
          ) : null}
          {activeTab === 'Focus' ? (
            <FocusTab focusHours={focusHours} completionRate={completionRate} />
          ) : null}
        </>
      ) : null}

      <View style={styles.bottomSpace} />
    </Screen>
  );
}

function OverviewTab({
  completionRate,
  weekData,
  bestStreak,
  currentStreak,
  completed,
  focusHours,
}: {
  completionRate?: number;
  weekData: DailyStatistic[];
  bestStreak: number;
  currentStreak: number;
  completed: number;
  focusHours: number;
}) {
  return (
    <>
      <GlassCard style={styles.efficiencyCard}>
        <Text style={styles.sectionLabel}>Overall Efficiency</Text>
        <ProgressRing progress={normalizeRate(completionRate)} size={190} strokeWidth={10} />
      </GlassCard>

      <GlassCard style={styles.consistencyCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionLabel}>Consistency</Text>
          <MaterialIcons name="show-chart" size={20} color={colors.primary} />
        </View>
        <View style={styles.chart}>
          {WEEK_LABELS.map((label, index) => {
            const value = dailyValue(weekData[index]);
            return (
              <View key={`${label}-${index}`} style={styles.barColumn}>
                <View style={styles.barShell}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${Math.max(value * 100, 8)}%` },
                      index === WEEK_LABELS.length - 1 && styles.activeBar,
                    ]}
                  />
                </View>
                <Text style={[styles.dayLabel, index === WEEK_LABELS.length - 1 && styles.activeDay]}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </GlassCard>

      <View style={styles.metricGrid}>
        <MetricTile
          icon="local-fire-department"
          label="Best Streak"
          value={formatNumber(bestStreak || currentStreak)}
          color={colors.tertiary}
        />
        <MetricTile
          icon="timer"
          label="Focus Hours"
          value={focusHours.toFixed(1)}
          color={colors.secondary}
        />
      </View>

      <GlassCard style={styles.totalCard}>
        <View>
          <Text style={styles.metricLabel}>Total Completions</Text>
          <View style={styles.totalValueRow}>
            <Text style={styles.totalValue}>{formatNumber(completed)}</Text>
            <Text style={styles.totalCaption}>All Time</Text>
          </View>
        </View>
        <View style={styles.totalIcon}>
          <MaterialIcons name="task-alt" size={24} color={colors.primary} />
        </View>
      </GlassCard>
    </>
  );
}

function InsightsTab({
  completionRate,
  bestStreak,
  completed,
  missed,
}: {
  completionRate?: number;
  bestStreak: number;
  completed: number;
  missed?: number;
}) {
  const rate = normalizeRate(completionRate);
  const trendCopy = rate >= 0.75 ? 'Your month is running hot. Keep the same schedule.' : 'Your rhythm needs a lighter recovery block.';

  return (
    <>
      <View style={styles.insightHero}>
        <View style={styles.aiBadge}>
          <MaterialIcons name="auto-awesome" size={22} color={colors.primary} />
        </View>
        <Text style={styles.insightTitle}>AI Productivity Insights</Text>
        <Text style={styles.insightSubtitle}>{trendCopy}</Text>
      </View>

      <InsightCard
        icon="bolt"
        title="Deep Work Window"
        body="Schedule your most important habit before noon. This is where your consistency looks strongest."
        stat={formatPercent(completionRate)}
        color={colors.primary}
      />
      <InsightCard
        icon="warning-amber"
        title="Consistency Alert"
        body={`${missed ?? 0} missed logs this period. Add a smaller backup version for busy days.`}
        stat={`${missed ?? 0}`}
        color={colors.error}
      />
      <InsightCard
        icon="hub"
        title="Correlation"
        body="Completion volume and streak length are moving together. Protect the streak with quick wins."
        stat={`${bestStreak || completed}`}
        color={colors.tertiary}
      />
    </>
  );
}

function HeatmapTab({
  periodDays,
  completed,
  completionRate,
}: {
  periodDays: DailyStatistic[];
  completed: number;
  completionRate?: number;
}) {
  const heatmapDays = useMemo(() => {
    const source = periodDays.length ? periodDays : Array.from({ length: 35 });
    return source.slice(-35).map((day, index) => dailyValue(day as DailyStatistic) || ((index % 5) + 1) / 8);
  }, [periodDays]);

  return (
    <>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Monthly Activity</Text>
        <Text style={styles.pageSubtitle}>A compact view of your habit density.</Text>
      </View>

      <GlassCard style={styles.heatmapCard}>
        <View style={styles.heatmapGrid}>
          {heatmapDays.map((value, index) => (
            <View
              key={`${index}-${value}`}
              style={[
                styles.heatmapCell,
                {
                  backgroundColor: value > 0.75
                    ? colors.primary
                    : value > 0.5
                      ? colors.tertiary
                      : value > 0.25
                        ? colors.surfaceBright
                        : colors.surfaceContainerHigh,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.heatmapLegend}>
          <Text style={styles.legendText}>Less</Text>
          <View style={[styles.legendDot, { backgroundColor: colors.surfaceContainerHigh }]} />
          <View style={[styles.legendDot, { backgroundColor: colors.surfaceBright }]} />
          <View style={[styles.legendDot, { backgroundColor: colors.tertiary }]} />
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>More</Text>
        </View>
      </GlassCard>

      <View style={styles.metricGrid}>
        <MetricTile icon="check-circle" label="Completed" value={formatNumber(completed)} color={colors.tertiary} />
        <MetricTile icon="query-stats" label="Efficiency" value={formatPercent(completionRate)} color={colors.primary} />
      </View>

      <TopHabitRow title="Morning Meditation" subtitle="Mindfulness" progress={0.9} color={colors.primary} />
      <TopHabitRow title="Deep Work Block" subtitle="Focus" progress={0.8} color={colors.tertiary} />
      <TopHabitRow title="Read 20 Pages" subtitle="Learning" progress={0.65} color={colors.secondary} />
    </>
  );
}

function FocusTab({ focusHours, completionRate }: { focusHours: number; completionRate?: number }) {
  return (
    <>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Focus Analytics</Text>
        <Text style={styles.pageSubtitle}>Your deep work distribution today.</Text>
      </View>

      <GlassCard style={styles.focusCard}>
        <View style={styles.ringBackdropOuter} />
        <View style={styles.ringBackdropMiddle} />
        <RadialFocusRing progress={normalizeRate(completionRate) || 0.64} />
        <Text style={styles.focusValue}>{formatHours(focusHours)}</Text>
        <Text style={styles.focusLabel}>Total Focus</Text>
        <View style={styles.legendRow}>
          <LegendItem color={colors.primary} label="Deep Work" />
          <LegendItem color={colors.secondary} label="Shallow" />
        </View>
      </GlassCard>

      <Text style={styles.sectionLabel}>Peak Performance</Text>
      <GlassCard style={styles.peakCard}>
        <View style={styles.peakIcon}>
          <MaterialIcons name="bolt" size={24} color={colors.primary} />
        </View>
        <View style={styles.peakBody}>
          <Text style={styles.peakTitle}>Morning Sprint</Text>
          <Text style={styles.peakTime}>09:00 - 11:30</Text>
        </View>
        <View style={styles.peakScore}>
          <Text style={styles.metricLabel}>Efficiency</Text>
          <Text style={styles.peakPercent}>{formatPercent(completionRate)}</Text>
        </View>
      </GlassCard>
    </>
  );
}

function MetricTile({
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
    <GlassCard style={styles.metricTile}>
      <MaterialIcons name={icon} size={24} color={color} />
      <View style={styles.metricBottom}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    </GlassCard>
  );
}

function InsightCard({
  icon,
  title,
  body,
  stat,
  color,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  body: string;
  stat: string;
  color: string;
}) {
  return (
    <GlassCard style={styles.insightCard}>
      <View style={[styles.insightIcon, { backgroundColor: `${color}22` }]}>
        <MaterialIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.insightBody}>
        <Text style={styles.insightCardTitle}>{title}</Text>
        <Text style={styles.insightCardBody}>{body}</Text>
      </View>
      <Text style={[styles.insightStat, { color }]}>{stat}</Text>
    </GlassCard>
  );
}

function TopHabitRow({
  title,
  subtitle,
  progress,
  color,
}: {
  title: string;
  subtitle: string;
  progress: number;
  color: string;
}) {
  return (
    <GlassCard style={styles.habitRow}>
      <MiniRing progress={progress} color={color} />
      <View style={styles.habitBody}>
        <Text style={styles.habitTitle}>{title}</Text>
        <Text style={styles.habitSubtitle}>{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
    </GlassCard>
  );
}

function ProgressRing({ progress, size, strokeWidth }: { progress: number; size: number; strokeWidth: number }) {
  const radiusValue = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={[styles.progressWrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="statsProgress" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.primary} />
            <Stop offset="1" stopColor={colors.secondary} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          fill="transparent"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          fill="transparent"
          stroke="url(#statsProgress)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.progressCenter}>
        <Text style={styles.progressValue}>{formatPercent(progress)}</Text>
        <Text style={styles.progressTrend}>
          <MaterialIcons name="trending-up" size={13} color={colors.tertiary} /> +5%
        </Text>
      </View>
    </View>
  );
}

function MiniRing({ progress, color }: { progress: number; color: string }) {
  const size = 48;
  const strokeWidth = 4;
  const radiusValue = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusValue;

  return (
    <View style={styles.miniRing}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          fill="transparent"
          stroke={colors.surfaceContainerHighest}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[styles.miniRingText, { color }]}>{Math.round(progress * 100)}%</Text>
    </View>
  );
}

function RadialFocusRing({ progress }: { progress: number }) {
  const size = 216;
  const radiusValue = 82;
  const circumference = 2 * Math.PI * radiusValue;

  return (
    <View style={styles.focusRingWrap}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="focusPrimary" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.primary} />
            <Stop offset="1" stopColor={colors.secondary} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          fill="transparent"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={16}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          fill="transparent"
          stroke="url(#focusPrimary)"
          strokeWidth={16}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={60}
          fill="transparent"
          stroke={colors.secondaryContainer}
          strokeWidth={10}
          strokeDasharray={377}
          strokeDashoffset={220}
          strokeLinecap="round"
          rotation="60"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDotLarge, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
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
  tabScroller: {
    gap: spacing.sm,
    padding: 4,
    marginBottom: spacing.section,
    backgroundColor: 'rgba(11,19,38,0.7)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabButton: {
    minWidth: 92,
    minHeight: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(208,188,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.32)',
  },
  tabText: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  tabTextActive: {
    color: colors.primary,
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
  efficiencyCard: {
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.section,
  },
  progressWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    color: colors.onSurface,
    fontSize: fontSizes.display,
    fontWeight: fontWeights.extrabold,
    fontVariant: ['tabular-nums'],
  },
  progressTrend: {
    color: colors.tertiary,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
    marginTop: spacing.xs,
  },
  consistencyCard: {
    gap: spacing.lg,
    marginBottom: spacing.section,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: 'rgba(208,188,255,0.48)',
  },
  activeBar: {
    backgroundColor: colors.primary,
  },
  dayLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  activeDay: {
    color: colors.primary,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.section,
  },
  metricTile: {
    flex: 1,
    minHeight: 132,
    justifyContent: 'space-between',
  },
  metricBottom: {
    gap: spacing.xs,
  },
  metricValue: {
    color: colors.onSurface,
    fontSize: 22,
    fontWeight: fontWeights.extrabold,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  totalCard: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.section,
  },
  totalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  totalValue: {
    color: colors.onSurface,
    fontSize: 24,
    fontWeight: fontWeights.extrabold,
    fontVariant: ['tabular-nums'],
  },
  totalCaption: {
    color: colors.tertiary,
    fontSize: 10,
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
  },
  totalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(208,188,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.22)',
  },
  insightHero: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.section,
  },
  aiBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.28)',
  },
  insightTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.headline,
    fontWeight: fontWeights.extrabold,
    textAlign: 'center',
  },
  insightSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.body,
    lineHeight: 23,
    textAlign: 'center',
  },
  insightCard: {
    minHeight: 118,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBody: {
    flex: 1,
    gap: spacing.xs,
  },
  insightCardTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  insightCardBody: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    lineHeight: 18,
  },
  insightStat: {
    fontSize: 18,
    fontWeight: fontWeights.extrabold,
    fontVariant: ['tabular-nums'],
  },
  pageIntro: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.section,
  },
  pageTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.headline,
    fontWeight: fontWeights.extrabold,
    textAlign: 'center',
  },
  pageSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.body,
    textAlign: 'center',
  },
  heatmapCard: {
    gap: spacing.lg,
    marginBottom: spacing.section,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  heatmapCell: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  legendText: {
    color: colors.outline,
    fontSize: 10,
    fontWeight: fontWeights.semibold,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  habitRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  habitBody: {
    flex: 1,
    gap: spacing.xs,
  },
  habitTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  habitSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  miniRing: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniRingText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  focusCard: {
    minHeight: 330,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.section,
  },
  ringBackdropOuter: {
    position: 'absolute',
    width: 198,
    height: 198,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  ringBackdropMiddle: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  focusRingWrap: {
    width: 216,
    height: 216,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusValue: {
    position: 'absolute',
    top: 142,
    color: colors.onSurface,
    fontSize: 22,
    fontWeight: fontWeights.extrabold,
    fontVariant: ['tabular-nums'],
  },
  focusLabel: {
    position: 'absolute',
    top: 171,
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    color: colors.onSurfaceVariant,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  peakCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  peakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  peakBody: {
    flex: 1,
    gap: spacing.xs,
  },
  peakTitle: {
    color: colors.onSurface,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  peakTime: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: fontWeights.extrabold,
    fontVariant: ['tabular-nums'],
  },
  peakScore: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  peakPercent: {
    color: colors.tertiary,
    fontSize: 20,
    fontWeight: fontWeights.extrabold,
    fontVariant: ['tabular-nums'],
  },
  bottomSpace: {
    height: 110,
  },
});
