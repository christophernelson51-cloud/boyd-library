// js/hero.js — Video intro, reveal on end or skip

(function () {
  'use strict';

  function init() {
    buildSpineWall();

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

  // Build the spine wall from the loaded book data — colored by branch,
  // grouped into four blocks, height scaled by Goodreads rating.
  function buildSpineWall() {
    var wall = document.getElementById('spine-wall');
    if (!wall || !window.BOYD_DATA || !window.BOYD_DATA.ACTUAL_BOOKS) return;

    var order = { war: 0, science: 1, mind: 2, power: 3 };
    var books = window.BOYD_DATA.ACTUAL_BOOKS.slice().sort(function (a, b) {
      var oa = order[a.branch] != null ? order[a.branch] : 9;
      var ob = order[b.branch] != null ? order[b.branch] : 9;
      if (oa !== ob) return oa - ob;
      return (b.rating || 0) - (a.rating || 0);
    });

    var html = '';
    books.forEach(function (b) {
      var rating = b.rating || 3.5;
      var h = 35 + ((rating - 3) / 2) * 65;   // ~35%–100% of wall height
      if (h < 28) h = 28;
      if (h > 100) h = 100;
      var color = b.branchColor || '#888';
      var rstr  = (b.rating != null) ? ' (' + b.rating.toFixed(2) + '★)' : '';
      var label = (b.title + ' — ' + (b.author || '') + rstr).replace(/"/g, '&quot;');
      html += '<button class="spine" style="height:' + h.toFixed(1) + '%;background:' + color +
              '" title="' + label + '" data-slug="' + b.slug + '"></button>';
    });
    wall.innerHTML = html;

    wall.addEventListener('click', function (e) {
      var spine = e.target.closest('.spine');
      if (!spine) return;
      var slug = spine.dataset.slug;
      var book = books.filter(function (x) { return x.slug === slug; })[0];
      if (window.BoydState && book) window.BoydState.set({ searchQuery: book.title });
      var rankings = document.getElementById('section-rankings');
      if (rankings) rankings.scrollIntoView({ behavior: 'smooth' });
    });
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
