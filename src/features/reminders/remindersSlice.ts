// Lưu reminders theo habitId: { [habitId]: Reminder[] }
// Gọi fetchReminders(habitId) khi mở modal reminder cho 1 habit (lazy load).
// Thêm dispatch(resetReminders()) khi logout nếu cần clear cache.
 
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';


import type { Reminder } from '../../types/reminder';
import type { RootState } from '../../state/store';
import { createReminder, CreateReminderPayload, deleteReminder, getHabitReminders, updateReminder, UpdateReminderPayload } from '../../services/reminderApi';
 
interface ReminderListState {
  items: Reminder[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
 
interface RemindersState {
  byHabitId: Record<string, ReminderListState>;
  // trạng thái riêng cho action tạo/sửa/xóa (để show loading trên nút)
  mutationStatus: 'idle' | 'loading' | 'failed';
  mutationError: string | null;
}
 
const initialState: RemindersState = {
  byHabitId: {},
  mutationStatus: 'idle',
  mutationError: null,
};
 
function emptyList(): ReminderListState {
  return { items: [], status: 'idle', error: null };
}
 
function extractErrorMessage(e: unknown, fallback: string): string {
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  return fallback;
}
 
// ── Thunks ────────────────────────────────────────────────────────────────
 
export const fetchReminders = createAsyncThunk<
  { habitId: string; reminders: Reminder[] },
  { habitId: string },
  { state: RootState; rejectValue: string }
>('reminders/fetchForHabit', async ({ habitId }, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');
  try {
    const res = await getHabitReminders(accessToken, habitId, tokenType ?? 'Bearer');
    return { habitId, reminders: res.data };
  } catch (e) {
    return rejectWithValue(extractErrorMessage(e, 'Failed to load reminders.'));
  }
});
 
export const addReminder = createAsyncThunk<
  { habitId: string; reminder: Reminder },
  { habitId: string; payload: CreateReminderPayload },
  { state: RootState; rejectValue: string }
>('reminders/add', async ({ habitId, payload }, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');
  try {
    const res = await createReminder(accessToken, habitId, payload, tokenType ?? 'Bearer');
    return { habitId, reminder: res.data };
  } catch (e) {
    return rejectWithValue(extractErrorMessage(e, 'Failed to create reminder.'));
  }
});
 
export const editReminder = createAsyncThunk<
  { habitId: string; reminder: Reminder },
  { habitId: string; reminderId: string; payload: UpdateReminderPayload },
  { state: RootState; rejectValue: string }
>('reminders/edit', async ({ habitId, reminderId, payload }, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');
  try {
    const res = await updateReminder(accessToken, reminderId, payload, tokenType ?? 'Bearer');
    return { habitId, reminder: res.data };
  } catch (e) {
    return rejectWithValue(extractErrorMessage(e, 'Failed to update reminder.'));
  }
});
 
export const removeReminder = createAsyncThunk<
  { habitId: string; reminderId: string },
  { habitId: string; reminderId: string },
  { state: RootState; rejectValue: string }
>('reminders/remove', async ({ habitId, reminderId }, { getState, rejectWithValue }) => {
  const { accessToken, tokenType } = getState().auth;
  if (!accessToken) return rejectWithValue('Not authenticated.');
  try {
    await deleteReminder(accessToken, reminderId, tokenType ?? 'Bearer');
    return { habitId, reminderId };
  } catch (e) {
    return rejectWithValue(extractErrorMessage(e, 'Failed to delete reminder.'));
  }
});
 
// ── Slice ─────────────────────────────────────────────────────────────────
 
const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    clearMutationError(state) {
      state.mutationError = null;
    },
    resetReminders: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetch list
      .addCase(fetchReminders.pending, (state, action) => {
        const { habitId } = action.meta.arg;
        const bucket = state.byHabitId[habitId] ?? emptyList();
        bucket.status = 'loading';
        bucket.error = null;
        state.byHabitId[habitId] = bucket;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        const { habitId, reminders } = action.payload;
        state.byHabitId[habitId] = { items: reminders, status: 'succeeded', error: null };
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        const { habitId } = action.meta.arg;
        const bucket = state.byHabitId[habitId] ?? emptyList();
        bucket.status = 'failed';
        bucket.error = action.payload ?? 'Something went wrong.';
        state.byHabitId[habitId] = bucket;
      })
 
      // add
      .addCase(addReminder.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(addReminder.fulfilled, (state, action) => {
        state.mutationStatus = 'idle';
        const { habitId, reminder } = action.payload;
        const bucket = state.byHabitId[habitId] ?? emptyList();
        bucket.items = [...bucket.items, reminder].sort((a, b) =>
          a.remindAt.localeCompare(b.remindAt),
        );
        bucket.status = 'succeeded';
        state.byHabitId[habitId] = bucket;
      })
      .addCase(addReminder.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload ?? 'Failed to create reminder.';
      })
 
      // edit (sửa giờ / bật tắt)
      .addCase(editReminder.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(editReminder.fulfilled, (state, action) => {
        state.mutationStatus = 'idle';
        const { habitId, reminder } = action.payload;
        const bucket = state.byHabitId[habitId];
        if (bucket) {
          bucket.items = bucket.items
            .map((r) => (r.id === reminder.id ? reminder : r))
            .sort((a, b) => a.remindAt.localeCompare(b.remindAt));
        }
      })
      .addCase(editReminder.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload ?? 'Failed to update reminder.';
      })
 
      // remove
      .addCase(removeReminder.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(removeReminder.fulfilled, (state, action) => {
        state.mutationStatus = 'idle';
        const { habitId, reminderId } = action.payload;
        const bucket = state.byHabitId[habitId];
        if (bucket) {
          bucket.items = bucket.items.filter((r) => r.id !== reminderId);
        }
      })
      .addCase(removeReminder.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload ?? 'Failed to delete reminder.';
      });
  },
});
 
export const { clearMutationError, resetReminders } = remindersSlice.actions;
export default remindersSlice.reducer;
 
export type { ReminderListState, RemindersState };
