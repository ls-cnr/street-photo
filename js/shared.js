// Luca Sabatucci — Street Photography
// Helper condivisi dalle 3 pagine del sito (index, serie, about): dati letti
// da window.SERIES / window.ABOUT_PHOTO / window.ABOUT_INFO / window.HOME_TITLE
// (generati da admin/lib/buildSite.js in js/data.js), stringhe d'interfaccia,
// lingua persistita in localStorage (il sito non è più una SPA a singola
// pagina con hash: la lingua deve sopravvivere alla navigazione reale tra
// index.html / serie.html / about.html), e le funzioni per costruire
// <picture> responsive riusate da tutte le pagine e da lightbox.js.

const COPY = {
  it: {
    navWork: 'Serie', navAbout: 'Chi sono',
    shots: 'scatti',
    // Fisso, non calcolato dal numero di serie: se cambia il numero di serie
    // aggiornare qui a mano.
    kicker: 'Cinque serie · street photography',
    cta: 'Apri la serie →', backLabel: 'Tutte le serie', scrollHint: 'Scorri ↓',
    aboutTitle: 'Chi sono'
  },
  en: {
    navWork: 'Series', navAbout: 'About',
    shots: 'frames',
    kicker: 'Five series · street photography',
    cta: 'Open the series →', backLabel: 'All series', scrollHint: 'Scroll ↓',
    aboutTitle: 'About'
  }
};

const SERIES = window.SERIES || [];
const ABOUT_PHOTO = window.ABOUT_PHOTO || null;
const ABOUT_INFO = window.ABOUT_INFO || { bio: { it: '', en: '' }, email: '', instagram: '' };
const HOME_TITLE = window.HOME_TITLE || { it: '', en: '' };

function getLang() {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'it';
  } catch (e) {
    return 'it';
  }
}

function setLang(lang) {
  try { localStorage.setItem('lang', lang); } catch (e) { /* private browsing: niente persistenza, va bene comunque */ }
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function debounce(fn, ms) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

const lazySupported = 'IntersectionObserver' in window;

function onIntersect(entries, observer) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    activateImage(entry.target);
    observer.unobserve(entry.target);
  });
}

function activateImage(img) {
  const source = img._lazySource;
  if (source) {
    source.srcset = source.dataset.srcset;
    source.sizes = source.dataset.sizes;
  }
  img.srcset = img.dataset.srcset;
  img.sizes = img.dataset.sizes;
  img.src = img.dataset.src;
}

// Costruisce <picture><source webp><img jpg fallback></picture> per una foto.
// `sizesPx` è già calcolato dal chiamante in base al contesto (griglia home,
// box a piena altezza nella pagina serie, lightbox). Riusata da tutte le
// pagine e da lightbox.js.
function buildPicture(photo, { eager, sizesPx, lazyObserver, fill } = {}) {
  const wrap = el('picture');
  const source = document.createElement('source');
  source.type = 'image/webp';
  const img = document.createElement('img');
  img.alt = '';
  img.decoding = 'async';

  wrap.dataset.aspect = String(photo.aspect);
  // Su <picture> (non replaced element), non su <img>: aspect-ratio insieme
  // a object-fit:contain sull'<img> impedisce il rendering in alcuni browser.
  // Salvo quando la <picture> riempie il contenitore via CSS (position:
  // absolute; inset:0 — le foto a schermo pieno della pagina serie): lì
  // aspect-ratio confligge con inset:0 e vince lui, schiacciando l'altezza
  // alla proporzione della foto invece di riempire tutta la sezione.
  if (!fill) wrap.style.aspectRatio = String(photo.aspect);

  sizesPx = sizesPx || '100vw';
  const webpSrcset = photo.webp.map((v) => `${v.src} ${v.w}w`).join(', ');
  const jpgSrcset = photo.jpg.map((v) => `${v.src} ${v.w}w`).join(', ');
  const fallbackSrc = photo.jpg[photo.jpg.length - 1].src;

  if (eager || !lazySupported || !lazyObserver) {
    source.srcset = webpSrcset;
    source.sizes = sizesPx;
    img.srcset = jpgSrcset;
    img.sizes = sizesPx;
    img.src = fallbackSrc;
  } else {
    source.dataset.srcset = webpSrcset;
    source.dataset.sizes = sizesPx;
    img.dataset.srcset = jpgSrcset;
    img.dataset.sizes = sizesPx;
    img.dataset.src = fallbackSrc;
    img._lazySource = source;
    lazyObserver.observe(img);
  }

  wrap.appendChild(source);
  wrap.appendChild(img);
  return wrap;
}

// Header + footer sono identici (a parte lo stato "active") su index.html e
// about.html: costruiti qui per non duplicare markup tra i due file.
function renderSiteHeader(activeNav, lang) {
  const t = COPY[lang];
  const header = el('header', 'head');
  const logo = el('a', 'logo', 'Luca Sabatucci');
  logo.href = 'index.html';
  header.appendChild(logo);

  const nav = el('nav', 'nav');
  const work = el('a', activeNav === 'work' ? 'active' : '', t.navWork);
  work.href = 'index.html';
  const about = el('a', activeNav === 'about' ? 'active' : '', t.navAbout);
  about.href = 'about.html';
  // Ordine fisso IT poi EN (non si scambia col cambio lingua): quella attiva
  // si distingue in maiuscolo, l'altra resta minuscola — es. "IT / en".
  const langLabel = (lang === 'it' ? 'IT' : 'it') + ' / ' + (lang === 'en' ? 'EN' : 'en');
  const langBtn = el('button', 'lang-btn', langLabel);
  langBtn.type = 'button';
  langBtn.addEventListener('click', function () {
    setLang(lang === 'it' ? 'en' : 'it');
    location.reload();
  });
  nav.appendChild(work);
  nav.appendChild(about);
  nav.appendChild(langBtn);
  header.appendChild(nav);
  return header;
}
