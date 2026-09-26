# Grade 10 lesson verification

> Historical local verification. See [the September 26 integration record](reading-mission-integration.md) for the current deployed structure and combined checks.

Local implementation and verification: September 25, 2026 (America/Chicago).

The subsequent [critical fidelity review](lesson-fidelity-review.md) records the scientific and instructional corrections, their evidence, and the fresh checks performed after revision. The broader initial browser checks below are retained as implementation history.

The [reader verification](lesson-reader-validation.md) records the later TEKS annotations, compact laptop layout, and optional book mode.

The [textbook presentation verification](lesson-textbook-validation.md) records displayed equations, 79 topic illustrations, and the subsequent all-unit book-page checks, including expanded Honors answers.

## Delivered learning path

All 11 units linked from the course home open `learn.html` before the existing assessment interface. Each reading contains learning objectives, original explanatory prose, a simpler restatement, a bounded analogy, worked examples, a local SVG illustration and interactive model, optional Honors extensions with challenge reasoning, two unscored practice checks, an assessment map, linked references, and a final glossary.

There are 69 assessment-tab mappings, 83 graded-skill mappings, 25 Honors extensions, 22 practice checks, and 11 interactive models. The [alignment record](lesson-alignment.md) identifies preparatory sections for every active assessment tab and registered skill. The pages guide students through reading, exploration, missions, and case files; they do not impose a timer or award assessment credit merely for opening a lesson.

## Sources and authorship

The explanations, analogies, examples, SVG drawings, and animation code are original instructional material. Chemistry references primarily use CK-12's Introductory Chemistry through Chemistry LibreTexts, supplemented by OpenStax. NASA, the American Chemical Society, the Nobel Prize scientific background, USGS, ADA, FDA, NRC, DOE, Divers Alert Network, and the South Tyrol Museum of Archaeology support selected applications and limitations. Source links appear beside relevant sections and in each reading's reference list. Khan Academy's high school chemistry course is linked for optional further explanations and videos.

The [source check](lesson-source-check.json) records 202 section-reference URLs, all responding successfully after the fidelity revisions. This is link-availability evidence, not a claim of publisher endorsement or an independent review of every scientific sentence. External resource availability can change. No external textbook images or video files were downloaded or republished.

## Model assumptions

| Unit | Numerical model and boundaries |
| --- | --- |
| 1 | Displacement from a 20.0 mL starting level; completely submerged, nonreacting sample; fixed density 2.70 g/mL. |
| 2 | Hydrogen Balmer transitions from n = 3–6 to n = 2; Rydberg approximation and E = hc/λ. The marker switches between allowed levels without occupying an intermediate energy; timing is an artificial teaching sequence. |
| 3 | Neutral Li, Na, and K shell populations; shell spacing and atom radii are schematic. |
| 4 | H₂O and CO₂ electron-domain counts, lone pairs, shape, and polarity; size is not to scale. |
| 5 | Water molar mass 18.02 g/mol and Avogadro constant 6.02214076 × 10²³ mol⁻¹; drawn dots represent amounts, not individual displayed molecules. |
| 6 | Complete batches of 2H₂ + O₂ → 2H₂O; fixed four O₂ molecules; atom counts conserved at every step. No reaction-rate prediction. |
| 7 | PV = nRT with 0.500 mol, 300 K, R = 0.08206 L·atm/(mol·K), and volume 5–25 L. No intermolecular forces or condensation. |
| 8 | Fixed 0.100 mol solute; final solution volume 0.10–1.00 L; no reaction, solute loss, or precipitation. |
| 9 | Ideal activity-coefficient approximation at 25 °C; pH + pOH = 14. Concentrated endpoints require activity corrections for real measurements. The scale is logarithmic. |
| 10 | Two 100 g water samples, constant specific heat, insulated boundary, negligible container heat capacity, no phase change. Progress is not a physical elapsed-time model. |
| 11 | Expected parent fraction 2⁻ⁿ after n half-lives. Sixty-four symbolic markers are rounded for display; individual nuclear events are not synchronized or deterministic. |

All models have keyboard-accessible inputs, play/pause, a step control, reset, text equivalents, and numeric evidence. They start paused, stop when the page is hidden, and use discrete slower updates under reduced-motion preference. The entire reading and a starting SVG are present in HTML before JavaScript runs. Printing expands instructional disclosures and restores their previous state afterward.

## Assessment consistency corrections

Existing active case files were adjusted where their explanations conflicted with the readings:

- Fireworks distinguish atomic lines, molecular bands, and hot-particle emission.
- Water shape explains polarity and hydrogen bonding without claiming that every lake remains liquid or predicting a fictional linear-water climate.
- The scuba calculation describes an unconstrained gas sample; it does not establish a safe ascent or a universal injury depth.
- Lake Nyos distinguishes pressure, gas supply, layering, and uncertain initiation from a temperature-solubility curve alone.
- Dental examples compare hydronium concentration without treating one pH value as a universal erosion threshold or assuming a fixed recovery time.
- Food-label energy is distinguished from direct combustion calorimetry, with the water-only exercise explicitly bounded.
- The Iceman's 53% fraction is labeled as an illustrative calculation; radiocarbon calibration is explained rather than presenting invented laboratory results.

Correct-answer positions were retained in these case questions. The gradebook and score-storage code were not edited.

## Integration repair

Browser checks exposed an existing mismatch: the active `units/` pages contained the newer mission interfaces but imported older view models, missing shared shell files, and two nonexistent Unit 11 refinement modules. These entry pages now reuse the matching, existing implementations and styles in `units_new/`. Small compatibility files in `units/shared/` reuse the established shared shell and column controller. The original `units/` view-model files remain intact. Unit 2's reused model gained a family-specific valence getter so its displayed clue follows the element in that question, independently of the configuration explorer.

The new Lesson link has header spacing that preserves access to Honors and Reset. Case links select the existing case tab through its normal control; capstone unlocking still uses the existing rules.

## Initial implementation evidence and limits

- `npm test`: all existing suites plus the lesson suite pass. The existing suites report 1,441 passing assertions. Lesson checks cover complete generated pages, active tab coverage, source references, navigation targets, mission dependencies, domain limits, and independent model invariants.
- Connected-browser checks: all 11 lesson pages load and their step, play/pause, reset, Honors disclosure, and practice feedback controls respond. Both correct and incorrect feedback paths were observed.
- Lesson widths: all 11 pages checked at 360, 768, 1024, 1366, and 1920 pixels, with no horizontal document overflow.
- The assessment header controls were checked for fit and overlap across all 11 units at widths 768, 1024, and 1366 pixels (33 layouts).
- All 11 case destinations select the Case file tab and render the corresponding case heading. All 69 assessment tab controls were exercised with Honors enabled, with no new console errors. Locked capstones remained subject to their normal prerequisite gate.
- SVG label bounds were checked in all 11 initial diagrams; overlapping hydrogen-level labels were corrected. All 11 diagrams were also checked at a changed input setting without text clipping or collisions. Selected figures were inspected visually.

These checks do not establish classroom effectiveness, independent teacher approval, full screen-reader acceptance, or exhaustive end-to-end completion of every randomized assessment. Print output and reduced-motion behavior are implemented but were not separately verified in an emulated browser mode. No public deployment was performed.

## Maintain and reproduce

1. Edit `shared/lessons/units/01.js` through `11.js` and the relevant source references.
2. Run `npm run build:lessons` to regenerate the full reading pages and alignment record.
3. Run `npm test` for chemistry, scenario, and lesson checks.
4. Run `node scripts/check-lesson-sources.mjs` when references change; it requires a network connection.
5. Serve the repository root over HTTP and inspect the affected reading, model, mission, and case file.

Lesson interactions require HTTP module loading, but require no CDN or runtime network request beyond the local site. Existing missions retain their preexisting external library dependencies. Keep the reused `units_new` modules and shared assets in the deployed package while these compatibility entry points are in use.
