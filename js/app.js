// js/app.js
// Initialize all modules and wire them together

(function () {
  'use strict';

  function init() {
    var data = window.BOYD_DATA;
    if (!data) { console.error('BOYD_DATA not loaded'); return; }

    var actual      = data.ACTUAL_BOOKS      || [];
    var speculative = data.SPECULATIVE_BOOKS || [];

    // ── State: load from URL hash ─────────────────────────────────────────
    if (window.BoydState) window.BoydState.loadFromHash();

    // ── Theme toggle ──────────────────────────────────────────────────────
    if (window.BoydTheme)   window.BoydTheme.init();

    // ── Hero ──────────────────────────────────────────────────────────────
    if (window.BoydHero)    window.BoydHero.init();

    // ── Scroll observer ───────────────────────────────────────────────────
    if (window.BoydScroll)  window.BoydScroll.init();

    // ── Rankings (actual books only in the main table) ────────────────────
    if (window.BoydRankings) window.BoydRankings.init(actual);

    // ── D3 Tree (actual + speculative) ────────────────────────────────────
    if (window.BoydTree) window.BoydTree.init(actual, speculative);

    // ── Long scroll narrative cards ───────────────────────────────────────
    try {
      buildNarrativeCards(actual, speculative);
    } catch (e) {
      console.error('buildNarrativeCards failed:', e);
      var dbg = document.getElementById('narrative-war');
      if (dbg) dbg.innerHTML = '<p style="color:red;padding:1rem">DEBUG: ' + e.message + '</p>';
    }

    // ── Speculative section ───────────────────────────────────────────────
    try {
      buildSpeculativeCards(speculative);
    } catch (e) {
      console.error('buildSpeculativeCards failed:', e);
      var dbg2 = document.getElementById('speculative-war');
      if (dbg2) dbg2.innerHTML = '<p style="color:red;padding:1rem">DEBUG: ' + e.message + '</p>';
    }

    // ── Mobile nav toggle ─────────────────────────────────────────────────
    var navToggle = document.getElementById('nav-toggle');
    var navMenu   = document.getElementById('nav-menu');
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('open');
      });
    }

    // ── Smooth scroll nav links ───────────────────────────────────────────
    document.querySelectorAll('a[data-scroll]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          if (navMenu) navMenu.classList.remove('open');
        }
      });
    });
  }

  // ─── Build narrative section cards ────────────────────────────────────────
  function buildNarrativeCards(actual, speculative) {
    var data     = window.BOYD_DATA;
    var branches = data.BRANCHES;
    var catDescs = data.CATEGORY_DESCRIPTIONS;

    ['war', 'science', 'mind', 'power'].forEach(function (bId) {
      var container = document.getElementById('narrative-' + bId);
      if (!container) return;

      var books = actual.filter(function (b) { return b.branch === bId; });

      // Collect categories in first-appearance order (preserving editorial order)
      var categories = [];
      var catMap = {};
      books.forEach(function (b) {
        if (!catMap[b.category]) {
          catMap[b.category] = [];
          categories.push(b.category);
        }
        catMap[b.category].push(b);
      });

      // Sort books within each category by rating desc (null ratings sort to end)
      categories.forEach(function (cat) {
        catMap[cat].sort(function (a, b) {
          if (a.rating === null || a.rating === undefined) return 1;
          if (b.rating === null || b.rating === undefined) return -1;
          return b.rating - a.rating;
        });
      });

      var html = '';
      categories.forEach(function (cat) {
        var desc = catDescs[cat] || '';
        html += '<div class="cat-section">';
        html += '<div class="cat-section-header">';
        html += '<h3 class="cat-section-title">' + _esc(cat) + '</h3>';
        if (desc) html += '<p class="cat-section-desc">' + _esc(desc) + '</p>';
        html += '</div>';
        html += '<div class="card-grid">';
        catMap[cat].forEach(function (book) {
          html += renderCard(book, branches[bId].color, false);
        });
        html += '</div>';
        html += '</div>';
      });

      container.innerHTML = html;
    });

    if (window.BoydScroll) {
      ['war','science','mind','power'].forEach(function (bId) {
        var c = document.getElementById('narrative-' + bId);
        if (c) window.BoydScroll.observeNewCards(c);
      });
    }
  }

  // ─── Build speculative section cards ─────────────────────────────────────
  function buildSpeculativeCards(speculative) {
    var data     = window.BOYD_DATA;
    var branches = data.BRANCHES;

    ['war', 'science', 'mind', 'power'].forEach(function (bId) {
      var container = document.getElementById('speculative-' + bId);
      if (!container) return;

      var books = speculative.filter(function (b) { return b.branch === bId; });
      books = books.slice().sort(function (a, b) { return b.rating - a.rating; });

      container.innerHTML = books.map(function (book) {
        return renderCard(book, branches[bId].color, true);
      }).join('');
    });

    if (window.BoydScroll) {
      ['war','science','mind','power'].forEach(function (bId) {
        var c = document.getElementById('speculative-' + bId);
        if (c) window.BoydScroll.observeNewCards(c);
      });
    }
  }

  // ─── Render a single book card ────────────────────────────────────────────
  function renderCard(book, color, isSpeculative) {
    var initials  = getInitials(book.title);
    var yearDisp  = book.year < 0 ? Math.abs(book.year) + ' BCE' : book.year;
    var stars     = renderStars(book.rating);

    var bfUrl = (window.BOYD_DATA && window.BOYD_DATA.bookFinderUrl)
      ? window.BOYD_DATA.bookFinderUrl(book.title, book.author) : '#';

    // For actual books: individual book description; for speculative: connection justification
    var cardDesc = isSpeculative
      ? (book.connectionEdge && book.connectionEdge.justification ? _esc(book.connectionEdge.justification) : '')
      : _esc(book.bookDesc || '');

    var connectionBadge = '';
    if (isSpeculative && book.connectionEdge && book.connectionEdge.fromId) {
      var fromTitle = findActualTitle(book.connectionEdge.fromId);
      if (fromTitle) {
        connectionBadge = '<div class="connection-badge">' +
          '<span class="connection-label">' + _esc(book.connectionEdge.connectionType) + '</span>' +
          ' <em>Builds on:</em> ' + _esc(fromTitle) +
          '</div>';
      }
    }

    var speculativePill = isSpeculative
      ? '<span class="speculative-pill">Speculative</span>'
      : '';

    return '<div class="book-card' + (isSpeculative ? ' speculative-card' : '') + '">' +
      '<div class="card-cover" style="background:' + color + '22;border-color:' + color + '44">' +
        '<span class="card-initials" style="color:' + color + '">' + initials + '</span>' +
      '</div>' +
      '<div class="card-body">' +
        '<div class="card-meta-top">' +
          (isSpeculative ? '<span class="card-category" style="color:' + color + '">' + _esc(book.category) + '</span>' : '') +
          speculativePill +
          '<span class="card-year">' + yearDisp + '</span>' +
        '</div>' +
        '<a class="card-title" href="' + bfUrl + '" target="_blank" rel="noopener" title="Find on BookFinder">' + _esc(book.title) + '</a>' +
        '<p class="card-author">' + _esc(book.author) + '</p>' +
        '<div class="card-stars">' + (book.rating !== null && book.rating !== undefined ? stars + '<span class="card-rating">' + book.rating.toFixed(2) + '</span>' : '<span class="card-rating not-reviewed">Not Reviewed</span>') + '</div>' +
        (cardDesc ? '<p class="card-desc">' + cardDesc + '</p>' : '') +
        connectionBadge +
      '</div>' +
      '</div>';
  }

  function getInitials(title) {
    return title.replace(/[^A-Za-z\s]/g, '')
      .split(/\s+/)
      .filter(function (w) { return w.length > 0 && !/^(the|a|an|of|in|on|at|to|and|or|but|for|with|from)$/i.test(w); })
      .slice(0, 3)
      .map(function (w) { return w[0].toUpperCase(); })
      .join('');
  }

  function renderStars(rating) {
    if (rating === null || rating === undefined) return '';
    var full  = Math.floor(rating);
    var half  = (rating - full) >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    var html  = '';
    for (var i = 0; i < full;  i++) html += '<span class="star full">★</span>';
    if (half)                        html += '<span class="star half">★</span>';
    for (var j = 0; j < empty; j++) html += '<span class="star empty">☆</span>';
    return html;
  }

  var _actualTitleMap = null;
  function findActualTitle(slugId) {
    if (!_actualTitleMap) {
      _actualTitleMap = {};
      var data = window.BOYD_DATA;
      if (data) {
        data.ACTUAL_BOOKS.forEach(function (b) { _actualTitleMap[b.slug] = b.title; });
      }
    }
    return _actualTitleMap[slugId] || null;
  }

  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Boot ────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
