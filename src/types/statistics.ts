export type StatisticsPeriod = 'week' | 'month' | 'year';

export interface DailyStatistic {
  date: string;
  completedCount?: number;
  partialCount?: number;
  missedCount?: number;
  skippedCount?: number;
  completionRate?: number;
  efficiency?: number;
}

export interface StatisticsOverview {
  overallEfficiency?: number;
  totalCompletions?: number;
  topStreak?: number;
  bestStreak?: number;
  currentStreak?: number;
  weekCompletionRate?: number;
  week?: DailyStatistic[];
}

export interface PeriodStatistics {
  from: string;
  to: string;
  completionRate?: number;
  completedCount?: number;
  partialCount?: number;
  missedCount?: number;
  skippedCount?: number;
  totalLogs?: number;
  days?: DailyStatistic[];
}

export interface HabitStatistics {
  habitId: string;
  completionRate?: number;
  completedCount?: number;
  partialCount?: number;
  missedCount?: number;
  skippedCount?: number;
  currentStreak?: number;
  averageProgress?: number;
  days?: DailyStatistic[];
}
