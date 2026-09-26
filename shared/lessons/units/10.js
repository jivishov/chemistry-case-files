export default {
  "number": 10,
  "title": "Thermochemistry",
  "question": "How can a temperature change reveal an energy transfer?",
  "intro": "Temperature is not the same as heat, and a warm object does not tell you its energy transfer without more information. This unit connects system boundaries, energy conservation, specific heat, calorimetry, and the interpretation of food energy.",
  "sections": [
    {
      "id": "laws",
      "title": "Choose a system and follow the energy",
      "objective": "Explain the zeroth, first, second, and third laws using appropriate everyday examples.",
      "body": "<p>The <strong>system</strong> is the matter or process you choose to study; everything else is the surroundings. Heat is energy transferred because of a temperature difference. Temperature describes thermal state rather than the total energy an object contains. A large warm bath and a small hot spoon can have very different energy-transfer capacities.</p><p>The <strong>zeroth law</strong> says that systems each in thermal equilibrium with a third are in equilibrium with each other; it underlies thermometer comparisons. The <strong>first law</strong> expresses energy conservation. With q positive into the system and w positive for work done on it, <eq>ΔU = q + w</eq>. Energy transferred out of one object must go somewhere.</p><p>The <strong>second law</strong> says total entropy does not decrease for an isolated system. Spontaneous heat transfer goes from hotter to colder matter; a refrigerator transfers heat in the reverse direction by using work and releasing additional heat to its surroundings. The <strong>third law</strong> assigns zero entropy to an ideal perfect crystal at 0 K. A related classroom consequence is that absolute zero cannot be reached by a finite sequence of cooling operations. This is the third-law idea assessed in the mission. It does not mean ordinary particles simply stop having all quantum motion.</p>",
      "simple": "Define what you are tracking. Energy is conserved, and spontaneous thermal change has a direction.",
      "analogy": "An account ledger tracks transfers across a boundary. It helps express conservation, but energy is not a substance stored as coins, and entropy is not a second kind of money.",
      "example": "A thermometer settles at the sample’s temperature through thermal equilibrium. An insulated warm metal sample cools while nearby water warms; the energy leaving the metal must appear in water, the container, or another included part of the system.",
      "sources": [
        "17.2",
        "os-zeroth",
        "os-first",
        "os-entropy",
        "os-thermolaws"
      ],
      "teks": [
        "C.13(A)"
      ]
    },
    {
      "id": "exo",
      "title": "Exothermic and endothermic describe the system",
      "objective": "Classify heat transfer and interpret thermochemical equations and energy diagrams.",
      "body": "<p>An <strong>exothermic</strong> process releases energy as heat from the chosen system; q for that system is negative. An <strong>endothermic</strong> process absorbs heat; q is positive. At constant pressure, heat transfer equals enthalpy change under the usual chemistry assumptions. An exothermic reaction has ΔH &lt; 0 and products at lower enthalpy than reactants. An endothermic reaction has ΔH &gt; 0 and products higher.</p><p>An energy diagram’s horizontal coordinate is reaction progress, not necessarily time. The activation-energy barrier is different from the reactant-to-product energy difference. Even an exothermic reaction may need initial energy to start. A catalyst can lower a reaction barrier without changing the overall ΔH.</p><p>Breaking bonds requires energy; making bonds releases it. A process is exothermic when the releases outweigh the costs. Dissolving can be exothermic or endothermic depending on competing interactions. Select a warming or cooling pack using the stated process and system, not the assumption that all dissolving releases heat.</p>",
      "simple": "A warming pack releases heat to its surroundings; a cooling pack absorbs it. The sign belongs to the system you named.",
      "analogy": "Walking over a hill can finish lower than the starting point while still requiring an initial climb. The hill represents a barrier, while the start-to-finish height represents net change.",
      "example": "If the reaction system releases 15 kJ into water and other transfers are neglected:<eq>q_reaction = −15 kJ</eq><eq>q_water = +15 kJ</eq>The signs differ because the system boundaries differ.",
      "sources": [
        "17.1",
        "17.3",
        "17.6",
        "17.8",
        "17.13"
      ],
      "teks": [
        "C.13(C)"
      ]
    },
    {
      "id": "heat",
      "title": "Calculate heat with q = mcΔT",
      "objective": "Solve for heat, mass, specific heat, or temperature change with consistent units.",
      "body": "<p>Within one phase, with approximately constant specific heat:</p><eq>q = mcΔT; ΔT = T_final − T_initial</eq><p>With mass m in grams and specific heat c in J/(g·°C), q is in joules. A 1 °C temperature difference equals a 1 K difference; the absolute scales are not identical.</p><p><strong>Specific heat</strong> is energy per unit mass per degree. Water near room temperature has c ≈ 4.184 J/(g·°C). Different materials need different heat inputs for the same mass and temperature change. Rearrange as needed:</p><eq>ΔT = q/(mc); m = q/(cΔT); c = q/(mΔT)</eq><p>This equation alone cannot describe a phase change. At equilibrium melting or boiling conditions, energy can change phase with little temperature change. The mission assumes a stated warming model; it does not establish a medical rewarming procedure.</p>",
      "simple": "The required heat depends on how much material you have, its specific heat, and the temperature change.",
      "analogy": "Some containers require more water to raise their level by one centimeter. Similarly, different heat capacities require different energy transfers for one degree, although temperature is not a liquid level.",
      "example": "Warm 100.0 g water from 20.0 to 25.0 °C:<eq>ΔT = 25.0 − 20.0 = 5.0 °C</eq><eq>q = 100.0 × 4.184 × 5.0 = 2,092 J</eq><eq>q ≈ 2.1 kJ after rounding</eq>Cooling through the same interval makes q negative.",
      "sources": [
        "17.4",
        "17.5",
        "17.10"
      ],
      "teks": [
        "C.13(D)"
      ]
    },
    {
      "id": "calorimeter",
      "title": "Use conservation to interpret a calorimeter",
      "objective": "Connect heat lost and gained and calculate a final equilibrium temperature under a stated model.",
      "body": "<p>A calorimeter measures energy transfer. For two materials in an ideal insulated system with negligible container heat capacity:</p><eq>q_hot + q_cold = 0</eq><eq>m₁c₁(T_f − T₁) + m₂c₂(T_f − T₂) = 0</eq><eq>T_f = (m₁c₁T₁ + m₂c₂T₂)/(m₁c₁ + m₂c₂)</eq><p>Without added energy, reactions, or phase changes, the final temperature lies between the initial temperatures. This is a heat-capacity-weighted mean. Equal masses do not ensure equal temperature changes when specific heats differ.</p><p>A real calorimeter absorbs heat and may exchange energy with the environment. Include its calibrated heat capacity when supplied:</p><eq>q_cal = C_calΔT</eq><p>Define the included parts before inferring reaction heat from a temperature rise.</p>",
      "simple": "Energy leaving the hot part enters the colder parts. Include the container when its heat capacity matters.",
      "analogy": "Balancing two connected accounts requires counting every destination of a transfer. Omitting the container is like omitting one account from the balance sheet.",
      "example": "Mix equal masses of water at 60 °C and 20 °C in an ideal insulated container:<eq>T_f = (60 + 20)/2 = 40 °C</eq>With three times as much cold water:<eq>T_f = (60 + 3 × 20)/4 = 30 °C</eq>",
      "sources": [
        "17.7",
        "17.5"
      ],
      "teks": [
        "C.13(B)",
        "C.13(D)"
      ]
    },
    {
      "id": "food",
      "title": "From joules to food Calories",
      "objective": "Convert energy units and distinguish combustion energy from a food-label estimate.",
      "body": "<p>One thermochemical calorie is 4.184 J. One food Calorie, written with a capital C, is one kilocalorie: <eq>1 Cal = 1 kcal = 4.184 kJ</eq>. Confusing calories and Calories creates a factor-of-1,000 error.</p><p>Bomb calorimetry measures combustion energy in a rigid apparatus. Water and hardware gain energy released by the sample. A constant-volume bomb measures internal-energy change under its conditions, whereas constant-pressure heat corresponds to enthalpy change under the usual assumptions. Introductory exercises may explicitly neglect the hardware.</p><p>A nutrition label need not come from burning that particular food sample. Energy is commonly estimated using nutrient quantities and factors such as about 4 kcal/g for protein or carbohydrate and 9 kcal/g for fat, with relevant adjustments. Metabolizable food energy is not identical to total combustion energy. The case’s water-heating question assesses calorimetry and unit conversion, not a complete food-label calculation.</p>",
      "simple": "Convert joules to food Calories carefully, and distinguish a calorimeter measurement from an estimate of usable food energy.",
      "analogy": "A fuel’s total stored energy and the useful energy delivered by an engine are different quantities. Similarly, combustion and metabolism do not have identical outcomes.",
      "example": "A hypothetical sample transfers 8.368 kJ to the included calorimeter parts:<eq>8.368 kJ × (1 kcal / 4.184 kJ) = 2.000 kcal</eq><eq>Measured energy = 2.000 food Calories</eq>A nutrition-label value requires additional information.",
      "sources": [
        "17.7",
        "17.14",
        "fda-labels"
      ],
      "teks": [
        "C.13(B)"
      ]
    }
  ],
  "visual": {
    "title": "Watch heat move toward equilibrium",
    "instruction": "Choose the starting temperature of the hot water. Play the exchange with an equal mass of water initially at 20 °C.",
    "observe": "Both samples contain 100 g water with the same specific heat. At each animation step, one loses the amount of energy that the other gains. The illustrated progression is not a physical time prediction.",
    "challenge": "Why do the two temperature changes have equal magnitudes in this example?",
    "explanation": "Their masses and specific heats are equal. The final temperature is their initial mean. With unequal heat capacities, the temperature changes would differ. The container is treated as insulated with negligible heat capacity."
  },
  "honors": [
    {
      "id": "hess",
      "title": "Build an energy route with Hess’s law",
      "mode": "calorimeter",
      "body": "Enthalpy is a state function. Adding reaction steps adds their enthalpy changes. Reverse a reaction and reverse the sign of ΔH; multiply a reaction and multiply ΔH by the same factor. Cancel intermediates and check the target. For configured practice steps:<eq>A → B; ΔH = +40 kJ</eq><eq>B → C; ΔH = −65 kJ</eq><eq>A → C; ΔH = +40 − 65 = −25 kJ</eq>",
      "question": "What is ΔH for C → A in this example?",
      "answer": "+25 kJ. Reversing the target reverses the sign. The letters and energies are a practice model, not measured reactions.",
      "sources": [
        "17.15"
      ],
      "teks": [
        "C.13(C)"
      ]
    },
    {
      "id": "formation",
      "title": "Calculate reaction enthalpy from formation data",
      "mode": "calorimeter",
      "body": "Use balanced coefficients ν and preserve phase labels:<eq>ΔH°_reaction = ΣνΔH°_f(products) − ΣνΔH°_f(reactants)</eq>Elemental standard reference states have zero formation enthalpy by convention; other forms or phases need not. For this reaction:<eq>C(graphite) + O₂(g) → CO₂(g)</eq><eq>ΔH° = −393.5 − (0 + 0) = −393.5 kJ</eq>This is per mole of CO₂ formed. Doubling the equation doubles its enthalpy change.",
      "question": "Why must liquid water and water vapor not be exchanged silently in this calculation?",
      "answer": "They have different formation enthalpies. Vaporization requires energy, so a phase change alters the reaction enthalpy.",
      "sources": [
        "17.16",
        "17.17"
      ],
      "teks": [
        "C.13(C)"
      ]
    }
  ],
  "checks": [
    {
      "question": "A sample absorbs heat and warms. What is the sign of q for that sample?",
      "options": [
        "Positive",
        "Negative",
        "Always zero"
      ],
      "answer": 0,
      "why": "Heat entering the defined system is positive.",
      "section": "exo"
    },
    {
      "question": "How much energy is one food Calorie?",
      "options": [
        "4.184 J",
        "4.184 kJ",
        "1,000 kJ"
      ],
      "answer": 1,
      "why": "A food Calorie is a kilocalorie, or 4.184 kJ.",
      "section": "food"
    }
  ],
  "assessment": [
    [
      "laws",
      "Read the situation",
      [
        "laws"
      ],
      "Identify the thermodynamic principle in a situation."
    ],
    [
      "pack",
      "Pick the pack",
      [
        "exo"
      ],
      "Classify energy direction and choose a process."
    ],
    [
      "warm",
      "Size the heat",
      [
        "heat"
      ],
      "Solve q = mcΔT with appropriate signs and units."
    ],
    [
      "calorimeter",
      "Calorimetry",
      [
        "calorimeter"
      ],
      "Track heat lost and gained."
    ],
    [
      "capstone",
      "Evidence check",
      [
        "laws",
        "exo",
        "heat",
        "calorimeter"
      ],
      "Evaluate a claim from an energy budget and observations."
    ],
    [
      "casefile",
      "Calories and calorimetry",
      [
        "heat",
        "food"
      ],
      "Calculate water heat gain and convert to food Calories."
    ]
  ],
  "caseNote": "The case calculation explicitly uses a simplified water-only calorimeter. Real measurements include hardware calibration and heat-loss corrections. Food labels commonly use nutrient-based energy estimates rather than direct combustion of every product.",
  "glossary": [
    [
      "System",
      "The part of the universe selected for analysis."
    ],
    [
      "Surroundings",
      "Everything outside the selected system."
    ],
    [
      "Heat",
      "Energy transferred because of a temperature difference."
    ],
    [
      "Thermal equilibrium",
      "A state with no net heat transfer due to a temperature difference."
    ],
    [
      "Specific heat",
      "Energy required per unit mass per degree of temperature change."
    ],
    [
      "Exothermic",
      "Releasing heat from the system."
    ],
    [
      "Endothermic",
      "Absorbing heat into the system."
    ],
    [
      "Enthalpy",
      "A state function whose change relates to constant-pressure heat."
    ],
    [
      "Entropy",
      "A state function related to accessible microscopic arrangements and energy dispersal."
    ],
    [
      "Calorimeter",
      "An apparatus for measuring heat transfer."
    ],
    [
      "Food Calorie",
      "One kilocalorie, equal to 4.184 kJ."
    ],
    [
      "Hess’s law",
      "Reaction enthalpies add when reaction equations are combined."
    ]
  ],
  "skills": {
    "a": [
      "laws"
    ],
    "b": [
      "calorimeter"
    ],
    "c": [
      "exo"
    ],
    "d": [
      "heat"
    ],
    "h1": [
      "honors-hess"
    ],
    "h2": [
      "honors-formation"
    ],
    "cap": [
      "laws",
      "exo",
      "heat",
      "calorimeter"
    ]
  }
};
