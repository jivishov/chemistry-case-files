# Chemistry Case Files

An eleven-unit chemistry course for Grade 10 students, with optional Honors extensions. Each unit begins with an illustrated reading, then connects to practice missions and an applied case file.

The course is a static site. Open `index.html` through a local HTTP server, or use the [published course](https://jivishov.github.io/chemistry-case-files/).

## Local preview

From this directory:

```sh
python -m http.server 8079 --bind 127.0.0.1
```

Visit `http://127.0.0.1:8079/`. Reading pages use local scripts, fonts, diagrams, and photographs. Some mission views use existing external mathematics and 3D libraries.

## Editing lessons

- Authored text: `shared/lessons/units/01.js` through `11.js`.
- Teaching illustrations: `shared/lessons/illustrations.js`.
- Interactive reading models: `shared/lessons/models.js`.
- Source references and TEKS wording: `shared/lessons/source-catalog.json` and `standards.js`.
- Generated pages: `units/<unit>/learn.html`.
- Mission implementation: `units/<unit>/js/`; Unit 1 keeps its state engine in `sim-core.js`.

Use Node.js 24 or newer. No package installation is required:

```sh
npm run build:lessons
npm test
npm run test:site
```

The build also regenerates [lesson-to-assessment alignment](docs/lesson-alignment.md). Run `node scripts/check-site.mjs http://127.0.0.1:8079/` to check served assets as well as local paths and JavaScript syntax.

## Appearance and navigation

Field Lab, Clear, and Atlas preferences are shared between readings and missions. Book mode is optional; continuous reading and Print lesson remain available. Context photographs are illustrations, while quantitative diagrams, calculations, and assessment values remain authored code and text.

Mission photographs use `shared/js/scene-photo-manifest.js` and `shared/js/scene-media.js`. The 196 scenarios each have two photographs. Diagram/Photo controls and Original artwork remain available, with SVG fallback for missing photographs. Keep the existing progress identifiers unchanged when maintaining mission code.

See the [September 26 integration record](docs/reading-mission-integration.md) for the combined release checks and their limits. Earlier review documents describe the local reading work before integration.
