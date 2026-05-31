import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { DarkTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/app/store';
import RootNavigator from './src/navigation/RootNavigator';

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0b1326',
  },
};

export default function App() {
  return (
     <Provider store={store}>
       <NavigationContainer theme={customDarkTheme}>
          <RootNavigator />
       </NavigationContainer>
    </Provider>
  );
}


