// casefile.js — the shared "Case File" component: one renderer for every unit.
//
// A Case File is the animated true story that shows where a unit's chemistry got
// real. Each unit owns ONE data file (units/NN/js/case.js) holding its story and
// its stage art; this module owns the chrome (header, chapter rail, narration,
// quiz, punch) so that markup exists exactly once in the repo.
//
// Adding a Case File to a unit:
//   1. units/NN/js/case.js  ->  export const CASE = { ...see SCHEMA below... }
//   2. index.html, inside the x-data="sim" root, two mount points:
//        <div data-casefile-teaser></div>   under the <h1> (optional)
//        <div data-casefile></div>          after the .sim-grid
//   3. index.html module script:
//        import { mountCaseFile } from '../../shared/js/casefile.js';
//        import { CASE } from './js/case.js';
//        mountCaseFile(Alpine, CASE);   // BEFORE Alpine.start()
//   4. Add the unit to tests/casefile.test.js UNITS list (that suite is the gate).
//
// The Case File is a MODE, not a section at the foot of the page: the injected markup
// binds x-show="mode==='casefile'", so the unit page owes it three things.
//   a. a `<button class="tab" ... @click="mode='casefile'">Case file</button>` in the strip
//      (use setMode('casefile') on units that define setMode)
//   b. `x-show="mode!=='casefile'"` on .sim-grid, so the simulator and the standards rail
//      give up the page while the story is showing
//   c. the tab strip OUTSIDE .sim-grid, or hiding the grid takes the strip with it and the
//      learner is stranded on the story with no way back
// `mode` lives on the sim component; Alpine resolves it up the scope chain from here.
//
// Why the markup is injected from JS rather than written in each index.html:
// the chrome is identical across units, so duplicating it 10 times guarantees
// drift. Injection happens before Alpine.start(), so every binding inside the
// injected markup (including the unit's stage SVG) initializes normally. This is
// the same string-built-SVG approach already used by units/01 (ticksSvg) because
// Alpine cannot bind <template x-for> inside an <svg>.
//
// Story TEXT is never interpolated into the markup: the chrome binds it with
// x-text from the CASE object, so only `stage` and `controls` are raw markup and
// they come from this repo, never from user input.

// ---------------------------------------------------------------------------
// SCHEMA (validated by validateCase, gated by tests/casefile.test.js)
// ---------------------------------------------------------------------------
// id       string   stable kebab-case slug, unique across units
// number   string   display number, e.g. '001'
// kicker   string   short line after the number, e.g. 'a true story'
// title    string   the headline
// teaser   string   one-line hook for the chip under the unit's <h1>
// hook     string   the opening paragraph that earns the next click
// stats    array    2-4 x { v, k }: the big-number strip
// steps    array    2+ x { t, body, chem, cap }: chapters of the story
//                     t    chapter title (rail button)
//                     body the narration
//                     chem the chemistry callout ("The chemistry ...")
//                     cap  the stage caption for this chapter
// quiz     object   { q, options: [{ label, correct }], explain }
//                     exactly one option must be correct
// punch    string   the motivating close
// careers  array    2+ strings: real jobs that use this
// cta      object   { label, call } — `call` is an Alpine expression evaluated in
//                     the sim scope, e.g. "mode='measure'" or "setMode('curve')"
// stage    string   the animated <svg> scene. May bind `step` and any `state` key.
// controls string   optional extra control row rendered under the stage
// state    object   optional extra reactive state for the stage (e.g. { depth: 30 })

const REQUIRED_STRINGS = ['id', 'number', 'kicker', 'title', 'teaser', 'hook', 'punch'];

/**
 * Check a CASE object against the schema.
 * @returns {string[]} problems; empty means valid.
 */
export function validateCase(CASE) {
  const p = [];
  if (!CASE || typeof CASE !== 'object') return ['CASE is not an object'];

  for (const k of REQUIRED_STRINGS) {
    if (typeof CASE[k] !== 'string' || !CASE[k].trim()) p.push(`${k}: missing or empty string`);
  }

  if (!Array.isArray(CASE.stats) || CASE.stats.length < 2) {
    p.push('stats: need at least 2 entries');
  } else {
    CASE.stats.forEach((s, i) => {
      if (!s || typeof s.v !== 'string' || typeof s.k !== 'string') p.push(`stats[${i}]: need string v and k`);
    });
  }

  if (!Array.isArray(CASE.steps) || CASE.steps.length < 2) {
    p.push('steps: need at least 2 chapters');
  } else {
    CASE.steps.forEach((s, i) => {
      for (const k of ['t', 'body', 'chem', 'cap']) {
        if (!s || typeof s[k] !== 'string' || !s[k].trim()) p.push(`steps[${i}].${k}: missing or empty`);
      }
    });
  }

  const q = CASE.quiz;
  if (!q || typeof q !== 'object') {
    p.push('quiz: missing');
  } else {
    if (typeof q.q !== 'string' || !q.q.trim()) p.push('quiz.q: missing or empty');
    if (typeof q.explain !== 'string' || !q.explain.trim()) p.push('quiz.explain: missing or empty');
    if (!Array.isArray(q.options) || q.options.length < 2) {
      p.push('quiz.options: need at least 2 options');
    } else {
      q.options.forEach((o, i) => {
        if (!o || typeof o.label !== 'string' || !o.label.trim()) p.push(`quiz.options[${i}].label: missing`);
      });
      const correct = q.options.filter(o => o && o.correct === true).length;
      if (correct !== 1) p.push(`quiz.options: need exactly 1 correct option, found ${correct}`);
    }
  }

  if (!Array.isArray(CASE.careers) || CASE.careers.length < 2) {
    p.push('careers: need at least 2 entries');
  } else if (CASE.careers.some(c => typeof c !== 'string' || !c.trim())) {
    p.push('careers: all entries must be non-empty strings');
  }

  if (!CASE.cta || typeof CASE.cta.label !== 'string' || !CASE.cta.label.trim()) {
    p.push('cta.label: missing or empty');
  }
  if (!CASE.cta || typeof CASE.cta.call !== 'string' || !CASE.cta.call.trim()) {
    p.push('cta.call: missing Alpine expression');
  }

  if (typeof CASE.stage !== 'string' || !CASE.stage.includes('<svg')) {
    p.push('stage: missing <svg> markup');
  }
  if (CASE.controls !== undefined && typeof CASE.controls !== 'string') {
    p.push('controls: must be a markup string when present');
  }
  if (CASE.state !== undefined && (typeof CASE.state !== 'object' || CASE.state === null || Array.isArray(CASE.state))) {
    p.push('state: must be a plain object when present');
  }

  // The stage must not collide with the component's own reactive properties.
  const RESERVED = ['cs', 'step', 'quizPick', 'quizChecked'];
  if (CASE.state) {
    for (const k of Object.keys(CASE.state)) {
      if (RESERVED.includes(k)) p.push(`state.${k}: shadows a reserved Case File property`);
    }
  }

  return p;
}

/**
 * The Alpine data factory. Pure: no DOM access, so it is node-testable.
 */
export function createCaseFile(CASE) {
  return {
    cs: CASE,
    step: 0,
    quizPick: null,
    quizChecked: false,
    ...(CASE.state || {}),

    get s() { return this.cs.steps[this.step]; },
    get atLast() { return this.step === this.cs.steps.length - 1; },

    next() { if (!this.atLast) this.step += 1; },
    prev() { if (this.step > 0) this.step -= 1; },
    go(i) { if (i >= 0 && i < this.cs.steps.length) this.step = i; },

    pickQuiz(i) { if (!this.quizChecked) this.quizPick = i; },
    checkQuiz() { if (this.quizPick !== null) this.quizChecked = true; },
    retryQuiz() { this.quizPick = null; this.quizChecked = false; },
    quizState(i) {
      if (!this.quizChecked) return this.quizPick === i ? 'on' : '';
      if (this.cs.quiz.options[i].correct) return 'correct';
      return this.quizPick === i ? 'wrong' : '';
    },
    get quizCorrect() {
      return this.quizChecked && this.quizPick !== null && !!this.cs.quiz.options[this.quizPick].correct;
    }
  };
}

/**
 * The chrome. Identical for every unit; only `stage` and `controls` vary.
 */
export function caseFileMarkup(CASE) {
  return `
<section class="casefile" id="casefile" x-data="casefile" x-show="mode==='casefile'" aria-labelledby="cf-title">
  <!-- Masthead and stats side by side.
       The hook is one sentence of set-up, and as a full-bleed paragraph in a 1462px cockpit
       panel it broke wherever a 62ch cap happened to land -- a ragged edge in the middle of
       the screen with nothing to its right. Pairing it with the stats gives the sentence a
       container the width of its own measure, so it wraps AT an edge, and puts the three
       numbers where a magazine deck would put them. Below 880px the two stack. -->
  <div class="cf-top">
    <div class="cf-head">
      <span class="cf-kicker"><span class="cf-dot"></span> <span x-text="'Case file ' + cs.number + ' &middot; ' + cs.kicker"></span></span>
      <h2 class="cf-title" id="cf-title" x-text="cs.title"></h2>
      <p class="cf-hook" x-text="cs.hook"></p>
    </div>

    <div class="cf-stats">
      <template x-for="st in cs.stats" :key="st.k">
        <div class="cf-stat"><span class="v" x-text="st.v"></span><span class="k" x-text="st.k"></span></div>
      </template>
    </div>
  </div>

  <div class="cf-grid">
    <figure class="cf-stage">
      ${CASE.stage}
      ${CASE.controls || ''}
      <figcaption class="cf-cap" x-text="s.cap"></figcaption>
    </figure>

    <div>
      <ol class="cf-steps">
        <template x-for="(st,i) in cs.steps" :key="i">
          <li>
            <button class="cf-step" :class="{ on: i===step, done: i&lt;step }" @click="go(i)">
              <span class="cf-step-n" x-text="i+1"></span><span x-text="st.t"></span>
            </button>
          </li>
        </template>
      </ol>
      <div class="cf-narr">
        <template x-for="(st,i) in cs.steps" :key="'n'+i">
          <div x-show="i===step" x-transition:enter.opacity.duration.400ms>
            <p x-text="st.body"></p>
            <p class="cf-chem"><strong>The chemistry</strong> <span x-text="st.chem"></span></p>
          </div>
        </template>
      </div>
      <div class="cf-controls">
        <button class="btn cf-btn" @click="prev()" :disabled="step===0">Back</button>
        <button class="btn cf-btn cf-btn-accent" @click="next()" x-show="!atLast">Next</button>
        <span class="cf-progress" x-text="(step+1) + ' / ' + cs.steps.length"></span>
      </div>
    </div>
  </div>

  <div class="cf-quiz">
    <span class="cf-quiz-label">Your call</span>
    <p class="cf-quiz-q" x-text="cs.quiz.q"></p>
    <div class="cf-choices">
      <template x-for="(o,i) in cs.quiz.options" :key="i">
        <button class="cf-choice" :data-state="quizState(i)" @click="pickQuiz(i)" x-text="o.label"></button>
      </template>
    </div>
    <div class="cf-quiz-actions">
      <button class="btn cf-btn cf-btn-accent" @click="checkQuiz()" :disabled="quizPick===null || quizChecked">Lock it in</button>
      <button class="btn cf-btn" x-show="quizChecked &amp;&amp; !quizCorrect" @click="retryQuiz()">Try again</button>
    </div>
    <div class="cf-explain" :class="quizCorrect ? 'good' : 'bad'" x-show="quizChecked">
      <strong x-text="quizCorrect ? 'Called it. ' : 'Not this time. '"></strong>
      <span x-text="cs.quiz.explain"></span>
    </div>
  </div>

  <div class="cf-punch">
    <div>
      <p class="cf-punch-lead" x-text="cs.punch"></p>
      <div class="cf-careers">
        <template x-for="c in cs.careers" :key="c"><span class="cf-career" x-text="c"></span></template>
      </div>
    </div>
    <button class="cf-cta" @click="${CASE.cta.call}; window.scrollTo({ top: 0, behavior: 'smooth' })">
      <span x-text="cs.cta.label"></span> <span aria-hidden="true">&#8594;</span>
    </button>
  </div>
</section>`;
}

/**
 * The teaser chip that sits under the unit's <h1> and opens the Case File tab.
 * Stays an <a href="#casefile"> so the story is still reachable without JS, but the
 * click switches `mode` instead of scrolling, and the chip hides once you are there.
 */
export function teaserMarkup(CASE) {
  return `<a class="cf-teaser" href="#casefile" x-show="mode!=='casefile'" @click.prevent="mode='casefile'">`
    + `<span class="t-tag">Case file</span>`
    + `<span>${CASE.teaser}</span>`
    + `<span class="t-go" aria-hidden="true">&#8594;</span>`
    + `</a>`;
}

/**
 * Register the component and inject its markup.
 * Call BEFORE Alpine.start() so the injected bindings initialize with the page.
 *
 * Fills <div data-casefile> with the story section, and <div data-casefile-teaser>
 * with the chip when that mount point is present.
 *
 * @param {object} Alpine  the Alpine instance
 * @param {object} CASE    the unit's case data
 * @param {string} [selector='[data-casefile]']
 * @returns {boolean} true when the story section mounted
 */
export function mountCaseFile(Alpine, CASE, selector = '[data-casefile]') {
  const problems = validateCase(CASE);
  if (problems.length) {
    console.error(`[casefile] "${CASE && CASE.id}" has invalid data:\n  - ${problems.join('\n  - ')}`);
  }

  Alpine.data('casefile', () => createCaseFile(CASE));

  const teaser = document.querySelector('[data-casefile-teaser]');
  if (teaser) teaser.outerHTML = teaserMarkup(CASE);

  const mount = document.querySelector(selector);
  if (!mount) {
    console.error(`[casefile] no mount point matched "${selector}". Add <div data-casefile></div> inside the x-data="sim" root.`);
    return false;
  }
  mount.outerHTML = caseFileMarkup(CASE);
  return true;
}
