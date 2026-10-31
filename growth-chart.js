// The site's growth chart. Built from Tide's live dashboard chart (the line, a gold fill,
// the drawdown shaded underneath, a crosshair) with the Accumulator's dashed high-water
// mark, and a live/backtest split for records that begin with a backtest. Plain SVG, no
// library. It is drawn at the box's real width, so the labels stay readable on a phone.
//
//   GrowthChart(box, {
//     points:  [{t: unix seconds, v: index (any base), phase: 'backtest' | 'live'}, ...],
//     measure: 'ret' (% since the first point shown) | 'usd' (that growth on `start` dollars),
//     start:   10000,
//     liveFrom: unix seconds where the live part begins (optional),
//   })
// Colours come from CSS custom properties on the page: --c (the line), --ink-2, --ink-3,
// --brass. The tooltip is an absolutely placed .gc-tip inside the box.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function fmtPct(v, d) { return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d == null ? 1 : d) + '%'; }
  function fmtUsd(v) { return (v < 0 ? '−$' : '$') + Math.round(Math.abs(v)).toLocaleString('en-US'); }
  function day(t) { var d = new Date(t * 1000); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }

  // a round step that gives about n gridlines
  function niceStep(span, n) {
    var raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  }

  function draw(box, o) {
    var pts = o.points || [];
    box.querySelectorAll('svg, .gc-tip, .gc-empty').forEach(function (n) { n.remove(); });
    if (pts.length < 2) {
      var e = document.createElement('div'); e.className = 'gc-empty'; e.textContent = o.emptyText || 'Not enough history in this range yet.';
      box.appendChild(e); return;
    }
    var W = Math.max(280, box.clientWidth), phone = W < 560;
    var H = phone ? 230 : 330, DH = phone ? 56 : 74, gap = 22, axis = 24;
    var fs = phone ? 11 : 12.5;
    var usd = o.measure === 'usd', start = o.start || 10000;
    var base = pts[0].v;
    var ys = pts.map(function (p) { var g = p.v / base - 1; return usd ? start * (1 + g) : g * 100; });
    var zero = usd ? start : 0;
    // high-water mark and drawdown, re-based to what is shown
    var peak = -Infinity, hw = [], dd = pts.map(function (p) { peak = Math.max(peak, p.v); hw.push(peak); return (p.v / peak - 1) * 100; });
    var hwY = hw.map(function (v) { var g = v / base - 1; return usd ? start * (1 + g) : g * 100; });

    var lo = Math.min(zero, Math.min.apply(null, ys)), hi = Math.max(zero, Math.max.apply(null, hwY));
    if (hi - lo < 1e-9) { hi += 1; lo -= 1; }
    // the axis hugs the data with a small margin; gridlines are the round values inside it.
    // A log axis (dollars only) shows a balance that grew many times over without the
    // early years flattening into the floor.
    var logY = !!o.log && usd && lo > 0, ticks = [], step = 1;
    if (logY) {
      var L0 = Math.log10(lo), L1 = Math.log10(hi), lp = Math.max(0.02, (L1 - L0) * 0.06);
      lo = Math.pow(10, L0 - lp); hi = Math.pow(10, L1 + lp);
      for (var k = Math.floor(L0 - lp); k <= Math.ceil(L1 + lp); k++) {
        [1, 2, 5].forEach(function (m) { var v = m * Math.pow(10, k); if (v >= lo && v <= hi) ticks.push(v); });
      }
      var pow10 = ticks.filter(function (v) { var l = Math.log10(v); return Math.abs(l - Math.round(l)) < 1e-9; });
      if (ticks.length > (phone ? 5 : 8) && pow10.length >= 2) ticks = pow10;
    } else {
      var pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
      step = niceStep(hi - lo, phone ? 3 : 5);
      for (var tv = Math.ceil(lo / step) * step; tv <= hi + step * 1e-6; tv += step) ticks.push(tv);
    }
    var label = function (v) { return usd ? fmtUsd(v) : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(step < 1 ? 1 : 0) + '%'; };

    // labels sit at the right on desktop, inside the plot on a phone
    var padL = phone ? 4 : 8, padR = phone ? 4 : 74, padT = 12;
    var t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    var X = function (t) { return padL + (t - t0) / Math.max(1, t1 - t0) * (W - padL - padR); };
    var Y = logY
      ? function (v) { return padT + (Math.log10(hi) - Math.log10(Math.max(v, lo))) / (Math.log10(hi) - Math.log10(lo)) * (H - padT); }
      : function (v) { return padT + (hi - v) / (hi - lo) * (H - padT); };
    var ddLo = Math.min(-1, Math.min.apply(null, dd));
    var DY = function (v) { return H + gap + (v / ddLo) * DH; };
    var total = H + gap + DH + axis;

    var s = '';
    // backtest stretch: a faint wash and the word, so the eye knows it is not live
    var liveX = o.liveFrom != null && o.liveFrom > t0 && o.liveFrom < t1 ? X(o.liveFrom) : null;
    if (liveX != null && liveX - padL > 90) {     // only when the backtest stretch is wide enough to read
      s += '<rect x="' + padL + '" y="' + padT + '" width="' + (liveX - padL) + '" height="' + (H + gap + DH - padT) + '" fill="var(--ink-3)" opacity=".06"/>';
      s += '<text x="' + (padL + 8) + '" y="' + (padT + fs + 4) + '" fill="var(--ink-3)" font-size="' + (fs - 1) + '" letter-spacing=".12em">BACKTEST</text>';
      s += '<line x1="' + liveX + '" x2="' + liveX + '" y1="' + padT + '" y2="' + (H + gap + DH) + '" stroke="var(--c)" stroke-opacity=".7" stroke-dasharray="4 4"/>';
      s += (W - padR) - liveX > 80
        ? '<text x="' + (liveX + 8) + '" y="' + (padT + fs + 4) + '" fill="var(--c)" font-size="' + (fs - 1) + '" letter-spacing=".12em">LIVE →</text>'
        : '<text x="' + (W - padR - 3) + '" y="' + (padT + fs + 4) + '" text-anchor="end" fill="var(--c)" font-size="' + (fs - 1) + '" letter-spacing=".08em">LIVE</text>';   // a narrow live stretch: keep the word inside the plot
    }
    // gridlines and labels
    ticks.forEach(function (v) {
      var y = Y(v).toFixed(1);
      s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y + '" y2="' + y + '" stroke="var(--ink-3)" stroke-opacity=".14"/>';
      if (phone) { if (Y(v) - 5 > padT + fs) s +='<text x="' + (padL + 4) + '" y="' + (Y(v) - 5).toFixed(1) + '" fill="var(--ink-3)" font-size="' + fs + '">' + label(v) + '</text>'; }
      else s += '<text x="' + (W - padR + 10) + '" y="' + (Y(v) + 4).toFixed(1) + '" fill="var(--ink-3)" font-size="' + fs + '">' + label(v) + '</text>';
    });
    s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + Y(zero).toFixed(1) + '" y2="' + Y(zero).toFixed(1) + '" stroke="var(--ink-2)" stroke-opacity=".45" stroke-dasharray="3 4"/>';

    var path = function (vals, from, to) {
      var d = '';
      for (var i = from; i <= to; i++) d += (i === from ? 'M' : 'L') + X(pts[i].t).toFixed(1) + ',' + Y(vals[i]).toFixed(1);
      return d;
    };
    var n = pts.length - 1;
    var line = path(ys, 0, n);
    s += '<defs><linearGradient id="gcFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--c)" stop-opacity=".30"/>' +
         '<stop offset="1" stop-color="var(--c)" stop-opacity="0"/></linearGradient></defs>';
    s += '<path d="' + line + 'L' + X(t1).toFixed(1) + ',' + Y(lo).toFixed(1) + 'L' + X(t0).toFixed(1) + ',' + Y(lo).toFixed(1) + 'Z" fill="url(#gcFill)"/>';
    // the high-water mark: where the curve last set a high
    s += '<path d="' + path(hwY, 0, n) + '" fill="none" stroke="var(--brass)" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="5 4"/>';
    // the line: muted over the backtest, the bot's colour once live
    var iLive = liveX == null ? 0 : pts.findIndex(function (p) { return p.t >= o.liveFrom; });
    if (iLive > 0) {
      s += '<path d="' + path(ys, 0, iLive) + '" fill="none" stroke="var(--ink-3)" stroke-width="2"/>';
      s += '<path d="' + path(ys, iLive, n) + '" fill="none" stroke="var(--c)" stroke-width="2.4" stroke-linejoin="round"/>';
    } else {
      s += '<path d="' + line + '" fill="none" stroke="var(--c)" stroke-width="2.4" stroke-linejoin="round"/>';
    }
    // drawdown underneath
    var ddp = 'M' + X(t0).toFixed(1) + ',' + (H + gap);
    for (var i = 0; i <= n; i++) ddp += 'L' + X(pts[i].t).toFixed(1) + ',' + DY(dd[i]).toFixed(1);
    ddp += 'L' + X(t1).toFixed(1) + ',' + (H + gap) + 'Z';
    s += '<text x="' + (padL + 4) + '" y="' + (H + gap - 6) + '" fill="var(--ink-3)" font-size="' + (fs - 1.5) + '" letter-spacing=".12em">DRAWDOWN</text>';
    s += '<path d="' + ddp + '" fill="rgba(248,113,113,.22)" stroke="rgba(248,113,113,.75)" stroke-width="1"/>';
    s += '<text x="' + (phone ? padL + 4 : W - padR + 10) + '" y="' + (H + gap + DH - (phone ? 4 : -4)) + '" fill="var(--ink-3)" font-size="' + fs + '">' + fmtPct(ddLo, 0) + '</text>';
    // dates
    var nX = phone ? 3 : 5;
    for (var k = 0; k <= nX; k++) {
      var t = t0 + (t1 - t0) * k / nX, dt = new Date(t * 1000);
      var txt = (t1 - t0) > 200 * 86400 ? MON[dt.getUTCMonth()] + ' ' + String(dt.getUTCFullYear()).slice(2) : dt.getUTCDate() + ' ' + MON[dt.getUTCMonth()];
      s += '<text x="' + X(t).toFixed(1) + '" y="' + (total - 6) + '" text-anchor="' + (k === 0 ? 'start' : k === nX ? 'end' : 'middle') + '" fill="var(--ink-3)" font-size="' + fs + '">' + txt + '</text>';
    }
    s += '<line class="gc-x" x1="0" x2="0" y1="' + padT + '" y2="' + (H + gap + DH) + '" stroke="var(--brass)" stroke-opacity=".7" visibility="hidden"/>';
    s += '<circle class="gc-dot" r="4.5" fill="var(--c)" stroke="#150c22" stroke-width="2" visibility="hidden"/>';

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + total);
    svg.setAttribute('width', W); svg.setAttribute('height', total);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', o.label || 'Growth chart');
    svg.style.cssText = 'display:block;width:100%;height:auto;font-family:Inter,system-ui,sans-serif;touch-action:pan-y';
    svg.innerHTML = s;
    box.appendChild(svg);
    var tip = document.createElement('div'); tip.className = 'gc-tip'; tip.hidden = true; box.appendChild(tip);

    var xh = svg.querySelector('.gc-x'), dot = svg.querySelector('.gc-dot');
    function at(clientX) {
      var rc = svg.getBoundingClientRect(), x = (clientX - rc.left) / rc.width * W;
      var t = t0 + (x - padL) / (W - padL - padR) * (t1 - t0), lo2 = 0, hi2 = n;
      while (hi2 - lo2 > 1) { var m = (lo2 + hi2) >> 1; if (pts[m].t <= t) lo2 = m; else hi2 = m; }
      var i = Math.abs(pts[hi2].t - t) < Math.abs(pts[lo2].t - t) ? hi2 : lo2, px = X(pts[i].t);
      xh.setAttribute('x1', px); xh.setAttribute('x2', px); xh.setAttribute('visibility', 'visible');
      dot.setAttribute('cx', px); dot.setAttribute('cy', Y(ys[i])); dot.setAttribute('visibility', 'visible');
      var g = (pts[i].v / base - 1) * 100;
      tip.innerHTML = '<b>' + day(pts[i].t) + '</b>' +
        '<span>' + (usd ? fmtUsd(ys[i]) + ' · ' : '') + fmtPct(g) + ' since ' + day(t0) + '</span>' +
        '<span>drawdown ' + fmtPct(dd[i]) + (pts[i].phase ? ' · ' + pts[i].phase : '') + '</span>';
      tip.hidden = false;
      var bx = box.getBoundingClientRect(), left = px / W * rc.width + (rc.left - bx.left);
      var tw = tip.offsetWidth || 200;
      tip.style.left = Math.min(bx.width - tw - 4, Math.max(4, left + (left > bx.width / 2 ? -tw - 14 : 14))) + 'px';
      tip.style.top = Math.max(4, Y(ys[i]) / total * rc.height + (rc.top - bx.top) - 70) + 'px';
    }
    function hide() { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); }
    svg.addEventListener('mousemove', function (e) { at(e.clientX); });
    svg.addEventListener('touchstart', function (e) { at(e.touches[0].clientX); }, { passive: true });
    svg.addEventListener('touchmove', function (e) { at(e.touches[0].clientX); }, { passive: true });
    svg.addEventListener('mouseleave', hide);
  }

  window.GrowthChart = function (box, opts) {
    var o = opts, lastW = 0;
    draw(box, o); lastW = box.clientWidth;
    if ('ResizeObserver' in window && !box.__gcRO) {
      box.__gcRO = new ResizeObserver(function () { if (Math.abs(box.clientWidth - lastW) > 8) { lastW = box.clientWidth; draw(box, box.__gcOpts); } });
      box.__gcRO.observe(box);
    }
    box.__gcOpts = o;
    return { update: function (next) { box.__gcOpts = o = next; draw(box, o); } };
  };
})();
