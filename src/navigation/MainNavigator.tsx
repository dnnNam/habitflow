// src/navigation/MainNavigator.tsx

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/main/DashboardScreen';
import EmptyDashboardScreen from '../screens/main/EmptyDashboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import StatisticsScreen from '../screens/main/StatisticsScreen';
import CreateHabitFlow from '../screens/main/createHabit/CreateHabitFlow';

export type MainStackParamList = {
  Dashboard: undefined;
  EmptyDashboard: undefined;
  Profile: undefined;
  Statistics: undefined;
  CreateHabit: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        contentStyle: {
          backgroundColor: '#0b1326',
        },
        statusBarBackgroundColor: '#0b1326',
        statusBarStyle: 'light',
        navigationBarColor: '#0b1326',
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="EmptyDashboard" component={EmptyDashboardScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="CreateHabit"
        options={{ animation: 'slide_from_bottom' }}
      >
        {({ navigation }) => (
          <CreateHabitFlow onClose={() => navigation.navigate('Dashboard')} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
