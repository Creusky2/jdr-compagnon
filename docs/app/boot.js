// un fichier de l'application introuvable (page d'une ancienne version restée en cache) :
// un seul rechargement à une adresse neuve plutôt qu'un écran noir
(function () {
  function retry() {
    try {
      if (sessionStorage.getItem('jdr.retry')) return;
      sessionStorage.setItem('jdr.retry', '1');
    } catch (e) {}
    var u = new URL(location.href);
    u.searchParams.set('v', String(Date.now()));
    location.replace(u.href);
  }
  window.addEventListener(
    'error',
    function (e) {
      var t = e.target;
      var src = t && (t.src || t.href);
      if (src && /\/assets\//.test(src)) retry();
    },
    true,
  );
  window.addEventListener('vite:preloadError', retry);
  window.addEventListener('load', function () {
    setTimeout(function () {
      try {
        sessionStorage.removeItem('jdr.retry');
      } catch (e) {}
    }, 5000);
  });
})();
