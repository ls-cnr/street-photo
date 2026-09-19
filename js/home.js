/* Home: solo l'interruttore di lingua. */
document.addEventListener('DOMContentLoaded', function () {
  window.Lang.apply(window.Lang.get());
  var btn = document.getElementById('lang-toggle');
  if (btn) btn.addEventListener('click', window.Lang.toggle);
});
