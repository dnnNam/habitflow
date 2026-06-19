// src/features/createHabit/createHabitSlice.ts
//
// Flow mới:
// Step 1 (name_category): User nhập tên, chọn goal type, chọn default category (local)
//   → Lưu selectedCategoryKey + metadata vào draft, categoryId = undefined
// Step 1 → custom_category: Nếu user muốn tạo category riêng
//   → Gọi submitCreateCategory → API trả về category.id → set draft.categoryId → step='schedule'
// Step 1 → schedule: Nếu dùng default category
//   → ScheduleScreen gọi submitCreateHabit
//   → Trong thunk: nếu categoryId undefined nhưng có selectedCategoryKey,
//     thì gọi createCategory trước, lấy id, rồi mới gọi createHabit
// Step 3 (schedule): Chọn lịch → gọi submitCreateHabit → step='success'

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { createCategory, CreateCategoryPayload } from '../../services/categoriesApi';
import { createHabit, CreateHabitPayload } from '../../services/habitsApi';
import type { Category } from '../../types/category';
import type { Habit, GoalType, RepeatType, RepeatConfig } from '../../types/habit';
import type { RootState } from '../../state/store';

// ── Draft state ───────────────────────────────────────────────────────────────

export interface HabitDraft {
  name: string;
  goalType: GoalType;
  // categoryId thật từ API (có sau khi gọi createCategory hoặc chọn custom)
  categoryId: string | undefined;
  // Metadata của category được chọn ở bước 1 (default local)
  selectedCategoryKey: string | undefined;
  selectedCategoryName: string | undefined;
  selectedCategoryIcon: string | undefined;  // apiIcon string
  selectedCategoryColor: string | undefined;
  repeatType: RepeatType;
  repeatConfig: RepeatConfig;
  startDate: string;
}

interface CreateHabitState {
  step: 'name_category' | 'custom_category' | 'schedule' | 'success';
  draft: HabitDraft;
  createCategoryStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  createCategoryError: string | null;
  createHabitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  createHabitError: string | null;
  createdHabit: Habit | null;
}

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function createInitialDraft(): HabitDraft {
  return {
    name: '',
    goalType: 'boolean',
    categoryId: undefined,
    selectedCategoryKey: undefined,
    selectedCategoryName: undefined,
    selectedCategoryIcon: undefined,
    selectedCategoryColor: undefined,
    repeatType: 'daily',
    repeatConfig: {},
    startDate: todayISO(),
  };
}

function createInitialState(): CreateHabitState {
  return {
    step: 'name_category',
    draft: createInitialDraft(),
    createCategoryStatus: 'idle',
    createCategoryError: null,
    createHabitStatus: 'idle',
    createHabitError: null,
    createdHabit: null,
  };
}

const initialState: CreateHabitState = createInitialState();

// ── Helper ────────────────────────────────────────────────────────────────────

function extractErrorMessage(e: unknown, fallback: string): string {
  if (typeof e === 'string') return e;

  if (axios.isAxiosError<ApiErrorResponse>(e)) {
    const data = e.response?.data;
    if (data?.message) {
      if (typeof data.message === 'string') return data.message;
      return data.message.join(', ');
    }
    if (typeof data?.error === 'string') return data.error;
    if (e.message) return e.message;
  }

  if (e instanceof Error) return e.message;

  return fallback;
}

// ── Thunk: tạo custom category (từ CustomCategoryScreen) ─────────────────────
// Sau khi thành công → set draft.categoryId = category.id → set step = 'schedule'

export const submitCreateCategory = createAsyncThunk<
  Category,
  CreateCategoryPayload,
  { state: RootState; rejectValue: string }
>('createHabit/submitCreateCategory', async (payload, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');
  try {
    const res = await createCategory(accessToken, payload, tokenType ?? 'Bearer');
    return res.data;
  } catch (e) {
    return rejectWithValue(extractErrorMessage(e, 'Failed to create category.'));
  }
});

// ── Thunk: tạo habit (từ ScheduleScreen) ─────────────────────────────────────
// Nếu draft.categoryId chưa có nhưng có selectedCategoryKey (default category),
// thì tạo category trước, lấy id, rồi mới tạo habit.

export const submitCreateHabit = createAsyncThunk<
  Habit,
  { repeatConfig?: RepeatConfig } | void,
  { state: RootState; rejectValue: string }
>('createHabit/submitCreateHabit', async (arg, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  const { draft } = getState().createHabit;
  if (!accessToken) return rejectWithValue('Not authenticated.');

  const finalRepeatConfig = arg?.repeatConfig ?? draft.repeatConfig;
  let categoryId = draft.categoryId;

  // Nếu chưa có categoryId thật nhưng user đã chọn default category → tạo category trước
  if (!categoryId && draft.selectedCategoryIcon && draft.selectedCategoryName) {
    try {
      const catRes = await createCategory(
        accessToken,
        {
          name: draft.selectedCategoryName,
          icon: draft.selectedCategoryIcon,
          color: draft.selectedCategoryColor ?? '#a078ff',
        },
        tokenType ?? 'Bearer',
      );
      categoryId = catRes.data.id;
    } catch {
      // Nếu tạo category thất bại (ví dụ tên trùng), vẫn tiến hành tạo habit không có category.
    }
  }

  const payload: CreateHabitPayload = {
    name: draft.name,
    goalType: draft.goalType,
    categoryId,
    startDate: draft.startDate,
    schedule: {
      repeatType: draft.repeatType,
      repeatConfig: finalRepeatConfig,
    },
  };

  try {
    const res = await createHabit(accessToken, payload, tokenType ?? 'Bearer');
    return res.data;
  } catch (e: unknown) {
    return rejectWithValue(extractErrorMessage(e, 'Failed to create habit.'));
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const createHabitSlice = createSlice({
  name: 'createHabit',
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<CreateHabitState['step']>) {
      state.step = action.payload;
    },
    updateDraft(state, action: PayloadAction<Partial<HabitDraft>>) {
      state.draft = { ...state.draft, ...action.payload };
    },
    resetCreateHabit: () => createInitialState(),
    clearCreateHabitError(state) {
      state.createHabitError = null;
      state.createCategoryError = null;
    },
  },
  extraReducers: (builder) => {
    // submitCreateCategory (từ CustomCategoryScreen)
    builder
      .addCase(submitCreateCategory.pending, (state) => {
        state.createCategoryStatus = 'loading';
        state.createCategoryError = null;
      })
      .addCase(submitCreateCategory.fulfilled, (state, action) => {
        state.createCategoryStatus = 'succeeded';
        // Lưu categoryId thật vào draft
        state.draft.categoryId = action.payload.id;
        state.draft.selectedCategoryKey = '__custom__';
        state.draft.selectedCategoryName = action.payload.name;
        // Tự động sang schedule
        state.step = 'schedule';
      })
      .addCase(submitCreateCategory.rejected, (state, action) => {
        state.createCategoryStatus = 'failed';
        state.createCategoryError = action.payload ?? 'Error.';
      });

    // submitCreateHabit (từ ScheduleScreen)
    builder
      .addCase(submitCreateHabit.pending, (state) => {
        state.createHabitStatus = 'loading';
        state.createHabitError = null;
      })
      .addCase(submitCreateHabit.fulfilled, (state, action) => {
        state.createHabitStatus = 'succeeded';
        state.createdHabit = action.payload;
        state.step = 'success';
      })
      .addCase(submitCreateHabit.rejected, (state, action) => {
        state.createHabitStatus = 'failed';
        state.createHabitError = action.payload ?? 'Something went wrong.';
      });
  },
});

export const { setStep, updateDraft, resetCreateHabit, clearCreateHabitError } =
  createHabitSlice.actions;
export default createHabitSlice.reducer;
