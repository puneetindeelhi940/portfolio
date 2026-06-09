/* Puneet Arora — portfolio shared JS.
 * Soft access gate + small chrome utilities.
 * NOTE: The gate is light obfuscation, not security. Hash is for UX, not auth.
 */

(function () {
  'use strict';

  // ── Soft gate ─────────────────────────────────────────────
  // Default passcode is the namesake quote, lowercased + no spaces:
  //   "Grow the core, while adding some more" → "growthecore"
  // Change PASS_HASH below to rotate.
  // Hash is SHA-256(passcode), hex. Computed once and pasted here so we
  // don't ship the plaintext.
  // To rotate: open browser console, run
  //   await window.__hashGatePass('your-new-pass')
  // then paste the returned hex into PASS_HASH.
  const PASS_HASH = 'c6bc99f7251959aded2db23e9482c8daa997e0c92d6f210915a86ba3b666130a';
  const SESSION_KEY = 'pa-gate-2026';

  async function sha256Hex(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }
  window.__hashGatePass = sha256Hex; // expose helper for rotation

  // Pages that require the gate (everything except the gate itself):
  function isProtected() {
    const path = location.pathname.replace(/\/$/, '');
    return !path.endsWith('/index.html') && !path.endsWith('/index') && path !== '' && !path.endsWith('/site') && !path.endsWith('/site/');
  }

  function hasAccess() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1' ||
             localStorage.getItem(SESSION_KEY) === '1';
    } catch (e) { return false; }
  }

  function grantAccess(remember) {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
      if (remember) localStorage.setItem(SESSION_KEY, '1');
    } catch (e) {}
  }

  function revokeAccess() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }
  window.__paSignOut = revokeAccess;

  // Run on every page: if protected and no access, bounce to gate
  if (isProtected() && !hasAccess()) {
    // Preserve the page they wanted in the hash, so we can return after gate.
    const target = encodeURIComponent(location.pathname.split('/').pop() + location.search + location.hash);
    location.replace('index.html?to=' + target);
  }

  // ── Gate page wiring ──────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('gate-form');
    if (form) {
      const inp = document.getElementById('gate-input');
      const rem = document.getElementById('gate-remember');
      const root = document.getElementById('gate-root');
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const raw = (inp.value || '').trim().toLowerCase().replace(/\s+/g, '');
        const h = await sha256Hex(raw);
        if (h === PASS_HASH) {
          grantAccess(rem && rem.checked);
          // Redirect to ?to=... or home.html
          const params = new URLSearchParams(location.search);
          const to = params.get('to');
          location.replace(to ? decodeURIComponent(to) : 'home.html');
        } else {
          root.classList.add('is-err');
          inp.value = '';
          inp.focus();
        }
      });
      inp && inp.focus();
    }

    // Year stamp
    const yr = document.getElementById('year');
    if (yr) yr.textContent = String(new Date().getFullYear());

    // Theme toggle
    const toggleOpts = document.querySelectorAll('[data-theme-set]');
    if (toggleOpts.length) {
      try {
        const saved = localStorage.getItem('pa-theme') || 'default';
        toggleOpts.forEach(b => {
          const active = b.getAttribute('data-theme-set') === saved;
          b.setAttribute('aria-checked', String(active));
          b.classList.toggle('is-active', active);
        });
      } catch(e) {}

      toggleOpts.forEach(btn => {
        btn.addEventListener('click', function () {
          const theme = this.getAttribute('data-theme-set');
          if (theme === 'default') {
            document.documentElement.removeAttribute('data-theme');
            try { localStorage.removeItem('pa-theme'); } catch(e) {}
          } else {
            document.documentElement.setAttribute('data-theme', theme);
            try { localStorage.setItem('pa-theme', theme); } catch(e) {}
          }
          toggleOpts.forEach(b => {
            const active = b === this;
            b.setAttribute('aria-checked', String(active));
            b.classList.toggle('is-active', active);
          });
        });
      });
    }

    // Live clock in topbar (IST)
    const clk = document.getElementById('clock');
    if (clk) {
      const tick = () => {
        const d = new Date();
        const ist = new Date(d.getTime() + (d.getTimezoneOffset() + 330) * 60000);
        const hh = String(ist.getHours()).padStart(2, '0');
        const mm = String(ist.getMinutes()).padStart(2, '0');
        clk.textContent = 'IST ' + hh + ':' + mm;
      };
      tick();
      setInterval(tick, 30000);
    }
  });
})();
