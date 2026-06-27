/* Puneet Arora — portfolio shared JS.
 * Small chrome utilities: theme toggle + year stamp.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
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
    // Keyboard support: make click-only interactive elements respond to Enter/Space
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var t = e.target;
      if (t.tagName === 'BUTTON' || t.tagName === 'A' || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
      if (t.hasAttribute('tabindex') || t.hasAttribute('role')) {
        e.preventDefault();
        t.click();
      }
    });
  });

  // Global error handler
  window.addEventListener('error', function (e) {
    if (typeof console !== 'undefined') console.warn('[Portfolio]', e.message);
  });
  window.addEventListener('unhandledrejection', function (e) {
    if (typeof console !== 'undefined') console.warn('[Portfolio] Unhandled promise:', e.reason);
  });
})();
