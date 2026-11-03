/* ═══════════════════════════════════════════════════════════════
   SOOMARIO STRATEGIES — Support chat box
   The "Ask" button on every page (loaded by components.js). Answers
   come from the support assistant on the engine (engine/support_web.py):
   AI answers from our own product docs, with a hand-off to Marcelo whose
   reply shows here the next time the visitor opens the box.
   Hidden whenever the engine's assistant is off. No cookies: the chat is
   a random id kept in this browser (localStorage).
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var API = 'https://engine.soomariostrategies.com';
  try {
    // local testing only: point the box at a dev engine
    var dev = localStorage.getItem('smr_support_api');
    if (dev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(dev)) API = dev;
  } catch (e) {}

  var DISCORD = 'https://discord.com/invite/gzpyCd3v7g';
  var STORE = 'smr_chat';
  var MAX_KEEP = 40;
  var POLL_MS = 30000;
  var CHIPS = ['Which bot fits me?', 'How do I connect my exchange?', 'Can the bot withdraw my money?', 'What does it cost?'];
  var GREETING = "Hi! I'm the Soomario assistant. Ask me about the Hype Bot, Tide or the Accumulator: what they do, prices, connecting your exchange, or billing.";

  var state = load();
  var els = {};
  var busy = false;
  var pollTimer = null;

  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) {}
    if (!s || typeof s.session !== 'string' || !/^[A-Za-z0-9_-]{16,64}$/.test(s.session)) {
      s = { session: newId(), msgs: [], after: 0, pending: false };
    }
    s.msgs = Array.isArray(s.msgs) ? s.msgs.slice(-MAX_KEEP) : [];
    return s;
  }

  function save() {
    state.msgs = state.msgs.slice(-MAX_KEEP);
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }

  function newId() {
    var a = new Uint8Array(18);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  /* ── is the assistant on? (cached for ten minutes per tab) ── */
  function checkOn(cb) {
    try {
      var c = JSON.parse(sessionStorage.getItem('smr_chat_on') || 'null');
      if (c && Date.now() - c.t < 600000) return cb(!!c.on);
    } catch (e) {}
    fetch(API + '/support/status', { method: 'GET', mode: 'cors', credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : { on: false }; })
      .catch(function () { return { on: false }; })
      .then(function (j) {
        try { sessionStorage.setItem('smr_chat_on', JSON.stringify({ on: !!j.on, t: Date.now() })); } catch (e) {}
        cb(!!j.on);
      });
  }

  /* ── text: escape, then link URLs and the domains the assistant names ── */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function linkify(s) {
    var rx = /\b((?:https?:\/\/)?(?:[a-z0-9-]+\.)+(?:com|xyz|fi|gg|io|trade)(?:\/[^\s<]*)?)/gi;
    return esc(s).replace(rx, function (m, _g, at, all) {
      if (at > 0 && /[@\w]/.test(all.charAt(at - 1))) return m;   // part of an email address or a word
      var trail = '';
      while (/[.,;:!?)]$/.test(m)) { trail = m.slice(-1) + trail; m = m.slice(0, -1); }
      var href = /^https?:\/\//i.test(m) ? m : 'https://' + m;
      return '<a href="' + href + '" target="_blank" rel="noopener">' + m + '</a>' + trail;
    }).replace(/\n/g, '<br>');
  }

  /* ── styles ── */
  function css() {
    var st = document.createElement('style');
    st.textContent = [
      '.smr-chat-btn{position:fixed;right:calc(18px + env(safe-area-inset-right,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:1200;display:flex;align-items:center;gap:8px;padding:12px 18px 12px 14px;border-radius:999px;border:1px solid #ecd9a6;background:linear-gradient(180deg,#d9b664,#a8873e);color:#150c22;font:600 15px/1 Inter,system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.45),0 0 0 4px rgba(207,168,81,.12);cursor:pointer}',
      '.smr-chat-btn:hover{filter:brightness(1.07)} .smr-chat-btn:focus-visible{outline:2px solid #ecd9a6;outline-offset:3px}',
      '.smr-chat-btn svg{width:20px;height:20px} .smr-chat-dot{width:9px;height:9px;border-radius:50%;background:#e2554a;box-shadow:0 0 0 2px #f5f0e6;display:none} .smr-chat-btn.has-reply .smr-chat-dot{display:block}',
      '.smr-chat{position:fixed;right:calc(18px + env(safe-area-inset-right,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:1201;width:390px;max-width:calc(100vw - 36px);height:min(600px,calc(100vh - 36px));display:flex;flex-direction:column;background:#150c22;color:#f5f0e6;border:1px solid rgba(207,168,81,.45);border-radius:18px;box-shadow:0 18px 60px rgba(0,0,0,.6);overflow:hidden;font:400 15px/1.5 Inter,system-ui,sans-serif}',
      '.smr-chat[hidden],.smr-chat-btn[hidden]{display:none}',
      '.smr-chat-head{display:flex;align-items:center;gap:12px;padding:14px 16px;background:linear-gradient(180deg,#2a1840,#1d1230);border-bottom:1px solid rgba(207,168,81,.3)}',
      '.smr-chat-head img{width:34px;height:34px;border-radius:50%} .smr-chat-title{font:400 18px/1.2 Marcellus,Cinzel,Georgia,serif;color:#ecd9a6} .smr-chat-sub{font-size:12px;color:#a89a84;margin-top:2px}',
      '.smr-chat-x{margin-left:auto;background:none;border:0;color:#d9cfbd;font-size:26px;line-height:1;cursor:pointer;padding:4px 8px;border-radius:8px} .smr-chat-x:hover{background:rgba(207,168,81,.12)}',
      '.smr-chat-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}',
      '.smr-msg{max-width:86%;padding:10px 13px;border-radius:14px;white-space:normal;overflow-wrap:anywhere}',
      '.smr-msg a{color:#ecd9a6;text-decoration:underline}',
      '.smr-msg.bot{align-self:flex-start;background:#1d1230;border:1px solid rgba(207,168,81,.18);border-bottom-left-radius:4px}',
      '.smr-msg.team{align-self:flex-start;background:#2a1840;border:1px solid rgba(207,168,81,.55);border-bottom-left-radius:4px}',
      '.smr-msg.team b{display:block;font-size:12px;color:#cfa851;letter-spacing:.04em;margin-bottom:3px}',
      '.smr-msg.me{align-self:flex-end;background:#cfa851;color:#150c22;border-bottom-right-radius:4px} .smr-msg.me a{color:#150c22}',
      '.smr-chips{display:flex;flex-wrap:wrap;gap:8px} .smr-chip{border:1px solid rgba(207,168,81,.45);background:transparent;color:#ecd9a6;border-radius:999px;padding:7px 12px;font:500 13px/1.2 Inter,system-ui,sans-serif;cursor:pointer} .smr-chip:hover{background:rgba(207,168,81,.12)}',
      '.smr-typing{align-self:flex-start;display:flex;gap:5px;padding:12px 14px;background:#1d1230;border-radius:14px} .smr-typing i{width:7px;height:7px;border-radius:50%;background:#cfa851;animation:smrb 1.2s infinite ease-in-out} .smr-typing i:nth-child(2){animation-delay:.15s} .smr-typing i:nth-child(3){animation-delay:.3s}',
      '@keyframes smrb{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}',
      '@media (prefers-reduced-motion:reduce){.smr-typing i{animation:none;opacity:.7}}',
      '.smr-chat-form{display:flex;gap:8px;align-items:flex-end;padding:12px;border-top:1px solid rgba(207,168,81,.25);background:#1d1230}',
      '.smr-chat-form textarea{flex:1;min-width:0;resize:none;max-height:120px;overflow-y:hidden;border:1px solid rgba(207,168,81,.35);border-radius:12px;background:#150c22;color:#f5f0e6;padding:10px 12px;font:400 15px/1.4 Inter,system-ui,sans-serif}',
      '.smr-chat-form textarea:focus{outline:none;border-color:#cfa851}',
      '.smr-chat-send{flex:none;width:44px;height:44px;border-radius:12px;border:0;background:#cfa851;color:#150c22;cursor:pointer;display:grid;place-items:center} .smr-chat-send:disabled{opacity:.5;cursor:default} .smr-chat-send svg{width:20px;height:20px}',
      '.smr-chat-note{padding:0 14px 10px;background:#1d1230;font-size:11.5px;color:#a89a84}',
      '@media (max-width:520px){.smr-chat{right:0;bottom:0;width:100vw;max-width:100vw;height:100%;max-height:100%;border-radius:0;border:0;padding-bottom:env(safe-area-inset-bottom,0px)} .smr-chat-btn .smr-chat-label{display:none} .smr-chat-btn{padding:14px}}',
      '@media print{.smr-chat-btn,.smr-chat{display:none!important}}'
    ].join('\n');
    document.head.appendChild(st);
  }

  /* ── DOM ── */
  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function build() {
    css();
    var logo = (document.querySelector('link[rel="apple-touch-icon"]') || {}).href || '/apple-touch-icon.png';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'smr-chat-btn';
    btn.setAttribute('aria-label', 'Ask the Soomario assistant');
    btn.innerHTML = ICON_CHAT + '<span class="smr-chat-label">Ask a question</span><span class="smr-chat-dot" aria-hidden="true"></span>';

    var box = document.createElement('section');
    box.className = 'smr-chat';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Soomario assistant');
    box.innerHTML =
      '<div class="smr-chat-head"><img src="' + esc(logo) + '" alt="">' +
      '<div><div class="smr-chat-title">Soomario assistant</div>' +
      '<div class="smr-chat-sub">AI answers from our product docs · not financial advice</div></div>' +
      '<button type="button" class="smr-chat-x" aria-label="Close">×</button></div>' +
      '<div class="smr-chat-log" aria-live="polite"></div>' +
      '<form class="smr-chat-form"><textarea rows="1" maxlength="1500" placeholder="Type your question…" aria-label="Your question"></textarea>' +
      '<button type="submit" class="smr-chat-send" aria-label="Send">' + ICON_SEND + '</button></form>' +
      '<div class="smr-chat-note">Never share API keys, private keys or seed phrases. Need a person? Ask for Marcelo.</div>';

    document.body.appendChild(btn);
    document.body.appendChild(box);
    els = { btn: btn, box: box, log: box.querySelector('.smr-chat-log'), form: box.querySelector('form'),
            input: box.querySelector('textarea'), send: box.querySelector('.smr-chat-send') };

    btn.addEventListener('click', open);
    box.querySelector('.smr-chat-x').addEventListener('click', close);
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    els.form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    els.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); }
    });
    els.input.addEventListener('input', grow);
    render();
    if (state.pending) poll();
  }

  function grow() {
    els.input.style.height = 'auto';
    var h = els.input.scrollHeight;
    els.input.style.height = Math.min(120, h) + 'px';
    els.input.style.overflowY = h > 120 ? 'auto' : 'hidden';
  }

  function render() {
    var html = '<div class="smr-msg bot">' + linkify(GREETING) + '</div>';
    if (!state.msgs.length) {
      html += '<div class="smr-chips">' + CHIPS.map(function (c) {
        return '<button type="button" class="smr-chip">' + esc(c) + '</button>';
      }).join('') + '</div>';
    }
    state.msgs.forEach(function (m) {
      if (m.r === 'team') html += '<div class="smr-msg team"><b>MARCELO · SOOMARIO</b>' + linkify(m.t) + '</div>';
      else html += '<div class="smr-msg ' + (m.r === 'me' ? 'me' : 'bot') + '">' + linkify(m.t) + '</div>';
    });
    if (busy) html += '<div class="smr-typing" aria-label="The assistant is typing"><i></i><i></i><i></i></div>';
    els.log.innerHTML = html;
    Array.prototype.forEach.call(els.log.querySelectorAll('.smr-chip'), function (b) {
      b.addEventListener('click', function () { ask(b.textContent); });
    });
    els.log.scrollTop = els.log.scrollHeight;
    els.send.disabled = busy;
  }

  function open() {
    els.box.hidden = false;
    els.btn.hidden = true;
    els.btn.classList.remove('has-reply');
    els.log.scrollTop = els.log.scrollHeight;
    els.input.focus();
    poll();
    clearInterval(pollTimer);
    pollTimer = setInterval(poll, POLL_MS);
  }

  function close() {
    els.box.hidden = true;
    els.btn.hidden = false;
    clearInterval(pollTimer);
    els.btn.focus();
  }

  function submit() {
    var q = els.input.value.trim();
    if (!q || busy) return;
    els.input.value = '';
    grow();
    ask(q);
  }

  function ask(q) {
    if (busy) return;
    state.msgs.push({ r: 'me', t: q });
    busy = true;
    save();
    render();
    fetch(API + '/support/chat', {
      method: 'POST', mode: 'cors', credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: state.session, message: q })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (j) {
        state.msgs.push({ r: 'bot', t: j.reply || ("I couldn't answer just now. Please try again, or ask on Discord: " + DISCORD) });
        if (j.handed) state.pending = true;
      })
      .catch(function () {
        state.msgs.push({ r: 'bot', t: "I couldn't reach the assistant. Please try again in a minute, or ask on Discord: " + DISCORD });
      })
      .then(function () { busy = false; save(); render(); els.input.focus(); });
  }

  function poll() {
    fetch(API + '/support/chat/updates?session=' + encodeURIComponent(state.session) + '&after=' + (state.after || 0),
          { method: 'GET', mode: 'cors', credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : { messages: [] }; })
      .catch(function () { return { messages: [] }; })
      .then(function (j) {
        var got = (j.messages || []);
        if (!got.length) return;
        got.forEach(function (m) {
          state.msgs.push({ r: 'team', t: m.text });
          state.after = Math.max(state.after || 0, m.id);
        });
        save();
        render();
        if (els.box.hidden) els.btn.classList.add('has-reply');
      });
  }

  function init() {
    checkOn(function (on) { if (on) build(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
