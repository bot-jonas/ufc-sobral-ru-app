import React, {useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import Dropdown from '../components/Dropdown';
import SimpleTable from '../components/SimpleTable';
import {get_cached_menu} from '../api/cardapio_ru';
import {isEmpty} from '../utils/functions';

function transpose(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  const transposed = [];

  for (let j = 0; j < cols; j++) {
    transposed.push([]);
    for (let i = 0; i < rows; i++) {
      transposed[j].push(matrix[i][j]);
    }
  }

  return transposed;
}

function get_data_for_given_day(values, day) {
  return values[0].map((v, idx) => [v, values[day + 1][idx]]);
}

const MenuScreen = () => {
  const days = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
  ];

  // [0, 1, 2, 3, 4, 5, 6] -> [0, 0, 1, 2, 3, 4, 4]
  const defaultDayIndex = Math.min(4, Math.max(0, new Date().getDay() - 1));

  const [day, setDay] = useState(defaultDayIndex);
  const [status, setStatus] = useState('idle');
  const [menu, setMenu] = useState({});

  const load_menu = async () => {
    setStatus('Loading...');

    try {
      const menu_ = await get_cached_menu();

      menu_.tables.lunch.values_transposed = transpose(
        menu_.tables.lunch.values,
      );
      menu_.tables.dinner.values_transposed = transpose(
        menu_.tables.dinner.values,
      );

      setMenu(menu_);
    } catch (e) {
      setStatus(`Erro ao tentar carregar cardápio:\n\n${e.message}`);
      return;
    }
  };

  useEffect(() => {
    load_menu();
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{padding: 12}}>
      {isEmpty(menu) ? (
        <Text style={{color: 'black'}}>{status}</Text>
      ) : (
        <>
          <View
            style={{
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: 'black',
                fontSize: 22,
                marginRight: 12,
              }}>
              Cardápios para
            </Text>

            <Dropdown
              defaultValue={days[defaultDayIndex]}
              defaultIndex={defaultDayIndex}
              options={days}
              onSelect={(index, option) => {
                setDay(index);
              }}
            />
          </View>

          <View style={{marginBottom: 12}}>
            {menu.footnotes.map(t => (
              <Text key={t} style={{color: 'black'}}>
                {t}
              </Text>
            ))}
          </View>

          <SimpleTable
            title={menu.tables.lunch.title}
            data={get_data_for_given_day(
              menu.tables.lunch.values_transposed,
              day,
            )}
            style={{marginBottom: 12}}
          />
          <SimpleTable
            title={menu.tables.dinner.title}
            data={get_data_for_given_day(
              menu.tables.dinner.values_transposed,
              day,
            )}
          />
        </>
      )}
    </ScrollView>
  );
};

export default MenuScreen;
