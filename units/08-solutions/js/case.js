// case.js: Unit 8 case file: Lake Nyos, the lake that exhaled (gas solubility).
// Carries this unit's story AND its stage art; rendered by the shared casefile component.

export const CASE = {
  id: 'lake-nyos-co2',
  number: '008',
  kicker: 'Cameroon, 1986',
  title: 'The night a lake exhaled',
  teaser: 'The lake that dissolved a disaster, then exhaled it',
  hook: 'August 21, 1986, Cameroon. No eruption, no earthquake, no warning. Lake Nyos released the carbon dioxide it had been quietly dissolving for decades, and 1,746 people in the valleys below never woke up. The science that explains it is a solubility curve.',
  stats: [
    { v: '100k+ t', k: 'CO2 released in hours' },
    { v: '~200 m', k: 'of water that held it down' },
    { v: '70 km/h', k: 'speed of the invisible cloud' }
  ],
  steps: [
    {
      t: 'A soda bottle the size of a lake',
      body: 'Lake Nyos fills a volcanic crater. For decades, magma below leaked CO2 into the cold bottom water, where the weight of 200 meters of lake kept it dissolved. The surface looked ordinary while the depths charged up like an unopened soda.',
      chem: 'Gas solubility rises with pressure and with cold. Deep water is both pressurized and cold, so it can stockpile an enormous dissolved load. That loading rule is Henry\'s law.',
      cap: 'Decades of loading: CO2 dissolving into cold, pressurized bottom water.'
    },
    {
      t: 'Something shook the bottle',
      body: 'On that night, likely a landslide, deep water got shoved upward. Rising water loses pressure, and its dissolved CO2 crossed the saturation line: bubbles formed. Bubbly water is lighter, so it rose faster and pulled more up behind it. A runaway loop.',
      chem: 'Drop the pressure and solubility drops with it; gas above the new limit MUST leave solution. Saturated became supersaturated became eruption. Your solubility curves draw exactly that line.',
      cap: 'Disturbed: rising water loses pressure; dissolved gas becomes bubbles.'
    },
    {
      t: 'The invisible flood',
      body: 'A fountain of water and gas burst about 100 meters over the lake. CO2 is roughly 1.5 times denser than air, so the cloud hugged the ground and poured downhill through sleeping villages, displacing the air itself.',
      chem: 'Density decides where a gas settles. It is the same reason CO2 extinguishers smother fires from below: heavy gas sinks and pushes oxygen out.',
      cap: 'Heavier than air: the CO2 flood follows the valleys, in silence.'
    },
    {
      t: 'Engineers uncorked it gently',
      body: 'Since 2001, degassing pipes stand in the lake. Lift deep water partway up a tube and it self-pumps: gas comes out of solution, the column lightens, and a controlled fountain vents CO2 a little at a time, forever. The bomb became a lake again.',
      chem: 'The disaster and the fix are the same solubility equation run at different speeds. Control the pressure drop and you control the outgassing. Scientists now watch the saturation level like a fuel gauge.',
      cap: 'The fix: a permanent, controlled fizz instead of one catastrophic one.'
    }
  ],
  quiz: {
    q: 'Why could the deep water of Lake Nyos hold vastly more CO2 than the surface water ever could?',
    options: [
      { label: 'High pressure and cold both raise gas solubility', correct: true },
      { label: 'Deep water is saltier, and salt attracts CO2', correct: false },
      { label: 'CO2 is denser than water, so it sank and stayed', correct: false }
    ],
    explain: 'Gas solubility climbs as pressure climbs and as temperature falls, exactly what your solubility curves show. Two hundred meters of overhead water plus cold bottom temperatures made deep Nyos a high-capacity CO2 sponge. The instant pressure fell, the surplus had to leave solution.'
  },
  punch: 'A solubility curve predicted, explained, and finally disarmed a disaster. Learn to read the curve and you can see a lake breathing before it screams.',
  careers: ['Limnologist', 'Hazard scientist', 'Environmental engineer', 'Water-treatment chemist'],
  cta: { label: 'Master the curves that explain it', call: "setMode('curve')" },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated scene: dissolved CO2 loads into the deep water of Lake Nyos, erupts as an invisible cloud, and is finally vented safely by degassing pipes">
            <!-- night sky -->
            <rect x="0" y="0" width="640" height="360" fill="#112837"/>
            <g fill="#cfe4ea">
              <circle class="a-twinkle" style="--dur:3.2s" cx="90" cy="34" r="1.2"/>
              <circle class="a-twinkle" style="--dur:2.7s; --delay:.7s" cx="300" cy="24" r="1.1"/>
              <circle class="a-twinkle" style="--dur:3.6s; --delay:1.5s" cx="520" cy="40" r="1.3"/>
            </g>

            <!-- crater rims + valley slope -->
            <path d="M 0,180 L 60,110 L 120,96 L 150,120 L 150,360 L 0,360 Z" fill="#1b3a49"/>
            <path d="M 430,120 L 470,96 L 520,150 L 580,230 L 640,280 L 640,360 L 430,360 Z" fill="#1b3a49"/>

            <!-- lake body -->
            <rect x="150" y="140" width="280" height="200" fill="#123b4d"/>
            <rect x="150" y="220" width="280" height="120" fill="#0f3347"/>
            <rect x="150" y="280" width="280" height="60" fill="#0c2a3e"/>
            <path class="a-flow" style="--fx:20px; --dur:5s" d="M 150,142 q 35,-5 70,0 q 35,5 70,0 q 35,-5 70,0 q 35,5 70,0" fill="none" stroke="#7fc4d0" stroke-width="2" opacity=".5"/>
            <text x="290" y="128" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">LAKE NYOS &#183; crater lake</text>

            <!-- magma vent feeding CO2 (always) -->
            <path d="M 250,360 Q 290,330 330,360 Z" fill="#7c3520"/>
            <circle class="a-glow" style="--dur:2.4s" cx="290" cy="352" r="13" fill="#e08a5a" opacity=".35"/>
            <circle class="a-flicker" style="--dur:1.4s; --org:center" cx="290" cy="352" r="9" fill="#e08a5a" opacity=".85"/>
            <g fill="#9db4bd" opacity=".8">
              <circle class="a-rise" style="--rise:-34px; --wob:2.5px; --dur:4s" cx="278" cy="344" r="2.6"/>
              <circle class="a-rise" style="--rise:-38px; --wob:3px; --dur:4.8s; --delay:1.6s" cx="298" cy="346" r="2.4"/>
            </g>

            <!-- dissolved CO2 stockpile in the deep layer (always, jiggling) -->
            <g fill="#8fa9b2">
              <circle class="a-float" style="--dur:2.8s; --fy:-3px" cx="190" cy="300" r="3"/>
              <circle class="a-float" style="--dur:3.2s; --fy:-4px; --delay:.4s" cx="222" cy="312" r="3"/>
              <circle class="a-float" style="--dur:2.6s; --fy:-3px; --delay:.9s" cx="256" cy="298" r="3"/>
              <circle class="a-float" style="--dur:3s; --fy:-4px; --delay:1.3s" cx="288" cy="314" r="3"/>
              <circle class="a-float" style="--dur:2.7s; --fy:-3px; --delay:1.7s" cx="322" cy="300" r="3"/>
              <circle class="a-float" style="--dur:3.1s; --fy:-4px; --delay:2.1s" cx="356" cy="312" r="3"/>
              <circle class="a-float" style="--dur:2.9s; --fy:-3px; --delay:2.5s" cx="388" cy="298" r="3"/>
              <circle class="a-float" style="--dur:3.3s; --fy:-4px; --delay:2.9s" cx="240" cy="326" r="3"/>
              <circle class="a-float" style="--dur:2.8s; --fy:-3px; --delay:3.3s" cx="340" cy="328" r="3"/>
            </g>
            <text x="290" y="292" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2" opacity=".9" x-show="step===0">high P + cold = CO2 stays dissolved</text>

            <!-- step 1: landslide + runaway bubbles -->
            <g x-show="step===1">
              <g class="a-fall" style="--fy:34px; --sway:2px; --dur:2.2s">
                <path class="a-tumble" style="--dur:2.2s" d="M 428,150 L 452,138 L 458,158 L 436,166 Z" fill="#3f5a68"/>
              </g>
              <g fill="#dcebee">
                <circle class="a-rise" style="--rise:-130px; --wob:5px; --dur:2.4s" cx="330" cy="290" r="3.4"/>
                <circle class="a-rise" style="--rise:-140px; --wob:6px; --dur:2s; --delay:.5s" cx="352" cy="300" r="4"/>
                <circle class="a-rise" style="--rise:-120px; --wob:4px; --dur:2.2s; --delay:1s" cx="312" cy="296" r="3"/>
                <circle class="a-rise" style="--rise:-135px; --wob:5px; --dur:1.9s; --delay:1.4s" cx="368" cy="292" r="3.6"/>
                <circle class="a-rise" style="--rise:-125px; --wob:7px; --dur:2.6s; --delay:1.8s" cx="292" cy="302" r="2.8"/>
              </g>
              <text class="a-blink" style="--dur:1.4s" x="290" y="188" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#ffd27e" font-weight="700">PRESSURE DROPS &#8594; GAS OUT</text>
            </g>

            <!-- steps 2: eruption fountain + ground-hugging cloud + village -->
            <g x-show="step===2">
              <g fill="#dcebee">
                <circle class="a-rise" style="--rise:-70px; --wob:8px; --dur:1.6s" cx="282" cy="140" r="4"/>
                <circle class="a-rise" style="--rise:-84px; --wob:6px; --dur:1.8s; --delay:.4s" cx="292" cy="140" r="4.4"/>
                <circle class="a-rise" style="--rise:-64px; --wob:9px; --dur:1.5s; --delay:.8s" cx="302" cy="140" r="3.6"/>
                <circle class="a-rise" style="--rise:-78px; --wob:7px; --dur:1.7s; --delay:1.2s" cx="272" cy="140" r="3.2"/>
              </g>
              <g class="a-drift" style="--fx:150px; --fy:60px; --o:.5; --dur:4.5s">
                <ellipse cx="430" cy="250" rx="90" ry="26" fill="#9db4bd"/>
              </g>
              <g class="a-drift" style="--fx:130px; --fy:56px; --o:.4; --dur:5.2s; --delay:1.8s">
                <ellipse cx="410" cy="262" rx="70" ry="20" fill="#9db4bd"/>
              </g>
              <text x="470" y="216" font-family="JetBrains Mono" font-size="10" fill="#9db4bd">denser than air</text>
            </g>
            <!-- village in the valley (steps 2-3) -->
            <g x-show="step>=2">
              <g fill="#213a49" stroke="#3a545f">
                <path d="M 556,306 l 12,-10 12,10 z"/><rect x="560" y="306" width="16" height="12"/>
                <path d="M 588,322 l 12,-10 12,10 z"/><rect x="592" y="322" width="16" height="12"/>
              </g>
              <rect class="a-blink" style="--dur:3s" x="566" y="310" width="4" height="4" fill="#ffd27e"/>
            </g>

            <!-- step 3: degassing pipe -->
            <g x-show="step===3">
              <rect x="286" y="60" width="8" height="220" rx="3" fill="#5ea3b0"/>
              <g fill="#dcebee">
                <circle class="a-rise" style="--rise:-26px; --wob:4px; --dur:1.6s" cx="290" cy="56" r="3"/>
                <circle class="a-rise" style="--rise:-30px; --wob:5px; --dur:1.9s; --delay:.6s" cx="290" cy="56" r="2.4"/>
                <circle class="a-rise" style="--rise:-24px; --wob:3px; --dur:1.7s; --delay:1.2s" cx="290" cy="56" r="2.8"/>
              </g>
              <path d="M 286,64 q -14,10 -8,24" fill="none" stroke="#7fc4d0" stroke-width="2"/>
              <path d="M 294,64 q 14,10 8,24" fill="none" stroke="#7fc4d0" stroke-width="2"/>
              <g class="a-float" style="--dur:3.4s">
                <rect x="366" y="70" width="150" height="26" rx="13" fill="#132630" stroke="#8fd9ae"/>
                <text x="441" y="87" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fd9ae" font-weight="700">CONTROLLED VENTING</text>
              </g>
            </g>
          </svg>`
};
