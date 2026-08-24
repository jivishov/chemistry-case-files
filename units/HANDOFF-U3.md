# Handoff · build `units_new/03-periodic-trends`

**Task.** Create Unit 3 under `units_new/`, carrying every piece of educational content from
`units/03-periodic-trends/` into the mission-cockpit shell, wrapped in the Scenario layer
`RETROFIT-U1-U4.md` §3 specifies: **"The Repair Bench"**.

Class A — Unit 3 has no Scenario layer. `units_new/01-practices-matter/` is the worked
example; [HANDOFF-U2.md](HANDOFF-U2.md) is the sibling plan and shares most of this shape.

---

## 0. Scope

Unit 3 is the **smallest class-A lift of the three**, and `RETROFIT-U1-U4.md` §6.5 says so:
its `SE` rows already carry `id`s, its `se-panel` already keys on `se.id`, and it already
filters Honors with `SE.filter(s => !s.honors || honors)`.

It arrives with **three graded checks** — `checkGap()` (`js/main.js:122`), `checkFq()`
(`:156`), `checkTq()` (`:225`) — one per core skill, all decisions. So unlike Unit 2, the
assessment *shape* is right; what is missing is the consequence layer around it, the two
Honors commits, and the capstone.

| | Scope |
|---|---|
| **Transfer** | the largest data model in the class-A set (20 KB, eleven pools), two Chart.js charts, the periodic-table figure and the family/trend CSS |
| **Build** | scenarios + world-state + verdicts around three checks that already grade correctly; two Honors commits from display-only material; the capstone |
| **Upgrade** | `TREND_QUIZ` from a fixed 7-item bank to generated pairs (§4.2) |
| **Author** | ~15 scene banners |

Budget: less than Unit 2, more than a class-B port. The data is already excellent; the work
is scenarios, consequences and art.

---

## 1. Hard constraints

Identical to [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §1: never modify `units/`,
`unit5a-codex/` or the repo-level `shared/`; `units_new/shared/cockpit.css` is shared; no
em-dashes in `CASE` copy; re-verify every line number any document gives you, including this
one.

## 2. Read, in this order

`units_new/README.md` → `units_new/01-practices-matter/js/{model,main,art}.js` →
`units_new/01-practices-matter/index.html` → `RETROFIT-U1-U4.md` §3 lines 313-354 (The
Repair Bench), §4, §5, §6.5, §8 → all five files in `units/03-periodic-trends/` → `TEKS.md`
for C.5.

```bash
npm test        # chem 286, game 36, casefile 299, gauge 149, molezoom 64, 0 failed
                # casefile rises ~16 per unit registered in NEW_TREE; re-baseline first
```

---

## 3. Inventory

### 3.1 Transfers as-is

**`js/model.js` — eleven pools, 20 KB, the richest data set in the class-A group:**
`SE` (5 rows, **ids already present**), `ELEMENT_DATA` (`{sym, group, radius, ie1,
reactivity, family}`), `FAMILY_LABELS`, `TABLE_HISTORY`, `MENDELEEV_GAP`,
`MASS_ORDER_INVERSIONS`, `FAMILIES`, `FAMILY_QUIZ`, `TREND_PROPS`, `TREND_RUNS`,
`TREND_QUIZ`, `IE_ANOMALIES`.

**`js/main.js`** — `ELEMENTS_FULL` (`:20-29`, the derived array that adds `en`), the two
Chart.js instances at module scope (`:14`), `buildCharts()` (`:73`), `zeffRows` (Honors h1
material, display-only today), and the three checks.

**`css/style.css`** — 10 KB, including the `fam-*` family tint classes the world-state
depends on (see §4.3).

**`js/case.js`** — copy in full. **`cta.call` is `"mode='trends'"` and must become
`"setMode('trends')"`.**

### 3.2 Needs a consequence layer

| Skill | Today | Becomes |
|---|---|---|
| `a` C.5(A) `table` | `checkGap()` — predict the element in Mendeleev's gap | **decision** with a consequence: you ordered the part or you did not |
| `b` C.5(B) `families` | `checkFq()` — family behaviour MCQ | **decision** with a consequence |
| `c` C.5(C) `trends` | `checkTq()` — trend comparison from a 7-item bank | **decision**, on **generated** pairs — see §4.2 |
| `h1` Honors | `zeffRows` renders; nothing commits | effective nuclear charge and shielding: a commit |
| `h2` Honors | `IE_ANOMALIES` renders; nothing commits | the Group 13/16 ionization dips: a commit |
| `cap` | does not exist | the capstone, §4.4 |

---

## 4. The Repair Bench

Role line: **`Phone and laptop repair · your bench`.** One bench, one drawer of parts:
batteries, connectors, magnets, screws, cases, cables, and a supplier datasheet with a hole
in it. Every call is "which element belongs here".

### 4.1 Stations and everyday contexts

| Mode | Skill | TEKS | Type | Contexts |
|---|---|---|---|---|
| `table` | `a` | C.5(A) | decision | the supplier datasheet with a blank row — predict the missing element from its neighbours before ordering, which is exactly Mendeleev's method; two parts arriving in the wrong order because the warehouse sorted the bin by atomic mass instead of atomic number (Ar/K, Co/Ni); an old repair manual that groups parts in threes by weight and stops working past the fourth row (Döbereiner / Newlands) |
| `families` | `b` | C.5(B) | decision | the alkaline cell that leaked white crust into a remote; the tarnished "silver" contact next to the gold-plated one that did not tarnish; the halogen flame-retardant printed on the laptop plastic |
| `trends` | `c` | C.5(C) | decision, **generated pairs** | why lithium and not sodium in the cell (radius, mass); why gold on the connector and not copper (reactivity, EN); why the aluminium case and not iron |

Honors: `h1` effective nuclear charge and shielding (`zeffRows` exists, needs a commit);
`h2` the Group 13/16 ionization-energy dips (`IE_ANOMALIES` exists, needs a commit).

All three core types are **decisions**, so `RETROFIT-U1-U4.md` §5 assigns Unit 3 **no bands
at all** — there is no dose stage. Do not invent one. `HONORS_BANDS` may still be useful if
you make either Honors commit numeric-precondition-then-decision (Unit 1's `certifyH1`
shape, `units_new/01-practices-matter/js/main.js:618`); if both stay pure decisions, Unit 3
imports `outcomeBand` not at all.

### 4.2 The one upgrade: generated trend pairs

`GAMIFICATION.md:296-298` mandates it and `RETROFIT-U1-U4.md` §3 specifies it: `TREND_QUIZ`
moves from a fixed 7-item bank (verified: exactly 7, `units/03-periodic-trends/js/model.js:256-271`,
shape `{property, a, b, answer, explain}`) to pairs generated at runtime.

Constrain generation to **same-period or same-group pairs with a clear gap in the chosen
property**, so every pair has exactly one defensible answer.

> **Generate from `ELEMENTS_FULL` (`units/03-periodic-trends/js/main.js:20-29`), not
> `ELEMENT_DATA`.** `ELEMENT_DATA` (`model.js:32-70`) carries only
> `{sym, group, radius, ie1, reactivity, family}` and has **no `en` field at all**. `en` is
> added one layer up by the derived `ELEMENTS_FULL` (`en: ELECTRONEGATIVITY[d.sym] ?? null`),
> and it lands `null` for He, Ne and Ar because `shared/js/chem.js` deliberately omits the
> noble gases. So "skip `en: null` entries" is right, but the rule only exists on the derived
> array. `GAMIFICATION.md` says "from `ELEMENT_DATA`" and is imprecise the same way — follow
> this paragraph, not that doc.

### 4.3 World state — **the board** (`RETROFIT-U1-U4.md` §4)

A reconstructed mini periodic table. Each confirmed call adds its cell, tinted with the
`fam-*` classes already in `units/03-periodic-trends/css/style.css`. **A wrong call knocks a
previously confirmed cell back off the board** and logs the return. Meter reads
`cells confirmed: N of 12`. State words: *Repairs holding / Two came back / The shelf is
full of returns*. Log stamp is `Day N:`.

This is one of the two world-states that most literally *are* the chemistry: the board the
learner builds is the periodic table the unit is about.

**The knock-off rule is the interesting part and the easiest to get wrong.** Decide and
comment: which cell comes off — the most recently added, or the one whose family the learner
just got wrong? The second is better pedagogy (the return is thematically the mistake) but
needs a fallback when the family is not on the board yet. Whichever you pick, a wrong call
must never be able to empty the board to zero from a single mistake, per
`GAMIFICATION.md`'s no-soft-lock rule.

The board is a **string-built SVG injected with `x-html` on a `<g>`** — Alpine's `x-for` and
`x-if` do not bind scope inside `<svg>` (`RETROFIT-U1-U4.md` §8 trap 2). It fills the
`systems` grid area of `.life-support-board`.

`recordWorld({ icon, tone, text, effect })` keeps Unit 1's signature; the body is a per-unit
rewrite. Unit 3's `effect` carries the cell to add or remove rather than a concentration.
Structure from `units_new/01-practices-matter/js/main.js:182-215`.

### 4.4 Capstone — the order

`RETROFIT-U1-U4.md` does not specify Unit 3's capstone, so this is yours to design. The
brief's shape is set by the other units: one situation, the skills the unit taught, one
irreversible call.

Recommended: **the datasheet with the hole in it.** A part is out of stock and the supplier
offers three substitutes. Predict the missing element's properties from its neighbours
(C.5A), name the family the substitute belongs to (C.5B), compare the two on the property
that actually matters for this repair (C.5C), then one call: **fit the substitute / order the
correct part and wait / tell the customer the board is not economic to repair.** Resolve
`correct` from the generated substitute and the board the learner built — the way
`genCapstone` does at `units_new/01-practices-matter/js/main.js:757`, never from a stored
key.

---

## 5. The pattern to follow

Everything in [HANDOFF-U2.md](HANDOFF-U2.md) §6 applies unchanged: file list, path depths,
`unitId: 'units_new/03-periodic-trends'`, the module bootstrap, the two-label station strip
with `aria-label`, the `effect` map, and the landmark table into Unit 1's `main.js`.

Unit 3 specifics:

- **Six tabs** (table, families, trends, capstone, case file — five, plus the capstone) —
  the lightest strip in the tree, so the label swap has room. Station names: *How it
  developed / Chemical families / Periodic trends / The order / Case file*.
- **`SE` already has `id`s.** Do not re-key them. Your `skills` array in `main.js` uses
  `a, b, c, h1, h2, cap`.
- **~15 banners** (3 core skills × 3 scenarios, plus `h1`, `h2`, `cap` — and the contexts
  table above already names three per skill, so the scenarios are effectively written).
  Set signature: a bench-top for "at the bench" and a parts-drawer for "in the drawer".

---

## 6. Traps

All twelve in [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §4 apply. Three matter especially
here:

- **Trap 12 — the canvas.** Unit 3 has two Chart.js instances. They live at module scope
  (`js/main.js:14`) and must stay there. In the cockpit they need an explicit wrapper height
  and a resize call on `setMode`, because a canvas laid out while its panel was `display:none`
  measures zero and stays zero. **No unit with a canvas has been ported yet** — if you do
  Unit 3 before Unit 10, you are writing that paragraph.
- **Trap 3 — `activeVerdict` by recency.** The `trends` bench carries `c`, `h1` and `h2`
  (all three have `mode: 'trends'` in `SE`), so three commits share one bench. Use Unit 1's
  `modeVerdict` map; a fixed precedence would make one of them permanently unreadable.
- **Trap 1 — the collapsed first grid row.** Every Unit 3 panel opens with real content.

## 7. Build order

1. `js/case.js` — copy, fix `cta.call`.
2. `js/model.js` — eleven pools unchanged; add `SCENARIOS` with `effect` maps; keep the
   existing `SE` ids.
3. `js/main.js` — `createGame` + `skills`; the board world-state; the cockpit getters; then
   the generated `TREND_QUIZ` upgrade; then the three commits; then the two Honors commits
   and the capstone. Smoke-test each in Node before moving on.
4. `js/art.js` — ~15 banners; contact-sheet them before wiring.
5. `index.html`, then `css/style.css` (traps 1, 2, 6, 12).
6. `tests/unit5a-layout.test.mjs` — add the `TARGETS` entry; fix what it finds.

## 8. Verification

The four gates in [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §3, plus: confirm both charts
still render and rescale when the property selector changes, and that a wrong call visibly
removes a cell from the board.

## 9. Done means

- Runs standalone; nothing imports from `units/`.
- C.5(A), (B) and (C) each have a graded commit with a consequence; both Honors rows commit.
- `TREND_QUIZ` generates pairs from `ELEMENTS_FULL`, skipping `en: null`.
- The board adds and removes cells, tinted by real family, and cannot be emptied by one miss.
- All four gates green; `README.md` gains a Unit 3 section.
- Anything learned that Units 2 and 4-11 will hit is appended to
  [HANDOFF-PORTING.md](HANDOFF-PORTING.md) §4.
