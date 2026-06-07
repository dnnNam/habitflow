import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import habitsReducer from '../features/habits/habitsSlice';
 
export const store = configureStore({
  reducer: {
    auth: authReducer,
    habits: habitsReducer,
  },
});
 
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;