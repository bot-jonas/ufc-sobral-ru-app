import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import {
  get_credits_data,
  handleGRUPayment,
  handlePIXPayment,
  PixWS,
  test_server,
} from '../api/credits';
import RequireLogin from '../components/RequireLogin';
import SimpleTable from '../components/SimpleTable';
import {selectUser} from '../features/userSlice';
import {format_date, isEmpty} from '../utils/functions';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  InformationCircleIcon,
  CheckCircleIcon,
  ShareIcon,
} from 'react-native-heroicons/solid';
import CroppedImage from '../components/CroppedImage';
import Share from 'react-native-share';
import {captureRef} from 'react-native-view-shot';

const AddCreditsScreen = () => {
  const user = useSelector(selectUser);
  const [status, setStatus] = useState('idle');
  const [creditsData, setCreditsData] = useState({});
  const [amountCredits, setAmountCredits] = useState(1);
  const [disableButtons, setDisableButtons] = useState(false);
  const [pixModalVisible, setPixModalVisible] = useState(false);
  const [pixData, setPixData] = useState({});
  const [isPixLoading, setIsPixLoading] = useState(false);
  const [pixConfirmationData, setPixConfirmationData] = useState({});
  const [pix_ws, set_pix_ws] = useState(false);
  const refViewShot = useRef();

  const init = async () => {
    // Get creditsData
    if (user.isLogged) {
      setStatus('Loading...');

      try {
        const creditsData_ = await get_credits_data(
          user.cardNumber,
          user.registration,
        );

        console.log('getting credits data');

        setCreditsData(creditsData_);
      } catch (e) {
        setStatus(`Erro ao tentar carregar dados de créditos:\n\n${e.message}`);
        return;
      }
    }
  };

  const handlePayment = async method => {
    if (amountCredits === 0 || amountCredits.length === 0) {
      ToastAndroid.show(
        'Insira uma quantidade de crédito maior do que 0.',
        ToastAndroid.SHORT,
      );
    } else {
      setDisableButtons(true);
      try {
        if (method === 'pix') {
          // Reset states
          setPixConfirmationData({});
          setPixData({});

          setIsPixLoading(true);
          const response = await handlePIXPayment(amountCredits, user);

          if (response.ok) {
            setPixData({
              info: [
                ['Descrição', response.data.payment_details.descricao],
                ['Nome do contribuinte', 'JONAS ALVES DE CASTRO'],
                [
                  `${response.data.payment_details.contribuinte.tipoIdentificador} do contribuinte`,
                  response.data.payment_details.contribuinte
                    .codigoIdentificador,
                ],
                [
                  'Número de referência',
                  response.data.payment_details.numeroReferencia,
                ],
                [
                  'Valor total do serviço',
                  `R$ ${response.data.payment_details.valor.toFixed(2)}`,
                ],
              ],
              conteudo: response.data.pix_details.conteudo,
              imagem: response.data.pix_details.imagem,
              data_expiracao: response.data.pix_details.dataExpiracao,
            });
            setIsPixLoading(false);
            setPixModalVisible(true);

            // Start WebSocket
            set_pix_ws(
              new PixWS(response.data.id_sessao, data => {
                setPixConfirmationData({
                  info: [
                    ['Identificação do pagamento', data.idPagamento],
                    ['Forma de Pagamento', data.tipoPagamentoEscolhido],
                    ['Número/ID da transação no prestador', data.refTran],
                    [
                      'Data do pagamento no prestador',
                      format_date(data.dataPagamento, false),
                    ],
                    [
                      'Data e hora da confirmação do pagamento',
                      format_date(data.situacao.data),
                    ],
                  ],
                });
              }),
            );
          }
        } else if (method == 'gru') {
          await handleGRUPayment(amountCredits, user);
        }
      } catch (e) {
        let msg =
          'O servidor não está funcionando no momento, tente novamente mais tarde!';

        if (__DEV__) {
          msg += `\nErro: ${e.message}`;
        }

        ToastAndroid.show(msg, ToastAndroid.LONG);
      }
      setIsPixLoading(false);
      setDisableButtons(false);
    }
  };

  useEffect(() => {
    init();
  }, [user]);

  return (
    <RequireLogin>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: 12}}>
        {isEmpty(creditsData) ? (
          <Text style={{color: 'black'}}>{status}</Text>
        ) : (
          <>
            <SimpleTable
              title="Dados para Geração da GRU"
              data={creditsData.tables.info}
              style={{marginBottom: 12}}
            />
            <SimpleTable
              title="Inserção de Crédito"
              data={[
                [
                  'Quantidade de Créditos',
                  <TextInput
                    style={{
                      borderBottomWidth: 1,
                      padding: 4,
                      color: 'black',
                      textAlign: 'right',
                    }}
                    placeholder="Núm. créditos"
                    onChangeText={text => setAmountCredits(text)}
                    onEndEditing={e => {
                      const value = Math.min(
                        amountCredits,
                        50 - creditsData.num_credits,
                      );
                      setAmountCredits(value);
                    }}
                    value={amountCredits.toString()}
                    keyboardType="numeric"
                    placeholderTextColor={'grey'}
                  />,
                ],
                ['Total a Pagar (R$)', (amountCredits * 1.1).toFixed(2)],
              ]}
              style={{marginBottom: 12}}
            />
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity
                style={{flex: 1, marginRight: 12}}
                onPress={() => {
                  handlePayment('pix');
                }}
                disabled={disableButtons}>
                <View
                  style={{
                    backgroundColor: '#1f567d',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}>
                  <Text style={{color: 'white', marginRight: 4}}>PIX</Text>
                  {isPixLoading && (
                    <ActivityIndicator size="small" color="white" />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{flex: 1}}
                onPress={() => {
                  handlePayment('gru');
                }}
                disabled={disableButtons}>
                <View
                  style={{
                    backgroundColor: '#1f567d',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    padding: 12,
                    borderRadius: 8,
                  }}>
                  <Text style={{color: 'white'}}>GRU</Text>
                </View>
              </TouchableOpacity>
            </View>
            <Modal
              animationType="fade"
              transparent={true}
              visible={pixModalVisible}
              onRequestClose={() => {
                setPixModalVisible(false);

                if (pix_ws) {
                  pix_ws.close();
                }
              }}>
              {isEmpty(pixData) ? null : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 12,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  }}>
                  <View
                    ref={refViewShot}
                    style={{
                      backgroundColor: 'white',
                      width: '100%',
                      padding: 16,
                      borderRadius: 8,
                    }}>
                    <View style={{marginBottom: 12}}>
                      {isEmpty(pixConfirmationData) ? (
                        <View style={{alignItems: 'center', marginBottom: 12}}>
                          <InformationCircleIcon color="#ff8c00" size={40} />
                          <Text style={{color: '#ff8c00', fontSize: 16}}>
                            Aguardando realização do pagamento...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={{alignItems: 'flex-end'}}
                            onPress={async () => {
                              const uri = await captureRef(refViewShot, {
                                fileName: pixConfirmationData.info[0][1],
                                format: 'jpg',
                                quality: 1,
                              });

                              console.log(`uri: ${uri}`);

                              const shareOptions = {
                                title: 'Compartilhar comprovante',
                                failOnCancel: false,
                                saveToFiles: true,
                                url: uri,
                              };

                              try {
                                const r = await Share.open(shareOptions);
                                console.log(r);
                              } catch (e) {
                                console.log(e.message);
                              }
                            }}>
                            <ShareIcon color="black" size={20} />
                          </TouchableOpacity>
                          <View
                            style={{alignItems: 'center', marginBottom: 12}}>
                            <CheckCircleIcon color="#155724" size={40} />
                            <Text style={{color: '#155724', fontSize: 16}}>
                              Pagamento realizado com sucesso.
                            </Text>
                          </View>
                        </>
                      )}
                    </View>

                    {/* Dados do pagamento */}
                    <View>
                      {pixData.info.map(([header, value], idx) => (
                        <View key={idx} style={{marginBottom: 4}}>
                          <Text style={{color: 'black', fontWeight: 'bold'}}>
                            {header + ':'}
                          </Text>
                          <Text style={{color: 'black'}}>{value}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Pagamento */}
                    {isEmpty(pixConfirmationData) ? (
                      <View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginVertical: 12,
                          }}>
                          <CroppedImage
                            cropLeft={15}
                            cropTop={15}
                            cropWidth={170}
                            cropHeight={170}
                            width={200}
                            height={200}
                            source={{
                              uri: 'data:image/png;base64,' + pixData.imagem,
                            }}
                            style={{
                              marginRight: 8,
                            }}
                          />
                          <TouchableOpacity
                            style={{
                              flexShrink: 1,
                            }}
                            onPress={() => {
                              Clipboard.setString(pixData.conteudo);
                              ToastAndroid.show(
                                'Código PIX copiado com sucesso!',
                                ToastAndroid.SHORT,
                              );
                            }}>
                            <Text
                              style={{
                                color: 'black',
                                backgroundColor: '#eee',
                                padding: 8,
                                borderRadius: 8,
                                fontSize: 12,
                              }}>
                              {pixData.conteudo}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <Text
                          style={{
                            color: 'black',
                            fontSize: 12,
                          }}>
                          {`O QR Code expira em ${pixData.data_expiracao} (Brasília-DF).`}
                        </Text>
                      </View>
                    ) : (
                      /* Confirmação de Pagamento */
                      <View>
                        {pixConfirmationData.info.map(
                          ([header, value], idx) => (
                            <View key={idx} style={{marginBottom: 4}}>
                              <Text
                                style={{color: 'black', fontWeight: 'bold'}}>
                                {header + ':'}
                              </Text>
                              <Text style={{color: 'black'}}>{value}</Text>
                            </View>
                          ),
                        )}
                      </View>
                    )}
                  </View>
                </View>
              )}
            </Modal>
          </>
        )}
      </ScrollView>
    </RequireLogin>
  );
};

export default AddCreditsScreen;
