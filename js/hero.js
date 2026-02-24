// js/hero.js
// Hero: 12 verified book covers (Internet Archive) flip in a wave to reveal
// Boyd's pilot photo. All 12 titles confirmed in Boyd's personal papers (Part II PDF).

(function () {
  'use strict';

  var COLS     = 4;
  var ROWS     = 3;
  var FLIP_MS  = 700;   // must match CSS transition
  var WAVE_COL = 110;   // ms delay added per column
  var WAVE_ROW = 55;    // ms delay added per row
  var TIMEOUT  = 4000;  // give up waiting for covers after this many ms

  var PILOT_URL = 'JohnBoyd_Pilot.jpg';

  // 12 books confirmed in Boyd's personal papers (Part II, coljohnboyd.com archives).
  // Covers served from Internet Archive (archive.org/services/img/IDENTIFIER).
  // Verified: each identifier fetched and confirmed as a real IA item.
  var BOOKS = [
    // Confirmed in Part II PDF (Political Theory / Philosophy / Science section)
    { id: 'chaosmakingnewsc0000unse',               label: 'Chaos — Gleick (1987, annotated)' },
    { id: 'godel-escher-bach-douglas-hofstadter',   label: 'Gödel, Escher, Bach — Hofstadter (1979, annotated)' },
    { id: 'evolutionofcoope1984axel',               label: 'The Evolution of Cooperation — Axelrod (1984, annotated)' },
    { id: 'orderoutofchaosm00prig',                 label: 'Order Out of Chaos — Prigogine (1984, 2 copies)' },
    { id: 'briefhistoryofti0000hawk_j2d2',          label: 'A Brief History of Time — Hawking (1988, annotated)' },
    { id: 'taoteching0000laoz_l1p2',                label: 'Tao Te Ching — Lao Tzu (annotated)' },
    { id: 'structureofscien0003kuhn_k955',          label: 'The Structure of Scientific Revolutions — Kuhn (3 copies)' },
    { id: 'stepstoecologyof0000bate',               label: 'Steps to an Ecology of Mind — Bateson (1972)' },
    // Confirmed in Part I (Military History / Strategy section)
    { id: 'artofwaroldestmi00suntuoft',             label: 'The Art of War — Sun Tzu' },
    { id: 'onwar0000clau',                          label: 'On War — Clausewitz' },
    { id: 'infantryattacks0000romm',                label: 'Infantry Attacks — Rommel' },
    { id: 'strategyindirect0000lidd',               label: 'Strategy: The Indirect Approach — Liddell Hart' },
  ];

  function coverUrl(id) {
    return 'https://archive.org/services/img/' + id;
  }

  // ── Entry point ───────────────────────────────────────────────────────────
  function init() {
    var hero = document.getElementById('hero');
    if (!hero) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var skipped = localStorage.getItem('boyd_skip_anim') === '1';

    buildGrid(hero);
    addSkipButton(hero);
    wireScrollCue();

    // Preload pilot photo before tiles flip so it's in cache
    var boydImg = new Image();
    boydImg.onload = function () {
      applyBoydImage();
      if (reduced || skipped) { flipAll(); revealContent(); }
      else { loadCovers(); }
    };
    boydImg.onerror = function () {
      applyBoydImage();
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
        front.title     = book.label;

        var back = document.createElement('div');
        back.className  = 'tile-back';

        inner.appendChild(front);
        inner.appendChild(back);
        tile.appendChild(inner);
        grid.appendChild(tile);
      }
    }

    hero.insertBefore(grid, hero.firstChild);
  }

  // ── Apply Boyd photo to tile backs ────────────────────────────────────────
  function applyBoydImage() {
    var grid = document.getElementById('mosaic-grid');
    if (!grid) return;

    var gridRect = grid.getBoundingClientRect();
    var gridW = gridRect.width;
    var gridH = gridRect.height;

    // Use a temp image to get natural dimensions
    var img = new Image();
    img.onload = function () {
      var imgRatio  = img.naturalWidth / img.naturalHeight;
      var gridRatio = gridW / gridH;
      var bgW, bgH;
      if (imgRatio < gridRatio) {
        bgH = gridH; bgW = gridH * imgRatio;
      } else {
        bgW = gridW; bgH = gridW / imgRatio;
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
    };
    img.src = PILOT_URL;
  }

  // ── Load IA covers with timeout fallback ──────────────────────────────────
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
        if (img.naturalWidth > 10) {
          front.style.backgroundImage = 'url(\'' + img.src + '\')';
        }
        onDone();
      };
      img.onerror = onDone;
      img.src = coverUrl(book.id);
    });
  }

  // ── Staggered wave flip ───────────────────────────────────────────────────
  function startWave() {
    var tiles    = document.querySelectorAll('.mosaic-tile');
    var maxDelay = 0;

    tiles.forEach(function (tile) {
      var c     = parseInt(tile.dataset.c, 10);
      var r     = parseInt(tile.dataset.r, 10);
      var delay = c * WAVE_COL + r * WAVE_ROW;
      if (delay > maxDelay) maxDelay = delay;
      setTimeout(function () { tile.classList.add('flipped'); }, delay);
    });

    setTimeout(function () {
      revealContent();
      var skip = document.getElementById('skip-anim');
      if (skip) skip.style.opacity = '0';
    }, maxDelay + FLIP_MS + 350);
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
