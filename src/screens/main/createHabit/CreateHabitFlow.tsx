// src/screens/main/createHabit/CreateHabitFlow.tsx
//
// Usage: Render this as a modal or full-screen overlay from DashboardScreen.
// Pass `onClose` to dismiss the flow (e.g. navigation.goBack()).
//
// Example from DashboardScreen:
//   navigation.navigate('CreateHabit')
//
// Add CreateHabit to MainNavigator and add createHabitReducer to store.

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { resetCreateHabit } from '../../../features/createHabit/createHabitSlice';
import { selectCreateHabitStep } from '../../../features/createHabit/createHabitSelectors';
import NameCategoryScreen from './NameCategoryScreen';
import CustomCategoryScreen from './CustomCategoryScreen';
import ScheduleScreen from './ScheduleScreen';
import HabitSuccessScreen from './HabitSuccessScreen';



interface Props {
  onClose: () => void;
}

export default function CreateHabitFlow({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const step = useAppSelector(selectCreateHabitStep);

  // Reset when unmounting
  useEffect(() => {
    return () => {
      dispatch(resetCreateHabit());
    };
  }, [dispatch]);

  switch (step) {
    case 'name_category':
      return <NameCategoryScreen onClose={onClose} />;
    case 'custom_category':
      return <CustomCategoryScreen />;
    case 'schedule':
      return <ScheduleScreen />;
    case 'success':
      return <HabitSuccessScreen onDone={onClose} />;
    default:
      return <NameCategoryScreen onClose={onClose} />;
  }
}
