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
    logo: getAssetPath('soomario-logo.png'),
    whop: {
      accumulator: 'https://whop.com/soomario-strategies/soomario-accumulator/',
      maxpain: 'https://whop.com/soomario-strategies/',
      elite: 'https://whop.com/soomario-strategies/',
    },
    discord: 'https://discord.com/invite/gzpyCd3v7g',
    twitter: 'https://twitter.com/SoomarioStrat',
    hyperliquid: 'https://app.hyperliquid.xyz/join/SMR',
    dashboards: {
      accumulator: 'https://accumulator.soomariostrategies.com/dashboard',
      accumulatorLogin: 'https://accumulator.soomariostrategies.com/dashboard',
      elite: getPagePath('dashboards/elite.html'),
    },
    ga4: '' // Add GA4 Measurement ID here when ready, e.g. 'G-XXXXXXXXXX'
  };

  /* ── Path Helpers ── */
  function getDepth() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(s => s && !s.includes('.'));
    // Detect if we're in a subdirectory (products/, learn/, etc.)
    const knownDirs = ['products', 'learn', 'tools', 'dashboards', 'aureus'];
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
    SITE.logo = depth + 'soomario-logo.png';
    SITE.dashboards.elite = depth + 'dashboards/elite.html';
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
          <img src="${depth}soomario-logo.png" alt="Soomario Logo" width="56" height="56">
          <div class="site-nav__brand-text">
            <div class="site-nav__brand-name">SOOMARIO</div>
            <div class="site-nav__brand-sub">STRATEGIES</div>
          </div>
        </a>

        <div class="site-nav__links">
          <div class="nav-dropdown">
            <span class="site-nav__link nav-dropdown__trigger ${isActiveSection('products') ? 'active' : ''}">Products</span>
            <div class="nav-dropdown__menu"><div class="nav-dropdown__menu-inner">
              <a href="${depth}products/accumulator.html" class="nav-dropdown__item">Accumulator <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}products/aphelion.html" class="nav-dropdown__item">Aphelion <span class="badge badge--beta">BETA</span></a>
              <a href="${depth}products/elite.html" class="nav-dropdown__item">Elite <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}products/gladius.html" class="nav-dropdown__item">Gladius <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}products/libration.html" class="nav-dropdown__item">Libration <span class="badge badge--live">LIVE</span></a>
              <div class="nav-dropdown__divider"></div>
              <a href="${depth}products/rotation.html" class="nav-dropdown__item">Rotation <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}products/premia.html" class="nav-dropdown__item">Premia <span class="badge badge--soon">PAPER</span></a>
            </div></div>
          </div>

          <a href="${depth}aureus/" class="site-nav__link ${isActiveSection('aureus') ? 'active' : ''}">Aureus <span class="badge badge--live" style="margin-left:0.35rem;font-size:0.55rem;padding:0.12rem 0.4rem;">LIVE</span></a>

          <a href="${depth}learn/index.html" class="site-nav__link ${isActiveSection('learn') ? 'active' : ''}">Learn</a>

          <div class="nav-dropdown">
            <span class="site-nav__link nav-dropdown__trigger">Dashboards</span>
            <div class="nav-dropdown__menu"><div class="nav-dropdown__menu-inner">
              <a href="${depth}dashboards/elite.html" class="nav-dropdown__item">Elite <span class="badge badge--live">LIVE</span></a>
              <a href="https://libration.soomariostrategies.com" class="nav-dropdown__item" target="_blank">Libration <span class="badge badge--live">LIVE</span></a>
              <a href="https://rotation.soomariostrategies.com/" class="nav-dropdown__item" target="_blank">Rotation <span class="badge badge--live">LIVE</span></a>
              <a href="https://gladius.soomariostrategies.com" class="nav-dropdown__item" target="_blank">Gladius <span class="badge badge--live">LIVE</span></a>
              <a href="https://alpha.soomariostrategies.com/" class="nav-dropdown__item" target="_blank">Alpha <span class="badge badge--live">LIVE</span></a>
              <a href="https://aphelion.soomariostrategies.com" class="nav-dropdown__item" target="_blank">Aphelion <span class="badge badge--live">LIVE</span></a>
              <div class="nav-dropdown__divider"></div>
              <a href="${SITE.dashboards.accumulator}" class="nav-dropdown__item" target="_blank">Accumulator <span class="badge badge--live">LIVE</span></a>
              <a href="https://soomario-covered-calls-production.up.railway.app/" class="nav-dropdown__item" target="_blank">Premia <span class="badge badge--soon">TESTNET</span></a>
            </div></div>
          </div>

          <div class="nav-dropdown">
            <span class="site-nav__link nav-dropdown__trigger ${isActiveSection('tools') ? 'active' : ''}">Tools</span>
            <div class="nav-dropdown__menu"><div class="nav-dropdown__menu-inner">
              <a href="${depth}tools/calculator.html" class="nav-dropdown__item">DCA Calculator</a>
              <a href="${depth}tools/compare.html" class="nav-dropdown__item">Compare Products</a>
              <a href="${depth}tools/whitepaper.html" class="nav-dropdown__item">Whitepaper</a>
            </div></div>
          </div>
        </div>

        <div class="site-nav__actions">
          <a href="${SITE.dashboards.accumulatorLogin}" class="btn btn--ghost btn--sm site-nav__login-desktop" target="_blank">Member Login</a>
          <a href="${SITE.whop.accumulator}" class="btn btn--primary btn--sm" target="_blank">Get Started</a>
          <a href="${SITE.dashboards.accumulatorLogin}" class="site-nav__login-mobile" target="_blank" aria-label="Member Login">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </a>
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
      <div class="mobile-menu__group">
        <div class="mobile-menu__group-title">Products</div>
        <div class="mobile-menu__links">
          <a href="${depth}products/accumulator.html" class="mobile-menu__link">Accumulator <span class="badge badge--live">LIVE</span></a>
          <a href="${depth}products/aphelion.html" class="mobile-menu__link">Aphelion <span class="badge badge--beta">BETA</span></a>
          <a href="${depth}products/elite.html" class="mobile-menu__link">Elite <span class="badge badge--live">LIVE</span></a>
          <a href="${depth}products/gladius.html" class="mobile-menu__link">Gladius <span class="badge badge--live">LIVE</span></a>
          <a href="${depth}products/libration.html" class="mobile-menu__link">Libration <span class="badge badge--live">LIVE</span></a>
          <a href="${depth}products/rotation.html" class="mobile-menu__link">Rotation <span class="badge badge--live">LIVE</span></a>
          <a href="${depth}products/premia.html" class="mobile-menu__link">Premia <span class="badge badge--soon">PAPER</span></a>
        </div>
      </div>

      <div class="mobile-menu__group">
        <div class="mobile-menu__group-title">Aureus</div>
        <div class="mobile-menu__links">
          <a href="${depth}aureus/" class="mobile-menu__link">Overview <span class="badge badge--live">LIVE</span></a>
          <a href="${depth}aureus/whitepaper.html" class="mobile-menu__link">Whitepaper v1.5</a>
        </div>
      </div>

      <div class="mobile-menu__group">
        <div class="mobile-menu__group-title">Dashboards</div>
        <div class="mobile-menu__links">
          <a href="${depth}dashboards/elite.html" class="mobile-menu__link">Elite</a>
          <a href="https://libration.soomariostrategies.com" class="mobile-menu__link" target="_blank">Libration</a>
          <a href="https://rotation.soomariostrategies.com/" class="mobile-menu__link" target="_blank">Rotation</a>
          <a href="https://gladius.soomariostrategies.com" class="mobile-menu__link" target="_blank">Gladius</a>
          <a href="https://alpha.soomariostrategies.com/" class="mobile-menu__link" target="_blank">Alpha</a>
          <a href="https://aphelion.soomariostrategies.com" class="mobile-menu__link" target="_blank">Aphelion</a>
          <a href="${SITE.dashboards.accumulator}" class="mobile-menu__link" target="_blank">Accumulator</a>
          <a href="https://soomario-covered-calls-production.up.railway.app/" class="mobile-menu__link" target="_blank">Premia</a>
        </div>
      </div>

      <div class="mobile-menu__group">
        <div class="mobile-menu__group-title">Learn & Tools</div>
        <div class="mobile-menu__links">
          <a href="${depth}learn/index.html" class="mobile-menu__link">Education</a>
          <a href="${depth}tools/calculator.html" class="mobile-menu__link">DCA Calculator</a>
          <a href="${depth}tools/compare.html" class="mobile-menu__link">Compare Products</a>
          <a href="${depth}tools/whitepaper.html" class="mobile-menu__link">Whitepaper</a>
          <a href="${depth}learn/glossary.html" class="mobile-menu__link">Glossary</a>
        </div>
      </div>

      <div class="mobile-menu__ctas">
        <a href="${SITE.whop.accumulator}" class="btn btn--primary" target="_blank">Start Free Trial</a>
        <a href="${SITE.dashboards.accumulatorLogin}" class="btn btn--outline" target="_blank">Member Login</a>
        <a href="${SITE.discord}" class="btn btn--ghost btn--sm" target="_blank">Join Discord</a>
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
              <li><a href="${depth}products/aphelion.html">Aphelion</a></li>
              <li><a href="${depth}products/elite.html">Elite</a></li>
              <li><a href="${depth}products/gladius.html">Gladius</a></li>
              <li><a href="${depth}products/libration.html">Libration</a></li>
              <li><a href="${depth}aureus/">Aureus</a></li>
              <li><a href="${depth}products/rotation.html">Rotation</a></li>
              <li><a href="${depth}products/premia.html">Premia</a></li>
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
