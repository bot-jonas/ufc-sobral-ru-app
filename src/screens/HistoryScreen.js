import React, {useEffect, useState} from 'react';
import {ScrollView, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {get_history} from '../api/history';
import RequireLogin from '../components/RequireLogin';
import SimpleTable from '../components/SimpleTable';
import {selectUser} from '../features/userSlice';
import {isEmpty} from '../utils/functions';

const HistoryScreen = () => {
  const user = useSelector(selectUser);
  const [status, setStatus] = useState('idle');
  const [history, setHistory] = useState({});

  const load_history = async () => {
    if (user.isLogged) {
      setStatus('Loading...');

      try {
        const history_ = await get_history(user.cardNumber, user.registration);

        setHistory(history_);
      } catch (e) {
        setStatus(`Erro ao tentar carregar histórico:\n\n${e.message}`);
        return;
      }
    }
  };

  useEffect(() => {
    load_history();
  }, [user]);

  return (
    <RequireLogin>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: 12}}>
        {isEmpty(history) ? (
          <Text style={{color: 'black'}}>{status}</Text>
        ) : (
          <>
            <SimpleTable
              title="Refeições Disponíveis"
              data={history.tables.available_meals}
              style={{marginBottom: 12}}
            />
            <SimpleTable
              title="Operações Realizadas"
              data={history.tables.operations.map(row => [
                <Text style={{color: 'black', fontSize: 12}}>
                  <Text style={{fontWeight: 'bold'}}>{row.date + '\n'}</Text>
                  {row.operation}
                </Text>,
                row.details,
              ])}
            />
          </>
        )}
      </ScrollView>
    </RequireLogin>
  );
};

export default HistoryScreen;
