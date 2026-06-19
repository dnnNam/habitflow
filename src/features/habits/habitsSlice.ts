// src/features/habits/habitsSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getHabits, updateHabitStatus } from '../../services/habitsApi';
import type { GetHabitsParams } from '../../services/habitsApi';
import type { Habit, HabitStatus } from '../../types/habit';
import type { RootState } from '../../app/store';

interface HabitsState {
  items: Habit[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  // trạng thái riêng cho action đổi status (active/paused/archived) để show loading trên từng item
  statusUpdateId: string | null;
  statusUpdateError: string | null;
}

const initialState: HabitsState = {
  items: [],
  status: 'idle',
  error: null,
  statusUpdateId: null,
  statusUpdateError: null,
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

// PATCH /habits/:id/status — đổi active | paused | archived
export const changeHabitStatus = createAsyncThunk<
  Habit,
  { habitId: string; status: HabitStatus },
  { state: RootState; rejectValue: string }
>(
  'habits/changeStatus',
  async ({ habitId, status }, { getState, rejectWithValue }) => {
    const { accessToken, tokenType } = getState().auth;
    if (!accessToken) return rejectWithValue('Not authenticated.');
    try {
      const response = await updateHabitStatus(accessToken, habitId, { status }, tokenType ?? 'Bearer');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update habit status.',
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
    clearStatusUpdateError(state) {
      state.statusUpdateError = null;
    },
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
      })

      // changeHabitStatus
      .addCase(changeHabitStatus.pending, (state, action) => {
        state.statusUpdateId = action.meta.arg.habitId;
        state.statusUpdateError = null;
      })
      .addCase(changeHabitStatus.fulfilled, (state, action) => {
        state.statusUpdateId = null;
        const updated = action.payload;
        state.items = state.items.map((h) => (h.id === updated.id ? updated : h));
      })
      .addCase(changeHabitStatus.rejected, (state, action) => {
        state.statusUpdateId = null;
        state.statusUpdateError = action.payload ?? 'Failed to update habit status.';
      });
  },
});

export const { resetHabits, clearStatusUpdateError } = habitsSlice.actions;
export default habitsSlice.reducer;