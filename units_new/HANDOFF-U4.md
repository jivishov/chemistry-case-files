# Handoff · port `units/04-bonding-geometry` → `units_new/04-bonding-geometry`

**Status: done.** `units_new/04-bonding-geometry/` is built, registered in the hub's `BUILT`
list, in `tests/unit5a-layout.test.mjs`'s `TARGETS` and in `tests/casefile.test.js`'s
`NEW_TREE`, and all four gates pass (`npm test` clean, `cockpit layout: PASS - 416 states
clean across 4 builds`). What it learned is in the porting doc's trap list as entries 13-17,
and trap 12 is rewritten from its actual canvas fix. This file is kept as the record of what
the job was.

Class B. Read [HANDOFF-PORTING.md](HANDOFF-PORTING.md) first; this file is only what is
specific to Unit 4.

**It was the right one to do first of the class-B set.** It is the retrofit's own pilot unit,
so its Scenario layer is the most carefully built in the repo, and it has **no Chart.js** —
which isolated the three.js half of trap 12 without the canvas-sizing question arriving twice
at once.

---

## Identity

- **Unit 4 · Bonding, Nomenclature & Geometry**, TEKS C.7
- `unitId: 'units_new/04-bonding-geometry'`
- Source: 144 KB across five files. `js/model.js` is 39 KB — the compound, geometry and IMF
  pools — and `js/main.js` is 30 KB.

## Stations

Six tabs. Full label / short label / `aria-label` (which must be the full label, exactly, and
must match the `stations` array you add to the layout audit):

| Mode | Skill | Full | Short |
|---|---|---|---|
| `bond` | `a` C.7(A) | Bond type | Bond |
| `name` | `b` C.7(B) | Naming | Names |
| `geometry` | `c` C.7(C) | 3D geometry | Shapes |
| `forces` | `d` C.7(D) | Forces & properties | Forces |
| `capstone` | `cap` | The last bottle | Bottle |
| `casefile` | — | Case file | Case |

Skills: `a, b, c, d, h1, h2, h3, cap`. Three Honors rows — `h1` % ionic character (rides
`bond`), `h2` molecular polarity (rides `geometry`), `h3` intermolecular forces (rides
`forces`) — so **three benches carry two commits each**. Trap 3 (`modeVerdict` by recency)
is mandatory here, not optional.

## Scenarios and art

**19 banners** — `a` 4, `b` 3, `c` 4, `d` 4, plus `h1`, `h2`, `h3`, `cap`.

The world is **"Move-In Week" · your first apartment** (`RETROFIT-U1-U4.md` §3, lines
129-226). Set signatures for `art.js`: one for **under the sink** (the cupboard where the
bottles live, where the consequence lands) and one for **the kitchen counter** (where the
work happens). Bottles, labels, a kettle, a pan, a drain.

## World state — the shelf

Twelve container slots (`shelf: Array(SHELF_SLOTS).fill(null)`, `js/main.js`, in the
`// ---- world-state: the shelf under the sink` block), plus `day` and `calls`.

A correct call turns a slot into a labelled bottle carrying its icon, name, formula and one
property line. A wrong call flags it with the failure it caused, and **it stays flagged**.
Meter: `labeled: N of 12`. State words: *Nothing broken yet / Two things went wrong / This
place is a hazard*. Log stamp: `Day N:`.

The shelf goes in the rail's `systems` grid area as a **string-built SVG injected with
`x-html` on a `<g>`** — twelve slots is more than a meter row and less than a figure, so
draw it as a small grid of bottle silhouettes with the flagged ones struck.

## Unit-specific notes

- **`CASE.cta.call` is `"mode='geometry'"` and must become `"setMode('geometry')"`.**
- **three.js.** The 3D geometry viewer uses `shared/js/stage3d.js`. Its instance stays at
  module scope, outside Alpine's reactive proxy (`RETROFIT-U1-U4.md` §8 trap 7) — do not
  "tidy" it onto the component. In the cockpit its canvas needs an explicit wrapper height
  and a resize call on `setMode`; a WebGL canvas laid out while its panel was `display:none`
  measures zero and stays zero. This was the first port to solve it, and trap 12 in
  [HANDOFF-PORTING.md](HANDOFF-PORTING.md) is now written from what worked here: an explicit
  `clamp()` height on `.stage`, an exported `resize()` on the viewer, and both the mount and
  the re-measure going through `setMode()` inside `$nextTick`.
- **`bondType` and the `METALS` set.** `RETROFIT-U1-U4.md` §7.1 records that the shared fix
  widening `METALS` landed, and that its stated justification did not hold, because Unit 4's
  two bond selects iterate the unit's own 21-element `ELEMENTS` from `js/model.js` rather
  than the 37 in `shared/js/chem.js`. Nothing to do; noted so you do not re-open it.
- **`<select x-model>` binds before its `x-for` options exist** (`RETROFIT-U1-U4.md` §8 trap
  3). Unit 4 already applies the `$nextTick` fix, and scenarios drive `bondA` / `bondB` /
  `molKey`. **Keep the `$nextTick` re-apply as the last statement of `init()`.**

## Done means — and what each one turned out to be

Everything in [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §3's four gates, plus the five below.
All verified:

- **The 3D viewer spins in the console column, resizes with the panel, and does not leak a
  second WebGL context.** It does. Measured at 1536×726: a 625×194 drawing buffer on first
  open, and still 625×194 with exactly one context after leaving the station and coming back,
  and again after the Case File's `setMode('geometry')` CTA. See trap 12.
- **All three Honors commits show their own verdict (trap 3).** They do, and the port went
  one step further: the mission screen follows recency for the *scenario* too, so `h1`, `h2`
  and `h3` each put their own banner on screen. Without that those three banners are drawn
  and never seen — which is trap 17, and the state Unit 1 is still in.
- **The shelf fills, flags stay flagged, and `Day N:` stamps the log.** Yes. Walked with 12
  commits across all five benches: `labeled`/`flagged`/`cleared` all move, a flagged slot
  stays struck, and the log reads `Day 1: The white jar, called polar covalent. It is ionic.`
- **`README.md` gains a Unit 4 section.** Done.
- **Trap 12 in the porting doc is rewritten from what you actually did.** Done, and traps
  13-17 were added on top of it.
