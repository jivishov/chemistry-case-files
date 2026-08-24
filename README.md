# Chemistry Case Files

Eleven hands-on high-school chemistry units, each built around a real story where the chemistry
saved a life, solved a mystery, or wrecked a mission. Play the simulator, then open the Case File
to see where it got real. Every unit hides an Honors mode.

Aligned to the Texas Chemistry TEKS (19 TAC §112.43). Standards are tracked inside each unit, so
a learner can focus on the chemistry rather than the codes.

**Live: https://jivishov.github.io/chemistry-case-files/**

## What is here

```
index.html      the hub -- eleven unit cards
shared/         the design tokens, base CSS, components, and the shared JS modules
                (chem, game, gauge, render, casefile, molezoom, notation, stage3d, teks)
units_new/      the eleven units, one directory each
units_new/shared/   cockpit.css and columns.js -- the shell all eleven inherit
units_new/tools/    the measurement tools the units were built and tuned with
```

Every unit is the same shape: `index.html` for the markup, `js/main.js` for the view-model,
`js/model.js` for the chemistry and the scenario data, `js/art.js` for the scene drawings, and
`js/case.js` for the story. No build step and no framework beyond Alpine from a CDN — open
`index.html` and it runs.

## The cockpit

All eleven units share one shell: three columns (the job, the bench, the board), a draggable
split, a commit row that ends each task, and a scene banner drawn from `art.js`. The contract it
holds itself to is one screen, nothing hidden, and nothing a learner reads below 14px.

`units_new/HANDOFF-COCKPIT-REFINEMENT.md` is the engineering record for that shell: what moved
the numbers, what was a dead end, and the tools that measure it. The other `HANDOFF-*.md` files
under `units_new/` cover how each unit was built.

## Running the tools

The tools under `units_new/tools/` drive the units in a real browser to measure them — column
widths, per-bench scroll, in-SVG label collisions, whether every disabled commit key explains
itself. They need Playwright, which this repo does not depend on; point `PW_ROOT` at a checkout
that has it.

```bash
node units_new/tools/cockpit-survey.mjs      # which units carry which shell patterns
node units_new/tools/scroll-table.mjs        # which benches still scroll, and what is tall
node units_new/tools/hint-check.mjs          # every gated commit key says why it is dead
node units_new/tools/label-collide.mjs 08-solutions
```

## Previous edition

This repo previously published the `units/` tree and three `unit5a-*` prototypes. Those are in
git history — see the commit before this one.
