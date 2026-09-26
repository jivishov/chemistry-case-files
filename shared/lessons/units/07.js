export default {
  "number": 7,
  "title": "Gas Laws & Kinetic Theory",
  "question": "How do moving particles connect pressure, volume, temperature, and amount?",
  "intro": "A gas looks empty, yet its particles continuously strike their surroundings. The gas laws describe measurable patterns in those collisions. You will connect a particle model to equations and distinguish a calculated prediction from the behavior of a real gas.",
  "sections": [
    {
      "id": "kmt",
      "title": "Pressure comes from particle collisions",
      "objective": "Use kinetic molecular theory to explain gas behavior and identify ideal-gas assumptions.",
      "body": "<p>In the ideal-gas model, particles move continually in random directions. Their own volumes are negligible compared with the container volume, attractions between them are neglected, and collisions conserve total kinetic energy. Pressure is force per area arising from momentum transfer when particles strike the walls.</p><p>For an ideal gas, average translational kinetic energy per particle is proportional to absolute temperature. Temperature and energy have different units. At higher temperature, particles of the same gas move faster on average, although they have a distribution of speeds. Particles do not all move at one speed, and heating does not make the molecules themselves grow. Gases expand mainly because spacing changes.</p><p>At constant amount and temperature, compressing a gas increases wall-collision frequency and pressure. In a rigid sealed container, heating increases pressure. At fixed pressure and amount, warming usually expands the gas. State which variables remain constant before predicting a change.</p>",
      "simple": "Change particle amount, spacing, or motion, and the pressure or volume can change.",
      "analogy": "Many balls bouncing off a wall suggest how repeated impacts create a force. The analogy omits molecular-scale interactions and does not mean gas particles are macroscopic rubber balls.",
      "example": "Halve a container’s volume while holding amount and temperature fixed. In the ideal model, pressure doubles. The particles remain the same size, and their average kinetic energy is unchanged.",
      "sources": [
        "14.1",
        "14.2",
        "14.11"
      ],
      "teks": [
        "C.10(A)"
      ]
    },
    {
      "id": "laws",
      "title": "Use kelvin and name the constants",
      "objective": "Apply Boyle’s, Charles’s, Gay-Lussac’s, Avogadro’s, and the combined gas law under their stated conditions.",
      "body": "<p>Temperature ratios require absolute temperature. Kelvin starts at absolute zero: 300 K is twice 150 K, but 30 °C is not twice 15 °C. Use absolute pressure, not a gauge reading above atmospheric pressure.</p><eq label=\"Temperature conversion\">T(K) = T(°C) + 273.15</eq><p>Choose the law by what stays fixed:</p><eq label=\"Boyle · fixed n and T\">P₁V₁ = P₂V₂</eq><eq label=\"Charles · fixed n and P\">V₁/T₁ = V₂/T₂</eq><eq label=\"Gay-Lussac · fixed n and V\">P₁/T₁ = P₂/T₂</eq><eq label=\"Avogadro · fixed P and T\">V₁/n₁ = V₂/n₂</eq><eq label=\"Combined · fixed n\">P₁V₁/T₁ = P₂V₂/T₂</eq><p>Predict the direction first. Equal-pressure comparisons and pressure-ratio comparisons are different problems.</p>",
      "simple": "Choose a law by identifying what stays fixed. Always use absolute temperature in ratios.",
      "analogy": "A relationship between travel time and speed works only when distance is fixed. Gas-law relationships also depend on explicitly controlled conditions.",
      "example": "A sealed flexible sample is 2.00 L at 300 K. At the same pressure and 330 K:<eq>V₂ = V₁(T₂/T₁)</eq><eq>V₂ = 2.00 L × (330 K / 300 K) = 2.20 L</eq>If pressure also changes, this calculation alone is incomplete.",
      "sources": [
        "14.3",
        "14.4",
        "14.5",
        "14.6",
        "14.7",
        "3.7"
      ],
      "teks": [
        "C.10(B)"
      ]
    },
    {
      "id": "ideal",
      "title": "One equation connects four variables",
      "objective": "Solve PV = nRT using compatible units and assess whether the result is reasonable.",
      "body": "<p>The ideal-gas equation connects pressure, volume, amount, and absolute temperature:</p><eq>PV = nRT</eq><p>Match the gas constant to your units:</p><eq>R ≈ 0.08206 L·atm/(mol·K)</eq><eq>R ≈ 8.314 J/(mol·K) for Pa and m³</eq><p>Rearrange before substituting:</p><eq>P = nRT/V; V = nRT/P</eq><eq>n = PV/(RT); T = PV/(nR)</eq><p>The calculation assumes one gas phase and the ideal model. Particle volume and intermolecular attractions matter especially at high pressure or low temperature. Near condensation, neglecting attractions is unreliable.</p>",
      "simple": "The ideal-gas law connects pressure, volume, amount, and absolute temperature; units determine which R to use.",
      "analogy": "A four-way balance can be maintained by changing more than one quantity. Looking at one variable without the others misses the relationship.",
      "example": "For 0.500 mol at 300 K in 10.0 L:<eq>P = (0.500 × 0.08206 × 300)/10.0</eq><eq>P ≈ 1.23 atm</eq>Doubling n in the same rigid container at unchanged T doubles P, not molecule size.",
      "sources": [
        "14.8",
        "14.11"
      ],
      "teks": [
        "C.10(B)"
      ]
    },
    {
      "id": "dalton",
      "title": "Gas mixtures share a total pressure",
      "objective": "Calculate partial pressures using mole fractions and sum contributions in an ideal mixture.",
      "body": "<p><strong>Partial pressure</strong> is the pressure a component would exert alone at the mixture’s temperature and volume. For an ideal mixture:</p><eq>P<sub>total</sub> = ΣPᵢ</eq><eq>xᵢ = nᵢ/n<sub>total</sub>; Pᵢ = xᵢP<sub>total</sub></eq><p>Mole fractions sum to one; partial pressures sum to total pressure. Particles mix throughout the same space, not in separate compartments.</p><p>At one temperature, all gases have the same average translational kinetic energy; lighter molecules have greater typical speeds. For the final-fill mission, calculate total and component pressures and compare every supplied limit. Composition percentage alone is insufficient.</p>",
      "simple": "Each gas contributes to pressure. Its contribution depends on its fraction of the total particle amount.",
      "analogy": "Several groups applauding in one room contribute to a total sound, although partial pressure is a precise particle relationship and sound loudness is not simply the same kind of sum.",
      "example": "Mix 0.20 mol O₂ and 0.80 mol N₂ at 2.50 atm:<eq>x(O₂) = 0.20/(0.20 + 0.80) = 0.20</eq><eq>P(O₂) = 0.20 × 2.50 = 0.50 atm</eq><eq>P(N₂) = 0.80 × 2.50 = 2.00 atm</eq>Doubling total pressure at the same composition doubles each partial pressure.",
      "sources": [
        "14.12",
        "14.14"
      ],
      "teks": [
        "C.10(C)"
      ]
    },
    {
      "id": "ascent",
      "title": "Transfer the model to an ascent",
      "objective": "Explain a pressure–volume change while identifying the assumptions and limits of the model.",
      "body": "<p>In the scuba case, surrounding pressure decreases as a diver ascends. A trapped amount of gas at approximately constant temperature tends to occupy more volume as external pressure falls. Boyle’s law predicts the unconstrained volume change, not the actual shape or capacity of a human lung.</p><p>For a model balloon rising from 4.0 atm to 1.0 atm at fixed temperature, an initial 0.50 L would tend toward 2.0 L. That prediction explains why trapped gas expansion can cause injury. Actual dive planning also involves ascent procedures and dissolved gases; a single gas-law calculation does not establish a safe dive.</p>",
      "simple": "Lower pressure permits a fixed amount of gas to expand. A flexible-body limit is not included in the equation.",
      "analogy": "The gas is like a spring permitted to extend when outside force decreases. Unlike a spring, its pressure also depends on temperature and particle number.",
      "example": "For the model balloon at constant n and T:<eq>P₁V₁ = P₂V₂</eq><eq>V₂ = P₁V₁/P₂ = (4.0 atm × 0.50 L)/1.0 atm</eq><eq>V₂ = 2.0 L</eq>Lowering P₂ increases V₂. The case-file question uses different numbers.",
      "sources": [
        "14.3",
        "dan-expansion"
      ],
      "teks": [
        "C.10(B)"
      ]
    }
  ],
  "visual": {
    "title": "Watch pressure respond to compression",
    "instruction": "Change volume while 0.500 mol and 300 K stay fixed. Predict the effect of halving volume, then play the volume comparison.",
    "observe": "The piston changes the modeled space. Pressure is calculated from PV = nRT. The illustrated particle count is a sample of the population, not 0.500 mol drawn individually.",
    "challenge": "Compare 20.0 L and 10.0 L. Why does pressure change even though temperature does not?",
    "explanation": "The same particles encounter the walls more frequently in a smaller space. In this ideal model, pressure doubles; average kinetic energy stays fixed."
  },
  "honors": [
    {
      "id": "speeds",
      "title": "Speed is not the same as kinetic energy",
      "mode": "kmt",
      "body": "A Maxwell–Boltzmann distribution represents a range of molecular speeds. Higher temperature shifts and broadens it toward higher speed. At equal temperature, lighter particles are typically faster, but average translational kinetic energy is equal:<eq>⟨KE⟩ = 3kT/2</eq><eq>Typical speed ∝ √(T/m)</eq>Here m is particle mass.",
      "question": "At the same temperature, does helium have greater average translational kinetic energy than nitrogen?",
      "answer": "No. Helium has a greater typical speed because of its smaller particle mass, but the same average translational kinetic energy.",
      "sources": [
        "14.15",
        "14.11"
      ],
      "teks": [
        "C.10(A)"
      ]
    },
    {
      "id": "real",
      "title": "Correct an ideal prediction",
      "mode": "ideal",
      "body": "The van der Waals model adds finite particle volume and attraction:<eq>P = nRT/(V − nb) − a(n/V)²</eq>The b parameter reduces available volume; a represents attraction. Use gas-specific constants with compatible units and require V > nb. The compressibility factor is:<eq>Z = PV/(nRT)</eq>An ideal gas has Z = 1. Deviations describe failure of that ideal relationship.",
      "question": "Can attractions and excluded volume push pressure in opposite directions?",
      "answer": "Yes. The attraction term lowers pressure; the reduced available-volume term raises it. Their relative importance depends on the state and gas.",
      "sources": [
        "14.11",
        "os-real"
      ],
      "teks": [
        "C.10(B)",
        "C.2(A)"
      ]
    },
    {
      "id": "wet-gas",
      "title": "Collected gas may include water vapor",
      "mode": "dalton",
      "body": "For gas collected over water after temperature and pressure equilibration:<eq>P_total = P_dry gas + P_water vapor</eq>Use water-vapor pressure at that temperature before calculating dry-gas moles. With total pressure 100.0 kPa and water vapor 3.2 kPa:<eq>P_dry gas = 100.0 − 3.2 = 96.8 kPa</eq>",
      "question": "What error results from using the total pressure to count dry-gas moles?",
      "answer": "The calculation overestimates dry-gas amount by assigning water vapor’s pressure to the dry gas.",
      "sources": [
        "14.13"
      ],
      "teks": [
        "C.10(C)"
      ]
    }
  ],
  "checks": [
    {
      "question": "Which temperature belongs in PV = nRT?",
      "options": [
        "25 for a sample at 25 °C",
        "298.15 for a sample at 25 °C",
        "Any temperature scale if it is used consistently"
      ],
      "answer": 1,
      "why": "Absolute temperature in kelvin is required.",
      "section": "laws"
    },
    {
      "question": "At fixed amount and temperature, volume doubles. What happens to ideal pressure?",
      "options": [
        "It doubles",
        "It halves",
        "It remains unchanged"
      ],
      "answer": 1,
      "why": "PV is constant under these conditions.",
      "section": "kmt"
    }
  ],
  "assessment": [
    [
      "kmt",
      "Kinetic theory",
      [
        "kmt"
      ],
      "Explain collisions, temperature, and model assumptions."
    ],
    [
      "ideal",
      "Ideal gas law",
      [
        "laws",
        "ideal"
      ],
      "Calculate a gas variable with compatible units."
    ],
    [
      "dalton",
      "Partial pressures",
      [
        "dalton"
      ],
      "Calculate component pressures from composition."
    ],
    [
      "capstone",
      "The last fill",
      [
        "ideal",
        "dalton"
      ],
      "Check total and component quantities against the mission rules."
    ],
    [
      "casefile",
      "The scuba ascent rule",
      [
        "laws",
        "ascent"
      ],
      "Predict trapped-gas expansion and explain the model’s limits."
    ]
  ],
  "caseNote": "The case assessment is an application of Boyle’s law with a fixed amount and approximately constant temperature. Its calculated volume is the gas’s unconstrained demand, not a prediction that lungs can safely expand to that size.",
  "glossary": [
    [
      "Pressure",
      "Force per unit area."
    ],
    [
      "Absolute pressure",
      "Pressure measured relative to a vacuum."
    ],
    [
      "Kelvin",
      "The absolute temperature scale used in gas equations."
    ],
    [
      "Ideal gas",
      "A model with negligible particle volume and neglected attractions."
    ],
    [
      "Kinetic energy",
      "Energy associated with motion."
    ],
    [
      "Partial pressure",
      "One gas component’s contribution to total pressure."
    ],
    [
      "Mole fraction",
      "Component moles divided by total moles."
    ],
    [
      "Real gas",
      "A gas whose finite particle size and interactions can matter."
    ],
    [
      "Compressibility factor",
      "Z = PV/nRT, a measure of deviation from ideal behavior."
    ]
  ],
  "skills": {
    "a": [
      "kmt"
    ],
    "b": [
      "laws",
      "ideal"
    ],
    "c": [
      "dalton"
    ],
    "h1": [
      "honors-speeds"
    ],
    "h2": [
      "honors-real"
    ],
    "h3": [
      "honors-wet-gas"
    ],
    "cap": [
      "ideal",
      "dalton"
    ]
  }
};
