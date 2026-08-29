// Lightbox a schermo intero per le foto di una serie.
// Riusa el()/buildPicture() definiti in app.js (stessi <script> classici,
// stesso scope top-level).

(function () {
  // Margine minimo: la foto deve occupare il più possibile lo schermo,
  // i controlli restano sovrapposti (vedi .lb-close/.lb-prev/.lb-next).
  const LB_PAD_X = 16;
  const LB_PAD_Y = 16;

  let overlay = null;
  let frame = null;
  let photos = [];
  let index = 0;
  let resizeHandler = null;

  function lightboxSizesPx(aspect) {
    const usableW = Math.max(1, window.innerWidth - LB_PAD_X * 2);
    const usableH = Math.max(1, window.innerHeight - LB_PAD_Y * 2);
    return Math.round(Math.min(usableW, usableH * aspect)) + 'px';
  }

  function prefetch(i) {
    const photo = photos[i];
    if (!photo) return;
    new Image().src = photo.jpg[photo.jpg.length - 1].src;
  }

  function renderCurrent() {
    const photo = photos[index];
    frame.innerHTML = '';
    frame.appendChild(buildPicture(photo, { eager: true, sizesPx: lightboxSizesPx(photo.aspect) }));
    prefetch((index + 1) % photos.length);
    prefetch((index - 1 + photos.length) % photos.length);
  }

  function goTo(newIndex) {
    index = (newIndex + photos.length) % photos.length;
    renderCurrent();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  }

  function close() {
    if (!overlay) return;
    document.removeEventListener('keydown', onKeydown);
    window.removeEventListener('resize', resizeHandler);
    overlay.remove();
    overlay = null;
    document.body.classList.remove('lb-open');
  }

  function build() {
    overlay = el('div', 'lightbox');
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    const closeBtn = el('button', 'lb-close');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Chiudi');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', close);

    const prevBtn = el('button', 'lb-prev');
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Foto precedente');
    prevBtn.textContent = '‹';
    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prev(); });

    const nextBtn = el('button', 'lb-next');
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Foto successiva');
    nextBtn.textContent = '›';
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next(); });

    frame = el('div', 'lb-frame');
    frame.addEventListener('click', function (e) { e.stopPropagation(); });

    overlay.appendChild(closeBtn);
    overlay.appendChild(prevBtn);
    overlay.appendChild(frame);
    overlay.appendChild(nextBtn);
    document.body.appendChild(overlay);
  }

  window.openLightbox = function (photoList, startIndex) {
    photos = photoList;
    index = startIndex || 0;
    build();
    document.body.classList.add('lb-open');
    renderCurrent();
    document.addEventListener('keydown', onKeydown);
    resizeHandler = debounce(renderCurrent, 200);
    window.addEventListener('resize', resizeHandler);
  };
})();
