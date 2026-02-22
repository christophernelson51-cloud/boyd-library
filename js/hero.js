// js/hero.js
// Hero: Shows Boyd pilot photo positioned on the right side of the hero.

(function () {
  'use strict';

  var PILOT_URL = 'JohnBoyd_Pilot.jpg';

  function init() {
    var hero = document.getElementById('hero');
    if (!hero) return;

    var img = document.createElement('img');
    img.src = PILOT_URL;
    img.alt = 'John Boyd climbing out of cockpit';
    img.className = 'hero-pilot';

    hero.appendChild(img);

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
