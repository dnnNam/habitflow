// src/state/store.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import habitsReducer from '../features/habits/habitsSlice';
import createHabitReducer from '../features/createHabit/createHabitSlice';
import habitLogsReducer from '../features/habitLogs/habitLogsSlice';
import statisticsReducer from '../features/statistics/statisticsSlice';
import remindersReducer from '../features/reminders/remindersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    habits: habitsReducer,
    createHabit: createHabitReducer,
    habitLogs: habitLogsReducer,
    statistics: statisticsReducer,
    reminders: remindersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
