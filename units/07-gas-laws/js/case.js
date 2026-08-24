// case.js: Unit 7 case file: the scuba no-breath-hold rule is Boyle's law.
// Carries the story AND the stage art (the depth-slider balloon scene); the
// shared casefile component renders it.

export const CASE = {
  id: 'scuba-boyle-ascent',
  number: '007',
  kicker: 'taught in every dive course',
  title: "The scuba rule written by Boyle's law",
  teaser: 'The dive-course rule that is really P&#8321;V&#8321; = P&#8322;V&#8322;',
  hook: 'Rule one in every dive course: never hold your breath while ascending. It sounds like superstition until you run P1V1 = P2V2 and realize your lungs are the V.',
  stats: [
    { v: '4 atm', k: 'pressure at 30 m down' },
    { v: '4x', k: 'air expansion, 30 m to surface' },
    { v: '+1 atm', k: 'per 10 m of water' }
  ],
  steps: [
    {
      t: 'Pressure stacks fast underwater',
      body: 'The atmosphere already presses on you with 1 atm. Every 10 meters of water piles on another. At 30 meters a diver breathes air at 4 atm, because the regulator matches the surroundings so lungs can inflate at all.',
      chem: 'Kinetic theory view: a 4 atm lungful packs four times the molecules of a surface breath into the same space, hammering the walls four times as hard.',
      cap: 'Drag the slider: the balloon was sealed with 1.0 L of air at 30 m.'
    },
    {
      t: 'Boyle owns the ascent',
      body: 'Seal one liter of that deep air, in a balloon or in held-breath lungs, and raise it. Every drop in pressure buys volume in exact proportion. By the surface, one liter has become four. Gas does not negotiate.',
      chem: 'P1V1 = P2V2 at constant temperature: (4 atm)(1.0 L) = (1 atm)(V2), so V2 = 4.0 L. The inverse curve from your Ideal gas tab, drawn by the ocean.',
      cap: 'The sealed liter grows all the way up: 1 L at 30 m, 4 L at the top.'
    },
    {
      t: 'Why you never hold your breath',
      body: 'Lungs are not balloons; they tear. Ascending just 10 meters on a held deep breath pushes lung volume past what tissue tolerates: overexpansion injury, air forced into the bloodstream. So divers exhale continuously on the way up, drilled until it is reflex.',
      chem: 'The rule is the equation with a body attached: rising means falling P means growing V. Vent the extra V and the ascent is safe.',
      cap: 'The fix costs nothing: keep the airway open and let the volume out.'
    },
    {
      t: 'The gas laws follow you home',
      body: 'Same physics, gentler stakes: a chip bag puffs up on a mountain drive, a sealed bottle crumples on the way down, a weather balloon swells until it bursts at altitude. Once you see P and V trading places, you cannot unsee it.',
      chem: 'Each of those is PV = constant in a costume. The dissolved-gas half of dive safety, decompression and the bends, is a solubility story waiting in Unit 8.',
      cap: 'Chips at altitude, crushed bottles, weather balloons: Boyle everywhere.'
    }
  ],
  quiz: {
    q: 'A diver at 20 m (3 atm) fills her lungs with 1.0 L of air and ascends to the surface (1 atm) holding her breath. What volume does that air demand at the top?',
    options: [
      { label: '3.0 L, triple the lungful', correct: true },
      { label: '1.0 L, unchanged', correct: false },
      { label: '0.33 L, compressed smaller', correct: false }
    ],
    explain: 'P1V1 = P2V2: (3 atm)(1.0 L) = (1 atm)(V2), so V2 = 3.0 L. No lung stretches to triple volume, which is why "exhale while ascending" is rule number one and not a suggestion.'
  },
  punch: 'One inverse proportion keeps every diver alive and explains half the odd gas behavior you have ever noticed. That is what a law is: leverage.',
  careers: ['Divemaster', 'Hyperbaric medic', 'Aerospace engineer', 'Meteorologist'],
  cta: { label: 'Play with P, V, n, and T yourself', call: "setMode('ideal')" },
  state: { depth: 30 },
  controls: `
          <div style="padding: var(--s-3) var(--s-4); border-top: 1px solid var(--cf-line); display: flex; gap: var(--s-4); align-items: center;">
            <label style="color: var(--cf-ink-2); font-size: var(--fs-xs); font-family: var(--font-mono); white-space: nowrap;" for="cf-depth">BALLOON DEPTH</label>
            <input id="cf-depth" type="range" min="0" max="30" step="1" x-model.number="depth" style="flex: 1;">
            <span class="mono" style="color: var(--cf-accent); font-size: var(--fs-sm); min-width: 46px; text-align: right;" x-text="depth + ' m'"></span>
          </div>
`,
  stage: `
          <svg viewBox="0 0 640 360" role="img" aria-label="Interactive scene: a balloon sealed at 30 meters depth expands as you raise it toward the surface">
            <!-- sky + sun -->
            <rect x="0" y="0" width="640" height="56" fill="#12303c"/>
            <circle class="a-glow" style="--dur:4s" cx="560" cy="26" r="16" fill="#ffd27e" opacity=".8"/>
            <!-- water, deeper = darker -->
            <rect x="0" y="56" width="640" height="304" fill="#0e2836"/>
            <rect x="0" y="150" width="640" height="210" fill="#0b2130"/>
            <rect x="0" y="250" width="640" height="110" fill="#081a27"/>
            <path class="a-flow" style="--fx:26px; --dur:6s" d="M 0,58 q 40,-5 80,0 q 40,5 80,0 q 40,-5 80,0 q 40,5 80,0 q 40,-5 80,0 q 40,5 80,0 q 40,-5 80,0 q 40,5 80,0" fill="none" stroke="#7fc4d0" stroke-width="2" opacity=".6"/>

            <!-- depth ruler -->
            <g font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">
              <line x1="600" y1="70" x2="600" y2="330" stroke="#3a545f" stroke-width="1.4"/>
              <line x1="594" y1="80" x2="606" y2="80" stroke="#3a545f"/><text x="612" y="84">0 m &#183; 1 atm</text>
              <line x1="594" y1="160" x2="606" y2="160" stroke="#3a545f"/><text x="612" y="164" text-anchor="start">10</text>
              <line x1="594" y1="240" x2="606" y2="240" stroke="#3a545f"/><text x="612" y="244">20</text>
              <line x1="594" y1="320" x2="606" y2="320" stroke="#3a545f"/><text x="612" y="324">30</text>
            </g>

            <!-- diver at 30 m -->
            <g>
              <circle cx="90" cy="300" r="13" fill="#dcebee"/>
              <rect x="74" y="313" width="34" height="20" rx="8" fill="#5ea3b0"/>
              <rect x="104" y="308" width="10" height="22" rx="4" fill="#3a545f"/>
              <g fill="#cfe4ea" opacity=".8">
                <circle class="a-rise" style="--rise:-210px; --wob:6px; --dur:5s" cx="96" cy="288" r="3"/>
                <circle class="a-rise" style="--rise:-215px; --wob:5px; --dur:6s; --delay:1.6s" cx="102" cy="290" r="2.4"/>
                <circle class="a-rise" style="--rise:-205px; --wob:7px; --dur:5.5s; --delay:3.2s" cx="90" cy="286" r="3.4"/>
              </g>
              <text x="90" y="352" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">sealed at 30 m: 1.0 L @ 4 atm</text>
            </g>

            <!-- the balloon you drag -->
            <g class="a-float" style="--fy:-3px; --tilt:1.5deg; --dur:3.2s">
              <circle :cy="80 + depth*8" :r="14 * Math.cbrt(4/(1 + depth/10))" cx="330" fill="#ffd27e" fill-opacity=".85" stroke="#ffe4b0" stroke-width="2"/>
              <line x1="330" :y1="80 + depth*8 + 14 * Math.cbrt(4/(1 + depth/10))" x2="330" :y2="80 + depth*8 + 14 * Math.cbrt(4/(1 + depth/10)) + 12" stroke="#ffe4b0" stroke-width="1.6"/>
              <text :y="80 + depth*8 + 4" x="330" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#10202a" font-weight="700" x-text="(4/(1 + depth/10)).toFixed(2) + ' L'"></text>
            </g>

            <!-- live readout -->
            <g font-family="JetBrains Mono">
              <rect x="24" y="72" width="180" height="76" rx="10" fill="#0d1a21" stroke="#2c414d"/>
              <text x="40" y="96" font-size="10" fill="#8fa9b2">BALLOON TELEMETRY</text>
              <text x="40" y="116" font-size="12" fill="#7fc4d0" x-text="'P = ' + (1 + depth/10).toFixed(1) + ' atm'"></text>
              <text x="40" y="136" font-size="12" fill="#ffd27e" x-text="'V = ' + (4/(1 + depth/10)).toFixed(2) + ' L'"></text>
              <text x="128" y="126" font-size="10" fill="#8fd9ae">PV = 4.0</text>
            </g>

            <!-- step 3 warning overlay -->
            <g x-show="step===2">
              <g class="a-float" style="--dur:3s">
                <rect x="236" y="72" width="188" height="26" rx="13" fill="#0d1a21" stroke="#ff9a82"/>
                <text x="330" y="89" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#ff9a82" font-weight="700">NEVER HOLD YOUR BREATH</text>
              </g>
            </g>
          </svg>
`
};
