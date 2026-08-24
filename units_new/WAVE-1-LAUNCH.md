# Wave 1 launch — four parallel class-B ports

Copy the **Shared preamble** plus **one unit block** into each agent. Substitute nothing; the
blocks are already filled in.

Written 2026-08-21 ~09:00. Everything in it was verified against the repo at that time, and this
tree has more than one session working in it, so **re-verify before you trust it** — that is the
house rule here, and it earned its place twice while this file was being written.

---

## Status at launch — read before you spawn anything

- **Unit 4 is NOT in this wave — it is finished.** Another session built it during the planning of
  this one: `js/art.js` (19/19 banners, 1:1 with `SCENARIOS`), `index.html`, `css/style.css`, all
  three registrations (`BUILT`, layout `TARGETS`, casefile `NEW_TREE`), a `README.md` section, and
  its own doc close-out, landing between 08:37 and 09:04. The index now lists it **done**.
  **Do not spawn an agent on `units_new/04-bonding-geometry/`, and do not let any agent write into
  it.** One thing to confirm before trusting it: the layout audit is not part of `npm test`, so
  check that its new `TARGETS` entry actually passes.
- **The canvas question is answered.** Trap 12 in `HANDOFF-PORTING.md` §4 has been rewritten with
  Unit 4's real numbers in place of its "unverified territory" paragraph. No agent needs to
  re-derive it.
- **Trap 3 has a better answer than the trap records.** Unit 4 generalised Unit 1's `modeVerdict`
  map into `screenOf[mode]`, a per-bench record holding `{sc, v, honors}`, read by `activeBrief`,
  `activeVerdict` and a new `screenIsHonors`
  (`units_new/04-bonding-geometry/js/main.js:321-334`). Prefer it.
- **`casefile` is 299, not the 251 the docs used to say.** The `units_new` builds now join the
  suite through a second list, `NEW_TREE` (`tests/casefile.test.js:57`). Current full baseline:
  `chem 286, game 36, casefile 299, gauge 149, molezoom 64, 0 failed`.
- **Other sessions are writing to this tree.** Take your own `npm test` baseline at the moment you
  start rather than trusting any number in any document, including this one.

Wave 2 is **08 · Solutions**, **07 · Gas Laws** and **02 · Atomic Structure** (class A). Wave 3 is
**03 · Periodic Trends**. Neither is blocked on anything but review bandwidth.

---

## Shared preamble

```text
Repo: C:\Users\EmilJivishov\Projects\Chem_simulations (branch retrofit/u1-u4-scenario-layer).
Note your start time now; you need it for the last gate.

Read in order: units_new/HANDOFF-INDEX.md, units_new/HANDOFF-PORTING.md, units_new/HANDOFF-U<n>.md.
Re-verify every line number, count and claim those docs hand you. This is not boilerplate: the
index's library table was wrong for five units for a full revision, and three passages were
corrected this morning after a check found them stale.

Your job: the class-B cockpit port of Unit <n> into units_new/<slug>/, following
HANDOFF-PORTING.md section 2 end to end, including authoring js/art.js from scratch - one 400x150
banner per scenario id. That 1:1 mapping is verified in all three finished units: no spares, no gaps.

You are NOT designing scenarios, choosing bands, writing commit handlers, or deciding consequences.
Those exist in units/<slug>/ and are correct. If a bench looks like it needs new grading logic, you
have mis-read something.

Read, never edit, three reference implementations: units_new/01-practices-matter/,
units_new/05-the-mole/ (which ships without a unit stylesheet - css/style.css is optional, create it
only when you need it, which trap 1 usually forces), and units_new/04-bonding-geometry/, the most
recent and the closest to the current procedure.

OWNERSHIP - other sessions are working in this same tree right now, including one finishing Unit 4:
1. The only paths you may create or modify are under units_new/<slug>/, plus throwaway
   tests/tmp-*-<slug>.mjs files that you delete before finishing.
2. Never modify units/, unit5a-codex/, the repo-root shared/, units_new/shared/cockpit.css, or any
   other unit's folder. Unit-specific CSS goes in units_new/<slug>/css/style.css, which loads after
   the shell. If you become convinced a rule must be generic to cockpit.css, DO NOT write it -
   report it.
3. Do NOT edit tests/casefile.test.js, tests/unit5a-layout.test.mjs, units_new/index.html,
   units_new/README.md, or units_new/HANDOFF-PORTING.md. Those five registrations are applied
   centrally, and a concurrent agent is editing the same lines. Report the exact text instead.
4. RUN NO GIT COMMAND THAT MUTATES STATE. Read-only is fine: git status, git diff, git log, git
   show. Forbidden outright: add, commit, stash, checkout, restore, reset, clean, rm, mv, apply,
   switch, branch, merge, rebase, and anything with --force. This is not a style rule. You share one
   working tree, one index and one HEAD with three other agents; the tree carries hundreds of
   uncommitted files that are not yours, and HEAD is far behind them. A single `git stash` or
   `git checkout .` would destroy several hours of other people's work with no way back, and
   `git add -A` would stage their half-finished files into somebody's commit. If you believe you
   need one of these, stop and report it instead.

TWO TRAPS WHOSE DOCUMENTED ANSWER IS NOW BETTER THAN THE TRAP TEXT:
- Trap 3, two commits on one bench. Unit 1 keeps a modeVerdict map; Unit 4 generalised it to
  screenOf[mode] holding {sc, v, honors}, read by activeBrief, activeVerdict and screenIsHonors
  (units_new/04-bonding-geometry/js/main.js:321-334). Prefer screenOf. Any bench carrying both a
  core and an Honors commit needs one of the two, or whichever verdict loses the tie can never be
  read.
- Trap 12, canvas height. Already solved; do not re-derive. Unit 4's answer is in
  units_new/04-bonding-geometry/css/style.css:131-157: .stage { height: clamp(190px, 33vh, 300px) }
  plus a fallback gradient mirroring BACKDROP in shared/js/stage3d.js so the pre-WebGL frame is not
  the wrong colour. No unit calls new Chart at all - every chart comes from barChart/lineChart in
  shared/js/render.js:42,59, both already responsive with maintainAspectRatio:false - and the chart
  units already expose their own resize path. Wire the existing method into setMode(), because a
  canvas laid out while its panel was display:none measures zero and stays zero. Keep chart and
  three.js instances at module scope, never on the Alpine proxy (trap 11).

GATES - all five before you report done.
1. Baseline first: run npm test BEFORE you change anything and record the five numbers. Expect
   chem 286, game 36, casefile 299, gauge 149, molezoom 64, 0 failed, but other sessions are
   landing registrations, so your own baseline is the truth. At the end, npm test again: equal or
   higher with 0 failed is fine, lower is a regression you caused.
2. Layout audit, your unit only, without touching the shared harness: copy
   tests/unit5a-layout.test.mjs to tests/tmp-audit-<slug>.mjs - it MUST live in tests/, because it
   resolves ROOT as new URL('..', import.meta.url) - cut TARGETS down to your unit's entry alone,
   then run  PW_ROOT=../Lab_studio node tests/tmp-audit-<slug>.mjs  until it prints PASS. Delete the
   temp file. Playwright is installed at ../Lab_studio. Trap 8: a stations entry that does not match
   the tab's aria-label EXACTLY burns a 30s click timeout per station and audits the wrong tab - a
   run taking 20+ minutes instead of ~6 is that bug, not slowness. Other agents are running audits
   concurrently, so expect CPU contention on top of that.
3. Validate your own case.js the same way: copy tests/casefile.test.js to tests/tmp-case-<slug>.mjs,
   add your unit to the NEW_TREE list in the COPY, run it, delete it. Do not wait for central
   registration to discover a cta.call problem.
4. Eyes on the art and the benches. Do NOT use the in-app Browser pane - screenshots time out there
   and the viewport collapses. Drive Playwright from ../Lab_studio in throwaway scripts under your
   scratchpad:
   (a) contact sheet - one page with every banner captioned by id, screenshot to PNG, then Read the
       PNG. Look for defs bleeding between scenes (Alpine keeps every panel in the DOM, so an
       unprefixed gradient id leaks), subjects or labels below y=102 eaten by the caption scrim, and
       lighting that is not upper-left everywhere. Run this after your first three banners, not at
       the end.
   (b) functional pass at 1536x864, Honors on and off - script a commit, right and wrong, on every
       bench. The chemistry already works; you are checking that the port lost nothing: every
       verdict appears, the world-state moves, worldLog stamps, the case file opens, its CTA returns
       to the right bench.
5. find units unit5a-codex shared units_new/shared -newermt "<your start time>" -type f
   Must print nothing. Add any other unit's folder to that list if you want to be sure.

DELIVERABLES in your final message - this is the handoff, so be exact:
- one line per section-2 step: done, or what you changed from the documented procedure and why
- the exact TARGETS entry for tests/unit5a-layout.test.mjs
- the exact import line and NEW_TREE row for tests/casefile.test.js (NEW_TREE, never UNITS - UNITS
  doubles as the uniqueness set and your CASE deliberately keeps its parent's id and number, so a
  UNITS row fails two assertions)
- the BUILT slug for units_new/index.html
- the README.md section as markdown, shaped like Unit 1's
- new traps for HANDOFF-PORTING.md section 4, numbered, in that file's voice
- anything you think belongs in cockpit.css that you deliberately did not write
- your before and after npm test numbers, and the audit output, verbatim
```

---

## Unit 6 — `06-reactions-stoichiometry`

```text
Unit 6 · 06-reactions-stoichiometry · 15 banners · 6 tabs · no rendering libraries at all: no
Chart.js, no importmap, no canvas, no SVG stage. Ignore the canvas paragraph in the preamble
entirely.

You are the clean end-to-end confirmation that HANDOFF-PORTING.md section 2 is correct, with zero
rendering variables in the way. Treat the procedure itself as under test: report every step that was
wrong, stale, or vague enough that you had to guess, with the fix, written in that document's own
voice.

Your cta.call genuinely is the bare assignment - units/06-reactions-stoichiometry/js/case.js has
call: "mode='stoich'". Convert it to setMode('stoich'). Unit 6 is now the only unit left where this
is outstanding: Unit 4's copy was converted during its port, so the docs' line about "Units 4 and 6"
is half stale.
```

## Unit 9 — `09-acids-bases`

```text
Unit 9 · 09-acids-bases · 16 banners · 7 tabs · one Chart.js titration chart, Honors-gated.

You are the Chart.js pilot, and this is the easiest chart lifecycle in the tree: one chart, live on
one bench under one toggle. Nothing to construct - units/09-acids-bases/js/main.js:596 already has
resizeTitr() { if (titrChart) titrChart.resize(); }, and the chart itself comes from lineChart in
shared/js/render.js:59, already responsive with maintainAspectRatio:false. Wire resizeTitr into
setMode() and give the canvas wrapper an explicit height in your own stylesheet. titrChart stays at
module scope.

Seven tabs is already proven by units_new/05-the-mole, so the station strip should need nothing new.
cta.call should already be setMode - verify rather than assume.

Unit 8 and Unit 7 both follow you and are chart-heavier. Report the wrapper height you landed on,
how it behaves at 1024x600, and how the Honors gate interacts with a chart that is display:none
until the toggle flips. Trap 12 explicitly asks the chart units for their own number, because a
chart's usable aspect is not a 3D stage's.
```

## Unit 11 — `11-nuclear`

```text
Unit 11 · 11-nuclear · 31 banners · 6 tabs · no rendering libraries. Ignore the canvas paragraph.

The largest art load in the tree, roughly twice any other unit, at the 42-51 lines of hand-authored
SVG per banner that the finished units average. Budget the art first and build your set signatures
before drawing individual scenes: one for the place the work happens, one for the place the
consequence lands, the way Unit 1 has waterColumn() and deskShelf(). Get the contact sheet running
after the first three banners - defs bleed and scrim collisions are cheap to fix early and expensive
to fix thirty times.

This unit carries an extra core skill (hl) beyond the usual four, which changes coreSkills, the TEKS
badge and teksMasteredCount. Its case.js is the biggest in the repo at 417 lines (verified); it
copies whole and its animated CASE.stage comes with it, so confirm the stage survived the copy and
budget no art time for it. cta.call should already be setMode - verify.
```

## Unit 10 — `10-thermochemistry`

```text
Unit 10 · 10-thermochemistry · 21 banners · 6 tabs · no rendering libraries. Ignore the canvas
paragraph.

Pure port plus art at volume, and the lowest-risk unit in the wave. It is also one of the retrofit's
two reference implementations of the world-state-IS-the-chemistry pattern, so its Scenario layer
should read cleanly; if it does not, you have mis-read it rather than found a bug.

The trap: this looks like a charting unit and is not. units/10-thermochemistry/js/main.js:207 says
its schematic is deliberately hand-rolled SVG rather than Chart.js because it needs no chart
lifecycle. Do NOT add Chart.js, and do not "upgrade" the schematic. cta.call should already be
setMode - verify.
```
