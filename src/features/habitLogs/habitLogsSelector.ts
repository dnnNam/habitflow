import type { RootState } from '../../app/store';

export const selectHabitLogs = (state: RootState) => state.habitLogs.items;
export const selectHabitLogsStatus = (state: RootState) => state.habitLogs.status;
export const selectHabitLogsError = (state: RootState) => state.habitLogs.error;
export const selectHabitLogsMutationStatus = (state: RootState) => state.habitLogs.mutationStatus;
export const selectHabitLogsMutationError = (state: RootState) => state.habitLogs.mutationError;

export const selectTodayHabitLogByHabitId = (state: RootState, habitId: string, date: string) =>
  state.habitLogs.items.find((log) => log.habitId === habitId && log.logDate === date);
