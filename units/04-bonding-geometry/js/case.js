// case.js - Unit 4 case file, water's bent shape is why ice floats.
// Carries the story AND the stage art; rendered by the shared casefile component.
//
// The units_new build. Copied whole from units/04-bonding-geometry/js/case.js, including
// the animated stage SVG, with exactly one change: cta.call goes through setMode() rather
// than assigning `mode` directly, because the cockpit's setMode is what generates the
// capstone and it is the only supported way to move the station strip.

export const CASE = {
  id: 'water-bend-ice',
  number: '004',
  kicker: 'every winter, every lake',
  title: 'The 104.5° bend that keeps fish alive',
  teaser: 'One 104.5&#176; bond angle is why lakes never freeze solid',
  hook: 'Every winter, lakes freeze from the top down and life keeps swimming underneath. That survival trick is not luck. It is molecular geometry, the same VSEPR shapes you are rotating in this unit.',
  stats: [
    { v: '104.5°', k: 'bond angle of water' },
    { v: '~9%', k: 'ice less dense than water' },
    { v: '2', k: 'lone pairs doing the pushing' }
  ],
  steps: [
    {
      t: 'A frozen lake, alive underneath',
      body: 'January. A lake seals over with ice, yet underneath, water hovers near 4 degrees Celsius all winter and the fish keep cruising. Almost any other substance would freeze from the bottom up and lock the lake solid.',
      chem: 'Solids are normally denser than their liquids, so they sink. Water is the famous exception, and the reason is pure geometry.',
      cap: 'Ice floats; the water below stays near 4 C all winter.'
    },
    {
      t: 'Blame the lone pairs',
      body: 'Oxygen in H2O holds two bonding pairs and two lone pairs. Four electron domains want a tetrahedron, but the two invisible lone pairs shove the O-H bonds together to 104.5 degrees. Water is bent, and because oxygen hogs electrons, it is strongly polar.',
      chem: 'Bent shape plus electronegative oxygen equals a permanent dipole: a negative O end, positive H ends. A tiny magnet, built by VSEPR.',
      cap: 'Two lone pairs push the hydrogens into the famous bend.'
    },
    {
      t: 'Freezing locks an open cage',
      body: 'Liquid water molecules grab and release each other with hydrogen bonds millions of times a second. Chill them and the dipoles lock into a hexagonal lattice full of empty space. The solid takes MORE room than the liquid, so ice is about 9% less dense. It has to float.',
      chem: 'Hydrogen bonding is an intermolecular force born from polarity, which was born from shape. Shape, then polarity, then forces, then the density anomaly.',
      cap: 'The hexagonal ice lattice: strong hydrogen bonds, lots of empty space.'
    },
    {
      t: 'The universe without the bend',
      body: 'If water were linear like CO2, its bond dipoles would cancel. Weak forces, no open lattice, ice denser than liquid. Lakes and oceans would freeze from the bottom into solid blocks and aquatic ecosystems would not survive a single winter. One bond angle is holding up a biosphere.',
      chem: 'CO2 has no lone pairs on its central atom: two domains, 180 degrees, nonpolar. Nearly the same atom count as water, opposite destiny. Geometry decides.',
      cap: 'Linear water would mean sinking ice and lakes frozen solid. Not our universe.'
    }
  ],
  quiz: {
    q: 'CO2 also has a central atom with two attachments, yet it is dead straight while water bends. Why?',
    options: [
      { label: 'Carbon holds no lone pairs, so its two domains spread to 180°', correct: true },
      { label: 'Oxygen atoms are heavier and sag the molecule', correct: false },
      { label: 'Double bonds are rigid and cannot bend', correct: false }
    ],
    explain: 'Shape follows electron domains. Carbon in CO2 carries two double-bond domains and zero lone pairs, so they spread to 180 degrees and the dipoles cancel. Oxygen in H2O carries four domains, and the two lone pairs crowd the bonds down to 104.5 degrees. Lone pairs never appear in the formula, but they run the show.'
  },
  punch: 'From one bond angle you just explained floating ice, dissolving salt, and life surviving winter. Molecular shape is a superpower; medicine designs drugs with it every day.',
  careers: ['Drug designer', 'Climate scientist', 'Materials engineer', 'Marine biologist'],
  cta: { label: 'Spin the 3D shapes yourself', call: "setMode('geometry')" },
  stage: `          <svg viewBox="0 0 640 360" role="img" aria-label="Animated scene: a frozen lake with fish alive below the ice, and the bent water molecule whose shape makes ice float">
            <!-- winter sky -->
            <rect x="0" y="0" width="640" height="110" fill="#0f1e27"/>
            <g fill="#dcebee" opacity=".8">
              <circle class="a-fall" style="--fy:90px; --sway:8px; --dur:4.5s" cx="90" cy="20" r="2"/>
              <circle class="a-fall" style="--fy:90px; --sway:6px; --dur:5.2s; --delay:1.2s" cx="220" cy="14" r="1.6"/>
              <circle class="a-fall" style="--fy:90px; --sway:9px; --dur:4.1s; --delay:2.1s" cx="340" cy="18" r="2"/>
              <circle class="a-fall" style="--fy:90px; --sway:7px; --dur:5.6s; --delay:.6s" cx="470" cy="12" r="1.7"/>
              <circle class="a-fall" style="--fy:90px; --sway:8px; --dur:4.8s; --delay:2.8s" cx="580" cy="20" r="2"/>
              <circle class="a-fall" style="--fy:90px; --sway:5px; --dur:6s; --delay:3.4s" cx="150" cy="16" r="1.4"/>
              <circle class="a-fall" style="--fy:90px; --sway:7px; --dur:5.4s; --delay:1.8s" cx="520" cy="18" r="1.5"/>
            </g>

            <!-- ice sheet with hex hints -->
            <rect x="0" y="110" width="640" height="34" fill="#9fd0dd" opacity=".85"/>
            <g stroke="#e8f6fa" stroke-width="1.2" fill="none" opacity=".7">
              <path d="M 60,127 l 7,-6 9,0 7,6 -7,6 -9,0 z"/>
              <path d="M 200,127 l 7,-6 9,0 7,6 -7,6 -9,0 z"/>
              <path d="M 360,127 l 7,-6 9,0 7,6 -7,6 -9,0 z"/>
              <path d="M 520,127 l 7,-6 9,0 7,6 -7,6 -9,0 z"/>
            </g>
            <text x="614" y="132" text-anchor="end" font-family="JetBrains Mono" font-size="10" fill="#10202a">ICE 0&#176;C</text>

            <!-- water -->
            <rect x="0" y="144" width="640" height="216" fill="#11303f"/>
            <!-- fish -->
            <g x-show="step&lt;3">
              <g class="a-flow" style="--fx:420px; --dur:9s">
                <g transform="translate(60,250)">
                  <g class="a-swim" style="--dur:1.8s">
                    <ellipse cx="0" cy="0" rx="16" ry="7" fill="#7fc4d0"/>
                    <path class="a-tailwag" style="--dur:.7s" d="M -14,0 L -24,-7 L -24,7 Z" fill="#7fc4d0"/>
                    <circle cx="9" cy="-2" r="1.6" fill="#0d1a21"/>
                  </g>
                </g>
              </g>
              <g class="a-flow" style="--fx:-380px; --dur:11s; --delay:2s">
                <g transform="translate(540,300) scale(-1,1)">
                  <g class="a-swim" style="--dur:2.1s; --delay:.5s">
                    <ellipse cx="0" cy="0" rx="13" ry="6" fill="#5ea3b0"/>
                    <path class="a-tailwag" style="--dur:.8s; --delay:.2s" d="M -11,0 L -20,-6 L -20,6 Z" fill="#5ea3b0"/>
                    <circle cx="7" cy="-2" r="1.4" fill="#0d1a21"/>
                  </g>
                </g>
              </g>
              <g class="a-flow" style="--fx:300px; --dur:8s; --delay:4s">
                <g transform="translate(150,320)">
                  <g class="a-swim" style="--dur:1.5s; --delay:.3s">
                    <ellipse cx="0" cy="0" rx="10" ry="4.5" fill="#8fd9ae"/>
                    <path class="a-tailwag" style="--dur:.6s; --delay:.1s" d="M -9,0 L -16,-5 L -16,5 Z" fill="#8fd9ae"/>
                    <circle cx="5" cy="-1.5" r="1.2" fill="#0d1a21"/>
                  </g>
                </g>
              </g>
              <!-- stray bubbles from the fish, wobbling up to the ice -->
              <g fill="#cfe4ea" opacity=".7">
                <circle class="a-rise" style="--rise:-96px; --wob:3px; --dur:4.6s; --delay:1s" cx="250" cy="248" r="2"/>
                <circle class="a-rise" style="--rise:-140px; --wob:4px; --dur:5.4s; --delay:3.2s" cx="420" cy="292" r="2.4"/>
              </g>
            </g>
            <!-- bottom temperature -->
            <text x="614" y="348" text-anchor="end" font-family="JetBrains Mono" font-size="10" fill="#7fc4d0">4&#176;C down here, all winter</text>

            <!-- step 2: the bent molecule card -->
            <g x-show="step===1">
              <rect x="36" y="160" width="230" height="172" rx="10" fill="#0d1a21" stroke="#2c414d"/>
              <text x="151" y="182" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">H2O: BENT + POLAR</text>
              <!-- lone pairs -->
              <g fill="#ffd27e">
                <circle class="a-pulse" style="--dur:2s" cx="128" cy="212" r="4"/>
                <circle class="a-pulse" style="--dur:2s; --delay:.3s" cx="140" cy="206" r="4"/>
                <circle class="a-pulse" style="--dur:2s; --delay:.6s" cx="162" cy="206" r="4"/>
                <circle class="a-pulse" style="--dur:2s; --delay:.9s" cx="174" cy="212" r="4"/>
              </g>
              <!-- O and H -->
              <circle cx="151" cy="238" r="22" fill="#ff8a70"/>
              <text x="151" y="243" text-anchor="middle" font-family="JetBrains Mono" font-size="13" fill="#0d1a21" font-weight="700">O</text>
              <g class="a-float" style="--dur:3.4s">
                <circle cx="106" cy="280" r="13" fill="#dcebee"/>
                <text x="106" y="285" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#0d1a21" font-weight="700">H</text>
              </g>
              <g class="a-float" style="--dur:3.4s; --delay:.8s">
                <circle cx="196" cy="280" r="13" fill="#dcebee"/>
                <text x="196" y="285" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#0d1a21" font-weight="700">H</text>
              </g>
              <line x1="138" y1="252" x2="115" y2="270" stroke="#8fa9b2" stroke-width="3"/>
              <line x1="164" y1="252" x2="187" y2="270" stroke="#8fa9b2" stroke-width="3"/>
              <path d="M 124,268 A 34,34 0 0 1 178,268" fill="none" stroke="#7fc4d0" stroke-width="1.4" stroke-dasharray="3 3"/>
              <text x="151" y="292" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#7fc4d0">104.5&#176;</text>
              <text x="151" y="318" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">&#948;- on O &#183; &#948;+ on H: a tiny magnet</text>
            </g>

            <!-- step 3: open hexagonal lattice -->
            <g x-show="step===2">
              <rect x="36" y="160" width="230" height="172" rx="10" fill="#0d1a21" stroke="#2c414d"/>
              <text x="151" y="182" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">FROZEN: AN OPEN CAGE</text>
              <g stroke="#9fd0dd" stroke-width="2" fill="none">
                <path class="a-pulse" style="--dur:2.6s" d="M 151,206 l 30,17 0,34 -30,17 -30,-17 0,-34 z"/>
                <path class="a-pulse" style="--dur:2.6s; --delay:.5s" d="M 211,240 l 24,14 0,27 -24,14 -24,-14 0,-27 z" opacity=".65"/>
                <path class="a-pulse" style="--dur:2.6s; --delay:1s" d="M 91,240 l 24,14 0,27 -24,14 -24,-14 0,-27 z" opacity=".65"/>
              </g>
              <g fill="#dcebee">
                <circle cx="151" cy="206" r="4"/><circle cx="181" cy="223" r="4"/><circle cx="181" cy="257" r="4"/>
                <circle cx="151" cy="274" r="4"/><circle cx="121" cy="257" r="4"/><circle cx="121" cy="223" r="4"/>
              </g>
              <text x="151" y="318" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fd9ae">same molecules, +9% volume &#8594; floats</text>
            </g>

            <!-- step 4: the alternate universe -->
            <g x-show="step===3">
              <rect x="36" y="160" width="230" height="172" rx="10" fill="#0d1a21" stroke="#ff9a82"/>
              <text x="151" y="182" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#ff9a82">IF WATER WERE LINEAR&#8230;</text>
              <g>
                <circle cx="106" cy="212" r="11" fill="#dcebee"/>
                <circle cx="151" cy="212" r="15" fill="#ff8a70"/>
                <circle cx="196" cy="212" r="11" fill="#dcebee"/>
                <line x1="117" y1="212" x2="136" y2="212" stroke="#8fa9b2" stroke-width="3"/>
                <line x1="166" y1="212" x2="185" y2="212" stroke="#8fa9b2" stroke-width="3"/>
                <text x="151" y="238" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">180&#176;: dipoles cancel</text>
              </g>
              <g class="a-fall" style="--fy:56px; --sway:3px; --dur:2.8s">
                <rect class="a-sway" style="--deg:9deg; --dur:2.8s" x="120" y="252" width="26" height="26" rx="4" fill="#9fd0dd" opacity=".9"/>
              </g>
              <g class="a-fall" style="--fy:56px; --sway:2px; --dur:3.3s; --delay:1.1s">
                <rect class="a-sway" style="--deg:7deg; --dur:3.3s; --delay:.4s" x="168" y="248" width="20" height="20" rx="4" fill="#9fd0dd" opacity=".8"/>
              </g>
              <text x="151" y="322" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#ff9a82">ice sinks &#8594; lakes freeze solid</text>
            </g>
          </svg>`
};
