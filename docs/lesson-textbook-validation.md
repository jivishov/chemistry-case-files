# Textbook reading and illustration verification

> Historical local verification. See [the September 26 integration record](reading-mission-integration.md) for the current deployed structure and combined checks.

Local revision: September 25, 2026 (America/Chicago).

## Scope

- Display 209 formulas and calculation steps separately from explanatory prose across all 11 readings. Authors use explicit `<eq>` markers; `typeset.js` generates block equations with optional condition labels and proper paragraph boundaries. Existing chemical notation, numerical precision, and stated assumptions remain visible.
- Add 79 original, local SVG illustrations: one for each of the 54 core teaching topics and 25 Honors extensions. Each includes an accessible description and a caption. Overview photographs and the 11 interactive models remain available.
- Keep each core topic and each Honors extension on one book sheet at the tested laptop dimensions, including opened Honors reasoning. At narrow desktop widths, a Contents drawer retains sidebar navigation while allowing the reading page to use the available width. Continuous reading and printing retain the complete content.

## Content review

Dense explanations were edited for concision, preserving the assessed concepts and their qualifications. The 69 assessment-tab mappings, 83 graded-skill mappings, TEKS codes and full wording, and reference links remain in place. Review included the reference sets for common ions, molecular shapes, acids and bases, isotope applications, and the distinctions between classroom models and real-world applications.

The figures depict the specific topic or analogy rather than reusing a generic unit image. Review checked atom/charge bookkeeping in reaction and acid diagrams; twelve-object counting analogies; mole-versus-mass distinctions; isotope weighting; gas-law fixed conditions; conserved solute during dilution; energy signs; and parent-population halvings. Water bond geometry was corrected to approximately 104.5 degrees. The gas-speed comparison uses normalized Maxwell speed distributions in shared arbitrary units. Qualitative diagrams are schematic, not measurements or reaction mechanisms.

The supporting source catalog is unchanged. Source URLs were not re-fetched in this presentation pass; the earlier source and fidelity reviews remain separate evidence.

## Verification

- `npm test` passes: 1,441 assertions in existing suites plus the lesson suite. New lesson checks cover all 79 illustration mappings, accessible text equivalents, equation escaping, paragraph boundaries, and absence of unrendered equation markers. Existing checks continue to verify assessment coverage, exact local TEKS wording, model invariants, and generated-page consistency.
- Connected-browser audit: all 11 units at 1366 × 650, 1366 × 768, 1440 × 900, and 920 × 668 CSS pixels, for 44 layouts and 216 core topic sheets. Every core topic occupies exactly one sheet; no page overflow flags were present.
- All 25 Honors answers were opened at both 1366 × 650 and 920 × 668. All 50 expanded views fit without internal scrolling.
- Additional checks at 1102 × 650 and 1282 × 650 exposed the old sidebar breakpoint as too narrow. The Contents drawer now applies through 1280 pixels. After tightening the neutralization analogy and caption, all 11 units fit on both sides of the new breakpoint, including all 25 opened Honors answers at each size. This adds 22 layouts and 50 expanded-answer checks: 66 passing layouts and 100 expanded Honors views in total.
- All 54 core SVGs were inspected through rendered text bounds at 920 × 668: no clipped or overlapping text labels. All 25 Honors figures were also checked for text clipping. Selected pages were visually reviewed, including the requested mole and gas-law examples, reaction classification, and expanded weak-acid calculations.
- Sidebar selection changes the book page and closes the Contents drawer. Escape closes the drawer and returns keyboard focus to its button. Changing a model value and switching between book and continuous reading preserves the model value and displayed result.
- Unit 7 was checked at 390 × 844 in both book and continuous reading modes: no horizontal document overflow. The small-screen book fallback permits vertical scrolling rather than clipping content or shrinking text further.
- No new browser errors or warnings were recorded during the final all-unit verification.

These are local browser and source checks, not independent classroom acceptance or a screen-reader audit. Physical print output was not revalidated in this pass. No commit, push, or deployment was performed.

## Maintenance

Edit lesson content in `shared/lessons/units/`, and concept drawings in `shared/lessons/illustrations.js`. Regenerate with `npm run build:lessons`; run `npm test`. Recheck the smallest laptop viewports after adding prose, equations, diagram labels, or expanded Honors reasoning. The Sources and Glossary chapters retain their existing item-based pagination; the one-sheet requirement applies to the teaching topics and individual Honors lessons.
