/* Puneet Arora — portfolio shared JS.
 * Soft access gate + small chrome utilities.
 * NOTE: The gate is light obfuscation, not security. Hash is for UX, not auth.
 */

(function () {
  'use strict';

  // ── Theme (Teal default / Forest) ─────────────────────────
  // Persisted in localStorage. A tiny inline <script> in each page's
  // <head> applies the attribute BEFORE first paint to prevent FOUC;
  // this block handles the toggle UI + cross-tab sync.
  const THEME_KEY = 'pa-theme';
  const THEMES = ['default', 'forest'];

  function getTheme() {
    try {
      const t = localStorage.getItem(THEME_KEY);
      return THEMES.indexOf(t) >= 0 ? t : 'default';
    } catch (e) { return 'default'; }
  }
  function applyTheme(t) {
    if (t === 'forest') document.documentElement.setAttribute('data-theme', 'forest');
    else document.documentElement.removeAttribute('data-theme');
  }
  function setTheme(t) {
    if (THEMES.indexOf(t) < 0) return;
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    applyTheme(t);
    syncToggles(t);
  }
  function syncToggles(t) {
    const opts = document.querySelectorAll('[data-theme-set]');
    opts.forEach(b => {
      b.classList.toggle('is-active', b.getAttribute('data-theme-set') === t);
      b.setAttribute('aria-checked', b.getAttribute('data-theme-set') === t ? 'true' : 'false');
    });
  }
  window.__paTheme = { get: getTheme, set: setTheme };

  // Cross-tab sync
  window.addEventListener('storage', function (e) {
    if (e.key === THEME_KEY) {
      applyTheme(getTheme());
      syncToggles(getTheme());
    }
  });

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
    // Theme toggle buttons (gate + topbar, wherever present)
    syncToggles(getTheme());
    document.querySelectorAll('[data-theme-set]').forEach(b => {
      b.addEventListener('click', function () {
        setTheme(b.getAttribute('data-theme-set'));
      });
    });

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
