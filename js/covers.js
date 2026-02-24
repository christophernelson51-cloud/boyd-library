// js/covers.js
// Lazy-loads book covers from Open Library.
// Fetches are queued (max 3 concurrent), cached in session, and triggered
// only when a card scrolls into view (IntersectionObserver, 200px pre-load margin).
// Falls back silently to the initials tile on any failure.

(function () {
  'use strict';

  var CACHE      = new Map(); // key -> url string | null
  var queue      = [];
  var active     = 0;
  var MAX        = 3;

  // Curated ISBN overrides for books where Open Library's default search
  // returns a foreign-edition cover. Keys are "title||author".
  // ISBNs are verified English editions.
  var OVERRIDES = {
    'A Brief History of Time||Stephen Hawking':
      'https://covers.openlibrary.org/b/isbn/0553346148-M.jpg',  // 1988 Bantam English ed.
    'On War||Carl von Clausewitz':
      'https://covers.openlibrary.org/b/isbn/0691018545-M.jpg',  // Princeton Howard/Paret
    'The Tao Te Ching||Lao Tzu':
      'https://covers.openlibrary.org/b/isbn/0140441131-M.jpg',  // Penguin Classics (Lau)
  };

  function key(title, author) {
    return title + '||' + author;
  }

  // ── Public: observe a container for card-cover divs ──────────────────────
  function observe(container) {
    if (!container) return;

    var divs = container.querySelectorAll('.card-cover[data-title]');
    if (!divs.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        _loadCover(entry.target);
      });
    }, { rootMargin: '200px 0px', threshold: 0 });

    divs.forEach(function (div) { io.observe(div); });
  }

  // ── Resolve cover for one card-cover div ──────────────────────────────────
  function _loadCover(el) {
    var title  = el.dataset.title;
    var author = el.dataset.author;
    var k      = key(title, author);

    if (CACHE.has(k)) {
      _apply(el, CACHE.get(k));
      return;
    }

    // Use curated override if available — skips API call entirely
    if (OVERRIDES[k]) {
      CACHE.set(k, OVERRIDES[k]);
      _apply(el, OVERRIDES[k]);
      return;
    }

    queue.push({ title: title, author: author, key: k, el: el });
    _drain();
  }

  function _drain() {
    while (active < MAX && queue.length > 0) {
      active++;
      _fetch(queue.shift());
    }
  }

  function _fetch(item) {
    var url = 'https://openlibrary.org/search.json'
            + '?title='  + encodeURIComponent(item.title)
            + '&author=' + encodeURIComponent(item.author)
            + '&limit=1&fields=cover_i,cover_edition_key,isbn';

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var doc        = data.docs && data.docs[0];
        var coverId    = doc && doc.cover_i;
        var editionKey = doc && doc.cover_edition_key;
        var isbn       = doc && doc.isbn && doc.isbn[0];
        var imgUrl = coverId
          ? 'https://covers.openlibrary.org/b/id/'   + coverId    + '-M.jpg'
          : editionKey
          ? 'https://covers.openlibrary.org/b/olid/' + editionKey + '-M.jpg'
          : isbn
          ? 'https://covers.openlibrary.org/b/isbn/' + isbn       + '-M.jpg'
          : null;
        CACHE.set(item.key, imgUrl);
        _apply(item.el, imgUrl);
      })
      .catch(function () {
        CACHE.set(item.key, null);
      })
      .finally(function () {
        active--;
        _drain();
      });
  }

  // ── Swap cover image in, fade initials out ────────────────────────────────
  function _apply(el, imgUrl) {
    if (!imgUrl) return;
    var img = el.querySelector('.card-cover-img');
    if (!img) return;

    img.onload = function () {
      // Reject anything that isn't clearly portrait — scene/desk photos
      // are landscape or square. Real book covers are always taller than wide.
      var ratio = img.naturalWidth / img.naturalHeight;
      if (ratio > 0.8) {
        // Too wide — looks like a scene photo, not a cover. Keep initials.
        img.src = '';
        return;
      }
      img.classList.add('loaded');
      var initials = el.querySelector('.card-initials');
      if (initials) initials.classList.add('faded');
    };
    // onerror: do nothing — initials stay visible
    img.src = imgUrl;
    img.alt = el.dataset.title || '';
  }

  window.BoydCovers = { observe: observe };

})();
