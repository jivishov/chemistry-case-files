// case.js: Unit 8 case file: Lake Nyos and gas solubility.
// Carries this unit's story AND its stage art; rendered by the shared casefile component.

export const CASE = {
  id: 'lake-nyos-co2',
  number: '008',
  kicker: 'Cameroon, 1986',
  title: 'Lake Nyos: when dissolved CO2 escaped',
  teaser: 'How pressure, temperature, and dissolved CO2 shaped a deadly lake event',
  hook: 'On August 21, 1986, Lake Nyos in Cameroon suddenly released a large cloud of carbon dioxide. At least 1,700 people died in nearby valleys. Investigations found that CO2 had accumulated in the lake\'s deep water; there was no significant direct volcanic eruption during the disaster.',
  stats: [
    { v: '~1,700', k: 'people killed' },
    { v: '~200 m', k: 'lake depth' },
    { v: '2001', k: 'controlled degassing began' }
  ],
  steps: [
    {
      t: 'CO2 accumulated in deep water',
      body: 'Lake Nyos occupies a volcanic crater. Carbon dioxide from a deep magmatic source entered the lake and accumulated in its dense, poorly mixed bottom water. The deep water was cold and under high pressure, allowing a large amount of CO2 to remain dissolved.',
      chem: 'For a gas in equilibrium with a solution, greater gas pressure increases the dissolved concentration. Lower temperature also generally increases the solubility of CO2 in water. These conditions helped deep Lake Nyos store a large dissolved-gas load.',
      cap: 'Deep, cold water under pressure accumulated dissolved CO2.'
    },
    {
      t: 'Rising water released gas',
      body: 'The exact trigger of the 1986 event is not certain. A large landslide has been proposed as one likely trigger. Once gas-rich deep water began rising, the pressure decreased and CO2 came out of solution as bubbles. The gas-water mixture became less dense, which could drive more water upward and accelerate the release.',
      chem: 'When pressure decreases, the equilibrium amount of dissolved gas decreases. Water containing more CO2 than the new equilibrium allows can release the excess gas. This pressure-solubility relationship helped turn upward motion into rapid degassing.',
      cap: 'As gas-rich water rose, lower pressure allowed CO2 to leave solution.'
    },
    {
      t: 'CO2 moved into nearby valleys',
      body: 'A large amount of CO2 entered the air around the lake. Carbon dioxide is denser than air under similar conditions, so the gas-rich cloud flowed into low-lying areas. People and animals exposed to very high CO2 concentrations were overcome by an asphyxiating atmosphere.',
      chem: 'Solubility explains how the lake stored and then released CO2. After release, gas density, terrain, and air movement affected where the cloud traveled. These are separate physical processes that together explain the hazard.',
      cap: 'Released CO2 collected in low-lying areas and created an asphyxiation hazard.'
    },
    {
      t: 'Engineers began controlled degassing',
      body: 'Controlled degassing at Lake Nyos began in 2001. A pipe carries gas-rich deep water upward. As pressure falls in the pipe, CO2 forms bubbles and helps drive the water upward without a conventional pump. The gas is then released at the surface at a controlled rate.',
      chem: 'The degassing system deliberately uses the same pressure-solubility relationship involved in the natural release. Monitoring and controlled removal reduce the amount of dissolved CO2 stored in the deep lake.',
      cap: 'Degassing pipes remove CO2 from deep water in a controlled process.'
    }
  ],
  quiz: {
    q: 'Which conditions helped deep Lake Nyos water store a large amount of dissolved CO2?',
    options: [
      { label: 'High pressure and low temperature', correct: true },
      { label: 'Low pressure and high temperature', correct: false },
      { label: 'The greater density of CO2 than water', correct: false }
    ],
    explain: 'Deep water was under high pressure and remained relatively cold. Higher gas pressure favors a greater dissolved-gas concentration, and CO2 is generally more soluble in colder water. When gas-rich water rose and pressure fell, CO2 could come out of solution.'
  },
  punch: 'Lake Nyos shows why gas solubility is more than a graph. Pressure, temperature, and dissolved-gas concentration can help explain a real natural hazard and the engineering used to reduce it.',
  careers: ['Limnologist', 'Volcanic-hazards scientist', 'Environmental engineer', 'Water chemist'],
  cta: { label: 'Practice solubility curves', call: "setMode('curve')" },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated scene: dissolved CO2 accumulates in deep Lake Nyos, rapidly leaves solution during the 1986 event, and is later removed by controlled degassing pipes">
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

            <!-- deep source feeding CO2 -->
            <path d="M 250,360 Q 290,330 330,360 Z" fill="#7c3520"/>
            <circle class="a-glow" style="--dur:2.4s" cx="290" cy="352" r="13" fill="#e08a5a" opacity=".35"/>
            <circle class="a-flicker" style="--dur:1.4s; --org:center" cx="290" cy="352" r="9" fill="#e08a5a" opacity=".85"/>
            <g fill="#9db4bd" opacity=".8">
              <circle class="a-rise" style="--rise:-34px; --wob:2.5px; --dur:4s" cx="278" cy="344" r="2.6"/>
              <circle class="a-rise" style="--rise:-38px; --wob:3px; --dur:4.8s; --delay:1.6s" cx="298" cy="346" r="2.4"/>
            </g>

            <!-- dissolved CO2 in the deep layer -->
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
            <text x="290" y="292" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2" opacity=".9" x-show="step===0">deep water &#183; high dissolved CO2</text>

            <!-- step 1: one proposed trigger + rapid bubble formation -->
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
              <text class="a-blink" style="--dur:1.4s" x="290" y="188" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#ffd27e" font-weight="700">PRESSURE DROPS &#8594; CO2 RELEASES</text>
            </g>

            <!-- step 2: gas release + low-lying cloud + village -->
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
              <text x="470" y="216" font-family="JetBrains Mono" font-size="10" fill="#9db4bd">CO2-rich air in low areas</text>
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
                <text x="441" y="87" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fd9ae" font-weight="700">CONTROLLED DEGASSING</text>
              </g>
            </g>
          </svg>`
};
