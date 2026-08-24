# Wave 2 launch — 08 · Solutions, 07 · Gas Laws, 02 · Atomic Structure

Copy the **Shared preamble** plus **one unit block** into each agent. Unit 02 is class A and its
block carries a *different procedure* — read that block in full before spawning it.

Written 2026-08-21, after wave 1 (04, 06, 09, 10, 11) landed. Every number here was checked against
the repo at that moment. Re-verify anyway; that rule has caught something every single time it has
been applied in this tree, including twice in the writing of this file.

---

## STOP — wave 1 is built but not verified. Close this out first.

Wave 1 delivered four real units. All four have `index.html` on the cockpit shell, a unit
stylesheet, and `js/art.js` whose keys are exactly 1:1 with `SCENARIOS` — verified by import:
`06` 15/15, `09` 16/16, `10` 21/21, `11` 31/31. Unit 6's `cta.call` was correctly converted to
`setMode('stoich')`. Five new traps were appended to `HANDOFF-PORTING.md` §4, numbered 13
to 17, where the list now ends. That is the compounding asset working as intended.

But **three of the five registrations were never applied, so none of wave 1 is under a standing
gate**, and the tree has no commit behind it. Each unit was probably audited once by its own agent
through the throwaway harness the brief asked for -- traps 15 and 16 read like findings that only
a real audit run produces -- but nothing is registered, so nobody can re-check any of it without
first re-deriving the entries, and a later shell change would break all four silently.

Do these five things before spawning wave 2. Launching three more units onto an unregistered shell
is how one bad `cockpit.css` assumption becomes seven broken pages with no test to name which one.

**1. Register the four units with the layout harness.** `tests/unit5a-layout.test.mjs` still lists
only `01`, `04` and `05`. These entries are ready to paste — the station lists were extracted from
each `index.html` by matching `role="tab"` and reading the `aria-label` off the same element, so
they match the markup exactly. Trap 8 is unforgiving here: a label that is one character off burns
a 30-second Playwright timeout per station and audits the wrong tab.

```js
  { name: 'units_new/06-reactions-stoichiometry', path: '/units_new/06-reactions-stoichiometry/',
    stations: ['Balance', 'Classify', 'Stoichiometry', 'Limiting reactant', 'The tanker'],
    story: 'Case file',
    tab: st => 'nav.station-nav [aria-label="' + st + '"]' },
  { name: 'units_new/09-acids-bases', path: '/units_new/09-acids-bases/',
    stations: ['Naming', 'Definitions', 'Strong vs weak', 'Neutralize', 'pH meter', 'Triage'],
    story: 'Case file',
    tab: st => 'nav.station-nav [aria-label="' + st + '"]' },
  { name: 'units_new/10-thermochemistry', path: '/units_new/10-thermochemistry/',
    stations: ['Read the situation', 'Pick the pack', 'Size the heat', 'Calorimetry', 'The call'],
    story: 'Case file',
    tab: st => 'nav.station-nav [aria-label="' + st + '"]' },
  { name: 'units_new/11-nuclear', path: '/units_new/11-nuclear/',
    stations: ['Identify the source', 'What is left', 'Pick the isotope', 'Fission or fusion',
               'The last call'],
    story: 'Case file',
    tab: st => 'nav.station-nav [aria-label="' + st + '"]' },
```

Add a `scrollPorts` line to an entry **only** if the audit reports that unit's bench or goal text
scrolling, the way `01` does. Do not add it pre-emptively; it suppresses a real check.

**2. Register the four case files.** `tests/casefile.test.js` still has three `NEW_TREE` rows.
Imports go beside the existing `N1`/`N4`/`N5` block (`:26-28`), rows into `NEW_TREE` (`:57`).
`NEW_TREE`, **never `UNITS`** — `UNITS` doubles as the uniqueness set and every `units_new` copy
deliberately keeps its parent's `id` and `number`, so a `UNITS` row fails two assertions.

```js
import { CASE as N6 }  from '../units_new/06-reactions-stoichiometry/js/case.js';
import { CASE as N9 }  from '../units_new/09-acids-bases/js/case.js';
import { CASE as N10 } from '../units_new/10-thermochemistry/js/case.js';
import { CASE as N11 } from '../units_new/11-nuclear/js/case.js';
// ... and in NEW_TREE:
  { unit: 'new/06', CASE: N6 },
  { unit: 'new/09', CASE: N9 },
  { unit: 'new/10', CASE: N10 },
  { unit: 'new/11', CASE: N11 },
```

**3. Run both gates and expect the numbers to move.** `casefile` rises about 16 per registered
unit, so `299` should become roughly `363` — a *higher* number with `0 failed` is the registration
landing, not a fault. The layout audit was last green at **416 states across 4 builds**; with four
more targets expect somewhere near 800 and a run of 25 minutes or more.

```bash
npm test && PW_ROOT=../Lab_studio node tests/unit5a-layout.test.mjs
```

**If the audit fails, wave 2 does not launch.** Fix the wave-1 unit first — a shell contract broken
in four units will be broken in seven.

**4. Finish the two paper registrations.** `README.md` has sections for `01`, `04` and `05` only,
and the status table in `HANDOFF-INDEX.md` still reads "to do" for `06`, `09`, `10` and `11` even
though `BUILT` in `units_new/index.html` correctly lists all seven. The hub is right; the docs are
behind it.

**5. Commit.** `git log` is still at `e51d0d3` — wave 1's four units, ~5,000 lines of hand-authored
SVG among them, exist only as uncommitted working-tree changes. **The git root is
`C:/Users/EmilJivishov/Projects`, not `Chem_simulations`**, and 256 of the 336 dirty paths belong
to other projects, mostly Lab_studio's in-flight work. So the commit must be path-scoped; the
trailing `-- .` is what keeps Lab_studio out of it and leaves the pre-staged
`.github/workflows/project-relay-release.yml` alone.

```bash
cd /c/Users/EmilJivishov/Projects/Chem_simulations && git add -A . && git commit -m "Land the wave-1 cockpit ports: units 06, 09, 10 and 11" -- .
```

---

## Where the tree stands

Seven of eleven units are on the cockpit shell: `01`, `04`, `05`, `06`, `09`, `10`, `11`. Four
remain — the two class-B ports in this wave, one class-A build in this wave, and one class-A build
held for wave 3.

| Unit | Class | Banners | Tabs | Chart.js | three.js | The thing that makes it different |
|---|---|---|---|---|---|---|
| 08 · Solutions | B — port | 18 | **8** | yes | no | chart-*central*; 8 tabs is the strip's worst case |
| 07 · Gas Laws | B — port | 13 | 5 | yes | yes | the only unit with both, 3 canvases, 4 gauge dials |
| 02 · Atomic Structure | **A — full build** | **21 to design** | 4 + case | no | no | no Scenario layer at all, and one bench does not exist |
| 03 · Periodic Trends | A — full build | ~15 to design | 4 | yes | no | **held for wave 3** |

Banner counts for 08 and 07 are verified by importing `SCENARIOS` (18 and 13). Unit 02's 21 is
derived in its own brief, not guessed: six core skills instead of four, so 6 × 3 plus `h1`, `h2`,
`cap`.

**Why 03 is held.** It is the only unit that combines a class-A design build with a Chart.js
lifecycle, and it is the last unit in the tree — so it should inherit both 02's class-A trap
harvest and 08's chart notes rather than discovering either in parallel. If you would rather finish
the tree in one pass, it can be added as a fourth agent with no technical blocker; the cost is two
novel scenario designs arriving for your review at the same time, which is the one part of this
work that no test can check for you.

---

## Shared preamble

```text
Repo: C:\Users\EmilJivishov\Projects\Chem_simulations (branch retrofit/u1-u4-scenario-layer).
Note your start time now; you need it for the last gate.

Read in order: units_new/HANDOFF-INDEX.md, units_new/HANDOFF-PORTING.md, units_new/HANDOFF-U<n>.md.
Re-verify every line number, count and claim those docs hand you. This is not boilerplate: the
index's library table was wrong for five units for a full revision, its casefile baseline was stale
by 48 assertions, and its trap 12 described as "unverified territory" a problem that had already
been solved in code.

Read, never edit, the finished units. units_new/01-practices-matter/ and units_new/05-the-mole/ are
the originals; units_new/04-bonding-geometry/ is the closest to the current procedure and the only
one with a WebGL canvas; units_new/09-acids-bases/ is the one with a Chart.js canvas. Whichever of
those two matches your unit is your best reference, ahead of any document.

HANDOFF-PORTING.md section 4 now holds 17 traps, not the 12 its prose may still imply. Traps 13-17
came out of wave 1 and are all about the right rail and the console: at least four .ship-stock rows
in .system-grid, a bespoke rail figure needing a height cap rather than width:100%, trap 9 applying
to a meter's value and not only its label, .mystery-job-switcher being a hard three-column grid,
and an Honors sub-bench needing its own goal text in the console. Read them before you build the
rail, not after the audit tells you.

OWNERSHIP - two other agents are working in this same tree at the same time as you:
1. The only paths you may create or modify are under units_new/<slug>/, plus throwaway
   tests/tmp-*-<slug>.mjs files that you delete before finishing.
2. Never modify units/, unit5a-codex/, the repo-root shared/, units_new/shared/cockpit.css, or any
   other unit's folder. Unit-specific CSS goes in units_new/<slug>/css/style.css, which loads after
   the shell. If you become convinced a rule must be generic to cockpit.css, DO NOT write it -
   report it. Seven units now depend on that file.
3. Do NOT edit tests/casefile.test.js, tests/unit5a-layout.test.mjs, units_new/index.html,
   units_new/README.md, units_new/HANDOFF-INDEX.md, or units_new/HANDOFF-PORTING.md. Those
   registrations are applied centrally and the other agents want the same lines. Report the exact
   text instead. Wave 1 skipped three of these and left four units unaudited; do not repeat it, and
   do not fix it yourself either.
4. RUN NO GIT COMMAND THAT MUTATES STATE. Read-only is fine: git status, git diff, git log, git
   show. Forbidden outright: add, commit, stash, checkout, restore, reset, clean, rm, mv, apply,
   switch, branch, merge, rebase, and anything with --force. This is not a style rule. The git root
   is C:/Users/EmilJivishov/Projects, one level ABOVE this project, and it holds about 150 other
   project folders; most of the hundreds of uncommitted files in it belong to other projects that
   are being actively worked on right now. A single `git stash` or `git checkout .` would destroy
   other people's work across several projects with no way back. If you think you need one of
   these, stop and report it.

CANVAS SIZING, if your unit has one - solved, do not re-derive:
- The WebGL pattern is units_new/04-bonding-geometry/js/vsepr.js: export a resize(), put a
  ResizeObserver on the host (:77), recompute renderer.setSize and camera.aspect (:87-91), and call
  resize() from setMode() as well (main.js:161-166), because the observer fires on the transition
  out of display:none but not before the newly-shown panel's first paint.
- No unit constructs a chart itself. Every chart comes from barChart/lineChart in
  shared/js/render.js:42,59, both already responsive with maintainAspectRatio:false, and each chart
  unit already exposes its own resize path. Wire the existing method into setMode().
- What is on you is the wrapper height, in your own stylesheet. Unit 4's answer is
  css/style.css:131-157: .stage { height: clamp(190px, 33vh, 300px) } - a clamp on vh, not a fixed
  px, because the panel scrolls and the stage is the element with slack at 600px. A CHART wants a
  different number: Unit 9's is .canvas-wrap { height: clamp(178px, 26vh, 240px) }
  (units_new/09-acids-bases/css/style.css:121, with a flat 168px at the narrow breakpoint at :255),
  because Chart.js spends roughly 70px of any box on legend and axis furniture, so Unit 4's taller
  clamp would leave too little plot area. Start from whichever of the two matches your canvas.
- Keep chart, gasbox and three.js instances at module scope, never on the Alpine reactive proxy
  (trap 11). The units already do this correctly; do not tidy a module-level `let chart = null`
  onto the component while porting.

GATES - all five before you report done.
1. Baseline first: run npm test BEFORE you change anything and record the five numbers. Two other
   agents are landing work, so your own baseline is the only truth. At the end, npm test again:
   equal or higher with 0 failed is fine, lower is a regression you caused.
2. Layout audit, your unit only, without touching the shared harness: copy
   tests/unit5a-layout.test.mjs to tests/tmp-audit-<slug>.mjs - it MUST live in tests/, because it
   resolves ROOT as new URL('..', import.meta.url) - cut TARGETS down to a single entry for your
   unit, then run  PW_ROOT=../Lab_studio node tests/tmp-audit-<slug>.mjs  until it prints PASS.
   Delete the temp file when you are done. Playwright is installed at ../Lab_studio. Your stations
   list must match your tabs' aria-labels EXACTLY: trap 8 turns one wrong character into a 30-second
   timeout per station, so a run taking 20+ minutes instead of ~6 is that bug, not slowness. Other
   agents are auditing concurrently, so expect CPU contention on top.
3. Validate your own case.js: copy tests/casefile.test.js to tests/tmp-case-<slug>.mjs, add your
   unit to the NEW_TREE list in the COPY, run it, delete it. Do not wait for central registration to
   discover a cta.call problem.
4. Eyes on the art and the benches. Do NOT use the in-app Browser pane - screenshots time out there
   and the viewport collapses. Drive Playwright from ../Lab_studio in throwaway scripts under your
   scratchpad:
   (a) contact sheet - one page with every banner captioned by id, screenshot to PNG, then Read the
       PNG. Look for defs bleeding between scenes (Alpine keeps every panel in the DOM, so an
       unprefixed gradient id leaks), subjects or labels below y=102 eaten by the caption scrim, and
       lighting that is not upper-left everywhere. Run this after your first three banners, not at
       the end. Unit 11 carried 31 banners and Unit 10 carried 21; at that volume a defs-bleed
       habit caught on scene 3 is a different job from the same habit caught on scene 30.
   (b) functional pass at 1536x864, Honors on and off - script a commit, right and wrong, on every
       bench. Check that every verdict appears, the world-state moves, worldLog stamps, the case file
       opens and its CTA returns to the right bench.
5. find units unit5a-codex shared units_new/shared -newermt "<your start time>" -type f
   Must print nothing. Add the other units' folders to that list if you want to be sure.

DELIVERABLES in your final message - this is the handoff, and wave 1 proved it is the part that gets
dropped, so be exact and be complete:
- one line per procedure step: done, or what you changed and why
- the exact TARGETS entry for tests/unit5a-layout.test.mjs, with your stations copied from your own
  markup rather than retyped, and a scrollPorts line ONLY if your audit showed scrolling
- the exact import line and NEW_TREE row for tests/casefile.test.js
- the BUILT slug for units_new/index.html
- the README.md section as markdown, shaped like Unit 1's
- the row your unit needs in the HANDOFF-INDEX.md status table
- new traps for HANDOFF-PORTING.md section 4, numbered from 18, in that file's voice
- anything you think belongs in cockpit.css that you deliberately did not write
- your before and after npm test numbers, and your audit output, verbatim
```

---

## Unit 08 — `08-solutions`

```text
Unit 8 · 08-solutions · 18 banners · 8 tabs · Chart.js, no three.js. Class B: follow
HANDOFF-PORTING.md section 2 end to end.

Two things make this the harder of the two ports in this wave.

Eight tabs is the station strip's worst case in the whole tree. Seven is proven by
units_new/05-the-mole, which is registered in the layout harness and green; units_new/09-acids-bases
also runs seven but is not registered, so treat it as corroboration rather than proof. You are
clearing one step past known-good,
and the place it will show is the 1024x600 and 900x700 viewports where trap 5's .tab-full /
.tab-short swap and the grid-auto-columns revert both matter. Those rules already ship in
cockpit.css - use the markup, do not re-derive them, and do not "fix" the strip in the shared
stylesheet.

The chart is central here rather than incidental: the curve bench is built on it, so unlike Unit 9's
Honors-gated titration chart it is live in normal use. Nothing to construct - curveChart is already
module-scope at units/08-solutions/js/main.js:22, created from lineChart at :677, and
resizeCurveChart() at :694 already exists. Wire that into setMode() and give the canvas wrapper an
explicit height in your own stylesheet. Unit 9 already solved this and its numbers are in
units_new/09-acids-bases/css/style.css: .canvas-wrap { height: clamp(178px, 26vh, 240px) } at :121,
.canvas-wrap canvas { width: 100% !important; height: 100% !important } at :124, and a flat 168px
override at the narrow breakpoint at :255. Its comment at :105 is the part worth reading: Chart.js
spends roughly 70px of any box on furniture - legend plus axis - so Unit 4's clamp(190px, 33vh,
300px) leaves too little plot area for a curve. Start from Unit 9's numbers, not Unit 4's, and say
in your report whether a chart-central bench needed something different, because Unit 7 follows you
with three charts at once and wants that answer.

cta.call should already be setMode - verify rather than assume.
```

## Unit 07 — `07-gas-laws`

```text
Unit 7 · 07-gas-laws · 13 banners · 5 tabs · Chart.js AND three.js · 3 canvases · 4 x-gauge dials.
Class B: follow HANDOFF-PORTING.md section 2 end to end.

The fewest banners of any unit in the tree and by far the heaviest plumbing. Cheap art, expensive
wiring - budget the opposite way round from Unit 11.

Everything you need already exists at module scope in units/07-gas-laws/js/main.js:12:
gasbox, lawChart, mbChart, zChart. The three charts are built from lineChart at :732, :741 and
:751, and resizeCharts() at :760 already resizes all three. gasbox is the three.js viewer from
js/gasbox.js, which goes through shared/js/stage3d.js exactly as Unit 4's js/vsepr.js does - so
Unit 4's resize pattern is your template for it, and Unit 9's plus Unit 8's chart-wrapper heights
are your template for the charts. You are the first unit that has to hold both at once in one
console: expect to call both resize paths from setMode() and to give four separate wrappers a
height.

The four x-gauge dials are SVG, not canvas - shared/js/gauge.js builds them with createElementNS -
so they carry no sizing problem. What they do carry is trap 6: the old units set gauge captions and
reference cells at --fs-xs, which is 12.5px against the layout contract's 14px floor, and the audit
fails on it.

Do not add anything to the importmap beyond what the unit already declares, and do not consolidate
the three charts into one instance while porting.

cta.call should already be setMode - verify.
```

## Unit 02 — `02-atomic-structure` · **class A, different job**

```text
Unit 2 · 02-atomic-structure · 21 scenarios and 21 banners to DESIGN · four stations plus the case
file today, five stations once you build the missing one · no rendering libraries, no canvas, 6
x-gauge dials.

READ THIS FIRST: you are not doing a port, and HANDOFF-PORTING.md is not your procedure. Unit 2 has
no Scenario layer at all - units/02-atomic-structure/js/model.js exports no SCENARIOS, its main.js
never spreads createGame and never calls gRecord. Your plan is units_new/HANDOFF-U2.md, with
RETROFIT-U1-U4.md section 3 for the world it takes place in ("The Glow Room"). Use
HANDOFF-PORTING.md only for its section 4 trap list, which applies to anything living on this shell,
and for its section 2.3-2.5 mechanics once you have something to render.

The job, in order: design the assessment and consequence layer - scenarios, commits, bands,
verdicts, world-state - then render it in the cockpit, then draw the art. Unit 1 is your reference
for all three and it took a full session on its own; this is the larger of the two class-A builds.

Two scope facts from your brief that are easy to miss and expensive to discover late:
- Twenty-one scenarios, not fifteen, because Unit 2 has SIX core skills where every other unit has
  four: 6 x 3 core scenarios plus h1, h2 and cap. The art file is a third larger than Unit 1's
  before you draw anything, and the TEKS badge, coreSkills and teksMasteredCount all have to carry
  six.
- Five of those six skills need a commit that does not exist yet, and one bench has to be invented
  outright: `models` (C.6(A)) has no tab, no markup and no tool in the current unit - verified, its
  only tabs today are build, mass, spectra, config and the case file. That is design
  work, not porting, and it is the part where you should show your thinking rather than just ship it.

Because your scenario text and ids are new, the 21 banners are drawn against something nobody has
signed off. Build and wire the Scenario layer first, get the design in front of a human, and draw
the art last - Unit 4 sequenced it that way for exactly this reason and it was right.

The 6 x-gauge dials are SVG (shared/js/gauge.js uses createElementNS), so they raise no canvas
sizing question. They do raise trap 6: gauge captions and reference cells in the old units are set
at --fs-xs, 12.5px, and the layout contract's floor is 14px.

Ignore every canvas and chart instruction in the shared preamble. Your unit has neither.
```

---

## Wave 3

**03 · Periodic Trends** — class A, ~15 banners from 3 core skills × 3 plus `h1`, `h2`, `cap`,
4 tabs, and two Chart.js instances - `trendChart` and `ieChart`, built from `lineChart` at
`units/03-periodic-trends/js/main.js:261` and `:273`. Last unit in the tree. When it lands, the
migration-temporary paragraph under the hub grid (`x-show="built < units.length"` in
`units_new/index.html`) comes out, and `BUILT` reaches eleven.
