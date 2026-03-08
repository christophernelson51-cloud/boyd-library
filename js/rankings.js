// js/rankings.js
// Sortable, filterable, searchable, drag-reorderable book list

(function () {
  'use strict';

  var container   = null;
  var listEl      = null;
  var allBooks    = [];
  var pinnedSlugs = new Set();

  // ─── Stars renderer ───────────────────────────────────────────────────────
  function renderStars(rating) {
    var full  = Math.floor(rating);
    var half  = (rating - full) >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    var html  = '';
    for (var i = 0; i < full;  i++) html += '<span class="star full">★</span>';
    if (half)                        html += '<span class="star half">★</span>';
    for (var j = 0; j < empty; j++) html += '<span class="star empty">☆</span>';
    return '<span class="stars" title="' + rating.toFixed(2) + '">' + html + '</span>';
  }

  // ─── Rating bar renderer ──────────────────────────────────────────────────
  function renderRatingBar(rating) {
    var pct = ((rating - 3.0) / 2.0) * 100; // scale 3–5 → 0–100%
    pct = Math.max(0, Math.min(100, pct));
    return '<div class="rating-bar-wrap"><div class="rating-bar" style="width:' + pct + '%"></div>' +
           '<span class="rating-val">' + rating.toFixed(2) + '</span></div>';
  }

  // ─── Year pill ────────────────────────────────────────────────────────────
  function renderYear(year) {
    var display = year < 0 ? Math.abs(year) + ' BCE' : year;
    return '<span class="year-pill">' + display + '</span>';
  }

  // ─── Category chip ────────────────────────────────────────────────────────
  function renderCatChip(book) {
    var data = window.BOYD_DATA;
    var branch = data ? (data.BRANCHES[book.branch] || {}) : {};
    var color  = branch.color || '#555';
    return '<span class="cat-chip" style="border-color:' + color + ';color:' + color + '">' +
           book.category + '</span>';
  }

  // ─── Single row ───────────────────────────────────────────────────────────
  function renderRow(book, idx, total) {
    var pinned   = pinnedSlugs.has(book.slug);
    var rankDisp = pinned ? '📌' : (idx + 1);
    return '<li class="rank-row' + (pinned ? ' pinned' : '') + '" ' +
           'data-slug="' + book.slug + '">' +
           '<span class="rank-num">' + rankDisp + '</span>' +
           renderCatChip(book) +
           '<div class="rank-info">' +
             '<a class="rank-title" href="' + _bfUrl(book) + '" target="_blank" rel="noopener">' + _esc(book.title) + '<span class="bf-hint">Find copies →</span></a>' +
             '<span class="rank-author">' + _esc(book.author) + '</span>' +
           '</div>' +
           renderYear(book.year) +
           renderStars(book.rating) +
           renderRatingBar(book.rating) +
           '<div class="rank-actions">' +
             '<button class="pin-btn" data-slug="' + book.slug + '" title="' + (pinned ? 'Unpin' : 'Pin to top') + '">' +
               (pinned ? '📍' : '📌') +
             '</button>' +
           '</div>' +
           '</li>';
  }

  // ─── Get sorted/filtered books ────────────────────────────────────────────
  function getFilteredBooks(state) {
    var books = allBooks.slice();

    // Category / branch filter
    if (state.selectedCategory) {
      books = books.filter(function (b) { return b.category === state.selectedCategory; });
    } else if (state.selectedBranch) {
      books = books.filter(function (b) { return b.branch === state.selectedBranch; });
    }

    // Search
    if (state.searchQuery) {
      var q = state.searchQuery.toLowerCase();
      books = books.filter(function (b) {
        return b.title.toLowerCase().indexOf(q) >= 0 ||
               b.author.toLowerCase().indexOf(q) >= 0 ||
               b.category.toLowerCase().indexOf(q) >= 0;
      });
    }

    // Pin pinned books to top
    var pinned   = books.filter(function (b) { return pinnedSlugs.has(b.slug); });
    var unpinned = books.filter(function (b) { return !pinnedSlugs.has(b.slug); });

    // Sort unpinned
    var sortBy  = state.sortBy  || 'rating';
    var sortDir = state.sortDir || 'desc';
    unpinned.sort(function (a, b) {
      var av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return pinned.concat(unpinned);
  }

  // ─── Render list ──────────────────────────────────────────────────────────
  function render() {
    if (!listEl) return;
    var state  = window.BoydState ? window.BoydState.get() : {};
    var books  = getFilteredBooks(state);
    var total  = books.length;

    // Save scroll position — rankings height changes cause scroll anchoring to
    // jump the viewport into adjacent sections (tree or library).
    var savedScrollY = window.scrollY;

    if (total === 0) {
      listEl.innerHTML = '<li class="no-results">No books match your filters. <button id="clear-filters-btn">Clear filters</button></li>';
      var btn = document.getElementById('clear-filters-btn');
      if (btn) btn.addEventListener('click', function () {
        if (window.BoydState) window.BoydState.clearFilters();
      });
      window.scrollTo({ top: savedScrollY, behavior: 'instant' });
      return;
    }

    listEl.innerHTML = books.map(function (b, i) { return renderRow(b, i, total); }).join('');

    // Update count display
    var countEl = document.getElementById('rankings-count');
    if (countEl) countEl.textContent = total + ' book' + (total !== 1 ? 's' : '');

    attachRowEvents();
    if (window.BoydScroll) window.BoydScroll.observeNewCards(listEl);

    // Restore scroll position after DOM change to prevent viewport jumping.
    window.scrollTo({ top: savedScrollY, behavior: 'instant' });
  }

  // ─── Attach events to rows ────────────────────────────────────────────────
  function attachRowEvents() {
    listEl.querySelectorAll('.pin-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var slug = this.dataset.slug;
        if (pinnedSlugs.has(slug)) pinnedSlugs.delete(slug);
        else pinnedSlugs.add(slug);
        render();
      });
    });
  }

  // ─── Controls wiring ──────────────────────────────────────────────────────
  function initControls() {
    // Sort dropdown
    var sortSel = document.getElementById('sort-select');
    if (sortSel) {
      sortSel.addEventListener('change', function () {
        if (window.BoydState) window.BoydState.set({ sortBy: this.value });
      });
    }

    // Sort direction toggle
    var sortDirBtn = document.getElementById('sort-dir-btn');
    if (sortDirBtn) {
      sortDirBtn.addEventListener('click', function () {
        if (!window.BoydState) return;
        var current = window.BoydState.get().sortDir;
        window.BoydState.set({ sortDir: current === 'desc' ? 'asc' : 'desc' });
        this.textContent = current === 'desc' ? '↑ Asc' : '↓ Desc';
      });
    }

    // Search input (debounced)
    var searchInput = document.getElementById('search-input');
    if (searchInput) {
      var timer;
      searchInput.addEventListener('input', function () {
        var val = this.value;
        clearTimeout(timer);
        timer = setTimeout(function () {
          if (window.BoydState) window.BoydState.set({ searchQuery: val });
        }, 250);
      });
    }

    // Category filter chips
    document.querySelectorAll('.filter-chip[data-branch]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (!window.BoydState) return;
        var branch = this.dataset.branch;
        var current = window.BoydState.get().selectedBranch;
        if (current === branch) {
          window.BoydState.setBranch(null);
          document.querySelectorAll('.filter-chip').forEach(function (c) { c.classList.remove('active'); });
        } else {
          window.BoydState.setBranch(branch);
          document.querySelectorAll('.filter-chip').forEach(function (c) {
            c.classList.toggle('active', c.dataset.branch === branch);
          });
        }
      });
    });

    // Clear filters button
    var clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (window.BoydState) window.BoydState.clearFilters();
        document.querySelectorAll('.filter-chip').forEach(function (c) { c.classList.remove('active'); });
        var si = document.getElementById('search-input');
        if (si) si.value = '';
        var ss = document.getElementById('sort-select');
        if (ss) ss.value = 'rating';
      });
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init(books) {
    container = document.getElementById('rankings-section');
    listEl    = document.getElementById('rankings-list');
    if (!listEl) return;

    allBooks = books.slice();
    initControls();
    render();

    // Subscribe to state changes
    if (window.BoydState) {
      window.BoydState.subscribe(function (state) {
        // Sync filter chip UI
        document.querySelectorAll('.filter-chip[data-branch]').forEach(function (chip) {
          chip.classList.toggle('active', chip.dataset.branch === state.selectedBranch);
        });
        var si = document.getElementById('search-input');
        if (si && si.value !== state.searchQuery) si.value = state.searchQuery || '';
        var ss = document.getElementById('sort-select');
        if (ss && ss.value !== state.sortBy) ss.value = state.sortBy || 'rating';
        render();
      });
    }
  }

  function _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function _bfUrl(book) {
    var fn = window.BOYD_DATA && window.BOYD_DATA.bookFinderUrl;
    return fn ? fn(book.title, book.author) : '#';
  }

  window.BoydRankings = { init: init, render: render };

})();
