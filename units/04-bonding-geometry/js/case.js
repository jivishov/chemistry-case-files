// Case narrative and assessment aligned with the unit reading.
export const CASE = {
  "id": "water-bend-ice",
  "number": "004",
  "kicker": "molecular shape and a winter lake",
  "title": "How water’s shape helps ice float",
  "teaser": "Bent molecules, hydrogen bonds, and floating ice",
  "hook": "Many lakes freeze at the surface while liquid water remains underneath. Water’s bent molecular shape and hydrogen bonding help explain the density of ordinary ice. Lake depth and climate also matter.",
  "stats": [
    {
      "v": "104.5°",
      "k": "H–O–H bond angle"
    },
    {
      "v": "~9%",
      "k": "volume increase on freezing ordinary water"
    },
    {
      "v": "2",
      "k": "lone pairs on oxygen"
    }
  ],
  "steps": [
    {
      "t": "Ice forms at the surface",
      "body": "As a sufficiently deep freshwater lake cools, denser water near 4 °C can settle below cooler surface water. Ordinary ice floats and can insulate the liquid beneath it. Shallow lakes can still freeze completely; molecular shape alone does not determine a lake’s winter temperature.",
      "chem": "Ordinary ice is less dense than liquid water because its hydrogen-bonded structure is relatively open. This is unusual; many solids are denser than their liquids.",
      "cap": "Floating ice can insulate liquid water; temperature varies with depth and conditions."
    },
    {
      "t": "Why water is bent",
      "body": "The oxygen atom in H2O has four electron domains: two O–H bonds and two lone pairs. VSEPR theory places the domains approximately tetrahedrally, but the molecular geometry is bent, with an H–O–H angle of about 104.5°. The O–H bond dipoles do not cancel, so water is polar.",
      "chem": "Bent shape and polar O-H bonds produce an electric dipole: a partially negative oxygen end and partially positive hydrogen ends. This is electric charge separation, not a magnetic pole.",
      "cap": "Two bonds + two lone pairs → bent H2O at about 104.5°."
    },
    {
      "t": "Hydrogen bonds organize ice",
      "body": "Liquid water’s hydrogen bonds continually rearrange. In ordinary ice they support a relatively open crystal structure. Near freezing, about 9% more volume for the same mass corresponds to about 8% lower density: density changes inversely with volume.",
      "chem": "Polar O-H bonds and a bent geometry permit hydrogen bonding. The open organization of ordinary ice, rather than molecular shape alone, explains its lower density.",
      "cap": "The open hydrogen-bonded lattice makes ice less dense."
    },
    {
      "t": "Compare the geometry with carbon dioxide",
      "body": "In CO2, two equivalent bond dipoles point in opposite directions and cancel. In bent H2O, they do not cancel. This comparison explains molecular polarity. It does not let us calculate the density or climate of an imaginary universe with linear water.",
      "chem": "The carbon in CO2 has two electron domains and no lone pairs, producing a 180° linear molecule. Water has four electron domains around oxygen, including two lone pairs, and a bent molecular shape.",
      "cap": "Compare dipole cancellation in linear CO2 with polar, bent H2O."
    }
  ],
  "quiz": {
    "q": "Why is H2O polar while CO2 is nonpolar overall?",
    "options": [
      {
        "label": "H2O is bent, so its O–H bond dipoles do not cancel; CO2 is linear, so its C=O bond dipoles cancel",
        "correct": true
      },
      {
        "label": "H2O is polar only because oxygen is heavier than hydrogen",
        "correct": false
      },
      {
        "label": "CO2 is nonpolar because double bonds cannot have bond dipoles",
        "correct": false
      }
    ],
    "explain": "Molecular polarity depends on both bond polarity and geometry. H2O is bent because oxygen has two bonding domains and two lone-pair domains, so its O–H bond dipoles give a net molecular dipole. CO2 is linear, so its two C=O bond dipoles cancel."
  },
  "punch": "Electron domains help predict shape, and shape helps explain polarity. Combine these ideas with intermolecular forces to explain properties such as the open structure of ordinary ice.",
  "careers": [
    "Materials chemist",
    "Climate scientist",
    "Environmental chemist",
    "Aquatic ecologist"
  ],
  "cta": {
    "label": "Explore the 3D molecular shapes",
    "call": "setMode('geometry')"
  },
  stage: `          <svg viewBox="0 0 640 360" role="img" aria-label="Animated scene showing floating lake ice, bent polar water molecules, an open ice lattice, and a comparison with linear carbon dioxide">
            <!-- winter sky -->
            <rect x="0" y="0" width="640" height="110" fill="#152b38"/>
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
            <text x="614" y="132" text-anchor="end" font-family="JetBrains Mono" font-size="10" fill="#172d3b">ICE 0&#176;C</text>

            <!-- water -->
            <rect x="0" y="144" width="640" height="216" fill="#153b4d"/>
            <!-- fish -->
            <g x-show="step&lt;3">
              <g class="a-flow" style="--fx:420px; --dur:9s">
                <g transform="translate(60,250)">
                  <g class="a-swim" style="--dur:1.8s">
                    <ellipse cx="0" cy="0" rx="16" ry="7" fill="#7fc4d0"/>
                    <path class="a-tailwag" style="--dur:.7s" d="M -14,0 L -24,-7 L -24,7 Z" fill="#7fc4d0"/>
                    <circle cx="9" cy="-2" r="1.6" fill="#132630"/>
                  </g>
                </g>
              </g>
              <g class="a-flow" style="--fx:-380px; --dur:11s; --delay:2s">
                <g transform="translate(540,300) scale(-1,1)">
                  <g class="a-swim" style="--dur:2.1s; --delay:.5s">
                    <ellipse cx="0" cy="0" rx="13" ry="6" fill="#5ea3b0"/>
                    <path class="a-tailwag" style="--dur:.8s; --delay:.2s" d="M -11,0 L -20,-6 L -20,6 Z" fill="#5ea3b0"/>
                    <circle cx="7" cy="-2" r="1.4" fill="#132630"/>
                  </g>
                </g>
              </g>
              <g class="a-flow" style="--fx:300px; --dur:8s; --delay:4s">
                <g transform="translate(150,320)">
                  <g class="a-swim" style="--dur:1.5s; --delay:.3s">
                    <ellipse cx="0" cy="0" rx="10" ry="4.5" fill="#8fd9ae"/>
                    <path class="a-tailwag" style="--dur:.6s; --delay:.1s" d="M -9,0 L -16,-5 L -16,5 Z" fill="#8fd9ae"/>
                    <circle cx="5" cy="-1.5" r="1.2" fill="#132630"/>
                  </g>
                </g>
              </g>
              <g fill="#cfe4ea" opacity=".7">
                <circle class="a-rise" style="--rise:-96px; --wob:3px; --dur:4.6s; --delay:1s" cx="250" cy="248" r="2"/>
                <circle class="a-rise" style="--rise:-140px; --wob:4px; --dur:5.4s; --delay:3.2s" cx="420" cy="292" r="2.4"/>
              </g>
            </g>
            <text x="614" y="348" text-anchor="end" font-family="JetBrains Mono" font-size="10" fill="#7fc4d0">LIQUID WATER BELOW THE ICE</text>

            <!-- step 2: the bent molecule card -->
            <g x-show="step===1">
              <rect x="36" y="160" width="230" height="172" rx="10" fill="#132630" stroke="#2c414d"/>
              <text x="151" y="182" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">H2O: BENT + POLAR</text>
              <g fill="#ffd27e">
                <circle class="a-pulse" style="--dur:2s" cx="128" cy="212" r="4"/>
                <circle class="a-pulse" style="--dur:2s; --delay:.3s" cx="140" cy="206" r="4"/>
                <circle class="a-pulse" style="--dur:2s; --delay:.6s" cx="162" cy="206" r="4"/>
                <circle class="a-pulse" style="--dur:2s; --delay:.9s" cx="174" cy="212" r="4"/>
              </g>
              <circle cx="151" cy="238" r="22" fill="#ff8a70"/>
              <text x="151" y="243" text-anchor="middle" font-family="JetBrains Mono" font-size="13" fill="#132630" font-weight="700">O</text>
              <g class="a-float" style="--dur:3.4s">
                <circle cx="106" cy="280" r="13" fill="#dcebee"/>
                <text x="106" y="285" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#132630" font-weight="700">H</text>
              </g>
              <g class="a-float" style="--dur:3.4s; --delay:.8s">
                <circle cx="196" cy="280" r="13" fill="#dcebee"/>
                <text x="196" y="285" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#132630" font-weight="700">H</text>
              </g>
              <line x1="138" y1="252" x2="115" y2="270" stroke="#8fa9b2" stroke-width="3"/>
              <line x1="164" y1="252" x2="187" y2="270" stroke="#8fa9b2" stroke-width="3"/>
              <path d="M 124,268 A 34,34 0 0 1 178,268" fill="none" stroke="#7fc4d0" stroke-width="1.4" stroke-dasharray="3 3"/>
              <text x="151" y="292" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#7fc4d0">104.5&#176;</text>
              <text x="151" y="318" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">BOND DIPOLES &#8594; NET MOLECULAR DIPOLE</text>
            </g>

            <!-- step 3: open hexagonal lattice -->
            <g x-show="step===2">
              <rect x="36" y="160" width="230" height="172" rx="10" fill="#132630" stroke="#2c414d"/>
              <text x="151" y="182" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">ICE: OPEN H-BONDED LATTICE</text>
              <g stroke="#9fd0dd" stroke-width="2" fill="none">
                <path class="a-pulse" style="--dur:2.6s" d="M 151,206 l 30,17 0,34 -30,17 -30,-17 0,-34 z"/>
                <path class="a-pulse" style="--dur:2.6s; --delay:.5s" d="M 211,240 l 24,14 0,27 -24,14 -24,-14 0,-27 z" opacity=".65"/>
                <path class="a-pulse" style="--dur:2.6s; --delay:1s" d="M 91,240 l 24,14 0,27 -24,14 -24,-14 0,-27 z" opacity=".65"/>
              </g>
              <g fill="#dcebee">
                <circle cx="151" cy="206" r="4"/><circle cx="181" cy="223" r="4"/><circle cx="181" cy="257" r="4"/>
                <circle cx="151" cy="274" r="4"/><circle cx="121" cy="257" r="4"/><circle cx="121" cy="223" r="4"/>
              </g>
              <text x="151" y="318" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fd9ae">MOLECULES FARTHER APART &#8594; LOWER DENSITY</text>
            </g>

            <!-- step 4: compare with real linear CO2 -->
            <g x-show="step===3">
              <rect x="36" y="160" width="230" height="172" rx="10" fill="#132630" stroke="#7fc4d0"/>
              <text x="151" y="182" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#7fc4d0">COMPARE: LINEAR CO2</text>
              <g>
                <circle cx="106" cy="222" r="13" fill="#ff8a70"/>
                <circle cx="151" cy="222" r="16" fill="#60676b"/>
                <circle cx="196" cy="222" r="13" fill="#ff8a70"/>
                <line x1="119" y1="219" x2="135" y2="219" stroke="#8fa9b2" stroke-width="2.4"/>
                <line x1="119" y1="225" x2="135" y2="225" stroke="#8fa9b2" stroke-width="2.4"/>
                <line x1="167" y1="219" x2="183" y2="219" stroke="#8fa9b2" stroke-width="2.4"/>
                <line x1="167" y1="225" x2="183" y2="225" stroke="#8fa9b2" stroke-width="2.4"/>
                <text x="106" y="227" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#132630" font-weight="700">O</text>
                <text x="151" y="227" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#e8f2f4" font-weight="700">C</text>
                <text x="196" y="227" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#132630" font-weight="700">O</text>
                <text x="151" y="252" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">180&#176;: BOND DIPOLES CANCEL</text>
              </g>
              <text x="151" y="300" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fd9ae">LINEAR + SYMMETRIC &#8594; NONPOLAR OVERALL</text>
              <text x="151" y="318" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#8fa9b2">SHAPE CHANGES THE VECTOR SUM OF BOND DIPOLES</text>
            </g>
          </svg>`
};
