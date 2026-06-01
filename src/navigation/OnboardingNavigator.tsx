import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Gamification from "../screens/onboarding/Gamification";
import SplashScreen1 from "../screens/onboarding/SplashScreen1";
import SplashScreen2 from "../screens/onboarding/SplashScreen2";
import SplashScreen3 from "../screens/onboarding/SplashScreen3";


export type OnboardingStackParamList = {

  Gamification: undefined;
  SplashScreen1: undefined;
  SplashScreen2: undefined;
  SplashScreen3: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();
export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Gamification"
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        animationDuration: 1200,
        contentStyle: {
          backgroundColor: "#0b1326",
        },
        statusBarBackgroundColor: "#0b1326",
        statusBarStyle: "light",
        navigationBarColor: "#0b1326",
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
