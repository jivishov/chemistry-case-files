# units_new · handoff index

**The migration is complete, and so is the cockpit refinement rollout.** All eleven units are
on the mission-cockpit shell, all eleven are in `BUILT`, and the hub's migration-temporary
notice has been deleted as its own section below instructs. All eleven now also carry the five
refinement patterns Unit 3 was the reference for — the column resizer, the commit row, the
Reference disclosure, the in-SVG label floor and the selection indicators. What that rollout
taught, the four tools it added under `units_new/tools/`, and the scroll it did not remove are
in [HANDOFF-COCKPIT-REFINEMENT.md](HANDOFF-COCKPIT-REFINEMENT.md) §8.

Gates: `chem 286, game 36, casefile 427, gauge 149, molezoom 64, art 114, periodic-trends 105,
scenario-coherence 138, notation 122`, and `cockpit layout: PASS - 1216 states clean across 12
builds`.

What follows is kept as the record of how it was routed, not as live instructions. The
class-A/class-B split, the per-unit costs and the *Recommended order* below are all in the
past tense now; the parts still worth reading are **Shared conventions** (which is how the
tree works, not how it was built) and the trap list in
[HANDOFF-PORTING.md](HANDOFF-PORTING.md) §4, which is the compounding asset and grew from
ten entries to twenty-two.

**How it was read at the time.** The units were not one job repeated ten times. They fell
into two classes whose *plans* were almost nothing alike, and picking the wrong plan for a
unit wasted days. Per-unit effort differed by roughly 2–3×; the class-A/class-B split was
about **what work existed**, not only how much.

---

## Status

| Unit | State | Class | Plan |
|---|---|---|---|
| 01 · Practices, Measurement & Matter | **done** | A | — |
| 02 · Atomic Structure & Theory | **done** | A | — |
| 03 · Periodic Table & Trends | **done** | A | — |
| 04 · Bonding, Nomenclature & Geometry | **done** | B | — |
| 05 · The Mole & Chemical Quantities | **done** | B | — |
| 05a · The Mole Lab | **skip — resolved below** | — | — |
| 06 · Reactions & Stoichiometry | **done** | B | — |
| 07 · Gas Laws & Kinetic Theory | **done** | B | — |
| 08 · Solutions & Solubility | **done** | B | — |
| 09 · Acids & Bases | **done** | B | — |
| 10 · Thermochemistry | **done** | B | — |
| 11 · Nuclear Chemistry | **done** | B | — |

Every class-B plan is a thin per-unit brief on top of one shared procedure:
**[HANDOFF-PORTING.md](HANDOFF-PORTING.md)**. Read that once, then the unit's own file.

## The two classes

**Class A — the unit has no Scenario layer.** Only Units 1, 2 and 3. These arrived as
worksheets: pools, tools, and a handful of ungraded checks. The job is to *build* the
assessment and consequence layer — scenarios, commits, verdicts, world-state — and only then
render it in the cockpit. Unit 1 took a full session.

**Class B — the unit is already retrofitted.** Units 4 and 6-11 already export `SCENARIOS`,
spread `createGame`, call `gRecord`, and run a world-state with verdicts. The chemistry, the
grading and the consequences all work. **The job is a presentation port**, plus one thing
that genuinely does not exist yet: the scene art.

Evidence for the split, reproducible from the repo root:

```bash
for d in units/*/; do printf "%-28s SCENARIOS:%s createGame:%s gRecord:%s\n" "$(basename $d)" \
  "$(grep -c 'export const SCENARIOS' $d/js/model.js)" \
  "$(grep -c 'createGame' $d/js/main.js)" "$(grep -c 'gRecord' $d/js/main.js)"; done
```

Units 01, 02 and 03 print zeros across the board. Everything else does not.

### Units 6–11 need no retrofit — that work is already done

This is worth stating plainly, because "retrofit" and "port" are easy to conflate. The
Scenario-layer retrofit of Units 6–11 happened **before** this tree existed:
`HANDOFF.md`'s Scenario-layer paragraph records the plan as *"U8/U9 and the non-gamified
units (1/2/3/4/6/7) retrofit to this; U10/U11 build with it"*, and the command above
confirms all six shipped it. So for 6–11 there is **no scenario design, no band tuning and
no commit-handler work left** — only the presentation port and the art. If a bench in one of
them looks like it needs new grading logic, re-read the index: you have probably mis-classified
the unit.

### How `RETROFIT-U1-U4.md` fits — and where it is stale

`RETROFIT-U1-U4.md` is the design source for the class-A units, and it **is** wired in: every
one of the U2, U3, U4, U6–U10 briefs cites it, and the class-A worlds come straight out of its
§3 — **"The Glow Room"** for Unit 2 (`HANDOFF-U2.md:*`), **"The Repair Bench"** for Unit 3
(`HANDOFF-U3.md:5`). Its §8 trap list still applies on top of the porting doc's own. Keep
reading it for *design intent*.

Do **not** read it for *status*. Three things in it have gone stale, and the second one will
mislead you:

1. **Its gate model no longer describes this work.** It plans to retrofit the `units/` tree
   in place, sequenced "Pilot U4, gate, then U3 → U1 → U2". `units_new/` instead builds a
   parallel tree and never touches `units/`, and the order here is the one under *Recommended
   order* below.
2. **"Gates 1-3 (U3, then U1, then U2) are NOT started" is misleading.** Unit 1's Scenario
   layer is **built and done** — in `units_new/01-practices-matter/` (15 scenarios). That
   sentence is true only of the old tree: `units/01-practices-matter/js/model.js` still
   exports no `SCENARIOS`, and it never will. All three class-A units are finished now:
   U1 first, then U2, then U3 last.
3. **Its test counts are stale and self-contradictory** — it says `chem 278` in one place and
   `chem 286` in another, and `casefile 234` against an actual 251. Use the counts under
   *Shared conventions* below.

One live dependency it flags correctly, and it is now a **standing risk rather than a
sequencing question**: **Unit 4 is "GATE 0 BUILT, awaiting sign-off."** Its Scenario layer is
complete and correct, and the port is done — but the sign-off still has not happened, and the
19 banners in `units_new/04-bonding-geometry/js/art.js` are drawn against those scenario ids
and that scenario copy. `SCENE_ART`'s key set is exactly `SCENARIOS`' key set, so a renamed
id silently drops a banner to `''` and the mission screen goes blank; changed goal or
consequence text can leave a banner illustrating a scene that no longer exists. If sign-off
lands with edits, re-run the contact sheet before believing the set still fits.

## The front door — `units_new/index.html`, built

**Status: done.** The tree has a hub and every unit links back to it. What follows is how it
works, because **every port has to touch it** (one line), and because the reason it is a copy
rather than a link is not obvious.

`units_new/index.html` is the hub: the `.cell-grid` of eleven unit cards from the repo-root
`index.html`, driven by `UNITS`, `COURSE` and `SEP` out of `shared/js/teks.js`, plus the SEP
standards table. It is a **copy, not a link to the old hub** — the root page hardcodes its
hrefs as `'units/'+u.slug+'/index.html'`, so pointing new unit pages at `../../index.html`
would have dropped the learner on a page that walks them straight back into the old build.

Four things differ from the page it was copied from:

- **hrefs are relative to the hub itself** — `u.slug+'/index.html'`, *not*
  `'units_new/'+u.slug+…`, which would resolve to `units_new/units_new/<slug>` and 404.
- **asset paths shift one level**: `../shared/css/…` and `../shared/js/teks.js`. The hub
  loads no `cockpit.css` — it is a card grid, and every class it uses already lives in
  `components.css`.
- **readiness comes from a local `BUILT` list**, and this is the trap worth knowing: **all
  eleven units are `status:'ready'` in `shared/js/teks.js`**, which describes the *old* build
  and is a protected file you may not edit. A verbatim copy would therefore have shipped
  eleven live cards with nine 404s behind them. `teks.js` stays the single source of titles,
  hooks, abbreviations and SEP rows; only `status` is overridden. The `.cell.is-planned` /
  "Soon" styling this needs already existed at `shared/css/components.css:259-261`.
- **a migration-temporary paragraph** under the grid says how many units have moved and
  links to the previous build, because nine "Soon" cards otherwise read as a broken page.
  It is `x-show="built < units.length"`; delete it when the count reaches eleven.

**Every port ends by adding its slug to `BUILT`** — that is the whole edit, and it is what
turns a finished unit from a "Soon" card into a live one. It also makes the hub the
migration's own progress board.

**The way home** is `.command-home` in `units_new/shared/cockpit.css`: the unit title in
`.command-brand` is an anchor to `../index.html`, which is the role the old shell gave its
"Tx Chemistry Case Files" brand link. It **wraps the title instead of adding a row**, for two
reasons that will still apply to the next unit:

- The header is height-critical — `min-height: 104px` and a two-row grid below 980px — so a
  fourth row in that grid is not available.
- `.command-brand span:last-child` (`:424`) styles the active-station line **by position**.
  Anything appended after it steals that styling, and any nested `<span>` anywhere in
  `.command-brand` can match it too. The anchor is not a span, and it sits before the station
  line, so both hazards are avoided. Verified: the rule still lands on the station line.

**Verification.** The hub cannot go into `tests/unit5a-layout.test.mjs` as-is — every
`TARGETS` entry is walked as `[...target.stations, target.story]` (`:364`) and a state whose
tab never opens is a hard failure (`:376`), so a page with no station strip and no Honors
switch fails every viewport. The header change *is* covered: the harness passes at **320
states across 3 builds** -- now **1216 states across 12 builds**, which is where it settled
with the tree complete; the figure rises with every registered build, so re-baseline rather
than matching it. It was 416 across 4 after Unit 4
joined the harness. For the hub itself, audit the eight `VIEWPORTS` directly. Two
checks worth calibrating before you trust a run, because both fire on the original hub too:

- `.cell .case-label` declares `nowrap` + `overflow:hidden` + `text-overflow:ellipsis`
  (`components.css:277-279`), so `scrollWidth > clientWidth` on it is *how ellipsis works*,
  not a clipping bug. Skip elements whose computed `text-overflow` is `ellipsis`.
- The cockpit's 14px font floor is not a landing-page rule. The hub's mono chrome (kicker,
  pills, case labels) is deliberately `--fs-xs` ≈ 12.5px.

With those two corrected, the hub is clean at all eight sizes: no horizontal document scroll,
grid reflowing 5 → 4 → 3 columns, 2 ready / 9 inert cards at every width. Vertical scroll is
expected here — a landing page scrolls, unlike a cockpit.

## What each class-B port actually costs

The work is dominated by one line item: **every retrofitted unit except 05 has no
`js/art.js`**, and the cockpit's mission screen is built around one 400×150 banner per
scenario. That mapping is exactly 1:1 — in every finished unit, `SCENE_ART` has the same
key set as `SCENARIOS`, no spares and no gaps.

**Banners are the budget.** In the two finished units, `art.js` runs 631 lines for 15 scenes
(U1) and 775 for 15 (U5) — call it **42–51 lines of hand-authored SVG per banner**. The
remaining tree is **133 class-B banners plus 36 class-A**, so on the order of 7,000 lines of
SVG. Budget the art first; it is the part that cannot be hurried and the part a reviewer sees.

| Unit | Banners | Tabs | Chart.js | three.js | Extra weight |
|---|---|---|---|---|---|
| 07 · Gas Laws | 13 | 5 | **yes** | **yes** | the only unit with both; + 4 `x-gauge` dials |
| 06 · Reactions | 15 | 6 | no | no | **no rendering libraries at all** |
| 09 · Acids & Bases | 16 | 7 | **yes** | no | one titration chart, Honors-gated |
| 08 · Solutions | 18 | **8** | **yes** | no | chart-central `curve` bench; **8 tabs — strip worst case** |
| 04 · Bonding | 19 | 6 | no | **yes** | the 3D geometry viewer (`shared/js/stage3d.js`) |
| 10 · Thermochemistry | 21 | 6 | no | no | hand-rolled SVG schematic, *deliberately* not a chart |
| 11 · Nuclear | 31 | 6 | no | no | largest art load; an extra core skill (`hl`) |
| — | | | | | |
| 03 · Periodic Trends | **12** | 4 | **yes** | no | two chart instances; **class A** |
| 02 · Atomic Structure | 21 | 5 | no | no | 6 existing `x-gauge` dials; **class A** |

Class-A banner counts were derived in their own briefs rather than guessed, and one of them
was wrong. U2's 21 is right: it has six core skills, not four (`HANDOFF-U2.md:39`), so
6 × 3 + `h1` + `h2` + `cap` = 21. U3 was estimated at "~15 from 3 core skills × 3 plus `h1`,
`h2`, `cap`" (`HANDOFF-U3.md:185`) — but that sum is **12**, and twelve is what U3 shipped.
The 15 was Unit 1's arithmetic carried across: Unit 1 has four core skills, so 4 × 3 + 3 = 15.
Worth noting as the pattern it is, since both class-A estimates were written by reading the
neighbouring unit rather than counting the skills in front of them.

A class-B port without art is perhaps a third of a session. With art it is most of one — and
for 11, with 31 banners, plan on more.

### There are two art systems, not one — and the case file's already exists

The banner count above covers the **mission screen**. The **Case File** carries its own
artwork, and it is easy to miss because it is a different mechanism:

- `CASE.stage` is **one animated inline `<svg>`** per unit, bound to `step` so it advances
  as the reader moves through the chapters, with a per-chapter caption in `steps[].cap`.
  `shared/js/casefile.js` owns the chrome and renders the stage inside `<figure class="cf-stage">`.
- It is **required, not optional**: `casefile.js:127` rejects a `CASE` whose `stage` is not a
  string containing `<svg>`.
- **Every unit already has one** — all eleven, U11's `case.js` being the largest at 417
  lines. So the answer to "will the new copy have images for its case?" is yes, and **you do
  not draw them.** `case.js` is copied whole and the stage comes with it. Confirm it survived
  the copy; do not budget art time for it.

So per unit: *N* new 400×150 banners to draw, plus one existing case stage to carry across
intact. Only the first is work.

**The one edit `case.js` does need** — and the reason it is not a pure copy — is `cta.call`.
Unit 1's went from `mode='measure'` to `setMode('measure')` for the cockpit shell. That is a
one-line change in a field the case-file suite validates, which matters because of the gap
recorded under *Shared conventions* below.

### Verify the library columns before trusting them

An earlier revision of this table was wrong in five rows, because a case-insensitive grep for
`three` matches the English word in "clear it **three** times in a row", which appears in
almost every unit. Only two things actually pull three.js — `js/vsepr.js` (U4) and
`js/gasbox.js` (U7), both via `shared/js/stage3d.js` — and a bare `three` specifier cannot
resolve without an **importmap**, which only those two units have. Chart.js arrives as one CDN
`<script>`; importing `shared/js/render.js` does *not* imply it (U6 imports only
`speciesColor` from it).

So test for the loader, never for the word:

```bash
for d in units/*/; do i=$d/index.html; [ -f "$i" ] || continue
  printf "%-28s Chart.js:%-4s three.js:%-4s tabs:%s\n" "$(basename $d)" \
    "$(grep -q 'chart.umd.min.js' $i && echo yes || echo no)" \
    "$(grep -q 'importmap'        $i && echo yes || echo no)" \
    "$(grep -c 'role="tab"' $i)"; done
```

Unit 10 is the trap worth naming: it looks like a charting unit and is not. Its own
`main.js:207` says so — *"Deliberately SVG rather than Chart.js: this is a labelled
schematic … and it needs no chart lifecycle"*. Do not add Chart.js to it during the port.

## Skip 05a-the-mole-lab — resolved, nothing to fold in

`units/05a-the-mole-lab/` is the reasoning-first fork of Unit 5 — the scaffold-fade ladder,
the gut-check gate, the misconception detector, the ARI audit. `unit5a-codex/` is that fork
moved into the cockpit shell, and `units_new/05-the-mole/` descends from that codex. The work
is done; porting 05a separately would add a fourth near-copy of Unit 5 to the tree.

Check it yourself before accepting this:

```bash
diff units/05a-the-mole-lab/js/model.js unit5a-codex/js/model.js | wc -l   # 9
diff units/05a-the-mole-lab/js/main.js  unit5a-codex/js/main.js  | wc -l   # 170
cat units/05a-the-mole-lab/js/case.js   # re-exports 05's CASE
```

**The old open question — "read the 170 lines; if any mechanic is missing, fold it in" — has
been closed. Nothing is missing, in either hop.** Both diffs were read line by line:

- **05a → codex is additive.** Beyond comments, paths and `unitId`, the codex only *gains*:
  the cockpit view-model getters (`activeBrief`, `activeVerdict`, `activeTone`, `activeArtId`,
  `activeStationName`, `activeStateLabel`, `activeOutcomeText`, `activeReference`,
  `coreSkills`, `teksMasteredCount`), `teksOpen`/`honorsJob`, a **new** `wrongUnit`
  misconception branch 05a does not have, a stricter rung-2 magnitude guard
  (`built.ok` rather than `built.cancels`), and the shared hex-lattice
  `createMoleZoom()` replacing an inline 300-circle grid. Nothing is dropped.
- **codex → `units_new/05-the-mole` is a pure rename/repath.** All 49 diff lines are header
  comments, `../../` → `../../../`, cache-bust query strings, and the `unitId` /
  `chem.lab.*` key. Every mechanic survives with identical occurrence counts
  (`wrongUnit` 3/3, `createMoleZoom` 4/4, `MISCONCEPTIONS` 10/10, `rungMiss` 6/6, …).

Note that `unit5a-codex/` is **not** dead weight to be cleaned up: it is one of the three
`TARGETS` in `tests/unit5a-layout.test.mjs` and must keep passing.

## Recommended order

Each step should add **one** new kind of risk. The two rendering traps are three.js and
Chart.js (trap 11/12 in the porting doc), and only U7 has both — so meet them one at a time
and let U7 be late, not early.

0. ~~`units_new/index.html` + the header back-link~~ — **done.** See *The front door*. What
   remains of it per port is one line: add the slug to `BUILT`.
1. ~~**04 · Bonding** (19 banners)~~ — **done.** It was the right unit to lead with: its
   three.js-but-no-Chart.js profile isolated the WebGL half of trap 12, which is now written
   up from what actually worked, and the port added five entries to the trap list (13-17).
   Two of those are worth reading before the next port even if nothing else is: the rail
   needs **four** `.ship-stock` meters whatever else you put in `systems` (13), and the
   Honors banners need the mission screen claimed by recency or they are drawn and never
   seen (17).
2. **06 · Reactions** (15 banners) — **no rendering libraries at all**, no canvas, no SVG
   stage. The cheapest possible end-to-end confirmation that the procedure is sound, with
   zero rendering variables. If 04 was noisy, this is the run that tells you why.
3. **09 · Acids & Bases** (16) — isolates the Chart.js half: one titration chart, and it is
   Honors-gated, so it is also the easiest chart lifecycle to reason about.
4. **08 · Solutions** (18) — Chart.js again, but chart-*central* (the `curve` bench is built
   on it) and **8 tabs**, the station strip's worst case.
5. **07 · Gas Laws** (13) — fewest banners of the set, but the heaviest rendering: both
   libraries plus four `x-gauge` dials. Cheap art, expensive plumbing; do it once both
   halves of the trap are understood.
6. **10 · Thermochemistry** (21) — no libraries, so this is pure port-plus-art at volume.
   It is also one of the retrofit's two reference implementations (the
   world-state-IS-the-chemistry pattern, `RETROFIT-U1-U4.md:45-49`), so its Scenario layer
   reads cleanly.
7. **11 · Nuclear** (31) — last of the class-B set, when the art pipeline is fast. Twice
   any other unit's art load.
8. **02, then 03** — the two remaining class-A builds. They are slower and more design-heavy,
   and they benefit from every trap the ports have added to the shared list.

Two notes on the ordering:

- **08's eight tabs are not blocked on anything.** The strip is already proven at seven by
  the finished `units_new/05-the-mole` (7 tabs), so 08 only has to clear the step from 7 to 8.
- **Steps 6 and 7 add no new rendering risk**, only art volume. If more than one person is
  working, 10 and 11 are the safe ones to run in parallel with the chart units.

If the goal is a demonstrable full tree soonest, do the class-B ports first as listed:
they produce working units far faster per unit of effort than 02 and 03 will.

## Shared conventions, wherever you start

- **Nothing in `units/`, `unit5a-codex/` or the repo-level `shared/` is ever modified** by
  work in this tree. Note the baseline: `git status` currently shows ~59 modified paths under
  those three directories, all of it pre-existing U1–U4 retrofit work (which deliberately
  edited `shared/js/chem.js` — `RETROFIT-U1-U4.md:90`). So **do not** try to prove this rule
  with git. Use the time-based check from the porting doc's gate 4:
  ```bash
  find units unit5a-codex shared -newermt "<the time you started>" -type f   # must be empty
  ```
- `units_new/shared/cockpit.css` is the shell, shared by every unit here. Unit-specific CSS
  goes in that unit's own `css/style.css`, which loads after it.
- `unitId: 'units_new/<folder>'`, so progress never collides with the old build's save.
- **Every unit links home**, and every port flips its own hub card on. The cockpit header
  carries `<a class="command-home" href="../index.html">` around the unit title — `../`, not
  `../../`, which is the old tree's hub — and the unit's slug goes into the `BUILT` array in
  `units_new/index.html`. A port that skips the second half leaves a finished unit
  unreachable from the front page. See *The front door* above.
- **`units_new/` case files are validated — the gap recorded here earlier is closed.**
  `tests/casefile.test.js` enforces the `CASE` schema, unique ids, one correct quiz option,
  no em-dashes, and **a well-formed `cta.call`**. It now carries a second list,
  **`NEW_TREE`** (`:57`), holding `new/01`, `new/04` and `new/05`; `ALL` (`:62`) is the union,
  and it is `ALL` that the schema, em-dash and `cta.call` gates walk. **Every port adds an
  import and a `NEW_TREE` row — never a `UNITS` row.** `UNITS` doubles as the uniqueness set
  (`:97-99`), and each `units_new` copy deliberately keeps its parent's `id` and `number`
  (both `04` builds are `water-bend-ice` / `004`), so a `UNITS` row fails two assertions.
  `HANDOFF.md`'s older wording — *"add it to the `UNITS` list in that suite"* — predates the
  split; follow `NEW_TREE`.
- Every unit adds a `TARGETS` entry to `tests/unit5a-layout.test.mjs` and must leave it
  green. **That test is not part of `npm test`** — it needs Playwright and its own run:
  ```bash
  npm test                                              # chem 286, game 36, casefile 427, gauge 149, molezoom 64, art 114
  PW_ROOT=../Lab_studio node tests/unit5a-layout.test.mjs   # must print "cockpit layout: PASS"
  ```
  Those five counts are current as of this writing and they drift upward as suites grow; a
  higher number with `0 failed` is fine, a *lower* one is a regression. Treat
  `RETROFIT-U1-U4.md`'s "chem 278 / casefile 234" as stale.
- Every unit gains a section in [README.md](README.md) in the same shape as Unit 1's.
- **Anything you learn that later units will also hit gets appended to the trap list in
  [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §4.** That list is the compounding asset here;
  it started at ten entries from Unit 1 and stands at seventeen after Unit 4.
- **Re-verify every number and line reference any document hands you, including this one.**
  The library table above was wrong for five units for exactly one revision because nobody
  re-ran the check.
