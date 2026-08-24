# Porting an already-retrofitted unit into the cockpit

The shared procedure for **class-B** units — 04, 06, 07, 08, 09, 10, 11 — each of which
already exports `SCENARIOS`, spreads `createGame`, calls `gRecord`, and runs a world-state
with verdicts. Read this once, then the unit's own `HANDOFF-U<n>.md` for what is specific to
it.

**What you are doing:** moving a working unit from the worksheet shell into the mission
cockpit, and drawing the scene art the cockpit's mission screen is built around.

**What you are not doing:** designing scenarios, choosing bands, writing commit handlers, or
deciding consequences. Those exist and are correct. If a bench seems to need new grading
logic, you have probably found a class-A unit by mistake — re-check the index.

---

## 1. Hard constraints

1. **Never modify `units/`, `unit5a-codex/`, or the repo-level `shared/`.** Prove it at the
   end:
   ```bash
   find units unit5a-codex shared -newermt "<the time you started>" -type f    # must be empty
   ```
2. **`units_new/shared/cockpit.css` is shared by every unit in the tree.** Add to it only
   when the change is generic across units. Unit-specific rules go in that unit's own
   `css/style.css`, which loads after it.
3. **No em-dashes in `CASE` copy** — `tests/casefile.test.js` enforces it. The copied file
   already passes; keep it that way.
4. **Re-verify every line number any document hands you**, including this one. Several
   citations in `RETROFIT-U1-U4.md` have drifted since it was written.

## 2. The port, step by step

### 2.1 Copy and re-path

```
units_new/<slug>/
  index.html
  css/style.css
  js/{model.js, main.js, case.js}
  js/art.js          <- new, the only file you author from scratch
```

`js/model.js`, `js/main.js` and `js/case.js` copy over almost unchanged. Fix:

- **Import depth.** `js/*.js` → `../../../shared/js/{chem,game,...}.js` (three levels, not
  two). `index.html` → `../../shared/css/*`, `../shared/cockpit.css`, `css/style.css`, and
  `../../shared/js/{render,gauge,casefile}.js`.
- **`unitId: 'units_new/<slug>'`** in the `createGame` spread, so progress never collides
  with the old build's localStorage.
- **`CASE.cta.call`** must call `setMode('<mode>')`, not assign `mode='<mode>'`. Units 4 and
  6 still use the bare assignment; 7, 8, 9, 10 and 11 already use `setMode`. Check yours.
- **Header comments** — say where the file now lives and that it is the units_new build.

### 2.2 Add the cockpit plumbing to `main.js`

The retrofitted units already have `nextScenario`, `recordWorld`, `gRecord`, `setMode`,
`resetProgress` and their capstone. What the cockpit additionally reads:

| Getter | What it returns | Model on |
|---|---|---|
| `scArt(id)` | `sceneArt(id)` from the new `art.js` | `units_new/01-practices-matter/js/main.js:259` |
| `activeBrief` | the scenario behind the active bench | `:270` |
| `activeVerdict` | **the most recent commit on the active bench** | `:278` — and see trap 3 |
| `activeTone` | `safe` / `warn` / `danger` / `standby` from the verdict | `:279` |
| `activeArtId` | the active brief's scenario id | `:287` |
| `activeStationName` | the scenario's `system`, or the bench name | `:291` |
| `activeStateLabel` | the verdict's `state`, or blank | `:297` |
| `activeOutcomeText` | verdict detail, else the brief's `why` | `:301` |
| `activeReference` | up to three standing facts for this bench | `:312` |
| `coreSkills` / `teksMasteredCount` / `seCaption` | the TEKS badge and popover | `:267`, `:268`, `:341` |
| `teksOpen` | session-only popover state | `:91` |

`activeReference` is the one that takes thought. It is the small card in the mission column
holding the facts a learner should never have to leave the bench to find — a constant, a
formula, a threshold. Three short lines, no more; it shares a column with the narrative and
every extra line is a line taken off the text somebody actually reads.

### 2.3 Rebuild `index.html` as a cockpit

Start from `units_new/01-practices-matter/index.html` and keep its skeleton:

- `<main class="codex-shell cockpit-shell">` with `<header class="cockpit-command">`
  (brand · station strip · Honors + Reset · XP/streak/TEKS badge).
- `<div class="workbench-grid" x-show="mode!=='casefile'">` with three children:
  `.mission-screen.panel` (art, status, copy, reference, standing line), `.task-stack.chem-console`
  (one `.panel` per bench), `.life-support-board.panel` (the unit's world-state).
- `<div data-casefile></div>` last, inside the `x-data` root.
- The module bootstrap at `index.html:526-543` verbatim, paths adjusted. The
  `window.deferLoadingAlpine` shim and **`mountCaseFile(Alpine, CASE)` before
  `Alpine.start()`** are load-bearing: the case file injects markup carrying its own
  `x-data`, so a late mount leaves the story inert.

The benches themselves are the old panels with their `.brief` cards dropped (the shell hides
them; the mission screen carries the narrative) and their inline `style="margin-…"`
attributes replaced by the shell's `.mt-*` / `.mb-*` utilities so a short viewport can
tighten them.

**Station strip** — two labels per tab, and an `aria-label` carrying the canonical name:

```html
<button class="tab" role="tab" :aria-selected="mode==='geometry'" @click="setMode('geometry')"
        aria-label="3D geometry" title="3D geometry · C.7(C) VSEPR shapes">
  <span class="tab-full" aria-hidden="true">3D geometry</span>
  <span class="tab-short" aria-hidden="true">Shapes</span></button>
```

The capstone tab also takes `:class="{ 'is-locked': !capUnlocked }"`; the shell draws the
lock dot as a `::after`, not a text node.

**The way home** — the pattern already exists; copy it exactly. Replace the brand
`<strong>` with an anchor carrying `.command-home`, pointed at **`../index.html`**:

```html
<div class="command-brand">
  <span class="command-kicker">Unit 4 · TEKS C.7</span>
  <a class="command-home" href="../index.html" title="All units">Bonding, Nomenclature &amp; Geometry</a>
  <span x-text="activeStationName"></span>
</div>
```

`../../index.html` is the *old* tree's hub: its cards link to `units/<slug>/index.html`, so
it walks the learner out of this build without telling them. `../` is the units_new hub.

The styling is done — `.command-home` in `cockpit.css` already matches the `<strong>` it
replaces and takes the accent on hover/focus. Do not restructure this block, because two
things bite:

- **It replaces the title rather than adding a row.** The header is height-critical
  (`min-height: 104px`, two-row grid below 980px); a fourth row in that grid does not fit.
- **`.command-brand span:last-child` (`:424`) styles the active-station line by position.**
  An anchor appended *after* it steals that styling — and so would any nested `<span>` you
  introduce anywhere in `.command-brand`, since the selector is a descendant match. Keep the
  anchor a non-span sitting before the station line.

Confirm after the port that the rule still lands where it should:

```js
document.querySelector('.command-brand span:last-child').textContent  // the station, not the link
```

### 2.4 Move the world-state into the rail

Every retrofitted unit already has its felt quantity, its day/shift counter and its
`worldLog`. The rail's job is to show them in the shell's five grid areas — `header`,
`crew`, `systems`, `consequence`, `log`. Map the unit's own state onto those without
renaming the areas:

- `header` — the world's state word plus the day/clock chip
- `crew` — the single headline meter, with a face if the unit has a mood
- `systems` — the per-quantity rows, or a bespoke figure (Unit 2's tube rack, Unit 4's shelf)
- `consequence` — `activeStateLabel` and the newest log line
- `log` — `worldLog.slice(0, 3)`

**A bespoke figure must be string-built and injected with `x-html` on a `<g>`.** Alpine's
`x-for`/`x-if` do not bind scope inside `<svg>` (`RETROFIT-U1-U4.md` §8 trap 2).

### 2.5 Author `js/art.js`

The only file written from scratch. One 400×150 banner per scenario id, `aria-hidden="true"`.

Copy the scaffolding from `units_new/01-practices-matter/js/art.js` — `kit(id)` for the
per-scene `<defs>` namespace, `scene(id, {caption, body, theme})`, and the `mono()` /
`panelBox()` / `flow()` primitives — then build a **set signature** for the unit's world the
way Unit 1 has `waterColumn()` for "in the tank" and `deskShelf()` for "on the desk beside
it". Two signatures is usually enough: one for the place the work happens, one for the place
the consequence lands.

Non-negotiable:

- **Per-scene id prefixes on every gradient, pattern and clip.** Alpine keeps every panel in
  the DOM, so an unprefixed id bleeds from one scene into another. `kit()` does this for you;
  do not hand-write raw `<defs>`.
- **Lighting from the upper left**, everywhere, so a cylinder in one banner is shaded like
  the cylinder in the next.
- **Nothing below `y = 102`** — see trap 7.
- The banner is decoration: the goal text under it is the authoritative description, which is
  why it is `aria-hidden`.

Render the whole set onto one contact-sheet page and **look at it** before wiring anything
in. One screenshot catches scrim, collision and defs-bleed bugs that are invisible one scene
at a time:

```html
<script type="module">
import { SCENE_ART } from 'http://localhost:8091/units_new/<slug>/js/art.js';
for (const [id, svg] of Object.entries(SCENE_ART)) { /* append svg + <figcaption>id</figcaption> */ }
</script>
```

### 2.6 Register with the layout audit

Add a `TARGETS` entry to `tests/unit5a-layout.test.mjs` (see `:54-77`):

```js
{ name: 'units_new/<slug>', path: '/units_new/<slug>/',
  stations: [ /* the tabs' aria-labels, EXACTLY */ ], story: 'Case file',
  tab: st => 'nav.station-nav [aria-label="' + st + '"]',
  scrollPorts: ['.chem-console > .panel.is-active'] },   // only if the benches scroll
```

### 2.7 Turn the unit on in the hub, and in the case-file suite

Two registrations that are easy to forget because neither one fails loudly:

1. **`units_new/index.html`** — add this unit's slug to the `BUILT` array in the page's module
   script, keeping unit order:

   ```js
   const BUILT = [
     '01-practices-matter',
     '04-bonding-geometry',   // <- your port
     '05-the-mole',
   ];
   ```

   That one line flips the card from "Soon" to a live link. Until you do, the unit is
   finished and unreachable from the front page. Do **not** reach for
   `shared/js/teks.js` — it already says every unit is `ready` and it is a protected file;
   see `HANDOFF-INDEX.md`, *The front door*, for why the override lives here.
2. **`tests/casefile.test.js`** — add an import and a row to **`NEW_TREE`** (`:57`), *not* to
   `UNITS`. This tree is already wired: `NEW_TREE` holds `new/01`, `new/04` and `new/05`, and
   `ALL = [...UNITS, ...NEW_TREE, …]` (`:62`) is what the schema, em-dash and `cta.call` gates
   walk. **A `UNITS` row would fail the suite**, because `UNITS` is also the uniqueness set
   (`:97-99`) and every `units_new` copy deliberately keeps its parent's `id` and `number` —
   verified: both `04` builds are `water-bend-ice` / `004`. This matters more than it looks:
   `cta.call` is rewritten during the port (`mode='x'` → `setMode('x')`), and the check at
   `:126` accepts either form, so a port that forgot the rewrite still passes here — what the
   suite catches is a `cta.call` that is neither.

## 3. Verification — four gates

```bash
npm test
```
Unchanged: `chem 286, game 36, casefile 427, gauge 149, molezoom 64, art 114, 0 failed`.
`tests/art.test.js` is the newest of these and the only one that looks at scene art: it
asserts a banner per scenario, the 400x150 aria-hidden frame, no defs id shared between two
banners, and that the distinct-drawing count equals the banner count. It discovers units from
the directory, so a new unit is covered the moment its `js/art.js` exists.
`casefile` was 251 until the `units_new` builds joined the suite through `NEW_TREE`; it
rises by roughly 16 per unit you register there, so re-baseline it before you start rather
than reading a bigger number as somebody's mistake.

```bash
PW_ROOT=../Lab_studio node tests/unit5a-layout.test.mjs
```
Must print `cockpit layout: PASS`. Eight viewports × every station × Honors on and off: no
document scroll, nothing clipped, occluded or ellipsed, nothing under 14px, no dead gaps.
About six minutes; if it takes twenty, see trap 8.

```bash
py -3.13 -m http.server 8091
```
Walk every station by hand at 1536×864, Honors on and off, committing **right and wrong** on
each bench. The chemistry is already correct — what you are checking is that the port did not
lose anything: every verdict appears, the world-state moves, the log stamps, the case file
opens and its CTA returns you to the right bench.

```bash
find units unit5a-codex shared -newermt "<start time>" -type f     # must be empty
```

## 4. Traps

Ten from Unit 1, plus five more from Unit 4, the first class-B port. **Append what you
learn.**

1. **The shell's active console panel collapses its first grid row.** `cockpit.css` sets
   `.chem-console > .panel.is-active { display: grid; grid-template-rows: minmax(0, auto); }`
   and that first track resolves to **0px**. It never mattered in Unit 5, because every panel
   there opens with the `.brief` card, which the shell hides. **Any panel opening with real
   content draws it on top of the block below.** Fix in the unit's own stylesheet:
   ```css
   .chem-console > .panel.is-active { display: block !important; }
   ```

2. **The shell hides the console's verdict card** (`.chem-console .verdict { display: none
   !important; }`), because the mission screen states the outcome. Right for a bench whose
   commit button is on screen; wrong for a commit at the bottom of a scrolled panel, whose
   feedback would land off-screen in the top-left corner. Un-hide exactly those — Unit 1 does
   it for `.chem-console .honors-block .verdict` — and unclamp their text
   (`-webkit-line-clamp: none`).

3. **A fixed `activeVerdict` precedence hides one of two commits**: whichever loses the tie
   can never be read. Unit 1 keeps a `modeVerdict` map written by every commit handler and
   returns `this.modeVerdict[this.mode]`
   (`units_new/01-practices-matter/js/main.js:103-110`, `:278`). **Any bench carrying a core
   commit and an Honors commit needs this**, which is most of them.

4. **KaTeX inflates `documentElement.scrollHeight`.** `.katex-mathml` is `position:absolute`
   and 1px; with no positioned ancestor it resolves against the initial containing block,
   lands past the fold, and reads as a phantom page scroll on a shell that must have none.
   Give the wrapper `position: relative` — Unit 1 does it on `.eqn`. Every unit using
   `x-tex` will hit this.

5. **Station labels only fit at ≥1536 CSS px**; below that the strip shows one-word names via
   the `.tab-full` / `.tab-short` swap. Separately, `grid-auto-columns: minmax(0, 1fr)` must
   revert to `auto` below 1120px, or the longest *short* label ellipses at 1024×600. Both
   rules already ship in `cockpit.css` — use the markup, do not re-derive them.

6. **`--fs-xs` is 12.5px and the layout contract's floor is 14px.** The old units set
   reference cards, figure captions and table cells at `--fs-xs` throughout. Anything inside
   `.chem-console > .panel.is-active` or `.mission-screen` needs `--fs-sm` (≈14.08px).

7. **Scene art below `y = 102` is eaten by the caption scrim.** `scene()` paints a scrim from
   y=102 to 150 so the mono caption at y=138 reads. A label at y=110 comes out ~40% faded; at
   y=116 the audit reports it occluded. Keep every subject and in-scene label at **y ≤ 100**.

8. **The layout audit clicks tabs by `aria-label`.** If a `stations` entry does not match the
   tab's `aria-label` *exactly*, the miss burns Playwright's 30s click timeout — the run takes
   25 minutes instead of 6 and audits the wrong station.

9. **The right rail is height-tight at 1024×600.** Two-word row labels wrapped to two lines
   and pushed the log out of the viewport. Keep rail labels short; put the full meaning in the
   row's `title`.

10. **`unitId` must be the units_new slug.** Reusing the old slug shares a localStorage key
    with the old build, whose skill ids may differ.

11. **Chart.js and three.js instances stay at module scope, never inside Alpine's reactive
    proxy** (`RETROFIT-U1-U4.md` §8 trap 7). The retrofitted units already do this correctly —
    do not "tidy" a module-level `let chart = null` onto the component while porting.

12. **A canvas in the cockpit console has no natural height.** Both Chart.js and the
    `stage3d.js` WebGL viewer size to their container. In the worksheet shell that container
    was a normal block in a scrolling page; in the cockpit it is a fixed-height clipped or
    scrolled panel, and after trap 1's `display: block` fix there is no grid track to define
    a height either. A canvas laid out while its panel was `display:none` measures zero and
    stays zero.

    **Most of the plumbing already exists — do not re-derive it.** For the WebGL half, Unit 4
    solved it in code: `units_new/04-bonding-geometry/js/vsepr.js` exports `resize()`, puts a
    `ResizeObserver` on the host (`:77`) and recomputes `renderer.setSize` plus
    `camera.aspect` (`:87-91`), and `main.js` mounts the viewer and calls `resize()` from
    `setMode()` (`:161-166`) rather than a `$watch`, because the observer fires on the
    transition out of `display:none` but **not before the newly-shown panel's first paint**.
    For the Chart.js half there is nothing to construct: no unit calls `new Chart` at all —
    every chart comes from `barChart` / `lineChart` in `shared/js/render.js` (`:42`, `:59`),
    both already `responsive: true, maintainAspectRatio: false`, and the units that own
    charts already expose their own resize path (`units/09-acids-bases/js/main.js:596`
    `resizeTitr()`, `units/07-gas-laws/js/main.js:760` `resizeCharts()`). Wire the existing
    method into `setMode`.

    **What is still on you is the height**, in the unit's own stylesheet. Unit 4 is the
    first port to have run this, and its answer is
    `units_new/04-bonding-geometry/css/style.css:131-157`: `.stage { height: clamp(190px,
    33vh, 300px) }` — a clamp on `vh` rather than the worksheet's flat `380px`, because the
    panel scrolls, so on the 726px primary display the stage takes about 240px and the five
    geometry choices below it stay above the fold, while at 600px it is the element with
    slack and gives height up first. It also paints a fallback `linear-gradient` mirroring
    `BACKDROP` in `shared/js/stage3d.js`, so the frame before WebGL first paints is not a
    flat rectangle of the wrong colour. Note `vsepr.js:89` falls back to
    `clientWidth || 320` / `clientHeight || 320`: a viewer rendering at exactly 320x320 is
    telling you the wrapper has no height. Chart units still owe this list their own number
    — a chart's usable aspect is not a 3D stage's.

13. **The rail must keep at least four `.ship-stock` rows in `.system-grid`.** §2.4 above
    reads as though the `systems` area is *either* per-quantity rows *or* a bespoke figure.
    It is not: `tests/unit5a-layout.test.mjs` fails every non-story state with
    *"only N of 4 system meters in the DOM"* when `.system-grid .ship-stock` is under four.
    A bespoke figure sits **alongside** four meters, spanning both columns
    (`grid-column: 1 / -1`), never in place of them — so the port also has to find four
    honest quantities in the unit's world-state. Unit 4's twelve slots gave three shares of
    the same twelve (labeled, flagged, cleared) plus one that is genuinely independent:
    *Right*, the share of the calls actually made that were right, which is the one number
    that can fall while the other three rise.

14. **A bespoke rail figure has to be height-capped, not width-driven.** `width: 100%;
    height: auto` on a 236×112 drawing takes ~170px out of a ~330px rail column at
    1536×726, and that pushed the move-in log clean off the viewport. Cap it —
    `height: clamp(58px, 8.5vh, 92px)` — and let it letterbox horizontally; a figure made of
    silhouettes loses nothing at 26px per cell. Related, and the bigger point: a figure
    drawn for a full-width worksheet page is the **wrong drawing** for a 230px rail. Unit
    4's shelf was redrawn from 520×168-with-mono-labels to 236×112-with-shapes, because an
    11px label in that column scales to five pixels. The detail moved into a per-slot
    `<title>` and the counts moved to the meters.

15. **Trap 9 is about the meter's VALUE as much as its label.** `.life-meter-label` is
    `flex-wrap: wrap` and at 1024×600 those cells are 115px, so "Labeled" + "0 of 12" wraps
    to two lines and the row goes from 54px to 73px. Four of those is 76px, which is the log
    off the viewport. Write `0/12`, not `0 of 12`, and keep labels to one word — "Right",
    not "Calls right" — with the full meaning in the row's `title`.

16. **`.chem-console .mystery-job-switcher` is a hard three-column grid**, because the
    prototype it came from had three drills. A bench with two pills leaves the third track
    empty and squeezes each pill into a third of the row; `.job-pill` is
    `white-space: nowrap`, so it cannot give, and the audit reports *"content 4px wider than
    its box"* at 1024px. Override `grid-template-columns` to the number of pills the bench
    actually has.

17. **An Honors sub-bench needs its own goal text in the console, and the mission screen has
    to follow recency for the SCENARIO as well as the verdict.** Trap 3 fixes the verdict; it
    does not fix the art. With only `modeVerdict` tracked, `activeArtId` always resolves to
    the core scenario of the bench, so the `h1`/`h2`/`h3` banners are authored and never
    drawn — which is the state Unit 1 shipped in: two banners it has never once shown. Unit
    4 keeps `screenOf[mode] = { sc, v, honors }`, and a commit claims its bench's screen
    while a regenerate releases it **asymmetrically**: a core "Next container" always takes
    the screen back, because the shell hides the console's `.brief` and the new container's
    goal is stated nowhere else; an Honors "Next bottle" does not evict a core outcome,
    because the Honors block states its own task beside its own controls
    (`units_new/04-bonding-geometry/js/main.js`, `claimScreen` / `releaseScreen`, and the
    `<p class="small muted" x-text="pi.sc.goal">` in each `.honors-block`). Doing this is
    also what makes those three banners worth the hour it takes to draw them.

18. **Every direct child of `.chem-console` occupies the shell's one grid cell.** A leftover
    progress panel or an Honors panel left as a direct sibling is not harmless off-screen
    content: it paints over the active bench. Remove duplicated progress chrome (the command
    header already owns it) and nest an Honors block inside its parent core panel, with the
    parent's own `overflow-y:auto` scroll port.

19. **A direct panel's internal scroll needs paint containment.** A long table can still
    increase `documentElement.scrollHeight` even when the panel computes to
    `overflow-y:auto`. Add `contain: paint` to the unit-local active-panel rule; this keeps
    the shell document fixed while preserving the panel's reachable inner scroll.

20. **Eight station tabs need a stricter short-label breakpoint.** Unit 8 switches to its
    short labels below 1600px and trims tab padding below 1120px. Test the actual short words
    as well as their `aria-label`s: a three-pixel overflow is still a real horizontal scroll.

21. **Closed native disclosures can confuse geometry audits.** Chromium may expose a closed
    `<details>` descendant with a box even though the learner cannot read it. For a
    collapsible rules list, explicitly set `.rules:not([open]) > ul { display:none; }` so the
    hidden reference cannot overlap the next interactive row.

22. **A Chart.js canvas inside a mastery-gated `x-if` must be destroyed before the gate
    removes its DOM node.** A chart at module scope is still the right architecture, but its
    instance retains the old canvas. Before Reset changes a gate from true to false, call
    `chart?.destroy(); chart = null`; when the gate opens again, call the existing chart-build
    path on `$nextTick` after the canvas exists. Otherwise a later Honors session can retain a
    detached canvas or fail to create a fresh chart silently. Unit 3's ionization-dip chart is
    the reference implementation.
