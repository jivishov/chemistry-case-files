// game.js — shared gamification framework (scenario + per-TEKS mastery).
// Mirrors chem.js/render.js: a small module with PURE, node-tested helpers
// (masteryState, xpFor) plus a createGame() factory whose fields are spread into
// each unit's createSim() so they become Alpine-reactive. No DOM in the pure
// helpers; persistence is browser-only and guarded.

export const MASTERY_TARGET = 3; // correct-in-a-row needed to master a skill

// PURE. Given a run (consecutive correct) and a target, report mastery progress.
// fraction is clamped to 0..1 so an overshoot run still reads as a full meter.
export function masteryState(run, target = MASTERY_TARGET) {
  const safeTarget = target > 0 ? target : 1;
  const clamped = Math.max(0, Math.min(run, safeTarget));
  return {
    run: clamped,
    target: safeTarget,
    fraction: clamped / safeTarget,
    mastered: run >= safeTarget
  };
}

// PURE. XP for one answer. Wrong answers earn nothing (reward is tied to a correct
// chemical decision). A first-try answer gets a small bonus; a running streak adds
// a capped kicker so it is a learning signal, never a runaway score.
export function xpFor(correct, firstTry, streak) {
  if (!correct) return 0;
  let xp = 10;
  if (firstTry) xp += 5;
  xp += Math.min(Math.max(streak, 0), 5) * 2;
  return xp;
}

// PURE. Grade a committed value against a target spec for the Scenario layer.
// bands = { mode: 'relative'|'absolute', ideal, acceptable } (thresholds inclusive).
// In relative mode the metric is the fractional error |value-target|/|target|; in
// absolute mode it is the raw |value-target|. Returns the band the value lands in
// (ideal | acceptable | low | high), whether it clears spec, the direction of any
// miss (on | low | high), and the raw/abs/rel error so callers can show a gauge.
export function outcomeBand(value, target, bands) {
  if (!bands || (bands.mode !== 'relative' && bands.mode !== 'absolute')) {
    throw new Error("outcomeBand: bands.mode must be 'relative' or 'absolute'");
  }
  const { mode, ideal, acceptable } = bands;
  for (const [k, v] of [['value', value], ['target', target], ['ideal', ideal], ['acceptable', acceptable]]) {
    if (typeof v !== 'number' || !isFinite(v)) {
      throw new Error(`outcomeBand: ${k} must be a finite number`);
    }
  }
  if (ideal < 0 || acceptable < 0) {
    throw new Error('outcomeBand: thresholds must be non-negative');
  }
  if (acceptable < ideal) {
    throw new Error('outcomeBand: acceptable threshold must be at least the ideal threshold');
  }
  if (mode === 'relative' && target === 0) {
    throw new Error('outcomeBand: relative mode needs a non-zero target');
  }

  const error = value - target;
  const absError = Math.abs(error);
  const relError = target === 0 ? (absError === 0 ? 0 : Infinity) : absError / Math.abs(target);
  const metric = mode === 'relative' ? relError : absError;

  let band, direction;
  if (metric <= ideal) {
    band = 'ideal'; direction = 'on';
  } else if (metric <= acceptable) {
    band = 'acceptable'; direction = 'on';
  } else {
    direction = error < 0 ? 'low' : 'high';
    band = direction;
  }
  return { band, withinSpec: band === 'ideal' || band === 'acceptable', direction, error, absError, relError };
}

// Factory: spread the return into a unit's createSim() return object. After the
// spread, `this` binds to the Alpine component, so the methods reach sibling state.
//   skills: [{ id, code, label, target=3, honors=false }]  (id matches the SE id)
export function createGame({ unitId, skills }) {
  const key = `chem.game.${unitId}`;
  const defOf = id => skills.find(d => d.id === id) || {};
  const blank = () => {
    const s = {};
    for (const sk of skills) s[sk.id] = { run: 0, attempts: 0, correct: 0, mastered: false };
    return s;
  };

  return {
    g_unitId: unitId,
    g_skillDefs: skills,
    g_xp: 0,
    g_streak: 0,
    g_best: 0,
    g_skills: blank(),

    // One call per check*(): record an answer for a skill. firstTry = no wrong
    // submission yet on the current problem (caller tracks that).
    gRecord(skillId, correct, firstTry) {
      const sk = this.g_skills[skillId];
      if (!sk) return;
      sk.attempts++;
      const target = defOf(skillId).target || MASTERY_TARGET;
      if (correct) {
        sk.correct++;
        sk.run++;
        this.g_streak++;
        if (this.g_streak > this.g_best) this.g_best = this.g_streak;
        this.g_xp += xpFor(true, firstTry, this.g_streak);
        if (masteryState(sk.run, target).mastered) sk.mastered = true;
      } else {
        sk.run = 0;       // a wrong answer resets the run (recency-weighted mastery)
        this.g_streak = 0;
      }
      this.gSave();
    },

    gMastery(skillId) {
      const sk = this.g_skills[skillId];
      if (!sk) return 0;
      if (sk.mastered) return 1;   // mastery is sticky, so the meter stays full
      return masteryState(sk.run, defOf(skillId).target || MASTERY_TARGET).fraction;
    },
    gMastered(skillId) { return !!(this.g_skills[skillId] && this.g_skills[skillId].mastered); },

    // Fraction of CORE (non-honors) skills mastered. The capstone gate is === 1.
    gOverall() {
      const core = this.g_skillDefs.filter(d => !d.honors);
      if (!core.length) return 0;
      return core.filter(d => this.gMastered(d.id)).length / core.length;
    },

    gReset() {
      this.g_xp = 0; this.g_streak = 0; this.g_best = 0;
      this.g_skills = blank();
      if (typeof localStorage !== 'undefined') {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
      }
    },

    gLoad() {
      if (typeof localStorage === 'undefined') return;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data || data.v !== 1) return;
        this.g_xp = data.xp || 0;
        this.g_best = data.best || 0;
        this.g_streak = 0; // streak is a within-session signal; not persisted
        const saved = data.skills || {};
        for (const sk of this.g_skillDefs) {
          if (saved[sk.id]) {
            this.g_skills[sk.id] = {
              run: 0, attempts: 0, correct: 0, mastered: false, ...saved[sk.id]
            };
          }
        }
      } catch { /* corrupt storage: keep the blank defaults */ }
    },

    gSave() {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem(key, JSON.stringify({
          v: 1, xp: this.g_xp, best: this.g_best, skills: this.g_skills
        }));
      } catch { /* quota / privacy mode: progress stays in-memory only */ }
    }
  };
}
