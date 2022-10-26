import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {login, selectUser} from '../features/userSlice';
import {get_user_data} from '../api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ASYNC_STORAGE_USER_KEY = 'ufc-sobral-ru@user';

const RequireLogin = props => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [cardNumber, onChangeCardNumber] = useState('');
  const [registration, onChangeRegistration] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    // Make a request
    const user_data = await get_user_data(cardNumber, registration);
    // Show the response message
    if (!user_data.ok) {
      ToastAndroid.show(user_data.errors.join('\n'), ToastAndroid.SHORT);
    } else {
      // If the response is ok, store the user data
      await AsyncStorage.setItem(
        ASYNC_STORAGE_USER_KEY,
        JSON.stringify({cardNumber, registration}),
      );

      dispatch(login({cardNumber, registration}));
    }
    setIsLoading(false);
  };

  return !user.isLogged ? (
    <View style={[{padding: 12}, props.style]}>
      <Text
        style={{
          color: 'black',
          fontSize: 16,
          textDecorationLine: 'underline',
          marginBottom: 12,
        }}>
        O usuário precisa estar logado para utilizar essa função.
      </Text>

      <View style={{marginBottom: 12}}>
        <Text style={{color: 'black'}}>Número do cartão</Text>
        <TextInput
          style={{borderBottomWidth: 1, padding: 4, color: 'black'}}
          placeholder="12345678"
          onChangeText={onChangeCardNumber}
          value={cardNumber}
          keyboardType="numeric"
          placeholderTextColor={'grey'}
        />
      </View>

      <View style={{marginBottom: 12}}>
        <Text style={{color: 'black'}}>Matrícula atrelada ao cartão</Text>
        <TextInput
          style={{borderBottomWidth: 1, padding: 4, color: 'black'}}
          placeholder="123456"
          onChangeText={onChangeRegistration}
          value={registration}
          keyboardType="numeric"
          placeholderTextColor={'grey'}
        />
      </View>

      <TouchableOpacity
        onPress={() => {
          if (!cardNumber.length || !registration.length) {
            ToastAndroid.show(
              'O número do cartão e a matrícula são obrigatórios!',
              ToastAndroid.SHORT,
            );
          } else {
            handleLogin();
          }
        }}>
        <View
          style={{
            backgroundColor: '#1f567d',
            flexDirection: 'row',
            justifyContent: 'center',
            padding: 12,
            borderRadius: 8,
          }}>
          <Text style={{color: 'white', marginRight: 4}}>Login</Text>
          {isLoading && <ActivityIndicator size="small" color="white" />}
        </View>
      </TouchableOpacity>
    </View>
  ) : (
    props.children
  );
};

export default RequireLogin;
