// Case narrative and assessment aligned with the unit reading.
export const CASE = {
  "id": "scuba-boyle-ascent",
  "number": "007",
  "kicker": "Boyle's law in diving",
  "title": "Why scuba divers never hold their breath on ascent",
  "teaser": "A pressure–volume relationship with a direct safety consequence",
  "hook": "Scuba divers are taught to keep breathing and never hold their breath while ascending. As surrounding pressure decreases, gas in the lungs tends to expand. Boyle's law explains the pressure–volume relationship.",
  "stats": [
    {
      "v": "≈4 atm",
      "k": "absolute pressure at 30 m seawater"
    },
    {
      "v": "4×",
      "k": "model expansion from 30 m to surface"
    },
    {
      "v": "≈+1 atm",
      "k": "pressure per 10 m seawater"
    }
  ],
  "steps": [
    {
      "t": "Pressure increases with depth",
      "body": "At the surface, atmospheric pressure is about 1 atm. In seawater, pressure increases by about 1 atm for every 10 m of depth. At 30 m, the surrounding pressure is therefore about 4 atm absolute. A scuba regulator supplies breathing gas at approximately the surrounding pressure.",
      "chem": "At the same temperature and volume, the ideal-gas model requires four times as many molecules at 4 atm as at 1 atm. The greater collision frequency produces greater pressure.",
      "cap": "At 30 m, the model begins with 1.0 L of gas at approximately 4 atm absolute."
    },
    {
      "t": "Gas expands as pressure decreases",
      "body": "For a sealed, freely expanding model balloon at constant temperature, a pressure decrease from 4 atm to 1 atm predicts expansion from 1.0 L to 4.0 L. This is the unconstrained gas-volume prediction; lungs cannot be treated as freely stretching balloons.",
      "chem": "Boyle's law gives P₁V₁ = P₂V₂. In the simplified model, (4 atm)(1.0 L) = (1 atm)(V₂), so the predicted volume is 4.0 L.",
      "cap": "Boyle's law predicts increasing volume as external pressure decreases."
    },
    {
      "t": "Why breathing during ascent matters",
      "body": "Trapped expanding gas can injure lung tissue during ascent after breathing compressed gas. Injury can occur even in shallow water; there is no universal 10-meter threshold. This model explains the physical concern, while actual scuba procedures require qualified training.",
      "chem": "Boyle’s law describes expansion at fixed amount and temperature. It does not include tissue limits, airway obstruction, dissolved-gas effects, or ascent procedures, and cannot establish that an ascent is safe.",
      "cap": "Gas expansion is one physical risk; the equation is not a dive plan."
    },
    {
      "t": "Boyle's law beyond diving",
      "body": "Similar pressure–volume effects occur in everyday systems. A flexible sealed bag can expand as outside pressure decreases and compress as outside pressure increases. Weather balloons also expand as atmospheric pressure decreases, although temperature changes and the balloon material make the real situation more complex.",
      "chem": "Boyle's law applies most directly to a fixed amount of gas at approximately constant temperature. Real systems may involve changes in temperature, container shape, or other variables.",
      "cap": "Boyle's law models the inverse relationship between pressure and volume."
    }
  ],
  "quiz": {
    "q": "A model gas sample occupies 1.0 L at 3 atm, approximately the pressure at 20 m underwater. At constant temperature and amount, what volume would it occupy at 1 atm if free to expand?",
    "options": [
      {
        "label": "3.0 L, triple the original volume",
        "correct": true
      },
      {
        "label": "1.0 L",
        "correct": false
      },
      {
        "label": "0.33 L",
        "correct": false
      }
    ],
    "explain": "V2 = P1V1/P2 = (3 atm)(1.0 L)/(1 atm) = 3.0 L. This predicts a freely expanding sample under the stated assumptions, not a safe lung volume."
  },
  "punch": "An inverse proportion explains how pressure changes can drive gas expansion. Use the calculation with its assumptions, and distinguish a physical model from a real-world safety decision.",
  "careers": [
    "Diving safety officer",
    "Hyperbaric medicine physician",
    "Aerospace engineer",
    "Meteorologist"
  ],
  "cta": {
    "label": "Explore pressure and volume",
    "call": "setMode('ideal')"
  },
  "state": {
    "depth": 30
  },
  "controls": "\n          <div style=\"padding: var(--s-3) var(--s-4); border-top: 1px solid var(--cf-line); display: flex; gap: var(--s-4); align-items: center;\">\n            <label style=\"color: var(--cf-ink-2); font-size: var(--fs-xs); font-family: var(--font-mono); white-space: nowrap;\" for=\"cf-depth\">MODEL DEPTH</label>\n            <input id=\"cf-depth\" type=\"range\" min=\"0\" max=\"30\" step=\"1\" x-model.number=\"depth\" style=\"flex: 1;\">\n            <span class=\"mono\" style=\"color: var(--cf-accent); font-size: var(--fs-sm); min-width: 46px; text-align: right;\" x-text=\"depth + ' m'\"></span>\n          </div>\n",
  stage: `
          <svg viewBox="0 0 640 360" role="img" aria-label="Interactive Boyle's law model: a sealed gas sample expands as pressure decreases from 30 meters depth toward the surface">
            <rect x="0" y="0" width="640" height="56" fill="#163b49"/><circle class="a-glow" style="--dur:4s" cx="560" cy="26" r="16" fill="#ffd27e" opacity=".8"/>
            <rect x="0" y="56" width="640" height="304" fill="#133548"/><rect x="0" y="150" width="640" height="210" fill="#0f2e43"/><rect x="0" y="250" width="640" height="110" fill="#0c2639"/>
            <path class="a-flow" style="--fx:26px; --dur:6s" d="M 0,58 q 40,-5 80,0 q 40,5 80,0 q 40,-5 80,0 q 40,5 80,0 q 40,-5 80,0 q 40,5 80,0 q 40,-5 80,0 q 40,5 80,0" fill="none" stroke="#7fc4d0" stroke-width="2" opacity=".6"/>
            <g font-family="JetBrains Mono" font-size="10" fill="#8fa9b2"><line x1="600" y1="70" x2="600" y2="330" stroke="#3a545f" stroke-width="1.4"/><line x1="594" y1="80" x2="606" y2="80" stroke="#3a545f"/><text x="612" y="84">0 m · 1 atm</text><line x1="594" y1="160" x2="606" y2="160" stroke="#3a545f"/><text x="612" y="164">10</text><line x1="594" y1="240" x2="606" y2="240" stroke="#3a545f"/><text x="612" y="244">20</text><line x1="594" y1="320" x2="606" y2="320" stroke="#3a545f"/><text x="612" y="324">30</text></g>
            <g><circle cx="90" cy="300" r="13" fill="#dcebee"/><rect x="74" y="313" width="34" height="20" rx="8" fill="#5ea3b0"/><rect x="104" y="308" width="10" height="22" rx="4" fill="#3a545f"/><g fill="#cfe4ea" opacity=".8"><circle class="a-rise" style="--rise:-210px; --wob:6px; --dur:5s" cx="96" cy="288" r="3"/><circle class="a-rise" style="--rise:-215px; --wob:5px; --dur:6s; --delay:1.6s" cx="102" cy="290" r="2.4"/><circle class="a-rise" style="--rise:-205px; --wob:7px; --dur:5.5s; --delay:3.2s" cx="90" cy="286" r="3.4"/></g><text x="90" y="352" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="#8fa9b2">model sample: 1.0 L at 4 atm</text></g>
            <g class="a-float" style="--fy:-3px; --tilt:1.5deg; --dur:3.2s"><circle :cy="80 + depth*8" :r="14 * Math.cbrt(4/(1 + depth/10))" cx="330" fill="#ffd27e" fill-opacity=".85" stroke="#ffe4b0" stroke-width="2"/><line x1="330" :y1="80 + depth*8 + 14 * Math.cbrt(4/(1 + depth/10))" x2="330" :y2="80 + depth*8 + 14 * Math.cbrt(4/(1 + depth/10)) + 12" stroke="#ffe4b0" stroke-width="1.6"/><text :y="80 + depth*8 + 4" x="330" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#172d3b" font-weight="700" x-text="(4/(1 + depth/10)).toFixed(2) + ' L'"></text></g>
            <g font-family="JetBrains Mono"><rect x="24" y="72" width="180" height="76" rx="10" fill="#132630" stroke="#2c414d"/><text x="40" y="96" font-size="10" fill="#8fa9b2">BOYLE'S LAW MODEL</text><text x="40" y="116" font-size="12" fill="#7fc4d0" x-text="'P = ' + (1 + depth/10).toFixed(1) + ' atm'"></text><text x="40" y="136" font-size="12" fill="#ffd27e" x-text="'V = ' + (4/(1 + depth/10)).toFixed(2) + ' L'"></text><text x="128" y="126" font-size="10" fill="#8fd9ae">PV = 4.0 L·atm</text></g>
            <g x-show="step===2"><g class="a-float" style="--dur:3s"><rect x="225" y="72" width="210" height="26" rx="13" fill="#132630" stroke="#ff9a82"/><text x="330" y="89" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#ff9a82" font-weight="700">BREATHE NORMALLY ON ASCENT</text></g></g>
          </svg>
`
};
