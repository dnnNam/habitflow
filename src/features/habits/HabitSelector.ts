// src/features/habits/habitsSelector.ts

import type { RootState } from '../../app/store';

export const selectHabits = (state: RootState) => state.habits.items;
export const selectHabitsStatus = (state: RootState) => state.habits.status;
export const selectHabitsError = (state: RootState) => state.habits.error;
export const selectHabitsStatusUpdateId = (state: RootState) => state.habits.statusUpdateId;
export const selectHabitsStatusUpdateError = (state: RootState) => state.habits.statusUpdateError;