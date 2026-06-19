import type { RootState } from "../../state/store";




export const selectIsLoggedIn = (
  state: RootState
) => state.auth.isLoggedIn;


export const selectHasSeenOnboarding = (
  state: RootState
) => state.auth.hasSeenOnboarding;

export const selectAuthIsLoading = (
  state: RootState
) => state.auth.isLoading;

export const selectAuthError = (
  state: RootState
) => state.auth.error;

export const selectCurrentUser = (
  state: RootState
) => state.auth.user;

export const selectAccessToken = (
  state: RootState
) => state.auth.accessToken;

export const selectProfileStatus = (
  state: RootState
) => state.auth.profileStatus;
