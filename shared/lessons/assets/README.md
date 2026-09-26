# Reading appearance assets

Retrieved September 25, 2026 for the user's requested local adaptation of the published Chemistry Case Files appearance. These files are served locally; reading appearance has no runtime CDN dependency.

## Contextual artwork

The eleven unmodified WebP scenes are reused from the user's published course:
`https://jivishov.github.io/chemistry-case-files/shared/assets/photos/<name>.webp`.

| Unit | Scene |
| --- | --- |
| 1 | aquarium.webp |
| 2 | spectroscopy.webp |
| 3 | materials.webp |
| 4 | kitchen.webp |
| 5 | spacehab.webp |
| 6 | rescue.webp |
| 7 | scuba.webp |
| 8 | solutions.webp |
| 9 | acidbase.webp |
| 10 | thermal.webp |
| 11 | nuclear.webp |

This matches the published course-map mapping. The images are labeled as illustrative context, not measurements or a record of an experiment. The existing scientific diagrams and model colors remain unchanged. Original artwork mode removes the contextual scenes and retains those original diagrams.

## Fonts

The published site uses Atkinson Hyperlegible Next for UI/body text and Source Serif 4 for headings. Their Latin and Latin Extended WOFF2 subsets were obtained from the Google Fonts CSS API and are included locally, with unchanged font binaries. `fonts/fonts.css` retains the delivered weight ranges and Unicode ranges with local URLs.

Upstream font and license records:

- https://github.com/google/fonts/tree/main/ofl/atkinsonhyperlegiblenext
- https://github.com/google/fonts/tree/main/ofl/sourceserif4

The SIL Open Font License texts are included beside the font files. This does not change the project's license.

The Field Lab palette and Appearance control design were checked against the published `units/shared/field-lab.css` and `units/shared/design-mode.js` (`field-20260922-1`). Their reading-specific adaptation lives in `shared/lessons/appearance.css` and `appearance.js`; the September 25 local appearance pass did not replace the mission and course-home files. The September 26 integration now uses the published mission and home implementation; these reading assets remain unchanged.
