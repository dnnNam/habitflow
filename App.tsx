import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { DarkTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/app/store';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
  },
};

export default function App() {
  return (
     <Provider store={store}>
       <SafeAreaProvider>
         <NavigationContainer theme={customDarkTheme}>
            <RootNavigator />
         </NavigationContainer>
       </SafeAreaProvider>
    </Provider>
  );
}


