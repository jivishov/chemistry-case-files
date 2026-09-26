// Case narrative and assessment aligned with the unit reading.
export const CASE = {
  "id": "airbag-stoichiometry",
  "number": "006",
  "kicker": "chemistry inside an engineered system",
  "title": "Airbags: a reaction ratio under a deadline",
  "teaser": "Use a historical inflator reaction to practice stoichiometry",
  "hook": "Airbags must inflate rapidly during a collision. Historical sodium-azide inflators illustrate how a balanced equation predicts gas amount. Actual inflator designs, timing, and chemistry vary; this is a calculation model.",
  "stats": [
    {
      "v": "milliseconds",
      "k": "rapid deployment; timing varies"
    },
    {
      "v": "2 : 3",
      "k": "NaN3 to N2 mole ratio"
    },
    {
      "v": "67.2 L",
      "k": "3 mol ideal gas at 0 °C and 1 atm"
    }
  ],
  "steps": [
    {
      "t": "Rapid gas delivery",
      "body": "A crash sensor can trigger an inflator within a fraction of a second. Airbag performance depends on gas delivery, venting, timing, and the rest of the restraint system. A balanced equation does not predict deployment speed.",
      "chem": "The following equation models a historical gas-generating reaction. It is not a claim that every current airbag uses sodium azide.",
      "cap": "Schematic sequence; the diagram is not a crash timing prediction."
    },
    {
      "t": "A historical decomposition",
      "body": "Sodium azide decomposes to sodium and nitrogen under appropriate initiation conditions. The reaction gives a useful example of one reactant producing simpler substances.",
      "chem": "2 NaN3 -> 2 Na + 3 N2. Two moles of sodium azide produce three moles of nitrogen in this complete-reaction model.",
      "cap": "Use the 2:3 mole ratio; coefficients do not compare grams."
    },
    {
      "t": "Attach conditions to a gas volume",
      "body": "For a classroom example, 2.00 mol NaN3 is about 130 g and yields 3.00 mol N2. At 0 °C and 1 atm, that amount of ideal gas occupies about 67.2 L. Hot gas inside a deploying airbag has different conditions.",
      "chem": "Use PV = nRT when temperature and pressure differ. The 22.4 L/mol shortcut cannot be applied silently to a hot inflator.",
      "cap": "67.2 L is an STP-equivalent example, not a measured deployed-bag volume."
    },
    {
      "t": "Account for the whole system",
      "body": "The primary reaction also produces reactive sodium. Historical designs included additional chemistry and filtration to manage byproducts. Such secondary reactions can contribute additional gas, so the primary equation alone is not the complete inflator model.",
      "chem": "A real design must account for all reactions, heat, rates, byproducts, and material behavior. A predicted mole amount does not certify safe performance.",
      "cap": "The full engineering problem includes more than the primary reaction."
    }
  ],
  "quiz": {
    "q": "Assume complete decomposition by 2 NaN3 -> 2 Na + 3 N2. How much N2 does 0.10 mol NaN3 produce in this primary reaction?",
    "options": [
      {
        "label": "0.15 mol of N2",
        "correct": true
      },
      {
        "label": "0.10 mol of N2",
        "correct": false
      },
      {
        "label": "0.067 mol of N2",
        "correct": false
      }
    ],
    "explain": "0.10 mol NaN3 × (3 mol N2 / 2 mol NaN3) = 0.15 mol N2. This is the primary reaction’s theoretical amount; it does not determine the performance of a complete inflator."
  },
  "punch": "A balanced equation predicts reaction quantities. Temperature, rates, and the rest of the system determine how those quantities behave in an airbag.",
  "careers": [
    "Automotive safety engineer",
    "Propellant chemist",
    "Crash-test engineer",
    "Chemical process engineer"
  ],
  "cta": {
    "label": "Practice the stoichiometry",
    "call": "setMode('stoich')"
  },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated scene illustrating a historical sodium-azide airbag inflator and stoichiometric gas generation">
            <!-- millisecond timeline -->
            <g>
              <rect x="60" y="34" width="520" height="10" rx="5" fill="#0c1e27" stroke="#2c414d"/>
              <rect x="60" y="34" height="10" rx="5" fill="#7fc4d0" style="transition: width .9s var(--ease);"
                    :width="[80,180,340,520][step]"/>
              <g font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">
                <text x="60" y="62">crash</text>
                <text x="196" y="62">sensor</text>
                <text x="380" y="62">inflator</text>
                <text x="580" y="62" text-anchor="end">bag deployed</text>
              </g>
            </g>

            <!-- wall -->
            <g>
              <rect x="562" y="90" width="30" height="240" fill="#213a49" stroke="#2c414d"/>
              <g stroke="#3f5a68" stroke-width="2">
                <line x1="562" y1="110" x2="592" y2="126"/><line x1="562" y1="150" x2="592" y2="166"/>
                <line x1="562" y1="190" x2="592" y2="206"/><line x1="562" y1="230" x2="592" y2="246"/>
                <line x1="562" y1="270" x2="592" y2="286"/>
              </g>
            </g>

            <!-- car -->
            <g :class="step===0 ? 'a-shake' : ''" style="--dur:.4s">
              <path d="M 80,260 L 96,214 C 110,196 150,188 200,188 L 330,188 C 400,188 470,204 510,232 L 546,232 C 556,238 558,252 554,262 L 540,268 L 96,268 Z" fill="#253c49" stroke="#3a545f" stroke-width="2"/>
              <path d="M 210,196 L 320,196 C 356,196 396,204 424,220 L 300,220 L 268,196 Z" fill="#1a3241"/>
              <circle cx="160" cy="278" r="26" fill="#132630" stroke="#3a545f" stroke-width="4"/>
              <circle cx="452" cy="278" r="26" fill="#132630" stroke="#3a545f" stroke-width="4"/>
              <!-- driver -->
              <circle cx="300" cy="196" r="15" fill="#dcebee"/>
              <rect x="284" y="212" width="34" height="34" rx="9" fill="#9db4bd"/>
              <!-- steering column -->
              <rect x="352" y="216" width="8" height="26" rx="3" fill="#3a545f" transform="rotate(18 356 229)"/>
              <!-- airbag: inflates with the timeline -->
              <circle cx="338" cy="216" fill="#f3f7f8" stroke="#c9d9de" stroke-width="2" style="transition: r .7s var(--ease);"
                      :r="[3,16,42,46][step]" :opacity="step===0 ? .4 : .95"/>
              <!-- N2 molecules inside the bag -->
              <g x-show="step>=2" fill="#7fc4d0">
                <circle class="a-jiggle" style="--dur:.7s" cx="326" cy="208" r="4"/>
                <circle class="a-jiggle" style="--dur:.85s; --delay:.2s" cx="348" cy="222" r="4"/>
                <circle class="a-jiggle" style="--dur:.65s; --delay:.4s" cx="334" cy="232" r="4"/>
                <circle class="a-jiggle" style="--dur:.9s; --delay:.1s" cx="350" cy="204" r="4"/>
                <circle class="a-jiggle" style="--dur:.75s; --delay:.3s" cx="340" cy="214" r="4"/>
              </g>
            </g>

            <!-- step 0: motion lines -->
            <g x-show="step===0" stroke="#8fa9b2" stroke-width="2" opacity=".8">
              <line class="a-flow" style="--fx:-46px; --dur:1s" x1="70" y1="220" x2="110" y2="220"/>
              <line class="a-flow" style="--fx:-46px; --dur:1s; --delay:.3s" x1="76" y1="248" x2="116" y2="248"/>
              <line class="a-flow" style="--fx:-46px; --dur:1s; --delay:.6s" x1="66" y1="288" x2="106" y2="288"/>
            </g>

            <!-- step 1: pellet ignition inset -->
            <g x-show="step===1">
              <rect x="76" y="84" width="240" height="88" rx="10" fill="#132630" stroke="#2c414d"/>
              <text x="196" y="104" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">HISTORICAL NaN3 INFLATOR</text>
              <circle class="a-glow" style="--dur:1.2s" cx="120" cy="138" r="19" fill="#ff9a82" opacity=".3"/>
              <circle class="a-flicker" style="--dur:.8s; --org:center" cx="120" cy="138" r="14" fill="#ffd27e"/>
              <circle class="a-spark" style="--dur:1.3s; --delay:.4s" cx="106" cy="124" r="2" fill="#fff4dc"/>
              <text x="120" y="142" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#132630">NaN3</text>
              <g fill="#7fc4d0">
                <circle class="a-flow" style="--fx:60px; --fy:-14px; --dur:1.6s" cx="140" cy="138" r="4"/>
                <circle class="a-flow" style="--fx:70px; --fy:2px; --dur:1.8s; --delay:.4s" cx="140" cy="140" r="4"/>
                <circle class="a-flow" style="--fx:56px; --fy:16px; --dur:1.5s; --delay:.9s" cx="140" cy="142" r="4"/>
              </g>
              <text x="230" y="132" font-family="JetBrains Mono" font-size="11" fill="#8fd9ae">2 NaN3</text>
              <text x="230" y="150" font-family="JetBrains Mono" font-size="11" fill="#8fd9ae">&#8594; 2 Na + 3 N2</text>
            </g>

            <!-- step 2: the mole chain -->
            <g x-show="step===2" font-family="JetBrains Mono" font-size="10">
              <g class="a-float" style="--dur:3.4s">
                <rect x="76" y="92" width="74" height="24" rx="12" fill="#132630" stroke="#7fc4d0"/><text x="113" y="108" text-anchor="middle" fill="#7fc4d0">2.00 mol</text>
              </g>
              <text x="158" y="108" fill="#8fa9b2">&#8594;</text>
              <g class="a-float" style="--dur:3.4s; --delay:.4s">
                <rect x="170" y="92" width="56" height="24" rx="12" fill="#132630" stroke="#7fc4d0"/><text x="198" y="108" text-anchor="middle" fill="#7fc4d0">NaN3</text>
              </g>
              <text x="234" y="108" fill="#8fa9b2">&#8594;</text>
              <g class="a-float" style="--dur:3.4s; --delay:.8s">
                <rect x="246" y="92" width="86" height="24" rx="12" fill="#132630" stroke="#8fd9ae"/><text x="289" y="108" text-anchor="middle" fill="#8fd9ae">&#215;3/2</text>
              </g>
              <text x="340" y="108" fill="#8fa9b2">&#8594;</text>
              <g class="a-float" style="--dur:3.4s; --delay:1.2s">
                <rect x="352" y="92" width="70" height="24" rx="12" fill="#132630" stroke="#8fd9ae"/><text x="387" y="108" text-anchor="middle" fill="#8fd9ae">67 L @ STP</text>
              </g>
            </g>

            <!-- step 3: cleanup -->
            <g x-show="step===3">
              <g fill="#dcebee" opacity=".85">
                <circle class="a-fall" style="--fy:40px; --sway:4px; --dur:2.6s" cx="300" cy="160" r="2.4"/>
                <circle class="a-fall" style="--fy:44px; --sway:5px; --dur:3s; --delay:.8s" cx="330" cy="156" r="2"/>
                <circle class="a-fall" style="--fy:38px; --sway:3px; --dur:2.4s; --delay:1.5s" cx="360" cy="162" r="2.4"/>
              </g>
              <g class="a-float" style="--dur:3.4s">
                <rect x="76" y="88" width="250" height="26" rx="13" fill="#132630" stroke="#ffd27e"/>
                <text x="201" y="105" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#ffd27e">BYPRODUCTS REQUIRE CONTROL</text>
              </g>
            </g>
          </svg>`
};
