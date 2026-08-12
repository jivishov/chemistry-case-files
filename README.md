# Chemistry Case Files

Interactive simulators for the Texas high school Chemistry course
(19 TAC §112.43, adopted 2020, implemented 2024–2025). Every simulator targets a
specific standard at On-Level depth, includes an **Honors** extension, and ends with a
**Case File**: an animated true story showing where that unit's chemistry decided something real.

## Status

| Unit | Title | TEKS | Status | Case File |
|------|-------|------|--------|-----------|
| 1 | Practices, Measurement & Matter | C.1–C.4 | ready | The Mars Climate Orbiter unit error |
| 2 | Atomic Structure & Theory | C.6, C.5 | ready | Firework colors as electron transitions |
| 3 | Periodic Table & Trends | C.5 | ready | Why lithium powers your phone |
| 4 | Bonding, Nomenclature & Geometry | C.7 | ready | The 104.5° bend that floats ice |
| 5 | The Mole & Chemical Quantities | C.8 | ready | Apollo 13's CO₂ scrubber math |
| 5A | The Mole (reasoning-first lab build) | C.8 | ready | shares Unit 5's story |
| 6 | Reactions & Stoichiometry | C.9 | ready | Airbag stoichiometry in 30 ms |
| 7 | Gas Laws & Kinetic Theory | C.10 | ready | The scuba no-breath-hold rule |
| 8 | Solutions & Solubility | C.11 | ready | Lake Nyos, the lake that exhaled |
| 9 | Acids & Bases | C.12 | ready | What soda does to tooth enamel |
| 10 | Thermochemistry | C.13 | ready | Every Calorie was measured by fire |
| 11 | Nuclear Chemistry | C.14 | ready | Otzi the Iceman, dated by what was left |

All 11 units are built (plus 5A, an alternate reasoning-first build of Unit 5), so the suite is
complete. Unit 6 is the reference template for the core pattern, Unit 4 adds the 3D Three.js
pattern, and Unit 5 is the reference for the scenario/gamification layer.

## Tests

```bash
npm test          # chem engine + gamification + case files
```

Five suites, all plain node with no dependencies: `tests/chem.test.js` (the pure chemistry
engine), `tests/game.test.js` (mastery/XP helpers), `tests/casefile.test.js` (validates every
unit's Case File data against the schema), `tests/gauge.test.js` (the live-gauge axis model, its arc geometry, and
its plain-language readings), `tests/molezoom.test.js` (the shared "Feel a mole" tool).
They are the gate for changes to `shared/js/`.

## Run it

This is a static site, but it uses ES modules, which browsers block on the
`file://` protocol. Serve it over http:

```bash
cd texas-chemistry-sims
python3 -m http.server 8000
# open http://localhost:8000
```

The repo `package.json` only enables `node tests/chem.test.js`; GitHub Pages ignores it.

On **GitHub Pages**: push the contents of `texas-chemistry-sims/` to a repo and
enable Pages (root). The included `.nojekyll` file keeps Pages from rewriting paths.
Open `index.html` for the hub.

## Stack (all static, CDN-loaded, no build step)

- **Alpine.js 3.14** — reactive UI, declarative directives in HTML.
- **KaTeX 0.16 + mhchem** — chemical-equation typesetting via `\ce{...}`.
- **Chart.js 4.4** — graphs (used by later units; wrapper in `shared/js/render.js`).
- **Three.js** — 3D units (Unit 4 built; Unit 7 next), loaded via an import map.
- Fonts: Bitter (display), Atkinson Hyperlegible (body), JetBrains Mono (data).

## Structure

```
index.html                     hub (element-cell unit grid)
shared/
  css/  tokens · base · components     design system
  js/   chem.js    chemistry engine (pure, unit-tested)
        teks.js    course + TEKS data
        render.js  KaTeX/Chart helpers, Alpine x-ce / x-tex directives
        gauge.js   half-circle live gauges, Alpine x-gauge directive
        molezoom.js  the "Feel a mole" powers-of-ten tool (U5 + U5a)
units/06-reactions-stoichiometry/
  index.html · css/style.css · js/model.js (reactions) · js/main.js (view-model)
```

`shared/js/chem.js` has no DOM or framework dependencies and is independently
testable (formula parsing, molar mass, balancing, stoichiometry, limiting reactant).

## Live gauges (`x-gauge`)

Any readout a learner can *change* carries a half-circle dashboard gauge beside its
number. A card reading `×0.329` states a value but not the story — which side of the
baseline it is on, and which way the last slider move pushed it. The gauge answers
both, and says it in words as well as position ("a third of the baseline · 67% lower",
`▼ down 0.671`), with a hollow bead left on the arc where the reading just was.

Drop one in next to the number it explains. No handler wiring is needed: the
directive watches the expression, and keeps the previous value in a closure so
painting never writes reactive state.

```html
<div class="stat-row has-dials">
  <div class="stat">
    <div class="k">relative pressure</div>
    <div class="v" x-text="'×'+fmt(relP,3)"></div>
    <div x-gauge="{ kind:'ratio', value: relP, fold: 50, digits: 3,
                    label:'relative pressure', refLabel:'the baseline fill',
                    tone:'indigo' }"></div>
  </div>
</div>
```

Three axis kinds, and picking the right one is the whole game:

| kind | for | axis |
| --- | --- | --- |
| `ratio` | `×` multipliers, and anything measured against a baseline (`Z = PV/nRT`) | **logarithmic**, centred on the baseline at the arc's apex: `×1/2` and `×2` sit equally far from top-centre |
| `span` | absolute quantities on a known range (particle count, net charge, wavelength) | linear `min`..`max`, optional `ref` tick and named `bands` |
| `decade` | anything stepped in powers of ten (the mole zoom) | log10, ticked by exponent, and its trend reports **decades crossed**, not the arithmetic difference |

Options: `value` `label` · `fold` (ratio) · `min` `max` (span/decade) · `ref` `refLabel`
· `unit` `digits` · `bands: [{upTo, label}]` · `tone` · `series` (an identity string;
when it changes the stored previous value is dropped, so no trend is ever reported
across two different measurements).

`tone` is one of `teal` `indigo` `green` `plum` `slate`, defined in `tokens.css`. Give
the gauges in one row different tones so they are told apart at a glance; an unknown
name falls back to teal rather than rendering unstyled.

House rules the component enforces, and reasons not to work around them:

- **A ratio gets a log axis.** On a linear `0..max` axis a halving reads as a small
  nudge and a doubling as a huge one, so a correct number produces a wrong conclusion.
- **The reference is always drawn and labelled**, so the coloured sweep reads as a
  deviation growing out of a datum rather than a fill from an implied zero. Name it
  with `refLabel` — it becomes both the tick label and part of the spoken reading.
- **Off-scale is capped *and* announced.** A needle pinned at the end without the
  words "off the top of the dial" would read as an exact maximum.
- **Hue is categorical, never a verdict.** A tone says *which* quantity a gauge reads,
  so each arc keeps one hue across its whole travel. Direction is carried three other
  ways: which side of the baseline mark the sweep grows from, an arrow, and a word.
  Colouring by value would imply a falling pressure is a mistake. Copper and amber
  stay out of the palette because they already mean Honors and warn.
- **Never dial a value the learner is being graded on.** Unit 8's molarity readouts
  and Unit 9's pH meter stay as they are — a live gauge there turns a calculation into
  a hot-and-cold hunt. Dials belong on exploration, not on answer entry.
