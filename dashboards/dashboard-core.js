/* ══════════════════════════════════════════════════════════════
   dashboard-core.js — shared, byte-identical helpers used by BOTH
   live Soomario dashboards (elite.html + vault.html).

   CONSERVATIVE dedup: only helpers whose source text was verified
   IDENTICAL across both pages live here. Everything else (fmt/round
   variants, set, hlPost, timeAgo, parse*, calcMetrics, render, chart,
   scanner) stays inline per-page because it has diverged.

   `col` is declared as a top-level function (not const) so that
   loading this file before a page's inline script cannot cause an
   "already declared" clash. The inline `const col=...` has been
   removed from each page.
   ══════════════════════════════════════════════════════════════ */

// P&L colour: green when >= 0, red otherwise.
// Was: const col=n=>n>=0?'var(--gn)':'var(--rd)';  (identical in both pages)
function col(n){ return n >= 0 ? 'var(--gn)' : 'var(--rd)'; }
