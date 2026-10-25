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
    logo: getAssetPath('soomario-logo-128.png'),
    whop: {
      accumulator: 'https://whop.com/soomario-strategies/soomario-accumulator/',
      maxpain: 'https://whop.com/soomario-strategies/',
      elite: 'https://whop.com/soomario-strategies/',
      hype: 'https://whop.com/soomario-strategies/hype-bot',
      libration: 'https://whop.com/soomario-strategies/libration-strat',
    },
    engine: 'https://engine.soomariostrategies.com',
    engineLogin: 'https://engine.soomariostrategies.com/login',
    discord: 'https://discord.com/invite/gzpyCd3v7g',
    twitter: 'https://x.com/SoomarioStrat',
    discordIcon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>',
    xIcon: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
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
    const knownDirs = ['products', 'learn', 'tools', 'dashboards', 'aureus', 'whitepapers'];
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
    SITE.logo = depth + 'soomario-logo-128.png';
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
          <img src="${depth}soomario-logo-128.png" alt="Soomario Logo" width="56" height="56" decoding="async">
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
              <a href="${depth}products/aphelion.html" class="nav-dropdown__item">Aphelion <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}products/elite.html" class="nav-dropdown__item">Elite <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}products/hype-bot.html" class="nav-dropdown__item">Hype Bot <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}products/libration.html" class="nav-dropdown__item">Libration <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}products/own-account.html" class="nav-dropdown__item">Your Own Account (Engine) <span class="badge badge--new">NEW</span></a>
              <div class="nav-dropdown__divider"></div>
              <a href="${depth}products/rotation.html" class="nav-dropdown__item">Rotation <span class="badge badge--live">LIVE</span></a>
            </div></div>
          </div>

          <a href="${depth}aureus/" class="site-nav__link ${isActiveSection('aureus') ? 'active' : ''}">Aureus <span class="badge badge--live" style="margin-left:0.35rem;font-size:0.55rem;padding:0.12rem 0.4rem;">LIVE</span></a>

          <a href="${depth}learn/index.html" class="site-nav__link ${isActiveSection('learn') ? 'active' : ''}">Learn</a>

          <div class="nav-dropdown">
            <span class="site-nav__link nav-dropdown__trigger">Dashboards</span>
            <div class="nav-dropdown__menu"><div class="nav-dropdown__menu-inner">
              <a href="${depth}dashboards/elite.html" class="nav-dropdown__item">Elite <span class="badge badge--live">LIVE</span></a>
              <a href="${depth}dashboards/hype.html" class="nav-dropdown__item">Hype Bot <span class="badge badge--live">LIVE</span></a>
              <a href="https://libration.soomariostrategies.com" class="nav-dropdown__item" target="_blank">Libration <span class="badge badge--live">LIVE</span></a>
              <a href="https://rotation.soomariostrategies.com/" class="nav-dropdown__item" target="_blank">Rotation <span class="badge badge--live">LIVE</span></a>
              <a href="https://aphelion.soomariostrategies.com" class="nav-dropdown__item" target="_blank">Aphelion <span class="badge badge--live">LIVE</span></a>
              <div class="nav-dropdown__divider"></div>
              <a href="${SITE.dashboards.accumulator}" class="nav-dropdown__item" target="_blank">Accumulator <span class="badge badge--live">LIVE</span></a>
            </div></div>
          </div>

          <div class="nav-dropdown">
            <span class="site-nav__link nav-dropdown__trigger ${isActiveSection('tools') ? 'active' : ''}">Tools</span>
            <div class="nav-dropdown__menu"><div class="nav-dropdown__menu-inner">
              <a href="${depth}tools/calculator.html" class="nav-dropdown__item">DCA Calculator</a>
              <a href="${depth}tools/hype-calculator.html" class="nav-dropdown__item">Hype Bot Calculator <span class="badge badge--new">NEW</span></a>
              <a href="${depth}tools/compare.html" class="nav-dropdown__item">Compare Products</a>
              <a href="${depth}whitepapers/platform.html" class="nav-dropdown__item">Whitepaper</a>
            </div></div>
          </div>

          <div class="nav-dropdown">
            <span class="site-nav__link nav-dropdown__trigger">Community</span>
            <div class="nav-dropdown__menu"><div class="nav-dropdown__menu-inner">
              <a href="${SITE.discord}" class="nav-dropdown__item" target="_blank" rel="noopener"><span style="display:inline-flex;align-items:center;gap:0.55rem;">${SITE.discordIcon}Discord</span><span style="opacity:0.55;font-size:0.68rem;white-space:nowrap;">Join the server</span></a>
              <a href="${SITE.twitter}" class="nav-dropdown__item" target="_blank" rel="noopener"><span style="display:inline-flex;align-items:center;gap:0.55rem;">${SITE.xIcon}X</span><span style="opacity:0.55;font-size:0.68rem;white-space:nowrap;">@SoomarioStrat</span></a>
            </div></div>
          </div>
        </div>

        <div class="site-nav__actions">
          <a href="${depth}login.html" class="btn btn--ghost btn--sm site-nav__login-desktop">Log In</a>
          <a href="${depth}start.html" class="btn btn--primary btn--sm">Get Started</a>
          <a href="${depth}login.html" class="site-nav__login-mobile" aria-label="Log in">
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
          <a href="${depth}products/aphelion.html" class="mobile-menu__link">Aphelion <span class="badge badge--live">LIVE</span></a>
          <a href="${depth}products/elite.html" class="mobile-menu__link">Elite <span class="badge badge--live">LIVE</span></a>
          <a href="${depth}products/hype-bot.html" class="mobile-menu__link">Hype Bot <span class="badge badge--live">LIVE</span></a>
          <a href="${depth}products/libration.html" class="mobile-menu__link">Libration <span class="badge badge--live">LIVE</span></a>
          <a href="${depth}products/own-account.html" class="mobile-menu__link">Your Own Account (Engine) <span class="badge badge--new">NEW</span></a>
          <a href="${depth}products/rotation.html" class="mobile-menu__link">Rotation <span class="badge badge--live">LIVE</span></a>
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
          <a href="${depth}dashboards/hype.html" class="mobile-menu__link">Hype Bot</a>
          <a href="https://libration.soomariostrategies.com" class="mobile-menu__link" target="_blank">Libration</a>
          <a href="https://rotation.soomariostrategies.com/" class="mobile-menu__link" target="_blank">Rotation</a>
          <a href="https://aphelion.soomariostrategies.com" class="mobile-menu__link" target="_blank">Aphelion</a>
          <a href="${SITE.dashboards.accumulator}" class="mobile-menu__link" target="_blank">Accumulator</a>
        </div>
      </div>

      <div class="mobile-menu__group">
        <div class="mobile-menu__group-title">Learn & Tools</div>
        <div class="mobile-menu__links">
          <a href="${depth}learn/index.html" class="mobile-menu__link">Education</a>
          <a href="${depth}tools/calculator.html" class="mobile-menu__link">DCA Calculator</a>
          <a href="${depth}tools/hype-calculator.html" class="mobile-menu__link">Hype Bot Calculator</a>
          <a href="${depth}tools/compare.html" class="mobile-menu__link">Compare Products</a>
          <a href="${depth}whitepapers/platform.html" class="mobile-menu__link">Whitepaper</a>
          <a href="${depth}learn/glossary.html" class="mobile-menu__link">Glossary</a>
          <a href="${depth}about.html" class="mobile-menu__link">About</a>
        </div>
      </div>

      <div class="mobile-menu__group">
        <div class="mobile-menu__group-title">Community</div>
        <div class="mobile-menu__links">
          <a href="${SITE.discord}" class="mobile-menu__link" target="_blank" rel="noopener">Discord</a>
          <a href="${SITE.twitter}" class="mobile-menu__link" target="_blank" rel="noopener">X · @SoomarioStrat</a>
        </div>
      </div>

      <div class="mobile-menu__ctas">
        <a href="${depth}start.html" class="btn btn--primary">Get Started — 7 Days Free</a>
        <a href="${depth}login.html" class="btn btn--outline">Log In</a>
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
              <li><a href="${depth}products/hype-bot.html">Hype Bot</a></li>
              <li><a href="${depth}products/libration.html">Libration</a></li>
              <li><a href="${depth}products/own-account.html">Your Own Account — from $29/mo</a></li>
              <li><a href="${depth}aureus/">Aureus</a></li>
              <li><a href="${depth}products/rotation.html">Rotation</a></li>
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
              <li><a href="${SITE.twitter}" target="_blank">X (Twitter)</a></li>
              <li><a href="${SITE.hyperliquid}" target="_blank">Hyperliquid</a></li>
              <li><a href="${depth}about.html">About</a></li>
              <li><a href="${depth}start.html">Get Started</a></li>
              <li><a href="${depth}login.html">Log In</a></li>
              <li><a href="${depth}whitepapers/platform.html">Whitepaper</a></li>
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
