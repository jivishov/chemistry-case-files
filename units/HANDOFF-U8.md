# Handoff · port `units/08-solutions` → `units_new/08-solutions`

Class B. Read [HANDOFF-PORTING.md](HANDOFF-PORTING.md) first; this file is only what is
specific to Unit 8.

**Do this one after the strip has been proven at seven tabs.** Unit 8 has **eight**, which is
one more than any unit built so far and the worst case for the station strip. See the
station-strip note below — it is the one thing in this port that may need a change to the
shared `cockpit.css`.

---

## Identity

- **Unit 8 · Solutions & Solubility**, TEKS C.11
- `unitId: 'units_new/08-solutions'`
- Source: 140 KB; `js/model.js` 38 KB, `js/main.js` 38 KB.

## Stations — eight tabs

| Mode | Skill | Full | Short |
|---|---|---|---|
| `dissolve` | `a` C.11(A) | Water polarity | Polarity |
| `types` | `b` C.11(B) | Solution types | Types |
| `curve` | `c` C.11(C) | Solubility curves | Curves |
| `precip` | `d` C.11(D) | Precipitation | Precip |
| `molarity` | `e` C.11(E) | Molarity | Molarity |
| `dilute` | `f` C.11(F) | Dilution | Dilution |
| `capstone` | `cap` | Batch run | Batch |
| `casefile` | — | Case file | Case |

Skills: `a, b, c, d, e, f, h1, h2, cap` — six core skills, `h1` Ksp / common ion, `h2`
crystallization.

> **The station strip has never carried eight tabs.** It is a single-row grid with
> `overflow: hidden`; the full labels already only fit at ≥1536 px with seven, and the short
> labels were measured at 1024×600 with seven. **Measure before you assume**: load the ported
> page, then in the console read `scrollWidth - clientWidth` for every `.tab` at 1920, 1536,
> 1366 and 1024. If eight short labels do not fit at 1024, the honest fixes in order of
> preference are (1) shorter short-labels, (2) a third, two-or-three-letter label tier below
> some breakpoint, (3) letting the strip wrap to two rows below 1120 px and giving the header
> the extra height. **Do not** let a tab ellipse — the layout audit fails on it, and two
> clipped labels can read as the same tab.

## Scenarios and art

**18 banners** — `a` 3, `b` 3, `c` 3, `d` 2, `e` 2, `f` 2, plus `h1`, `h2`, `cap`.

The world is a **municipal water plant under a manganese notice**: 0.42 mg/L in the finished
water on day three, against a 0.05 mg/L secondary standard. Set signatures for `art.js`: one
for **the plant** (the clearwell, a weir, pipework, the notice on the door) and one for
**the bench** (volumetric flasks, a burette, standards, a balance).

## World state — the clearwell

Named at the top of `js/main.js` in the
`// ---- world-state constants: the clearwell, the secondary standard, the shift clock`
block: `MN_START` 0.42 mg/L, `MN_LIMIT` 0.05 (the standard the notice is measured against),
`MN_MAX` 0.50 (the far end of the meter, 0 % full), `DAY_START` 3, `JOBS_PER_DAY` 4.

`JOBS_PER_DAY = 4` is why the log stamps a believable date rather than advancing a day per
commit — preserve it; a log that ages a week in an afternoon reads as a bug.

Rail mapping: `header` = the state word plus the day chip; `crew` = the manganese meter,
inverted (100 % at 0 mg/L, 0 % at `MN_MAX`) — a good candidate for an `x-gauge` `span` with
`MN_LIMIT` as the `ref` and `refLabel: 'the secondary standard'`; `systems` = the secondary
readouts; `consequence` and `log` as usual.

## Unit-specific notes

- **`CASE.cta.call` is already `"setMode('curve')"`.** No change needed.
- **Chart.js** for the solubility curves — the `curve` bench is built on it, so this is the
  unit where a mis-sized canvas is most visible. **three.js** on the dissolving stage. Both
  at module scope (`RETROFIT-U1-U4.md` §8 trap 7); both need explicit wrapper heights and a
  resize on `setMode`. By Unit 8, trap 12 in the porting doc should record what Units 4, 10
  and 6 actually did — follow it rather than re-deriving.
- **Six core benches** is the most in the tree, so the console has six panels plus the
  capstone. Every one opens with real content: trap 1 (`display: block !important`) applies
  to all of them.
- `h1` and `h2` ride existing benches, so at least two benches carry two commits: trap 3.

## Done means

The four gates in [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §3, plus:

- **Eight tabs measured at 1920, 1536, 1366 and 1024 with zero ellipsis**, and whatever
  change that needed written up in [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §4 for Units 9
  and 11.
- The solubility-curve chart renders and rescales; the dissolving stage renders.
- The manganese meter falls toward the standard on correct calls; the log advances one day
  per four jobs.
- Both Honors commits show their own verdict.
- `README.md` gains a Unit 8 section.
