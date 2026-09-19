// Pagina Chi sono: foto + bio + contatti, stessa intestazione/piè di pagina
// delle altre pagine.

const lang = getLang();
const t = COPY[lang];
document.documentElement.lang = lang;
document.title = t.aboutTitle + ' — Luca Sabatucci';

const root = document.getElementById('root');
root.appendChild(renderSiteHeader('about', lang));

const wrap = el('div', 'about-body');

if (ABOUT_PHOTO) {
  const media = el('div', 'about-media');
  media.appendChild(buildPicture(ABOUT_PHOTO, { eager: true, sizesPx: '420px' }));
  wrap.appendChild(media);
}

const text = el('div', 'about-text');
text.appendChild(el('h1', 'about-title', t.aboutTitle));
const bio = (ABOUT_INFO.bio && ABOUT_INFO.bio[lang]) || '';
if (bio) text.appendChild(el('p', 'about-bio', bio));

const contacts = el('div', 'about-contacts');
if (ABOUT_INFO.email) {
  const a = document.createElement('a');
  a.href = 'mailto:' + ABOUT_INFO.email;
  a.textContent = ABOUT_INFO.email;
  contacts.appendChild(a);
}
if (ABOUT_INFO.instagram) {
  const handle = ABOUT_INFO.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
  const a = document.createElement('a');
  a.href = 'https://instagram.com/' + handle;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = '@' + handle;
  contacts.appendChild(a);
}
if (contacts.children.length) text.appendChild(contacts);

wrap.appendChild(text);
root.appendChild(wrap);

const foot = el('footer', 'foot');
foot.appendChild(el('span', null, '© Luca Sabatucci'));
foot.appendChild(el('span', null, 'Palermo'));
root.appendChild(foot);
