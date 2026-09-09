// case.js — Unit 1 case file: the Mars Climate Orbiter unit error (1999).
// Carries the story AND the stage art; rendered by the shared casefile component.
// The stage uses high-fidelity raster assets inside SVG while preserving the original
// step-driven trajectory, unit-mismatch, and loss-of-signal animation logic.

export const CASE = {
  id: 'mars-orbiter-units',
  number: '001',
  kicker: 'a real engineering case',
  title: 'The Unit-Conversion Error That Cost a Mars Mission',
  teaser: 'How a mismatch between lbf·s and N·s contributed to the loss of Mars Climate Orbiter',
  hook: 'In 1999, NASA lost contact with Mars Climate Orbiter as the spacecraft arrived at Mars. Investigators found that a ground-software file reported thruster impulse in pound-force seconds (lbf·s), while the navigation software expected newton-seconds (N·s). Because the units did not match, the effect of the thruster firings was underestimated.',
  stats: [
    { v: '4.45×', k: 'conversion-factor difference' },
    { v: '226 km', k: 'planned first periapsis' },
    { v: '≈57 km', k: 'post-mishap estimate' }
  ],
  steps: [
    {
      t: 'One spacecraft, several teams',
      body: 'Different engineering teams produced and used data needed to navigate the spacecraft. During the nine-month trip to Mars, small thruster firings changed the spacecraft\'s motion. Navigation software used information about those firings to calculate the spacecraft\'s trajectory.',
      chem: 'A measurement consists of both a number and a unit. A numerical value cannot be interpreted correctly unless its unit is known.',
      cap: 'During the cruise to Mars, small thruster firings gradually affected the spacecraft\'s trajectory.'
    },
    {
      t: 'The unit mismatch',
      body: 'A ground-software file reported thruster impulse in pound-force seconds (lbf·s), but the software interface required newton-seconds (N·s). The navigation software treated the values as if they were already in N·s. Because 1 pound-force is approximately 4.45 newtons, the effect of the thruster firings was underestimated by a factor of 4.45.',
      chem: 'Conversion factors allow measurements to be expressed in different units without changing the physical quantity. Dimensional analysis helps verify that the units in a calculation are consistent.',
      cap: 'The file supplied lbf·s where the navigation system expected N·s.'
    },
    {
      t: 'A systematic navigation error',
      body: 'The incorrect unit conversion affected the modeling of repeated thruster firings. Small differences between the predicted and observed trajectory appeared during the mission, but the cause was not identified before the spacecraft reached Mars.',
      chem: 'A systematic error creates a consistent bias in measurements or calculations. Repeating the same method can produce results that are precise but still inaccurate if the source of the bias is not corrected.',
      cap: 'Small modeling errors accumulated during the nine-month trip to Mars.'
    },
    {
      t: 'Arrival at Mars',
      body: 'The planned first periapsis—the lowest point of the initial orbit—was 226 km above Mars. About one hour before arrival, the navigation solution indicated that the spacecraft might pass as low as 110 km. After the loss, calculations using corrected thruster data estimated a periapsis of about 57 km, which investigators judged too low for the spacecraft to survive. Contact with Mars Climate Orbiter was never restored.',
      chem: 'Reliable scientific work requires correct units, careful conversions, validation of calculations, and investigation of unexpected results.',
      cap: 'Planned periapsis: 226 km. Post-mishap estimate: about 57 km.'
    }
  ],
  quiz: {
    q: 'A thruster impulse was 1.0 lbf·s. The navigation software incorrectly treated the numerical value as 1.0 N·s. Since 1 lbf ≈ 4.45 N, how did the value used by the navigation software compare with the actual impulse?',
    options: [
      { label: 'It was about 4.45 times greater than the actual impulse.', correct: false },
      { label: 'It was only about 22% of the actual impulse.', correct: true },
      { label: 'It was the same because the numerical value was still 1.0.', correct: false }
    ],
    explain: '1.0 lbf·s is approximately 4.45 N·s. Treating that value as only 1.0 N·s underestimates the impulse by a factor of 4.45. In other words, the navigation model used about 22% of the actual impulse.'
  },
  punch: 'The Mars Climate Orbiter case shows why units are part of every measurement. Correct units, conversion factors, and dimensional analysis are essential whenever scientific data are shared or used in calculations.',
  careers: ['Aerospace engineer', 'Spacecraft navigator', 'Laboratory scientist', 'Quality-control chemist'],
  cta: { label: 'Practice measurement and unit skills', call: "setMode('measure')" },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated high-fidelity diagram comparing the planned and estimated Mars Climate Orbiter trajectories">
            <defs>
              <linearGradient id="cf1-space-vignette" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#02070f" stop-opacity=".05"/>
                <stop offset="1" stop-color="#02070f" stop-opacity=".46"/>
              </linearGradient>
              <radialGradient id="cf1-mars-glow" cx="50%" cy="50%" r="50%">
                <stop offset="58%" stop-color="#e58a51" stop-opacity="0"/>
                <stop offset="76%" stop-color="#e58a51" stop-opacity=".18"/>
                <stop offset="100%" stop-color="#e58a51" stop-opacity="0"/>
              </radialGradient>
              <radialGradient id="cf1-earth-glow" cx="50%" cy="50%" r="50%">
                <stop offset="62%" stop-color="#6ec8ff" stop-opacity="0"/>
                <stop offset="82%" stop-color="#6ec8ff" stop-opacity=".20"/>
                <stop offset="100%" stop-color="#6ec8ff" stop-opacity="0"/>
              </radialGradient>
              <filter id="cf1-soft-shadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="1" stdDeviation="2.4" flood-color="#000814" flood-opacity=".75"/>
              </filter>
              <filter id="cf1-hot-glow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            <image href="assets/case/mars-starfield.webp?v=1" x="0" y="0" width="640" height="360" preserveAspectRatio="xMidYMid slice"/>
            <rect width="640" height="360" fill="url(#cf1-space-vignette)"/>

            <g fill="#d7edf7" opacity=".9">
              <circle class="a-twinkle" style="--dur:2.8s" cx="60" cy="50" r="1.25"/>
              <circle class="a-twinkle" style="--dur:3.6s; --delay:.4s" cx="150" cy="110" r="1"/>
              <circle class="a-twinkle" style="--dur:3.1s; --delay:1.1s" cx="240" cy="40" r="1.15"/>
              <circle class="a-twinkle" style="--dur:2.5s; --delay:.7s" cx="330" cy="90" r=".95"/>
              <circle class="a-twinkle" style="--dur:3.9s; --delay:.2s" cx="420" cy="30" r="1.25"/>
              <circle class="a-twinkle" style="--dur:2.9s; --delay:1.5s" cx="580" cy="250" r="1.05"/>
              <circle class="a-twinkle" style="--dur:3.4s; --delay:.9s" cx="90" cy="200" r="1"/>
              <circle class="a-twinkle" style="--dur:2.6s; --delay:1.8s" cx="200" cy="300" r="1.1"/>
              <circle class="a-twinkle" style="--dur:3.2s; --delay:.5s" cx="360" cy="330" r=".95"/>
              <circle class="a-twinkle" style="--dur:3.7s; --delay:1.3s" cx="620" cy="60" r="1.05"/>
            </g>

            <g filter="url(#cf1-soft-shadow)">
              <circle cx="62" cy="298" r="35" fill="url(#cf1-earth-glow)"/>
              <image href="assets/case/earth.webp?v=1" x="37" y="273" width="50" height="50" preserveAspectRatio="xMidYMid meet"/>
              <text x="62" y="337" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#b8d5e1">EARTH</text>
            </g>

            <g filter="url(#cf1-soft-shadow)">
              <circle class="a-glow" style="--dur:5s" cx="512" cy="118" r="80" fill="url(#cf1-mars-glow)"/>
              <image href="assets/case/mars.webp?v=1" x="448" y="54" width="128" height="128" preserveAspectRatio="xMidYMid meet"/>
              <text x="512" y="190" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#f3c5a6">MARS</text>
            </g>

            <path d="M 80,294 C 220,236 360,208 448,170" fill="none" stroke="#63d8ff" stroke-width="2" stroke-dasharray="7 7" opacity=".88"/>
            <path d="M 448,170 A 92,92 0 0 1 566,204" fill="none" stroke="#63d8ff" stroke-width="2" stroke-dasharray="7 7" opacity=".62"/>

            <g x-show="step&lt;3">
              <g class="a-flow" style="--fx:360px; --fy:-116px; --dur:7s">
                <g transform="translate(84,290) rotate(-16)">
                  <g class="a-swim" style="--dur:3.2s">
                    <polygon class="a-flicker" style="--dur:.45s; --org:100% 50%" points="-36,0 -25,-4 -25,4" fill="#ffbd62" opacity=".88"/>
                    <polygon class="a-flicker" style="--dur:.3s; --delay:.1s; --org:100% 50%" points="-31,0 -25,-2 -25,2" fill="#fff5d6"/>
                    <image href="assets/case/mars-climate-orbiter.webp?v=1" x="-29" y="-29" width="58" height="58" preserveAspectRatio="xMidYMid meet"/>
                    <circle class="a-blink" style="--dur:1.4s" cx="0" cy="-23" r="1.8" fill="#ffd27e"/>
                  </g>
                </g>
              </g>
            </g>

            <g x-show="step===1">
              <g class="a-float" style="--dur:3.5s" filter="url(#cf1-soft-shadow)">
                <rect x="174" y="116" width="96" height="34" rx="7" fill="#111f2a" fill-opacity=".92" stroke="#ff8876" stroke-width="1.4"/>
                <text x="222" y="139" text-anchor="middle" font-family="JetBrains Mono" font-size="14" fill="#ff9a82">lbf&#183;s</text>
              </g>
              <text class="a-blink" style="--dur:1.6s" x="296" y="141" text-anchor="middle" font-family="JetBrains Mono" font-size="20" fill="#ffd27e">&#8800;</text>
              <g class="a-float" style="--dur:3.5s; --delay:.8s" filter="url(#cf1-soft-shadow)">
                <rect x="320" y="116" width="96" height="34" rx="7" fill="#111f2a" fill-opacity=".92" stroke="#63d8ff" stroke-width="1.4"/>
                <text x="368" y="139" text-anchor="middle" font-family="JetBrains Mono" font-size="14" fill="#7fe2ff">N&#183;s</text>
              </g>
              <text x="296" y="170" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#bfd0d8">no conversion applied</text>
            </g>

            <g x-show="step&gt;=2">
              <path class="a-draw" style="--dash:520; --dur:2.6s" d="M 80,294 C 236,252 392,238 484,164" fill="none" stroke="#ff7466" stroke-width="2.6"/>
              <text x="300" y="262" font-family="JetBrains Mono" font-size="10" fill="#ff8e81">estimated path (too low)</text>
              <text x="236" y="204" font-family="JetBrains Mono" font-size="10" fill="#7fe2ff">planned path</text>
            </g>

            <g x-show="step===3">
              <image href="assets/case/mars-climate-orbiter.webp?v=1" x="452" y="132" width="62" height="62" preserveAspectRatio="xMidYMid meet" opacity=".96"/>
              <line class="a-pulse" style="--dur:.7s" x1="450" y1="184" x2="481" y2="167" stroke="#ffd27e" stroke-width="3" stroke-linecap="round" opacity=".9" filter="url(#cf1-hot-glow)"/>
              <g class="a-burst" style="--dur:2.2s" filter="url(#cf1-hot-glow)">
                <circle cx="484" cy="164" r="7" fill="#fff4d4"/>
                <circle cx="484" cy="164" r="14" fill="#ffd27e" fill-opacity=".34" stroke="#ff8e81" stroke-width="2"/>
                <circle cx="484" cy="164" r="24" fill="none" stroke="#ff7466" stroke-width="1.4" stroke-opacity=".72"/>
              </g>
              <g fill="#ffd27e">
                <circle class="a-spark" style="--dur:1.6s" cx="468" cy="148" r="2.4"/>
                <circle class="a-spark" style="--dur:1.9s; --delay:.5s" cx="502" cy="174" r="2"/>
                <circle class="a-spark" style="--dur:1.7s; --delay:1.1s" cx="488" cy="188" r="2.2"/>
                <circle class="a-spark" style="--dur:2.1s; --delay:.8s" cx="462" cy="176" r="1.8"/>
              </g>
              <line x1="484" y1="164" x2="592" y2="112" stroke="#c7d5dc" stroke-width="1" stroke-dasharray="3 3"/>
              <text x="596" y="104" text-anchor="end" font-family="JetBrains Mono" font-size="10" fill="#ff8e81">≈57 km: post-mishap estimate</text>
              <line x1="566" y1="204" x2="606" y2="244" stroke="#c7d5dc" stroke-width="1" stroke-dasharray="3 3"/>
              <text x="608" y="258" text-anchor="end" font-family="JetBrains Mono" font-size="10" fill="#7fe2ff">226 km: planned periapsis</text>
              <text class="a-blink" style="--dur:1.1s" x="320" y="330" text-anchor="middle" font-family="JetBrains Mono" font-size="13" fill="#ff7466" font-weight="700">. . . LOSS OF SIGNAL . . .</text>
            </g>
          </svg>`
};
