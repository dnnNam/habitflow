import type { RootState } from '../../app/store';

export const selectStatisticsOverview = (state: RootState) => state.statistics.overview;
export const selectPeriodStatistics = (state: RootState) => state.statistics.period;
export const selectStatisticsOverviewStatus = (state: RootState) => state.statistics.overviewStatus;
export const selectStatisticsPeriodStatus = (state: RootState) => state.statistics.periodStatus;
export const selectStatisticsError = (state: RootState) => state.statistics.error;
export const selectHabitStatisticsByHabitId = (state: RootState, habitId: string) =>
  state.statistics.habitDetails[habitId];
