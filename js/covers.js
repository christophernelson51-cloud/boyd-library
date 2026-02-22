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
            + '&limit=1&fields=cover_i';

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var id     = data.docs && data.docs[0] && data.docs[0].cover_i;
        var imgUrl = id ? 'https://covers.openlibrary.org/b/id/' + id + '-M.jpg' : null;
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
