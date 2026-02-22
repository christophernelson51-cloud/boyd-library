// js/hero.js
// Hero: Shows Boyd's portrait as a static background.

(function () {
  'use strict';

  var BOYD_URL = 'JohnBoyd_Pilot.jpg';

  function init() {
    var hero = document.getElementById('hero');
    if (!hero) return;

    // Set Boyd portrait as a full-bleed background
    var bg = document.createElement('div');
    bg.style.cssText = [
      'position:absolute',
      'inset:0',
      'background-image:url(\'' + BOYD_URL + '\')',
      'background-size:cover',
      'background-position:center top',
      'z-index:0'
    ].join(';');
    hero.insertBefore(bg, hero.firstChild);

    // Reveal headline immediately
    var content = document.getElementById('hero-content');
    if (content) content.classList.add('visible');

    wireScrollCue();
  }

  function wireScrollCue() {
    var cue = document.getElementById('scroll-cue');
    if (!cue) return;

    var onScroll = function () {
      if (window.scrollY > 80) {
        cue.classList.add('hidden');
        window.removeEventListener('scroll', onScroll, { passive: true });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    cue.addEventListener('click', function () {
      var next = document.getElementById('section-intro');
      if (next) next.scrollIntoView({ behavior: 'smooth' });
    });
  }

  window.BoydHero = { init: init };

})();
