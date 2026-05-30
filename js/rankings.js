// js/rankings.js
// Sortable, filterable, searchable book list with hover tooltips

(function () {
  'use strict';

  var container   = null;
  var listEl      = null;
  var allBooks    = [];
  var pinnedSlugs = new Set();
  var tooltipEl   = null;
  var bookMap     = {};  // slug → book

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
    if (rating === null || rating === undefined) {
      return '<div class="rating-bar-wrap"><span class="rating-val not-reviewed">Not Reviewed</span></div>';
    }
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
           (book.rating !== null && book.rating !== undefined ? renderStars(book.rating) : '') +
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
      // Null ratings always sort to the end regardless of direction
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
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

    if (total === 0) {
      listEl.innerHTML = '<li class="no-results">No books match your filters. <button id="clear-filters-btn">Clear filters</button></li>';
      var btn = document.getElementById('clear-filters-btn');
      if (btn) btn.addEventListener('click', function () {
        if (window.BoydState) window.BoydState.clearFilters();
      });
      return;
    }

    listEl.innerHTML = books.map(function (b, i) { return renderRow(b, i, total); }).join('');

    // Update count display
    var countEl = document.getElementById('rankings-count');
    if (countEl) countEl.textContent = total + ' book' + (total !== 1 ? 's' : '');

    attachRowEvents();
    if (window.BoydScroll) window.BoydScroll.observeNewCards(listEl);
  }

  // ─── Tooltip ─────────────────────────────────────────────────────────────
  function initTooltip() {
    tooltipEl = document.getElementById('book-tooltip');
  }

  function showTooltip(book, e) {
    if (!tooltipEl) return;
    var desc = book.bookDesc || book.description || '';
    var rating = (book.rating !== null && book.rating !== undefined)
      ? '★ ' + parseFloat(book.rating).toFixed(2)
      : 'Not rated';
    var bfUrl = window.BOYD_DATA && window.BOYD_DATA.bookFinderUrl
      ? window.BOYD_DATA.bookFinderUrl(book.title, book.author) : '#';
    tooltipEl.innerHTML =
      '<div class="tt-title">' + _esc(book.title) + '</div>' +
      '<div class="tt-author">' + _esc(book.author || '') + (book.year ? ' · ' + (book.year < 0 ? Math.abs(book.year) + ' BCE' : book.year) : '') + '</div>' +
      (desc
        ? '<div class="tt-desc">' + _esc(desc) + '</div>'
        : '<div class="tt-nodesc">No description available.</div>') +
      '<div class="tt-footer">' +
        '<span class="tt-rating">' + rating + '</span>' +
        '<a class="tt-link" href="' + bfUrl + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">Find copies →</a>' +
      '</div>';
    tooltipEl.classList.add('visible');
    positionTooltip(e);
  }

  function positionTooltip(e) {
    if (!tooltipEl) return;
    var pad = 18;
    var tw  = 320;
    var x   = e.clientX + pad;
    var y   = e.clientY + pad;
    if (x + tw > window.innerWidth)  x = e.clientX - tw - pad;
    if (y + tooltipEl.offsetHeight > window.innerHeight) y = e.clientY - tooltipEl.offsetHeight - pad;
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top  = y + 'px';
  }

  function hideTooltip() {
    if (tooltipEl) tooltipEl.classList.remove('visible');
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

    listEl.querySelectorAll('.rank-row').forEach(function (row) {
      var slug = row.dataset.slug;
      row.addEventListener('mouseenter', function (e) {
        var book = bookMap[slug];
        if (book) showTooltip(book, e);
      });
      row.addEventListener('mousemove', function (e) {
        positionTooltip(e);
      });
      row.addEventListener('mouseleave', hideTooltip);
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
    allBooks.forEach(function (b) { bookMap[b.slug] = b; });
    initTooltip();
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
