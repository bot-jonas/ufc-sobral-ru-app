import {
  BanknotesIcon,
  BookOpenIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

// https://oieduardorabelo.medium.com/react-native-criando-grids-com-flatlist-b4eb64e7dcd5
function createRows(data, columns) {
  const rows = Math.floor(data.length / columns);
  let lastRowElements = data.length - rows * columns;

  while (lastRowElements !== columns) {
    data.push({
      id: `empty-${lastRowElements}`,
      name: `empty-${lastRowElements}`,
      empty: true,
    });
    lastRowElements += 1;
  }
  return data;
}

const styles = StyleSheet.create({
  flatlist: {
    item: {
      alignItems: 'center',
      flexGrow: 1,
      margin: 4,
      padding: 16,
      flexBasis: 0,
    },
    empty: {
      backgroundColor: 'transparent',
    },
    icon: {
      color: '#1f567d',
      size: 64,
    },
    text: {
      color: '#1f567d',
      fontSize: 12,
      textAlign: 'center',
    },
  },
});

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View>
      <View style={{paddingHorizontal: 12, paddingTop: 12}}>
        <FlatList
          data={createRows(
            [
              {screen: 'menu', name: 'Cardápio', icon: BookOpenIcon},
              {
                screen: 'add-credits',
                name: 'Adicionar créditos',
                icon: BanknotesIcon,
              },
              {screen: 'history', name: 'Histórico', icon: ClockIcon},
              {
                screen: 'recover-card-number',
                name: 'Recuperar número do cartão',
                icon: MagnifyingGlassIcon,
              },
            ],
            3,
          )}
          keyExtractor={item => item.screen}
          numColumns={3}
          renderItem={({item}) => {
            if (item.empty) {
              return (
                <View style={[styles.flatlist.item, styles.flatlist.empty]} />
              );
            }

            return (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(item.screen);
                }}
                style={styles.flatlist.item}>
                <item.icon
                  color={styles.flatlist.icon.color}
                  size={styles.flatlist.icon.size}
                />
                <Text style={styles.flatlist.text}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
};

export default HomeScreen;
