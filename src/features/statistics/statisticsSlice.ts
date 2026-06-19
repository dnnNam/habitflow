import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getHabitStatistics,
  getPeriodStatistics,
  getStatisticsOverview,
} from '../../services/statisticsApi';
import type {
  StatisticsOverviewParams,
  StatisticsPeriodParams,
} from '../../services/statisticsApi';
import type {
  HabitStatistics,
  PeriodStatistics,
  StatisticsOverview,
} from '../../types/statistics';
import type { RootState } from '../../state/store';

interface StatisticsState {
  overview: StatisticsOverview | null;
  period: PeriodStatistics | null;
  habitDetails: Record<string, HabitStatistics>;
  overviewStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  periodStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  habitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: StatisticsState = {
  overview: null,
  period: null,
  habitDetails: {},
  overviewStatus: 'idle',
  periodStatus: 'idle',
  habitStatus: 'idle',
  error: null,
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getMonthRange(date = new Date()): StatisticsPeriodParams {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    from: first.toISOString().slice(0, 10),
    to: last.toISOString().slice(0, 10),
  };
}

export const fetchStatisticsOverview = createAsyncThunk<
  StatisticsOverview,
  StatisticsOverviewParams | undefined,
  { state: RootState; rejectValue: string }
>('statistics/fetchOverview', async (params, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');

  try {
    const response = await getStatisticsOverview(accessToken, tokenType ?? 'Bearer', params);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to load statistics overview.'));
  }
});

export const fetchPeriodStatistics = createAsyncThunk<
  PeriodStatistics,
  StatisticsPeriodParams | undefined,
  { state: RootState; rejectValue: string }
>('statistics/fetchPeriod', async (params, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');

  try {
    const response = await getPeriodStatistics(
      accessToken,
      params ?? getMonthRange(),
      tokenType ?? 'Bearer',
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to load period statistics.'));
  }
});

export const fetchHabitStatistics = createAsyncThunk<
  HabitStatistics,
  { habitId: string; params?: Partial<StatisticsPeriodParams> },
  { state: RootState; rejectValue: string }
>('statistics/fetchHabit', async ({ habitId, params }, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');

  try {
    const response = await getHabitStatistics(accessToken, habitId, params, tokenType ?? 'Bearer');
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to load habit statistics.'));
  }
});

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    resetStatistics: () => initialState,
    clearStatisticsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatisticsOverview.pending, (state) => {
        state.overviewStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchStatisticsOverview.fulfilled, (state, action) => {
        state.overviewStatus = 'succeeded';
        state.overview = action.payload;
      })
      .addCase(fetchStatisticsOverview.rejected, (state, action) => {
        state.overviewStatus = 'failed';
        state.error = action.payload ?? 'Something went wrong.';
      })
      .addCase(fetchPeriodStatistics.pending, (state) => {
        state.periodStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchPeriodStatistics.fulfilled, (state, action) => {
        state.periodStatus = 'succeeded';
        state.period = action.payload;
      })
      .addCase(fetchPeriodStatistics.rejected, (state, action) => {
        state.periodStatus = 'failed';
        state.error = action.payload ?? 'Something went wrong.';
      })
      .addCase(fetchHabitStatistics.pending, (state) => {
        state.habitStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchHabitStatistics.fulfilled, (state, action) => {
        state.habitStatus = 'succeeded';
        state.habitDetails[action.payload.habitId] = action.payload;
      })
      .addCase(fetchHabitStatistics.rejected, (state, action) => {
        state.habitStatus = 'failed';
        state.error = action.payload ?? 'Something went wrong.';
      });
  },
});

export const { resetStatistics, clearStatisticsError } = statisticsSlice.actions;
export default statisticsSlice.reducer;
