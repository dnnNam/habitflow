// src/features/auth/authSlice.ts
// Thêm dispatch(resetHabits()) khi logout để clear habits khỏi store

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getProfile, loginUser, registerUser } from '../../services/authApi';
import type { AuthResponseData, LoginPayload, RegisterPayload } from '../../services/authApi';
import type { User } from '../../types/user';

interface AuthState {
  isLoggedIn: boolean;
  hasSeenOnboarding: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  accessToken: string | null;
  tokenType: string | null;
  profileStatus: 'idle' | 'loading' | 'failed';
}

const initialState: AuthState = {
  isLoggedIn: false,
  hasSeenOnboarding: false,
  isLoading: false,
  error: null,
  user: null,
  accessToken: null,
  tokenType: null,
  profileStatus: 'idle',
};

export const login = createAsyncThunk<AuthResponseData, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await loginUser(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(getAuthErrorMessage(error));
    }
  },
);

export const register = createAsyncThunk<AuthResponseData, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await registerUser(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(getAuthErrorMessage(error));
    }
  },
);

export const fetchProfile = createAsyncThunk<
  User,
  void,
  { state: { auth: AuthState }; rejectValue: string }
>(
  'auth/me',
  async (_, { getState, rejectWithValue }) => {
    const { accessToken, tokenType } = getState().auth;

    if (!accessToken) {
      return rejectWithValue('Missing access token.');
    }

    try {
      const response = await getProfile(accessToken, tokenType ?? 'Bearer');
      return response.data;
    } catch (error) {
      return rejectWithValue(getAuthErrorMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.accessToken = null;
      state.tokenType = null;
      state.error = null;
      state.profileStatus = 'idle';
      // NOTE: habits sẽ được reset riêng bằng resetHabits action
      // Gọi cả hai action ở nơi dispatch logout:
      //   dispatch(logout());
      //   dispatch(resetHabits());
    },

    completeOnboarding: (state) => {
      state.hasSeenOnboarding = true;
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, setAuthPending)
      .addCase(register.pending, setAuthPending)
      .addCase(login.fulfilled, (state, action) => {
        setAuthenticatedState(state, action.payload);
      })
      .addCase(register.fulfilled, (state, action) => {
        setAuthenticatedState(state, action.payload);
      })
      .addCase(fetchProfile.pending, (state) => {
        state.profileStatus = 'loading';
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profileStatus = 'idle';
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.error = action.payload ?? 'Could not load profile.';
      })
      .addCase(login.rejected, (state, action) => {
        setAuthRejected(state, action.payload);
      })
      .addCase(register.rejected, (state, action) => {
        setAuthRejected(state, action.payload);
      });
  },
});

function setAuthPending(state: AuthState) {
  state.isLoading = true;
  state.error = null;
}

function setAuthenticatedState(state: AuthState, data: AuthResponseData) {
  state.isLoading = false;
  state.error = null;
  state.isLoggedIn = true;
  state.user = data.user;
  state.accessToken = data.accessToken;
  state.tokenType = data.tokenType;
  state.profileStatus = 'idle';
}

function setAuthRejected(state: AuthState, message?: string) {
  state.isLoading = false;
  state.error = message ?? 'Authentication failed. Please try again.';
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Authentication failed. Please try again.';
}

export const { logout, completeOnboarding, clearAuthError } = authSlice.actions;
export default authSlice.reducer;