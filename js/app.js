// Luca Sabatucci — Street Photography
// Motore di rendering: legge i contenuti da window.SERIES / window.ABOUT_PHOTO
// / window.ABOUT_INFO / window.HOME_TITLE (generati da admin/lib/buildSite.js
// in js/data.js) e li disegna nello stage. Il testo dell'interfaccia (non
// foto/bio/titolo home) resta qui, in COPY.

const COPY = {
  it: {
    navWork: 'Serie', navAbout: 'Chi sono', langLabel: 'IT / EN',
    homeLabel: 'PROGETTI', scrollHint: 'SCORRI →', shots: 'scatti',
    aboutTitle: 'Chi sono'
  },
  en: {
    navWork: 'Series', navAbout: 'About', langLabel: 'EN / IT',
    homeLabel: 'PROJECTS', scrollHint: 'SCROLL →', shots: 'photographs',
    aboutTitle: 'About'
  }
};

const SERIES = window.SERIES || [];
const ABOUT_PHOTO = window.ABOUT_PHOTO || null;
const ABOUT_INFO = window.ABOUT_INFO || { bio: { it: '', en: '' }, email: '', instagram: '' };
const HOME_TITLE = window.HOME_TITLE || { it: '', en: '' };

const state = { view: 'home', serie: null, lang: 'it' };
const stage = document.getElementById('stage');
const switcher = document.getElementById('switch');

const LAZY_MARGIN = '0px 800px 0px 800px';
const EAGER_COUNT = 2; // le prime N plate caricano subito, come prima

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
const lazyObserver = lazySupported
  ? new IntersectionObserver(onIntersect, { root: stage, rootMargin: LAZY_MARGIN })
  : null;

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
// `sizesPx` è già calcolato dal chiamante: le plate lo derivano dall'altezza
// dello stage (height:100%; width:auto — non è un layout width-driven come
// nel caso tipico), il lightbox dal viewport intero. Riusata da lightbox.js.
function buildPicture(photo, { eager, sizesPx }) {
  const wrap = el('picture');
  const source = document.createElement('source');
  source.type = 'image/webp';
  const img = document.createElement('img');
  img.alt = '';
  img.decoding = 'async';

  wrap.dataset.aspect = String(photo.aspect);
  // Nota prima che l'immagine sia scaricata: senza questo, .plate non ha una
  // larghezza nota finché il file non arriva, e updateSerieFocus() calcolato
  // subito dopo il render vedrebbe box larghi 0 (o collassati). Solo su
  // <picture> (non replaced element): su <img> insieme a object-fit:contain
  // impedisce il rendering dell'immagine in alcuni browser.
  wrap.style.aspectRatio = String(photo.aspect);

  sizesPx = sizesPx || '100vw';
  const webpSrcset = photo.webp.map((v) => `${v.src} ${v.w}w`).join(', ');
  const jpgSrcset = photo.jpg.map((v) => `${v.src} ${v.w}w`).join(', ');
  const fallbackSrc = photo.jpg[photo.jpg.length - 1].src;

  if (eager || !lazySupported) {
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

function stageSizesPx(stageHeight, aspect) {
  return stageHeight ? `${Math.round(stageHeight * aspect)}px` : undefined;
}

function plate(photo, index, { stageHeight, eager, onClick, zoomable } = {}) {
  const p = el('div', 'plate' + (zoomable ? ' zoomable' : ''));
  // Sempre presente (anche vuoto): senza titolo su alcune foto della serie e
  // non su altre, le immagini partivano da altezze diverse — uno "scalino".
  // Riservando sempre la stessa riga, i top delle foto restano allineati.
  p.appendChild(el('div', 'photo-title', photo.title || ''));
  p.appendChild(buildPicture(photo, { eager, sizesPx: stageSizesPx(stageHeight, photo.aspect) }));
  const bits = [];
  if (photo.place) bits.push(photo.place);
  if (photo.year) bits.push(String(photo.year));
  const num = String(index + 1).padStart(2, '0');
  p.appendChild(el('div', 'caption', num + (bits.length ? ' · ' + bits.join(', ') : '')));
  if (onClick) p.addEventListener('click', onClick);
  return p;
}

// Copertina più piccola dell'intera altezza dello stage: il resto è occupato
// dal riquadro descrizione a fianco. Solo per la home.
const HOME_COVER_RATIO = 0.6;

function renderHome(t, stageHeight) {
  const intro = el('div', 'intro home');
  intro.appendChild(el('h1', null, HOME_TITLE[state.lang] || ''));
  intro.appendChild(el('div', 'meta', t.homeLabel));
  stage.appendChild(intro);

  const coverHeight = Math.round(stageHeight * HOME_COVER_RATIO);

  SERIES.forEach(function (s, i) {
    const cover = s.photos[s.coverIndex] || s.photos[0];
    const entry = el('div', 'series-entry');

    entry.appendChild(el('h3', 'series-title', s.title[state.lang]));

    const row = el('div', 'series-row');

    const media = el('div', 'series-media');
    media.style.height = coverHeight + 'px';
    media.appendChild(buildPicture(cover, { eager: i < EAGER_COUNT, sizesPx: stageSizesPx(coverHeight, cover.aspect) }));
    media.addEventListener('click', function () { open(s.id); });
    row.appendChild(media);

    const desc = el('div', 'series-desc');
    const descText = (s.description && s.description[state.lang]) || '';
    if (descText) desc.appendChild(el('p', null, descText));
    row.appendChild(desc);

    entry.appendChild(row);
    stage.appendChild(entry);
  });
}

function renderSerie(t, stageHeight) {
  const s = SERIES.find(function (x) { return x.id === state.serie; });
  const intro = el('div', 'intro serie');
  intro.appendChild(el('h1', null, s.title[state.lang]));
  const metaBits = [];
  if (s.years) metaBits.push(s.years);
  metaBits.push(s.count + ' ' + t.shots);
  intro.appendChild(el('div', 'meta', metaBits.join(' · ')));
  stage.appendChild(intro);

  s.photos.forEach(function (photo, i) {
    const p = plate(photo, i, {
      stageHeight,
      eager: i < EAGER_COUNT,
      zoomable: true,
      onClick: function () { window.openLightbox(s.photos, i); }
    });
    stage.appendChild(p);
  });
}

function renderAbout(t, stageHeight) {
  const wrap = el('div', 'about');
  if (ABOUT_PHOTO) {
    wrap.appendChild(buildPicture(ABOUT_PHOTO, { eager: true, sizesPx: stageSizesPx(stageHeight, ABOUT_PHOTO.aspect) }));
  }
  const text = el('div', 'text');
  text.appendChild(el('h2', null, t.aboutTitle));
  const bio = (ABOUT_INFO.bio && ABOUT_INFO.bio[state.lang]) || '';
  if (bio) text.appendChild(el('p', null, bio));

  const c = el('div', 'contacts');
  if (ABOUT_INFO.email) {
    const a = document.createElement('a');
    a.href = 'mailto:' + ABOUT_INFO.email;
    a.textContent = ABOUT_INFO.email;
    c.appendChild(a);
  }
  if (ABOUT_INFO.instagram) {
    const handle = ABOUT_INFO.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
    const a = document.createElement('a');
    a.href = 'https://instagram.com/' + handle;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = '@' + handle;
    c.appendChild(a);
  }
  if (c.children.length) text.appendChild(c);

  wrap.appendChild(text);
  stage.appendChild(wrap);
}

function renderSwitch() {
  switcher.innerHTML = '';
  SERIES.forEach(function (s) {
    const a = el('a', state.serie === s.id ? 'active' : '', s.title[state.lang]);
    a.href = '#' + s.id;
    a.addEventListener('click', function (e) { e.preventDefault(); open(s.id); });
    switcher.appendChild(a);
  });
}

// Nella vista serie, la foto più vicina al centro dello stage resta a piena
// opacità; le altre si attenuano, per non competere visivamente con quella
// che si sta guardando in quel momento. Basato su IntersectionObserver (non
// su un listener 'scroll' con getBoundingClientRect): quest'ultimo approccio
// forza un layout sincrono ad ogni frame e va in conflitto con l'animazione
// nativa dello scroll-snap, causando scatti e mancati agganci alla foto
// successiva. IntersectionObserver è calcolato dal browser fuori dal thread
// di scroll, quindi non ha questo problema.
const FOCUS_MIN_OPACITY = 0.14;
const FOCUS_THRESHOLDS = Array.from({ length: 21 }, function (_, i) { return i / 20; });

let serieFocusObserver = null;

function onSerieFocusIntersect(entries) {
  entries.forEach(function (entry) {
    const opacity = Math.max(FOCUS_MIN_OPACITY, entry.intersectionRatio);
    entry.target.style.opacity = opacity.toFixed(3);
  });
}

function setupSerieFocus() {
  if (serieFocusObserver) serieFocusObserver.disconnect();
  if (state.view !== 'serie') return;
  serieFocusObserver = new IntersectionObserver(onSerieFocusIntersect, {
    root: stage,
    threshold: FOCUS_THRESHOLDS
  });
  stage.querySelectorAll('.plate').forEach(function (plate) {
    serieFocusObserver.observe(plate);
  });
}

function render() {
  const t = COPY[state.lang];
  document.documentElement.lang = state.lang;
  if (lazySupported) lazyObserver.disconnect();
  stage.innerHTML = '';
  stage.className = 'stage' +
    (state.view === 'about' ? ' about-view' : '') +
    (state.view === 'serie' ? ' serie-view' : '');

  const stageHeight = stage.clientHeight;
  if (state.view === 'home') renderHome(t, stageHeight);
  else if (state.view === 'serie') renderSerie(t, stageHeight);
  else renderAbout(t, stageHeight);

  document.querySelectorAll('[data-i18n]').forEach(function (n) { n.textContent = t[n.dataset.i18n]; });
  document.getElementById('hint').textContent = state.view === 'about' ? '' : t.scrollHint;
  document.querySelectorAll('.nav a[data-nav]').forEach(function (n) {
    n.classList.toggle('active', (n.dataset.nav === 'about') === (state.view === 'about'));
  });
  renderSwitch();
  // Non stage.scrollLeft = 0: .intro ha scroll-snap-align:start, quindi 0 è
  // il SUO punto di aggancio, non quello della prima foto (align:center).
  // Il primo gesto di scroll dell'utente "spendeva" il proprio movimento
  // solo per agganciarsi alla prima foto invece di passare alla seconda —
  // sembrava uno scatto a vuoto. Si parte già esattamente sul punto di
  // aggancio della prima foto, così il primo scroll va davvero alla seconda.
  const firstPlate = stage.querySelector('.plate');
  stage.scrollLeft = firstPlate
    ? firstPlate.offsetLeft + firstPlate.offsetWidth / 2 - stage.clientWidth / 2
    : 0;
  setupSerieFocus();
}

function recomputeSizes() {
  const h = stage.clientHeight;
  if (!h) return;
  stage.querySelectorAll('picture[data-aspect]').forEach(function (pic) {
    const aspect = parseFloat(pic.dataset.aspect);
    const sizesPx = Math.round(h * aspect) + 'px';
    const source = pic.querySelector('source');
    const img = pic.querySelector('img');
    if (source) {
      if (source.hasAttribute('sizes')) source.sizes = sizesPx; else source.dataset.sizes = sizesPx;
    }
    if (img.hasAttribute('sizes')) img.sizes = sizesPx; else img.dataset.sizes = sizesPx;
  });
}

// Un solo punto di verità per lo stato di navigazione: legge l'hash e
// disegna la vista corrispondente. Chiamato al caricamento, e ogni volta
// che l'hash cambia (link diretto, tasto Indietro/Avanti del browser),
// non solo quando l'utente clicca dentro la pagina.
function syncFromHash() {
  const hash = location.hash.replace('#', '');
  if (hash === 'chi-sono' || hash === 'about') {
    state.view = 'about';
    state.serie = null;
  } else if (SERIES.some(function (s) { return s.id === hash; })) {
    state.view = 'serie';
    state.serie = hash;
  } else {
    state.view = 'home';
    state.serie = null;
  }
  render();
}

function open(id) {
  if (location.hash.replace('#', '') === id) { syncFromHash(); return; }
  location.hash = id;
}

document.querySelectorAll('[data-nav]').forEach(function (n) {
  n.addEventListener('click', function (e) {
    e.preventDefault();
    const target = n.dataset.nav === 'about' ? 'chi-sono' : '';
    if (location.hash.replace('#', '') === target) { syncFromHash(); return; }
    location.hash = target;
  });
});

document.getElementById('lang').addEventListener('click', function (e) {
  e.preventDefault();
  state.lang = state.lang === 'it' ? 'en' : 'it';
  render();
});

window.addEventListener('resize', debounce(recomputeSizes, 200));
window.addEventListener('hashchange', syncFromHash);

syncFromHash();
