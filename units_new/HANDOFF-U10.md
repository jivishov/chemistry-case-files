# Handoff · port `units/10-thermochemistry` → `units_new/10-thermochemistry`

Class B. Read [HANDOFF-PORTING.md](HANDOFF-PORTING.md) first; this file is only what is
specific to Unit 10.

**Do this one second of the class-B set.** It is the implementation the whole retrofit was
modelled on — `RETROFIT-U1-U4.md` §6.2 quotes it as the source for `nextScenario`,
`seCaption`, `capUnlocked` and the world-state-IS-the-chemistry pattern. It has **Chart.js
and almost no three.js**, so it isolates the canvas half of trap 12.

---

## Identity

- **Unit 10 · Thermochemistry**, TEKS C.13
- `unitId: 'units_new/10-thermochemistry'`
- Source: 124 KB across five files; `js/model.js` 37 KB, `js/main.js` 27 KB.

## Stations

| Mode | Skill | Full | Short |
|---|---|---|---|
| `laws` | `a` C.13(A) | Read the situation | Situation |
| `pack` | `c` C.13(C) | Pick the pack | Pack |
| `warm` | `d` C.13(D) | Size the heat | Heat |
| `calorimeter` | `b` C.13(B) | Calorimetry | Calorim. |
| `capstone` | `cap` | The call | Call |
| `casefile` | — | Case file | Case |

Skills: `a, b, c, d, h1, h2, cap`. Note the tab order is `laws, pack, warm, calorimeter` —
skills `a, c, d, b`. Like Unit 2's A/B/D/C ordering, that is display order, not a mistake.

Honors `h1` (Hess's law) and `h2` (formation enthalpy) look their scenarios up by fixed id
(`SCENARIOS.find(s => s.id === 'h1-route')`, `'h2-formation'`) rather than through
`nextScenario`, and `scIdx` is seeded with **core skill ids only**. That is the pattern the
whole retrofit copied; do not "fix" it.

## Scenarios and art

**21 banners** — `a` 8, `b` 3, `c` 4, `d` 3, plus `h1`, `h2`, `cap`.

Eight scenarios on `a` is the largest single-skill pool in the tree, because the four-laws
bench cycles two situations per law. Budget for it: `a` alone is more art than Unit 7 needs
in total.

The world is a **cold-water rescue**: a hypothermic patient you are trying to rewarm. Set
signatures for `art.js`: one for **the scene** (open water, a shoreline, a blanket, an
ambulance bay) and one for **the bench** (packs, a calorimeter, a thermometer).

## World state — the patient's core temperature

`core` (starting at `CORE_START`) and `elapsed`, in the `// ---- world-state: the patient you
are trying to rewarm` block of `js/main.js`. Correct calls raise the core; wrong calls cost
minutes and let it fall. `recordWorld({icon, tone, text, delta})` here binds `this.elapsed`,
`this.core` and the module consts `CORE_MIN`/`CORE_MAX`, and hardcodes a `T+n min:` stamp.

`RETROFIT-U1-U4.md` §6.2 is explicit that only two lines of that body are portable and the
rest is per-unit — but **Unit 10 is the unit it was written for, so here it ports verbatim**.
Keep the `T+n min:` stamp; it is this unit's clock.

Rail mapping: `header` = the state word plus the `T+n` chip; `crew` = the core-temperature
meter with a face; `systems` = the secondary readouts; `consequence` and `log` as usual.

`capUnlocked` (`js/main.js:470`), `genCapstone` (`:471-483`) and `capCommit` are the
originals every other unit copied. `movable = this.core >= 33` is the line that makes the
capstone's correct answer a function of the world the learner built — preserve it exactly.

## Unit-specific notes

- **`CASE.cta.call` is already `"setMode('warm')"`.** No change needed.
- **Chart.js.** One chart instance, at module scope. Keep it there
  (`RETROFIT-U1-U4.md` §8 trap 7). In the cockpit it needs an explicit wrapper height and a
  resize call on `setMode` — a canvas laid out while its panel was `display:none` measures
  zero and stays zero. **If you do Unit 10 before Unit 4, you are the first port to solve
  the canvas question: write down what worked and replace trap 12 in
  [HANDOFF-PORTING.md](HANDOFF-PORTING.md) with it.**
- **Two commits on `warm` and on `laws`** once Honors is on, so trap 3 (`modeVerdict` by
  recency) applies.
- The energy-diagram figure on `pack` is an SVG, not a canvas — it ports as markup.

## Done means

The four gates in [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §3, plus:

- The chart renders on first paint of its bench and rescales when the panel resizes.
- The core temperature rises on a correct call and falls on a wrong one; the `T+n min:`
  clock advances; the capstone's correct answer still keys off `core >= 33`.
- Both Honors commits show their own verdict.
- `README.md` gains a Unit 10 section.
