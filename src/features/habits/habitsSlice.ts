// src/features/habits/habitsSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getHabits } from '../../services/habitsApi';
import type { GetHabitsParams } from '../../services/habitsApi';
import type { Habit } from '../../types/habit';

interface HabitsState {
  items: Habit[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: HabitsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchHabits = createAsyncThunk<
  Habit[],
  { accessToken: string; tokenType?: string; params?: GetHabitsParams },
  { rejectValue: string }
>(
  'habits/fetchAll',
  async ({ accessToken, tokenType = 'Bearer', params }, { rejectWithValue }) => {
    try {
      const response = await getHabits(accessToken, tokenType, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load habits.',
      );
    }
  },
);

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    // Gọi khi logout để reset về trạng thái ban đầu
    resetHabits: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabits.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Something went wrong.';
      });
  },
});

export const { resetHabits } = habitsSlice.actions;
export default habitsSlice.reducer;