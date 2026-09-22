# Field Lab visual refresh

The existing course layout, investigation controls, scientific models, and assessment logic are retained. Field Lab is the new default appearance; saved Clear or Atlas preferences still apply.

- The course home retains eleven unit photographs and one laboratory backdrop. Mission banners now use 392 scenario photographs: two distinct views for each of the 196 authored scenarios. Exact mission prompts, source crops, and image hashes are recorded in `shared/assets/photos/missions/provenance.json`.
- All 196 original scenario SVGs remain available. The **Diagram** button reveals the authored scene, **Appearance → Original** restores original artwork throughout the interface, and failed photographs expose the SVG automatically.
- Live graduated cylinders have glass reflections, curved menisci, shaded liquid, and submerged samples. Readings still use the original calibrated geometry. The original cylinder renderer remains available.
- Case File stages retain their paths, text, bindings, chapter states, and animation classes. Optional material shading improves their surfaces. Mars keeps its photographic animation and a complete animated vector fallback.
- **Appearance → Decorative motion → Pause** pauses decorative motion without changing simulation state. Clear and Atlas remain selectable themes.

## Verification

`node --test tests/visual-fidelity.test.mjs` passes all 24 checks. These cover all 501 tenth-milliliter cylinder readings, displacement, unique SVG definitions, usable image files, original-scene retention, and Case File state/geometry preservation across all 11 units. JavaScript syntax checks pass for all 71 source files.

Live browser review covered:

| Viewport | Coverage | Result |
| --- | --- | --- |
| 1366 × 768 laptop | All 11 unit entry screens | No horizontal overflow; mission panels fit |
| 1024 × 768 tablet landscape | Unit 8 | Existing three-column layout fits |
| 820 × 1180 tablet portrait | Unit 8 | Existing responsive arrangement fits |
| 1920 × 1080 desktop | Unit 8 | No horizontal overflow |

Manual checks also covered the course home, live density cylinders, global and per-scene artwork switches, every Mars chapter, pause/resume, and deliberately missing mission and Mars photographs. A missing thermal asset found during review was restored, and the file-size check now rejects empty assets.

The repeatable viewport and missing-image review is available at `tests/visual-review.html`. The photography supplies context; readable scientific values and diagrams remain authored SVG/HTML.

![Field Lab density investigation with live glass cylinders](field-lab-density.jpg)

## Mission photo correction · 2026-09-22

The shared mission renderer previously ignored the scenario ID and reused the unit cover image. It now resolves a photograph by unit, scenario ID, and problem version. Each new problem advances only its own scenario photo; repeated renders, answers, and tab switches do not advance it. Revisiting a scenario alternates between its two photographs. Honors generators, capstones, and Unit 5 audit replays also advance their corresponding photos. The counters are component-local and are not stored with student progress.

All 196 scenarios have explicit mappings. Missing mappings retain the original scenario SVG; image-load errors also reveal that SVG. The Diagram/Photo control and the global Original appearance setting remain available. Scientific diagrams and numerical readings remain authored SVG/HTML. Unit 1 no longer imports its damaged historical photo payload. Unit 11's output wrapper preserves Alpine's reactive receiver and applies its existing scientific caption corrections to both displayed versions.

Verification: `node --test tests/visual-fidelity.test.mjs tests/mission-photos.test.mjs` passes 61 checks. The new suite exercises actual problem generators through complete scenario cycles in all 11 units, repeated same-scenario problems, audit replays, stable rendering, reactive wrapper behavior, mapping coverage, and complete distinct WebP assets. Browser-only 3D mounting is excluded from these generator tests. All 392 final 640 × 240 WebP images decode successfully; combined image size is 5.77 MB, averaging 14.7 KB per requested mission image. Banner crops were visually reviewed.
