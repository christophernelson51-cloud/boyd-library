// js/hero.js
// Hero section: video loop + scroll cue animation

(function () {
  'use strict';

  function init() {
    var video = document.getElementById('hero-video');
    var scrollCue = document.getElementById('scroll-cue');

    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      // Attempt autoplay; browsers require muted for autoplay
      var playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(function () {
          // Autoplay blocked; show poster, video will play on user interaction
          video.controls = false;
        });
      }
    }

    // Scroll cue: hide once user starts scrolling
    if (scrollCue) {
      var onScroll = function () {
        if (window.scrollY > 80) {
          scrollCue.classList.add('hidden');
          window.removeEventListener('scroll', onScroll, { passive: true });
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Scroll cue click → smooth scroll to next section
    if (scrollCue) {
      scrollCue.addEventListener('click', function () {
        var next = document.getElementById('section-intro');
        if (next) next.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  window.BoydHero = { init: init };

})();
