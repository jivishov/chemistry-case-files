# Mission photo fidelity — stopped after Unit 7

Photo repair stopped at the user's request after finishing Unit 7 (Gas Laws). Do not resume photo repair or usage monitoring until the user asks. Units 1–7 cover 110 completed missions / 220 photographs: 215 replacements and five accepted originals. Units 8–11 have 86 missions / 172 photographs still awaiting repair after the initial audit.

Authoritative working folder: `C:\Users\EmilJivishov\.codex\worktrees\chem-photo-fidelity\Projects\Chem_simulations`

Repair source branch: `codex/case_files_chemistry_new`, with the completed work committed as `8e24af46cd6565b87055c88e0d23d28b89d57d23`. On 2026-09-30 the user explicitly authorized publishing these updates to `https://github.com/jivishov/chemistry-case-files` after identifying the earlier push to the parent `Projects` repository as the wrong destination. Publish the completed Units 1–7 photos and their runtime cache updates to `chemistry-case-files/main`; GitHub Pages serves that repository's `main` branch at `https://jivishov.github.io/chemistry-case-files/`. The original shared checkout at `C:\Users\EmilJivishov\Projects\Chem_simulations` remains untouched on its original branch.

The requested branch was older than the published application. Its isolated worktree was populated with all 634 tracked files from verified clean release `73f9135ea0e4d75973ce5fb892bc6b3513cf425b` using the existing clean checkout `C:\Users\EmilJivishov\AppData\Local\Temp\chemistry-reconciliation-3b8e56454ce54561953875d48489dfed`. The large branch diff includes that baseline import. No files were deleted.

## User constraints

- Use native capabilities only; do not use skills or spawn agents.
- Compare every mission's two photographs with its actual runtime SVG.
- Periodically call the account usage tool. It reports percent **used**; the user refers to percent **remaining**. Stop when remaining jumps to approximately 100% (used drops to approximately zero), indicating reset. Started at 53% used / 47% remaining. Consult `photo-fidelity-usage.json` for latest check. The tool lists scheduled reset at 2026-10-03 17:22:53 UTC and one available reset credit; do not apply that credit. Continue observing for an earlier/manual account reset.

## Current evidence and progress

All 196 missions / 392 photographs were visually audited side by side against runtime `sim.scArt(id)` SVGs, including Unit 4 refined artwork and Unit 11 refinement wrappers. `photo-fidelity-audit.json` is the authoritative per-variant status ledger; `photo-fidelity-progress.json` contains current counts. Never overwrite these from the initial catalog.

`photo-fidelity-notes.json` records the original findings. Most photographs omit the diagram's scientific evidence; some use wrong objects/states. Unit 2 and Unit 10 include neighboring atlas-row leakage. Preserve questions, answers, layout, and scientific models. One verified SVG correction was necessary: Unit 4 `h2-polarity` O-H bond dipoles now point toward oxygen, reinforcing the upward net dipole. Both photographs agree with the corrected SVG. Its art imports have a targeted cache revision. Abstract diagrams become photographed physical teaching models or printed evidence displays, not purported photos of atoms.

Accepted originals: both variants of Unit 1 `c-pendant`, both of Unit 4 `a-lamp-cord`, and only variant 0 of Unit 7 `a-whip`. Replacements are listed in the ledger and provenance, with exact prompts, hashes, measured atlas crop rectangles, and explicit visual review. Do not mark an image accepted merely because generation finished.

Units 1–7 are complete and all their installed photographs inspected after cropping. Unit 8 is the next chapter if the user resumes. Consult the live JSON counts and per-variant ledger. Photographed spectra retain exact selected-wavelength labels, but plotted line positions are illustrative approximations; the original SVG provides precise wavelength mapping. Likewise, some bar graphics preserve ranking and printed scores rather than exact pixel ratios. Unit 7 pressure bars and distribution curves are photographic approximations; printed formulas and values are retained. Do not claim pixel-exact quantitative plotting.

The Unit 7 compression photograph uses 21 representative particles in each container, preserving equal count through compression; the SVG uses 26 decorative particles in each. Attempts to reproduce 26 introduced unequal counts and were rejected. This is a conceptual KMT illustration, not a particle-count calculation. Both final images were counted manually after cropping.

Photos reproduce the authored static SVG examples, not the randomized problem data. Browser verification confirmed the existing separation: the tire illustration has 14 L / 1.7 mol / 321 K while the live problem can generate different values. This behavior already exists in the SVG and was not changed in this photo-fidelity pass. The question panel remains the source for the current problem's values.

## Local artifacts and continuation tools

Scratch root: `C:\Users\EmilJivishov\.codex\visualizations\2026\09\29\01a0ee62-5434-7ff0-95ff-de39e2c2cd5b`

- `photo-audit.mjs`: exports runtime SVGs and comparison contact sheets. Existing outputs under `photo-audit/` already cover every mission; do not duplicate the original review.
- `photo-audit/svg/{unit}-{id}.svg`: actual runtime artwork. Some contain literal `<` inside text; sanitize only review rasterization, without changing runtime science.
- `photo-audit/unit-XX-YY.png`: original comparison sheets.
- `install-fidelity-batch.mjs <project-root> <batch-json-filename>`: installs only a visually approved two-column atlas using explicitly inspected x/y boundaries. Never assume generated atlas rows are equal. It trims two pixels at edges, resizes to 1280 × 480, and encodes below 65 kB. Optional `rowFit` overrides resize fit per row when modest aspect normalization preserves evidence. Inspect framing before acceptance; severely wrong-aspect panels need regeneration.
- `install-individual-fidelity.mjs <project-root> <individual-json-filename>`: installs separately reviewed variants with exact `sourceRect` crops. Used for Unit 1 drop-kit count panels and corrected Unit 4 water dipoles after small atlas edits failed. Both source records live in `photo-fidelity-generation.json`.
- `sync-fidelity-metadata.mjs <project-root>`: refreshes asset hashes, provenance replacements, cache revision map, and progress counts from approved batch records. Keeps historical source provenance.
- `docs/photo-fidelity-generation.json` and `docs/photo-fidelity-batch*.json`: exact prompts and original local generated sources.
- Native generation sources are retained under `C:\Users\EmilJivishov\.codex\generated_images\01a0ee62-5434-7ff0-95ff-de39e2c2cd5b`.

The web preview is served from this worktree at `http://127.0.0.1:8115/` using Python, execution session 5591. Browser tab 2 now displays Unit 7's compression photo and is marked for handoff. Native browser keyboard Enter successfully toggles Photo/Diagram. The accessibility tree calls the toggle a checkbox, but its DOM role is button; use the DOM button locator. Verified screenshots are at scratch `photo-audit/unit3-datasheet-browser.png` and `photo-audit/unit7-compression-browser.png`. This is a narrow browser check; all scientific content was additionally inspected in full-size reference/replacement assets. No generation or test jobs remain active at this stopping point; the local preview server is retained for review.

## Validation

Full `npm test` passed after all 215 replacement photos and the Unit 4 SVG polarity correction: chemistry, game, case-file, gauges, molecule zoom, artwork, periodic trends, scenario coherence, notation, lessons, all 61 photo/SVG checks, and all four reading-integration checks. Log: scratch `test-after215.log`. `npm run test:site` passed with 542 reachable files, 99 scripts parsed, and all 392 photos. A direct SVG endpoint check confirmed both O-H dipoles point closer to oxygen and upward. All 215 replacement hashes match both the audit ledger and unique provenance entries, with dimensions 1280 × 480 and each file below 65 kB. All 110 missions through Unit 7 have accepted variants. Browser checks verified the datasheet, tire, and compression photos and original SVG toggles. Do not report the entire course corrected: 172 variants in Units 8–11 remain pending.
