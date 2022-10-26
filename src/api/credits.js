import {Linking} from 'react-native';
import {
  form_urlencode,
  get_javax_faces_ViewState,
  random_word,
} from '../utils/functions';

class PixWS {
  constructor(idSessao, callback) {
    this.idSessao = idSessao;
    this.ws_url = this.generate_url();
    this.callback = callback;

    this.start();
  }

  start() {
    this.ws = new WebSocket(this.ws_url);

    this.ws.onopen = this.onopen.bind(this);
    this.ws.onerror = this.onerror.bind(this);
    this.ws.onclose = this.onclose.bind(this);
    this.ws.onmessage = this.onmessage.bind(this);
  }

  onopen(ev) {
    console.log('PixWS: opened connection');
  }

  onerror(ev) {
    console.log('PixWS: an error ocurred');
  }

  onclose(ev) {
    console.log('PixWS: closed connection');
  }

  onmessage(ev) {
    const msg = ev.data;
    console.log(`<<< ${JSON.stringify(msg, false, 4)}`);

    if (msg === 'o') {
      this.send_msg(
        '["CONNECT\\naccept-version:1.2\\nheart-beat:10000,10000\\n\\n\\u0000"]',
      );
    } else if (msg.startsWith('a["CONNECTED')) {
      this.send_msg(
        '["SUBSCRIBE\\nid:sub-1662778179507-668\\ndestination:/user/queue/notificacoes-pgto-ws\\n\\n\\u0000"]',
      );
      this.send_msg(
        `["SEND\\ndestination:/ws/pedido-notificacao-pgto-ws\\ncontent-length:51\\n\\n{\\"idSessao\\":\\"${this.idSessao}\\"}\\u0000"]`,
      );
    } else if (msg.indexOf('CONCLUIDO') > -1) {
      fetch(
        `https://pagtesouro.tesouro.gov.br/api/pagamentos/pix-stn/sonda?idSessao=${this.idSessao}`,
      )
        .then(r => r.json())
        .then(this.callback)
        .then(() => {
          this.send_msg('["DISCONNECT\\n\\n\\u0000"]');
          this.close();
        });
    }
  }

  send_msg(data) {
    console.log(`>>> ${JSON.stringify(data, false, 4)}`);
    this.ws.send(data);
  }

  close() {
    if (this.ws) this.ws.close();
  }

  generate_url() {
    const server = (Math.floor(Math.random() * 1e3 - 1) + 1)
      .toString()
      .padStart(3, '0');
    const session = random_word(8);

    return `wss://pagtesouro.tesouro.gov.br/api/sonda-pgto-ws/notificacoes-pgto-ws/${server}/${session}/websocket`;
  }
}

async function test_server() {
  const r = await fetch('https://ufc-sobral-ru.yes0401.net/hello');

  return r;
}

async function handlePIXPayment(amountCredits, user) {
  // TODO: Rewrite this without the need of a server
  const req = await fetch('https://ufc-sobral-ru.yes0401.net/pix', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount_credits: amountCredits,
      card_number: user.cardNumber,
      registration: user.registration,
    }),
  });

  const res = await req.json();

  return res;
}

async function handleGRUPayment(amountCredits, user) {
  // TODO: Rewrite this without the need of a server
  Linking.openURL(
    `https://ufc-sobral-ru.yes0401.net/gru.pdf?amount_credits=${amountCredits}&card_number=${user.cardNumber}&registration=${user.registration}`,
  );
}

function extract_info(html) {
  const indexes = [
    ['Matrícula', 0],
    ['Nome', 1],
    ['Vínculo', 2],
    ['Saldo Atual', 3],
    ['Valor por Crédito', 4],
  ];

  const cells = [...html.matchAll(/<td>((?:.|\n)*?)<\/td>/g)].map(m =>
    m[1].trim(),
  );

  return indexes.map(([key, index]) => [key, cells[index]]);
}

function extract_data(html) {
  const jfv = get_javax_faces_ViewState(html);

  const table_html = html.match(
    /<table class="formulario" width="55%">((?:.|\n)*?)<\/table>/,
  )[1];

  const info = extract_info(table_html);
  const num_credits = parseInt(info[3][1]);

  return {
    ok: true,
    jfv,
    num_credits,
    tables: {
      info,
    },
  };
}

async function get_credits_data(cardNumber, registration) {
  let req = await fetch(
    'https://si3.ufc.br/public/jsp/restaurante_universitario/consulta_comensal_ru.jsf',
  );
  let html = await req.text();

  const jfv = get_javax_faces_ViewState(html);
  const body = {
    form: 'form',
    'form:j_id_jsp_1091681061_2': cardNumber,
    'form:j_id_jsp_1091681061_3': registration,
    'form:j_id_jsp_1091681061_4': 'Consultar',
    'javax.faces.ViewState': jfv,
  };

  req = await fetch(
    'https://si3.ufc.br/public/jsp/restaurante_universitario/consulta_comensal_ru.jsf',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: form_urlencode(body),
    },
  );

  html = await req.text();

  const data = extract_data(html);

  return data;
}

export {
  get_credits_data,
  handlePIXPayment,
  handleGRUPayment,
  PixWS,
  test_server,
};
