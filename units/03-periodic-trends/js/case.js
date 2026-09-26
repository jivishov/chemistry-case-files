// Case narrative and assessment aligned with the unit reading.
export const CASE = {
  "id": "lithium-battery-map",
  "number": "003",
  "kicker": "lithium-ion batteries",
  "title": "Lithium batteries and the periodic table",
  "teaser": "What periodic trends explain about battery materials",
  "hook": "Lithium-ion batteries power many portable devices. Lithium’s small mass and chemistry are useful clues, but selecting a battery also requires information about electrode materials, ion motion, capacity, and voltage.",
  "stats": [
    {
      "v": "3",
      "k": "atomic number"
    },
    {
      "v": "6.94 u",
      "k": "atomic mass"
    },
    {
      "v": "2 paths",
      "k": "ions inside; electrons through the circuit"
    }
  ],
  "steps": [
    {
      "t": "Two paths through a working cell",
      "body": "A lithium-ion cell contains two electrodes, an electrolyte, and a separator. During discharge, lithium ions travel inside the cell while electrons flow through the external device. The separator helps prevent direct electrical contact between the electrodes.",
      "chem": "Ion motion and electron motion complete different parts of the circuit. Both are needed for sustained current.",
      "cap": "A schematic lithium-ion cell during discharge."
    },
    {
      "t": "Read the periodic clues",
      "body": "Lithium is in Group 1, Period 2 and is the lightest metal. It has one valence electron and commonly forms Li+. Sodium is below it: its neutral atom is larger and its first ionization energy is lower.",
      "chem": "Compare like quantities: atomic radius describes a neutral atom; Li+ has a different electron count and radius. Small mass helps gravimetric capacity, but size alone does not determine how easily an ion enters an electrode.",
      "cap": "Same group, different occupied shells and masses."
    },
    {
      "t": "Host materials matter",
      "body": "In a common graphite-based cell, discharge removes lithium from the graphite host and releases electrons to the circuit. Lithium ions are incorporated into the other electrode. Charging reverses the overall transfer.",
      "chem": "Cell voltage depends on the complete electrode reactions. Gas-phase first ionization energy alone does not predict it; aqueous standard potentials are not the operating voltage of a nonaqueous lithium-ion cell.",
      "cap": "Discharge: ions through electrolyte, electrons through the device."
    },
    {
      "t": "Use trends, then test materials",
      "body": "Sodium-ion batteries use a related chemistry, but their electrode choices and performance must be tested. A periodic family predicts useful similarities without making lithium and sodium interchangeable.",
      "chem": "The quiz isolates two periodic properties: neutral-atom radius and first ionization energy. It does not ask you to infer a cell voltage from those two properties.",
      "cap": "A periodic trend starts a materials investigation; measurements complete it."
    }
  ],
  "quiz": {
    "q": "Sodium sits directly below lithium in Group 1. Compared with lithium, a sodium atom is...",
    "options": [
      {
        "label": "Larger, with a lower first ionization energy",
        "correct": true
      },
      {
        "label": "Smaller, with a higher first ionization energy",
        "correct": false
      },
      {
        "label": "The same size, since they share a group",
        "correct": false
      }
    ],
    "explain": "Sodium has an additional occupied electron shell. Its outer electron is farther from the nucleus and more shielded, giving a larger neutral atom and a lower first ionization energy than lithium. A battery’s voltage requires additional chemical information."
  },
  "punch": "Use the periodic table to make a justified prediction, then identify which material measurements are still needed.",
  "careers": [
    "Battery engineer",
    "Electrochemist",
    "Materials scientist",
    "Battery safety engineer"
  ],
  "cta": {
    "label": "Explore periodic trends",
    "call": "setMode('trends')"
  },
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
              <text x="408" y="160" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#bad0d8">LI COMPARED WITH NA</text>
              <g font-family="JetBrains Mono" font-size="11">
                <rect x="318" y="172" width="30" height="30" rx="4" fill="#1a3241" stroke="#48697a"/><text x="333" y="191" text-anchor="middle" fill="#c3d6dc">H</text>
                <rect class="a-pulse" style="--dur:1.8s" x="318" y="208" width="30" height="30" rx="4" fill="#2a7d8a" stroke="#7fc4d0"/><text x="333" y="227" text-anchor="middle" fill="#fff">Li</text>
                <rect x="352" y="208" width="30" height="30" rx="4" fill="#1a3241" stroke="#48697a"/><text x="367" y="227" text-anchor="middle" fill="#c3d6dc">Be</text>
                <rect x="318" y="242" width="30" height="30" rx="4" fill="#1a3241" stroke="#48697a"/><text x="333" y="261" text-anchor="middle" fill="#c3d6dc">Na</text>
                <rect x="352" y="242" width="30" height="30" rx="4" fill="#1a3241" stroke="#48697a"/><text x="367" y="261" text-anchor="middle" fill="#c3d6dc">Mg</text>
              </g>
              <g font-family="JetBrains Mono" font-size="10" fill="#8fd9ae">
                <text x="398" y="216">Li: smaller atom</text>
                <text x="398" y="232">Li: higher first IE</text>
                <text x="398" y="248">Li: lighter atom</text>
              </g>
            </g>

            <!-- chapter 3 overlay: oxidation representation -->
            <g x-show="step===2">
              <g class="a-float" style="--dur:3.4s">
                <rect x="292" y="146" width="232" height="34" rx="8" fill="#132630" stroke="#7fc4d0"/>
                <text x="408" y="168" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#7fc4d0">Li+ leaves the graphite host</text>
              </g>
            </g>

            <!-- chapter 4 overlay: related battery research -->
            <g x-show="step===3" font-family="JetBrains Mono" font-size="10">
              <g class="a-float" style="--dur:3.2s">
                <rect x="300" y="140" width="70" height="26" rx="13" fill="#132630" stroke="#8fd9ae"/><text x="335" y="157" text-anchor="middle" fill="#8fd9ae">mass</text>
              </g>
              <g class="a-float" style="--dur:3.2s; --delay:.6s">
                <rect x="378" y="140" width="76" height="26" rx="13" fill="#132630" stroke="#ffd27e"/><text x="416" y="157" text-anchor="middle" fill="#ffd27e">capacity</text>
              </g>
              <g class="a-float" style="--dur:3.2s; --delay:1.2s">
                <rect x="462" y="140" width="96" height="26" rx="13" fill="#132630" stroke="#7fc4d0"/><text x="510" y="157" text-anchor="middle" fill="#7fc4d0">voltage</text>
              </g>
            </g>
          </svg>`
};
