# Handoff · port `units/09-acids-bases` → `units_new/09-acids-bases`

Class B. Read [HANDOFF-PORTING.md](HANDOFF-PORTING.md) first; this file is only what is
specific to Unit 9.

---

## Identity

- **Unit 9 · Acids & Bases**, TEKS C.12
- `unitId: 'units_new/09-acids-bases'`
- Source: 160 KB across five files; `js/model.js` is **48 KB — the second-largest data model
  in the tree** — and `js/main.js` is 43 KB.

## Stations

Seven tabs, so the strip is at Unit 5's density and the two-label swap matters.

| Mode | Skill | Full | Short |
|---|---|---|---|
| `naming` | `a` C.12(A) | Naming | Naming |
| `define` | `b` C.12(B) | Definitions | Define |
| `strength` | `c` C.12(C) | Strong vs weak | Strength |
| `neutralize` | `d` C.12(D) | Neutralize | Neutral. |
| `meter` | `e` C.12(E) | pH meter | Meter |
| `capstone` | `cap` | Triage | Triage |
| `casefile` | — | Case file | Case |

Skills: `a, b, c, d, e, h1, h2, cap` — `h1` titration curve, `h2` weak-acid Ka.

## Scenarios and art

**16 banners** — `a` 3, `b` 2, `c` 3, `d` 2, `e` 3, plus `h1`, `h2`, `cap`.

The world is a **night shift in an emergency department**: an acidotic patient arriving at
pH 7.20, drifting down 0.002 per minute while you work, on a clock that starts at 23:00 and
hands over at 07:00. Set signatures for `art.js`: one for **the bay** (the trolley, the
monitor, the drip) and one for **the bench** (bottles, a burette, a pH meter, strips).

## World state — the patient's arterial pH

The constants are all named at the top of `js/main.js` in the
`// ---- world-state constants: the patient, the reference window, the night clock` block:
`PH_START` 7.20, `PH_FLOOR` 6.80, `PH_CEIL` 7.44, the reference window `WIN_LO` 7.35 to
`WIN_HI` 7.45, `PH_CRASH` 7.10, the drawn scale `SCALE_LO` 6.80 to `SCALE_HI` 7.60,
`DRIFT_PER_MIN` 0.002, `SHIFT_START` 23:00, `SHIFT_LEN` 8 h.

Two details worth preserving carefully because they are easy to lose in a port:

1. **Correct calls titrate *into* the window and never past it** — that is what `PH_CEIL`
   7.44 is for. A unit that lets a good call overshoot into alkalosis is teaching the wrong
   thing.
2. **The clock stops at handover** rather than rolling past 07:00, so the log never stamps a
   line at lunchtime on a night shift.

Rail mapping: `header` = the state word plus the `HH:MM` chip; `crew` = the pH meter against
the reference window (this is the unit's headline figure — consider an `x-gauge` `span` with
`WIN_LO`/`WIN_HI` as named `bands`, which is exactly what the gauge component's band
feature is for); `systems` = the secondary readouts; `consequence` and `log` as usual.

## Unit-specific notes

- **`CASE.cta.call` is already `"setMode('meter')"`.** No change needed.
- **Chart.js** for the titration curve (Honors `h1`) and **three.js** on one stage. Both stay
  at module scope (`RETROFIT-U1-U4.md` §8 trap 7); both need an explicit wrapper height and a
  resize on `setMode` in the cockpit. See trap 12, which by the time you reach Unit 9 should
  record what Units 4 and 10 actually did.
- **Five core benches plus two Honors** means `strength` and `meter` (or wherever `h1`/`h2`
  ride) carry two commits: trap 3 applies.
- The salt-formula builder (`// Build a neutral salt formula from a cation token + its
  subscript and an anion`) is used by the `neutralize` bench and is pure string work — it
  ports unchanged.
- 48 KB of `model.js` is mostly acid/base pools. Copy it wholesale; do not prune.

## Done means

The four gates in [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §3, plus:

- The pH readout drifts down while you work and titrates into the window without overshoot.
- The clock stops at 07:00.
- The titration-curve chart renders and rescales.
- Both Honors commits show their own verdict.
- `README.md` gains a Unit 9 section.
