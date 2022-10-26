import {form_urlencode} from '../utils/functions';

function check_errors(html) {
  // The character 'ã' of 'Não' is not decoded correctly, because req.text()
  // decodes as utf8 and si3 uses iso8859-1.
  const error = html.indexOf('o existem dados a serem exibidos.') > -1;

  if (!error) {
    return [];
  }

  return ['Não existem dados a serem exibidos.'];
}

function extract_available_meals(html) {
  const indexes = [
    ['Nome', 1],
    ['Créditos', 3],
  ];

  const cells = [...html.matchAll(/<td nowrap="nowrap">(.*?)<\/td>/g)].map(
    m => m[1],
  );

  return indexes.map(([key, index]) => [key, cells[index]]);
}

// Remove this function, decode the html as iso8859-1
function fix_operations_encoding(text) {
  if (text.startsWith('Utiliza')) {
    return 'Utilização do Cartão';
  } else if (text.indexOf('Almo') > -1) {
    return 'Refeitório: Almoço';
  } else if (text.indexOf('Jantar') > -1) {
    return 'Refeitório: Jantar';
  } else if (text.indexOf('Compra') > -1) {
    return 'Compra de Créditos';
  } else if (text.indexOf('Qtd') > -1) {
    const parts = text.split(' <br/>').map(t => t.trim());
    parts[0] = 'Qtd. Créditos: ' + parts[0].match(/: (\d+)/)[1];

    return parts.join('\n');
  }

  return text;
}

function extract_operations(html) {
  const cells = [
    ...html.matchAll(/<td nowrap="nowrap">((?:.|\n)*?)<\/td>/g),
  ].map(m => fix_operations_encoding(m[1].trim()));

  const data = [];

  for (let i = 0; i < cells.length / 3; i++) {
    data.push({
      date: cells[3 * i],
      operation: cells[3 * i + 1],
      details: cells[3 * i + 2],
    });
  }

  return data;
}

function extract_data(html) {
  const errors = check_errors(html);

  if (errors.length) {
    return {
      ok: false,
      errors,
    };
  } else {
    const tables_html = [
      ...html.matchAll(/<table(?:.*?)>((?:.|\n)*?)<\/table>/g),
    ].map(m => m[1]);

    const available_meals = extract_available_meals(tables_html[1]);
    const operations = extract_operations(tables_html[2]);

    return {
      ok: true,
      tables: {
        available_meals,
        operations,
      },
    };
  }
}

async function get_history(cardNumber, registration) {
  const body = {
    codigoCartao: cardNumber,
    matriculaAtreladaCartao: registration,
  };

  const req = await fetch(
    'https://si3.ufc.br/public/restauranteConsultarSaldo.do',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: form_urlencode(body),
    },
  );

  const html = await req.text();
  const data = extract_data(html);

  return data;
}

export {get_history};
