// case.js — Unit 2 case file: fireworks, excited states, and emission spectra.
// Carries the story AND the stage art; rendered by the shared casefile component.

export const CASE = {
  id: 'firework-electrons',
  number: '002',
  kicker: 'chemistry in the night sky',
  title: 'How chemistry produces firework colors',
  teaser: 'Metal compounds emit characteristic colors when heated',
  hook: 'Inside an aerial firework, burning stars heat color-producing compounds. Excited atoms, ions, and molecules then emit light at characteristic wavelengths.',
  stats: [
    { v: 'Sr · Ba · Cu', k: 'common red · green · blue colorants' },
    { v: 'E = hν', k: 'photon energy' },
    { v: 'λ', k: 'wavelength helps determine color' }
  ],
  steps: [
    {
      t: 'Stars carry the colorants',
      body: 'An aerial firework contains small pyrotechnic pellets called stars. A lift charge launches the shell. After a delay, a burst charge ignites and scatters the stars, producing the visible pattern.',
      chem: 'Strontium compounds commonly produce red colors, barium compounds green, copper compounds blue, and sodium compounds yellow.',
      cap: 'Launch → delay → burst → burning stars.'
    },
    {
      t: 'Heat creates excited states',
      body: 'As a star burns, heat excites some of its color-producing material. Electrons in the emitting atoms, ions, or molecules can move to higher-energy states.',
      chem: 'Excited states contain more energy than lower-energy states. The allowed energy states depend on the chemical species.',
      cap: 'Energy in → excited state.'
    },
    {
      t: 'Transitions can emit photons',
      body: 'When an excited species moves to a lower-energy state, it can emit a photon. The photon carries energy equal to the difference between the two states.',
      chem: 'ΔE = hν = hc/λ. Higher-frequency, shorter-wavelength photons carry more energy.',
      cap: 'Energy difference → photon energy → wavelength.'
    },
    {
      t: 'Spectra help identify elements',
      body: 'An excited element can produce a characteristic pattern of emission lines. Scientists compare measured spectra with reference spectra to help identify elements in laboratory samples and astronomical objects.',
      chem: 'A line pattern provides stronger identification evidence than one color alone. Real pyrotechnic flames can contain atoms, ions, and molecules, so a firework color is not always one single spectral line.',
      cap: 'Observe the pattern → compare → identify.'
    }
  ],
  quiz: {
    q: 'Two emitted photons have wavelengths of 500 nm and 650 nm. Which photon has more energy?',
    options: [
      { label: 'The 500 nm photon', correct: true },
      { label: 'The 650 nm photon', correct: false },
      { label: 'Both photons have the same energy', correct: false }
    ],
    explain: 'Photon energy is inversely proportional to wavelength: E = hc/λ. The 500 nm photon therefore has more energy than the 650 nm photon.'
  },
  punch: 'Firework colors connect the same ideas used in spectroscopy: energy states, photon energy, wavelength, and characteristic emission.',
  careers: ['Pyrotechnic chemist', 'Astronomer', 'Analytical chemist', 'Laser engineer'],
  cta: { label: 'Explore emission spectra', call: "setMode('spectra')" },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated scene: fireworks in characteristic element colors with an inset showing excitation, photon emission, and an emission-line pattern">
            <g fill="#cfe4ea">
              <circle class="a-twinkle" style="--dur:3s" cx="80" cy="40" r="1.2"/>
              <circle class="a-twinkle" style="--dur:2.6s; --delay:.6s" cx="200" cy="70" r="1"/>
              <circle class="a-twinkle" style="--dur:3.4s; --delay:1.2s" cx="330" cy="30" r="1.3"/>
              <circle class="a-twinkle" style="--dur:2.9s; --delay:.3s" cx="470" cy="60" r="1.1"/>
              <circle class="a-twinkle" style="--dur:3.7s; --delay:1.6s" cx="600" cy="40" r="1.2"/>
              <circle class="a-twinkle" style="--dur:3.2s; --delay:.9s" cx="130" cy="120" r="1"/>
            </g>

            <g fill="#1c3441">
              <rect x="0" y="318" width="640" height="42"/>
              <rect x="30" y="286" width="34" height="36"/><rect x="80" y="298" width="26" height="24"/>
              <rect x="130" y="278" width="40" height="44"/><rect x="200" y="292" width="30" height="30"/>
              <rect x="420" y="284" width="36" height="38"/><rect x="480" y="296" width="28" height="26"/>
              <rect x="540" y="280" width="42" height="42"/>
            </g>
            <g fill="#ffd27e" opacity=".6">
              <rect class="a-blink" style="--dur:2.8s" x="38" y="294" width="4" height="4"/>
              <rect class="a-blink" style="--dur:3.4s; --delay:1s" x="142" y="288" width="4" height="4"/>
              <rect class="a-blink" style="--dur:2.4s; --delay:.5s" x="552" y="290" width="4" height="4"/>
            </g>

            <g>
              <g class="a-rise" style="--rise:-190px; --dur:3.2s; --wob:2.5px">
                <circle cx="180" cy="300" r="3.5" fill="#dcebee"/>
                <line class="a-flicker" style="--dur:.35s; --org:50% 0%" x1="180" y1="304" x2="180" y2="318" stroke="#ffd27e" stroke-width="1.6" opacity=".8"/>
              </g>
              <g class="a-rise" style="--rise:-170px; --dur:3.8s; --delay:1.4s; --wob:2.5px">
                <circle cx="300" cy="300" r="3.5" fill="#dcebee"/>
                <line class="a-flicker" style="--dur:.3s; --org:50% 0%" x1="300" y1="304" x2="300" y2="318" stroke="#ffd27e" stroke-width="1.6" opacity=".8"/>
              </g>
            </g>

            <g x-show="step>=2">
              <g class="a-burst" style="--dur:2.8s">
                <g stroke="#ff6f5e" stroke-width="2">
                  <line x1="180" y1="110" x2="180" y2="70"/><line x1="180" y1="110" x2="180" y2="150"/>
                  <line x1="180" y1="110" x2="140" y2="110"/><line x1="180" y1="110" x2="220" y2="110"/>
                  <line x1="180" y1="110" x2="152" y2="82"/><line x1="180" y1="110" x2="208" y2="138"/>
                  <line x1="180" y1="110" x2="152" y2="138"/><line x1="180" y1="110" x2="208" y2="82"/>
                </g>
                <circle cx="180" cy="110" r="6" fill="#ffb3a6"/>
              </g>
              <g fill="#ffb3a6">
                <circle class="a-spark" style="--dur:2.2s; --delay:.9s" cx="152" cy="82" r="2.2"/>
                <circle class="a-spark" style="--dur:2.4s; --delay:1.4s" cx="212" cy="130" r="2"/>
                <circle class="a-fall" style="--fy:44px; --sway:6px; --dur:2.9s; --delay:1.1s" cx="180" cy="132" r="1.8"/>
                <circle class="a-fall" style="--fy:38px; --sway:5px; --dur:3.2s; --delay:1.7s" cx="158" cy="122" r="1.6"/>
              </g>
              <text x="180" y="176" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#ff9a82">Sr &#183; red</text>
            </g>
            <g x-show="step>=3">
              <g class="a-burst" style="--dur:3.1s; --delay:.9s">
                <g stroke="#7ede9a" stroke-width="2">
                  <line x1="320" y1="80" x2="320" y2="46"/><line x1="320" y1="80" x2="320" y2="114"/>
                  <line x1="320" y1="80" x2="286" y2="80"/><line x1="320" y1="80" x2="354" y2="80"/>
                  <line x1="320" y1="80" x2="296" y2="56"/><line x1="320" y1="80" x2="344" y2="104"/>
                  <line x1="320" y1="80" x2="296" y2="104"/><line x1="320" y1="80" x2="344" y2="56"/>
                </g>
                <circle cx="320" cy="80" r="5" fill="#c9f5d6"/>
              </g>
              <g fill="#c9f5d6">
                <circle class="a-spark" style="--dur:2.3s; --delay:1.8s" cx="296" cy="56" r="2"/>
                <circle class="a-fall" style="--fy:40px; --sway:5px; --dur:3s; --delay:2s" cx="320" cy="100" r="1.7"/>
              </g>
              <text x="320" y="132" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#7ede9a">Ba &#183; green</text>
              <g class="a-burst" style="--dur:2.6s; --delay:1.7s">
                <g stroke="#7fc4ff" stroke-width="2">
                  <line x1="255" y1="180" x2="255" y2="152"/><line x1="255" y1="180" x2="255" y2="208"/>
                  <line x1="255" y1="180" x2="227" y2="180"/><line x1="255" y1="180" x2="283" y2="180"/>
                  <line x1="255" y1="180" x2="235" y2="160"/><line x1="255" y1="180" x2="275" y2="200"/>
                  <line x1="255" y1="180" x2="235" y2="200"/><line x1="255" y1="180" x2="275" y2="160"/>
                </g>
                <circle cx="255" cy="180" r="4.5" fill="#cfe8ff"/>
              </g>
              <g fill="#cfe8ff">
                <circle class="a-spark" style="--dur:2s; --delay:2.5s" cx="235" cy="160" r="1.8"/>
                <circle class="a-fall" style="--fy:34px; --sway:4px; --dur:2.8s; --delay:2.7s" cx="255" cy="196" r="1.5"/>
              </g>
              <text x="255" y="226" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#7fc4ff">Cu &#183; blue</text>
            </g>

            <g x-show="step===0">
              <g class="a-float" style="--dur:4s">
                <rect x="404" y="96" width="196" height="86" rx="8" fill="#132630" stroke="#2c414d"/>
                <text x="502" y="118" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">INSIDE THE SHELL: STARS</text>
                <circle cx="432" cy="146" r="9" fill="#ff6f5e"/><text x="432" y="172" text-anchor="middle" font-size="9" font-family="JetBrains Mono" fill="#ff9a82">Sr</text>
                <circle cx="478" cy="146" r="9" fill="#7ede9a"/><text x="478" y="172" text-anchor="middle" font-size="9" font-family="JetBrains Mono" fill="#7ede9a">Ba</text>
                <circle cx="524" cy="146" r="9" fill="#7fc4ff"/><text x="524" y="172" text-anchor="middle" font-size="9" font-family="JetBrains Mono" fill="#7fc4ff">Cu</text>
                <circle cx="570" cy="146" r="9" fill="#ffd27e"/><text x="570" y="172" text-anchor="middle" font-size="9" font-family="JetBrains Mono" fill="#ffd27e">Na</text>
              </g>
            </g>

            <g x-show="step===1 || step===2">
              <rect x="404" y="82" width="212" height="180" rx="8" fill="#132630" stroke="#2c414d"/>
              <text x="510" y="104" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2" x-text="step===1 ? 'ENERGY IN: EXCITED STATE' : 'LOWER STATE: PHOTON EMITTED'"></text>
              <circle class="a-glow" style="--dur:2.8s" cx="510" cy="186" r="14" fill="#ff9a82" opacity=".25"/>
              <circle cx="510" cy="186" r="10" fill="#ff9a82" opacity=".9"/>
              <circle cx="510" cy="186" r="30" fill="none" stroke="#4f93a0" stroke-width="1.2" opacity=".8"/>
              <circle cx="510" cy="186" r="52" fill="none" stroke="#4f93a0" stroke-width="1.2" opacity=".5"/>
              <g x-show="step===1">
                <circle class="a-hop" style="--fy:-22px; --dur:2.6s" cx="510" cy="156" r="5" fill="#7fc4d0"/>
                <path d="M 484,170 L 484,128" stroke="#ffd27e" stroke-width="2" marker-end="none"/>
                <path d="M 480,134 L 484,126 L 488,134" fill="none" stroke="#ffd27e" stroke-width="2"/>
              </g>
              <g x-show="step===2">
                <circle class="a-hop" style="--fy:22px; --dur:2.6s" cx="510" cy="134" r="5" fill="#7fc4d0"/>
                <path d="M 536,132 L 536,174" stroke="#ff6f5e" stroke-width="2"/>
                <path d="M 532,168 L 536,176 L 540,168" fill="none" stroke="#ff6f5e" stroke-width="2"/>
                <g class="a-flow" style="--fx:52px; --fy:-34px; --dur:2.2s"><path d="M 552,128 q 6,-8 12,0 q 6,8 12,0" fill="none" stroke="#ff6f5e" stroke-width="2"/></g>
              </g>
              <text x="510" y="252" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2" x-text="step===1 ? 'energy absorbed: higher state' : 'photon emitted: ΔE = hν'"></text>
            </g>

            <g x-show="step===3">
              <rect x="404" y="240" width="212" height="64" rx="8" fill="#132630" stroke="#2c414d"/>
              <text x="510" y="260" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">EMISSION-LINE PATTERN SUPPORTS ID</text>
              <rect x="420" y="270" width="180" height="18" fill="#0c1e27"/>
              <rect class="a-pulse" style="--dur:2.2s" x="438" y="270" width="3" height="18" fill="#ff6f5e"/>
              <rect class="a-pulse" style="--dur:2.2s; --delay:.4s" x="470" y="270" width="3" height="18" fill="#ffd27e"/>
              <rect class="a-pulse" style="--dur:2.2s; --delay:.8s" x="516" y="270" width="3" height="18" fill="#7ede9a"/>
              <rect class="a-pulse" style="--dur:2.2s; --delay:1.2s" x="560" y="270" width="3" height="18" fill="#7fc4ff"/>
            </g>
          </svg>`
};