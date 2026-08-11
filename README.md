# Texas Chemistry · Interactive Simulators

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

Three suites, all plain node with no dependencies: `tests/chem.test.js` (the pure chemistry
engine), `tests/game.test.js` (mastery/XP helpers), `tests/casefile.test.js` (validates every
unit's Case File data against the schema). They are the gate for changes to `shared/js/`.

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
units/06-reactions-stoichiometry/
  index.html · css/style.css · js/model.js (reactions) · js/main.js (view-model)
```

`shared/js/chem.js` has no DOM or framework dependencies and is independently
testable (formula parsing, molar mass, balancing, stoichiometry, limiting reactant).
