// Site de présentation : lien de téléchargement de la dernière version (GitHub), demande par
// formulaire (adresse d'envoi réglée par l'éditeur) ou par courriel préparé, nouveautés.
(function () {
  'use strict';
  var cfg = window.JDR_SITE || {};
  var releases = 'https://github.com/' + cfg.owner + '/' + cfg.repo + '/releases/latest';

  // ---------- téléchargement : l'installateur de la dernière version ----------
  var links = document.querySelectorAll('[data-download]');
  links.forEach(function (a) {
    a.href = releases;
  });
  var all = document.getElementById('releases');
  if (all) all.href = 'https://github.com/' + cfg.owner + '/' + cfg.repo + '/releases';
  if (cfg.owner && window.fetch) {
    fetch('https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo + '/releases/latest', {
      headers: { accept: 'application/vnd.github+json' },
    })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (rel) {
        if (!rel || !rel.assets) return;
        var setup = rel.assets.filter(function (x) {
          return /Setup-.*\.exe$/i.test(x.name);
        })[0];
        if (!setup) return;
        links.forEach(function (a) {
          a.href = setup.browser_download_url;
        });
        var v = document.getElementById('version');
        var mb = Math.round(setup.size / 1048576);
        var when = rel.published_at
          ? new Date(rel.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
          : '';
        if (v)
          v.textContent =
            'Version ' +
            String(rel.tag_name || '').replace(/^v/, '') +
            (when ? ' du ' + when : '') +
            ' · ' +
            mb +
            ' Mo · Windows 10 et 11, 64 bits. Les mises à jour arrivent ensuite toutes seules.';
      })
      .catch(function () {
        /* hors ligne ou limite de l'API : le lien vers la page des versions reste */
      });
  }

  // ---------- nouveautés de la dernière version ----------
  var news = document.getElementById('news');
  if (news && cfg.news && cfg.news.length) {
    news.textContent = '';
    cfg.news.forEach(function (line) {
      var li = document.createElement('li');
      li.textContent = line;
      news.appendChild(li);
    });
  }
  var copy = document.getElementById('copyright');
  if (copy) copy.textContent = '© ' + new Date().getFullYear() + ' ' + (cfg.publisher || '') + ' · ' + (cfg.product || 'JDR Compagnon');

  // ---------- demande ----------
  var form = document.getElementById('request');
  var status = document.getElementById('r-status');
  var mailbox = document.getElementById('r-mailbox');
  var address = document.getElementById('r-address');
  var KINDS = {
    invitation: 'Invitation à l’édition Pro',
    question: 'Question',
    probleme: 'Problème avec l’application',
    contenu: 'Proposition d’aventure ou de carte',
  };
  function say(text, kind) {
    status.textContent = text;
    status.className = 'status' + (kind ? ' ' + kind : '');
  }
  if (address) address.textContent = cfg.supportEmail || '';
  document.getElementById('r-copy').addEventListener('click', function () {
    var text = cfg.supportEmail || '';
    var done = function () {
      say('Adresse copiée.', 'ok');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      kind: form.kind.value,
      message: form.message.value.trim(),
    };
    if (!data.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
      say('Indiquez votre prénom et une adresse e-mail valable, pour qu’on puisse vous répondre.', 'err');
      return;
    }
    // service de formulaire réglé par l'éditeur (Formspree, Tally…) : la demande part directement
    if (cfg.requestUrl) {
      say('Envoi…');
      fetch(cfg.requestUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          nom: data.name,
          email: data.email,
          demande: KINDS[data.kind],
          message: data.message,
          _subject: KINDS[data.kind] + ' — ' + data.name,
        }),
      })
        .then(function (r) {
          if (!r.ok) throw new Error(String(r.status));
          form.reset();
          say('Demande envoyée. Réponse par e-mail dans les prochains jours.', 'ok');
        })
        .catch(function () {
          say('L’envoi n’a pas abouti. Réessayez, ou écrivez directement à l’adresse ci-dessous.', 'err');
          mailbox.hidden = !cfg.supportEmail;
        });
      return;
    }
    if (!cfg.supportEmail) {
      say('Les demandes ne sont pas encore ouvertes : revenez bientôt.', 'err');
      return;
    }
    // sinon : un courriel prêt à partir dans la messagerie du visiteur
    var subject = KINDS[data.kind] + ' — ' + data.name;
    var body = 'Bonjour,\n\n' + (data.message || '') + '\n\n' + data.name + ' (' + data.email + ')';
    window.location.href = 'mailto:' + cfg.supportEmail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    say('Votre messagerie s’ouvre avec la demande prête : il reste à l’envoyer.', 'ok');
    mailbox.hidden = false;
  });
})();
