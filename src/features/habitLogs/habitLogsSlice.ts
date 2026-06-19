import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  checkInHabit,
  getHabitLogs,
  processMissedHabitLogs,
  skipHabit,
  updateHabitLog,
} from '../../services/habitLogsApi';
import type {
  CheckInHabitPayload,
  GetHabitLogsParams,
  ProcessMissedPayload,
  SkipHabitPayload,
  UpdateHabitLogPayload,
} from '../../services/habitLogsApi';
import type { HabitLog } from '../../types/habitLog';
import type { RootState } from '../../state/store';

interface HabitLogsState {
  items: HabitLog[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  mutationStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  mutationError: string | null;
}

const initialState: HabitLogsState = {
  items: [],
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
  mutationError: null,
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function upsertLog(items: HabitLog[], log: HabitLog) {
  const existingIndex = items.findIndex((item) => item.id === log.id);
  if (existingIndex >= 0) {
    items[existingIndex] = log;
    return;
  }
  items.unshift(log);
}

export const fetchHabitLogs = createAsyncThunk<
  HabitLog[],
  GetHabitLogsParams | undefined,
  { state: RootState; rejectValue: string }
>('habitLogs/fetchAll', async (params, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');

  try {
    const response = await getHabitLogs(accessToken, tokenType ?? 'Bearer', params);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to load habit logs.'));
  }
});

export const submitHabitCheckIn = createAsyncThunk<
  HabitLog,
  CheckInHabitPayload,
  { state: RootState; rejectValue: string }
>('habitLogs/checkIn', async (payload, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');

  try {
    const response = await checkInHabit(accessToken, payload, tokenType ?? 'Bearer');
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to check in habit.'));
  }
});

export const submitHabitSkip = createAsyncThunk<
  HabitLog,
  { habitId: string; payload: SkipHabitPayload },
  { state: RootState; rejectValue: string }
>('habitLogs/skip', async ({ habitId, payload }, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');

  try {
    const response = await skipHabit(accessToken, habitId, payload, tokenType ?? 'Bearer');
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to skip habit.'));
  }
});

export const submitHabitLogUpdate = createAsyncThunk<
  HabitLog,
  { logId: string; payload: UpdateHabitLogPayload },
  { state: RootState; rejectValue: string }
>('habitLogs/update', async ({ logId, payload }, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');

  try {
    const response = await updateHabitLog(accessToken, logId, payload, tokenType ?? 'Bearer');
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to update habit log.'));
  }
});

export const submitProcessMissedHabitLogs = createAsyncThunk<
  void,
  ProcessMissedPayload | undefined,
  { state: RootState; rejectValue: string }
>('habitLogs/processMissed', async (payload, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');

  try {
    await processMissedHabitLogs(accessToken, payload ?? {}, tokenType ?? 'Bearer');
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to process missed logs.'));
  }
});

const habitLogsSlice = createSlice({
  name: 'habitLogs',
  initialState,
  reducers: {
    resetHabitLogs: () => initialState,
    clearHabitLogsError(state) {
      state.error = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabitLogs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchHabitLogs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchHabitLogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Something went wrong.';
      });

    builder
      .addCase(submitHabitCheckIn.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(submitHabitCheckIn.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        upsertLog(state.items, action.payload);
      })
      .addCase(submitHabitCheckIn.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload ?? 'Something went wrong.';
      })
      .addCase(submitHabitSkip.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(submitHabitSkip.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        upsertLog(state.items, action.payload);
      })
      .addCase(submitHabitSkip.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload ?? 'Something went wrong.';
      })
      .addCase(submitHabitLogUpdate.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(submitHabitLogUpdate.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        upsertLog(state.items, action.payload);
      })
      .addCase(submitHabitLogUpdate.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload ?? 'Something went wrong.';
      })
      .addCase(submitProcessMissedHabitLogs.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload ?? 'Something went wrong.';
      });
  },
});

export const { resetHabitLogs, clearHabitLogsError } = habitLogsSlice.actions;
export default habitLogsSlice.reducer;
