// case.js — Unit 5 case file: Apollo 13, the mole math that brought them home.
// Carries the story AND the stage art; the shared casefile component renders the
// chrome around it. The same story units/05-the-mole tells, carried here in full so the
// units_new tree stands on its own.

export const CASE = {
  id: 'apollo-13-scrubber',
  number: '005',
  kicker: 'scientific case study',
  title: 'Apollo 13: Carbon Dioxide Control in a Lifeboat',
  teaser: 'Apollo 13 · April 1970',
  hook: 'After an oxygen-tank explosion forced Apollo 13 to abandon its Moon landing, the lunar module Aquarius became a lifeboat for three astronauts. Carbon dioxide removal became one of the mission’s critical life-support problems.',
  stats: [
    { v: '~320,000 km', k: 'from Earth when the crisis began' },
    { v: '3 crew', k: 'living in the lunar module during the return' },
    { v: '2 : 1', k: 'LiOH : CO2 stoichiometric mole ratio' }
  ],
  steps: [
    {
      t: 'An oxygen tank explodes',
      body: 'On April 13, 1970, an oxygen tank in Apollo 13’s service module exploded. The Moon landing was abandoned, and the crew moved into the lunar module Aquarius as a lifeboat for the return to Earth.',
      chem: 'The crisis turned consumables into quantitative problems. Oxygen, water, electrical power, and carbon dioxide removal all had limited supplies and operating constraints.',
      cap: 'April 13, 1970 · Apollo 13 changes from a lunar mission to a survival mission.'
    },
    {
      t: 'Carbon dioxide becomes a life-support concern',
      body: 'Aquarius had been designed for two astronauts on the lunar surface, not three people living in it for several days. As the crew exhaled, carbon dioxide accumulated, and the available lunar-module scrubber cartridges became a critical constraint.',
      chem: 'The amount of CO2 can be expressed in moles. With a molar mass of about 44.01 g/mol, a measured mass of CO2 can be converted to moles for stoichiometric calculations.',
      cap: 'Three crew members in Aquarius · carbon dioxide removal becomes critical.'
    },
    {
      t: 'Lithium hydroxide removes carbon dioxide',
      body: 'Apollo spacecraft used lithium hydroxide canisters to remove carbon dioxide from cabin air. A simplified stoichiometric model for the sorbent reaction is 2 LiOH + CO2 → Li2CO3 + H2O.',
      chem: 'The equation gives a 2:1 mole ratio. Removing 20 mol of CO2 would require 40 mol of LiOH, about 960 g theoretically. Actual cartridge capacity also depends on design, airflow, operating conditions, and test data.',
      cap: '2 LiOH + CO2 → Li2CO3 + H2O · stoichiometry gives the theoretical ratio.'
    },
    {
      t: 'Engineers adapt the canisters',
      body: 'The command module had additional square lithium hydroxide canisters, but the lunar module used a different canister arrangement. Engineers on the ground developed and tested an adapter made from materials already on the spacecraft, then sent the assembly procedure to the crew.',
      chem: 'The chemistry supplied the sorbent reaction; the engineering solution made cabin air flow through the available sorbent. Both were necessary for effective CO2 removal.',
      cap: 'Square command-module canisters adapted for the lunar-module system.'
    }
  ],
  quiz: {
    q: 'If 20 mol of CO2 reacts completely according to 2 LiOH + CO2 → Li2CO3 + H2O, what theoretical mass of LiOH is required? Use 24.0 g/mol for LiOH.',
    options: [
      { label: 'About 480 g (20 mol LiOH)', correct: false },
      { label: 'About 960 g (40 mol LiOH)', correct: true },
      { label: 'About 240 g (10 mol LiOH)', correct: false }
    ],
    explain: 'The balanced equation requires 2 mol LiOH for every 1 mol CO2. Therefore, 20 mol CO2 requires 40 mol LiOH. At 24.0 g/mol, the theoretical mass is 960 g. Real cartridge performance also depends on engineering design and operating conditions.'
  },
  punch: 'Apollo 13 shows how mole ratios translate a chemical equation into material requirements. Real life-support performance also depends on system design, airflow, testing, and operating limits.',
  careers: ['Environmental control and life-support engineer', 'Chemical engineer', 'Flight controller', 'Aerospace systems engineer'],
  cta: { label: 'Return to mole conversions', call: "setMode('molg')" },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated scene: inside the Apollo 13 lunar module, exhaled CO2 climbs a gauge until the improvised lithium hydroxide scrubber pulls it back down">
            <!-- space + stars -->
            <g fill="#cfe4ea">
              <circle class="a-twinkle" style="--dur:3.1s" cx="480" cy="30" r="1.3"/>
              <circle class="a-twinkle" style="--dur:2.7s; --delay:.8s" cx="560" cy="60" r="1.1"/>
              <circle class="a-twinkle" style="--dur:3.5s; --delay:1.4s" cx="610" cy="24" r="1.2"/>
            </g>

            <!-- cabin shell -->
            <path d="M 40,96 L 96,52 L 344,52 L 400,96 L 400,296 L 344,332 L 96,332 L 40,296 Z" fill="#172d3b" stroke="#2c414d" stroke-width="2"/>
            <text x="220" y="76" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">LM AQUARIUS &#183; LIFEBOAT</text>

            <!-- three astronauts -->
            <g>
              <g class="a-float" style="--dur:5.4s; --fy:-7px; --wob:3px; --tilt:2deg">
                <circle cx="120" cy="256" r="20" fill="#dcebee"/>
                <path d="M 106,250 A 16,14 0 0 1 134,250" fill="#1a3241"/>
                <rect x="104" y="276" width="32" height="36" rx="8" fill="#9db4bd"/>
              </g>
              <g class="a-float" style="--dur:6.2s; --fy:-5px; --wob:4px; --tilt:1.4deg; --delay:1.2s">
                <circle cx="220" cy="264" r="20" fill="#dcebee"/>
                <path d="M 206,258 A 16,14 0 0 1 234,258" fill="#1a3241"/>
                <rect x="204" y="284" width="32" height="30" rx="8" fill="#9db4bd"/>
              </g>
              <g class="a-float" style="--dur:4.8s; --fy:-8px; --wob:2.5px; --tilt:2.4deg; --delay:2.4s">
                <circle cx="320" cy="256" r="20" fill="#dcebee"/>
                <path d="M 306,250 A 16,14 0 0 1 334,250" fill="#1a3241"/>
                <rect x="304" y="276" width="32" height="36" rx="8" fill="#9db4bd"/>
              </g>
            </g>

            <!-- exhaled CO2, always rising -->
            <g fill="#ff9a82" opacity=".85">
              <circle class="a-rise" style="--rise:-120px; --wob:5px; --dur:4s" cx="130" cy="240" r="4"/>
              <circle class="a-rise" style="--rise:-130px; --wob:4px; --dur:4.6s; --delay:1.3s" cx="228" cy="248" r="4"/>
              <circle class="a-rise" style="--rise:-115px; --wob:6px; --dur:4.3s; --delay:2.2s" cx="330" cy="240" r="4"/>
              <circle class="a-rise" style="--rise:-125px; --wob:4.5px; --dur:5s; --delay:3.1s" cx="180" cy="244" r="3.4"/>
            </g>
            <!-- extra buildup while unscrubbed -->
            <g x-show="step===1" fill="#ff9a82">
              <circle class="a-rise" style="--rise:-110px; --dur:3.2s; --delay:.4s" cx="260" cy="246" r="4.4"/>
              <circle class="a-rise" style="--rise:-118px; --dur:3.6s; --delay:1.7s" cx="292" cy="244" r="3.6"/>
              <circle class="a-rise" style="--rise:-100px; --dur:3s; --delay:2.6s" cx="156" cy="240" r="4.2"/>
              <text class="a-blink" style="--dur:1.4s" x="220" y="120" text-anchor="middle" font-family="JetBrains Mono" font-size="12" fill="#ff9a82" font-weight="700">CO2 RISING</text>
            </g>

            <!-- step 0: the explosion.
                 Shifted 46px left of where it was authored. The CO2 gauge panel is drawn
                 last (it has to be: it is on screen in every chapter) and its opaque
                 x=446 edge was covering the right third of the blast and half the
                 "O2 TANK 2" label. 46px clears it even at the burst's 1.3x peak scale,
                 and straddling the hull line reads better anyway: the tank that blew was
                 in the service module, bolted to the outside of the ship. -->
            <g x-show="step===0" transform="translate(-46,0)">
              <g class="a-burst" style="--dur:2.4s">
                <circle cx="452" cy="120" r="16" fill="#ffd27e"/>
                <circle cx="452" cy="120" r="27" fill="none" stroke="#ff9a82" stroke-width="2.5"/>
              </g>
              <!-- sparks and tumbling debris thrown by the blast -->
              <g fill="#ffd27e">
                <circle class="a-spark" style="--dur:1.8s" cx="430" cy="100" r="2.2"/>
                <circle class="a-spark" style="--dur:2.1s; --delay:.6s" cx="476" cy="104" r="2"/>
                <circle class="a-spark" style="--dur:1.9s; --delay:1.1s" cx="472" cy="140" r="2.3"/>
                <circle class="a-spark" style="--dur:2.2s; --delay:.3s" cx="432" cy="138" r="1.8"/>
              </g>
              <!-- 24px, not 36: this is the one piece of debris thrown toward the gauge,
                   so its travel has to end short of that panel's edge as well. -->
              <g class="a-flow" style="--fx:24px; --fy:-26px; --dur:2.6s">
                <rect class="a-tumble" style="--dur:1.5s" x="464" y="98" width="6" height="4" fill="#9db4bd"/>
              </g>
              <g class="a-flow" style="--fx:-32px; --fy:28px; --dur:2.9s; --delay:.7s">
                <rect class="a-tumble" style="--dur:2s" x="436" y="134" width="5" height="4" fill="#9db4bd"/>
              </g>
              <text class="a-blink" style="--dur:1.2s" x="452" y="164" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#ff9a82">O2 TANK 2</text>
            </g>

            <!-- step 2: LiOH canister scrubbing -->
            <g x-show="step===2">
              <g>
                <circle cx="220" cy="170" r="26" fill="#1a3241" stroke="#7fc4d0" stroke-width="2"/>
                <text x="220" y="166" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#7fc4d0">LiOH</text>
                <text x="220" y="180" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#8fa9b2">round</text>
              </g>
              <g fill="#ff9a82">
                <circle class="a-flow" style="--fx:60px; --fy:-40px; --dur:2.2s" cx="160" cy="212" r="4"/>
                <circle class="a-flow" style="--fx:-56px; --fy:-36px; --dur:2.4s; --delay:.8s" cx="278" cy="208" r="4"/>
              </g>
              <g class="a-float" style="--dur:3.6s">
                <rect x="88" y="96" width="264" height="26" rx="13" fill="#132630" stroke="#8fd9ae"/>
                <text x="220" y="113" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#8fd9ae">2 LiOH + CO2 &#8594; Li2CO3 + H2O</text>
              </g>
            </g>

            <!-- step 3: the mailbox adapter -->
            <g x-show="step===3">
              <rect x="188" y="150" width="64" height="52" rx="6" fill="#1a3241" stroke="#8fd9ae" stroke-width="2"/>
              <text x="220" y="172" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fd9ae">CM SQUARE</text>
              <text x="220" y="186" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fd9ae">LiOH x2</text>
              <path d="M 252,176 C 290,176 300,210 316,224" fill="none" stroke="#9db4bd" stroke-width="6"/>
              <rect x="196" y="144" width="20" height="10" fill="#c9c2a6" transform="rotate(-14 206 149)"/>
              <rect x="228" y="196" width="20" height="10" fill="#c9c2a6" transform="rotate(22 238 201)"/>
              <text x="150" y="220" text-anchor="end" font-family="JetBrains Mono" font-size="9" fill="#c9c2a6">duct tape + sock + hose</text>
              <g fill="#ff9a82">
                <circle class="a-flow" style="--fx:34px; --fy:-28px; --dur:2s" cx="176" cy="216" r="3.6"/>
                <circle class="a-flow" style="--fx:-30px; --fy:-24px; --dur:2.2s; --delay:.9s" cx="288" cy="212" r="3.6"/>
              </g>
              <text class="a-blink" style="--dur:1.6s" x="220" y="120" text-anchor="middle" font-family="JetBrains Mono" font-size="12" fill="#8fd9ae" font-weight="700">CO2 FALLING</text>
            </g>

            <!-- CO2 gauge -->
            <g>
              <rect x="446" y="70" width="168" height="250" rx="10" fill="#132630" stroke="#2c414d"/>
              <text x="530" y="94" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">CABIN CO2 (mmHg)</text>
              <rect x="510" y="110" width="40" height="180" rx="6" fill="#0c1e27" stroke="#2c414d"/>
              <rect x="510" style="transition: y .9s var(--ease), height .9s var(--ease), fill .9s;" width="40" rx="6"
                    :y="290 - [70,150,120,36][step]" :height="[70,150,120,36][step]"
                    :fill="step===3 ? '#8fd9ae' : (step>=1 ? '#ff9a82' : '#ffd27e')"/>
              <line x1="500" y1="176" x2="560" y2="176" stroke="#ff9a82" stroke-width="1.6" stroke-dasharray="4 4"/>
              <text x="496" y="180" text-anchor="end" font-family="JetBrains Mono" font-size="9" fill="#ff9a82">8: danger</text>
              <text x="530" y="312" text-anchor="middle" font-family="JetBrains Mono" font-size="10"
                    :fill="step===3 ? '#8fd9ae' : (step>=1 ? '#ff9a82' : '#ffd27e')"
                    x-text="['climbing&#8230;','13 and rising','scrubbing&#8230;','2.4 and safe'][step]"></text>
            </g>
          </svg>`
};
