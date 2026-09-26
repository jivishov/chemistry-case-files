// Case narrative and assessment aligned with the unit reading.
export const CASE = {
  "id": "soda-enamel-ph",
  "number": "009",
  "kicker": "acid-base chemistry in everyday life",
  "title": "Why acidic drinks can demineralize tooth enamel",
  "teaser": "A four-unit pH change means 10,000× greater [H+]",
  "hook": "Acidic drinks can promote enamel mineral loss. pH helps compare hydrogen-ion activity, but buffering, mineral composition, and exposure also affect the outcome.",
  "stats": [
    {
      "v": "2.5",
      "k": "illustrative cola pH"
    },
    {
      "v": "~5.5",
      "k": "illustrative reference; no universal erosion cutoff"
    },
    {
      "v": "10,000×",
      "k": "H+ concentration ratio for the example"
    }
  ],
  "steps": [
    {
      "t": "Enamel is mineral",
      "body": "Tooth enamel contains calcium-phosphate minerals, mainly hydroxyapatite. Acidic conditions can favor mineral dissolution. Saliva helps buffer the surrounding solution and supplies minerals, but oral conditions vary between people and over time.",
      "chem": "For this dilute-solution model, pH = −log10[H3O+]. Neutral water is pH 7 at 25 °C. Each decrease of one pH unit represents a tenfold increase in hydronium concentration.",
      "cap": "ENAMEL · HYDROXYAPATITE MINERAL"
    },
    {
      "t": "Read the pH scale",
      "body": "Use pH 2.5 for an example cola and pH 6.5 for an example saliva sample. Their four-unit difference corresponds to a 10,000-fold hydronium concentration ratio. The pH of a drink is not automatically the pH everywhere in the mouth after a sip.",
      "chem": "10^(6.5 − 2.5) = 10,000 compares hydronium concentrations. It does not measure total acid content, exposure time, buffering capacity, or the amount of enamel lost.",
      "cap": "Example samples: cola pH 2.5; saliva pH 6.5."
    },
    {
      "t": "Acid shifts the mineral balance",
      "body": "Acid can favor dissolution of enamel mineral by changing the solution’s equilibrium. A value near pH 5.5 is often used as an introductory reference for enamel demineralization, but it is not a universal cutoff for dental erosion. Calcium, phosphate, buffering, and exposure all matter.",
      "chem": "Hydronium reacts with mineral components, favoring dissolved forms. The acid-base chemistry is connected to a solubility equilibrium; pH alone does not determine the amount of erosion.",
      "cap": "The reference line illustrates a concept, not a universal erosion threshold."
    },
    {
      "t": "Buffers change the response",
      "body": "Saliva contains buffers that consume added acid and can support remineralization under suitable conditions. Buffer capacity, mineral concentrations, and exposure patterns influence the response. This diagram uses a simplified sequence rather than a fixed recovery time.",
      "chem": "Demineralization and remineralization are competing processes influenced by the chemical environment around the enamel.",
      "cap": "Buffering can raise pH; recovery and mineral balance depend on conditions."
    }
  ],
  "quiz": {
    "q": "For equal-volume example samples, use pH 6.5 for saliva and pH 2.5 for cola. Under the concentration approximation, what is the hydronium concentration ratio?",
    "options": [
      {
        "label": "About 10,000 times greater",
        "correct": true
      },
      {
        "label": "About 4 times greater",
        "correct": false
      },
      {
        "label": "About 40 times greater",
        "correct": false
      },
      {
        "label": "About 1,000 times greater",
        "correct": false
      }
    ],
    "explain": "For the stated example values, the hydronium concentration ratio is 10^(6.5 − 2.5) = 10,000. This is a concentration comparison, not a prediction of total acidity or tissue damage."
  },
  "punch": "A small numerical change in pH can represent a large change in hydronium concentration. Interpreting its effects also requires information about buffering, composition, and exposure.",
  "careers": [
    "Dentist",
    "Dental hygienist",
    "Dental researcher",
    "Food scientist"
  ],
  "cta": {
    "label": "Use the pH meter",
    "call": "setMode('meter')"
  },
  stage: `<svg viewBox="0 0 640 360" role="img" aria-label="Schematic comparison of example pH values, acid-favored mineral dissolution, and buffering; no universal threshold or recovery time">
            <defs>
              <linearGradient id="cf9-scale" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#ff6f5e"/><stop offset="40%" stop-color="#ffd27e"/>
                <stop offset="55%" stop-color="#8fd9ae"/><stop offset="100%" stop-color="#7fc4ff"/>
              </linearGradient>
            </defs>

            <!-- pH scale bar -->
            <g>
              <text x="40" y="52" font-family="JetBrains Mono" font-size="10" fill="#8fa9b2">pH</text>
              <rect x="40" y="60" width="420" height="18" rx="4" fill="url(#cf9-scale)"/>
              <g font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">
                <text x="40" y="94">0</text><text x="145" y="94">3.5</text><text x="250" y="94">7</text><text x="452" y="94" text-anchor="end">14</text>
              </g>
              <!-- critical 5.5 line -->
              <line x1="205" y1="54" x2="205" y2="84" stroke="#ff9a82" stroke-width="1.6" stroke-dasharray="3 3"/>
              <text x="205" y="112" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#ff9a82">5.5: example reference</text>
              <!-- moving marker: pH per step -->
              <g style="transition: transform .9s var(--ease);" :style="\`transform: translateX(\${[(6.5/14)*420,(2.5/14)*420,(2.5/14)*420,(6.0/14)*420][step]}px)\`">
                <polygon points="40,44 34,32 46,32" fill="#eef6f8"/>
                <text x="40" y="26" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#eef6f8" font-weight="700" x-text="'pH ' + [6.5,2.5,2.5,6.0][step]"></text>
              </g>
            </g>

            <!-- soda can pouring (steps 1) -->
            <g x-show="step===1">
              <g class="a-sway" style="--deg:8deg; --dur:2s">
                <rect x="120" y="126" width="42" height="70" rx="6" fill="#b83a2c" stroke="#7c2318"/>
                <rect x="120" y="140" width="42" height="16" fill="#eef6f8" opacity=".85"/>
                <path d="M 138,196 q -6,26 -2,54" fill="none" stroke="#6b4a2a" stroke-width="6" opacity=".8"/>
                <!-- the stream wavers where it leaves the lip -->
                <path class="a-flicker" style="--dur:.9s; --org:50% 0%" d="M 138,196 q -5,18 -3,34" fill="none" stroke="#8b5f34" stroke-width="3" opacity=".7"/>
              </g>
              <g fill="#7c4a26">
                <circle class="a-fall" style="--fy:70px; --sway:3px; --dur:1.4s" cx="136" cy="210" r="3"/>
                <circle class="a-fall" style="--fy:70px; --sway:2px; --dur:1.6s; --delay:.5s" cx="140" cy="210" r="2.6"/>
                <circle class="a-fall" style="--fy:66px; --sway:4px; --dur:1.5s; --delay:1s" cx="133" cy="210" r="2.2"/>
              </g>
              <!-- carbonation fizz popping off the pour -->
              <g fill="#dcebee" opacity=".7">
                <circle class="a-spark" style="--dur:1.5s; --delay:.3s" cx="132" cy="252" r="2"/>
                <circle class="a-spark" style="--dur:1.8s; --delay:1.1s" cx="144" cy="262" r="1.7"/>
              </g>
            </g>

            <!-- the tooth -->
            <g transform="translate(300,230)">
              <path d="M -46,-40 C -46,-70 46,-70 46,-40 C 52,4 30,70 16,70 C 6,70 6,40 0,40 C -6,40 -6,70 -16,70 C -30,70 -52,4 -46,-40 Z"
                    fill="#f3f7f8" stroke="#c9d9de" stroke-width="2"/>
              <!-- enamel erosion: gnaws in on steps 2 -->
              <g x-show="step===2" fill="#0d1a21" opacity=".55">
                <circle class="a-glow" style="--dur:1.6s" cx="-30" cy="-30" r="7"/>
                <circle class="a-glow" style="--dur:1.8s; --delay:.5s" cx="26" cy="-20" r="6"/>
                <circle class="a-glow" style="--dur:1.4s; --delay:1s" cx="-6" cy="-44" r="5"/>
                <circle class="a-glow" style="--dur:2s; --delay:.8s" cx="14" cy="-48" r="4"/>
              </g>
              <!-- crystal lattice hint -->
              <g stroke="#cfe0e5" stroke-width="1" opacity=".7">
                <line x1="-30" y1="-10" x2="30" y2="-10"/><line x1="-30" y1="6" x2="30" y2="6"/>
                <line x1="-16" y1="-24" x2="-16" y2="22"/><line x1="14" y1="-24" x2="14" y2="22"/>
              </g>
            </g>

            <!-- H+ ions attacking (step 2) -->
            <g x-show="step===2" fill="#ff6f5e">
              <g class="a-flow" style="--fx:40px; --fy:20px; --dur:2s">
                <g class="a-jiggle" style="--dur:.5s">
                  <circle cx="200" cy="200" r="7"/><text x="200" y="204" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#0d1a21">H+</text>
                </g>
              </g>
              <g class="a-flow" style="--fx:44px; --fy:30px; --dur:2.3s; --delay:.9s">
                <g class="a-jiggle" style="--dur:.6s; --delay:.2s">
                  <circle cx="196" cy="240" r="7"/><text x="196" y="244" text-anchor="middle" font-family="JetBrains Mono" font-size="8" fill="#0d1a21">H+</text>
                </g>
              </g>
              <g class="a-flow" style="--fx:38px; --fy:-16px; --dur:2.1s; --delay:1.5s">
                <g class="a-jiggle" style="--dur:.55s; --delay:.1s">
                  <circle cx="204" cy="272" r="6"/><text x="204" y="276" text-anchor="middle" font-family="JetBrains Mono" font-size="7" fill="#0d1a21">H+</text>
                </g>
              </g>
            </g>
            <!-- Ca2+ / PO4 leaving (step 2) -->
            <g x-show="step===2">
              <g class="a-flow" style="--fx:70px; --fy:-30px; --dur:2.6s">
                <circle cx="356" cy="220" r="8" fill="#7fc4ff"/><text x="356" y="224" text-anchor="middle" font-family="JetBrains Mono" font-size="7" fill="#0d1a21">Ca</text>
              </g>
              <g class="a-flow" style="--fx:74px; --fy:24px; --dur:2.9s; --delay:1.1s">
                <circle cx="356" cy="252" r="8" fill="#c9a6ff"/><text x="356" y="256" text-anchor="middle" font-family="JetBrains Mono" font-size="7" fill="#0d1a21">PO4</text>
              </g>
              <text class="a-blink" style="--dur:1.4s" x="300" y="330" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#ff9a82" font-weight="700">DEMINERALIZATION</text>
            </g>

            <!-- step 0: guarded label -->
            <g x-show="step===0">
              <g fill="#8fd9ae" opacity=".85">
                <circle class="a-float" style="--dur:3s" cx="220" cy="220" r="4"/>
                <circle class="a-float" style="--dur:3.4s; --delay:.6s" cx="384" cy="236" r="4"/>
              </g>
              <text x="300" y="330" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#8fd9ae">saliva provides buffering</text>
            </g>

            <!-- step 3: saliva buffer + remineralization -->
            <g x-show="step===3">
              <g class="a-flow" style="--fx:80px; --fy:-20px; --dur:3s">
                <g class="a-swim" style="--dur:1.4s">
                  <circle cx="200" cy="220" r="8" fill="#7fc4ff"/><text x="200" y="224" text-anchor="middle" font-family="JetBrains Mono" font-size="7" fill="#0d1a21">Ca</text>
                </g>
              </g>
              <g class="a-flow" style="--fx:84px; --fy:8px; --dur:3.3s; --delay:1s">
                <g class="a-swim" style="--dur:1.6s; --delay:.3s">
                  <circle cx="196" cy="250" r="8" fill="#c9a6ff"/><text x="196" y="254" text-anchor="middle" font-family="JetBrains Mono" font-size="7" fill="#0d1a21">PO4</text>
                </g>
              </g>
              <!-- mineral knitting back into the enamel surface -->
              <g fill="#8fd9ae">
                <circle class="a-spark" style="--dur:2.2s; --delay:.6s" cx="286" cy="196" r="2.4"/>
                <circle class="a-spark" style="--dur:2.5s; --delay:1.6s" cx="314" cy="208" r="2.2"/>
              </g>
              <text x="150" y="200" text-anchor="end" font-family="JetBrains Mono" font-size="9" fill="#8fd9ae">buffering + mineral recovery</text>
              <text class="a-blink" style="--dur:1.8s" x="300" y="330" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#8fd9ae" font-weight="700">BUFFERING AND MINERAL BALANCE</text>
            </g>

            <!-- clock strip -->
            <g transform="translate(500,150)">
              <circle cx="0" cy="0" r="46" fill="#0d1a21" stroke="#2c414d"/>
              <text x="0" y="-56" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">ACID EXPOSURE</text>
              <circle cx="0" cy="0" r="38" fill="none" stroke="#1c313d" stroke-width="6"/>
              <circle cx="0" cy="0" r="38" fill="none" stroke-width="6" stroke-linecap="round"
                      :stroke="step===3 ? '#8fd9ae' : '#ff6f5e'"
                      stroke-dasharray="239" style="transition: stroke-dashoffset .9s var(--ease), stroke .9s;"
                      :stroke-dashoffset="[239,60,20,150][step]" transform="rotate(-90)"/>
              <text x="0" y="4" text-anchor="middle" font-family="JetBrains Mono" font-size="11"
                    :fill="step===3 ? '#8fd9ae' : '#ff9a82'"
                    x-text="['buffered','acidic','dissolving','buffering'][step]"></text>
            </g>
          </svg>`
};
