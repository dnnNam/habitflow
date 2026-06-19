import { useAppSelector } from '../state/hooks';
import { selectHasSeenOnboarding, selectIsLoggedIn } from '../features/auth/authSelector';
import OnboardingNavigator from './OnboardingNavigator';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function RootNavigator() {
    const hasSeenOnboarding = useAppSelector(selectHasSeenOnboarding);
    const isLoggedIn = useAppSelector(selectIsLoggedIn);

    if(!hasSeenOnboarding) {
        return  <OnboardingNavigator/>
    }

    if(!isLoggedIn) {
        return   <AuthNavigator/>
    }


    return <MainNavigator/>
}
