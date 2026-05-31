import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isLoggedIn: boolean;
   hasSeenOnboarding: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  hasSeenOnboarding: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state) => {
      state.isLoggedIn = true;
    },

    logout: (state) => {
      state.isLoggedIn = false;
    },

    completeOnboarding: (state) => {
      state.hasSeenOnboarding = true;
    },
  },
});

export const { login, logout, completeOnboarding } = authSlice.actions;
export default authSlice.reducer;