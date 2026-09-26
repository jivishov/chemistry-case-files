# TEKS alignment and optional book reader

> Historical local verification. See [the September 26 integration record](reading-mission-integration.md) for the current deployed structure and combined checks.

Local verification: September 25, 2026. No public deployment or Git push was performed.

## Delivered changes

- All 54 core topics and 25 Honors extensions explicitly identify relevant Chemistry TEKS expectations. Each displays the exact code and expectation before its instructional content. Models repeat the standards of their associated topic. Honors text identifies the relationship as an extension, and the nuclear half-life section distinguishes supporting instruction from the wording of the standard.
- The 59 expectation strings in `shared/lessons/standards.js` match the repository's `TEKS.md` transcription. The linked authority is the Texas Education Agency's current Chapter 112 PDF, §112.43(c), Chemistry, Adopted 2020. The generated alignment record lists the assigned codes alongside each topic.
- Unit reading titles are half their previous size: the desktop H1 maximum is 20 px instead of 40 px, and the small-screen H1 is 14.5 px instead of 29 px. Section headings remain larger than body text. The desktop top bar is 52 px tall, and the space above the reading is reduced.
- Model illustrations, controls, and evidence share a compact layout. Additional observation and explanation prompts are available in a disclosure. The initial cards fit the tested laptop viewports; expanded guidance remains accessible inside the bounded card when needed.
- The Book mode button sits beside Print lesson. Each core topic begins a separate sheet, sidebar links turn pages, and Previous/Next, a section selector, and keyboard page controls provide other navigation. The preference persists between units. Each Honors challenge starts a fresh page; longer reference lists and assessment tables continue across pages without discarding content.

## Browser evidence

The local site was served at `http://127.0.0.1:8079/`. Checks used the connected Chromium browser at its default text size.

| Check | Observed result |
| --- | --- |
| All 11 units at 1366 × 768 and 1440 × 900 | Every core topic occupies one sheet. Book frames fit the viewport. No horizontal document overflow, duplicate IDs, or internal overflow fallbacks. |
| All 11 units at 1366 × 650, after compact footnote refinement | All 54 core topics occupy one sheet, including the longer nuclear applications reading. No internal overflow fallbacks. |
| Initial model cards across the three laptop sizes | All fit, with the largest observed card approximately 507 px tall. |
| Model Next step and Reset in book mode, all 11 units | Each step changes its model value or teaching-sequence progress; reset restores the initial value, summary, and progress. |
| Switch between book and continuous reading, all 11 units | Non-model instructional flow text is identical before and after the round trip. Original form and model elements are moved rather than duplicated. |
| Unit 9 answer and model state preservation | A correct practice answer and its feedback survive a round trip; the pH 14 setting and matching summary also survive. |
| Unit 9 sidebar navigation | Definitions, strength, and neutralization each appear on their own page. The page-turn effect runs; rapid successive selections settle on the final requested section. |
| Unit 9 at 360 × 780 | Book button and navigation remain within the viewport, with no horizontal document overflow. Narrow layouts paginate further rather than shrinking the body text. |
| Browser console during this reader verification | No new errors observed. |

Book footnotes use short numbered links with full accessible names and hover titles. Full source titles remain in continuous reading and in the Sources section. Source links and instructional text were retained.

## Automated verification

`npm run build:lessons` regenerated all 11 reading pages and the alignment record. `npm test` passed all suites: 1,441 existing assertions plus lesson checks for generated-page consistency, exact TEKS transcription, explicit topic mappings, standards preceding core headings, book-section completeness, assessment coverage, and independent numerical model invariants.

## Boundaries

A physical 15-inch diagonal does not specify a browser viewport. The dimensions above are the verified layouts at default text size. At narrower windows or enlarged text settings, pagination may add sheets, and an individually oversized block receives an explicitly labeled, keyboard-accessible scroll region rather than clipped content.

Print handling restores continuous content and expands disclosures before printing, then restores book mode. Reduced-motion handling skips page-turn animations. These paths were reviewed in code; this pass did not separately exercise the native print dialog or emulate reduced-motion settings. Full screen-reader and classroom acceptance remain unverified.

No additional dependency, third-party image, or runtime service was introduced. This pass changed instructional presentation and annotations; assessment scoring was not changed.

## Subsequent Field Lab appearance adaptation

The reading pages now adapt the Field Lab palette and Realistic imagery from the user's published course at https://jivishov.github.io/chemistry-case-files/. The forest header, chartreuse active controls, warm paper, typography, and Appearance menu were inspected on the live site. This change is scoped to the reading pages; the local mission shell and course-home design scripts were not replaced.

The eleven published unit scenes are included locally, together with the Atkinson Hyperlegible Next and Source Serif 4 font subsets and their Open Font License texts. See [asset provenance](../shared/lessons/assets/README.md). Contextual scenes appear on the lesson cover and in the contents rail, outside the topic's text area. Original artwork mode hides those scenes and retains the scientific diagrams. All artwork is explicitly illustrative context, not experimental evidence.

Appearance controls provide Field Lab, Clear, and Atlas; Realistic and Original; and System or Pause for decorative motion. The choices persist between readings. Pause suppresses page-turn effects; instructional model animations remain manually controlled. Appearance changes reflow book pages while retaining the original form and model elements.

Fresh verification after the appearance changes:

- All 11 units at 1366 × 650, 1366 × 768, and 1440 × 900: 33 layouts, with all 54 core topics remaining on individual sheets at each size. No duplicate IDs, horizontal document overflow, model-page overflow, or internal fallback scroll regions. Book navigation fits inside the viewport.
- All contextual images load from local files. All initial model cards fit without internal scrolling; the largest measured card is 506.5 px tall.
- Field Lab, Clear, Atlas, Realistic, Original, and Pause controls were exercised. Atlas/Original/Pause persisted on navigation from Unit 9 to Unit 4, and the matching buttons remained selected. Field Lab/Realistic/System were restored for the final preview.
- Unit 9's pH 14 model value and summary survived appearance changes. A correct practice answer and feedback survived artwork changes and a book/continuous-reading round trip.
- At 360 × 780, the Appearance menu, reading controls, and book navigation fit without horizontal overflow. Small screens paginate further.
- `npm test` passed all suites (1,441 existing assertions plus lesson checks). JavaScript syntax checks passed. No new browser console errors were observed.

The earlier print and full screen-reader acceptance limits still apply. No files were committed, pushed, or deployed by this appearance change.

## Photo framing correction

All eleven source scenes were inspected after the reported scuba-tank cropping. Fixed-height `object-fit: cover` banners were cutting off source details, and overlaid captions covered the lower image area. The cards now scale to the source's 8:3 proportions, use `object-fit: contain`, and place the short caption below the image. Book mode caps the card width to retain compact page height. Source image files are unchanged.

Browser checks covered all eleven units in book and continuous-reading modes at 1366 × 650, 1440 × 900, and 360 × 780: 66 layouts and 110 visible photo placements. All images loaded, retained their full source proportions, stayed within their frames, and had captions below rather than over the image. No horizontal overflow was observed. Every core topic and each overview remained on one book page at both laptop sizes. The Gas Laws cover and sidebar were also visually checked at 1366 × 768, confirming visibility of the tank tops present in the source image. `npm run test:lessons` passed after regeneration.
