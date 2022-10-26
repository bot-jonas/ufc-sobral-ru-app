import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {recover_card_number} from '../api/recover_card_number';
import {get_user_data} from '../api/user';
import SimpleTable from '../components/SimpleTable';
import {login} from '../features/userSlice';
import {isEmpty} from '../utils/functions';

const ASYNC_STORAGE_USER_KEY = 'ufc-sobral-ru@user';

const RecoverCardNumberScreen = () => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [username, onChangeUsername] = useState('');
  const [password, onChangePassword] = useState('');
  const [recoveredData, setRecoveredData] = useState({});

  const handleRecover = async () => {
    setRecoveredData({});
    setIsLoading(true);

    const r = await recover_card_number(username, password);

    if (!r.ok) {
      ToastAndroid.show(r.errors.join('\n'), ToastAndroid.SHORT);
    } else {
      setRecoveredData(r.data);
    }

    setIsLoading(false);
  };

  const handleLogin = async () => {
    const user_data = {
      cardNumber: recoveredData.cardNumber,
      registration: recoveredData.registration,
    };

    // Validate data
    setIsLogging(true);
    const r = await get_user_data(user_data.cardNumber, user_data.registration);

    if (!r.ok) {
      ToastAndroid.show(r.errors.join('\n'), ToastAndroid.SHORT);
    } else {
      await AsyncStorage.setItem(
        ASYNC_STORAGE_USER_KEY,
        JSON.stringify(user_data),
      );

      dispatch(login(user_data));

      ToastAndroid.show('Login realizado com sucesso!', ToastAndroid.SHORT);
    }

    setIsLogging(false);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{padding: 12}}>
      <Text
        style={{
          color: 'black',
          fontSize: 16,
          textDecorationLine: 'underline',
          marginBottom: 12,
        }}>
        Para recuperar o número do cartão do RU informe os dados de login do
        SIGAA.
      </Text>

      <View style={{marginBottom: 12}}>
        <Text style={{color: 'black'}}>Usuário</Text>
        <TextInput
          style={{borderBottomWidth: 1, padding: 4, color: 'black'}}
          onChangeText={onChangeUsername}
          value={username}
          placeholderTextColor={'grey'}
        />
      </View>

      <View style={{marginBottom: 12}}>
        <Text style={{color: 'black'}}>Senha</Text>
        <TextInput
          style={{borderBottomWidth: 1, padding: 4, color: 'black'}}
          onChangeText={onChangePassword}
          value={password}
          secureTextEntry={true}
          placeholderTextColor={'grey'}
        />
      </View>

      <TouchableOpacity
        onPress={() => {
          if (!username.length || !password.length) {
            ToastAndroid.show(
              'O usuário e a senha são obrigatórios!',
              ToastAndroid.SHORT,
            );
          } else {
            handleRecover();
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
          <Text style={{color: 'white', marginRight: 4}}>Recuperar</Text>
          {isLoading && <ActivityIndicator size="small" color="white" />}
        </View>
      </TouchableOpacity>

      {!isEmpty(recoveredData) && (
        <>
          <SimpleTable
            title="Dados recuperados"
            data={recoveredData.table}
            style={{marginVertical: 12}}
          />

          <TouchableOpacity onPress={handleLogin}>
            <View
              style={{
                backgroundColor: '#1f567d',
                flexDirection: 'row',
                justifyContent: 'center',
                padding: 12,
                borderRadius: 8,
              }}>
              <Text style={{color: 'white', marginRight: 4}}>
                Fazer login com esses dados
              </Text>
              {isLoading && <ActivityIndicator size="small" color="white" />}
            </View>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

export default RecoverCardNumberScreen;
