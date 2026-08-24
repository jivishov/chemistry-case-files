# Handoff · port `units/06-reactions-stoichiometry` → `units_new/06-reactions-stoichiometry`

Class B. Read [HANDOFF-PORTING.md](HANDOFF-PORTING.md) first; this file is only what is
specific to Unit 6.

---

## Identity

- **Unit 6 · Reactions & Stoichiometry**, TEKS C.9
- `unitId: 'units_new/06-reactions-stoichiometry'`
- Source: 116 KB across five files; `js/model.js` 27 KB, `js/main.js` 31 KB.

## Stations

| Mode | Skill | Full | Short |
|---|---|---|---|
| `balance` | `a` C.9(A) | Balance | Balance |
| `classify` | `b` C.9(B) | Classify | Classify |
| `stoich` | `c` C.9(C) | Stoichiometry | Stoich |
| `lr` | `d` C.9(D) | Limiting reactant | Limiting |
| `capstone` | `cap` | The tanker | Tanker |
| `casefile` | — | Case file | Case |

Skills: `a, b, c, d, h1, h2, cap` — `h1` particle counts, `h2` excess recovery.

**Unit 6 has no `SE` export.** Its standards map lives entirely in the `skills` array in
`js/main.js:24-32`. The cockpit header's TEKS popover iterates `coreSkills`, which Unit 1
derives from `SE` — so here derive it from `g_skillDefs` instead, filtering `!honors`, and
give each row the `text` the popover shows. Either add an `SE` export to the ported
`model.js` (preferred: it matches every other unit) or point `coreSkills` at
`g_skillDefs`. Say which in a comment.

## Scenarios and art

**15 banners** — `a` 3, `b` 3, `c` 3, `d` 3, plus `h1`, `h2`, `cap`.

The world is a **rural fire-and-rescue rotation**: an engine with 50 kg of soda ash, a shift
clock starting at 06:00, and the county's mutual-aid tanker capped at 180 kg
(`START_SODA`, `SHIFT_START`, `AID_CAP` in `js/main.js`). Set signatures for `art.js`: one
for **the roadside** (the spill, the engine, cones, a placard) and one for **the pump panel**
(gauges, hose, the soda-ash hopper).

## World state — the truck

`START_SODA` kg of soda ash on the engine, a shift clock from 06:00, and the mutual-aid
tanker as the capstone's resource. A correct call spends the right mass and buys time; a
wrong one wastes stock and minutes.

Rail mapping: `header` = the state word plus the `HH:MM` chip; `crew` = the soda-ash meter;
`systems` = the secondary readouts; `consequence` and `log` as usual.

## Unit-specific notes

- **`CASE.cta.call` is `"mode='stoich'"` and must become `"setMode('stoich')"`.**
- **The limiting-reactant generator is precomputed at module load and is load-bearing.**
  Read the comment above it in `js/main.js`: sweeping both reactant masses from 5 g to 40 g
  in 5 g steps across the nine two-reactant reactions gives 576 cells, of which 13 put the
  wrong-reactant error under 5% — where no band can separate a right answer from a wrong
  one. Those cells are excluded by construction. **Do not regenerate, re-sweep or "simplify"
  that table during the port.** It is the reason the `d` bench grades honestly.
- **three.js** on the reaction stage. Instance stays at module scope
  (`RETROFIT-U1-U4.md` §8 trap 7); in the cockpit its canvas needs an explicit wrapper
  height and a resize on `setMode`. See trap 12 — and if Units 4 and 10 have already been
  ported, that trap now records what actually worked.
- **Unit 6 does use mhchem.** `units/06-reactions-stoichiometry/index.html` has eight
  `mhchem` / `x-ce` references, because the unit writes balanced equations. Carry over both
  the KaTeX mhchem contrib `<script>` and every `x-ce` binding — Unit 5's head is the model
  for the script tags. The "no mhchem" rule in the Unit 1-3 plans is about those units, not
  a tree-wide ban.
- Two commits on `stoich` and on `lr` once Honors is on: trap 3 applies.

## Done means

The four gates in [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §3, plus:

- Balanced-equation rendering is intact: the mhchem script loads and every x-ce binding renders.
- The limiting-reactant cell table is byte-identical to the source's.
- The soda-ash meter falls as you spend it and the `HH:MM` clock advances.
- Both Honors commits show their own verdict.
- `coreSkills` resolves without an `SE` export, or an `SE` export was added — and the choice
  is commented.
- `README.md` gains a Unit 6 section.
