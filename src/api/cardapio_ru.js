import AsyncStorage from '@react-native-async-storage/async-storage';
import {decode} from 'html-entities';

const BASE_URL = 'https://sobral.ufc.br/ru/';
const ASYNC_STORAGE_MENU_KEY = 'ufc-sobral-ru@menu';

function get_text(html_str, replacement = '\n') {
  return decode(html_str).replace(/<br>/g, replacement).trim();
}

function extract_columns(row_html) {
  return [...row_html.matchAll(/<td(?:.*?)>(.*?)<\/td>/g)].map(v =>
    get_text(v[1]),
  );
}

function extract_data(rows_html, indexes) {
  // Get table title
  const table_title = get_text(
    rows_html[indexes['title_row']].match(/<td(?:.*?)>(.*?)<\/td>/)[1],
    '',
  );

  // Get table headers
  const table_headers = [
    ...rows_html[indexes['headers_row']].matchAll(/<td(?:.*?)>(.*?)<\/td>/g),
  ].map(m => m[1]);

  // Get table values
  const table_values = [];

  for (let i = indexes['values_rows'][0]; i < indexes['values_rows'][1]; i++) {
    table_values.push(extract_columns(rows_html[i]));
  }

  return {
    title: table_title,
    headers: table_headers,
    values: table_values,
  };
}

async function get_menu() {
  // Get spreadsheet url
  let req = await fetch(BASE_URL);
  let html = await req.text();

  const spreadsheet_url = html.match(/<iframe(?:.*?) src="(.*?)"/)[1];

  // Get table html
  req = await fetch(spreadsheet_url);
  html = await req.text();

  const table_html = html.match(/<table(?:.*?)>(?:(.|\n|\t|\r)*?)<\/table>/)[0];

  // Get rows
  const rows_html = [
    ...table_html.matchAll(/<tr(?:.*?)>(.*?)<\/tr>/g, table_html),
  ].map(m => m[1]);

  const lunch_table = extract_data(rows_html, {
    title_row: 1,
    headers_row: 2,
    values_rows: [3, 9],
  });

  const dinner_table = extract_data(rows_html, {
    title_row: 11,
    headers_row: 12,
    values_rows: [13, 19],
  });

  return {
    tables: {
      lunch: lunch_table,
      dinner: dinner_table,
    },
    footnotes: ['*Contém LEITE/LACTOSE', '**Contém GLÚTEN'],
  };
}

async function get_cached_menu() {
  const today = new Date().toDateString();

  let data = await AsyncStorage.getItem(ASYNC_STORAGE_MENU_KEY);

  if (data != null) {
    data = JSON.parse(data);

    if (data.day === today) {
      console.log('Menu data is cached');
      return data.menu;
    }
  }

  const menu = await get_menu();
  await AsyncStorage.setItem(
    ASYNC_STORAGE_MENU_KEY,
    JSON.stringify({
      day: today,
      menu,
    }),
  );

  console.log('Menu data is not cached');

  return menu;
}

export {get_menu, get_cached_menu};
