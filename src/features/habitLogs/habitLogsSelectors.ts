

import type { RootState } from '../../app/store';

export const selectTodayLogs = (state: RootState) => state.habitLogs.todayLogs;

export const selectTodayLogForHabit = (habitId: string) => (state: RootState) =>
  state.habitLogs.todayLogs[habitId] ?? null;

export const selectHabitLogsFetchStatus = (state: RootState) => state.habitLogs.fetchStatus;

export const selectIsHabitMutating = (habitId: string) => (state: RootState) =>
  state.habitLogs.mutatingIds[habitId] ?? false;

export const selectHabitLogsMutationError = (state: RootState) => state.habitLogs.mutationError;