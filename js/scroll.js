// js/scroll.js
// IntersectionObserver for section transitions, card animations, and reading progress bar

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── Reading progress bar ─────────────────────────────────────────────────
  function initProgressBar() {
    var bar = document.getElementById('progress-bar');
    if (!bar) return;

    window.addEventListener('scroll', function () {
      var scrollTop    = window.scrollY || document.documentElement.scrollTop;
      var docHeight    = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width  = Math.min(progress, 100) + '%';
    }, { passive: true });
  }

  // ─── Section transition observer ─────────────────────────────────────────
  function initSectionObserver() {
    var sections = document.querySelectorAll('[data-section]');
    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var sectionId = entry.target.dataset.section;
          if (window.BoydState) {
            window.BoydState.set({ activeSection: sectionId });
          }
          // Update nav active state
          document.querySelectorAll('.nav-link').forEach(function (link) {
            link.classList.toggle('active', link.dataset.section === sectionId);
          });
        }
      });
    }, { threshold: 0.15 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  // ─── Card animation observer ──────────────────────────────────────────────
  function initCardObserver() {
    var cards = document.querySelectorAll('.book-card, .animate-in');
    if (!cards.length) return;

    if (prefersReducedMotion) {
      // Just make visible immediately, no transforms
      cards.forEach(function (card) { card.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    cards.forEach(function (card) { observer.observe(card); });
  }

  // ─── Re-observe after dynamic content added ───────────────────────────────
  function observeNewCards(container) {
    if (prefersReducedMotion) {
      container.querySelectorAll('.book-card, .animate-in').forEach(function (c) {
        c.classList.add('visible');
      });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    container.querySelectorAll('.book-card:not(.visible), .animate-in:not(.visible)')
      .forEach(function (card) { observer.observe(card); });
  }

  function init() {
    initProgressBar();
    initSectionObserver();
    initCardObserver();
  }

  window.BoydScroll = { init: init, observeNewCards: observeNewCards };

})();
