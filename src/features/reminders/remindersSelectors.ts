import { RootState } from "../../app/store";
import { Reminder } from "../../types/reminder";

 
const EMPTY: Reminder[] = [];
 
export const selectRemindersForHabit = (habitId: string) => (state: RootState): Reminder[] =>
  state.reminders.byHabitId[habitId]?.items ?? EMPTY;
 
export const selectRemindersStatusForHabit = (habitId: string) => (state: RootState) =>
  state.reminders.byHabitId[habitId]?.status ?? 'idle';
 
export const selectRemindersErrorForHabit = (habitId: string) => (state: RootState) =>
  state.reminders.byHabitId[habitId]?.error ?? null;
 
export const selectRemindersMutationStatus = (state: RootState) => state.reminders.mutationStatus;
export const selectRemindersMutationError = (state: RootState) => state.reminders.mutationError;