// js/hero.js
// Hero: 12 verified book covers (Open Library) flip in a wave to reveal
// Boyd's pilot photo. All 12 titles confirmed in Boyd's personal papers.

(function () {
  'use strict';

  var COLS     = 4;
  var ROWS     = 3;
  var FLIP_MS  = 560;   // must match CSS transition
  var WAVE_COL = 85;    // ms delay added per column
  var WAVE_ROW = 45;    // ms delay added per row
  var JITTER   = 30;    // ms of random per-tile jitter
  var TIMEOUT  = 4000;  // give up waiting for covers after this many ms

  var PILOT_URL = 'JohnBoyd_Pilot.jpg';

  // Cached natural image dimensions — set once when pilot photo loads
  var imgNatW = 0;
  var imgNatH = 0;

  // 12 representative books from Boyd's personal papers.
  // Covers served from Open Library (covers.openlibrary.org).
  // Row 1: Science & Complexity
  // Row 2: Epistemology & Philosophy
  // Row 3: Strategy, Management & Science
  var BOOKS = [
    { title: 'Chaos — Gleick (1987, annotated)',                    cover: 'https://covers.openlibrary.org/b/id/94249-M.jpg' },
    { title: 'Gödel, Escher, Bach — Hofstadter (1979, annotated)', cover: 'https://covers.openlibrary.org/b/isbn/0394745027-M.jpg' },
    { title: 'The Evolution of Cooperation — Axelrod (1984)',       cover: 'https://covers.openlibrary.org/b/id/4232868-M.jpg' },
    { title: 'Order Out of Chaos — Prigogine (1984, 2 copies)',     cover: 'https://covers.openlibrary.org/b/id/7130129-M.jpg' },
    { title: 'A Brief History of Time — Hawking (1988, annotated)', cover: 'https://covers.openlibrary.org/b/isbn/0553380168-M.jpg' },
    { title: 'The Structure of Scientific Revolutions — Kuhn',      cover: 'https://covers.openlibrary.org/b/id/6566386-M.jpg' },
    { title: 'Mind and Nature — Bateson (1979, annotated)',         cover: 'https://covers.openlibrary.org/b/id/823370-M.jpg' },
    { title: 'The Selfish Gene — Dawkins (1976)',                   cover: 'https://covers.openlibrary.org/b/isbn/0192860925-M.jpg' },
    { title: 'The Art of War — Sun Tzu',                            cover: 'https://covers.openlibrary.org/b/id/4849549-M.jpg' },
    { title: 'On War — Clausewitz',                                 cover: 'https://covers.openlibrary.org/b/isbn/0140444270-M.jpg' },
    { title: 'Toyota Production System — Ohno (1988, annotated)',   cover: 'https://covers.openlibrary.org/b/id/1895789-M.jpg' },
    { title: 'The Origin of Species — Darwin',                      cover: 'https://covers.openlibrary.org/b/id/7153600-M.jpg' },
  ];

  // ── Entry point ───────────────────────────────────────────────────────────
  function init() {
    var hero = document.getElementById('hero');
    if (!hero) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var skipped = localStorage.getItem('boyd_skip_anim') === '1';

    buildGrid(hero);
    addSkipButton(hero);
    wireScrollCue();

    // Preload pilot photo, cache natural dimensions, then start
    var boydImg = new Image();
    boydImg.onload = function () {
      imgNatW = boydImg.naturalWidth;
      imgNatH = boydImg.naturalHeight;
      applyBoydImage();
      wireResize();
      if (reduced || skipped) { flipAll(); revealContent(); }
      else { loadCovers(); }
    };
    boydImg.onerror = function () {
      // Still try to proceed even without natural dimensions
      applyBoydImage();
      wireResize();
      if (reduced || skipped) { flipAll(); revealContent(); }
      else { loadCovers(); }
    };
    boydImg.src = PILOT_URL;
  }

  // ── Build 4×3 tile grid ───────────────────────────────────────────────────
  function buildGrid(hero) {
    var grid = document.createElement('div');
    grid.id = 'mosaic-grid';

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var idx  = r * COLS + c;
        var book = BOOKS[idx % BOOKS.length];

        var tile  = document.createElement('div');
        tile.className  = 'mosaic-tile';
        tile.dataset.c  = c;
        tile.dataset.r  = r;

        var inner = document.createElement('div');
        inner.className = 'tile-inner';

        var front = document.createElement('div');
        front.className = 'tile-front';
        front.title     = book.title;

        var back = document.createElement('div');
        back.className  = 'tile-back';

        inner.appendChild(front);
        inner.appendChild(back);
        tile.appendChild(inner);
        grid.appendChild(tile);
      }
    }

    // Insert into the image column so the mosaic only covers the left panel
    var imageCol = hero.querySelector('.hero-image-col');
    var container = imageCol || hero;
    container.insertBefore(grid, container.firstChild);
  }

  // ── Apply Boyd photo to grid background and each tile back ────────────────
  // Synchronous — uses cached imgNatW/imgNatH.
  function applyBoydImage() {
    var grid = document.getElementById('mosaic-grid');
    if (!grid) return;

    var gridRect = grid.getBoundingClientRect();
    var gridW = gridRect.width;
    var gridH = gridRect.height;
    if (gridW === 0 || gridH === 0) return;

    var bgW, bgH;
    if (imgNatW && imgNatH) {
      var imgRatio  = imgNatW / imgNatH;
      var gridRatio = gridW / gridH;
      if (imgRatio < gridRatio) {
        bgH = gridH; bgW = gridH * imgRatio;
      } else {
        bgW = gridW; bgH = gridW / imgRatio;
      }
    } else {
      // Fallback: cover the grid
      bgW = gridW; bgH = gridH;
    }
    var ox = (gridW - bgW) / 2;
    var oy = (gridH - bgH) / 2;

    grid.style.backgroundImage    = 'url(\'' + PILOT_URL + '\')';
    grid.style.backgroundSize     = bgW + 'px ' + bgH + 'px';
    grid.style.backgroundPosition = ox + 'px ' + oy + 'px';

    document.querySelectorAll('.mosaic-tile').forEach(function (tile) {
      var tr   = tile.getBoundingClientRect();
      var left = tr.left - gridRect.left;
      var top  = tr.top  - gridRect.top;
      var back = tile.querySelector('.tile-back');
      back.style.backgroundImage    = 'url(\'' + PILOT_URL + '\')';
      back.style.backgroundSize     = bgW + 'px ' + bgH + 'px';
      back.style.backgroundPosition = (ox - left) + 'px ' + (oy - top) + 'px';
    });
  }

  // ── Recalculate tile backgrounds on window resize ─────────────────────────
  function wireResize() {
    var timer = null;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(applyBoydImage, 120);
    }, { passive: true });
  }

  // ── Load OL covers with timeout fallback ──────────────────────────────────
  function loadCovers() {
    var fronts = document.querySelectorAll('.tile-front');
    var total  = fronts.length;
    var done   = 0;
    var fired  = false;

    function onDone() {
      done++;
      if (done >= total && !fired) {
        fired = true;
        clearTimeout(timer);
        setTimeout(startWave, 180);
      }
    }

    var timer = setTimeout(function () {
      if (!fired) { fired = true; startWave(); }
    }, TIMEOUT);

    fronts.forEach(function (front, i) {
      var book = BOOKS[i % BOOKS.length];
      var img  = new Image();
      img.onload = function () {
        if (img.naturalWidth > 10) {
          front.style.backgroundImage = 'url(\'' + img.src + '\')';
        }
        onDone();
      };
      img.onerror = onDone;
      img.src = book.cover;
    });
  }

  // ── Staggered wave flip ───────────────────────────────────────────────────
  function startWave() {
    var tiles    = document.querySelectorAll('.mosaic-tile');
    var maxDelay = 0;

    tiles.forEach(function (tile) {
      var c     = parseInt(tile.dataset.c, 10);
      var r     = parseInt(tile.dataset.r, 10);
      var delay = c * WAVE_COL + r * WAVE_ROW + Math.random() * JITTER;
      if (delay > maxDelay) maxDelay = delay;
      setTimeout(function () { tile.classList.add('flipped'); }, delay);
    });

    setTimeout(function () {
      revealContent();
      var skip = document.getElementById('skip-anim');
      if (skip) skip.style.opacity = '0';
    }, maxDelay + FLIP_MS + 250);
  }

  // ── Instant flip (reduced motion / skip) ─────────────────────────────────
  function flipAll() {
    document.querySelectorAll('.mosaic-tile').forEach(function (tile) {
      tile.classList.add('no-transition', 'flipped');
    });
  }

  // ── Skip button ───────────────────────────────────────────────────────────
  function addSkipButton(hero) {
    var btn = document.createElement('button');
    btn.id          = 'skip-anim';
    btn.textContent = 'Skip';
    btn.addEventListener('click', function () {
      localStorage.setItem('boyd_skip_anim', '1');
      btn.style.display = 'none';
      flipAll();
      revealContent();
    });
    hero.appendChild(btn);
  }

  // ── Reveal headline ───────────────────────────────────────────────────────
  function revealContent() {
    var content = document.getElementById('hero-content');
    if (content) content.classList.add('visible');
  }

  // ── Scroll cue ────────────────────────────────────────────────────────────
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
