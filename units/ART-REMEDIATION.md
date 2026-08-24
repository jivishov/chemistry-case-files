# Art remediation — redraw the scene art for units 02, 07 and 08

Three agents, one file each, no shared writes. This is the safest parallel job in the project so
far and also the narrowest: **each agent rewrites exactly one file**, `units_new/<slug>/js/art.js`.

Copy the **Shared brief** plus **one unit block** into each agent.

Written 2026-08-21 after wave 2. Every number here was measured, not quoted. Re-verify anyway.

---

## What went wrong

Wave 2 delivered units 02, 07 and 08 with complete cockpits, correct registrations and full 1:1 art
coverage — and with scene art that is **one template repeated once per scenario**. Measured across
the whole tree with `units_new/tools/contact-sheet.mjs`:

| Unit | Banners | Distinct structures | Avg chars/banner |
|---|---|---|---|
| **02 · Atomic Structure** | 21 | **1** | 1,570 |
| **07 · Gas Laws** | 13 | **1** | 1,771 |
| **08 · Solutions** | 18 | **1** | 1,858 |
| 01 · Practices | 15 | 15 | 6,234 |
| 04 · Bonding | 19 | 19 | 8,395 |
| 05 · The Mole | 15 | 15 | 5,212 |
| 06 · Reactions | 15 | 15 | 5,707 |
| 09 · Acids & Bases | 16 | 16 | 5,545 |
| 10 · Thermochemistry | 21 | 21 | 5,190 |
| 11 · Nuclear | 31 | 31 | 4,676 |

"Distinct structures" is the count of unique element sequences with all attributes and text
stripped. Two banners built from the same template collapse to the same string however different
their captions and hues look in source. Every finished unit scores one structure per banner. The
three wave-2 units score **one for the whole set**.

What that looks like on screen: a shape on the left, a process strip (`SAMPLE → READ → RECORD`,
`EVIDENCE → MODEL → WORK ORDER`, `READ → CALCULATE → FILL`), and the same meaningless squiggle in a
box on the right, with only the caption text and one hue changing between scenes. The bottom third
of every frame is empty. Worst are the scenes whose caption names a picture that is not drawn:
`c-sodium` "sodium emission line", `h1-speeds` "compare molecular speeds", `h2-real` "real gases
deviate" — all three are the same squiggle.

**No automated gate catches this.** The layout audit passes right now, with this art in place, at
`1136 states clean across 11 builds` — a legible template satisfies every one of its assertions,
because it audits scroll, clipping, occlusion and font size, not whether a picture depicts anything.
`npm test` never looks at art at all. The only gate that covers this is looking at the contact
sheet, which a report can claim without doing, and that is the hole this brief closes by making it
mechanical.

**This is not a criticism of the porting work around it.** The cockpits, the plumbing, the
registrations and Unit 2's invented `Atomic models` bench are all real and all stay. Only `art.js`
is being replaced.

---

## The contract

**The one file you may modify is `units_new/<slug>/js/art.js`.** Nothing else — not `index.html`,
not `main.js`, not `model.js`, not the unit's stylesheet, not `units_new/shared/cockpit.css`, not
`units/`, not the hub, and no *existing* file under `tests/`. The one exception, because a gate
below needs it: you may create `tests/tmp-audit-<slug>.mjs` as a throwaway and must delete it
before you finish. Everything downstream of `art.js` already works and is registered; you are
swapping the drawings behind a stable interface.

Hold these three invariants or the unit breaks:

1. **Keys unchanged.** `SCENE_ART` must keep exactly the ids it has now, one per scenario, no spares
   and no gaps. `main.js` reads them through `scArt(id)`, and the mission screen has a banner slot
   for every scenario. Verify with the tool: it reports the count.
2. **Exports unchanged.** `export const SCENE_ART` and `export ... sceneArt(id)` — `sceneArt` is
   currently `export const` in your unit and `export function` in Unit 11; either form is fine, the
   name is not.
3. **`aria-hidden="true"` on every `<svg>`, and a `viewBox="0 0 400 150"`.** The banner is
   decoration; the goal text under it is the authoritative description.

**Run no git command that mutates state.** Read-only is fine (`status`, `diff`, `log`, `show`).
Forbidden: add, commit, stash, checkout, restore, reset, clean, rm, mv, apply, switch, branch,
merge, rebase, anything `--force`. The git root is `C:/Users/EmilJivishov/Projects`, one level
**above** this project, holding about 150 other project folders, most of the hundreds of
uncommitted files in it belonging to other projects being actively worked on. Nothing in this tree
is committed yet either, so a stray `git checkout .` destroys the whole seven-unit migration and
other people's work with it. If you think you need one of these, stop and report it.

---

## What the standard actually is

Read `units_new/11-nuclear/js/art.js` (31 banners, the largest set) and
`units_new/01-practices-matter/js/art.js` (15, the original). They share one architecture, and the
architecture is the whole answer:

```
MONO                  the mono font stack, one const
C = {...}             a named palette for the unit
XX_BG / YY_BG         two or three background pairs, one per place the work happens
kit(id)               per-scene <defs> namespace -- see below
mono(x, y, s, opts)   mono text at a position
--- then the part that is missing from your unit ---
a VOCABULARY of small subject primitives, 10-15 of them
--- then ---
scene(id, {caption, body, theme})   the frame, the scrim, the caption
SCENE_ART = { id: scene(id, { caption, body: <composed primitives> }), ... }
sceneArt(id)
```

The vocabulary is the difference between one structure and N. Unit 1 has `waterColumn`,
`deskShelf`, `gravel`, `plant`, `fish`, `bubbles`, `syringe`, `cylinder`, `notebook`, `testTube`,
`targetBoard`, `panelBox`, `flow`. Unit 11 has `motes`, `hotLab`, `outside`, `trefoil`, `vial`,
`leadPot`, `barrier`, `track`, `meterBox`, `nucleus`, `person`, `decayCurve`, `gantry`, `card`,
`evidenceRig`. Each scene composes three or four of them into a picture of *that* scenario. Note
that the two lists barely overlap: the vocabulary is built for the unit's world, it is not
inherited. Do not copy Unit 11's primitives into a solutions unit.

`HANDOFF-PORTING.md` §2.5 names `mono()`, `panelBox()` and `flow()` as the primitives to copy. That
list is Unit 1's, not universal — Unit 11 has none of `panelBox`/`flow`. Take the architecture from
the two files, not the helper names from the doc.

**What each banner has to show** is in the unit's own `model.js`. Every scenario carries `system`
(the place — "Dead streetlight", "The cooling tank", "The high-pressure bank") and `goal` (what the
learner must do). The banner draws the `system`, with the subject the `goal` is about. The current
art uses `system` for the caption and then draws nothing from `goal`; that is the specific failure.

Non-negotiables, all from the trap list and all still true:

- **Per-scene id prefixes on every gradient, pattern and clip.** Alpine keeps every panel in the
  DOM, so an unprefixed id bleeds between scenes. `kit(id)` does this; do not hand-write raw
  `<defs>`. Your current file prefixes by hand and gets away with it — use `kit()` anyway.
- **Nothing below `y = 102`** (trap 7). `scene()` paints a caption scrim from y=102 to 150. A label
  at y=110 comes out ~40% faded; at y=116 the layout audit reports it occluded. Keep every subject
  and in-scene label at **y ≤ 100**. This also means: use the vertical space you have. The current
  banners waste the bottom third *above* the scrim, which is a third of the picture thrown away.
- **Lighting from the upper left**, everywhere, so a cylinder in one banner is shaded like the
  cylinder in the next.

---

## Gates

```bash
node units_new/tools/contact-sheet.mjs <your-slug>
```

Run it early and often — after your first three banners, not at the end. It prints the banner
count, the distinct-structure count and the average size, writes a PNG, and **exits non-zero while
distinct ≠ banners**. Then **open the PNG and look at it**: that is what catches scrim collisions,
defs bleed, lighting drift and a scene that is technically distinct but illegible. Do not use the
in-app Browser pane for this; screenshots time out there and the viewport collapses.

Passing the tool is necessary and not sufficient. The target is not "21 different structures", it is
"21 pictures a chemistry teacher would recognise". Unit 11's sheet is the bar: a Mo-99 generator
column with beta stopped by plastic, a shielding bench with dashed tracks through card/acrylic/lead
into a meter, a binding curve peaking at Fe-56.

Then, before you report done:

```bash
npm test                                              # chem 286, game 36, casefile 411, gauge 149, molezoom 64
PW_ROOT=../Lab_studio node tests/unit5a-layout.test.mjs
```

`npm test` must not move. The layout audit was green at **1136 states clean across 11 builds**
before you started; it must still print PASS. Art is fixed-size so it should be untouched by your
change, but the mission screen holds these banners and the audit is the only thing that proves it.
The full run is long — eleven builds, every station, eight viewports, Honors on and off — so you
may instead copy the harness to `tests/tmp-audit-<slug>.mjs` (it must live in `tests/`, because it
resolves `ROOT` as `new URL('..', import.meta.url)`), cut `TARGETS` to your unit alone, run that,
and delete the temp file.

Finally:

```bash
find units unit5a-codex shared units_new/shared -newermt "<your start time>" -type f   # must be empty
```

Report: the tool's final line for your unit, what your vocabulary ended up being (the list of
primitive names), any scene you could not draw honestly and why, your `npm test` and audit output
verbatim, and anything worth appending to `HANDOFF-PORTING.md` §4 as trap 18 or later — reported,
not written, since two other agents want the same lines.

---

## Unit 02 — `02-atomic-structure` · 21 banners

```text
Rewrite units_new/02-atomic-structure/js/art.js. 21 banners, currently 1 distinct structure at
1,570 avg chars. The largest and most drawable set of the three: the chemistry here is inherently
visual and almost none of it is currently drawn.

READ RETROFIT-U1-U4.md:263 FIRST. The world is "The Glow Room - a sign-and-lighting shop, Saturday
shift", and that section describes the room you are drawing: "One back room: a shelf of gas
cylinders, some unlabeled; a handheld spectroscope; a spool of copper wire; boxes of borosilicate
tubing; a junk shelf of broken things; three jobs due before closing." That is your set inventory,
handed to you. The same table gives the everyday context behind every bench, which is the picture
each banner owes:

  models   (a) the flea-market CRT that bends when you hold a magnet to it -> Thomson; a tube
               glowing four sharp colours instead of a rainbow -> Bohr; two suppliers' salt
               assaying to the same fixed mass ratio -> Dalton
  build    (b) the cylinder labelled argon-40; the tube that ran hot and ionised neon to Ne+;
               the chlorine-37 tracer bottle
  spectra  (c) the dead streetlight on the corner (Na); one dead tube in a customer's lobby sign
               (Ne); the shop's ceiling fluorescents (Hg)
  mass     (d) the borosilicate tubing invoice (B); the copper spool the scrap buyer weighs (Cu);
               the pool tablets the shop also sells (Cl)
  config   (e) configuration, Lewis dots, valence count on the element in front of you
  family   (f) which gas is inert enough to seal into a customer's tube for ten years; the
               electrode metal; the getter

Four scenes to fix first, because their captions promise a picture that is not there:

  a-crt       The junk-shelf CRT      a beam that visibly BENDS when a magnet is brought near it
  c-sodium    Dead streetlight        a sodium emission spectrum: discrete bright lines on a dark
                                      band, the selected line marked. Not a curve.
  c-mercury   Ceiling fluorescent     the same grammar, mercury's lines at different positions
  h2-orbital  Honors orbital check    orbital occupancy boxes with arrows, showing the exception

A vocabulary that would carry the set: a discharge tube that can glow in a named colour, a spectrum
band with placeable lines, a CRT with a deflectable beam, a shell or orbital diagram, occupancy
boxes, a balance for average mass, the cylinder shelf, the junk shelf, a work-order card. The unit
has SIX core skills - the scenario ids run a, b, c, d, e and f, three scenes each, plus h1, h2 and
cap - so six kinds of evidence have to be visually distinguishable at a glance.

Nothing in this unit is a canvas or a chart, so nothing here interacts with trap 12.
```

## Unit 07 — `07-gas-laws` · 13 banners

```text
Rewrite units_new/07-gas-laws/js/art.js. 13 banners, currently 1 distinct structure at 1,771 avg
chars. The world is a dive shop: cylinders, a blending bank, a truck in the lot, a compressor.

Fewest banners of the three, and the cylinder shape the current template uses at least suits the
world - so this is the cheapest of the three to bring up to standard. What is missing is everything
inside and around the cylinder.

Four scenes to fix first:

  b-tyre     The truck in the lot     a tyre warmed by a day in the sun: same gas, higher pressure.
                                      Show the state change, not a squiggle.
  c-blend    The nitrox blend         two feed lines summing into one cylinder, partial pressures
                                      stacking to a total
  h1-speeds  The rack                 a Maxwell-Boltzmann distribution: two curves at two
                                      temperatures, the faster one flatter and shifted right
  h2-real    The high-pressure bank   ideal vs real: a PV/nRT line at 1 and a real curve departing
                                      from it as pressure climbs

A vocabulary that would carry the set: a cylinder with a readable pressure gauge and a fill level, a
compressor, a truck, a dive-depth column, a feed-line manifold, a distribution curve, a deviation
plot, a thermometer. Note h1-speeds and h2-real genuinely ARE graphs - draw them as graphs with
axes, the way Unit 11 draws its decay curves and its binding curve, and reuse one curve primitive
for both.

Your unit's index.html has three Chart.js canvases and a three.js viewer. NONE of that is your
business here - do not touch index.html, main.js or css/style.css. You are only replacing drawings.
```

## Unit 08 — `08-solutions` · 18 banners

```text
Rewrite units_new/08-solutions/js/art.js. 18 banners, currently 1 distinct structure at 1,858 avg
chars. The world is a water treatment plant with a break room attached: basins, a clearwell, a
dosing bench, jar tests.

Four scenes to fix first:

  c-tea      The cold glass       a solubility CURVE with a temperature read off it, which is
                                  literally what the bench does. Currently a decorative squiggle.
  e-scoop    The bench standard   a scoop of solid going into a known volume: mass, volume, molarity
  h1-ksp     The clearwell        two ion streams meeting, Q against a Ksp threshold line
  h2-crys    The cooling tank     a saturated solution cooled: solid coming OUT of solution, crystals
                                  on the floor of the tank

A vocabulary that would carry the set: a beaker or basin with a settled solid vs a clear solution, a
solubility curve with a readable axis, a jar-test row, a dosing scoop and balance, a volumetric
flask with a meniscus at the mark, an ion pair, a crystal bed, a basin cross-section. The
dissolve/not-dissolve distinction is the unit's core idea and it is the easiest thing in this whole
document to draw: heaped solid at the bottom versus nothing visible but tint.

Your unit has a Chart.js canvas and eight tabs. Neither is your business here - do not touch
index.html, main.js or css/style.css.
```

---

## After this

Only **03 · Periodic Trends** remains unbuilt — class A, ~15 banners, 4 tabs, two Chart.js
instances (`trendChart` and `ieChart`, `units/03-periodic-trends/js/main.js:261` and `:273`). When
it lands, `BUILT` reaches eleven and the migration-temporary paragraph under the hub grid
(`x-show="built < units.length"` in `units_new/index.html`) comes out.

Whoever builds it should run `units_new/tools/contact-sheet.mjs` from the first three banners
onward. Worth doing at the same time: promote the distinctness check into `npm test` as a small
`tests/art.test.js`, asserting for every `units_new` unit that `SCENE_ART` has one key per scenario
and that its distinct-structure count equals its banner count. That would have failed wave 2 at
gate 1 instead of at a human's review, and it is about ten lines.
