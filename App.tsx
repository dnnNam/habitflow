import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from 'react-redux';
import { store } from './src/app/store';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
     <Provider store={store}>
       <NavigationContainer>
          <RootNavigator />
       </NavigationContainer>
    </Provider>
  );
}


