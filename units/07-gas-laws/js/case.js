import { DIVING_SCENE } from './diving-scene.js';

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
  stage: DIVING_SCENE
};
