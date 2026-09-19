/* Lightbox a schermo intero per vedere la foto senza il ritaglio "cover"
   della pagina serie. Legge le immagini direttamente dal DOM statico (ogni
   .screen-photo ha già la sua <picture> con lo srcset reale) invece che da
   un elenco JS separato. */
(function () {
  var overlay, frame, sections, index = 0;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    var closeBtn = document.createElement('button');
    closeBtn.className = 'lb-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Chiudi');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', close);

    var prevBtn = document.createElement('button');
    prevBtn.className = 'lb-prev';
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Foto precedente');
    prevBtn.textContent = '‹';
    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prev(); });

    var nextBtn = document.createElement('button');
    nextBtn.className = 'lb-next';
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Foto successiva');
    nextBtn.textContent = '›';
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next(); });

    frame = document.createElement('div');
    frame.className = 'lb-frame';
    frame.addEventListener('click', function (e) { e.stopPropagation(); });

    overlay.appendChild(closeBtn);
    overlay.appendChild(prevBtn);
    overlay.appendChild(frame);
    overlay.appendChild(nextBtn);
    document.body.appendChild(overlay);
  }

  function renderCurrent() {
    var srcImg = sections[index].querySelector('img');
    frame.innerHTML = '';
    var img = document.createElement('img');
    img.src = srcImg.currentSrc || srcImg.src;
    img.alt = srcImg.alt || '';
    frame.appendChild(img);
  }

  function goTo(i) {
    index = (i + sections.length) % sections.length;
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
    overlay.remove();
    overlay = null;
    document.body.classList.remove('lb-open');
  }

  window.openLightbox = function (startIndex) {
    sections = document.querySelectorAll('.screen-photo');
    index = startIndex || 0;
    build();
    document.body.classList.add('lb-open');
    renderCurrent();
    document.addEventListener('keydown', onKeydown);
  };
})();
