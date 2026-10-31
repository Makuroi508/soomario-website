// Hype Bot's return since going live, after fees, worked out exactly as the Hype dashboard
// and the calculator do: the published record (dashboards/hype-history.json), then every
// trade the engine has closed since, from its public feed. It fills [data-hype="ret"]
// with the return ("+105%") and [data-hype="n"] with the number of live trades; if either
// file is unreachable the figures written in the page stay.
(function () {
  var base = document.currentScript ? document.currentScript.src : location.href;
  var nocache = { cache: 'no-store' };
  function fill(key, text) {
    document.querySelectorAll('[data-hype="' + key + '"]').forEach(function (el) { el.textContent = text; });
  }
  fetch(new URL('dashboards/hype-history.json', base) + '?t=' + Date.now(), nocache)
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (h) {
      if (!h || !h.live || !h.live.agg || !h.trades || !h.trades.length) return;
      return fetch('https://engine.soomariostrategies.com/public/reference-trades.json', nocache)
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; })
        .then(function (f) {
          var idx = h.live.agg.idx, n = h.live.n, fee = h.commission_pct,
              lastC = h.trades[h.trades.length - 1].c;
          ((f && f.trades) || []).forEach(function (t) {
            if (!(t.o && t.c && t.ein > 0 && t.exi > 0 && t.o > lastC)) return;
            var g = t.side === 'long' ? t.exi / t.ein - 1 : (t.ein - t.exi) / t.ein;
            idx *= 1 + (g * 100 - fee) / 100; n++;
          });
          var pct = (idx - 1) * 100;
          if (!isFinite(pct)) return;
          fill('ret', (pct >= 0 ? '+' : '−') + Math.round(Math.abs(pct)) + '%');
          fill('n', String(n));
        });
    })
    .catch(function () {});
})();
