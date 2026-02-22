// js/hero.js
// Hero: 12 book-cover tiles flip in a left-to-right wave to reveal Boyd's portrait.
// Respects prefers-reduced-motion and a persistent "skip" flag in localStorage.

(function () {
  'use strict';

  var COLS      = 4;
  var ROWS      = 3;
  var FLIP_MS   = 700;   // must match CSS transition duration
  var WAVE_COL  = 110;   // ms added per column
  var WAVE_ROW  = 55;    // ms added per row
  var TIMEOUT   = 2500;  // give up waiting for covers after this

  var BOYD_URL  = 'https://upload.wikimedia.org/wikipedia/commons/0/0f/JohnBoyd_Pilot.jpg';

  // 12 books from Boyd's actual library — ISBNs chosen for Open Library cover availability
  var BOOKS = [
    { isbn: '9780140455526', label: 'The Art of War' },
    { isbn: '9780140444278', label: 'On War' },
    { isbn: '9780226458083', label: 'The Structure of Scientific Revolutions' },
    { isbn: '9780140092509', label: 'Chaos' },
    { isbn: '9780465026562', label: 'Gödel, Escher, Bach' },
    { isbn: '9780452010772', label: 'Strategy' },
    { isbn: '9780465021222', label: 'The Evolution of Cooperation' },
    { isbn: '9780375705090', label: 'Zen in the Art of Archery' },
    { isbn: '9780674840317', label: 'The Strategy of Conflict' },
    { isbn: '9780226039053', label: 'Steps to an Ecology of Mind' },
    { isbn: '9780891411086', label: 'Infantry Attacks' },
    { isbn: '9780385069885', label: 'The Tacit Dimension' },
  ];

  function coverUrl(isbn) {
    return 'https://covers.openlibrary.org/b/isbn/' + isbn + '-M.jpg';
  }

  // ── Entry point (called by app.js) ──────────────────────────────────────────
  function init() {
    var hero = document.getElementById('hero');
    if (!hero) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var skipped = localStorage.getItem('boyd_skip_anim') === '1';

    buildGrid(hero);
    addSkipButton(hero);
    wireScrollCue();

    if (reduced || skipped) {
      flipAll();
      revealContent();
      return;
    }

    loadCovers();
  }

  // ── Build the 4×3 tile grid ──────────────────────────────────────────────────
  function buildGrid(hero) {
    var grid = document.createElement('div');
    grid.id = 'mosaic-grid';

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var idx   = r * COLS + c;
        var book  = BOOKS[idx % BOOKS.length];

        var tile  = document.createElement('div');
        tile.className   = 'mosaic-tile';
        tile.dataset.c   = c;
        tile.dataset.r   = r;

        var inner = document.createElement('div');
        inner.className  = 'tile-inner';

        var front = document.createElement('div');
        front.className  = 'tile-front';
        front.title      = book.label;

        var back  = document.createElement('div');
        back.className   = 'tile-back';

        // Each back tile shows its slice of the Boyd portrait.
        // background-size: 400% 300% makes the image span the full 4×3 grid.
        // Percentage position maps each tile to its correct quadrant.
        back.style.backgroundImage    = 'url(\'' + BOYD_URL + '\')';
        back.style.backgroundSize     = (COLS * 100) + '% ' + (ROWS * 100) + '%';
        back.style.backgroundPosition =
          (COLS > 1 ? (c / (COLS - 1)) * 100 : 0) + '% ' +
          (ROWS > 1 ? (r / (ROWS - 1)) * 100 : 0) + '%';

        inner.appendChild(front);
        inner.appendChild(back);
        tile.appendChild(inner);
        grid.appendChild(tile);
      }
    }

    // Insert before vignette so vignette + content sit on top
    hero.insertBefore(grid, hero.firstChild);
  }

  // ── Skip button ──────────────────────────────────────────────────────────────
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

  // ── Load covers with a 2.5s timeout fallback ────────────────────────────────
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
        setTimeout(startWave, 250);
      }
    }

    var timer = setTimeout(function () {
      if (!fired) { fired = true; startWave(); }
    }, TIMEOUT);

    fronts.forEach(function (front, i) {
      var book = BOOKS[i % BOOKS.length];
      var img  = new Image();
      img.onload = function () {
        // Open Library returns a 1×1 gif when no cover exists — reject it
        if (img.naturalWidth > 10) {
          front.style.backgroundImage = 'url(\'' + img.src + '\')';
        }
        onDone();
      };
      img.onerror = onDone;
      img.src = coverUrl(book.isbn);
    });
  }

  // ── Staggered wave flip ──────────────────────────────────────────────────────
  function startWave() {
    var tiles    = document.querySelectorAll('.mosaic-tile');
    var maxDelay = 0;

    tiles.forEach(function (tile) {
      var c     = parseInt(tile.dataset.c, 10);
      var r     = parseInt(tile.dataset.r, 10);
      var delay = c * WAVE_COL + r * WAVE_ROW;
      if (delay > maxDelay) maxDelay = delay;

      setTimeout(function () {
        tile.classList.add('flipped');
      }, delay);
    });

    // Fade in headline after last tile finishes
    setTimeout(function () {
      revealContent();
      var skip = document.getElementById('skip-anim');
      if (skip) skip.style.opacity = '0';
    }, maxDelay + FLIP_MS + 350);
  }

  // ── Instant flip (no-animation path) ────────────────────────────────────────
  function flipAll() {
    document.querySelectorAll('.mosaic-tile').forEach(function (tile) {
      tile.classList.add('no-transition', 'flipped');
    });
  }

  // ── Reveal headline + scroll cue ────────────────────────────────────────────
  function revealContent() {
    var content = document.getElementById('hero-content');
    if (content) content.classList.add('visible');
  }

  // ── Scroll cue: hide on scroll, click to jump ────────────────────────────────
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
