// case.js: Unit 3 case file: how periodic trends connect to lithium-ion batteries.
// The shared Case File renderer owns the chrome; this file owns Unit 3 story text and stage art.

export const CASE = {
  id: 'lithium-battery-map',
  number: '003',
  kicker: 'lithium-ion batteries',
  title: 'Why lithium is useful in rechargeable batteries',
  teaser: 'How periodic trends connect to lithium-ion battery chemistry',
  hook: 'Most phones, laptops, and electric vehicles use lithium-ion batteries. Periodic properties help explain why lithium is useful, but battery performance also depends on electrode materials, electrolyte, cell design, and electrochemical potential.',
  stats: [
    { v: '3', k: 'atomic number' },
    { v: '6.94 u', k: 'atomic mass' },
    { v: '+1', k: 'common ion charge' }
  ],
  steps: [
    {
      t: 'Inside a lithium-ion cell',
      body: 'During discharge, electrons move through the external circuit while lithium ions move through the electrolyte. Keeping those paths separate allows the cell reactions to deliver electrical energy to a device.',
      chem: 'Battery voltage is an electrochemical property of the complete cell. Gas-phase first ionization energy alone does not determine battery voltage.',
      cap: 'Discharge: electrons use the external circuit; Li+ moves through the electrolyte.'
    },
    {
      t: 'What the periodic table tells us',
      body: 'Lithium is in Group 1 and Period 2. It has one valence electron, a relatively small atomic radius, and the lowest atomic mass of any metal. These properties help compare lithium with other elements, but they do not by themselves predict a complete battery\'s performance.',
      chem: 'Down Group 1, atomic radius increases and first ionization energy generally decreases. Sodium is therefore larger than lithium and has a lower first ionization energy.',
      cap: 'Li and Na share a family but differ in atomic radius and atomic mass.'
    },
    {
      t: 'Lithium moves between electrodes',
      body: 'In a typical lithium-ion cell, Li+ moves between electrode materials through the electrolyte while electrons travel through the external circuit. In graphite-based cells, lithium is stored between carbon layers when the cell is charged and leaves the graphite during discharge.',
      chem: 'Oxidation at the negative electrode during discharge releases electrons to the circuit. Electrode chemistry and electrochemical potential—not one periodic trend—determine the cell voltage.',
      cap: 'Graphite stores lithium between carbon layers; the electrolyte carries Li+.'
    },
    {
      t: 'Why sodium is also studied',
      body: 'Sodium-ion batteries use Na+ and related ion-storage chemistry. Sodium is larger and heavier than lithium, and sodium-ion cells require different electrode materials and design choices. Which chemistry is better depends on the application.',
      chem: 'Elements in the same family share important valence-electron patterns, but differences in size, mass, and electrochemical behavior still matter. Periodic trends provide a starting point; engineering data complete the comparison.',
      cap: 'Periodic trends compare candidates; engineering data determine the cell.'
    }
  ],
  quiz: {
    q: 'Sodium sits directly below lithium in Group 1. Compared with lithium, a sodium atom is...',
    options: [
      { label: 'Larger, with a lower first ionization energy', correct: true },
      { label: 'Smaller, with a higher first ionization energy', correct: false },
      { label: 'The same size, since they share a group', correct: false }
    ],
    explain: 'Moving down Group 1 adds an occupied electron shell. Sodium therefore has a larger radius, and its outer electron is farther from the nucleus and more shielded, so its first ionization energy is lower. This trend alone does not predict battery voltage or battery-pack mass.'
  },
  punch: 'Periodic trends are a starting point for materials selection. Engineers combine them with electrochemical data, structure, safety, cost, and performance testing.',
  careers: ['Battery engineer', 'Electrochemist', 'Materials scientist', 'Battery safety engineer'],
  cta: { label: 'Explore periodic trends', call: "setMode('trends')" },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated lithium-ion cell during discharge: lithium ions cross the electrolyte while electrons travel through an external circuit to power a device">
            <!-- phone / load -->
            <g>
              <rect x="36" y="66" width="112" height="222" rx="16" fill="#132630" stroke="#5b8091" stroke-width="2"/>
              <rect x="46" y="84" width="92" height="186" rx="6" fill="#1a3241"/>
              <rect x="66" y="150" width="52" height="26" rx="5" fill="none" stroke="#7fc4d0" stroke-width="2"/>
              <rect x="118" y="158" width="5" height="10" rx="1.5" fill="#7fc4d0"/>
              <rect class="a-pulse" style="--dur:2.6s" x="69" y="153" width="20" height="20" rx="3" fill="#8fd9ae"/>
              <text class="a-blink" style="--dur:2.6s" x="92" y="196" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#8fd9ae">device powered</text>
              <circle class="a-pulse" style="--dur:2s" cx="92" cy="240" r="4" fill="#ffd27e"/>
            </g>

            <!-- external circuit -->
            <path d="M 236,120 L 236,86 L 560,86 L 560,120" fill="none" stroke="#5b8091" stroke-width="3"/>
            <g fill="#7fc4d0">
              <circle class="a-flow" style="--fx:320px; --dur:3s" cx="240" cy="86" r="4"/>
              <circle class="a-flow" style="--fx:320px; --dur:3s; --delay:1s" cx="240" cy="86" r="4"/>
              <circle class="a-flow" style="--fx:320px; --dur:3s; --delay:2s" cx="240" cy="86" r="4"/>
            </g>
            <text x="490" y="76" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#7fc4d0">e-: external circuit</text>
            <g>
              <circle class="a-glow" style="--dur:1.8s" cx="398" cy="86" r="16" fill="#ffd27e" opacity=".25"/>
              <circle class="a-flicker" style="--dur:1.3s; --org:center" cx="398" cy="86" r="11" fill="#ffd27e"/>
            </g>

            <!-- cell body -->
            <rect x="216" y="120" width="384" height="196" rx="10" fill="#172d3b" stroke="#48697a"/>
            <g>
              <rect x="228" y="132" width="26" height="172" rx="4" fill="#213a49"/>
              <g stroke="#628ba0" stroke-width="2">
                <line x1="232" y1="148" x2="250" y2="148"/><line x1="232" y1="168" x2="250" y2="168"/>
                <line x1="232" y1="188" x2="250" y2="188"/><line x1="232" y1="208" x2="250" y2="208"/>
                <line x1="232" y1="228" x2="250" y2="228"/><line x1="232" y1="248" x2="250" y2="248"/>
                <line x1="232" y1="268" x2="250" y2="268"/><line x1="232" y1="288" x2="250" y2="288"/>
              </g>
              <text x="241" y="330" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#bad0d8">graphite</text>
            </g>
            <rect x="562" y="132" width="26" height="172" rx="4" fill="#413543"/>
            <text x="575" y="330" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#bad0d8">positive electrode</text>
            <line x1="408" y1="128" x2="408" y2="308" stroke="#48697a" stroke-dasharray="5 6"/>
            <g>
              <g class="a-flow" style="--fx:290px; --dur:4.2s">
                <g class="a-swim" style="--dur:1.5s">
                  <circle cx="262" cy="170" r="7" fill="#8fd9ae"/>
                  <text x="262" y="173" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#132630">Li+</text>
                </g>
              </g>
              <g class="a-flow" style="--fx:290px; --dur:4.2s; --delay:1.4s">
                <g class="a-swim" style="--dur:1.3s; --delay:.4s">
                  <circle cx="262" cy="222" r="7" fill="#8fd9ae"/>
                  <text x="262" y="225" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#132630">Li+</text>
                </g>
              </g>
              <g class="a-flow" style="--fx:290px; --dur:4.2s; --delay:2.8s">
                <g class="a-swim" style="--dur:1.7s; --delay:.8s">
                  <circle cx="262" cy="274" r="7" fill="#8fd9ae"/>
                  <text x="262" y="277" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#132630">Li+</text>
                </g>
              </g>
            </g>
            <text x="408" y="300" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#bad0d8">Li+: electrolyte</text>

            <!-- chapter 2 overlay: periodic comparison -->
            <g x-show="step===1">
              <rect x="300" y="140" width="216" height="126" rx="8" fill="#132630" stroke="#48697a"/>
              <text x="408" y="160" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#bad0d8">PERIODIC COMPARISON</text>
              <g font-family="JetBrains Mono" font-size="11">
                <rect x="318" y="172" width="30" height="30" rx="4" fill="#1a3241" stroke="#48697a"/><text x="333" y="191" text-anchor="middle" fill="#c3d6dc">H</text>
                <rect class="a-pulse" style="--dur:1.8s" x="318" y="208" width="30" height="30" rx="4" fill="#2a7d8a" stroke="#7fc4d0"/><text x="333" y="227" text-anchor="middle" fill="#fff">Li</text>
                <rect x="352" y="208" width="30" height="30" rx="4" fill="#1a3241" stroke="#48697a"/><text x="367" y="227" text-anchor="middle" fill="#c3d6dc">Be</text>
                <rect x="318" y="242" width="30" height="30" rx="4" fill="#1a3241" stroke="#48697a"/><text x="333" y="261" text-anchor="middle" fill="#c3d6dc">Na</text>
                <rect x="352" y="242" width="30" height="30" rx="4" fill="#1a3241" stroke="#48697a"/><text x="367" y="261" text-anchor="middle" fill="#c3d6dc">Mg</text>
              </g>
              <g font-family="JetBrains Mono" font-size="10" fill="#8fd9ae">
                <text x="398" y="216">Group 1 · 1 valence e-</text>
                <text x="398" y="232">Period 2 · small atom</text>
                <text x="398" y="248">6.94 u · lightest metal</text>
              </g>
            </g>

            <!-- chapter 3 overlay: oxidation representation -->
            <g x-show="step===2">
              <g class="a-float" style="--dur:3.4s">
                <rect x="292" y="146" width="232" height="34" rx="8" fill="#132630" stroke="#7fc4d0"/>
                <text x="408" y="168" text-anchor="middle" font-family="JetBrains Mono" font-size="12" fill="#7fc4d0">Li in graphite → Li+ + e-</text>
              </g>
            </g>

            <!-- chapter 4 overlay: related battery research -->
            <g x-show="step===3" font-family="JetBrains Mono" font-size="10">
              <g class="a-float" style="--dur:3.2s">
                <rect x="300" y="140" width="70" height="26" rx="13" fill="#132630" stroke="#8fd9ae"/><text x="335" y="157" text-anchor="middle" fill="#8fd9ae">Na-ion</text>
              </g>
              <g class="a-float" style="--dur:3.2s; --delay:.6s">
                <rect x="378" y="140" width="76" height="26" rx="13" fill="#132630" stroke="#ffd27e"/><text x="416" y="157" text-anchor="middle" fill="#ffd27e">Mg research</text>
              </g>
              <g class="a-float" style="--dur:3.2s; --delay:1.2s">
                <rect x="462" y="140" width="96" height="26" rx="13" fill="#132630" stroke="#7fc4d0"/><text x="510" y="157" text-anchor="middle" fill="#7fc4d0">solid-state Li</text>
              </g>
            </g>
          </svg>`
};
