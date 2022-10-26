import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {
  CreditCardIcon,
  IdentificationIcon,
  ArrowRightOnRectangleIcon,
} from 'react-native-heroicons/outline';
import {useDispatch, useSelector} from 'react-redux';
import {logout, selectUser} from '../features/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ASYNC_STORAGE_USER_KEY = 'ufc-sobral-ru@user';

export default Header = props => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  let screenTitle = '';

  if (props.options && props.options.title) {
    screenTitle = props.options.title;
  }

  return (
    <View>
      <View
        style={{
          backgroundColor: '#1f567d',
          padding: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text style={{fontSize: 16, color: 'white'}}>
          UFC Sobral - Restaurante Universitário
        </Text>
        {user.isLogged ? (
          <TouchableOpacity
            onPress={async () => {
              dispatch(logout());
              await AsyncStorage.removeItem(ASYNC_STORAGE_USER_KEY);
            }}>
            <ArrowRightOnRectangleIcon color="white" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View
        style={{
          backgroundColor: '#1b4b6d',
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text style={{color: 'white'}}>{screenTitle}</Text>
        {!user.isLogged ? (
          <Text style={{color: 'white'}}>Usuário não logado</Text>
        ) : (
          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 8,
              }}>
              <IdentificationIcon
                color={'white'}
                size={20}
                style={{marginRight: 4}}
              />
              <Text style={{color: 'white', fontSize: 12}}>
                {user.registration}
              </Text>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <CreditCardIcon
                color={'white'}
                size={20}
                style={{marginRight: 4}}
              />
              <Text style={{color: 'white', fontSize: 12}}>
                {user.cardNumber}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
