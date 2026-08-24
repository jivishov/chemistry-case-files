# Handoff · port `units/07-gas-laws` → `units_new/07-gas-laws`

Class B. Read [HANDOFF-PORTING.md](HANDOFF-PORTING.md) first; this file is only what is
specific to Unit 7.

**Smallest art bill in the class-B set — 13 banners — and the heaviest rendering load.**
Chart.js, three.js and four existing `x-gauge` dials all in one unit. If the canvas question
from trap 12 is still unsolved when you reach this, do Unit 4 or Unit 10 first.

---

## Identity

- **Unit 7 · Gas Laws & Kinetic Theory**, TEKS C.10
- `unitId: 'units_new/07-gas-laws'`
- Source: 156 KB; `js/model.js` 33 KB, `js/main.js` 37 KB, `index.html` **45 KB — the largest
  markup file in the tree**, which is most of what the port rewrites.

## Stations

| Mode | Skill | Full | Short |
|---|---|---|---|
| `kmt` | `a` C.10(A) | Kinetic theory | Kinetics |
| `ideal` | `b` C.10(B) | Ideal gas law | Ideal gas |
| `dalton` | `c` C.10(C) | Partial pressures | Partials |
| `capstone` | `cap` | The last fill | Last fill |
| `casefile` | — | Case file | Case |

Five tabs — the lightest strip after Unit 3.

Skills: `a, b, c, h1, h2, h3, cap`. **Three Honors rows on three core benches** — `h1` speed
distribution (`kmt`), `h2` real-gas correction (`ideal`), `h3` gas over water (`dalton`) —
so **every core bench carries two commits**. Trap 3 (`modeVerdict` by recency) is mandatory.

## Scenarios and art

**13 banners** — `a` 3, `b` 3, `c` 3, plus `h1`, `h2`, `h3`, `cap`.

The world is a **dive-boat fill station**: a 200 atm storage bank, a day that starts at 06:00,
and a 1.4 atm ppO₂ working ceiling (`START_BANK`, `SHIFT_START`, `PPO2_LIMIT` at the top of
`js/main.js`). Set signatures for `art.js`: one for **the fill deck** (the bank, the whip,
tanks in a rack) and one for **the water** (the shot line, a diver, depth).

## World state — the bank

Storage pressure in the bank, drawn down by every fill, on a day clock. The ppO₂ ceiling is
what makes the `dalton` bench's calls matter: a blend that reads fine at the surface is a
hazard at depth.

Rail mapping: `header` = the state word plus the `HH:MM` chip; `crew` = the bank-pressure
meter; `systems` = the secondary readouts, ppO₂ among them; `consequence` and `log` as usual.

## Unit-specific notes

- **`CASE.cta.call` is already `"setMode('ideal')"`.** No change needed.
- **Four existing `x-gauge` dials — carry every one.** They are already the shell's own
  component, so they need no adaptation; just do not drop them while rewriting a 45 KB
  `index.html`. Diff the gauge specs before and after to be sure.
- **Chart.js *and* three.js in one unit.** Both at module scope
  (`RETROFIT-U1-U4.md` §8 trap 7); both need explicit wrapper heights and a resize on
  `setMode`. This is the unit where getting trap 12 wrong costs the most, which is why the
  index recommends doing it fourth rather than first.
- **The gas box.** `units/07-gas-laws/js/gasbox.js` is a sixth file the standard five-file
  layout does not cover. Carry it over and give it the same path fix as the rest
  (`../../../shared/...` for anything it imports).
- **The kinetic-theory bench animates**, and `units/07-gas-laws/css/style.css` carries its
  own `prefers-reduced-motion` guard on top of the shared one in
  `shared/css/components.css`. That guard is unit-local CSS, so it moves with the bench
  styles — do not drop it (`RETROFIT-U1-U4.md` §8 trap 9).

## Done means

The four gates in [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §3, plus:

- All four original gauges present and moving; diffed against the source's specs.
- Chart and 3D stage both render on first paint of their bench and resize with the panel.
- All three Honors commits show their own verdict.
- The bank falls as you fill; the ppO₂ ceiling still gates the blend calls.
- Reduced-motion still freezes the kinetic-theory animation.
- `README.md` gains a Unit 7 section.
