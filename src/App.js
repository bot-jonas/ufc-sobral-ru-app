import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import MenuScreen from './screens/MenuScreen';
import Header from './components/Header';
import AddCreditsScreen from './screens/AddCreditsScreen';
import HistoryScreen from './screens/HistoryScreen';
import store from './store';
import {Provider, useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {login} from './features/userSlice';
import RecoverCardNumberScreen from './screens/RecoverCardNumberScreen';

const Stack = createNativeStackNavigator();
const ASYNC_STORAGE_USER_KEY = 'ufc-sobral-ru@user';

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <LoadAsyncStorageData>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                animation: 'slide_from_right',
                header: props => <Header {...props} />,
              }}>
              <Stack.Screen
                name="home"
                options={{title: 'Menu'}}
                component={HomeScreen}
              />
              <Stack.Screen
                name="menu"
                options={{title: 'Cardápio'}}
                component={MenuScreen}
              />
              <Stack.Screen
                name="add-credits"
                options={{title: 'Adicionar Créditos'}}
                component={AddCreditsScreen}
              />
              <Stack.Screen
                name="history"
                options={{title: 'Histórico'}}
                component={HistoryScreen}
              />
              <Stack.Screen
                name="recover-card-number"
                options={{title: 'Recuperar Número do Cartão'}}
                component={RecoverCardNumberScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </LoadAsyncStorageData>
      </Provider>
    </SafeAreaProvider>
  );
};

const LoadAsyncStorageData = props => {
  const dispatch = useDispatch();

  (async () => {
    console.log('Loading AsyncStorage user_data');

    let user_data = await AsyncStorage.getItem(ASYNC_STORAGE_USER_KEY);

    if (user_data != null) {
      dispatch(login(JSON.parse(user_data)));
    }
  })();

  return props.children;
};

export default App;
