function isEmpty(obj) {
  return (
    obj && // 👈 null and undefined check
    Object.keys(obj).length === 0 &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
}

function form_urlencode(obj) {
  const body = [];

  for (let key in obj) {
    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(obj[key]);

    body.push(encodedKey + '=' + encodedValue);
  }

  return body.join('&');
}

function get_javax_faces_ViewState(html) {
  return html.match(
    /<input type="hidden" name="javax.faces.ViewState" id="javax.faces.ViewState" value="(.*?)" \/>/,
  )[1];
}

function format_date(str, include_hours = true) {
  const date = new Date(str);

  const d = date.getUTCDate().toString().padStart(2, '0');
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const Y = date.getUTCFullYear().toString();

  let f = `${d}/${m}/${Y}`;

  if (include_hours) {
    const H = date.getUTCHours().toString().padStart(2, '0');
    const i = date.getUTCMinutes().toString().padStart(2, '0');
    const s = date.getUTCSeconds().toString().padStart(2, '0');

    f += ` ${H}:${i}:${s}`;
  }

  return f;
}

function random_word(len) {
  const list = '0123456789abcdefghijklmnopqrstuvwxyz';

  let word = '';
  for (let i = 0; i < len; i++) {
    word += list[Math.floor(Math.random() * list.length)];
  }

  return word;
}

export {
  isEmpty,
  form_urlencode,
  get_javax_faces_ViewState,
  format_date,
  random_word,
};
