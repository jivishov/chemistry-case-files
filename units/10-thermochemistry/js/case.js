// Case narrative and assessment aligned with the unit reading.
export const CASE = {
  "id": "bomb-calorimeter-label",
  "number": "010",
  "kicker": "how food energy became a number",
  "title": "What heat measurements tell us about food Calories",
  "teaser": "Connect calorimetry to the energy numbers on a food label",
  "hook": "Food labels report energy available from a serving. Modern labels commonly calculate it from nutrient amounts and established factors. Calorimetry helps explain those factors: burning a sample transfers energy to water and the instrument, and a temperature rise provides evidence.",
  "stats": [
    {
      "v": "4.184 J",
      "k": "to warm 1 g of water by 1 °C"
    },
    {
      "v": "1 kcal",
      "k": "equals 4.184 kJ"
    },
    {
      "v": "4-9-4",
      "k": "general kcal/g factors: carbohydrate, fat, protein"
    }
  ],
  "steps": [
    {
      "t": "A label is usually calculated",
      "body": "A label might say 230 Calories. Food manufacturers can calculate this value using nutrient amounts and approved energy factors. Calorimetry measures combustion energy, while food-label calculations account for how much energy people can metabolize. These quantities are related, but not identical.",
      "chem": "One food Calorie is one kilocalorie: 1 Cal = 1 kcal = 4.184 kJ. Energy transferred as heat can be inferred from a known heat capacity and a measured temperature change.",
      "cap": "Modern label: composition and accepted energy factors produce the Calorie value."
    },
    {
      "t": "Measure combustion energy",
      "body": "In bomb calorimetry, a measured food sample burns in oxygen inside a sealed steel chamber surrounded by water. An insulated outer jacket limits heat exchange with the room. Historical work by Wilbur Atwater and others connected food composition, combustion energy, and energy available to the body.",
      "chem": "The rigid chamber provides a constant-volume experiment. Sealing it prevents matter transfer; insulation limits heat loss. Energy warms both the water and the apparatus, so accurate work uses a calibrated total heat capacity.",
      "cap": "Idealized model: sample combustion warms 2000 g of water by 4.50 °C."
    },
    {
      "t": "Atwater connected chemistry to metabolism",
      "body": "Measure the temperature increase of the water and instrument. For water alone, q = mcΔT. A real calorimeter also requires the apparatus heat capacity and appropriate corrections. In an ideal insulated model, the reaction loses the energy the surroundings gain.",
      "chem": "Liquid water has specific heat about 4.184 J/(g·°C). This value converts a water temperature change into absorbed heat when no phase change occurs. A temperature rise is evidence of heat transfer, not an energy value until heat capacity is included.",
      "cap": "q_water = mcΔT; a calibrated instrument also includes its hardware."
    },
    {
      "t": "From nutrients to a label",
      "body": "Common general Atwater factors assign about 4 kcal/g to carbohydrate and protein and 9 kcal/g to fat. Multiplying measured nutrient amounts by appropriate factors estimates metabolizable energy. Specific factors and other labeling methods also exist, so burning each individual packaged item is unnecessary.",
      "chem": "For the illustrated serving, 28 g carbohydrate, 9 g protein, and 9 g fat give 28(4) + 9(4) + 9(9) = 229 kcal, displayed as about 230 Calories. This nutrient calculation is separate from the cracker combustion exercise.",
      "cap": "Common nutrient factors estimate metabolizable energy."
    }
  ],
  "quiz": {
    "q": "In a simplified water-only calorimeter model, neglect hardware and heat loss. Burning a cracker warms 2000 g water by 4.50 °C. Using c = 4.184 J/(g·°C), what energy is transferred to the water?",
    "options": [
      {
        "label": "About 37.7 kJ, or about 9.0 kcal",
        "correct": true
      },
      {
        "label": "About 9.0 kJ, or about 9.0 kcal",
        "correct": false
      },
      {
        "label": "About 377 kJ, or about 90 kcal",
        "correct": false
      }
    ],
    "explain": "q = mcΔT = 2000 × 4.184 × 4.50 = 37,656 J, about 37.7 kJ or 9.0 kcal. In this stated model, that equals the magnitude of the cracker’s heat release. A real instrument needs additional corrections, and this combustion value is not automatically the food-label value."
  },
  "punch": "A known heat capacity turns a temperature measurement into an energy estimate. Keep track of the system, the sign of heat transfer, and what the model leaves out.",
  "careers": [
    "Food scientist",
    "Calorimetry technician",
    "Nutrition scientist",
    "Analytical chemist"
  ],
  "cta": {
    "label": "Practice q = mcΔT",
    "call": "setMode('warm')"
  },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Animated scene: a bomb calorimeter ignites a food sample, the water temperature climbs, and combustion energy is compared with food-label energy">
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
              <text x="400" y="222" font-family="JetBrains Mono" font-size="12" fill="#7fc4d0">q = m c ΔT</text>
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
                <text x="416" y="262" font-family="JetBrains Mono" font-size="10" fill="#24363f">4-9-4 estimate</text>
                <text x="584" y="262" text-anchor="end" font-family="JetBrains Mono" font-size="12" font-weight="700" fill="#2f8f5b">229</text>
                <text x="500" y="282" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#687a82">229 kcal before label rounding</text>
              </g>
            </g>
          </svg>`
};
