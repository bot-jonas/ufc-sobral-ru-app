import {decode} from 'html-entities';
import {form_urlencode, get_javax_faces_ViewState} from '../utils/functions';

function check_errors(html) {
  const ul_errors = html.match(/<ul class="erros">((?:.|\n)*?)<\/ul>/);

  if (ul_errors == null) {
    return [];
  }

  const errors = [...ul_errors[1].matchAll(/<li>(.*?)<\/li>/g)].map(m =>
    decode(m[1]),
  );

  return errors;
}

function extract_data(html) {
  const errors = check_errors(html);

  if (errors.length) {
    return {
      ok: false,
      errors,
    };
  } else {
    // const table_html = html.match(/<table(?:.*?)>((?:.|\n)*?)<\/table>/)[1];

    // const headers = [
    //   'Matrícula',
    //   'Nome',
    //   'Vínculo',
    //   'Saldo Atual',
    //   'Valor por Crédito',
    // ];

    // const values = [
    //   ...table_html.matchAll(/<td(?:.*?)>((?:.|\n)*?)<\/td>/g, table_html),
    // ].map((m, idx) => [headers[idx], m[1].trim()]);

    return {
      ok: true,
      //   values,
    };
  }
}

async function get_user_data(cardNumber, registration) {
  let req = await fetch(
    'https://si3.ufc.br/public/jsp/restaurante_universitario/consulta_comensal_ru.jsf',
  );
  let html = await req.text();

  // Get info from RU
  const jfv = get_javax_faces_ViewState(html);

  const body = {
    form: 'form',
    'form:j_id_jsp_1091681061_2': cardNumber,
    'form:j_id_jsp_1091681061_3': registration,
    'form:j_id_jsp_1091681061_4': 'Consultar',
    'javax.faces.ViewState': jfv,
  };

  req = await fetch(
    `https://si3.ufc.br/public/jsp/restaurante_universitario/consulta_comensal_ru.jsf`,
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

export {get_user_data};
