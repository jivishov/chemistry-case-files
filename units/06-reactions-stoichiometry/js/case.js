// case.js - Unit 6 case file. Airbag inflation is stoichiometry on a 50 ms deadline.
// Carries the story AND the stage art; the shared casefile component renders both.
//
// The units_new build. Copied whole from units/06-reactions-stoichiometry/js/case.js,
// animated stage SVG included, with exactly one change: cta.call goes through setMode()
// rather than assigning `mode` directly. The cockpit's setMode is the only supported way
// to move the station strip -- a bare assignment leaves the strip's aria-selected state
// correct but skips the per-station work setMode does, and the tests/casefile.test.js
// cta.call gate accepts either form, so nothing else would have caught it.

export const CASE = {
  id: 'airbag-stoichiometry',
  number: '006',
  kicker: 'riding shotgun right now',
  title: 'Your airbag solves stoichiometry at 300 km/h',
  teaser: 'The mole ratio that inflates an airbag in 30 ms',
  hook: 'Between the crash sensor firing and your head reaching the steering wheel there are about 35 milliseconds. In that window a pellet of sodium azide must become exactly one bag of nitrogen gas. Not roughly. Exactly.',
  stats: [
    { v: '~30 ms', k: 'bag fully inflated' },
    { v: '2 : 3', k: 'NaN3 to N2 mole ratio' },
    { v: '~67 L', k: 'gas in a driver bag' }
  ],
  steps: [
    {
      t: 'The 50-millisecond window',
      body: 'A crash stops the car faster than you can blink. Sensors call it in about 15 milliseconds, and the bag must be full before your body arrives at around 50. No pump on Earth moves that fast. Only a chemical reaction can.',
      chem: 'The gas is not stored anywhere; it is manufactured on the spot. A solid becomes a gas in one reaction step, thousands of times faster than any compressor.',
      cap: 'Impact detected at 15 ms. Head arrives near 50 ms. Chemistry gets 35.'
    },
    {
      t: 'The pellet that becomes a bag',
      body: 'The inflator holds about 130 grams of sodium azide, NaN3. An electric igniter heats it past 300 degrees Celsius and it decomposes almost instantly into sodium metal and a flood of nitrogen gas.',
      chem: '2 NaN3 -> 2 Na + 3 N2. A decomposition reaction: one compound splitting into simpler substances, the exact pattern you classify in the Classify tab.',
      cap: '2 NaN3 -> 2 Na + 3 N2: a pellet becomes a cushion.'
    },
    {
      t: 'Why the mass is exact',
      body: 'Engineers run the mole path backward from the bag: 67 liters of N2 is about 3 moles. The 2:3 ratio demands 2 moles of NaN3, and molar mass turns that into about 130 grams of pellet. Too little azide and the bag is soft and your head bottoms out. Too much and it is a wall.',
      chem: 'Grams to moles, ratio, moles to volume: the same chain you run in the Stoichiometry tab, except a person lands on the answer.',
      cap: 'The pellet mass IS the answer to a mole problem.'
    },
    {
      t: 'Cleaning up the leftovers',
      body: 'That reaction also spits out sodium metal, which burns skin and reacts violently with water. So the pellet blends in KNO3 and SiO2, which capture the sodium in follow-up reactions and finish as harmless glassy silicate. The white dust after a deployment is planned chemistry.',
      chem: 'Real safety design is a reaction SYSTEM: a gas generator plus scavenger reactions for the dangerous byproduct, all sized with the same mole ratios.',
      cap: 'Follow-up reactions lock the leftover sodium into silicate glass.'
    }
  ],
  quiz: {
    q: '2 NaN3 -> 2 Na + 3 N2. An engineer loads 0.10 mol of sodium azide. How much nitrogen gas does the bag receive?',
    options: [
      { label: '0.15 mol of N2', correct: true },
      { label: '0.10 mol of N2', correct: false },
      { label: '0.067 mol of N2', correct: false }
    ],
    explain: 'The NaN3 to N2 ratio is 2 to 3, so multiply 0.10 mol by 3/2: the pellet yields 0.15 mol of N2. Scale that same move up and you have just sized a real inflator charge.'
  },
  punch: 'Every airbag on the road is a pre-solved stoichiometry problem riding shotgun. Someone solved it once, exactly, so it can save strangers forever.',
  careers: ['Automotive safety engineer', 'Propellant chemist', 'Crash-test analyst', 'Process engineer'],
  cta: { label: 'Run the airbag math yourself', call: "setMode('stoich')" },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated scene: a crash triggers sodium azide decomposition and the airbag inflates on a millisecond timeline">
            <!-- millisecond timeline -->
            <g>
              <rect x="60" y="34" width="520" height="10" rx="5" fill="#0c1e27" stroke="#2c414d"/>
              <rect x="60" y="34" height="10" rx="5" fill="#7fc4d0" style="transition: width .9s var(--ease);"
                    :width="[80,180,340,520][step]"/>
              <g font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">
                <text x="60" y="62">0 ms</text>
                <text x="196" y="62">15 ms: ignite</text>
                <text x="380" y="62">30 ms: full</text>
                <text x="580" y="62" text-anchor="end">50 ms: impact absorbed</text>
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
              <text x="196" y="104" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">INFLATOR: 130 g NaN3 PELLET</text>
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
                <rect x="76" y="92" width="74" height="24" rx="12" fill="#132630" stroke="#7fc4d0"/><text x="113" y="108" text-anchor="middle" fill="#7fc4d0">130 g NaN3</text>
              </g>
              <text x="158" y="108" fill="#8fa9b2">&#8594;</text>
              <g class="a-float" style="--dur:3.4s; --delay:.4s">
                <rect x="170" y="92" width="56" height="24" rx="12" fill="#132630" stroke="#7fc4d0"/><text x="198" y="108" text-anchor="middle" fill="#7fc4d0">2 mol</text>
              </g>
              <text x="234" y="108" fill="#8fa9b2">&#8594;</text>
              <g class="a-float" style="--dur:3.4s; --delay:.8s">
                <rect x="246" y="92" width="86" height="24" rx="12" fill="#132630" stroke="#8fd9ae"/><text x="289" y="108" text-anchor="middle" fill="#8fd9ae">&#215;3/2 = 3 mol</text>
              </g>
              <text x="340" y="108" fill="#8fa9b2">&#8594;</text>
              <g class="a-float" style="--dur:3.4s; --delay:1.2s">
                <rect x="352" y="92" width="70" height="24" rx="12" fill="#132630" stroke="#8fd9ae"/><text x="387" y="108" text-anchor="middle" fill="#8fd9ae">~67 L N2</text>
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
                <text x="201" y="105" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#ffd27e">Na + KNO3 + SiO2 &#8594; safe silicate glass</text>
              </g>
            </g>
          </svg>`
};
