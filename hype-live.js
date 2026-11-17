// Hype Bot's return since going live, after fees, at 1x, as the Hype dashboard and the
// calculator show it: the published record (dashboards/hype-history.json), rebuilt once a
// month from the master signal list. It fills [data-hype="ret"] with the return
// ("+115.5%"), [data-hype="n"] with the number of live trades and [data-hype="mdd"] with the
// deepest live drawdown; if the file is unreachable the figures written in the page stay.
// A <tbody data-hype="months"> gets one row per month: that month's return and that month's
// worst drop below its own high (month start included), both at 1x after the 0.12% cost,
// measured trade by trade at each close.
(function () {
  var base = document.currentScript ? document.currentScript.src : location.href;
  function fill(key, text) {
    document.querySelectorAll('[data-hype="' + key + '"]').forEach(function (el) { el.textContent = text; });
  }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // live months from the published curve: each point closes one trade
  function months(h) {
    var c = h.curve || [], out = [], cur = null, idx = 1, peak = 1, mdd = 0;
    for (var i = 1; i < c.length; i++) {
      if (c[i].phase !== 'live') continue;
      var g = c[i].v / c[i - 1].v - 1, m = c[i].d.slice(0, 7);
      if (!cur || cur.m !== m) { cur = { m: m, start: idx, hi: idx, dd: 0, n: 0 }; out.push(cur); }
      idx *= 1 + g; cur.n++; cur.end = idx;
      cur.hi = Math.max(cur.hi, idx); cur.dd = Math.min(cur.dd, (idx / cur.hi - 1) * 100);
      peak = Math.max(peak, idx); mdd = Math.min(mdd, (idx / peak - 1) * 100);
    }
    return { rows: out, mdd: mdd };
  }
  function fmt(v) { return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1) + '%'; }
  function ddFmt(v) { return Math.abs(v) < 0.05 ? '0.0%' : '−' + Math.abs(v).toFixed(1) + '%'; }
  function renderMonths(h, M) {
    var body = document.querySelector('[data-hype="months"]');
    if (!body || !M.rows.length) return;
    var first = h.live.from, last = h.live.to;
    body.innerHTML = M.rows.slice().reverse().map(function (r) {
      var p = r.m.split('-'), label = MON[+p[1] - 1] + ' ' + p[0], ret = (r.end / r.start - 1) * 100;
      if (first && first.slice(0, 7) === r.m && +first.slice(8, 10) > 1) label += ' (from ' + (+first.slice(8, 10)) + ')';
      if (last && last.slice(0, 7) === r.m) label += ' (to ' + (+last.slice(8, 10)) + ')';
      return '<tr><td>' + label + '</td><td>' + r.n + '</td><td class="' + (ret >= 0 ? 'up' : 'down') + '">' + fmt(ret) +
        '</td><td class="' + (r.dd <= -0.05 ? 'down' : '') + '">' + ddFmt(r.dd) + '</td></tr>';
    }).join('');
  }
  fetch(new URL('dashboards/hype-history.json', base) + '?t=' + Date.now(), { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (h) {
      if (!h || !h.live || !h.live.agg) return;
      var pct = (h.live.agg.idx - 1) * 100;
      if (!isFinite(pct)) return;
      fill('ret', (pct >= 0 ? '+' : '−') + Math.abs(pct).toFixed(1) + '%');
      fill('n', String(h.live.n));
      var M = months(h);
      if (M.rows.length) fill('mdd', ddFmt(M.mdd));
      renderMonths(h, M);
    })
    .catch(function () {});
})();
