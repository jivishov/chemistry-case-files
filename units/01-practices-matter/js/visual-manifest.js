// visual-manifest.js — Unit 1 photorealistic migration boundaries.
// This file is descriptive only. It does not replace or alter any production visual.

export const SCENE_VISUAL_PLAN = Object.freeze([
  { id: 'a-dechlor', section: 'C.1', treatment: 'photo-context+overlay', authoritative: ['? mL'], note: 'Use a realistic aquarium/dechlorinator context. Do not bake a quantitative cylinder level into the photo; the live cylinder below the banner remains authoritative.' },
  { id: 'a-plantfood', section: 'C.1', treatment: 'photo-context+overlay', authoritative: ['scale/indicator annotation'], note: 'Use a realistic plant-nutrient context without implying that the bottle/cap is the calibrated measurement instrument.' },
  { id: 'a-meds', section: 'C.1', treatment: 'photo-context+overlay', authoritative: ['target amount UI'], note: 'Bucket, fish, tubing, and syringe may be photorealistic; amount/progress information stays controlled UI.' },
  { id: 'b-log', section: 'C.2', treatment: 'photo-background+exact-text', authoritative: ['TANK LOG', '4.0 mL', '4.00 mL', '?'], note: 'Notebook and pencil may be photographic. Significant-figure text must remain exact DOM/SVG text.' },
  { id: 'b-volume', section: 'C.2', treatment: 'photo-background+exact-overlay', authoritative: ['20 gal', '18.4 gal', 'ruler'], note: 'Aquarium can be photographic. Measurement labels and ruler stay deterministic.' },
  { id: 'b-pergallon', section: 'C.2', treatment: 'photo-background+exact-overlay', authoritative: ['5.0 mL', '18.4', '92.0000', '92 mL'], note: 'Calculator/bench may be photographic; every numerical display remains exact overlay text.' },
  { id: 'c-ornament', section: 'C.3', treatment: 'photo-context+state-overlay', authoritative: ['mass', 'before volume', 'after volume', 'ΔV'], note: 'Photograph the sample/balance context, but bind quantitative values to current simulation state or omit them from the photo.' },
  { id: 'c-pendant', section: 'C.3', treatment: 'photo-context+overlay', authoritative: ['PLATED?', '? g'], note: 'Pendant, chain, aquarium, and balance can be photorealistic; labels stay exact overlay text.' },
  { id: 'c-anchor', section: 'C.3', treatment: 'photo-context+overlay', authoritative: ['NO LABEL', '? g'], note: 'Plant weights, package, and aquarium can be photorealistic; labels stay exact overlay text.' },
  { id: 'd-dropkit', section: 'C.4', treatment: 'photo-props+vector-data', authoritative: ['target rings', 'measurement dots'], note: 'Test-kit props may be photographic. Accuracy/precision targets remain deterministic SVG.' },
  { id: 'd-penmeter', section: 'C.4', treatment: 'photo-meter+state-overlay', authoritative: ['five readings', 'reference value'], note: 'Meter/sample may be photorealistic. Readings must bind to evTrials or be omitted from the image.' },
  { id: 'd-strips', section: 'C.4', treatment: 'photo-props+controlled-pads', authoritative: ['strip pad colors/readings'], note: 'Photorealistic strips are acceptable only if pad colors are controlled rather than invented by image generation.' },
  { id: 'h1-sizecall', section: 'Honors', treatment: 'photo-props+state-overlay', authoritative: ['balance value', 'density candidates', 'uncertainty range'], note: 'Balance/metals may be photorealistic. Quantitative uncertainty graphics remain controlled SVG/HTML.' },
  { id: 'h2-kitcall', section: 'Honors', treatment: 'photo-props+vector-data', authoritative: ['scatter/bias targets', 's = ?'], note: 'Lab props may be photographic. Statistical target geometry and standard-deviation notation remain deterministic.' },
  { id: 'cap-waterchange', section: 'Capstone', treatment: 'photo-context+overlay', authoritative: ['decision ?'], note: 'Best candidate for a nearly complete photographic scene; retain the decision annotation as overlay UI.' }
]);

export const LIVE_VISUAL_POLICY = Object.freeze([
  { id: 'measurement-cylinder', treatment: 'hybrid-dynamic', keep: ['graduations', 'meniscus', 'liquid level', 'checked reference line/value'], photo: ['empty glass shell/reflections'] },
  { id: 'density-cylinders', treatment: 'hybrid-dynamic', keep: ['before/after liquid levels', 'graduations', 'sample volume geometry'], photo: ['empty glass shell/reflections', 'optional sample texture'] },
  { id: 'accuracy-reference-targets', treatment: 'hybrid-dynamic', keep: ['rings', 'reference center', 'fixed AP_BOARDS points'], photo: ['paper/card texture only'] },
  { id: 'accuracy-live-target', treatment: 'hybrid-dynamic', keep: ['rings', 'reference center', 'evDots positions'], photo: ['paper/card texture only'] },
  { id: 'x-gauge', treatment: 'retain-svg', keep: ['entire gauge implementation'], photo: [] },
  { id: 'mars-case-stage', treatment: 'hybrid-animated', keep: ['trajectory paths', 'step-dependent animation', 'labels', 'unit mismatch', 'distance annotations'], photo: ['space background', 'Mars/Earth', 'spacecraft sprite'] }
]);

export const visualPlanFor = id => SCENE_VISUAL_PLAN.find(item => item.id === id) || null;
