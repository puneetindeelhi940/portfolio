/* ============================================================
   Dark Patterns Masterclass — shared scoring engine
   ------------------------------------------------------------
   Progress persists in localStorage under `dp-progress`.
   Scoring model (per pattern identified):
     +10  correct identification (the base reward)
     + 5  correct category
     + 5  correct severity rating (exact); +2 if within 1
     + 3  speed bonus (answered under the par time)
     + 2  no-hint bonus (solved without revealing a hint)
   Wrong identification: no points, logged as a miss.
   ============================================================ */
(function (global) {
  "use strict";

  var KEY = "dp-progress";

  var DEFAULT = {
    score: 0,
    found: {},        // { patternId: {points, ts} }  — dedup so a pattern only scores once
    misses: 0,
    hintsUsed: 0,
    badges: []
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, DEFAULT, { found: {}, badges: [] });
      var p = JSON.parse(raw);
      return Object.assign({}, DEFAULT, p, {
        found: p.found || {},
        badges: p.badges || []
      });
    } catch (e) {
      return Object.assign({}, DEFAULT, { found: {}, badges: [] });
    }
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  var BADGES = [
    { id: "first-blood", label: "First Catch",        test: function (s) { return count(s.found) >= 1; } },
    { id: "eagle-eye",   label: "Eagle Eye",          test: function (s) { return count(s.found) >= 5; } },
    { id: "no-hints",    label: "Unassisted",         test: function (s) { return count(s.found) >= 5 && s.hintsUsed === 0; } },
    { id: "century",     label: "Century Club (100+)",test: function (s) { return s.score >= 100; } },
    { id: "ai-aware",    label: "AI-Aware",           test: function (s) { return hasCat(s, "ai") >= 3; } }
  ];

  function count(obj) { return Object.keys(obj || {}).length; }
  function hasCat(s, cat) {
    var n = 0;
    for (var k in s.found) { if (s.found[k] && s.found[k].cat === cat) n++; }
    return n;
  }

  var api = {
    /** Full current state (read-only copy). */
    state: function () { return load(); },

    /** Has this pattern already been scored? */
    isFound: function (id) { return !!load().found[id]; },

    /**
     * Record a confirmed identification. Returns a breakdown object.
     * opts: { id, cat, correctCat, sev, correctSev, underPar, usedHint }
     */
    award: function (opts) {
      var s = load();
      if (s.found[opts.id]) {
        return { duplicate: true, total: 0, breakdown: [], score: s.score };
      }
      var breakdown = [];
      var pts = 10; breakdown.push(["Correct identification", 10]);

      if (opts.correctCat) { pts += 5; breakdown.push(["Correct category", 5]); }

      if (typeof opts.sev === "number" && typeof opts.correctSev === "number") {
        var d = Math.abs(opts.sev - opts.correctSev);
        if (d === 0) { pts += 5; breakdown.push(["Exact severity", 5]); }
        else if (d === 1) { pts += 2; breakdown.push(["Severity within 1", 2]); }
      }
      if (opts.underPar) { pts += 3; breakdown.push(["Speed bonus", 3]); }
      if (opts.usedHint) { s.hintsUsed += 1; }
      else { pts += 2; breakdown.push(["No-hint bonus", 2]); }

      s.score += pts;
      s.found[opts.id] = { points: pts, ts: Date.now(), cat: opts.cat || null };

      var newBadges = [];
      BADGES.forEach(function (b) {
        if (s.badges.indexOf(b.id) === -1 && b.test(s)) { s.badges.push(b.id); newBadges.push(b); }
      });
      save(s);
      return { duplicate: false, total: pts, breakdown: breakdown, score: s.score, newBadges: newBadges };
    },

    miss: function () { var s = load(); s.misses += 1; save(s); return s.misses; },
    hint: function () { var s = load(); s.hintsUsed += 1; save(s); return s.hintsUsed; },

    reset: function () { save(Object.assign({}, DEFAULT, { found: {}, badges: [] })); },

    badgeLabel: function (id) {
      for (var i = 0; i < BADGES.length; i++) if (BADGES[i].id === id) return BADGES[i].label;
      return id;
    },
    allBadges: function () { return BADGES.slice(); }
  };

  global.DPScore = api;
})(window);
