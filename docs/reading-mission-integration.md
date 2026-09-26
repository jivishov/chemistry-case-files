# Reading and mission integration

Integration date: September 26, 2026.

## Baseline and scope

The integration starts from `chemistry-case-files/main` at `1ecb0967058cf8e7bced51128ac139efffcc57e2` (September 22). The locally authored readings are added to that deployed implementation. The older local `units_new` tree is not a runtime dependency of this release.

- Added all eleven readings, their editable manuscripts, references, TEKS text, glossary, book reader, local fonts, 79 topic illustrations, and eleven interactive models.
- Retained all 392 scenario photographs, scenario-specific image rotation, original SVGs, fallback behavior, Field Lab presentation, and the deployed mission implementations.
- Merged reading-first home navigation, Lesson return links, and query-based mission/case-file links through existing controls.
- Retained published scientific corrections where they already addressed the local findings; merged the reviewed case narratives and remaining acid/base and nuclear corrections.
- Kept Nuclear Chemistry's model imports identical between the mission and its runtime refinements. Case narrative and assessment now have one authoritative data source in `case.js`; the older runtime narrative override was removed. The neptunium series ends at stable Tl-205.
- Reconciled the airbag diagram with the narrative's illustrative 2.00 mol reactant amount and approximately 67.2 L at the stated standard conditions. The separate quiz still asks about 0.10 mol.

All eleven unit identifiers, 69 assessment-tab mappings, and 83 graded-skill mappings remain aligned. The lesson build reads the deployed `units` implementation, including Unit 1's `sim-core.js` composition. Historical progress keys containing `units_new` are retained as storage identifiers, not file paths.

## Verification

- `npm run build:lessons`: all eleven generated pages match the authored lessons.
- `npm test`: 1,198 assertions in nine chemistry, game, case-file, gauge, mole-zoom, art, periodic-trend, scenario, and notation suites; the lesson suite; 61 mission-photo/visual-fidelity checks; and four integration regressions pass.
- The lesson suite checks all TEKS transcriptions, 69 tab mappings, 83 skill mappings, 25 Honors extensions, 79 illustrations, sources, links, displayed-equation markup, eleven model invariants, and targeted mission corrections.
- The integration regressions check deployed entry paths, initialization-aware mission links, the actual versioned Nuclear Chemistry entry imports and photo wrapper, and agreement between the airbag diagram and explanation.
- `node scripts/check-site.mjs http://127.0.0.1:8080/`: 534 reachable files and 96 scripts checked; all required local HTTP responses succeeded. This includes all 392 mission photographs.
- The same full test suite and HTTP check passed after synchronization into the normal local project folder, served on port 8079. All 607 published files were compared byte for byte with the integrated candidate; local-only prototypes and historical backups were preserved.
- The photo assets and their selection/manifest modules are unchanged from the GitHub baseline.

The older local tests were adapted to the single deployed course tree. Duplicate prototype cases are excluded. Assertions for superseded narrative phrases now check the published scenario meanings and calculation labels. Tests no longer reject valid scientific punctuation or expect unformatted teaser text from a chemical-notation renderer.

## Evidence limits

Browser automation was unavailable during this integration: no browser surface was exposed, and opening the in-app preview returned unavailable. The earlier laptop book-layout checks in [textbook verification](lesson-textbook-validation.md) remain historical evidence, not a fresh browser audit of this release. The reading layout code, illustrations, fonts, and photographs were transferred intact. HTTP availability and automated model tests do not establish rendered layout, classroom effectiveness, physical printing, or full screen-reader acceptance.

Existing reference URLs were preserved; this integration did not repeat the earlier source-availability review. The [source record](lesson-source-check.json) and [fidelity review](lesson-fidelity-review.md) retain their original dates and scope.
