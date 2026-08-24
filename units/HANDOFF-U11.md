# Handoff · port `units/11-nuclear` → `units_new/11-nuclear`

Class B. Read [HANDOFF-PORTING.md](HANDOFF-PORTING.md) first; this file is only what is
specific to Unit 11.

**Do this one last of the class-B set.** It needs **31 scene banners** — half again as many
as any other unit — so it is the port to attempt when the art pipeline is fast and the
canvas question from trap 12 is already answered.

---

## Identity

- **Unit 11 · Nuclear Chemistry**, TEKS C.14
- `unitId: 'units_new/11-nuclear'`
- Source: 180 KB — **the largest unit in the tree**. `js/model.js` is 58 KB and
  `js/case.js` is **35 KB**, roughly triple any other case file; budget reading time for
  both.

## Stations

| Mode | Skill | Full | Short |
|---|---|---|---|
| `ident` | `a` C.14(A) | Identify the source | Identify |
| `dose` | `hl` C.14(C) | What is left | Decay |
| `apply` | `c` C.14(C) | Pick the isotope | Isotope |
| `power` | `b` C.14(B) | Fission or fusion | Power |
| `capstone` | `cap` | The last call | Last call |
| `casefile` | — | Case file | Case |

Skills: `a, b, c, hl, h1, h2, h3, cap`.

> **`hl` is a fourth core skill, not an Honors row.** `{ id: 'hl', code: 'C.14(C)', label:
> 'Half-life on the clock', target: 3 }` — no `honors: true` — so it counts toward the
> `gOverall() === 1` capstone gate, and `scIdx` is seeded `{ a, b, c, hl }`. Two core skills
> share the code C.14(C). Every other unit in the tree keys skills `a, b, c, d…`; this one
> does not. Do not normalise it.

Three Honors rows — `h1` decay series, `h2` binding energy, `h3` effective half-life — ride
existing benches, so several benches carry two commits: trap 3 (`modeVerdict` by recency) is
mandatory.

## Scenarios and art

**31 banners** — `a` 8, `b` 7, `c` 8, `hl` 4, plus `h1`, `h2`, `h3`, `cap`.

That is the single largest line item in the whole units_new programme. Three ways to keep it
honest, in order of preference:

1. **Build the set signature first and lean on it.** Unit 11's scenes are more similar to
   each other than Unit 1's were — a hot lab, a scanner suite, a corridor — so a strong pair
   of signatures plus per-scene subjects carries a long way.
2. **Draw the four `hl` and the four honors/capstone scenes last.** They are the ones a
   reviewer looks at closely; the 23 rotation scenes are seen in passing.
3. If it genuinely will not fit, **say so and ship 23**, leaving the `b`-skill scenes on a
   shared fallback banner — and record the shortfall in `README.md`. A missing banner renders
   as an empty frame, which is visible and honest; a rushed one is neither.

The world is a **nuclear-medicine morning**: one vial of technetium-99m decaying on the
clock while you work through the day's patients.

## World state — the vial and the clock

`vial`, `clockMin` and `patients`, in the
`// ---- world-state: the morning's vial and the clock eating it` block of `js/main.js`.

This unit's `recordWorld` has a **different signature from every other unit's** —
`recordWorld({ icon, tone, text, minutes, spend })` (`js/main.js:116`) — because the decay is
real: it calls `halfLifeRemaining(this.vial, minutes / 60, TC_HALFLIFE_H)` so the isotope
decays by exactly the time your call took, then subtracts what the call spent. A wrong call
costs roughly three times the minutes. **Port it as-is; do not convert it to Unit 1's
`effect` map.** The `effect` map exists for units whose readings are different physical
quantities; here there is one quantity and it obeys a physical law.

`clockLabel` (`:123-126`) is the `HH:MM` shift clock the whole retrofit borrowed. Keep the
snapshot-at-commit idiom that freezes the clock at decision time, so verdict text stays
truthful about when the call was made.

Rail mapping: `header` = `vialState` plus the `HH:MM` chip; `crew` = `vialPct` with
`vialMood`; `systems` = doses left and patients seen; `consequence` and `log` as usual.

## Unit-specific notes

- **`CASE.cta.call` is already `"setMode('dose')"`.** No change needed.
- **35 KB case file.** It is the longest story in the repo and it will dominate the case-file
  station's scroll. The shell already treats the story panel as a scroll port, so this is
  fine — but confirm the layout audit's story assertions still pass, especially "the
  workbench stood down" and "the story panel scrolls".
- **three.js** on one stage; module scope, explicit wrapper height, resize on `setMode`.
  No Chart.js.
- **58 KB `model.js`** is isotope and decay-chain data. Copy wholesale.
- `halfLifeRemaining` and the decay helpers come from `shared/js/chem.js` — path fix only.

## Done means

The four gates in [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §3, plus:

- The vial decays by real elapsed time, not by a flat per-call decrement; a wrong call costs
  about three times the minutes of a right one.
- The clock stamps `HH:MM` and is frozen at commit time in verdict text.
- All four core skills — including `hl` — gate the capstone.
- All three Honors commits show their own verdict.
- 31 banners, or a stated and documented shortfall.
- `README.md` gains a Unit 11 section.
