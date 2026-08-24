# Handoff · build `units_new/02-atomic-structure`

**Task.** Create Unit 2 under `units_new/`, carrying every piece of educational content from
`units/02-atomic-structure/` — its tools, its drawings, its six gauges, its data pools, its
case file — into the mission-cockpit shell, wrapped in the Scenario layer
`RETROFIT-U1-U4.md` §3 specifies for this unit: **"The Glow Room"**.

`units_new/01-practices-matter/` is the worked example. Read it before writing anything.

---

## 0. Read this before you scope the work

**Unit 2 is not the same shape of job Unit 1 was, and mistaking it for one will produce a
unit that looks finished and grades almost nothing.**

Unit 1 arrived with four working graded checks (`checkMeasure`, `checkSF`, `checkDensity`,
`checkEval`) and the retrofit re-homed them as commits. Unit 2 arrives with **exactly one**:
`checkV()` (`units/02-atomic-structure/js/main.js:270`), the valence multiple-choice — and
that one is wrapped in `x-show="isMainGroup"`, so on the four transition elements in
`BUILD_SET` the shipped unit has *zero* graded content.

Everything else in Unit 2 is an **exploration tool**: it shows you the answer. `avgMass`
(`:113`) computes the weighted average *for* the learner. `selectedLine` hands you the
wavelength, frequency and energy of a line you clicked. `cfgString`, `lewisSvg` and
`orbitalDiagram` all render the configuration once you pick an element. These are excellent
teaching instruments and they are why the transfer is worth doing — but **none of them is a
task**, and a dose task cannot be built on a tool that does the arithmetic.

So the real job is three jobs:

| | Scope |
|---|---|
| **Transfer** | six drawings, six gauges, five data pools, the case file, the bench CSS |
| **Build an assessment layer** | five of six skills need a commit that does not exist: what is asked, what is graded, what the consequence is |
| **Invent one bench outright** | `models` (C.6(A)) has no tab, no markup and no tool today |

Budget accordingly. Unit 1 came to ~47 KB of `main.js` and 15 scene banners. Unit 2 has
**six core skills instead of four**, so it needs **21 scenarios and 21 banners** (6 × 3
core, plus `h1`, `h2`, `cap`). The art file alone is a third larger than Unit 1's.

---

## 1. Hard constraints

1. **Do not modify `units/`, `unit5a-codex/`, or the repo-level `shared/`.** They are
   read-only references. Everything you need, `units_new/02-atomic-structure/` owns. Prove
   it at the end:
   ```bash
   find units unit5a-codex shared -newermt "<the time you started>" -type f
   ```
   That must print nothing.
2. **`units_new/shared/cockpit.css` is shared by every unit in the tree.** Add to it only
   when the change is generic. Unit-2-specific rules go in
   `units_new/02-atomic-structure/css/style.css`, which loads after it.
3. **No em-dashes in `CASE` copy** — `tests/casefile.test.js` enforces it. Sweep `SCENARIOS`
   copy by hand; no test covers that.
4. **Everything quantitative comes from `shared/js/chem.js`.** Do not reimplement
   `averageAtomicMass`, `photonEnergy`, `frequencyOf`, `rydbergWavelength`,
   `electronConfiguration`, `formatConfig`, `shellOccupancy` or `valenceElectrons`.
5. **No mhchem, no `x-ce`** (`RETROFIT-U1-U4.md` §6.5) — Unit 2 writes no chemical formulae.
   Do not copy Unit 5's mhchem `<script>` tag. `x-tex` (KaTeX) *is* used, for E = hν.
6. **Re-verify every line number in every document, including this one, before acting on
   it.** `RETROFIT-U1-U4.md` cites `units/02-atomic-structure/index.html:311` for the
   valence MCQ; it sits at `:369-378` today. These files have moved since the docs were
   written.

## 2. Read, in this order

| What | Why |
|---|---|
| `units_new/README.md` | what the tree is, how the shell is shared |
| `units_new/01-practices-matter/js/model.js` | the `SCENARIOS` + `effect` shape you will copy |
| `units_new/01-practices-matter/js/main.js` | the plumbing — landmark table in §6 |
| `units_new/01-practices-matter/js/art.js` | the scene-art kit: `kit()`, `scene()`, primitives |
| `units_new/01-practices-matter/index.html` | cockpit markup, station strip, module bootstrap |
| `RETROFIT-U1-U4.md` §3 (263-311), §4, §5, §6.5, §8 | The Glow Room; world-state; bands; U2's deviations; twenty documented traps |
| `units/02-atomic-structure/` — all five files | the content you are transferring |
| `TEKS.md` | C.6 and C.5(B) wording |

Confirm green before touching anything:
```bash
npm test
```
Expect `chem 286, game 36, casefile 299, gauge 149, molezoom 64, 0 failed`. Re-baseline
before you start: `casefile` climbs by roughly 16 for every unit registered in the suite's
`NEW_TREE` list, so the number here drifts upward as the ports land.

---

## 3. Inventory: what transfers, what needs building

### 3.1 Transfers as-is

**`js/model.js`** — five pools, carried over unchanged (plus stable `id`s on `SE`):
`ATOMIC_MODELS` (5 entries: who / year / model / idea), `BUILD_SET` (25 atomic numbers),
`ISOTOPE_ELEMENTS` (B, Cl, Cu, Br, Mg — each with `accepted` and per-isotope
`{a, mass, abundance}`), `SPECTRA` (H computed from Rydberg; He, Ne, Na, Hg with literal
line lists and a `note`), `CONFIG_EXCEPTIONS` (Cr, Cu, Ag, Au), `NOBLE_CORES`.

> **A constraint you will hit:** `CONFIG_EXCEPTIONS` lists Ag (Z 47) and Au (Z 79), but
> `BUILD_SET` stops at Z 35. **Only Cr and Cu are reachable**, so the Honors `h2` exceptions
> bench has a pool of two. Either accept that (two scenarios; `target: 2` is already the
> Honors default) or extend `BUILD_SET`, which §6.1 permits as an additive change.

**`js/main.js` drawings** — the reason this unit is worth transferring:

| Tool | Line | Draws |
|---|---|---|
| `wavelengthToRGB(nm)` | `:12` | Dan Bruton visible-spectrum colour. **The world-state depends on this.** |
| `bohrSvg()` | `:88` | shell diagram from `shellOccupancy` |
| `massLineSvg()` | `:124` | isotope mass axis with the weighted average marked |
| `spectrumSvg()` | `:174` | emission spectrum band in real colours |
| `energyLevelSvg()` | `:194` | hydrogen level diagram (Honors) |
| `lewisSvg()` | `:236` | Lewis dot structure |
| `orbitalDiagram` / `arrows()` | `:227` / `:235` | orbital boxes (Honors) |

**Derived state worth keeping verbatim:** `massNumber`, `charge`, `chargeStr`,
`ionNotation`, `isotopeName`, `isoRows`, `isoMassAxis`, `specAxis`, `lines`,
`selectedLine`, `cfgShorthand`, `valence`, `family`, `isMainGroup`, `cfgIsException`.

**The six existing gauges — carry every one.** Unit 2 already holds the best gauge work in
the repo and it must survive the move (`units/02-atomic-structure/index.html`):

| Bench | Line | Gauge | Why it earns its place |
|---|---|---|---|
| `build` | `:118` | mass number A, `series: elZ` | re-scales per element; the series key drops the stale trend |
| `build` | `:128` | net charge, signed axis, `ref: 0`, named `bands` | anion / neutral / cation — names the side the needle landed on |
| `mass` | `:211` | weighted average, `ref: iso.accepted`, `refLabel:'table value'` | answers "did that slider move take me toward the accepted mass or away" |
| `spectra` | `:260` | wavelength λ across the visible strip | |
| `spectra` | `:267` | frequency ν across the same strip | |
| `spectra` | `:279` | photon energy E across the same strip | |

**Read the comment at `index.html:274-278` before touching the last three.** All three span
the *same* 380-700 nm strip, so picking a line swings the wavelength needle against the
other two while those two stay locked together. That is E = hν = hc/λ **made visible instead
of asserted**, and it is the single best pedagogical artefact in Unit 2. Preserve the shared
axis, the `series: specKey` keying, and the tones (`green` / `indigo` / `plum`).

**`js/case.js`** — `firework-electrons`, "Every firework is an electron falling", with an
animated stage. Copy in full. **`cta.call` is `"mode='spectra'"` (`:53`) and must become
`"setMode('spectra')"`** — the cockpit routes through `setMode`.

**`css/style.css`** — `.bohr`, `.iso-symbol`/`.iso-stack`/`.iso-sym`, `.stepper-grid`/`.stp-*`,
`.models`/`.model-card`, `.massline`/`.iso-ctl`, `.spectrum`/`.spectrum-cap`/`.line-chips`.

### 3.2 Needs an assessment layer built

| Skill | Today | What the commit must become |
|---|---|---|
| `b` C.6(B) `build` | steppers + Bohr diagram, ungraded | **identity** — the scenario names a species (argon-40, Ne⁺, chlorine-37); the learner sets neutrons and electrons; the commit grades `massNumber` and `charge` together |
| `c` C.6(C) `spectra` | click a line, read three gauges, ungraded | **identity, then dose** — name the gas from its lines, then commit **E in joules** for the flagged line |
| `d` C.6(D) `mass` | **`avgMass` auto-computes** (`:113`) | **dose** — the scenario supplies fixed assay abundances, the learner types the average, `outcomeBand` grades it. **The sliders demote to an exploration aid and must not be the graded path.** A tool that does the arithmetic cannot be a dose task |
| `e` C.6(E) `config` | configuration / Lewis / orbital render, ungraded | **identity** — commit the shorthand configuration, or the valence count, for the element the scenario puts in front of you |
| `f` C.5(B) `config` | `checkV()` MCQ — the one existing check | **decision** — which gas seals a tube for ten years, which metal for the electrode, which getter. `family` + `valence` are the evidence |

### 3.3 Does not exist yet

**`models` (C.6(A)) is a brand-new tab** — no markup, no tool, no data beyond the static
`ATOMIC_MODELS` timeline. It is the only new *tab* anywhere in the retrofit and the only
place you are designing rather than porting. Shape it as: an everyday piece of evidence →
pick the model it forces → a consequence that says what that model buys you.

Add an evidence bank to `js/model.js`:

```js
// Each entry is one thing on the junk shelf and what it does when you touch it. `forces` is
// the model that observation makes unavoidable; `because` is why the earlier models cannot
// account for it; `consequence` is keyed by the model the learner picks, so a wrong pick
// still teaches what that model would have predicted.
export const EVIDENCE = [
  { id: 'crt', object: 'the flea-market CRT',
    observation: 'the beam bends when you hold a magnet to the tube',
    forces: 'Thomson',
    because: 'a solid indivisible sphere has nothing in it that a magnet could steer',
    consequence: { Dalton: '...', Thomson: '...', Rutherford: '...', Bohr: '...', Heisenberg: '...' } },
  // 'four sharp colours, not a rainbow'        -> Bohr
  // 'two suppliers, same fixed mass ratio'      -> Dalton
  // 'position and speed not both pinnable'      -> Heisenberg
];
```

**Keep the gold-foil card out of the core rotation** (`RETROFIT-U1-U4.md` §3). The CRT, the
neon tube and the two-suppliers mass ratio are genuinely everyday objects; Rutherford's foil
is lab apparatus from 1911. Put it in the Honors pool or leave it in the reference timeline.

---

## 4. The Glow Room

Role line: **`Saturday hand · sign and lighting shop`.** One back room: a shelf of gas
cylinders, some unlabelled; a handheld spectroscope; a spool of copper wire; boxes of
borosilicate tubing; a junk shelf of broken things; three jobs due before closing.

### 4.1 Stations and everyday contexts

| Mode | Skill | TEKS | Type | Contexts |
|---|---|---|---|---|
| `models` | `a` | C.6(A) | decision | the CRT that bends under a magnet → Thomson; a tube glowing four sharp colours not a rainbow → Bohr; two suppliers' salt assaying to the same fixed mass ratio → Dalton; position and speed not both pinnable → Heisenberg |
| `build` | `b` | C.6(B) | identity | the cylinder labelled argon-40; the tube that ran hot and ionised neon to Ne⁺; the chlorine-37 tracer bottle |
| `spectra` | `c` | C.6(C) | identity + **dose** | the dead streetlight on the corner (Na); one dead tube in a customer's lobby sign (Ne); the shop's ceiling fluorescents (Hg, and the hazard when one cracks) |
| `mass` | `d` | C.6(D) | **dose** | the borosilicate tubing invoice (B); the copper spool the scrap buyer weighs (Cu); the pool tablets the shop also sells (Cl) |
| `config` | `e` | C.6(E) | identity | the element in front of you: configuration, Lewis dots, valence count |
| `config` | `f` | C.5(B) | decision | which gas is inert enough to seal into a tube for ten years; the electrode metal; the getter |

Honors: `h1` E = hν and the hydrogen level diagram (`spectra`); `h2` orbital diagram and
configuration exceptions (`config`). Both have display markup already; both need commits.

**Capstone — the unlabelled cylinder.** Read its spectrum → name the gas; check the isotope
assay against the label's quoted atomic mass (dose); set the species on the steppers; read
its family → inert enough for a sealed tube? Then one call: **fill the tube with it / send
it back to the supplier / call it in as hazardous.** Resolve `correct` from generated state
*and the rack the learner actually built*, the way `genCapstone` does at
`units_new/01-practices-matter/js/main.js:757`. Never from a stored key.

### 4.2 Bands (`RETROFIT-U1-U4.md` §5)

```js
export const SPECTRA_BANDS = { mode: 'relative', ideal: 0.01,  acceptable: 0.03  }; // photon energy, J
export const MASS_BANDS    = { mode: 'relative', ideal: 0.001, acceptable: 0.003 }; // average atomic mass, u
export const HONORS_BANDS  = { mode: 'relative', ideal: 0.02,  acceptable: 0.05  };
```

Write the reason for `MASS_BANDS` into a comment: 0.3% of 35.45 u is 0.11 u, while a
plausible chlorine assay moves the average across roughly 2 u, so a passing number genuinely
identifies the assay rather than merely the element.

### 4.3 World state — **the rack** (`RETROFIT-U1-U4.md` §4)

Six tube slots. A correct call **lights a tube in the colour that gas actually emits**,
computed by `wavelengthToRGB()` from that element's brightest line. A wrong call leaves the
slot dark, with the reason. Meter reads `jobs shipped: N of 6`. State words: *On schedule /
Behind / The customer walked*. Log stamp is an `HH:MM` shift clock — copy `clockLabel`
(`units/11-nuclear/js/main.js:123-126`) and its snapshot-at-commit idiom, so verdict text
stays truthful about when the call was made.

This is the most valuable thing in the unit: **the rack is literally the chemistry**, because
the colour is computed from the real emission line rather than chosen.

**Decide and document what happens on the seventh correct call.** Six slots against six core
skills × three scenarios means the rack fills long before the unit is exhausted, and
`RETROFIT-U1-U4.md` does not say. Recommended: the rack is *today's* six jobs — when it
fills, the shift ends, the log records "six shipped, on schedule", and it resets with the day
advanced. That keeps the meter meaningful instead of pinned at 6/6 for the rest of the
session. Whatever you choose, put the reasoning in a comment; a silently-capped meter reads
as a bug.

Mechanics:

- **The rack SVG must be string-built and injected with `x-html` on a `<g>`.** Alpine's
  `x-for`/`x-if` do not bind scope inside `<svg>` (`RETROFIT-U1-U4.md` §8 trap 2).
- The rack fills the `systems` grid area of `.life-support-board`. Keep the shell's
  header / crew / systems / consequence / log areas; only what fills `systems` changes.
- `recordWorld({ icon, tone, text, effect })` keeps Unit 1's signature; **the body is a
  per-unit rewrite**. Unit 2's `effect` entries carry slot / colour / minutes rather than
  Unit 1's concentrations: a correct call lights the next slot and costs shift minutes, a
  wrong call costs roughly three times the minutes and leaves the slot dark. Structure from
  `units_new/01-practices-matter/js/main.js:182-215`; clock from
  `units/11-nuclear/js/main.js:116-122`.

---

## 5. Decisions already made — implement, do not re-litigate

1. **The C.6(A) `SE` row changes `mode` from `'build'` to `'models'`**
   (`units/02-atomic-structure/js/model.js:70`). This is the **only** `mode` edit permitted
   anywhere in the retrofit. Every other `code` / `mode` / `honors` / `text` stays
   byte-identical; you are only adding `id`s.
2. **`SE` display order is A, B, D, C, E, C.5(B)** — mass precedes spectra — so ids read
   **a, b, d, c, e, f** down the rail. Intentional; do not "fix" it. Your `skills` array in
   `main.js` must use the same ids, because `game.js` keys mastery on them.
3. **Promote one photon-energy commit to core.** C.6(C) verbatim requires the
   energy / frequency / wavelength relationship, and today it lives only in Honors. Core
   becomes identity (name the gas) then dose (commit E in joules); the level diagram and the
   eV conversion stay in Honors.
4. **Transition metals get explicit handling, not an `x-show`.** `BUILD_SET` contains Z 24,
   26, 29 and 30, and the shipped valence MCQ is hidden for all four
   (`units/02-atomic-structure/index.html:369`). Resolution: **`f` (C.5B, family behaviour)
   pins `cfgZ` to main-group elements** — families are a main-group idea and forcing it
   elsewhere would be false — **while `e` (C.6E, configuration) may use transition
   elements**, which is exactly where configuration gets interesting and where
   `CONFIG_EXCEPTIONS` lives. Never ship a scenario that renders a bench with nothing to
   commit.
5. **`config` carries two core skills in one bench, so the mission screen needs a rule.**
   `activeBrief` and `activeVerdict` are keyed by `mode`
   (`units_new/01-practices-matter/js/main.js:270`, `:278`), and this bench has two briefs
   and three commits (`e`, `f`, `h2`). Do not fall back to a fixed precedence — see trap 3.
   Recommended: split the bench into two labelled sub-sections, each with its own brief card
   rendered *in the console*, and have the mission screen show the brief and verdict of
   whichever sub-section was touched last, tracked the way `modeVerdict` tracks verdicts.
   Comment it: this is the one place Unit 2's shell usage diverges from Unit 1's.

---

## 6. The pattern to follow

### Files to create

```
units_new/02-atomic-structure/
  index.html          cockpit markup
  css/style.css       Unit 2 bench styles only
  js/model.js         five pools + ids + BANDS + SHOP + EVIDENCE + SCENARIOS (21)
  js/main.js          view-model
  js/art.js           21 scene banners, 400x150
  js/case.js          copy of units/02-atomic-structure/js/case.js, cta.call fixed
```

### Landmarks in the worked example

Re-verify these before using them; they drift if Unit 1 is edited.

| Pattern | `units_new/01-practices-matter/js/main.js` |
|---|---|
| skills array / `createGame` spread | `:70` / `:84` |
| `modeVerdict` field + rationale | `:103-110` |
| `nextScenario(skill)` | `:168` |
| `recordWorld({icon, tone, text, effect})` | `:182` |
| derived world health | `:235` |
| rail rows | `:249` |
| `activeBrief` / `activeVerdict` | `:270` / `:278` |
| `activeReference` (mission-screen fact card) | `:312` |
| dose commit | `logDose` `:418` |
| dose + decision commit | `certifySample` `:576` |
| Honors precondition-then-decision commit | `certifyH1` `:618` |
| capstone gate / generate / commit | `:752` / `:757` / `:798` |
| verdict-dial specs | `mGauge` `:409`, `dGauge` `:548`, `evGauge` `:689` |

### Paths (one level deeper than the prototype)

- `index.html` → `../../shared/css/{tokens,base,components,casefile}.css`, then
  `../shared/cockpit.css`, then `css/style.css`
- `index.html` modules → `../../shared/js/{render,gauge,casefile}.js`
- `js/*.js` → `../../../shared/js/{chem,game}.js`
- `unitId: 'units_new/02-atomic-structure'`

### Module bootstrap

Copy `units_new/01-practices-matter/index.html:526-543` verbatim and change the paths. The
`window.deferLoadingAlpine` shim, `registerRender`, `registerGauge` and **`mountCaseFile`
before `Alpine.start()`** are all load-bearing — the case file injects markup carrying its
own `x-data`, so a late mount leaves the story inert.

### Station strip markup

Seven tabs (models, build, spectra, mass, config, capstone, case file) — the same count as
Unit 5, so the two-label swap is required:

```html
<button class="tab" role="tab" :aria-selected="mode==='spectra'" @click="setMode('spectra')"
        aria-label="Emission spectra" title="Emission spectra · C.6(C) light and energy levels">
  <span class="tab-full" aria-hidden="true">Emission spectra</span>
  <span class="tab-short" aria-hidden="true">Spectra</span></button>
```

The capstone tab also takes `:class="{ 'is-locked': !capUnlocked }"`; the shell draws the
lock dot as a `::after`, not a text node.

### The `effect` map

Unit 5 carries one `stock` name plus one signed `delta`, because every station there feeds a
0-100 ship system. Unit 1 replaced it with a per-outcome partial, because its readings are
different physical quantities and one task can move two of them. Unit 2 needs the same
freedom — a call both lights a slot and burns shift minutes. See
`units_new/01-practices-matter/js/model.js:116-129` for the rationale comment and `:142`
(dose), `:185` (identity), `:215` (decision), `:256` (Honors) for the shapes.

### Two new dials to add

Beyond the six that transfer, each dose gets a verdict dial the way Unit 1's benches do:

- **mass** — the committed average on the `isoMassAxis`, `ref: iso.accepted`, with the
  isotope masses as named `bands`. This is Unit 1's density dial applied to isotopes: a
  number on that axis *is* an assay.
- **spectra** — committed photon energy against the true line energy, reusing
  `specAxis.eLo/eHi` so it shares the strip with the three gauges already there.

### Scene art

21 banners, `viewBox="0 0 400 150"`, `aria-hidden="true"`, one per scenario id. A fresh set —
do not re-export. Copy the scaffolding from `units_new/01-practices-matter/js/art.js`:
`kit(id)`, `scene(id, {caption, body, theme})`, and the `mono()` / `panelBox()` / `flow()`
primitives. Swap Unit 1's aquarium signatures for shop ones — a bench-top signature for "in
the back room", a cylinder-shelf signature for the gas shelf — plus primitives for a glass
tube, a gas cylinder, a spectroscope, a CRT and a coil of copper wire.

**Glowing tubes must use `wavelengthToRGB` on the real brightest line**, the same computation
the rack uses, so the art and the world-state cannot disagree.

Non-negotiable: per-scene id prefixes on every gradient and clip (Alpine keeps every panel in
the DOM, so unprefixed ids bleed between scenes), lighting from the upper left, and
**nothing below `y = 102`** — see trap 7.

> **Cost control.** 21 hand-drawn banners is the largest single line item in the unit. If it
> squeezes the work that matters, the honest saving is to give `e` and `f` two scenarios each
> instead of three — they share the `config` bench and often the same object on the table —
> taking the set to 19. Do **not** save by dropping the per-scene `<defs>` namespacing (it
> breaks rendering) or by reusing one banner across different scenario ids (the brief and the
> picture then disagree).

---

## 7. Traps found building Unit 1 (not in `RETROFIT-U1-U4.md`)

`RETROFIT-U1-U4.md` §8's twenty traps still apply on top of these.

1. **The shell's active console panel collapses its first grid row.** `cockpit.css` sets
   `.chem-console > .panel.is-active { display: grid; grid-template-rows: minmax(0, auto); }`
   and that first track resolves to **0px**. It never mattered in Unit 5, because every panel
   there opens with the `.brief` card, which the shell hides — so the collapsed row only ever
   held an invisible element. **Any panel opening with real content draws it on top of the
   block below.** Fix in the unit's own stylesheet:
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
   returns `this.modeVerdict[this.mode]`. **Unit 2's `config` bench has three commits
   (`e`, `f`, `h2`), so here this is a correctness requirement, not a nicety** — see §5.5.

4. **KaTeX inflates `documentElement.scrollHeight`.** `.katex-mathml` is `position:absolute`
   and 1px; with no positioned ancestor it resolves against the initial containing block,
   lands past the fold, and reads as a phantom page scroll on a shell that must have none.
   Give the wrapper `position: relative` — Unit 1 does it on `.eqn`. **Unit 2 will hit this**
   in the Honors E = hν block.

5. **Station labels only fit at ≥1536 CSS px**; below that the strip shows the one-word names
   via the `.tab-full` / `.tab-short` swap. Separately, `grid-auto-columns: minmax(0, 1fr)`
   must revert to `auto` below 1120px, or the longest *short* label ellipses at 1024×600.
   Both rules already ship in `cockpit.css` — use the markup, do not re-derive them.

6. **`--fs-xs` is 12.5px and the layout contract's floor is 14px.** The old units set
   reference cards, figure captions and table cells at `--fs-xs` throughout. Anything inside
   `.chem-console > .panel.is-active` or `.mission-screen` needs `--fs-sm` (≈14.08px). Expect
   to bump `.ref-title`, `.model-idea`, `.model-head .mono`, `.stp-label`, `.stp-sub`,
   `.iso-name .muted`, `.spectrum-cap`, `.line-chip` and `table.data.mini`.

7. **Scene art below `y = 102` is eaten by the caption scrim.** `scene()` paints a scrim from
   y=102 to 150 so the mono caption at y=138 reads. A label at y=110 comes out ~40% faded; at
   y=116 the audit reports it occluded. Keep every subject and in-scene label at **y ≤ 100**.

8. **The layout test clicks tabs by `aria-label`.** If the `stations` array in its `TARGETS`
   entry does not match the tabs' `aria-label` values *exactly*, every miss burns Playwright's
   30s click timeout — a run takes 25 minutes instead of 6 and audits the wrong station. Copy
   the aria-labels; do not type the visible short words.

9. **The right rail is height-tight at 1024×600.** Two-word row labels wrapped to two lines
   and pushed the log out of the viewport. Keep rail labels short and put the full meaning in
   the row's `title`.

10. **`photonEnergy` takes a destructured object, and metres rather than nm** —
    `photonEnergy({ wavelength: nm * 1e-9 })` (`shared/js/chem.js:519`). The result is
    ~1e-19 J, which is why §4.2 grades it on a relative band.

---

## 8. Build order

1. **`js/case.js`** — copy, fix `cta.call`, update the header comment. Cheapest win, and it
   proves the path depth is right before anything expensive depends on it.
2. **`js/model.js`** — the five pools unchanged; `id`s on `SE` plus the one permitted `mode`
   edit; the three `BANDS` consts; a `SHOP` facts object (Unit 1's `TANK` analogue: shift
   start and length, tube count, the jobs due); `EVIDENCE` for the new `models` bench; then
   all 21 `SCENARIOS` with `effect` maps. Parse-check as you go:
   `node --input-type=module -e "import('./js/model.js').then(m=>console.log(m.SCENARIOS.length))"`.
3. **`js/main.js`** — `createGame` spread and `skills` (ids `a, b, d, c, e, f, h1, h2, cap`);
   the rack world-state and shift clock; the plumbing getters; then **one bench at a time**,
   smoke-testing each in Node before moving on — construct the sim, `init()`, drive a correct
   and an incorrect commit, print the verdict and the rack.
4. **`js/art.js`** — the 21 banners. Render them all onto one contact-sheet page and *look at
   it* before wiring anything in; one screenshot catches scrim, collision and defs-bleed bugs
   that are invisible one scene at a time.
5. **`index.html`** — cockpit markup; benches in the centre column with the six transferred
   gauges intact; rack in the rail.
6. **`css/style.css`** — the bench classes, then traps 1, 2, 4 and 6.
7. **`tests/unit5a-layout.test.mjs`** — add the fourth `TARGETS` entry (see `:54-77`), then
   fix what it finds.

## 9. Verification — four gates, all must pass

```bash
npm test
```
Unchanged against the baseline you took at the start. If `casefile` moves *down*, your `CASE`
copy has an em-dash or a missing field; if it moves *up* by about 16, that is your own
`NEW_TREE` registration landing, which is correct.

```bash
PW_ROOT=../Lab_studio node tests/unit5a-layout.test.mjs
```
Must print `cockpit layout: PASS - N states clean across 4 builds`. Eight viewports × every
station × Honors on and off: no document scroll, nothing clipped, occluded or ellipsed,
nothing under 14px, no dead gaps. It caught four real defects in Unit 1 that screenshots at a
single viewport had missed. About six minutes; if it takes twenty, see trap 8.

```bash
py -3.13 -m http.server 8091
```
Walk every station by hand at 1536×864, Honors on and off, committing **right and wrong** on
each bench. Confirm: the rack lights in the correct emission colour; the shift clock
advances; the log stamps `HH:MM`; all six transferred gauges still move; the three spectral
gauges still swing λ against ν and E; the `config` bench's three commits each show their own
verdict; the case file opens and its CTA returns you to `spectra`.

```bash
find units unit5a-codex shared -newermt "<start time>" -type f
```
Must be empty.

## 10. Done means

- `units_new/02-atomic-structure/` runs standalone; nothing in it imports from `units/`.
- **Every C.6 sub-letter and C.5(B) has a graded commit**, including on the four transition
  elements in `BUILD_SET`. This is the bar the shipped Unit 2 does not clear.
- All six transferred gauges work, and the three spectral gauges still share one axis.
- The rack lights in real emission colours from `wavelengthToRGB`, and what happens when it
  fills is decided and commented.
- The capstone's correct answer is a function of the rack the learner built.
- All four gates green.
- `units_new/README.md` gains a Unit 2 section in the same shape as Unit 1's.
- **Anything you learn that Units 3 and 4 will also hit gets appended to §7 of this file**,
  so the next handoff starts from a longer list than this one did.
