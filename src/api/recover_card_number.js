import {form_urlencode} from '../utils/functions';

function extract_data(html) {
  const cells = [...html.matchAll(/<td>((?:.|\n|\r|\t)*?)<\/td>/g)]
    .map(m => m[1])
    .slice(0, 4);

  // Strip meals number
  cells[3] = cells[3].trim().replace(/<span (.*?)>|<\/span>/g, '');

  const headers = ['Código', 'Situação', 'Tipo de Vínculo', 'Refeições'];

  return headers.map((header, idx) => [header, cells[idx]]);
}

function extract_registration(html) {
  const divAgendaAluno = html.match(
    /<div id="agenda-aluno">((?:.|\n|\r|\t)*?)<\/div>/,
  );

  const cells = [...html.matchAll(/<td>(.*?)<\/td>/g)].map(m => m[1]);

  return cells[3].trim();
}

export async function recover_card_number(username, password) {
  console.log('Trying to recover card number');
  let req, html, body;

  req = await fetch('https://si3.ufc.br/sipac/login.jsf');
  html = await req.text();

  body = {
    width: 1920,
    height: 1080,
    login: username,
    senha: password,
    entrar: 'Entrar',
  };

  req = await fetch('https://si3.ufc.br/sipac/logon.do', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: form_urlencode(body),
  });

  html = await req.text();

  const error = html.match(/e\/ou senha/) !== null;

  if (error) {
    return {
      ok: false,
      errors: ['Usuário e/ou senha inválidos!'],
    };
  }

  const registration = extract_registration(html);

  body = {
    formmenuadm: 'formmenuadm',
    jscook_action: 'formmenuadm_menuaaluno_menu:A]#{ saldoCartao.iniciar }',
    'javax.faces.ViewState': 'j_id1',
  };

  req = await fetch('https://si3.ufc.br/sipac/portal_aluno/index.jsf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: form_urlencode(body),
  });

  html = await req.text();

  const ru_data = extract_data(html);

  return {
    ok: true,
    data: {
      table: [['Matrícula', registration], ...ru_data],
      registration,
      cardNumber: ru_data[0][1],
    },
  };
}
