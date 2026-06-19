// src/app/store.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import habitsReducer from '../features/habits/habitsSlice';
import createHabitReducer from '../features/createHabit/createHabitSlice';
import remindersReducer from '../features/reminders/remindersSlice';
import habitLogsReducer from '../features/habitLogs/habitLogsSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    habits: habitsReducer,
    createHabit: createHabitReducer,
    reminders: remindersReducer,
    habitLogs: habitLogsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;