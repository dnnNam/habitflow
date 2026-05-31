import { createStackNavigator } from "@react-navigation/stack";
import Gamification from "../screens/onboarding/Gamification";
import SplashScreen1 from "../screens/onboarding/SplashScreen1";
import SplashScreen2 from "../screens/onboarding/SpashScreen2";
import SplashScreen3 from "../screens/onboarding/SpashScreen3";


export type OnboardingStackParamList = {

  Gamification: undefined;
  SplashScreen1: undefined;
  SplashScreen2: undefined;
  SplashScreen3: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();
export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Gamification"
      screenOptions={{
        headerShown: false,
      }}
    >
      
      <Stack.Screen
        name="Gamification"
        component={Gamification}
      />

      <Stack.Screen
        name="SplashScreen1"
        component={SplashScreen1}
      />

      <Stack.Screen
        name="SplashScreen2"
        component={SplashScreen2}
      />

      <Stack.Screen
        name="SplashScreen3"
        component={SplashScreen3}
      />
    </Stack.Navigator>
  );
}