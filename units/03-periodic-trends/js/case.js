// case.js: Unit 3 case file: why lithium powers the phone in your pocket.
// units_new build. Carries the story AND the stage art; the chrome comes from
// shared/js/casefile.js.
//
// Copied whole from units/03-periodic-trends/js/case.js. The one edit is cta.call:
// the cockpit shell routes through setMode() so the mount can react, where the
// worksheet shell assigned `mode` directly. tests/casefile.test.js checks the shape
// of this field, so it is not a free-form string.

export const CASE = {
  id: 'lithium-battery-map',
  number: '003',
  kicker: 'in your pocket right now',
  title: 'Your phone bet everything on the top-left corner',
  teaser: 'Why your phone battery was designed on this exact table',
  hook: 'Every phone, laptop, and electric car runs on lithium. Engineers did not pick element 3 by luck. They read the periodic trends in this unit like a treasure map, and the map pointed top-left.',
  stats: [
    { v: '#3', k: 'lithium: lightest metal' },
    { v: '1 e-', k: 'valence electron to give' },
    { v: '~2 g', k: 'of Li inside your phone' }
  ],
  steps: [
    {
      t: 'The 1% panic',
      body: 'Your phone hits 1% and the whole day reorganizes around an outlet. Inside that slab is an electrochemical cell, and the ion that does all the running was chosen using exactly the trends on this page.',
      chem: 'A battery is controlled electron traffic. The design question: which element gives up an electron easily, moves fast, and weighs almost nothing?',
      cap: 'Inside the slab: layered electrodes soaked in electrolyte.'
    },
    {
      t: 'Reading the map',
      body: 'Lithium sits in Group 1, Period 2. One valence electron it barely holds onto. A tiny radius that lets Li+ slip between graphite layers like a coin into a slot. And it is the lightest metal that exists.',
      chem: 'Group 1 means one loosely held valence electron and a low first ionization energy. Period 2 means small radius. Top-left is where "gives electrons willingly" and "featherweight" overlap.',
      cap: 'Group 1 x Period 2: eager to lose one electron, tiny, light.'
    },
    {
      t: 'Rocking-chair ions',
      body: 'On discharge, lithium atoms at the graphite electrode each give up one electron. The electrons travel the external circuit and light your screen, while the Li+ ions swim through the electrolyte to the other electrode. Charging pushes everything back.',
      chem: 'At the anode: Li becomes Li+ plus e-. A low ionization energy is what makes that push cheap, and it is why a battery starts in this corner of the table at all. Which Group 1 metal gives the most voltage is decided in solution rather than in a gas, and there lithium leads its own group at -3.04 V.',
      cap: 'Discharge: electrons through the wire, Li+ through the electrolyte.'
    },
    {
      t: 'The map keeps giving',
      body: 'Slide one row down and you hit sodium: bigger, heavier, but dirt cheap. Grid-scale sodium batteries are booming for exactly that trade. Every next-generation battery pitch is really a periodic-trends argument.',
      chem: 'Same family means same chemistry with shifted numbers. Na is even easier to ionize, and still delivers less voltage (-2.71 V), because it pays in size, in mass, and in how weakly its bigger ion is held by the solvent. Trend literacy is battery literacy.',
      cap: 'Next contenders: Na (cheap), Mg (gives 2 electrons), solid-state Li.'
    }
  ],
  quiz: {
    q: 'Sodium sits directly below lithium in Group 1. Compared with lithium, a sodium atom is...',
    options: [
      { label: 'Larger, with a lower first ionization energy', correct: true },
      { label: 'Smaller, with a higher first ionization energy', correct: false },
      { label: 'The same size, since they share a group', correct: false }
    ],
    explain: 'Each row down adds an electron shell, so the radius grows, and the outer electron, now farther out and better shielded, is easier to remove. That is why sodium batteries work too; each ion is just about three times heavier than lithium.'
  },
  punch: 'The periodic table is not a poster to memorize. It is the search engine materials scientists query to decide what gets invented next.',
  careers: ['Battery engineer', 'Materials scientist', 'EV designer', 'Semiconductor chemist'],
  cta: { label: 'Explore the trends behind the battery', call: "setMode('trends')" },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated scene: a lithium-ion cell discharges, lithium ions crossing the electrolyte while electrons power a phone">
            <!-- phone -->
            <g>
              <rect x="36" y="66" width="112" height="222" rx="16" fill="#0d1a21" stroke="#5b8091" stroke-width="2"/>
              <rect x="46" y="84" width="92" height="186" rx="6" fill="#132530"/>
              <!-- battery glyph -->
              <rect x="66" y="150" width="52" height="26" rx="5" fill="none" stroke="#7fc4d0" stroke-width="2"/>
              <rect x="118" y="158" width="5" height="10" rx="1.5" fill="#7fc4d0"/>
              <rect class="a-pulse" style="--dur:2.6s" x="69" y="153" width="20" height="20" rx="3" fill="#8fd9ae"/>
              <text class="a-blink" style="--dur:2.6s" x="92" y="196" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#8fd9ae">charging&#8230;</text>
              <circle class="a-pulse" style="--dur:2s" cx="92" cy="240" r="4" fill="#ffd27e"/>
            </g>

            <!-- external circuit wire -->
            <path d="M 236,120 L 236,86 L 560,86 L 560,120" fill="none" stroke="#5b8091" stroke-width="3"/>
            <!-- electrons on the wire (discharge direction: anode -> device -> cathode) -->
            <g fill="#7fc4d0">
              <circle class="a-flow" style="--fx:320px; --dur:3s" cx="240" cy="86" r="4"/>
              <circle class="a-flow" style="--fx:320px; --dur:3s; --delay:1s" cx="240" cy="86" r="4"/>
              <circle class="a-flow" style="--fx:320px; --dur:3s; --delay:2s" cx="240" cy="86" r="4"/>
            </g>
            <text x="490" y="76" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#7fc4d0">e- do the work out here</text>
            <!-- device load on the wire: a warm, breathing bulb -->
            <g>
              <circle class="a-glow" style="--dur:1.8s" cx="398" cy="86" r="16" fill="#ffd27e" opacity=".25"/>
              <circle class="a-flicker" style="--dur:1.3s; --org:center" cx="398" cy="86" r="11" fill="#ffd27e"/>
            </g>

            <!-- cell body -->
            <rect x="216" y="120" width="384" height="196" rx="10" fill="#10202a" stroke="#48697a"/>
            <!-- anode: graphite layers -->
            <g>
              <rect x="228" y="132" width="26" height="172" rx="4" fill="#1c313d"/>
              <g stroke="#628ba0" stroke-width="2">
                <line x1="232" y1="148" x2="250" y2="148"/><line x1="232" y1="168" x2="250" y2="168"/>
                <line x1="232" y1="188" x2="250" y2="188"/><line x1="232" y1="208" x2="250" y2="208"/>
                <line x1="232" y1="228" x2="250" y2="228"/><line x1="232" y1="248" x2="250" y2="248"/>
                <line x1="232" y1="268" x2="250" y2="268"/><line x1="232" y1="288" x2="250" y2="288"/>
              </g>
              <text x="241" y="330" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#bad0d8">graphite</text>
            </g>
            <!-- cathode -->
            <rect x="562" y="132" width="26" height="172" rx="4" fill="#3a2f3c"/>
            <text x="575" y="330" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#bad0d8">oxide</text>
            <!-- separator -->
            <line x1="408" y1="128" x2="408" y2="308" stroke="#48697a" stroke-dasharray="5 6"/>
            <!-- Li+ ions crossing the electrolyte -->
            <g>
              <g class="a-flow" style="--fx:290px; --dur:4.2s">
                <g class="a-swim" style="--dur:1.5s">
                  <circle cx="262" cy="170" r="7" fill="#8fd9ae"/>
                  <text x="262" y="173" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#0d1a21">Li+</text>
                </g>
              </g>
              <g class="a-flow" style="--fx:290px; --dur:4.2s; --delay:1.4s">
                <g class="a-swim" style="--dur:1.3s; --delay:.4s">
                  <circle cx="262" cy="222" r="7" fill="#8fd9ae"/>
                  <text x="262" y="225" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#0d1a21">Li+</text>
                </g>
              </g>
              <g class="a-flow" style="--fx:290px; --dur:4.2s; --delay:2.8s">
                <g class="a-swim" style="--dur:1.7s; --delay:.8s">
                  <circle cx="262" cy="274" r="7" fill="#8fd9ae"/>
                  <text x="262" y="277" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#0d1a21">Li+</text>
                </g>
              </g>
            </g>
            <text x="408" y="300" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#bad0d8">electrolyte: Li+ swim lane</text>

            <!-- step 2 overlay: the top-left map -->
            <g x-show="step===1">
              <rect x="300" y="140" width="216" height="126" rx="8" fill="#0d1a21" stroke="#48697a"/>
              <text x="408" y="160" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#bad0d8">THE TREASURE MAP</text>
              <g font-family="JetBrains Mono" font-size="11">
                <rect x="318" y="172" width="30" height="30" rx="4" fill="#132530" stroke="#48697a"/><text x="333" y="191" text-anchor="middle" fill="#c3d6dc">H</text>
                <rect class="a-pulse" style="--dur:1.8s" x="318" y="208" width="30" height="30" rx="4" fill="#2a7d8a" stroke="#7fc4d0"/><text x="333" y="227" text-anchor="middle" fill="#fff">Li</text>
                <rect x="352" y="208" width="30" height="30" rx="4" fill="#132530" stroke="#48697a"/><text x="367" y="227" text-anchor="middle" fill="#c3d6dc">Be</text>
                <rect x="318" y="242" width="30" height="30" rx="4" fill="#132530" stroke="#48697a"/><text x="333" y="261" text-anchor="middle" fill="#c3d6dc">Na</text>
                <rect x="352" y="242" width="30" height="30" rx="4" fill="#132530" stroke="#48697a"/><text x="367" y="261" text-anchor="middle" fill="#c3d6dc">Mg</text>
              </g>
              <g font-family="JetBrains Mono" font-size="10.5" fill="#8fd9ae">
                <text x="398" y="216">&#8592; small radius</text>
                <text x="398" y="232">&#8592; low ionization E</text>
                <text x="398" y="248">&#8592; lightest metal</text>
              </g>
            </g>

            <!-- step 3 overlay: half-reaction -->
            <g x-show="step===2">
              <g class="a-float" style="--dur:3.4s">
                <rect x="300" y="146" width="216" height="34" rx="8" fill="#0d1a21" stroke="#7fc4d0"/>
                <text x="408" y="168" text-anchor="middle" font-family="JetBrains Mono" font-size="12" fill="#7fc4d0">Li &#8594; Li+ + e-</text>
              </g>
            </g>

            <!-- step 4 overlay: contenders -->
            <g x-show="step===3" font-family="JetBrains Mono" font-size="10">
              <g class="a-float" style="--dur:3.2s">
                <rect x="300" y="140" width="70" height="26" rx="13" fill="#0d1a21" stroke="#8fd9ae"/><text x="335" y="157" text-anchor="middle" fill="#8fd9ae">Na: cheap</text>
              </g>
              <g class="a-float" style="--dur:3.2s; --delay:.6s">
                <rect x="378" y="140" width="76" height="26" rx="13" fill="#0d1a21" stroke="#ffd27e"/><text x="416" y="157" text-anchor="middle" fill="#ffd27e">Mg: 2 e-</text>
              </g>
              <g class="a-float" style="--dur:3.2s; --delay:1.2s">
                <rect x="462" y="140" width="88" height="26" rx="13" fill="#0d1a21" stroke="#7fc4d0"/><text x="506" y="157" text-anchor="middle" fill="#7fc4d0">solid-state</text>
              </g>
            </g>
          </svg>`
};
