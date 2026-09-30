# Mission photo fidelity — completed through Unit 11

All 196 missions and both photograph variants are reviewed and accepted: **392 photos, 387 replacements and five aligned originals**. The cloud continuation added 172 replacements across Units 8–11 after verifying the local thread’s corrected push at `0d29d57db092e78e77f94bef0733575803b3a67b`. The authorized destination is `jivishov/chemistry-case-files/main`.

The repository contains the finished assets, cache revisions, review ledger and provenance. No remaining chapters or photo variants need repair. Do not restart generation from the initial findings or treat historical pending counts as current.

## Authoritative records

- `photo-fidelity-audit.json`: per-mission and per-variant acceptance, original findings, reviews, asset hashes and current validation. The earlier Units 1–7 validation is retained under `historicalValidation`.
- `photo-fidelity-progress.json`: final counts and completion state.
- `photo-fidelity-notes.json`: original mismatch findings, retained as history.
- `photo-fidelity-generation.json` and `photo-fidelity-batch*.json`: exact generation/edit prompts, source hashes, measured crop rectangles and review records. Cloud batches 37–64 cover Units 8–11.
- `../shared/assets/photos/missions/provenance.json`: preserved original source history and unique replacement entries for all 387 installed replacements.

Five original photos remain accepted: both variants of Unit 1 `c-pendant`, both variants of Unit 4 `a-lamp-cord`, and variant 0 of Unit 7 `a-whip`. All other mission photos were replaced.

## Scientific fidelity

Each final crop was visually compared with its actual runtime `sim.scArt(id)` SVG, including Unit 11 refinement wrappers. Abstract evidence is shown as photographed teaching models or printed physical displays. Cropping was measured from each generated atlas; neighboring rows and essential labels were excluded from crop edges. Replacement assets are 1280 × 480 WebP files below 65,000 bytes.

Questions, answers, gameplay and layout retain their authored behavior. Two source SVG inconsistencies were corrected during the cloud pass, with meaningful regression checks and targeted art-import cache revisions:

- Unit 8 `f-cleaner`: equal-size bars with a common baseline and opacity now agree with `C1V1 = C2V2` and the same-moles caption.
- Unit 10 `a-spent-pack`: passive heat now points from the 33 C chest toward the colder 6 C pack.

The earlier Unit 4 `h2-polarity` correction is preserved: O-H bond dipoles point toward oxygen and reinforce the upward net dipole.

Photos reproduce the static authored SVG examples. The question panel remains authoritative for randomized live problem data. Printed values and qualitative plot relationships are preserved; photographic graph geometry is approximate. Decorative nucleus beads represent nuclei and are not literal isotope nucleon counts. Explicit emitted-particle models were reviewed separately, including two protons plus two neutrons for alpha particles and three outgoing neutrons in the fission illustration. Unit 7’s compression photos retain equal representative counts of 21/21; the SVG uses 26/26.

## Final validation

Validation was repeated after cloud executor recovery on 2026-09-30:

- Full `npm test` passed, including all chemistry/game/artwork/lesson checks, 63 photo/SVG checks and four reading-integration checks.
- `npm run test:site -- http://127.0.0.1:8079/` passed: 542 reachable files, 99 scripts parsed, all 392 mission photos, with HTTP availability confirmed.
- All 387 replacement hashes match the ledger and unique provenance records. Dimensions and file-size limits passed. All 172 new photos match their approved batch records and `20260930-1` cache revisions.
- Browser checks loaded both variants for all 86 missions in Units 8–11, verified the retained original SVG and Photo/Diagram toggle, and reported no JavaScript page errors. Both corrected source diagrams were confirmed in the served runtime.
- Units 1–7 ledger entries, original source provenance and the five accepted original image files match the verified local-thread commit.

## Cloud review artifacts and recovery

Checkout: `/workspace/chemistry-case-files`. Scratch artifacts: `/workspace/scratch/chemistry-photo-fidelity`. Final PNG sources: `/workspace/generated_images`; historical local Windows paths remain only in their original provenance records.

The scratch directory contains exported runtime SVGs, all 28 post-crop comparison sheets, explicit reviews, exact prompts and generated-source metadata. Final validation artifacts include `test-restored.log`, `integrity-final.json`, `browser-final.json`, `browser-restored.log` and `browser-unit-8.png` through `browser-unit-11.png`. These scratch files are outside the repository and are not needed to serve the committed site.

If continuing review in a new environment, use the existing checkout and saved startup instructions. Start the static server when needed; processes and `/tmp` helpers do not survive a restart. Retain TLS verification for browser CDN access and use supported scoped execution access to Chromium’s existing trusted certificate database.

Photo repairs used native image generation and filesystem/browser tools; no agents or design skills were used. The required cloud setup skill was applied separately during environment onboarding. The account-usage tool was unavailable in the cloud tool list, so no cloud usage/reset observation is claimed and no reset credit was applied. Historical usage observations remain in `photo-fidelity-usage.json`.
