/* Pagina serie: scorrimento verticale con snap obbligatorio.
   - indice corrente ricavato dalla posizione di scorrimento
   - titolo della foto e contatore nella barra alta (vuoti sulla schermata di apertura)
   - dopo l'ultima foto c'è una schermata nera (.screen-end): solo quando la
     si raggiunge davvero (uno scroll deliberato in più, non la coda dello
     stesso gesto che ha portato all'ultima foto) si torna al titolo
   File generico e uguale per ogni serie: il testo introduttivo/il numero di
   scatti nelle due lingue sono letti da attributi data-* su #serie-intro
   (non da un dizionario scritto a mano per ogni pagina). */
(function () {
  var scroller, photos, nameEl, counterEl, progressEl;
  var index = 0;
  var returnTimer = null;

  function pad(n) { return String(n).padStart(2, '0'); }

  function render() {
    var lang = window.Lang.get();
    if (index >= 1 && index <= photos.length) {
      var el = photos[index - 1];
      nameEl.textContent = el.getAttribute(lang === 'en' ? 'data-title-en' : 'data-title-it') || '';
      counterEl.textContent = pad(index);
    } else {
      nameEl.textContent = '';
      counterEl.textContent = '';
    }
    progressEl.style.width = Math.round((index / (photos.length + 1)) * 100) + '%';
  }

  function onScroll() {
    var i = Math.round(scroller.scrollTop / scroller.clientHeight);
    if (i === index) return;
    index = i;
    render();
    clearTimeout(returnTimer);
    // La schermata nera (l'ultima, subito dopo le foto) è il segnale
    // esplicito di fine serie: solo arrivandoci davvero (uno scroll in più
    // rispetto all'ultima foto, non un rimbalzo dello stesso gesto) si
    // torna al titolo, dopo una breve pausa perché si faccia notare.
    if (index === photos.length + 1) {
      returnTimer = setTimeout(function () {
        scroller.scrollTo({ top: 0, behavior: 'smooth' });
      }, 550);
    }
  }

  function applyIntro(lang) {
    var wrap = document.getElementById('serie-intro');
    var intro = document.getElementById('serie-text');
    var count = document.getElementById('serie-count');
    if (!wrap) return;
    if (intro) intro.textContent = wrap.getAttribute('data-intro-' + lang) || '';
    if (count) count.textContent = wrap.getAttribute('data-count-' + lang) || '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    scroller = document.getElementById('scroller');
    photos = scroller.querySelectorAll('.screen-photo');
    nameEl = document.getElementById('photo-name');
    counterEl = document.getElementById('counter');
    progressEl = document.getElementById('progress');

    photos.forEach(function (section, i) {
      section.addEventListener('click', function () {
        if (window.openLightbox) window.openLightbox(i);
      });
    });

    var lang = window.Lang.get();
    applyIntro(lang);
    window.Lang.apply(lang);
    scroller.addEventListener('scroll', onScroll, { passive: true });
    render();
  });

  document.addEventListener('langchange', function (e) {
    applyIntro(e.detail.lang);
    render();
  });
})();
