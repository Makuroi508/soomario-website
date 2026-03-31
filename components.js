/* ═══════════════════════════════════════════════════════════════
   SOOMARIO STRATEGIES — Shared Components
   Injects nav, footer, mobile menu on every page
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── Config ── */
  const SITE = {
    name: 'SOOMARIO',
    sub: 'STRATEGIES',
    domain: 'https://soomariostrategies.com',
    logo: getAssetPath('assets/soomario-logo.png'),
    whop: {
      accumulator: 'https://whop.com/soomario-strategies/soomario-accumulator/',
      maxpain: 'https://whop.com/soomario-strategies/',
      elite: 'https://whop.com/soomario-strategies/',
    },
    discord: 'https://discord.com/invite/gzpyCd3v7g',
    twitter: 'https://twitter.com/SoomarioStrat',
    hyperliquid: 'https://app.hyperliquid.xyz/join/SMR',
    dashboards: {
      accumulator: 'https://soomariosignaltelegram-production.up.railway.app/dashboard/preview',
      accumulatorLogin: 'https://soomariosignaltelegram-production.up.railway.app/dashboard',
      elite: getPagePath('dashboards/elite.html'),
      vault: getPagePath('dashboards/vault.html'),
      contrarian: '#', // TBD
      zones: 'https://soomariozones-production.up.railway.app/',
      farms: 'https://soomariozonesfarming-production.up.railway.app/',
    },
    ga4: '' // Add GA4 Measurement ID here when ready, e.g. 'G-XXXXXXXXXX'
  };

  /* ── Path Helpers ── */
  function getDepth() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(s => s && !s.includes('.'));
    // Detect if we're in a subdirectory (products/, learn/, etc.)
    const knownDirs = ['products', 'learn', 'tools', 'dashboards'];
    for (const dir of knownDirs) {
      if (path.includes('/' + dir + '/')) return '../';
    }
    return '';
  }

  function getAssetPath(file) {
    return getDepth() + file;
  }

  function getPagePath(page) {
    return getDepth() + page;
  }

  /* Recalculate paths after DOM is ready */
  function resolvePaths() {
    const depth = getDepth();
    SITE.logo = depth + 'assets/soomario-logo.png';
    SITE.dashboards.elite = depth + 'dashboards/elite.html';
    SITE.dashboards.vault = depth + 'dashboards/vault.html';
  }

  /* ── Detect Active Page ── */
  function isActivePath(href) {
    if (href.startsWith('http')) return false;
    const current = window.location.pathname;
    const target = href.replace(/^\.\.\//, '').replace(/^\.\//, '');
    return current.endsWith(target) || current.endsWith('/' + target);
  }

  function isActiveSection(section) {
    const path = window.location.pathname;
    return path.includes('/' + section + '/');
  }

  /* ── Navigation ── */
  function buildNav() {
    const depth = getDepth();
    const nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    nav.innerHTML = `
      <div class="site-nav__inner">
        <a href="${depth}index.html" class="site-nav__brand" aria-label="Soomario home">
          <img src="${depth}assets/soomario-logo.png" alt="Soomario Logo" width="48" height="48">
          <div class="site-nav__brand-text">
            <div class="site-nav__brand-name">SOOMARIO</div>
            <div class="site-nav__brand-sub">STRATEGIES</div>
          </div>
        </a>

        <div class="site-nav__links">
          <div class="nav-dropdown">
            <span class="site-nav__link nav-dropdown__trigger ${isActiveSection('products') ? 'active' : ''}">Products</span>
            <div class="nav-dropdown__menu">
              <a href="${depth}products/accumulator.html" class="nav-dropdown__item">Accumulator <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}products/max-pain.html" class="nav-dropdown__item">Max Pain <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}products/elite.html" class="nav-dropdown__item">Elite <span class="badge badge--live">LIVE</span></a>
              <div class="nav-dropdown__divider"></div>
              <a href="${depth}products/contrarian.html" class="nav-dropdown__item">Contrarian <span class="badge badge--soon">SOON</span></a>
              <a href="${depth}products/zones.html" class="nav-dropdown__item">Zones <span class="badge badge--soon">SOON</span></a>
              <a href="${depth}products/farms.html" class="nav-dropdown__item">Farms <span class="badge badge--soon">SOON</span></a>
            </div>
          </div>

          <a href="${depth}learn/index.html" class="site-nav__link ${isActiveSection('learn') ? 'active' : ''}">Learn</a>

          <div class="nav-dropdown">
            <span class="site-nav__link nav-dropdown__trigger">Dashboards</span>
            <div class="nav-dropdown__menu">
              <a href="${SITE.dashboards.accumulator}" class="nav-dropdown__item" target="_blank">Accumulator <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}dashboards/elite.html" class="nav-dropdown__item">Elite <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}dashboards/vault.html" class="nav-dropdown__item">Max Pain Vault <span class="badge badge--live">LIVE</span></a>
              <div class="nav-dropdown__divider"></div>
              <a href="${SITE.dashboards.zones}" class="nav-dropdown__item" target="_blank">Zones <span class="badge badge--soon">BETA</span></a>
              <a href="${SITE.dashboards.farms}" class="nav-dropdown__item" target="_blank">Farms <span class="badge badge--soon">PAPER</span></a>
            </div>
          </div>

          <div class="nav-dropdown">
            <span class="site-nav__link nav-dropdown__trigger ${isActiveSection('tools') ? 'active' : ''}">Tools</span>
            <div class="nav-dropdown__menu">
              <a href="${depth}tools/calculator.html" class="nav-dropdown__item">DCA Calculator</a>
              <a href="${depth}tools/compare.html" class="nav-dropdown__item">Compare Products</a>
              <a href="${depth}tools/whitepaper.html" class="nav-dropdown__item">Whitepaper</a>
            </div>
          </div>
        </div>

        <div class="site-nav__actions">
          <a href="${SITE.dashboards.accumulatorLogin}" class="btn btn--ghost btn--sm" target="_blank">Member Login</a>
          <a href="${SITE.whop.accumulator}" class="btn btn--primary btn--sm" target="_blank">Get Started</a>
          <div class="hamburger" onclick="window.SoomarioToggleMobile()" aria-label="Menu" role="button" tabindex="0">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;

    document.body.prepend(nav);
  }

  /* ── Mobile Menu ── */
  function buildMobileMenu() {
    const depth = getDepth();
    const menu = document.createElement('div');
    menu.className = 'mobile-menu';
    menu.id = 'mobileMenu';

    menu.innerHTML = `
      <a href="${depth}index.html">Home</a>

      <span class="mobile-menu__section-label">Products</span>
      <a href="${depth}products/accumulator.html">Accumulator</a>
      <a href="${depth}products/max-pain.html">Max Pain</a>
      <a href="${depth}products/elite.html">Elite</a>
      <a href="${depth}products/contrarian.html">Contrarian</a>
      <a href="${depth}products/zones.html">Zones</a>
      <a href="${depth}products/farms.html">Farms</a>

      <span class="mobile-menu__section-label">Learn & Tools</span>
      <a href="${depth}learn/index.html">Education</a>
      <a href="${depth}tools/calculator.html">DCA Calculator</a>
      <a href="${depth}tools/compare.html">Compare Products</a>
      <a href="${depth}tools/whitepaper.html">Whitepaper</a>

      <span class="mobile-menu__section-label">Dashboards</span>
      <a href="${SITE.dashboards.accumulator}" target="_blank">Accumulator Dashboard</a>
      <a href="${depth}dashboards/elite.html">Elite Dashboard</a>

      <div style="display:flex; flex-direction:column; gap:0.75rem; align-items:center; margin-top:1rem;">
        <a href="${SITE.whop.accumulator}" class="btn btn--primary" target="_blank">Get Started — $7/mo</a>
        <a href="${SITE.discord}" class="btn btn--outline btn--sm" target="_blank">Join Discord</a>
      </div>
    `;

    document.body.appendChild(menu);
  }

  window.SoomarioToggleMobile = function() {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.getElementById('mobileMenu');
    if (!hamburger || !menu) return;
    hamburger.classList.toggle('active');
    menu.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
  };

  /* ── Footer ── */
  function buildFooter() {
    const depth = getDepth();
    const footer = document.createElement('footer');
    footer.className = 'site-footer';

    footer.innerHTML = `
      <div class="container">
        <div class="site-footer__grid">
          <div class="site-footer__brand-col">
            <div class="site-nav__brand-name" style="font-family:var(--font-heading);font-size:1rem;letter-spacing:0.12em;">SOOMARIO</div>
            <div style="font-family:var(--font-display);font-size:8px;color:var(--gold);letter-spacing:0.25em;margin-bottom:0.75rem;">STRATEGIES</div>
            <p class="site-footer__desc">Algorithmic trading strategies built for transparency. Every trade verifiable on-chain. Self-custody always.</p>
          </div>

          <div>
            <div class="site-footer__col-title">Products</div>
            <ul class="site-footer__links">
              <li><a href="${depth}products/accumulator.html">Accumulator — $7/mo</a></li>
              <li><a href="${depth}products/max-pain.html">Max Pain</a></li>
              <li><a href="${depth}products/elite.html">Elite</a></li>
              <li><a href="${depth}products/contrarian.html">Contrarian</a></li>
              <li><a href="${depth}products/zones.html">Zones</a></li>
              <li><a href="${depth}products/farms.html">Farms</a></li>
            </ul>
          </div>

          <div>
            <div class="site-footer__col-title">Learn</div>
            <ul class="site-footer__links">
              <li><a href="${depth}learn/what-is-dca.html">What is DCA?</a></li>
              <li><a href="${depth}learn/liquidation-zones.html">Liquidation Zones</a></li>
              <li><a href="${depth}learn/how-vaults-work.html">How Vaults Work</a></li>
              <li><a href="${depth}learn/risk-management.html">Risk Management</a></li>
              <li><a href="${depth}learn/glossary.html">Glossary</a></li>
            </ul>
          </div>

          <div>
            <div class="site-footer__col-title">Community</div>
            <ul class="site-footer__links">
              <li><a href="${SITE.discord}" target="_blank">Discord</a></li>
              <li><a href="${SITE.twitter}" target="_blank">Twitter / X</a></li>
              <li><a href="${SITE.hyperliquid}" target="_blank">Hyperliquid</a></li>
              <li><a href="${depth}tools/whitepaper.html">Whitepaper</a></li>
              <li><a href="${depth}tools/calculator.html">DCA Calculator</a></li>
            </ul>
          </div>
        </div>

        <div class="site-footer__bottom">
          <span>&copy; 2024–2026 Soomario Strategies. All rights reserved.</span>
          <p class="site-footer__risk">Trading involves substantial risk of loss. Past performance — including backtested results — does not guarantee future results. Never invest more than you can afford to lose.</p>
        </div>
      </div>
    `;

    document.body.appendChild(footer);
  }

  /* ── FAQ Toggle ── */
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const item = this.closest('.faq-item');
        const wasActive = item.classList.contains('active');
        // Close all
        document.querySelectorAll('.faq-item.active').forEach(function(el) {
          el.classList.remove('active');
        });
        // Toggle clicked
        if (!wasActive) item.classList.add('active');
      });
    });
  }

  /* ── Google Analytics ── */
  function initGA() {
    if (!SITE.ga4) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + SITE.ga4;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', SITE.ga4);
    window.gtag = gtag;
  }

  /* ── Init ── */
  function init() {
    resolvePaths();
    buildNav();
    buildMobileMenu();
    buildFooter();
    initFAQ();
    initGA();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
