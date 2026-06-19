
// Quản lý check-in logs cho từng habit theo ngày.
// - fetchTodayLogs: load tất cả log của ngày hôm nay khi vào Dashboard
// - checkIn: POST /habit-logs/check-in
// - skip: POST /habit-logs/:habitId/skip

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../../app/store';
import { HabitLog } from '../../types/habitLog';
import { checkInHabit, CheckInPayload, getHabitLogs, skipHabit } from '../../services/habitLogsApi';

interface HabitLogsState {
  // Map habitId -> log của ngày hôm nay
  todayLogs: Record<string, HabitLog>;
  fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  fetchError: string | null;
  // Trạng thái mutation cho từng habitId (để show loading trên từng item)
  mutatingIds: Record<string, boolean>;
  mutationError: string | null;
}

const initialState: HabitLogsState = {
  todayLogs: {},
  fetchStatus: 'idle',
  fetchError: null,
  mutatingIds: {},
  mutationError: null,
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function extractError(e: unknown, fallback: string): string {
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  const msg = (e as any)?.response?.data?.message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.join(', ');
  return fallback;
}

// ── Thunks ─────────────────────────────────────────────────────────

export const fetchTodayLogs = createAsyncThunk<
  HabitLog[],
  void,
  { state: RootState; rejectValue: string }
>('habitLogs/fetchToday', async (_, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');
  try {
    const res = await getHabitLogs(accessToken, { date: todayISO() }, tokenType ?? 'Bearer');
    return res.data;
  } catch (e) {
    return rejectWithValue(extractError(e, 'Failed to load today logs.'));
  }
});

export const checkIn = createAsyncThunk<
  HabitLog,
  CheckInPayload,
  { state: RootState; rejectValue: string }
>('habitLogs/checkIn', async (payload, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');
  try {
    const res = await checkInHabit(accessToken, payload, tokenType ?? 'Bearer');
    return res.data;
  } catch (e) {
    return rejectWithValue(extractError(e, 'Check-in failed.'));
  }
});

export const skipToday = createAsyncThunk<
  HabitLog,
  { habitId: string },
  { state: RootState; rejectValue: string }
>('habitLogs/skip', async ({ habitId }, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');
  try {
    const res = await skipHabit(
      accessToken,
      habitId,
      { logDate: todayISO() },
      tokenType ?? 'Bearer',
    );
    return res.data;
  } catch (e) {
    return rejectWithValue(extractError(e, 'Skip failed.'));
  }
});

// ── Slice ───────────────────────────────────────────────────────────

const habitLogsSlice = createSlice({
  name: 'habitLogs',
  initialState,
  reducers: {
    clearMutationError(state) {
      state.mutationError = null;
    },
    resetHabitLogs: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchTodayLogs
      .addCase(fetchTodayLogs.pending, (state) => {
        state.fetchStatus = 'loading';
        state.fetchError = null;
      })
      .addCase(fetchTodayLogs.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        // Index by habitId for O(1) lookup
        const map: Record<string, HabitLog> = {};
        for (const log of action.payload) {
          map[log.habitId] = log;
        }
        state.todayLogs = map;
      })
      .addCase(fetchTodayLogs.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.fetchError = action.payload ?? 'Error.';
      })

      // checkIn
      .addCase(checkIn.pending, (state, action) => {
        state.mutatingIds[action.meta.arg.habitId] = true;
        state.mutationError = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        const log = action.payload;
        state.mutatingIds[log.habitId] = false;
        state.todayLogs[log.habitId] = log;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.mutatingIds[action.meta.arg.habitId] = false;
        state.mutationError = action.payload ?? 'Check-in failed.';
      })

      // skipToday
      .addCase(skipToday.pending, (state, action) => {
        state.mutatingIds[action.meta.arg.habitId] = true;
        state.mutationError = null;
      })
      .addCase(skipToday.fulfilled, (state, action) => {
        const log = action.payload;
        state.mutatingIds[log.habitId] = false;
        state.todayLogs[log.habitId] = log;
      })
      .addCase(skipToday.rejected, (state, action) => {
        state.mutatingIds[action.meta.arg.habitId] = false;
        state.mutationError = action.payload ?? 'Skip failed.';
      });
  },
});

export const { clearMutationError, resetHabitLogs } = habitLogsSlice.actions;
export default habitLogsSlice.reducer;