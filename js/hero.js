// js/hero.js — Video intro, reveal on end or skip

(function () {
  'use strict';

  function init() {
    var overlay = document.getElementById('video-overlay');
    var video   = document.getElementById('intro-video');
    var skipBtn = document.getElementById('skip-intro');

    if (!overlay || !video) {
      revealContent();
      return;
    }

    // If already skipped in a prior visit, skip instantly
    if (localStorage.getItem('boyd_skip_intro') === '1') {
      overlay.style.display = 'none';
      revealContent();
      return;
    }

    video.addEventListener('ended', reveal);
    video.addEventListener('error', function () {
      overlay.style.display = 'none';
      revealContent();
    });

    if (skipBtn) {
      skipBtn.addEventListener('click', function () {
        localStorage.setItem('boyd_skip_intro', '1');
        reveal();
      });
    }

    // Fallback: if video stalls for 10s, reveal anyway
    var fallback = setTimeout(function () {
      if (overlay.style.display !== 'none') reveal();
    }, 10000);

    function reveal() {
      clearTimeout(fallback);
      overlay.classList.add('fading');
      setTimeout(function () {
        overlay.style.display = 'none';
        revealContent();
      }, 900);
    }
  }

  function revealContent() {
    document.body.classList.add('intro-done');
    var content = document.getElementById('hero-content');
    if (content) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          content.classList.add('visible');
        });
      });
    }
    wireScrollCue();
  }

  function wireScrollCue() {
    var cue = document.getElementById('scroll-cue');
    if (!cue) return;

    cue.addEventListener('click', function () {
      var next = document.getElementById('section-intro');
      if (next) next.scrollIntoView({ behavior: 'smooth' });
    });

    cue.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        var next = document.getElementById('section-intro');
        if (next) next.scrollIntoView({ behavior: 'smooth' });
      }
    });

    var onScroll = function () {
      if (window.scrollY > 80) {
        cue.classList.add('hidden');
        window.removeEventListener('scroll', onScroll, { passive: true });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  window.BoydHero = { init: init };

})();
