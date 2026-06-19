import type { RootState } from '../../state/store';
import type { HabitLog } from '../../types/habitLog';

export const selectHabitLogs = (state: RootState) => Object.values(state.habitLogs.todayLogs);
export const selectHabitLogsStatus = (state: RootState) => state.habitLogs.fetchStatus;
export const selectHabitLogsError = (state: RootState) => state.habitLogs.fetchError;
export const selectHabitLogsMutationStatus = (state: RootState) =>
  Object.values(state.habitLogs.mutatingIds).some(Boolean) ? 'loading' : 'idle';
export const selectHabitLogsMutationError = (state: RootState) => state.habitLogs.mutationError;

export const selectTodayHabitLogByHabitId = (state: RootState, habitId: string, date: string) =>
  Object.values(state.habitLogs.todayLogs).find(
    (log: HabitLog) => log.habitId === habitId && log.logDate === date,
  );
