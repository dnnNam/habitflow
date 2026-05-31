import { RootState } from "../../app/store";




export const selectIsLoggedIn = (
  state: RootState
) => state.auth.isLoggedIn;


export const selectHasSeenOnboarding = (
  state: RootState
) => state.auth.hasSeenOnboarding;