// art.js — Mission Console scene banners (Unit 5A pilot, ISV Meridian).
// Evolved from units/05a.../js/art.js: the body compositions are preserved (they
// were already fine-tuned), but each is now wrapped in a Mission Console
// console-readout frame — dark chrome bezel, accent sheen line, faint
// scanlines, and a status LED whose colour encodes the system this task feeds.
// The whole SVG still renders as a dark "instrument screen" inset atop the
// warm parchment .brief card (see style.css .brief-art), so the dual-surface
// language (chrome instrument vs. parchment workbench) reads in one glance.
//
// Rules the builder keeps:
//   • Every gradient id is prefixed with the scene id (scene() builds `${id}-bg`,
//     `${id}-led`). Alpine keeps all stage panels in the DOM (x-show, not x-if),
//     so the SVGs coexist and an unprefixed gradient id would bleed across scenes.
//   • Banners are aria-hidden: the brief's role/goal/why text directly below each
//     one is the authoritative description, so announcing the art too is redundant.
// Palette tracks tokens.css: per-system hue = accent rim + LED, copper for the
// two Honors jobs, semantic red for the toxic-leak hazard. viewBox 400x150.

// Per-system accent colours (the rim + LED). Mirrors --sys-* tokens but as raw
// SVG values so the art is self-contained and immune to var()-in-SVG edge cases.
const HUE = {
  air:   '#3aa9a9',   // teal
  power: '#e0a04a',   // amber
  food:  '#4cb06c',   // green
  hull:  '#d4685a',   // rose
  copper: '#c0772f',  // honors
  accent: '#3aa9a9',  // teal default / capstone
  hazard: '#d4594a',  // alert red (toxic/abnormal)
};

// Default console background: tinted-cool chrome gradient (never pure black).
const CHROME_BG = ['#0c1620', '#142430'];

// scene(id, opts) -> a complete 400x150 console-readout banner string.
//   caption   required mono strapline along the bottom
//   body      required scene-specific shapes (drawn inside the frame)
//   accent    rim + LED colour (one of HUE). Defaults to teal.
//   bg        [top, bottom] override for the vertical chrome gradient
//   frame     override the frame/LED rim colour (e.g. hazard red)
//   capColor  override the caption fill
function scene(id, { caption, body, accent = HUE.accent, bg, frame, capColor }) {
  const [top, bottom] = bg || CHROME_BG;
  const rim = frame || accent;
  const cap = capColor || '#8aa0aa';
  const led = accent;
  return `<svg viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">`
    + `<defs>`
    + `<linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`
    + `<radialGradient id="${id}-led" cx=".5" cy=".5" r=".5">`
    + `<stop offset="0" stop-color="${led}" stop-opacity=".95"/>`
    + `<stop offset=".45" stop-color="${led}" stop-opacity=".35"/>`
    + `<stop offset="1" stop-color="${led}" stop-opacity="0"/></radialGradient>`
    + `</defs>`
    // console screen + bezel hairline
    + `<rect width="400" height="150" rx="10" fill="url(#${id}-bg)"/>`
    + `<rect x="1.5" y="1.5" width="397" height="147" rx="9" fill="none" stroke="${rim}" stroke-width="1" opacity=".38"/>`
    + `<rect x="6" y="4" width="388" height="1" fill="${led}" opacity=".55"/>`
    + `<g stroke="#9fb4bd" stroke-width="1" opacity=".05"><line x1="0" y1="44" x2="400" y2="44"/><line x1="0" y1="86" x2="400" y2="86"/></g>`
    + body
    // status LED (top-right) — colour-codes the system this task feeds
    + `<circle cx="378" cy="18" r="9" fill="url(#${id}-led)"/>`
    + `<circle cx="378" cy="18" r="2.6" fill="${led}"/>`
    // mono strapline
    + `<text x="16" y="138" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="10" letter-spacing=".08em" fill="${cap}">${caption}</text>`
    + `</svg>`;
}

export const SCENE_ART = {

  // ---------- C.8(A) mass <-> mole ----------
  'a-oxygen': scene('a-oxygen', { accent: HUE.air, caption: 'CABIN O\u2082 \u00B7 REPLACE WHAT THEY BREATHED', body: `
    <circle cx="318" cy="38" r="1.5" fill="#cfe6ea"/><circle cx="356" cy="46" r="1.1" fill="#9fc2c9"/><circle cx="372" cy="70" r="1.4" fill="#cfe6ea"/><circle cx="300" cy="86" r="1" fill="#7fa6ae"/>
    <circle cx="334" cy="58" r="34" fill="#08141a" stroke="#3a5560" stroke-width="3"/>
    <circle cx="322" cy="48" r="1.6" fill="#cfe6ea"/><circle cx="346" cy="52" r="1.2" fill="#9fc2c9"/><circle cx="332" cy="68" r="1.4" fill="#cfe6ea"/><circle cx="348" cy="66" r="1" fill="#7fa6ae"/>
    <rect x="34" y="40" width="42" height="80" rx="15" fill="#2a7d8a" stroke="#79b0ba" stroke-width="2"/>
    <rect x="48" y="26" width="14" height="16" rx="3" fill="#aebfc6"/>
    <circle cx="55" cy="22" r="6" fill="none" stroke="#aebfc6" stroke-width="2"/>
    <text x="55" y="88" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#e8f2f4">O\u2082</text>
    <g stroke="#79b0ba" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".9"><path d="M84 62 H148"/><path d="M84 80 H138"/></g>
    <path d="M150 62 l-9 -5 v10 z" fill="#79b0ba"/>
    <g fill="#3a98a6" stroke="#cfe6ea" stroke-width="1.4"><path d="M200 48 q-24 6 -24 42 q0 18 14 18 q12 0 12 -16 V50 q0 -4 -2 -2"/><path d="M214 48 q24 6 24 42 q0 18 -14 18 q-12 0 -12 -16 V50 q0 -4 2 -2"/></g>
    <rect x="205" y="32" width="4" height="22" fill="#cfe6ea"/>` }),

  'a-fuel': scene('a-fuel', { accent: HUE.power, caption: 'CH\u2084 BURN \u00B7 LOAD THE RIGHT MASS', body: `
    <circle cx="120" cy="30" r="1.4" fill="#cfe6ea"/><circle cx="208" cy="22" r="1" fill="#9fc2c9"/><circle cx="262" cy="104" r="1.2" fill="#cfe6ea"/><circle cx="150" cy="122" r="1" fill="#7fa6ae"/>
    <circle cx="334" cy="60" r="30" fill="#c0673f"/>
    <circle cx="326" cy="52" r="7" fill="#9a4a2a" opacity=".55"/><circle cx="344" cy="68" r="5" fill="#9a4a2a" opacity=".5"/><circle cx="330" cy="72" r="3" fill="#e08a5a" opacity=".5"/>
    <g stroke="#79b0ba" stroke-width="1.6" fill="none" opacity=".9"><circle cx="334" cy="60" r="40"/><path d="M334 8v10 M334 102v10 M286 60h10 M372 60h10"/></g>
    <path d="M62 114 Q150 26 300 58" stroke="#79b0ba" stroke-width="2" fill="none" stroke-dasharray="3 6" opacity=".8"/>
    <g transform="translate(58,106) rotate(-34)">
      <path d="M0 -7 L30 0 L0 7 Z" fill="#cfdbe0"/>
      <circle cx="9" cy="0" r="3" fill="#2a7d8a"/>
      <rect x="-6" y="-5" width="6" height="10" fill="#687a82"/>
      <path d="M-6 -5 L-24 0 L-6 5 L-14 0 Z" fill="#f0a02f"/>
      <path d="M-6 -2.5 L-16 0 L-6 2.5 Z" fill="#f6e6c0"/>
    </g>` }),

  'a-scrubber': scene('a-scrubber', { accent: HUE.air, caption: 'TRAPPED CO\u2082 \u00B7 CONVERT GRAMS TO MOLES', body: `
    <circle cx="40" cy="24" r="1.2" fill="#9fc2c9"/><circle cx="370" cy="120" r="1.2" fill="#7fa6ae"/>
    <rect x="26" y="46" width="86" height="64" rx="8" fill="#10262e" stroke="#79b0ba" stroke-width="2"/>
    <text x="69" y="40" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="10" fill="#9fc2c9">CARTRIDGE</text>
    <g stroke="#cfdbe0" stroke-width="1.4"><line x1="56" y1="64" x2="82" y2="64"/><line x1="56" y1="78" x2="82" y2="78"/><line x1="56" y1="92" x2="82" y2="92"/></g>
    <g><circle cx="48" cy="64" r="3.4" fill="#bf4a30"/><circle cx="40" cy="64" r="2.4" fill="#cfdbe0"/><circle cx="56" cy="64" r="2.4" fill="#cfdbe0"/></g>
    <g><circle cx="90" cy="80" r="3.4" fill="#bf4a30"/><circle cx="82" cy="80" r="2.4" fill="#cfdbe0"/><circle cx="98" cy="80" r="2.4" fill="#cfdbe0"/></g>
    <g><circle cx="50" cy="96" r="3.4" fill="#bf4a30"/><circle cx="42" cy="96" r="2.4" fill="#cfdbe0"/><circle cx="58" cy="96" r="2.4" fill="#cfdbe0"/></g>
    <path d="M116 78 H150" stroke="#79b0ba" stroke-width="2.5"/><path d="M152 78 l-9 -5 v10 z" fill="#79b0ba"/>
    <rect x="160" y="42" width="98" height="74" rx="8" fill="#2a7d8a" stroke="#cfe6ea" stroke-width="1.5"/>
    <text x="209" y="60" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="10" fill="#e8f2f4">RECYCLER</text>
    <g stroke="#15323d" stroke-width="3" opacity=".5"><line x1="174" y1="74" x2="244" y2="74"/><line x1="174" y1="86" x2="244" y2="86"/><line x1="174" y1="98" x2="244" y2="98"/></g>
    <g stroke="#79b0ba" stroke-width="2" fill="none" stroke-linecap="round"><path d="M270 60 q10 -8 0 -16 q-10 -8 0 -16"/><path d="M286 64 q10 -8 0 -16 q-10 -8 0 -16"/></g>` }),

  // ---------- C.8(B) mole <-> particles ----------
  'b-eva': scene('b-eva', { accent: HUE.air, caption: 'EVA FILL \u00B7 MOLES TO MOLECULES', body: `
    <circle cx="60" cy="28" r="1.4" fill="#cfe6ea"/><circle cx="150" cy="20" r="1" fill="#9fc2c9"/><circle cx="250" cy="34" r="1.2" fill="#cfe6ea"/><circle cx="120" cy="60" r="1" fill="#7fa6ae"/>
    <path d="M0 122 Q120 108 400 124 L400 150 L0 150 Z" fill="#16313a"/>
    <rect x="20" y="118" width="40" height="10" rx="2" fill="#2a7d8a" opacity=".8"/>
    <path d="M52 124 Q90 96 118 78" stroke="#79b0ba" stroke-width="1.6" fill="none" stroke-dasharray="2 4"/>
    <g transform="translate(132,70)">
      <rect x="-16" y="-6" width="14" height="30" rx="4" fill="#1d5b66"/>
      <rect x="-6" y="-10" width="26" height="40" rx="9" fill="#e8f2f4"/>
      <circle cx="7" cy="2" r="11" fill="#0b1a22" stroke="#cfdbe0" stroke-width="2"/>
      <path d="M2 -1 a5 5 0 0 1 8 2" stroke="#79b0ba" stroke-width="2" fill="none"/>
      <rect x="-4" y="30" width="9" height="20" rx="3" fill="#cfdbe0"/>
      <rect x="10" y="30" width="9" height="20" rx="3" fill="#cfdbe0"/>
    </g>
    <rect x="262" y="40" width="116" height="60" rx="8" fill="#0b1a22" stroke="#3a5560" stroke-width="2"/>
    <text x="320" y="58" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9" fill="#79b0ba">SUIT O\u2082</text>
    <text x="320" y="80" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="17" font-weight="700" fill="#3aa9a9">N \u00d7 10\u00b3</text>
    <text x="320" y="93" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8.5" fill="#9fc2c9">molecules</text>` }),

  'b-ration': scene('b-ration', { accent: HUE.food, caption: "DAY'S RATION \u00B7 MOLES TO MOLECULES", body: `
    <rect x="34" y="30" width="120" height="44" rx="8" fill="#2a7d8a" stroke="#cfe6ea" stroke-width="1.5"/>
    <text x="94" y="57" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11" fill="#e8f2f4">PRINTER</text>
    <rect x="88" y="74" width="12" height="14" fill="#aebfc6"/>
    <path d="M90 88 q4 8 4 12 M98 88 q-4 8 -4 12" stroke="#f0a02f" stroke-width="2" fill="none"/>
    <path d="M64 124 q30 -20 60 0 z" fill="#cfdbe0"/>
    <ellipse cx="94" cy="124" rx="46" ry="7" fill="#687a82"/>
    <g transform="translate(232,52)" stroke="#79b0ba" stroke-width="2" fill="none">
      <polygon points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8" fill="#16313a"/>
      <circle cx="0" cy="0" r="3.5" fill="#79b0ba"/>
    </g>
    <text x="232" y="92" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9.5" fill="#9fc2c9">C\u2086H\u2081\u2082O\u2086</text>
    <rect x="288" y="44" width="92" height="52" rx="6" fill="#0b1a22" stroke="#3a5560" stroke-width="2"/>
    <text x="334" y="62" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9" fill="#79b0ba">RATION LOG</text>
    <text x="334" y="82" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="700" fill="#4cb06c">N \u00d7 10\u00b3</text>` }),

  'b-sample': scene('b-sample', { accent: HUE.hull, bg: ['#0c1620', '#241410'], caption: 'SCOOP \u00B7 GRAMS TO FORMULA UNITS', body: `
    <circle cx="60" cy="26" r="1.3" fill="#cfe6ea"/><circle cx="300" cy="22" r="1" fill="#9fc2c9"/>
    <path d="M0 112 Q120 100 220 110 T400 108 L400 150 L0 150 Z" fill="#7a3a22"/>
    <path d="M0 112 Q120 100 220 110 T400 108" fill="none" stroke="#c0673f" stroke-width="2" opacity=".7"/>
    <g transform="translate(70,72)">
      <rect x="0" y="6" width="58" height="22" rx="5" fill="#cfdbe0"/>
      <rect x="40" y="-8" width="14" height="14" rx="2" fill="#2a7d8a"/>
      <circle cx="12" cy="32" r="9" fill="#15323d" stroke="#aebfc6" stroke-width="3"/>
      <circle cx="44" cy="32" r="9" fill="#15323d" stroke="#aebfc6" stroke-width="3"/>
      <path d="M2 10 L-24 30" stroke="#aebfc6" stroke-width="3" fill="none"/>
      <path d="M-30 30 q-6 8 4 12 l14 0 q4 -10 -6 -14 z" fill="#79b0ba"/>
    </g>
    <g transform="translate(196,86)">
      <rect x="0" y="0" width="20" height="20" fill="#e8f2f4" stroke="#79b0ba" stroke-width="1.4"/>
      <rect x="8" y="-8" width="20" height="20" fill="#cfe6ea" stroke="#79b0ba" stroke-width="1.4"/>
      <line x1="0" y1="0" x2="8" y2="-8" stroke="#79b0ba" stroke-width="1.4"/><line x1="20" y1="0" x2="28" y2="-8" stroke="#79b0ba" stroke-width="1.4"/><line x1="20" y1="20" x2="28" y2="12" stroke="#79b0ba" stroke-width="1.4"/>
    </g>
    <text x="206" y="124" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9.5" fill="#9fc2c9">NaCl</text>
    <circle cx="338" cy="44" r="16" fill="#2a6b8a"/><path d="M328 40 q8 -6 18 2 q-6 8 -16 2 z" fill="#4cb06c" opacity=".8"/>
    <g stroke="#79b0ba" stroke-width="1.5" fill="none" opacity=".85"><path d="M320 56 q-8 6 -6 16"/><path d="M324 60 q-5 4 -4 10"/></g>` }),

  // ---------- C.8(C) percent composition ----------
  'c-ore': scene('c-ore', { accent: HUE.hull, caption: 'RUST ROCK \u00B7 RICH ENOUGH TO SMELT?', body: `
    <rect x="22" y="34" width="78" height="84" rx="4" fill="#1d3942" stroke="#687a82" stroke-width="2"/>
    <g stroke="#3a5560" stroke-width="1"><line x1="22" y1="62" x2="100" y2="62"/><line x1="22" y1="90" x2="100" y2="90"/><line x1="61" y1="34" x2="61" y2="118"/></g>
    <path d="M40 38 L54 60 L44 70 L62 92 L50 116" fill="none" stroke="#bf4a30" stroke-width="3" stroke-linejoin="round"/>
    <g stroke="#bf4a30" stroke-width="1.4" opacity=".7"><line x1="54" y1="60" x2="68" y2="56"/><line x1="44" y1="70" x2="32" y2="76"/><line x1="62" y1="92" x2="74" y2="96"/></g>
    <path d="M150 110 q-14 -2 -10 -22 q2 -16 22 -18 q22 -4 26 14 q4 18 -10 26 q-14 6 -28 0 z" fill="#8a3a22" stroke="#c0673f" stroke-width="2"/>
    <circle cx="158" cy="84" r="4" fill="#c0673f" opacity=".7"/><circle cx="176" cy="96" r="3" fill="#e08a5a" opacity=".6"/>
    <text x="166" y="92" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#f1ddc8">Fe ?</text>
    <rect x="252" y="56" width="80" height="62" rx="6" fill="#16313a" stroke="#79b0ba" stroke-width="2"/>
    <path d="M268 118 V92 q24 -16 48 0 V118 z" fill="#bf4a30"/><path d="M278 118 V100 q14 -8 28 0 V118 z" fill="#f0a02f"/>
    <g stroke="#79b0ba" stroke-width="1.6" fill="none"><circle cx="292" cy="44" r="11"/><path d="M292 44 L292 36" stroke-linecap="round"/><path d="M292 44 L300 48" stroke-linecap="round"/></g>
    <text x="292" y="33" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8" fill="#9fc2c9">% Fe</text>` }),

  'c-greenhouse': scene('c-greenhouse', { accent: HUE.food, caption: 'FERTILIZER \u00B7 REAL % NITROGEN?', body: `
    <g stroke="#b8881f" stroke-width="2" opacity=".55"><line x1="60" y1="20" x2="60" y2="32"/><line x1="92" y1="22" x2="92" y2="32"/><line x1="44" y1="30" x2="52" y2="36"/><line x1="108" y1="30" x2="100" y2="36"/></g>
    <path d="M28 110 A48 48 0 0 1 124 110 Z" fill="#10262e" stroke="#79b0ba" stroke-width="2"/>
    <path d="M76 62 V110" stroke="#79b0ba" stroke-width="1.2" opacity=".6"/><path d="M40 96 A48 48 0 0 1 112 96" fill="none" stroke="#79b0ba" stroke-width="1.2" opacity=".5"/>
    <path d="M62 110 q-2 -18 -12 -24 M62 110 q2 -16 12 -22 M62 110 V84" stroke="#4cb06c" stroke-width="2.5" fill="none"/>
    <path d="M50 86 q-10 -2 -8 -10 q10 0 8 10z" fill="#4cb06c"/><path d="M74 88 q10 -2 8 -10 q-10 0 -8 10z" fill="#4cb06c"/>
    <path d="M88 110 q-2 -14 -10 -18 M88 110 V90" stroke="#4cb06c" stroke-width="2.2" fill="none"/><path d="M78 92 q-8 -2 -6 -8 q8 0 6 8z" fill="#4cb06c"/>
    <rect x="78" y="106" width="42" height="6" fill="#7a3a22"/>
    <rect x="196" y="44" width="58" height="74" rx="9" fill="#2a7d8a" stroke="#cfe6ea" stroke-width="1.5"/>
    <rect x="214" y="32" width="22" height="14" rx="3" fill="#aebfc6"/>
    <rect x="204" y="64" width="42" height="34" rx="3" fill="#e8f2f4"/>
    <text x="225" y="80" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9" fill="#1c2a31">NITROGEN</text>
    <text x="225" y="92" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#2a7d8a">% N ?</text>
    <g transform="translate(296,82)"><circle cx="0" cy="0" r="18" fill="#3a98a6"/><text x="0" y="6" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#0b1a22">N</text></g>
    <g stroke="#79b0ba" stroke-width="2" fill="none" stroke-linecap="round"><path d="M268 70 q8 6 0 14"/></g>` }),

  'c-fuelpurity': scene('c-fuelpurity', { accent: HUE.power, caption: 'FUEL POD \u00B7 VERIFY % CARBON', body: `
    <circle cx="70" cy="26" r="1.3" fill="#cfe6ea"/><circle cx="360" cy="120" r="1.1" fill="#7fa6ae"/>
    <rect x="300" y="30" width="74" height="92" rx="8" fill="#16313a" stroke="#3a5560" stroke-width="2"/>
    <rect x="288" y="62" width="16" height="28" rx="3" fill="#687a82"/>
    <rect x="276" y="68" width="14" height="16" rx="3" fill="#aebfc6"/>
    <rect x="40" y="56" width="96" height="40" rx="18" fill="#2a7d8a" stroke="#79b0ba" stroke-width="2"/>
    <rect x="132" y="68" width="14" height="16" rx="3" fill="#aebfc6"/>
    <text x="84" y="81" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#e8f2f4">CH\u2084</text>
    <path d="M150 76 H262" stroke="#79b0ba" stroke-width="2" stroke-dasharray="3 5"/><path d="M264 76 l-9 -5 v10 z" fill="#79b0ba"/>
    <g transform="translate(208,52)">
      <circle cx="0" cy="0" r="22" fill="#0b1a22" stroke="#79b0ba" stroke-width="2"/>
      <path d="M0 0 L13 -10" stroke="#4cb06c" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M-15 6 A18 18 0 0 1 15 6" fill="none" stroke="#3a5560" stroke-width="2"/>
      <circle cx="0" cy="0" r="2.5" fill="#cfe6ea"/>
    </g>
    <text x="208" y="92" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8.5" fill="#9fc2c9">PURITY</text>` }),

  // ---------- C.8(D) empirical / molecular ----------
  'd-leak': scene('d-leak', { accent: HUE.hazard, frame: HUE.hazard, bg: ['#0c1620', '#241818'], capColor: '#cda99a', caption: 'UNKNOWN GAS \u00B7 BUILD THE FORMULA, ID IT', body: `
    <rect x="30" y="44" width="70" height="74" rx="4" fill="#16313a" stroke="#687a82" stroke-width="2"/>
    <g stroke="#3a5560" stroke-width="2"><line x1="40" y1="56" x2="90" y2="56"/><line x1="40" y1="68" x2="90" y2="68"/><line x1="40" y1="80" x2="90" y2="80"/><line x1="40" y1="92" x2="90" y2="92"/><line x1="40" y1="104" x2="90" y2="104"/></g>
    <g fill="none" stroke="#9aa05a" stroke-width="2.5" stroke-linecap="round" opacity=".75"><path d="M104 90 q18 -8 8 -26 q-8 -14 8 -26"/><path d="M118 100 q18 -8 8 -26 q-8 -14 8 -24"/></g>
    <g transform="translate(214,72)"><circle r="16" fill="#241818" stroke="#bf4a30" stroke-width="2"/><text x="0" y="6" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="700" fill="#e08a5a">?</text></g>
    <rect x="286" y="48" width="92" height="64" rx="8" fill="#0b1a22" stroke="#3a5560" stroke-width="2"/>
    <circle cx="332" cy="80" r="7" fill="#bf4a30"/>
    <g stroke="#bf4a30" stroke-width="1.6" fill="none" opacity=".85"><circle cx="332" cy="80" r="13"/><circle cx="332" cy="80" r="20"/></g>
    <text x="332" y="62" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8" fill="#e08a5a">ALERT</text>` }),

  'd-surface': scene('d-surface', { accent: HUE.food, bg: ['#0c1620', '#241410'], caption: 'DRILLED SOLID \u00B7 EMPIRICAL THEN MOLECULAR', body: `
    <path d="M0 104 H400 L400 150 L0 150 Z" fill="#5e2f1c"/>
    <path d="M0 104 H400" stroke="#c0673f" stroke-width="2" opacity=".6"/>
    <g transform="translate(78,30)">
      <rect x="-6" y="0" width="12" height="74" fill="#687a82"/>
      <rect x="-14" y="-8" width="28" height="14" rx="2" fill="#2a7d8a"/>
      <path d="M-4 74 L0 92 L4 74 Z" fill="#aebfc6"/>
      <g stroke="#cfdbe0" stroke-width="1"><line x1="-2" y1="78" x2="2" y2="78"/><line x1="-2" y1="84" x2="2" y2="84"/></g>
    </g>
    <g transform="translate(204,70)">
      <polygon points="0,-22 16,-8 12,16 -12,16 -16,-8" fill="#16313a" stroke="#79b0ba" stroke-width="2"/>
      <polygon points="0,-22 16,-8 0,-2 -16,-8" fill="#1d5b66"/>
      <text x="0" y="8" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#cfe6ea">?</text>
    </g>
    <g transform="translate(312,66)" stroke="#79b0ba" stroke-width="2.5" fill="none"><circle cx="0" cy="0" r="18"/><line x1="13" y1="13" x2="30" y2="30" stroke-linecap="round"/></g>` }),

  'd-coolant': scene('d-coolant', { accent: HUE.power, caption: 'COOLANT LEAK \u00B7 ID THE FLUID', body: `
    <rect x="20" y="30" width="220" height="20" rx="6" fill="#687a82" stroke="#aebfc6" stroke-width="1.5"/>
    <rect x="120" y="24" width="18" height="32" rx="3" fill="#aebfc6"/>
    <path d="M129 56 q-7 12 0 18 q7 -6 0 -18 z" fill="#3a98a6"/>
    <circle cx="129" cy="84" r="5" fill="#3a98a6"/>
    <circle cx="129" cy="100" r="3.4" fill="#3a98a6" opacity=".8"/>
    <text x="129" y="76" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#0b1a22">?</text>
    <rect x="220" y="96" width="150" height="42" rx="4" fill="#1c4a32" stroke="#4cb06c" stroke-width="2"/>
    <g fill="#0f2e1f"><rect x="234" y="106" width="22" height="14" rx="2"/><rect x="300" y="110" width="30" height="18" rx="2"/></g>
    <g stroke="#79c79a" stroke-width="1.4" opacity=".8"><line x1="266" y1="104" x2="266" y2="130"/><line x1="276" y1="104" x2="276" y2="130"/><line x1="286" y1="104" x2="286" y2="130"/><line x1="344" y1="104" x2="344" y2="124"/><line x1="354" y1="104" x2="354" y2="124"/></g>
    <g transform="translate(300,72)"><path d="M0 -10 L9 6 L-9 6 Z" fill="#b8881f"/><rect x="-1.5" y="-4" width="3" height="6" fill="#0b1a22"/><circle cx="0" cy="3.5" r="1.4" fill="#0b1a22"/></g>` }),

  // ---------- Honors: water reclaim (copper) ----------
  'h1-desiccant': scene('h1-desiccant', { accent: HUE.copper, caption: 'HONORS \u00B7 FIND x FROM WATER LOST', body: `
    <rect x="30" y="40" width="150" height="86" rx="10" fill="#1a1206" stroke="#c0772f" stroke-width="2"/>
    <rect x="44" y="54" width="122" height="58" rx="6" fill="#3a2410" stroke="#95591f" stroke-width="1.5"/>
    <g stroke="#e0a050" stroke-width="3" stroke-linecap="round" opacity=".85"><line x1="54" y1="66" x2="156" y2="66"/><line x1="54" y1="100" x2="156" y2="100"/></g>
    <rect x="64" y="78" width="82" height="14" rx="2" fill="#687a82"/>
    <g fill="#79b0ba"><rect x="70" y="70" width="9" height="9"/><rect x="84" y="68" width="9" height="11"/><rect x="100" y="71" width="8" height="8"/><rect x="116" y="69" width="10" height="10"/><rect x="132" y="71" width="8" height="8"/></g>
    <g fill="none" stroke="#9cc6cf" stroke-width="2" stroke-linecap="round" opacity=".8"><path d="M210 96 q-6 -10 4 -18 q8 -8 2 -18"/><path d="M232 100 q-6 -10 4 -18 q8 -8 2 -18"/></g>
    <g fill="#3a98a6"><path d="M268 60 q8 10 0 18 q-8 -8 0 -18z"/><circle cx="268" cy="86" r="6"/><path d="M300 76 q7 9 0 16 q-7 -7 0 -16z"/><circle cx="300" cy="98" r="5"/></g>
    <text x="285" y="48" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="#f1ddc8">\u00B7x H\u2082O</text>` }),

  // ---------- Honors: fire forensics (copper) ----------
  'h2-arson': scene('h2-arson', { accent: HUE.copper, bg: ['#1c1208', '#2e1813'], caption: 'HONORS \u00B7 EMPIRICAL FROM CO\u2082 + H\u2082O', body: `
    <rect x="26" y="58" width="96" height="64" rx="4" fill="#2a2118" stroke="#687a82" stroke-width="2"/>
    <path d="M26 96 q24 -18 50 -4 q24 12 46 -2 V122 H26 Z" fill="#120c06"/>
    <path d="M70 118 q-12 -18 0 -34 q6 14 14 8 q4 18 -6 26 q8 -2 8 -12 q8 12 -2 22 z" fill="#bf4a30"/>
    <path d="M72 116 q-6 -12 2 -22 q3 10 8 8 q2 12 -4 16 z" fill="#f0a02f"/>
    <g fill="#3a98a6"><circle cx="222" cy="92" r="5"/><path d="M236 70 q7 9 0 16 q-7 -7 0 -16z"/></g>
    <text x="232" y="58" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#9cc6cf">H\u2082O</text>
    <g><circle cx="284" cy="92" r="4.5" fill="#8a8f95"/><circle cx="276" cy="92" r="3.2" fill="#cfdbe0"/><circle cx="292" cy="92" r="3.2" fill="#cfdbe0"/></g>
    <text x="284" y="62" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#cfdbe0">CO\u2082</text>
    <g fill="none" stroke="#8a8f95" stroke-width="1.6" stroke-linecap="round" opacity=".6"><path d="M232 84 q-5 -8 2 -14"/><path d="M284 84 q-5 -8 2 -14"/></g>
    <g transform="translate(336,86)" stroke="#c0772f" stroke-width="2.5" fill="none"><circle cx="0" cy="0" r="16"/><line x1="12" y1="12" x2="26" y2="26" stroke-linecap="round"/></g>` }),

  // ---------- Capstone ----------
  'cap-pod': scene('cap-pod', { accent: HUE.accent, caption: 'RESUPPLY POD \u00B7 ID, CHECK PURITY, DECIDE', body: `
    <circle cx="60" cy="24" r="1.3" fill="#cfe6ea"/><circle cx="200" cy="20" r="1" fill="#9fc2c9"/><circle cx="360" cy="120" r="1.1" fill="#7fa6ae"/>
    <rect x="306" y="34" width="70" height="84" rx="8" fill="#16313a" stroke="#3a5560" stroke-width="2"/>
    <rect x="294" y="64" width="16" height="24" rx="3" fill="#687a82"/>
    <rect x="46" y="48" width="120" height="56" rx="20" fill="#cfdbe0" stroke="#aebfc6" stroke-width="2"/>
    <rect x="166" y="66" width="16" height="20" rx="3" fill="#687a82"/>
    <path d="M62 56 h44 v40 h-40 z" fill="#e8f2f4"/>
    <path d="M62 56 l44 0 l-10 16 l8 24 l-42 0 z" fill="#b9c7cd" opacity=".55"/>
    <g stroke="#687a82" stroke-width="1.2"><line x1="68" y1="64" x2="98" y2="64"/><line x1="68" y1="72" x2="92" y2="72"/></g>
    <text x="118" y="84" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="700" fill="#687a82">?</text>
    <path d="M188 78 H276" stroke="#79b0ba" stroke-width="2" stroke-dasharray="3 5"/><path d="M278 78 l-9 -5 v10 z" fill="#79b0ba"/>
    <g transform="translate(232,46)">
      <path d="M0 -14 V4" stroke="#79b0ba" stroke-width="2"/>
      <path d="M-16 -8 H16" stroke="#79b0ba" stroke-width="2"/>
      <path d="M-16 -8 l-7 12 h14 z" fill="none" stroke="#4cb06c" stroke-width="1.8"/>
      <path d="M16 -8 l-7 12 h14 z" fill="none" stroke="#bf4a30" stroke-width="1.8"/>
      <circle cx="0" cy="6" r="3" fill="#79b0ba"/>
    </g>` })
};

// Lookup used by the view-model (returns '' for an unknown id so x-html stays empty).
export function sceneArt(id) { return SCENE_ART[id] || ''; }
