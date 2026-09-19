// File generato automaticamente da admin/lib/buildSite.js — non modificare a mano.
window.I18N = {
  "it": {
    "nav-series": "Serie",
    "nav-about": "Chi sono",
    "kicker": "street photography",
    "lede": "\"How much could we absorb and embrace of a moment of existence that would disappear in an instant?” — Joel Meyerowitz",
    "cta": "Apri la serie →",
    "serie-label": "Serie",
    "scroll-hint": "Scorri ↓",
    "lang-label": "IT / en",
    "meta-street": "8 scatti",
    "title-street": "strade del mondo",
    "desc-street": "Questa serie cattura il mio personale punto di vista su elementi ordinari e allo stesso tempo eccezionali delle strade in giro per il mondo",
    "meta-saturi": "6 scatti",
    "title-saturi": "saturi",
    "desc-saturi": "Questa serie cattura la mia Palermo giocando con luci, ombre e colori saturi, e creando suggestivi punti di vista sull'ordinarietà",
    "meta-scopa": "8 scatti",
    "title-scopa": "scopa",
    "desc-scopa": "Questo è un progetto che inquadra una abitudine prettamente palermitana di estendere il proprio domicilio all'esterno della soglia, lasciando oggetti (nello specifico la scopa) direttamente per strada.",
    "meta-bus": "2 scatti",
    "title-bus": "gente dei bus",
    "desc-bus": "Questo progetto di street si concentra su ciò che accade a bordo di autobus e tram e alle loro fermate: crocevia urbani attraversati senza sosta da vite, storie e destini diversi",
    "meta-vicoli": "13 scatti",
    "title-vicoli": "vicoli vicoli",
    "desc-vicoli": "I vicoli sono sempre gli stessi, e spesso lo sono anche i bambini che li abitano",
    "about-bio": "Sono un fotografo di strada con base a Palermo. Attraverso le mie immagini esploro la vita urbana e quotidiana, cercando ciò che accade mentre nessuno guarda: piccoli gesti, incontri fugaci, abitudini e coincidenze capaci di trasformare l’ordinario in qualcosa di inatteso.\n\nPalermo è il mio punto di partenza e un soggetto ricorrente: una città che osservo attraverso luci, ombre e colori saturi, nei suoi vicoli, sui mezzi pubblici e lungo quelle soglie dove la vita privata si estende naturalmente nello spazio della strada.\n\nIl mio sguardo si apre anche alle città e alle strade del mondo, alla ricerca di frammenti di vita autentici e irripetibili: scene che esistono per un solo istante e che la fotografia può sottrarre al loro inevitabile scomparire.\n"
  },
  "en": {
    "nav-series": "Series",
    "nav-about": "About",
    "kicker": "street photography",
    "lede": "\"How much could we absorb and embrace of a moment of existence that would disappear in an instant?” — Joel Meyerowitz",
    "cta": "Open the series →",
    "serie-label": "Series",
    "scroll-hint": "Scroll ↓",
    "lang-label": "it / EN",
    "meta-street": "8 frames",
    "title-street": "travel street photography",
    "desc-street": "This series captures my personal take on ordinary yet extraordinary elements found on streets around the world",
    "meta-saturi": "6 frames",
    "title-saturi": "saturated",
    "desc-saturi": "This series captures my Palermo through a play of light, shadow, and saturated colors, offering evocative perspectives on everyday life",
    "meta-scopa": "8 frames",
    "title-scopa": "broom",
    "desc-scopa": "This is a project that captures a distinctly Palermitan custom of extending one's home beyond the threshold, leaving objects (the broom in particular) right out in the street.",
    "meta-bus": "2 frames",
    "title-bus": "life on the bus",
    "desc-bus": "This street photography project focuses on life aboard buses and trams and at their stops—urban crossroads where countless lives, stories, and destinies are constantly passing through",
    "meta-vicoli": "13 frames",
    "title-vicoli": "through the alleys",
    "desc-vicoli": "The alleyways are always the same, and often so are the children who inhabit them",
    "about-bio": "I am a street photographer based in Palermo. Through my images, I explore urban and everyday life, searching for what happens when no one is looking: subtle gestures, fleeting encounters, habits, and coincidences that can transform the ordinary into something unexpected.\n\nPalermo is both my starting point and a recurring subject—a city I observe through light, shadow, and saturated colors, in its alleyways, aboard public transport, and along those thresholds where private life naturally spills into the street.\n\nMy gaze also extends to cities and streets around the world, in search of authentic, unrepeatable fragments of life: scenes that exist for only a moment and that photography can preserve before they inevitably disappear.\n"
  }
};

window.Lang = {
  get: function () {
    try { return localStorage.getItem('sp-lang') || 'it'; } catch (e) { return 'it'; }
  },
  set: function (lang) {
    try { localStorage.setItem('sp-lang', lang); } catch (e) {}
    window.Lang.apply(lang);
  },
  toggle: function () {
    window.Lang.set(window.Lang.get() === 'it' ? 'en' : 'it');
  },
  /* Sostituisce il testo di ogni [data-i18n] con la voce corrispondente del dizionario. */
  apply: function (lang) {
    var dict = window.I18N[lang] || window.I18N.it;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = dict['lang-label'];
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }
};
