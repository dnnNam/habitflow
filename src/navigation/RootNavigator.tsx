import React from 'react'
import { useSelector } from 'react-redux';
import { selectHasSeenOnboarding, selectIsLoggedIn } from '../features/auth/authSelector';
import OnboardingNavigator from './OnboardingNavigator';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function RootNavigator() {
    const hasSeenOnboarding =  useSelector(selectHasSeenOnboarding);
    const isLoggedIn = useSelector(selectIsLoggedIn);

    if(!hasSeenOnboarding) {
        return  <OnboardingNavigator/>
    }

    if(!isLoggedIn) {
        return   <AuthNavigator/>
    }


    return <MainNavigator/>
}
