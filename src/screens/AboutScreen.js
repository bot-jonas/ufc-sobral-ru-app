import React from 'react';
import {ScrollView, Text, TouchableOpacity, Linking} from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{padding: 12}}>
      <Text style={{color: 'black', marginBottom: 12}}>
        Esse aplicativo foi desenvolvido com o intuito de centralizar diversas
        funcionalidades relacionadas com o RU da UFC Sobral.
      </Text>

      <Text style={{color: 'black', marginBottom: 12}}>
        O repositório no GitHub que contém o código fonte desse aplicativo se
        encontra no seguinte link{' '}
        <TouchableOpacity
          onPress={() => {
            Linking.openURL('https://github.com/bot-jonas/ufc-sobral-ru-app');
          }}>
          <Text style={{color: 'blue', textDecorationLine: 'underline'}}>
            bot-jonas/ufc-sobral-ru
          </Text>
        </TouchableOpacity>
      </Text>

      <Text style={{color: 'black', fontStyle: 'italic'}}>
        O ícone utilizado pelo aplicativo {'(Color City Eating Places)'} foi
        fornecido pela empresa <Text style={{color: 'blue'}}>icons8</Text>.
      </Text>
    </ScrollView>
  );
};

export default AboutScreen;
