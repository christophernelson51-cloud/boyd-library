// js/theme.js — Light / dark mode toggle

(function () {
  'use strict';

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('boyd_theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent  = theme === 'dark' ? '☀' : '☾';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function init() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    // Set correct icon for whatever theme is already active
    applyTheme(getTheme());
    btn.addEventListener('click', function () {
      applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  window.BoydTheme = { init: init };
})();
