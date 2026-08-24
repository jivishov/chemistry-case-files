// case.js — Unit 10 case file: every Calorie on every label was measured by burning food.
// Carries the story AND the stage art; the shared casefile component renders the chrome.
//
// The units_new build: a copy of units/10-thermochemistry/js/case.js, deliberately keeping
// the same id ('bomb-calorimeter-label') and number ('010') as its parent, which is why it
// is registered in tests/casefile.test.js under NEW_TREE rather than UNITS -- UNITS doubles
// as the id/number uniqueness set. The stage SVG below came across with the story; no art
// was drawn for it during the port.
//
// The one field a port normally rewrites is cta.call, from `mode='x'` to `setMode('x')`,
// because the cockpit shell routes station changes through setMode(). Unit 10 already
// shipped `setMode('warm')` in the worksheet build, so this file is otherwise unchanged.

export const CASE = {
  id: 'bomb-calorimeter-label',
  number: '010',
  kicker: 'on the back of every packet',
  title: 'Every Calorie on that label came from setting food on fire',
  teaser: 'The number on your snack label was measured by burning it underwater',
  hook: 'Turn over any packet in your bag and there is a Calorie number on the back. Nobody estimated it. Somebody sealed that food in a steel bomb, burned it in pure oxygen underwater, and measured how much the water warmed up. The equation they used is q = mc(dT).',
  stats: [
    { v: '4.184 J', k: 'to warm 1 g water by 1 C' },
    { v: '1 Cal', k: 'is really 1000 calories' },
    { v: '4-9-4', k: 'kcal per gram: carb, fat, protein' }
  ],
  steps: [
    {
      t: 'A number nobody questions',
      body: 'The label says 230 Calories. You have read hundreds of those numbers without once asking where they come from. They are not calculated from a formula. Every one of them traces back to a measurement somebody actually made.',
      chem: 'A food Calorie (capital C) is a kilocalorie: the heat that raises one kilogram of water by one degree Celsius. It is a unit of energy, so it can be measured with a thermometer.',
      cap: 'The claim on the packet: 230 Calories. Where did that come from?'
    },
      {
      t: 'Wilbur Atwater set it on fire',
      body: 'In the 1890s, American chemist Wilbur Atwater built a bomb calorimeter: a thick steel chamber holding the food and pure oxygen, submerged in a weighed bucket of water inside an insulated jacket. An electric wire ignites the sample and it burns completely in seconds.',
      chem: 'A sealed rigid bomb lets nothing escape, so all the energy released has nowhere to go but into the water and the hardware. That is a calorimeter: a container built so heat lost equals heat gained.',
      cap: 'Ignition. The sample burns completely in pure oxygen.'
    },
    {
      t: 'The thermometer does the arithmetic',
      body: 'The water temperature climbs and levels off. That rise is the entire measurement. Multiply the mass of water by its specific heat by the temperature change and you have the energy the food released, in joules.',
      chem: 'q = mc(dT). Water needs 4.184 J per gram per degree, which is unusually high, and that is exactly what makes it a good measuring fluid: it takes a lot of energy to move it a little, so the reading is stable and easy to resolve.',
      cap: 'q = mc(dT): the temperature rise IS the energy measurement.'
    },
    {
      t: 'Why labels no longer burn anything',
      body: 'Atwater burned hundreds of foods and noticed a pattern: carbohydrate and protein land near 4 kcal per gram, fat near 9. Those Atwater factors are still how a label is built today. A food scientist measures the grams of each nutrient, multiplies, and adds. Your body is not a bomb calorimeter, so the factors are corrected for what you actually digest.',
      chem: 'This is the payoff of a good measurement: once enough calorimetry is done, the pattern replaces the experiment. The 4-9-4 rule is thermochemistry compressed into arithmetic you can do in your head.',
      cap: 'Carb 4, protein 4, fat 9 kcal per gram. Calorimetry, compressed.'
    }
  ],
  quiz: {
    q: 'A bomb calorimeter holds 2000 g of water. Burning one cracker raises the water 4.50 degrees Celsius. Water needs 4.184 J per gram per degree. How much energy did the cracker release?',
    options: [
      { label: 'About 37.7 kJ, which is about 9 food Calories', correct: true },
      { label: 'About 9.0 kJ, which is about 9 food Calories', correct: false },
      { label: 'About 377 kJ, which is about 90 food Calories', correct: false }
    ],
    explain: 'q = mc(dT) = 2000 g x 4.184 J/g per degree x 4.50 degrees = 37,656 J, so about 37.7 kJ. Divide by 4.184 kJ per kilocalorie and it is 9.0 kcal, which a label prints as 9 Calories. You just did the measurement that puts numbers on packaging.'
  },
  punch: 'You now own the equation behind every nutrition label, every engine coolant spec, and every rescue rewarming decision. q = mc(dT) is the same three multiplications every time.',
  careers: ['Food scientist', 'Calorimetry technician', 'HVAC engineer', 'Sports physiologist'],
  cta: { label: 'Run the heat math yourself', call: "setMode('warm')" },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated scene: a bomb calorimeter ignites a food sample, the water temperature climbs, and the energy becomes the Calorie number on a nutrition label">
            <defs>
              <linearGradient id="cf10-water" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4f93a0"/><stop offset="100%" stop-color="#1d5b66"/>
              </linearGradient>
            </defs>

            <!-- insulated jacket -->
            <rect x="60" y="70" width="300" height="250" rx="14" fill="#1a3241" stroke="#3a545f" stroke-width="2"/>
            <text x="72" y="92" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">INSULATED JACKET</text>

            <!-- water bath -->
            <rect x="82" y="132" width="256" height="166" rx="8" fill="url(#cf10-water)" opacity=".85"/>
            <path class="a-flow" style="--fx:18px; --dur:5s" d="M 82,136 q 32,-4 64,0 q 32,4 64,0 q 32,-4 64,0 q 32,4 64,0" fill="none" stroke="#7fc4d0" stroke-width="2" opacity=".55"/>
            <text x="96" y="290" font-family="JetBrains Mono" font-size="9" fill="#cfe4ea">2000 g water</text>

            <!-- steel bomb chamber -->
            <rect x="152" y="176" width="116" height="94" rx="10" fill="#273b46" stroke="#6e8794" stroke-width="3"/>
            <text x="210" y="168" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">STEEL BOMB &#183; pure O2</text>

            <!-- the food sample inside -->
            <g x-show="step===0">
              <rect x="188" y="212" width="44" height="24" rx="4" fill="#c9a227"/>
              <circle cx="198" cy="220" r="2" fill="#8a6a1f"/><circle cx="214" cy="228" r="2" fill="#8a6a1f"/>
              <circle cx="222" cy="216" r="2" fill="#8a6a1f"/>
            </g>

            <!-- ignition + burn (steps 1-2) -->
            <g x-show="step===1">
              <circle class="a-glow" style="--dur:1s" cx="210" cy="222" r="30" fill="#ff9a82" opacity=".3"/>
              <circle class="a-flicker" style="--dur:.35s; --org:center" cx="210" cy="222" r="17" fill="#ffd27e"/>
              <circle class="a-flicker" style="--dur:.5s; --delay:.15s; --org:center" cx="210" cy="220" r="10" fill="#fff4dc"/>
              <g fill="#fff4dc">
                <circle class="a-spark" style="--dur:1.2s" cx="192" cy="206" r="2.4"/>
                <circle class="a-spark" style="--dur:1.5s; --delay:.5s" cx="230" cy="210" r="2"/>
                <circle class="a-spark" style="--dur:1.3s; --delay:.9s" cx="214" cy="200" r="2.2"/>
              </g>
              <!-- ignition wire -->
              <path d="M 210,176 L 210,152" stroke="#ffd27e" stroke-width="2"/>
              <text class="a-blink" style="--dur:.9s" x="210" y="144" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#ffd27e" font-weight="700">IGNITE</text>
            </g>

            <!-- heat spreading into the water (step 2) -->
            <g x-show="step===2" fill="#ffd27e" opacity=".8">
              <circle class="a-drift" style="--fx:-58px; --fy:-40px; --o:.7; --dur:2.4s" cx="176" cy="200" r="4"/>
              <circle class="a-drift" style="--fx:62px; --fy:-36px; --o:.7; --dur:2.6s; --delay:.6s" cx="244" cy="200" r="4"/>
              <circle class="a-drift" style="--fx:-52px; --fy:44px; --o:.7; --dur:2.8s; --delay:1.2s" cx="176" cy="250" r="4"/>
              <circle class="a-drift" style="--fx:56px; --fy:40px; --o:.7; --dur:2.5s; --delay:1.8s" cx="244" cy="250" r="4"/>
            </g>

            <!-- stirrer -->
            <g>
              <line x1="118" y1="132" x2="118" y2="250" stroke="#9db4bd" stroke-width="3"/>
              <g class="a-tumble" style="--dur:3s">
                <line x1="108" y1="250" x2="128" y2="250" stroke="#9db4bd" stroke-width="3"/>
              </g>
            </g>

            <!-- thermometer: the bulb sits in the water, the column tracks the step -->
            <g>
              <rect x="296" y="104" width="18" height="182" rx="9" fill="#132630" stroke="#6e8794" stroke-width="2"/>
              <rect x="300" width="10" rx="5" fill="#ff6f5e" style="transition: y .9s var(--ease), height .9s var(--ease);"
                    :y="282 - [26,26,120,120][step]" :height="[26,26,120,120][step]"/>
              <circle cx="305" cy="288" r="11" fill="#ff6f5e"/>
              <text x="330" y="112" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">T</text>
              <text x="330" y="150" font-family="JetBrains Mono" font-size="11" font-weight="700"
                    :fill="step>=2 ? '#ff9a82' : '#8fa9b2'"
                    x-text="['24.00 C','24.00 C','+4.50 C','+4.50 C'][step]"></text>
            </g>

            <!-- the working, revealed at step 2 -->
            <g x-show="step===2">
              <rect x="384" y="176" width="236" height="96" rx="10" fill="#132630" stroke="#7fc4d0"/>
              <text x="400" y="198" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">THE MEASUREMENT</text>
              <text x="400" y="222" font-family="JetBrains Mono" font-size="12" fill="#7fc4d0">q = m c (dT)</text>
              <text x="400" y="242" font-family="JetBrains Mono" font-size="10" fill="#cfe4ea">2000 x 4.184 x 4.50</text>
              <text x="400" y="262" font-family="JetBrains Mono" font-size="12" font-weight="700" fill="#8fd9ae">= 37.7 kJ</text>
            </g>

            <!-- nutrition label: present at step 0, resolved at step 3 -->
            <g x-show="step===0 || step===3">
              <rect x="400" y="96" width="200" height="196" rx="8" fill="#f3f7f8" stroke="#c9d9de" stroke-width="2"/>
              <text x="416" y="122" font-family="Bitter" font-size="15" font-weight="700" fill="#24363f">Nutrition</text>
              <line x1="416" y1="130" x2="584" y2="130" stroke="#24363f" stroke-width="3"/>
              <text x="416" y="152" font-family="JetBrains Mono" font-size="10" fill="#38484f">Calories</text>
              <text x="584" y="152" text-anchor="end" font-family="JetBrains Mono" font-size="16" font-weight="700"
                    :fill="step===3 ? '#2f8f5b' : '#24363f'">230</text>
              <line x1="416" y1="162" x2="584" y2="162" stroke="#cfdbe0"/>
              <g font-family="JetBrains Mono" font-size="9" fill="#687a82">
                <text x="416" y="182">Fat 9 g</text>
                <text x="584" y="182" text-anchor="end" :fill="step===3 ? '#bf4a30' : '#687a82'" x-text="step===3 ? 'x9 = 81' : ''"></text>
                <text x="416" y="204">Carbohydrate 28 g</text>
                <text x="584" y="204" text-anchor="end" :fill="step===3 ? '#2a7d8a' : '#687a82'" x-text="step===3 ? 'x4 = 112' : ''"></text>
                <text x="416" y="226">Protein 9 g</text>
                <text x="584" y="226" text-anchor="end" :fill="step===3 ? '#2a7d8a' : '#687a82'" x-text="step===3 ? 'x4 = 36' : ''"></text>
              </g>
              <g x-show="step===3">
                <line x1="416" y1="240" x2="584" y2="240" stroke="#24363f" stroke-width="2"/>
                <text x="416" y="262" font-family="JetBrains Mono" font-size="10" fill="#24363f">Atwater total</text>
                <text x="584" y="262" text-anchor="end" font-family="JetBrains Mono" font-size="12" font-weight="700" fill="#2f8f5b">229</text>
                <text x="500" y="282" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#687a82">rounds to the 230 on the packet</text>
              </g>
            </g>
          </svg>`
};
