# units_new

The next-generation build of the unit simulators: **the same chemistry and the same case
files as `units/`, rendered in the mission-cockpit shell** that was prototyped in
`unit5a-codex/`.

Nothing in `units/` or `unit5a-codex/` is modified by anything in here. Both are read-only
references; every file this tree needs, it owns.

```
units_new/
  index.html                    the hub: eleven unit cards, the built ones live
  shared/cockpit.css            the shell, shared by every unit here
  01-practices-matter/          Unit 1 · Practices, Measurement & Matter (TEKS C.1-C.4)
  02-atomic-structure/          Unit 2 · Atomic Structure & Theory (TEKS C.5-C.6)
  03-periodic-trends/           Unit 3 · Periodic Table & Trends (TEKS C.5)
  04-bonding-geometry/          Unit 4 · Bonding, Nomenclature & Geometry (TEKS C.7)
  05-the-mole/                  Unit 5 · The Mole & Chemical Quantities (TEKS C.8)
  06-reactions-stoichiometry/   Unit 6 · Reactions & Stoichiometry (TEKS C.9)
  07-gas-laws/                  Unit 7 · Gas Laws & Kinetic Theory (TEKS C.10)
  08-solutions/                 Unit 8 · Solutions & Solubility (TEKS C.11)
  09-acids-bases/               Unit 9 · Acids & Bases (TEKS C.12)
  10-thermochemistry/           Unit 10 · Thermochemistry (TEKS C.13)
  11-nuclear/                   Unit 11 · Nuclear Chemistry (TEKS C.14)
```

Repo-level `shared/css/*` and `shared/js/*` (tokens, components, `chem.js`, `game.js`,
`gauge.js`, `render.js`, `casefile.js`, `molezoom.js`) are used exactly as the existing
units use them, and are not touched.

## The shell

`shared/cockpit.css` is `unit5a-codex/css/style.css`, lifted verbatim and shared rather
than copied per unit — it is ~1200 lines of layout, and two copies would drift. It gives
every unit here the same frame:

| Region | What it holds |
|---|---|
| Command header | unit title, station strip, Honors toggle, Reset, XP / streak / TEKS badge |
| Left column | the scene illustration, the job's goal, the reference facts, a standing status line |
| Centre column | the bench — the tool, the inputs, the commit button, the verdict |
| Right column | the world you are keeping alive, plus the log of what your numbers did |

Two things were added to the shell for this tree, both generic:

- **Two labels per tab.** Full station names at 1536 CSS px and up (the primary display),
  the prototype's one-word names below, because seven tabs of "Tanks & counts" ellipse to
  garbage on a Chromebook. Every tab carries an `aria-label` with the canonical name, so
  the accessible name never changes with the viewport.
- **A locked-capstone dot**, as a `::after` on the tab rather than a text node.

## Unit 5 · `05-the-mole`

Unit 5A Codex's mechanics with Unit 5's identity. The scaffold-fade ladder, the gut-check
gate, the misconception detector, the ARI audit and the "Feel a mole" zoom are all intact;
what changed is naming and self-containment.

- Titled and branded as **Unit 5 · The Mole & Chemical Quantities**, with Unit 5's own
  station names on the tabs.
- `js/art.js` and `js/case.js` carry the illustrations and the Apollo 13 story **in full**.
  The prototype re-exported them from `units/05-the-mole/`; here they are real files, so
  this tree does not depend on the old one.
- Progress is stored under `chem.game.units_new/05-the-mole` (and the ladder under
  `chem.lab.units_new/05-the-mole`), so it never collides with the old build's save.

## Unit 1 · `01-practices-matter`

New. It carries every piece of `units/01-practices-matter`'s chemistry — the 50 mL
graduated cylinder and its meniscus, the count/round/calculate significant-figure drills,
density by displacement against the eight-metal table, the four accuracy/precision target
boards, and both Honors extensions — and wraps them in the Scenario layer
`RETROFIT-U1-U4.md` §3 specifies for this unit: **"Tank Watch", the fish tank in your
room.**

**The world-state is the chemistry, not a safety dial.** Four readings, in the units they
are actually measured in:

| Reading | Unit | Fed by | Why it is real |
|---|---|---|---|
| Free chlorine | mg/L | reading the tool (C.1) | tap water runs 0.5-2 mg/L; fish stress above 0.2 |
| Dissolved metal | mg/L | the density bench (C.3) | copper is toxic to invertebrates from ~0.01 mg/L |
| Tank log | % | significant figures (C.2) | the digits you write are what the next dose is mixed from |
| Test kit | % | judging a dataset (C.4) | a kit you cannot trust is a tank you cannot see |

Fish health is derived worst-reading-first (`0.6·min + 0.4·avg`), minus an acute `shock`
term that decays over days — so an overdose or a poisoned fish reads as harm even though no
steady reading moved. The tank starts at **1.80 mg/L straight from the tap**, which is the
unit's premise: the water is already wrong and the fish are not in it yet.

Reading the tool is graded as a **dose** (±0.05 mL ideal, ±0.10 acceptable), because the
number you log *is* the dose — the same failure the unit's case file is about, one tank
instead of one Mars orbiter. Density is a dose (±1% / ±2%, comfortably inside the 9.8%
zinc-to-iron gap) plus a decision: name the metal, then say whether it stays in the water.

**Where the dials earn their place.** Four `x-gauge` readouts, each showing something a
number alone does not:

- your reading against the actual level, on the tool's own ±0.5 mL scale;
- your density on an axis where **every metal is a named band**, so a number *is* an
  identification;
- your five-run mean against the reference value;
- what the tank will read after the water change, against the stress line.

`js/art.js` is a fresh scene set in the same style as Unit 5's: fifteen 400×150 banners,
one per scenario, with a per-scene `<defs>` namespace, lighting from the upper left, and a
`waterColumn()`/`deskShelf()` pair that says which side of the glass you are on.

The capstone unlocks when all four practices are certified, and its correct answer is a
function of the tank you actually built — not a stored key.

## Unit 4 · `04-bonding-geometry`

The first **class-B port**: `units/04-bonding-geometry` was already retrofitted with its
Scenario layer before this tree existed, so its chemistry, its grading, its consequences and
its world-state arrived working and are carried across as they were. What the port added is
presentation, plus the one thing that did not exist — the scene art.

The world is **"Move-In Week", your first apartment**: the last tenant left a shelf of
unlabeled bottles under the kitchen sink and mystery jars in the kitchen, and nothing gets
used, mixed, cooked with or poured away until you know what holds it together.

**The world-state is the shelf, not a score.** Twelve containers came with the place. A right
call turns a slot into a labelled bottle carrying its formula and the one property that call
established; a wrong call flags it, and **it stays flagged**. Four counts in the rail:

| Row | What it is | Why it is not the same number twice |
|---|---|---|
| Labeled | of 12 | the calls that produced a label anyone can read |
| Flagged | of 12 | drawn as its complement, so a full bar still means good |
| Cleared | of 12 | how much of the cupboard you have been through at all |
| Right | % | of the calls you *made*, the share that were right — the one that falls while the others rise |

Under them is the shelf itself: twelve slots as bottle silhouettes, string-built and injected
with `x-html` on a `<g>`, with the flagged ones struck through. It was redrawn for the rail —
the worksheet build's 520×168 figure put an 11px mono label in every slot, which scales to
five pixels in a 230px column, so the slots now carry shape and state and the detail lives in
a per-slot `<title>`.

**Six benches, three of them carrying two commits.** `bond` (C.7A) and `geometry` (C.7C) and
`forces` (C.7D) each host an Honors call as well as the core one — % ionic character,
molecular polarity, and the dominant intermolecular force — so the mission screen has to
decide which of two scenarios and which of two verdicts it is showing. It follows **the most
recent commit**: `screenOf[mode]` holds `{ sc, v, honors }`, a commit claims its bench's
screen, and a "Next …" releases it asymmetrically — a core regenerate always takes the screen
back, because the shell hides the console's brief and the new container's goal is stated
nowhere else, while an Honors regenerate leaves a core outcome standing, because each Honors
block states its own task beside its own controls. That is also what puts the `h1`/`h2`/`h3`
banners on screen at all.

**The 3D viewer.** `js/vsepr.js` is the same three.js VSEPR stage, one instance at module
scope, reached through an importmap. Its canvas sizes to its wrapper, so the wrapper carries
an explicit `clamp(190px, 33vh, 300px)`, and `setMode()` calls `viewer.resize()` on the tick
after the panel is genuinely in flow — the `ResizeObserver` fires on the transition out of
`display:none`, but not before the newly shown panel's first paint. Measured at 1536×726: a
625×194 buffer on first open and still 625×194, with one WebGL context, after leaving the
station and coming back.

`js/art.js` is a fresh set of **nineteen 400×150 banners**, one per scenario, in the same
style as Units 1 and 5: a per-scene `<defs>` namespace, lighting from the upper left, nothing
below y=100, and a `counterTop()` / `sinkCupboard()` pair that says which half of the
apartment you are in — the counter is where the work happens, the cupboard under the sink is
where the consequence lands. The molecule glyphs use the same element colours and the same
pale lone-pair lobe with two dark electrons in it as the 3D bench beside them.

The capstone draws a real compound from the six that plausibly sit under a kitchen sink, then
derives its bond, class, shape and properties from the chemistry — so keep / drain / bag is a
function of what is in the bottle, not of a stored key.

Progress is stored under `chem.game.units_new/04-bonding-geometry`.

## Wave 1 and Wave 2 cockpit ports

All eleven course units now live in this tree. Their legacy chemistry engines, scenario
grading, case files, and case-file artwork stay intact; each port changes only the shell,
scene-art layer, unit-local presentation rules, and `units_new` progress key, except where a
class-A unit needed its missing assessment and consequence layer.

## Unit 2 · `02-atomic-structure`

The Glow Room is a Saturday sign-and-lighting shop. It adds the class-A assessment layer:
three work orders for each of six core skills, two Honors extensions, and a capstone whose
answer depends on the spectrum and family evidence actually logged in the six-slot tube rack.
The original atom builder, isotope mass, spectrum, configuration, and orbital tools remain
the source of all calculations. Atomic models are its own `models` station, so C.6(A) is
assessed as evidence-based model selection rather than being folded into atom construction.

## Unit 3 · `03-periodic-trends`

The Repair Bench is phone and laptop repair at your own bench. The three C.5 calls pair a
scientific decision with the real consequence of that decision: order the element predicted
from Mendeleev's gap, act on the family that explains a part failure, or choose the part a
trend supports. The source unit's 37-element inspector, historical schematics, family
reactivity evidence, periodic-table heatmap, two charts, and case file remain reachable in
the cockpit rather than being reduced to answer feedback.

The world-state is a rebuilt mini periodic table. Each confirmed call adds a real-family
tinted cell; an unsupported call returns one previously confirmed cell without letting one
mistake empty the board. The C.5(C) comparison pool is generated from the full derived
element data, skips undefined noble-gas electronegativities, and filters out data anomalies
reserved for the two gated Honors analyses. The capstone derives its fit, wait, or refuse
call from the offered substitute and the board the learner actually built.

## Unit 6 · `06-reactions-stoichiometry`

The hazmat-rotation port preserves balancing, classification, stoichiometry, limiting-reagent,
and tanker decisions, with its original scenario layer and case file carried into the shared
cockpit frame.

## Unit 7 · `07-gas-laws`

The dive-boat fill station retains the module-scoped Three.js kinetic box and its three
module-scoped Chart.js charts. `setMode()` resizes both after the active panel paints, and
the original gas-law, Dalton, real-gas, and over-water reasoning remains intact. Its 13
scene banners map exactly to its 13 scenario ids.

## Unit 8 · `08-solutions`

The water-plant port retains all 18 existing scenarios and the original solubility curve
chart. The chart gets a real bounded host and resizes on opening; the eight-tab strip uses
short labels when the full labels would not fit. Its clearwell rail presents four real plant
readings beside the consequence log, and its 18 scene banners map exactly to its scenarios.

## Unit 9 · `09-acids-bases`

The poison-control night-shift port preserves the naming, definitions, strong-vs-weak,
neutralization, pH-meter, and triage scenarios, including the existing chart and patient
consequences.

## Unit 10 · `10-thermochemistry`

The rescue-mission port retains its hand-rolled heat schematics, scenario consequences, and
case file without introducing a charting dependency.

## Unit 11 · `11-nuclear`

The nuclear-medicine port carries the source, decay, isotope, fission-or-fusion, and final
call stations into the cockpit while preserving its original scenario world-state and case
file.

## Completion record

The per-unit handoffs remain as design and maintenance records. Unit 3 was the final class-A
lift: it closes the last missing unit card in the hub, case-file validation, and the cockpit
layout matrix. `HANDOFF-PORTING.md` keeps the shared trap list for any future cockpit work.

## Running and testing

```bash
py -3.13 -m http.server 8091
```

then open `/units_new/` for the hub, which links every built unit. ES modules need
`http://`, not `file://`.

```bash
PW_ROOT=../Lab_studio node tests/unit5a-layout.test.mjs
```

audits the layout contract (no document scroll, nothing clipped or occluded, nothing under
14px, no dead gaps) across eight viewports and every station, for the prototype and every
built unit in this tree. Units with taller scientific benches declare their unit-local scroll
ports in the test's `TARGETS` table; the document itself never scrolls.

`npm test` covers the shared engines. It is no longer indifferent to this tree: since Unit
4, `tests/casefile.test.js` validates every `units_new` case file through its `NEW_TREE`
list, which is where the rewritten `cta.call` gets checked.
