// src/app/store.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import habitsReducer from '../features/habits/habitsSlice';
import createHabitReducer from '../features/createHabit/createHabitSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    habits: habitsReducer,
    createHabit: createHabitReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;