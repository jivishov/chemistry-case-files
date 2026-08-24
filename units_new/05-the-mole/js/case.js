// case.js — Unit 5 case file: Apollo 13, the mole math that brought them home.
// Carries the story AND the stage art; the shared casefile component renders the
// chrome around it. The same story units/05-the-mole tells, carried here in full so the
// units_new tree stands on its own.

export const CASE = {
  id: 'apollo-13-scrubber',
  number: '005',
  kicker: 'declassified survival math',
  title: 'Apollo 13: the mole math that brought them home',
  teaser: 'This job was real once: Apollo 13, April 1970',
  hook: 'Your Meridian shift is fiction. In April 1970 it was real: three astronauts in a crippled ship, carbon dioxide creeping toward lethal, and survival hanging on exactly the conversions you are running above.',
  stats: [
    { v: '320,000 km', k: 'from Earth at the explosion' },
    { v: '~20 mol', k: 'CO2 exhaled per person, per day' },
    { v: '2 : 1', k: 'LiOH to CO2 mole ratio' }
  ],
  steps: [
    {
      t: 'Houston, we have a problem',
      body: 'Two days into the flight, an oxygen tank exploded. Three astronauts crowded into the lunar module Aquarius, a lifeboat designed to keep two people alive for two days. It now had to hold three people for four.',
      chem: 'Life support is chemistry on a timer. The first system to run out of margin was not oxygen. It was the capacity to REMOVE carbon dioxide.',
      cap: 'April 13, 1970: the service module blows; the LM becomes a lifeboat.'
    },
    {
      t: 'The poison is your own breath',
      body: 'Every exhale is about 4% CO2. Sealed in a small cabin, it accumulates. Above roughly 8 mmHg of CO2, headaches and clouded thinking begin, and it gets worse from there. The gauge climbed hour after hour.',
      chem: 'One astronaut exhales roughly 0.9 kg of CO2 per day. Divide by the molar mass, 44 g/mol, and that is about 20 mol per person per day that must be captured.',
      cap: 'Three crew, one small cabin: the CO2 needle keeps climbing.'
    },
    {
      t: 'Lithium hydroxide does the catching',
      body: 'Scrubber canisters pull cabin air through lithium hydroxide, where each CO2 molecule is locked up by two LiOH. The balanced equation is the whole safety spec: it says exactly how many grams of LiOH buy how many hours of breathing.',
      chem: '2 LiOH + CO2 -> Li2CO3 + H2O. Capturing 20 mol of CO2 takes 40 mol of LiOH, about 960 g per astronaut per day. Canister life IS a mole calculation.',
      cap: '2 LiOH + CO2 -> Li2CO3 + H2O: one breath, captured.'
    },
    {
      t: 'The duct-tape adapter',
      body: 'Aquarius used round canisters and had too few. The dead command module carried square ones, plenty, but the wrong shape. Engineers on the ground built an adapter out of a flight-plan cover, a sock, a hose, and duct tape, then read the recipe up to the crew. CO2 started falling within the hour.',
      chem: 'The fix was improvised; the numbers were not. Mission control already knew the moles of CO2 per hour and the moles of LiOH per canister before anyone cut tape.',
      cap: 'The mailbox: a square canister sealed onto a round system with tape.'
    }
  ],
  quiz: {
    q: 'One astronaut exhales about 20 mol of CO2 per day. Using 2 LiOH + CO2 -> Li2CO3 + H2O (LiOH is about 24 g/mol), how much LiOH protects ONE astronaut for one day?',
    options: [
      { label: 'About 480 g (20 mol)', correct: false },
      { label: 'About 960 g (40 mol)', correct: true },
      { label: 'About 240 g (10 mol)', correct: false }
    ],
    explain: 'The ratio is 2 LiOH for every 1 CO2, so 20 mol of CO2 demands 40 mol of LiOH. At about 24 g/mol that is roughly 960 g per astronaut per day. That single conversion set the canister schedule that kept the crew conscious.'
  },
  punch: 'The scrubber math has not changed: the ISS, submarines, and your Meridian shifts all run on it. Clear the sim and you are running Apollo 13 procedure.',
  careers: ['Life-support engineer', 'Flight controller', 'Submarine engineer', 'Anesthesiologist'],
  cta: { label: 'Back to your own life-support shift', call: "setMode('molg')" },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated scene: inside the Apollo 13 lunar module, exhaled CO2 climbs a gauge until the improvised lithium hydroxide scrubber pulls it back down">
            <!-- space + stars -->
            <g fill="#cfe4ea">
              <circle class="a-twinkle" style="--dur:3.1s" cx="480" cy="30" r="1.3"/>
              <circle class="a-twinkle" style="--dur:2.7s; --delay:.8s" cx="560" cy="60" r="1.1"/>
              <circle class="a-twinkle" style="--dur:3.5s; --delay:1.4s" cx="610" cy="24" r="1.2"/>
            </g>

            <!-- cabin shell -->
            <path d="M 40,96 L 96,52 L 344,52 L 400,96 L 400,296 L 344,332 L 96,332 L 40,296 Z" fill="#10202a" stroke="#2c414d" stroke-width="2"/>
            <text x="220" y="76" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">LM AQUARIUS &#183; LIFEBOAT</text>

            <!-- three astronauts -->
            <g>
              <g class="a-float" style="--dur:5.4s; --fy:-7px; --wob:3px; --tilt:2deg">
                <circle cx="120" cy="256" r="20" fill="#dcebee"/>
                <path d="M 106,250 A 16,14 0 0 1 134,250" fill="#132530"/>
                <rect x="104" y="276" width="32" height="36" rx="8" fill="#9db4bd"/>
              </g>
              <g class="a-float" style="--dur:6.2s; --fy:-5px; --wob:4px; --tilt:1.4deg; --delay:1.2s">
                <circle cx="220" cy="264" r="20" fill="#dcebee"/>
                <path d="M 206,258 A 16,14 0 0 1 234,258" fill="#132530"/>
                <rect x="204" y="284" width="32" height="30" rx="8" fill="#9db4bd"/>
              </g>
              <g class="a-float" style="--dur:4.8s; --fy:-8px; --wob:2.5px; --tilt:2.4deg; --delay:2.4s">
                <circle cx="320" cy="256" r="20" fill="#dcebee"/>
                <path d="M 306,250 A 16,14 0 0 1 334,250" fill="#132530"/>
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
                <circle cx="220" cy="170" r="26" fill="#132530" stroke="#7fc4d0" stroke-width="2"/>
                <text x="220" y="166" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#7fc4d0">LiOH</text>
                <text x="220" y="180" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#8fa9b2">round</text>
              </g>
              <g fill="#ff9a82">
                <circle class="a-flow" style="--fx:60px; --fy:-40px; --dur:2.2s" cx="160" cy="212" r="4"/>
                <circle class="a-flow" style="--fx:-56px; --fy:-36px; --dur:2.4s; --delay:.8s" cx="278" cy="208" r="4"/>
              </g>
              <g class="a-float" style="--dur:3.6s">
                <rect x="88" y="96" width="264" height="26" rx="13" fill="#0d1a21" stroke="#8fd9ae"/>
                <text x="220" y="113" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#8fd9ae">2 LiOH + CO2 &#8594; Li2CO3 + H2O</text>
              </g>
            </g>

            <!-- step 3: the mailbox adapter -->
            <g x-show="step===3">
              <rect x="188" y="150" width="64" height="52" rx="6" fill="#132530" stroke="#8fd9ae" stroke-width="2"/>
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
              <rect x="446" y="70" width="168" height="250" rx="10" fill="#0d1a21" stroke="#2c414d"/>
              <text x="530" y="94" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">CABIN CO2 (mmHg)</text>
              <rect x="510" y="110" width="40" height="180" rx="6" fill="#08141a" stroke="#2c414d"/>
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
