// js/state.js
// Global application state with pub/sub pattern

(function () {
  'use strict';

  var _state = {
    selectedCategory: null,   // null = all categories
    selectedBranch:   null,   // one of 'war','science','mind','power' or null
    sortBy:           'rating',
    sortDir:          'desc',
    searchQuery:      '',
    activeSection:    'hero',
    showSpeculative:  false,
  };

  var _listeners = [];

  function getState() {
    return Object.assign({}, _state);
  }

  function setState(patch) {
    var changed = false;
    Object.keys(patch).forEach(function (key) {
      if (_state[key] !== patch[key]) {
        _state[key] = patch[key];
        changed = true;
      }
    });
    if (changed) _notify();
  }

  function subscribe(fn) {
    _listeners.push(fn);
    return function unsubscribe() {
      _listeners = _listeners.filter(function (l) { return l !== fn; });
    };
  }

  function _notify() {
    var snapshot = getState();
    _listeners.forEach(function (fn) {
      try { fn(snapshot); } catch (e) { console.error('State listener error:', e); }
    });
    // Sync URL hash
    _syncHash(snapshot);
  }

  function _syncHash(s) {
    var parts = [];
    if (s.selectedBranch)   parts.push('branch=' + s.selectedBranch);
    if (s.selectedCategory) parts.push('cat=' + encodeURIComponent(s.selectedCategory));
    if (s.sortBy !== 'rating') parts.push('sort=' + s.sortBy);
    if (s.sortDir !== 'desc') parts.push('dir=' + s.sortDir);
    if (s.searchQuery) parts.push('q=' + encodeURIComponent(s.searchQuery));
    var hash = parts.length ? '#' + parts.join('&') : '#';
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash || window.location.pathname);
    }
  }

  function loadFromHash() {
    var hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    var patch = {};
    hash.split('&').forEach(function (part) {
      var kv = part.split('=');
      var k = kv[0], v = decodeURIComponent(kv[1] || '');
      if (k === 'branch')   patch.selectedBranch   = v;
      if (k === 'cat')      patch.selectedCategory = v;
      if (k === 'sort')     patch.sortBy           = v;
      if (k === 'dir')      patch.sortDir          = v;
      if (k === 'q')        patch.searchQuery      = v;
    });
    if (Object.keys(patch).length) setState(patch);
  }

  // Convenience setters
  function setCategory(cat) {
    setState({ selectedCategory: cat, selectedBranch: cat ? _getBranchForCategory(cat) : null });
  }

  function setBranch(branch) {
    setState({ selectedBranch: branch, selectedCategory: null });
  }

  function clearFilters() {
    setState({ selectedCategory: null, selectedBranch: null, searchQuery: '' });
  }

  function _getBranchForCategory(cat) {
    return (window.BOYD_DATA && window.BOYD_DATA.CATEGORY_BRANCH[cat]) || null;
  }

  window.BoydState = {
    get:          getState,
    set:          setState,
    subscribe:    subscribe,
    setCategory:  setCategory,
    setBranch:    setBranch,
    clearFilters: clearFilters,
    loadFromHash: loadFromHash,
  };

})();
