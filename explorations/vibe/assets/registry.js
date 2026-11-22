// registry.js — the one global the entry files write into.
//
// An entry file is a classic script that calls VIBE.add({...}) once per example.
// Loading order does not matter: the app reads the registry after every script ran.
(function () {
  const entries = {};
  window.VIBE = {
    entries,
    add(e) {
      if (!e || !e.id) throw new Error('VIBE.add: entry needs an id');
      if (entries[e.id]) console.warn('[vibe] duplicate entry id', e.id);
      entries[e.id] = e;
    },
    // Feature-gap vocabulary, so the analysis page can count what is missing.
    features: {},
    defineFeatures(map) { Object.assign(this.features, map); },
    // Prose for the analysis page (set once, by entries/analysis-text.js).
    analysis: null,
  };
})();
