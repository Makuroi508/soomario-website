// Hype Bot's return since going live, after fees, at 1x, as the Hype dashboard and the
// calculator show it: the published record (dashboards/hype-history.json), rebuilt once a
// month from the master signal list. It fills [data-hype="ret"] with the return
// ("+115.5%") and [data-hype="n"] with the number of live trades; if the file is
// unreachable the figures written in the page stay.
(function () {
  var base = document.currentScript ? document.currentScript.src : location.href;
  function fill(key, text) {
    document.querySelectorAll('[data-hype="' + key + '"]').forEach(function (el) { el.textContent = text; });
  }
  fetch(new URL('dashboards/hype-history.json', base) + '?t=' + Date.now(), { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (h) {
      if (!h || !h.live || !h.live.agg) return;
      var pct = (h.live.agg.idx - 1) * 100;
      if (!isFinite(pct)) return;
      fill('ret', (pct >= 0 ? '+' : '−') + Math.abs(pct).toFixed(1) + '%');
      fill('n', String(h.live.n));
    })
    .catch(function () {});
})();
