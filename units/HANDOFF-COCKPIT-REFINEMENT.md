# Cockpit refinement: what Unit 3 taught, and how it landed on the other ten

Unit 3 (`units_new/03-periodic-trends/`) was the reference build. It went from a cockpit with
three scrollbars, 6px labels and an invisible selected state to one that fits every bench on a
15in laptop with nothing hidden. §§1-4 are the record of what moved the numbers there.

**All six steps in §5 are now applied to all eleven units**, and so is §3's commit hint. §5
carries the survey and the order; §8 carries what the rollout itself taught, the tools it added,
and the residual scroll it did not remove; §9 covers the commit hint, the headless harness for
Units 4 and 7, and what §7 still lists as open. Read §8 before touching a bench.

Commits: `fa3b1c5` (Unit 3), `81f5954` (the rollout), `c8b46dc` (§9), `03182ec` (§8.5-8.6).
Baseline for every
number below:
**1536 x 690 CSS px** — Emil's panel (1920x1080 at 125%), which is the device the type scale is
tuned for; the layout gate reports it as 1536 x 726 because it measures the viewport rather than
the shell.

---

## 1. What changed, with the measurements

| | before | after |
|---|---|---|
| columns (job / bench / rail) | 419 / 661 / 404 px | 476 / 716 / 292 px, draggable |
| bench scroll — History / Families / Trends | 0 / 352 / 561 px | **0 / 0 / 0** |
| scenario prompt scroll | 57 px | 0 |
| action buttons | two stacked 627 px bars | two equal 338 px, one row |
| commit pair | 115 px + 88 px, ragged left | equal 148 px pair under a hairline |
| answer options | 3-across + 1 orphan | symmetric 2 x 2 |
| scene labels | 6.2–8 SVG units → **6–8 px on screen** | floor 8.0 → ~9.2 px, ~11 px at 31vw |
| Case File scroll | 565 px | 403 px |
| Case File title / hook | 33.6 / 18.9 px | 26.9 / 16 px |
| "Your call" choices | 479 px, left-aligned | 328 px, centred |

Where the shared work already landed: **`units_new/shared/cockpit.css`**,
**`units_new/shared/columns.js`**, **`shared/css/casefile.css`**, **`shared/js/casefile.js`**.
All eleven units already inherit the CSS. What each unit still needs is in §5.

---

## 2. The four bugs worth knowing about before you touch another unit

**A fixed grid track next to an auto-repeat with a percentage minimum is invalid CSS.**

```css
/* DEAD. Chromium drops the whole declaration and computes `none`. */
grid-template-columns: auto repeat(auto-fit, minmax(min(100%, 178px), 1fr));
```

This is why Unit 3's two action buttons rendered as stacked 627 px bars for months: not
styling, a dropped declaration. Nothing looked broken in the source. Use
`grid-auto-flow: column` with `grid-auto-columns: minmax(0, 1fr)` instead — it also stops
depending on how many actions a scenario has.

The single-repeat form on its own (`repeat(auto-fit, minmax(min(100%, 190px), 1fr))` with
no sibling track) is **valid** and used all over the tree. Do not "fix" it. Only the
combination with a fixed track is broken. As of this commit no unit carries the bad form —
`grep -rn "grid-template-columns:.*auto repeat(auto-fi" units_new/*/css/style.css` returns
nothing. Keep it that way.

**`cockpit.css` loads AFTER `casefile.css`, so a `.cockpit-shell`-scoped control style
overpaints the story panel.** A `.cockpit-shell .btn` rule (0,2,0) beats `.cf-btn` (0,1,0)
regardless of order, and it painted every dark Case File button with a white gradient.
Scope shell control styling to **`.workbench-grid`** and **`.cockpit-command`**. The story
is a sibling of `.workbench-grid` and brings its own palette; let it.

**A canvas inside a closed `<details>` measures 0x0 and Chart.js's ResizeObserver does not
reliably fire on the reveal.** Same failure `main.js` already documents for a
`display:none` panel. Put `@toggle="$nextTick(() => resizeCharts())"` on the disclosure.

**A `<summary>` that replaces a `.command-kicker` must keep the class.** The layout gate
exempts eyebrows from the 14 px floor by `closest('.command-kicker')`. Drop the class and
you get 88 legitimate failures reading `10.7px span "Reference"`. Keeping it is also
honest: it is the same chrome it was before it became a disclosure.

---

## 3. Dos

**Measure before you style, and measure the child blocks, not the panel.** The single most
useful number was per-child height inside the active panel. Families was 352 px over — and
`section.fam-card` alone was 552 px. That told us the decision block was fine and one
reference tool was the whole problem. Guessing would have shaved padding off everything.

**Reach for the pattern the unit already has.** Bench A (`How it developed`) had zero
overflow because its evidence lives behind `<details class="lesson-reference">`. Families
and Trends were drowning. Applying bench A's own pattern took both to zero. Look for the
bench in the unit that already fits and copy it.

**Spend width on the art, because width is the art's only scale.** A scene banner is a
400-unit viewBox at `width: 100%`. Its labels cannot be made bigger except by widening the
column or raising the authored size. Both, here: the left column went to 31vw and the
labels got a floor.

**Use a floor, not a multiplier, for in-SVG type.** A multiplier grows the caption too, and
a 48-character caption at 13.65 units overflows the 400-unit frame. `Math.max(size, FLOOR)`
in the `mono()` helper leaves the caption and the display numerals alone and moves the whole
small set together with one number to tune.

**Render every scene and look at it.** 8.0 was collision-free; **8.4 ran labels together**
("167 pm · 6.9 u190 pm · 23.0 u"). The difference is invisible in the source and obvious in
a 12-scene contact sheet. Script: render `SCENE_ART` into a stacked page at the real column
width and screenshot it.

**Give a boxed label an opt-out.** The tile mass subscript lives in the 7 units between the
symbol's baseline and the tile's bottom edge. The floor printed it through the symbol. One
`boxed: true` flag is cheaper and clearer than lowering the floor for everyone.

**Carry a state on more than one channel.** The selected option now shows a filled radio,
a pressed face, an accent fill and accent ink. The tick/cross after a commit matters most:
a green dot and a teal dot are the same *shape*, so the verdict would have been hue alone.

**Say why a disabled control is disabled, in the row where it lives.** "Make the call" gates
on an answer *and* an action. A dead primary button with no reason beside it was the highest-
load moment on the bench. Gate the hint on `!ready && !checked` — `*Ready` is false both
before the picks and after the commit, so `!ready` alone brings the hint back on top of the
verdict.

**Make a novel affordance visible at rest.** Nothing else in the shell is draggable, so the
gutter handles show a faint 3-dot grip always, with the full rule appearing on hover. An
invisible control is not a control.

**Put the drag gutter where the gap already was.** Two 12 px gutter *tracks* with `gap: 0`
cost the layout nothing versus one 12 px `gap`. Adding a handle beside the gap would have
taken 24 px from the bench.

**Store what rendered, not what was asked for.** `cockpit.css` clamps each side track with a
vw ceiling, so a drag the JS allowed (802 px) could render at 645 px. Read the width back
after the write, or the saved preference is a number the page can never reproduce.

**Guard every measurement on a laid-out box.** The shell starts under `x-cloak`, so at mount
every rect is 0, a ceiling computed from a 0-wide grid is negative, and the restore clamps
both columns to their floors *and* saves those floors over the user's split. A preference
eaten by its own restore. `ResizeObserver` on the grid is the right trigger — it fires when
the box first exists and on every reflow after.

**Delete the rule you superseded.** Four rules in Unit 3's stylesheet were fully replaced by
the new selection block. Leaving both would mean two places to change one state.

**Run the layout gate after any shared-file change, and run it more than once.** It caught
every regression in this work, including two from other sessions. Random-content benches
(Unit 9 picks its acid at runtime) mean a single green run is not proof.

```bash
PW_ROOT=../Lab_studio node tests/unit5a-layout.test.mjs
```

Narrow it while iterating:

```bash
PW_ROOT=../Lab_studio LAYOUT_TARGETS=units_new/03-periodic-trends LAYOUT_VIEWPORTS="primary 15in @125%" node tests/unit5a-layout.test.mjs
```

---

## 4. Don'ts

**Don't `git checkout <file>` to undo one block.** It cost a full rebuild of ~350 lines of
`cockpit.css` in this session. Revert the block, or write the block to a scratch file first.

**Don't go below 14 px for anything a student reads.** `--fs-sm` is 0.88rem = 14.08 px and
that is the floor the gate enforces inside `.chem-console > .panel.is-active`,
`.mission-screen`, `.cf-narr` and `.cf-quiz`. Make things quiet with **ink**, not size —
`.phase` shrank `(s)` and `(aq)` to 12.4 px, and `(aq)` versus `(s)` is that bench's
chemistry, not a footnote.

**Don't cap prose with `ch` inside a panel that is already padded.** The Case File hook had
`max-width: 62ch` in a 1462 px panel, so it broke mid-screen with empty space to its right.
Give the text a **column** whose edge is the measure — here, a row shared with the stats.

**Don't size a column's contents against the viewport once the column is a fixed width.**
`.life-header strong` was `clamp(1rem, 1.45vw, 1.25rem)`. When the rail stopped growing with
the window, the title kept growing: at 1366 it hit 19.8 px in a 260 px column, wrapped to
three lines, and pushed the bench log out of the panel.

**Don't let `overflow-y: auto` alone clear the clip check.** The gate's clipper list tests
all three overflow properties, so `overflow-x: hidden` keeps the element a clipper. Declare
the port in that build's `TARGETS.scrollPorts` — that is the mechanism, and Units 1, 2, 4, 5
and the prototype all use it.

**Don't assume a scrollbar is a styling problem.** All three Unit 3 benches fit after moving
*three blocks*, with no type shrunk to achieve it. Find the tall block first.

**Don't leave a trailing gap unexplained.** With the reference tools folded, the Families
bench has ~250 px of empty panel. That is deliberate — it is where the verdict lands on
commit — but it is a real trade against the scrollbar, and the next person deserves to know
it was chosen.

**Don't trust a bounding-box centre for an occlusion probe.** A wrapped inline paints two or
more line boxes and `getBoundingClientRect()` returns their *union*, whose centre lands in
the gutter between the lines where a neighbouring inline legitimately sits. That reported
Unit 9's "muriatic acid, poured for concrete" as hidden behind a `<strong>` while every pixel
was on screen — 7/18 runs at the new column widths, 0/18 at the old. The gate now probes each
`getClientRects()` box, which is stricter as well as truer. If you write a geometry check,
iterate line boxes.

**Don't let authored narrative assert what the runtime draw does not guarantee.** Unit 3's
trends bench asked for an Al-against-Cl reading and then offered "Fit the lithium cell" —
because the pair was generated from the whole table while the actions were hardcoded. Name
each thing in exactly one place: each action now carries its own `sym` and `main.js` builds
the pair from those. `tests/scenario-coherence.test.mjs` is the gate for this whole class.

**Don't commit from this repo root without a pathspec.** It is a monorepo — 371 files were
dirty across `Lab_studio`, `RoboStudio`, `teacheraide_rfx-main` and others, none of it this
work. Stage explicit paths and verify:
`git diff --cached --name-only | grep -cv "^Chem_simulations/"` must print `0`.

---

## 5. Applying it to the other ten

Everything in `units_new/shared/cockpit.css`, `shared/css/casefile.css` and
`shared/js/casefile.js` is live in all eleven units. So, now, are the first five per-unit steps:

```bash
node units_new/tools/cockpit-survey.mjs        # the table below, read off the tree
node units_new/tools/cockpit-survey.mjs --md   # the same rows as markdown, to paste here
```

| unit | resizer | `call-row` | reference `<details>` | `LABEL_FLOOR` | labels < 8 units |
|---|---|---|---|---|---|
| 01-practices-matter | ✅ | ✅ | ✅ | ✅ | done |
| 02-atomic-structure | ✅ | ✅ | ✅ | ✅ | done (1 boxed) |
| 03-periodic-trends | ✅ | ✅ | ✅ | ✅ | done (1 boxed) |
| 04-bonding-geometry | ✅ | ✅ | ✅ | ✅ | done |
| 05-the-mole | ✅ | ✅ | ✅ | ✅ | done |
| 06-reactions-stoichiometry | ✅ | ✅ | ✅ | ✅ | done |
| 07-gas-laws | ✅ | ✅ | ✅ | ✅ | done |
| 08-solutions | ✅ | ✅ | ✅ | ✅ | done |
| 09-acids-bases | ✅ | ✅ | ✅ | ✅ | done |
| 10-thermochemistry | ✅ | ✅ | ✅ | ✅ | done |
| 11-nuclear | ✅ | ✅ | ✅ | ✅ | done |

"done" means the unit's `mono()` carries the floor, so every un-boxed label clears it; the
count in brackets is the declared `boxed: true` opt-outs. The survey also reports it if in-SVG
type ever escapes `mono()` — each unit has exactly one `<text` site today, and that is what
makes the floor a one-line change per unit.

**The order it was worked in, cheapest and safest first.** Kept because it is the order to use
again, on a twelfth unit or on any of these if a bench is rebuilt.

1. **Resizer** — one import line plus `mountColumnResizers()` after `Alpine.start()`. Nothing
   else in the unit needs to know. Zero risk; the CSS is already there. Two bootstrap shapes
   exist in the tree (a deferred `Promise.all` and plain static imports); both take the call in
   the same place, after `start()`.
2. **`call-row`** — add the class to each commit row. Pure CSS effect, no state. 81 rows across
   the eleven units. A row that also holds the answer field (Units 6, 7, 8, 11) gets it too: the
   hairline then separates the work above from "your call", which is what those rows say.
3. **Label floor** — copy the `LABEL_FLOOR` + `boxed` pattern into that unit's `art.js`, then
   run `label-collide.mjs --vs HEAD <unit>` and fix what it reports. §8.1 and §8.3 are the how;
   the short version is that the floor is 8 in all eleven units and the tuning happens at the
   call sites, not on the number.
4. **Reference `<details>`** — three lines of markup, but check that unit's height media
   queries first: four units were *dropping* the card outright below 760px, which is not the
   same thing as the learner folding it (§8.4).
5. **Selection indicators** — Unit 3 uses `.opt` / `.pair`; the other ten use `.choice`. The
   port lives in `shared/cockpit.css` scoped to `.cockpit-shell .workbench-grid .choice`, three
   classes deep so it outranks the four units that set `.something .choice { padding }` from a
   later stylesheet, and inside `.workbench-grid` so the Case File's own dark controls are
   untouched — as is the legacy `units/` tree, which loads `components.css` but has no cockpit.
   Two modifiers go in the markup: `.choice-multi` for a real multi-select, `.choice-tight` for
   a cell too narrow for a leading ring (§8.3).
6. **Per-bench scroll** — measure child block heights first (`cockpit-measure.mjs --blocks`),
   then move the tallest reference block behind a disclosure. Unit-specific; no shared fix
   exists, though `.lesson-reference` is the shared door now. §8.5 is where this landed.

**After each unit, both gates:**

```bash
npm test
PW_ROOT=../Lab_studio LAYOUT_TARGETS=units_new/<unit> node tests/unit5a-layout.test.mjs
```

---

## 6. Verification recipes that worked

The in-app Browser pane is unreliable here (screenshots time out, the viewport collapses).
Everything in this pass was verified with Playwright from `../Lab_studio/node_modules`,
serving the repo on an ephemeral port — the same harness `tests/unit5a-layout.test.mjs` uses.

The first four recipes below are committed tools now; see §8.1 for the commands. What follows is
still worth reading, because it says what each one is FOR.

- **Geometry** — one `page.evaluate` returning column widths, `scrollHeight - clientHeight`
  per panel, and computed font sizes. This is what turned "it looks cramped" into "the rail is
  404 px and the bench scrolls 488".
- **Per-block heights** — map over `panel.children`, print height and class. Finds the tall
  block in one shot.
- **Scene contact sheet** — import `SCENE_ART`, render all banners into one page at the real
  column width, screenshot full-page, and look at it.
- **State walk** — click through untouched → one pick → both picks → committed → committed-wrong
  and screenshot the panel at each step. Scope selectors to `.panel.is-active`; every bench's
  markup is in the DOM at once and `.opt-grid .opt` resolves to a hidden panel's button.
- **Interaction** — drive the drag handles with `mouse.down/move/up`, then reload and assert
  the split came back. That is how the `x-cloak` measurement bug surfaced.
- **Flake bisection** — when a gate fails on random content, run the failing target N times
  and compare against the old geometry injected via `addStyleTag`. 7/18 versus 0/18 is an
  answer; one run is not.

---

## 7. Known-open

- **Trailing panel space.** With reference tools folded, benches show ~250 px of empty panel.
  Deliberate (it is where the verdict lands), reversible in one line if the scroll is preferred.
- ~~**`.call-hint` is only on Unit 3's three benches.**~~ **Closed** — 74 of the 84 commit rows
  carry one, and §9.1 says which ten do not and why. `units_new/tools/hint-check.mjs` is the
  gate.
- **Residual per-bench scroll on ten of 58 benches**, six of them under 60px (§8.5). Down from
  2,496px of bench scroll to 1,081. The four over 100px each have a structural reason recorded
  beside them; §8.6 is what closed the rest and why.
- **The `unit5a-codex` prototype did not get any of this.** It is the twelfth build in the
  layout gate and it is on the same shell by shape, but it carries its own copy of that shell in
  `unit5a-codex/css/style.css` and never loads `units_new/shared/cockpit.css` — so its seven
  `.choice` controls still have the flat non-state, and none of the five patterns reached it.
  Either it stops being a reference (it has served its purpose) or the duplicate shell goes and
  it links the shared one. Leaving it as a build that looks like the eleven and behaves like the
  old ones is the worst of the three.
- ~~**Unit 4 and 7 cannot be driven headlessly**~~ **Closed** — `tests/helpers/three-resolve.mjs`
  maps the bare `three` specifier to a stub, so both units run their real generators in
  `tests/scenario-coherence.test.mjs` now. §9.2.
- **`.github/workflows/project-relay-release.yml`** was staged before this session and is
  unrelated; it was unstaged and left on disk untracked.

---

## 8. The rollout: what the other ten taught

### 8.1 Six tools, because ten units is not one unit

§3 says "render every scene and look at it", and that is right for twelve scenes. It does not
scale to ten units and the 184 banners they draw, and a contact sheet cannot tell a collision
the floor CAUSED from one the drawing always had. Everything here lives in `units_new/tools/`.

```bash
node units_new/tools/cockpit-survey.mjs                    # §5's table, read off the tree
node units_new/tools/hint-check.mjs                       # every commit row explains itself (§9.1)
node units_new/tools/scroll-table.mjs                     # §8.5's table, read off the tree
node units_new/tools/cockpit-measure.mjs 08-solutions --blocks
node units_new/tools/cockpit-measure.mjs 08-solutions --walk "Molarity"
node units_new/tools/label-collide.mjs --vs HEAD 08-solutions
WIDTH=476 node units_new/tools/contact-sheet.mjs 08-solutions
REF=fa3b1c5 node units_new/tools/floor-compare.mjs 11-nuclear
```

- **`cockpit-survey.mjs`** regenerates §5's table from the files. A hand-kept table is wrong by
  the second unit.
- **`cockpit-measure.mjs`** is §6's geometry and per-block recipes as one command: three column
  widths, `scrollHeight - clientHeight` for the bench / prompt / rail, every child of the active
  panel tallest-first, and the smallest instructional font size. `--walk` is §6's state walk.
  It descends through single-child wrappers first, because several benches wrap everything in one
  anonymous `<div>` and listing that div reports the panel height back at you.
- **`label-collide.mjs`** lays out every label in every banner and reports the ones that crowd
  each other or leave the 400x150 frame — and with `--vs HEAD`, only the ones that are new. Two
  labels are crowded when their boxes cross on one axis and come within 1px on the other. That
  rule is not a guess: it is what separates Unit 3 at its tuned floor of 8 from the same unit at
  8.4, and the pair §3 names by hand (`c-cell`'s "167 pm" over "6.9 u", clearing by 1px at 8 and
  0px at 8.4) is the pair it reports. It compares two labels on the same tilted sheet in the
  sheet's own space, because their axis-aligned screen boxes inflate by width x sin(tilt) and
  read as touching when they are parallel lines.
- **`floor-compare.mjs`** renders each banner twice, side by side, from a git ref and from the
  working tree. For when the numbers say "changed" and you need eyes on which.
- `contact-sheet.mjs` now takes `WIDTH`. 400 is 1px per viewBox unit, which is the scale a
  collision is a collision at; 476 is the mission column at its authored 31vw on Emil's panel,
  which is the scale to judge legibility at.

### 8.2 What the rollout moved

| | before | after |
|---|---|---|
| units carrying all five patterns | 1 of 11 | **11 of 11** |
| cache keys on one shared stylesheet | 5 (`u2`, `w2`, `u3-4`, `u10-1`, none) | **1** |
| units where the Reference card was unreachable on a laptop | 4 | **0** |
| commit rows with a hairline and one key width | 3 | **81** |
| in-SVG labels authored below the 8-unit floor | 455 of 733 | **0 un-boxed at render** |
| new label collisions caused by the floor | — | **0** across ten units |
| Unit 2 "Build an atom" bench scroll | 1045 px | **362** |
| Unit 2 "Electron configuration" bench scroll | 583 px | **477** |
| Unit 7 "Kinetic theory" bench scroll | 547 px | **426** |
| Unit 7 "Ideal gas law" bench scroll | 381 px | **41** |
| Unit 1 "Accuracy vs precision" bench scroll | 326 px | **146** |

### 8.3 New dos

**One shared file, one cache key.** `shared/cockpit.css` was linked with five different `?v=`
strings across eleven units, which is five cache entries for one stylesheet — and it means a
shell change reaches only the units that happened to bump. Unifying it is not tidying; without
it, half of this work would not have reached a returning student. Both shared files carry
`?v=cockpit-3` now, and they move together because they are one mechanism.

**A closed disclosure still has boxes. Say `display: none` to its body.** Chromium puts
`content-visibility: hidden` on `::details-content`, which stops the subtree painting but leaves
every descendant a laid-out box. Folded, the Reference card measured 23px while each `.ref-item`
still reported 553x21 fifteen pixels past the card's own bottom edge, over the readout below.
Nothing was visible; a screenshot was clean; the rows were not hit-testable. The layout gate was
right anyway, and this was latent in Unit 3 from the day that card became a disclosure — its own
stylesheet had already found the same thing for `.lesson-reference` and written the fix, for
`.lesson-reference` only. Both rules sit next to each other in `shared/cockpit.css` now.

**A fold needs a body element to hang the rule off.** You cannot hide a light-tree child of a
closed disclosure without also hiding the summary, so the rows moved into
`.screen-reference-body`. That is the shape `.lesson-reference-body` already had.

**Tune a floor against a measurement, not a memory.** `label-collide.mjs --vs HEAD` turned "does
this collide" into "did I cause it". Across ten units at floor 8 it reported 28 new crowds; every
one was a real 1-to-2px problem, and fixing them also cleared five that predated the floor. The
alternative — lowering the floor until a contact sheet looked clean — would have traded the
legibility of 455 labels for about a dozen tight spots.

**Two kinds of fix for a crowded label, and the drawing decides which.** Where the geometry had
room, the baselines moved apart: a bottle label's two lines went from 9.5 units of leading to 11,
a ruled form's rows from 12 to 14, a weighing beam's average readout up two units out of the
caption strip. Where the box genuinely has none, `boxed: true` — a DOT placard drawn at 11 to 13
units is smaller than the floor is wide, and an energy-level rung label is sized by the ladder
whose whole point (its own comment says so) is that n=3, 4 and 5 stay separate lines.

**A multi-select behind a single-select class needs a checkbox.** Unit 6's second classify
question is "which of these ALSO apply? Select every one that does" — the same `.choice` class as
every radio group in the tree. A filling ring there would be a lie about the affordance, so
`.choice-multi` draws a rounded square and a tick. Everything else about the state is identical,
because after the commit the question is the same one.

**A cell too narrow for a leading indicator takes it in the corner.** A five-across
significant-figure keypad has room beside its digit; an eight-across valence pad (80px) and a
strong/weak toggle (77px) do not. `.choice-tight` moves the indicator to the corner and reserves
room on *both* sides, so a centred label stays centred. Declared per site with a class, the way
`boxed: true` is: a narrow cell should be a decision somebody made.

**Float the indicator when the button's children stack.** Unit 3's `.opt` is always a single text
node, so a two-column grid works. `.choice` is sometimes a stack of elements — a mono tag over a
hint, a pack name over how it feels, an isotope over its note — and a grid column would restack
them. A float shortens the line boxes beside it and leaves every other box alone, so the indent
lands on the first line, the card's title keeps the dot, and the body stays flush. It also needs
no knowledge of the button's padding, which four units override from a later stylesheet.

**A smaller scroll number is not automatically a better bench.** `cockpit-measure.mjs` reported
"Build an atom" at 334px and called it a 68% win. The layout gate, on the same tree, reported
`div.stepper content 93px wider than its box` at six viewports — the panel was shorter because
its controls had been squeezed past their own minimum, not because anything fit. The measurement
tools here answer "how tall"; only the gate answers "is it still whole". Run both, and run the
gate last.

**Promote the chrome the moment a fourth unit needs it.** `.lesson-reference` and its summary
were Unit 3's; Units 1, 2 and 7 needed the same door for an accuracy figure, a model history,
five postulates and a gas-law table. It is in `shared/cockpit.css` now, and so are `.call-hint`
and the 40px commit-key floor, which were properties of a row that is shared.

### 8.4 New don'ts

**Don't drop a card at a height breakpoint and call it folding.** Units 6, 9, 10 and 11 hid the
Reference card outright below 760px of viewport (960px in Unit 9's case) — which is every laptop
in the gate's matrix. The standing facts were not reachable at all. Deleting those blocks let the
shell's own thresholds apply (move at 699px, hide at 639px), and then the measurement decided the
default: open, the card is 150 to 170px in those four units and the scenario prompt scrolls 20 to
188px; closed, it is 23px and nothing scrolls. So those four ship closed, the other seven ship
open, and each says why in its own markup. §5 step 4 warns about this and it is worth restating —
the shell deciding there is no room and the learner deciding they want the room elsewhere are two
different things, and only one of them is reversible by the learner.

**Two identical-looking pins, and only one was a mistake.** Unit 2's `.chem-console .a-row` and
`.chem-console .stepper-grid` were both `grid-template-columns: minmax(0, 1fr)`, and that first
line is why "Build an atom" scrolled 1045px: a 280px Bohr model and a 260px control side stacked
in a 694px column when they fit side by side twice over. Unpinning it with
`repeat(auto-fit, minmax(min(100%, 260px), 1fr))` — the arithmetic done against the column's real
width, so a drag is answered too — took that bench to 362.

Unpinning the stepper-grid the same way broke it, at six of the eight viewports. Its own comment
said why, two lines above the rule, and it was worth reading rather than replacing: a stepper's
`−`/value/`+` row has a hard min-content width, `.stepper` carries `min-width: 0` so the track
never grows to meet it, and two tracks inside the a-row's half came out 93px narrower than the
controls they held. Nothing looked wrong in a screenshot of the default split; the gate reported
`div.stepper content 93px wider than its box` at 1536, 105 at 1366, 83 at 820, and the stepper's
sub-label painting over the drag handle. That pin costs 263px of panel on purpose.

The lesson is not "don't pin" and not "always pin". It is that a one-column override inside the
console is either a fit decision or a min-content decision, the two are indistinguishable from
the declaration, and the comment above it is the only place the difference is written down. Both
rules now say which they are.

(§2's dead declaration is a different thing again: a FIXED track beside an auto-repeat with a
percentage minimum. The single-repeat `minmax(min(100%, N), 1fr)` used above is valid.)

**Don't leave a three-across readout inside a half-width column.** `shared/css/components.css`
says three gauge cards need 186px each and says why. Inside the 398px half of a split they became
514px of stacked column; as a full-width sibling of the split they are one 231px row. Moving two
blocks out of `.a-side` was worth 355px of it.

**Don't make prose work around a checker's bug — fix the checker.** `tests/tagcheck.cjs` counted
tag names by regex over the raw file, so a tag NAMED in a comment read as an unclosed tag. Unit 3
reported `button 34 33` from a sentence about its two gutter buttons; Unit 4 had reported
`svg 2 1` and `g 2 1` since it was written, from an eight-word note explaining that its shelf
drawing is injected on a `<g>`. The first instinct was to reword the sentence, which is how a
tool's bug becomes eleven files' problem. It strips HTML comments, `/* */` blocks and
line-initial `//` comments before counting now — line-INITIAL, because stripping `//` anywhere
would eat every `https://` on the page — and it takes several files at once, which is how it was
always being called. All 23 pages in both trees are balanced, and a deliberately deleted
`</svg>`, `</g>` and `</template>` are each still reported, because a checker that cannot fail is
worse than none.

### 8.5 Residual scroll, measured

```bash
node units_new/tools/scroll-table.mjs        # the table below, and the tallest block in each
node units_new/tools/scroll-table.mjs --md   # the same rows as markdown, to paste here
```

Ten of 58 benches still scroll at 1536x726 with Honors off, and six of those ten are under 60px
— one line. The tree went from 2,496px of bench scroll to 1,081.

| unit | bench | scroll | tallest block |
|---|---|---|---|
| 02 | Electron configuration | 301 | `section.work-order` 230px |
| 07 | Kinetic theory | 265 | the 189px particle box over a 212px pair of gauges |
| 02 | Build an atom | 212 | `div.a-row` 322px — a 280px Bohr model |
| 02 | Average mass | 121 | `section.work-order` 250px |
| 07 | Ideal gas law | 60 | — |
| 02 | Emission spectra | 45 | `svg` 124px, the spectrum band |
| 01 | Accuracy vs precision | 41 | `div.lab-row` 338px |
| 11 | Identify the source | 19 | — |
| 01 | Density lab | 11 | — |
| 04 | Forces & properties | 6 | — |

Every one is inside a declared `scrollPorts` entry, so nothing is clipped and the document never
scrolls. The four over 100px each have a reason that is structural rather than sloppy:

- **Electron configuration** carries two independent decisions, the configuration order and the
  family-behaviour order. That is deliberate and `tests/scenario-coherence.test.mjs` CC-19 pins
  it — "two live orders on one bench, each satisfiable, each revealing only its own grid" —
  so splitting it into two stations would delete a tested feature, not fix a defect.
- **Kinetic theory** is a rotatable particle box over two live instruments. Both are the bench.
- **Build an atom** is a 280px Bohr model beside three steppers, over three live readouts.
  Shrinking the model drops its nucleus labels below where they read, which is the trade §3
  spent a whole section refusing.
- **Average mass** has a 250px decision block (goal, assay, input, commit pair, hint) and a
  600-unit number line that cannot be narrowed without taking its labels under the floor.

### 8.6 What actually closed the gap

Six moves, in order of what they were worth. The pattern in all of them: a block that is not
the decision, taking height it does not need.

**The compaction breakpoint, which was off by seven pixels.** The shell drops paddings, gaps and
control heights below a viewport height bound, and that bound was `max-height: 719px`. Emil's
panel is 1536 x **726**. So on the one device the type scale is tuned for, the compaction never
fired: every bench in every unit ran at full padding, and several scrolled for want of 30px. It
is `819px` now, which pairs it with the `min-height: 820px` blocks that were already there —
above that a tall viewport buys rows and type steps up, below it spacing yields. One boundary,
two behaviours. That change alone closed two benches and took 30 to 65px off every other one.

**An instrument that has nothing to read yet.** Unit 2's Average mass showed a 212px gauge
reading "entered average —" before the learner typed anything. It appears with the first digit
now, which is what the spectra bench two panels down already did. Same for the sentence that
summarises the atom you built (70px, and true from first paint) and the note that confirms the
weighted average matches (70px, also true from first paint, because the sliders load at natural
abundance). All three land with the call.

**A 280px control alone on a 716px row.** Three benches in Unit 2 stacked an element `<select>`
above the readout it drives, with 400px of empty panel beside both. Side by side they cost one
row instead of two. The same shape fixed the line-chips and the energy field on the spectra
bench: "pick a line, then type its energy" is one instruction, so it is one row.

**Cards that stacked for readability, and were wrong about it.** Unit 11's four emission choices
spanned the full 682px bench, one per row, with a comment saying they stacked so their evidence
stayed readable. But 682px of body type is about 95 characters to the line — past the comfortable
measure, not short of it. Two columns of 337px read at about 47 characters and cost half the
height: 316px of cards became 172. Better typography *and* the fix, which is worth noticing,
because the comment had it exactly backwards.

**A 150px instrument in a full-width wrapper.** Unit 1's accuracy dial sat in its own block under
a stat row that had room for a third card. Moving it in cost 97px less. The first attempt made it
*worse* by 20px: adding `.has-dials` raised the track floor from 150px to 186, which put three
cards on two rows in a 538px column. The class is for a row of three gauges in a full-width
panel, not for one gauge sharing a row inside a split.

**Duplication, removed rather than shrunk.** Unit 7's third gauge card read "PARTICLES 40" under
a slider whose own label already read "Particles 40", and its dial was a linear 5-to-100 scale
that added nothing the number did not say. Two cards also let each remaining caption sit on one
line instead of two.

**One trap worth writing down.** Two of the visibility gates above were written against
`buildChecked` and `massChecked`, which this unit does not have — it records a commit as
`modeVerdict[stage]`. A throwing `x-show` in Alpine leaves the element hidden, so the bench got
*shorter*, every measurement agreed, and `tests/unit5a-layout.test.mjs` passed 1216 states clean.
`units_new/tools/hint-check.mjs` caught it, because it fails on any console or page error as well
as on what it can see. A layout gate cannot tell "correctly hidden" from "threw on the way to
being shown"; something has to watch the console.

---

## 9. Closing the rest of §7

### 9.1 The commit hint, on every gated row

§3's "say why a disabled control is disabled, in the row where it lives" now holds across the
tree: **74 of the 84 commit rows carry a `.call-hint`**, and the ten that do not are the ten
where nothing is missing — two buttons that are always live (Unit 2's build and configuration
certifications) and eight whose only gate is a done-or-already-shown flag, so the key is live
until it is used. A hint that never appears is a hint nobody trusts, so those rows say nothing
rather than something vacuous.

Three rules the wording follows, in order of how often they mattered:

**Name the first missing thing, not the list.** A learner who has typed the number and not yet
picked the action needs to be told about the action. So a two-part gate gets a two-stage
expression — `dDensInput === '' ? 'Work out the density first.' : (!dPick ? 'Now name the
metal.' : 'Now choose what happens to the sample.')` — and a three- or four-part gate keeps
going. Unit 8's batch run has four stages and reads like one.

**Count, when the missing thing is a set.** Unit 8's precipitation bench gates on `prCls`, an
array with one entry per product. Naming a species would be wrong (which one?), so it reports
`prCls.filter(c => c === null).length + ' still unmarked.'`

**Gate on `!missing && !done`, never on `!ready` alone.** §3 says why and it is worth repeating
because every one of these 74 could have got it wrong: a `*Ready` getter is false *both* before
the picks and after the commit, so `x-show="!ready"` brings the hint back on top of the verdict
the learner just earned.

Unit 3's own two Honors benches were missing the hint its three core benches have. They have it
now, with the same two-stage wording.

**`units_new/tools/hint-check.mjs` is the gate for this.** It walks every station of every unit
with Honors off and on, and reports three things: a disabled primary key with no visible hint
beside it, a hint that renders empty (an expression that evaluated to nothing), and a hint still
showing after the key went live. It also fails on any console or page error, which is what a
typo inside an `x-show` actually produces — Alpine throws, the span never appears, and the
symptom is silence. That is how all 74 expressions were checked rather than eyeballed.

```bash
node units_new/tools/hint-check.mjs      # "every commit row accounted for"
```

One trap it found in itself, worth knowing before you read its output: a locked Honors block
keeps its button in the DOM unpainted, so a naive probe reports every gated Honors bench as
mute. It skips rows whose key has no height.

### 9.2 Units 4 and 7 are driven now

§7 recorded that these two could not be driven headlessly: `main.js` reaches `./vsepr.js` and
`./gasbox.js`, both of which `import * as THREE from 'three'` — a bare specifier the page
supplies through an importmap and bare node cannot resolve. Two of eleven units had their
generators asserted against `model.js` text instead of being run.

`tests/helpers/three-resolve.mjs` is a resolution hook that maps `three` and `three/addons/` to
`tests/helpers/three-stub.mjs`, registered from the test itself so `npm test` needs no flags and
the reason sits next to the assertions that depend on it. It is enough because nothing in those
two modules touches THREE at module scope: every use is inside a mount step the harness never
reaches, since `$refs` is absent and the viewer takes its `if (!el) return` branch.

**The stub's classes all throw when constructed, deliberately.** That is the difference between
a stub and a mock: if something later does try to render, it gets a named error at the line that
tried instead of a silent no-op that quietly passes. A `Proxy` would have been shorter and would
have hidden exactly that.

What it bought, beyond deleting the exclusion list:

- the generator backstop now covers all eleven units instead of nine — 80 rounds of every bench
  in Units 4 and 7, which had no such coverage at all;
- **CC-26, fifteen live assertions** of the class §4 is about, asked of the two units that could
  never be asked before: the naming quiz offers exactly one right answer and it is the compound
  the bench asked about; the bond type the commit grades is on the offered grid; the dEN it
  grades is the gap between the two elements it drew; the geometry, the intermolecular force and
  the solid type drawn are each ones the learner can pick; the postulate the KMT bench grades is
  one of the five it lists and every one of those five has a consequence written for it; the
  ideal-gas target is the stated value of the quantity being solved for; the over-limit flag
  agrees with the partial pressure it came from.

`scenario-coherence` went from 119 assertions to 138. Three of the new ones were deliberately
inverted to confirm they fail when the claim is false, because an assertion that cannot fail is
worse than no assertion — it reads like coverage.

### 9.3 What is left, and why

**Trailing panel space** stays as §7 describes it. It is a chosen trade with a stated reason
(it is where the verdict lands) and a one-line reversal, not a defect.

**Ten benches of 58 still scroll**, six of them by under 60px, and §8.5 names the tallest block
in each. The four over 100px are a bench with two tested decisions, a rotatable particle box over
two live instruments, a 280px Bohr model beside three readouts, and a 250px decision block over a
600-unit number line. Every one of those is the bench, not something in front of it — and the two
that a stylesheet comment already defends were both read before being changed, once wrongly
(§8.4's stepper-grid) and once rightly (§8.6's emission cards, where the comment had the
typography backwards).

**What would actually move them further** is a pedagogy call, and it is worth naming so nobody
re-derives it: split Electron configuration into two stations, or shrink the particle box and the
Bohr model and accept smaller in-SVG labels. The first deletes a tested feature. The second
trades away the exact thing §3 spent a section winning. Neither is a layout decision.
