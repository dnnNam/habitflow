// src/features/createHabit/createHabitSelectors.ts

import type { RootState } from '../../app/store';

export const selectCreateHabitStep = (state: RootState) => state.createHabit.step;
export const selectHabitDraft = (state: RootState) => state.createHabit.draft;
export const selectCreateCategoryStatus = (state: RootState) => state.createHabit.createCategoryStatus;
export const selectCreateCategoryError = (state: RootState) => state.createHabit.createCategoryError;
export const selectCreateHabitStatus = (state: RootState) => state.createHabit.createHabitStatus;
export const selectCreateHabitError = (state: RootState) => state.createHabit.createHabitError;
export const selectCreatedHabit = (state: RootState) => state.createHabit.createdHabit;