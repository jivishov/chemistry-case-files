export default {
  "number": 6,
  "title": "Reactions & Stoichiometry",
  "question": "How can a balanced equation predict how much material a reaction needs and produces?",
  "intro": "A chemical equation is a conservation statement and a quantitative recipe. You will balance and classify reactions, convert between chemical amounts, identify the limiting reactant, and compare predicted production with actual yield.",
  "sections": [
    {
      "id": "balance",
      "title": "Conserve atoms without changing substances",
      "objective": "Write and balance equations using the smallest whole-number coefficients.",
      "body": "<p>A reaction rearranges atoms into new combinations. Reactants appear before the arrow and products after it. State symbols specify solid (s), liquid (l), gas (g), or dissolved in water (aq). In an ordinary chemical reaction, atoms of each element are conserved.</p><p>Balance an equation by changing <strong>coefficients</strong>, which multiply entire formulas. Do not alter a formula’s subscripts: changing H₂O to H₂O₂ replaces water with a different substance. Count each element on both sides, adjust coefficients, recount, and reduce all coefficients to their smallest whole-number ratio. Parentheses matter: one Ca(OH)₂ contains two O and two H atoms.</p><p>Mass is conserved in a closed system. A reaction that makes a gas can appear to lose mass in an open beaker because gas leaves the measured system. That observation does not mean atoms disappeared.</p>",
      "simple": "Rearrange the particle counts, not the identities of the substances.",
      "analogy": "Building new objects from a fixed box of construction pieces changes their arrangement without creating extra pieces. The analogy captures atom accounting, not reaction mechanisms.",
      "example": "Start with the unbalanced skeleton:<eq>H₂ + O₂ → H₂O</eq>Place 2 before water to match oxygen, then 2 before H₂ to match hydrogen:<eq>2H₂ + O₂ → 2H₂O</eq>Each side now has four H and two O atoms.",
      "sources": [
        "11.1",
        "11.2",
        "11.3",
        "4.2"
      ],
      "teks": [
        "C.9(A)"
      ]
    },
    {
      "id": "classify",
      "title": "Two ways to classify a reaction",
      "objective": "Recognize structural reaction patterns and distinguish precipitation, acid–base, and redox processes.",
      "body": "<p>Structural patterns include <strong>combination</strong> (synthesis: joining), <strong>decomposition</strong> (splitting), <strong>single replacement</strong> (an element exchanges with an ion), and <strong>double replacement</strong> (compounds exchange partners). A typical hydrocarbon burns completely in sufficient O₂ to form CO₂ and H₂O.</p><p>Behavior categories overlap: <strong>precipitation</strong> forms a poorly soluble solid; <strong>acid–base</strong> transfers a proton; <strong>redox</strong> changes oxidation states. Combustion is redox; double replacement may be precipitation or acid–base. Oxidation loses electrons; reduction gains them, simultaneously.</p><p><strong>Oxidation numbers</strong> sum to the species’ charge. Free elements have 0; monatomic ions have their charge. Here H is usually +1; O usually −2, except −1 in peroxides. An increase means oxidation; a decrease reduction:</p><eq>2H₂O₂ → 2H₂O + O₂</eq><p>O changes from −1 to both −2 and 0: the reactant is both reduced and oxidized. These are formal accounting values, not measured atom charges. Use states and transfer evidence alongside formula patterns.</p>",
      "simple": "One label describes the equation’s pattern; another describes what the particles are doing.",
      "analogy": "A book can be both a novel and a mystery. A reaction likewise can have both a structural and a behavior category.",
      "example": "These aqueous examples can carry overlapping labels:<eq label=\"Precipitation / double replacement\">AgNO₃ + NaCl → AgCl(s) + NaNO₃</eq><eq label=\"Acid–base / double replacement\">HCl + NaOH → NaCl + H₂O(l)</eq><eq label=\"Redox\">Zn(s) + Cu²⁺ → Zn²⁺ + Cu(s)</eq>Unmarked species are aqueous.",
      "sources": [
        "11.4",
        "11.5",
        "11.6",
        "11.7",
        "11.9",
        "21.16",
        "os-classify"
      ],
      "teks": [
        "C.9(A)",
        "C.9(B)"
      ]
    },
    {
      "id": "stoich",
      "title": "Follow the mass–mole–ratio–mass path",
      "objective": "Calculate reaction quantities, including gas volumes at stated conditions.",
      "body": "<p><strong>Stoichiometry</strong> connects amounts through a balanced equation. Convert known mass to moles, apply the coefficient ratio, and convert to the desired unit. Label the substance with each mol unit.</p><p>At the mission’s 0 °C and 1 atm convention, one mole of ideal gas occupies about 22.4 L. At other conditions use:</p><eq>PV = nRT</eq><p>Coefficients do not directly compare grams because molar masses differ. They compare ideal-gas volumes only at equal temperature and pressure.</p><p>The airbag case models gas generation with a historical sodium-azide reaction. Its proportions alone cannot specify inflator design, which also requires kinetics, temperature control, and hazardous-byproduct treatment. Modern inflators may use other chemistry.</p>",
      "simple": "Go through moles whenever you move from one substance to another.",
      "analogy": "If a recipe is counted in batches, first convert your ingredient supply into batches before predicting the number of finished items.",
      "example": "For 2H₂ + O₂ → 2H₂O with sufficient oxygen:<eq>n(H₂) = 6.00 g / (2.016 g/mol) ≈ 2.976 mol</eq><eq>n(H₂O) = 2.976 × (2/2) = 2.976 mol</eq><eq>m(H₂O) ≈ 2.976 × 18.02 = 53.6 g</eq>The product mass includes oxygen from the other reactant.",
      "sources": [
        "12.2",
        "12.3",
        "12.4",
        "12.6",
        "nhtsa-airbags"
      ],
      "teks": [
        "C.9(C)"
      ]
    },
    {
      "id": "limiting",
      "title": "Which reactant runs out first?",
      "objective": "Identify the limiting reactant and calculate theoretical yield and leftover excess.",
      "body": "<p>The <strong>limiting reactant</strong> is consumed first under the assumed complete reaction and limits product formation. Comparing starting grams is unreliable. Convert each reactant to moles and divide by its coefficient, or calculate the product each could make separately. The smaller reaction extent or product amount controls the theoretical yield.</p><p>The <strong>excess reactant</strong> is present beyond the required proportion. Find how much reacts using the limiting reactant and the balanced equation, then subtract the amount used from the amount supplied. A leftover amount cannot be negative in a consistent calculation. The particle picture and the numerical calculation must conserve every kind of atom.</p>",
      "simple": "The ingredient that supports fewer complete reaction batches sets the maximum product.",
      "analogy": "Ten wheels and three bicycle frames can make only three two-wheel bicycles. Wheels remain because frames limit production. Chemical batches need not be literal bundles at the macroscopic scale.",
      "example": "Start with 5.0 mol H₂ and 2.0 mol O₂ for 2H₂ + O₂ → 2H₂O. Divide by coefficients:<eq>H₂: 5.0/2 = 2.5; O₂: 2.0/1 = 2.0</eq>Oxygen limits the reaction: 4.0 mol H₂ reacts and 4.0 mol H₂O forms.<eq>H₂ remaining = 5.0 − 4.0 = 1.0 mol</eq>",
      "sources": [
        "12.7",
        "12.8"
      ],
      "teks": [
        "C.9(D)"
      ]
    },
    {
      "id": "yield",
      "title": "Prediction, observation, and the final decision",
      "objective": "Calculate percent yield and explain why actual production may differ from a theoretical result.",
      "body": "<p>Theoretical yield is the calculated maximum under specified assumptions. Actual yield is the amount collected or reported. <eq>Percent yield = actual/theoretical × 100%</eq>. Both quantities must describe the same product in compatible units. If actual yield is requested, multiply theoretical yield by the percentage expressed as a decimal.</p><p>Incomplete reaction, competing reactions, or transfer losses can reduce the collected yield. A result above 100% calls for investigation: retained solvent, contamination, or measurement errors can increase apparent mass. Do not interpret it as creating atoms. In the tanker capstone, balance and classify the reaction, calculate the required quantity, then apply the mission’s supplied inventory and acceptance rules. Keep calculated predictions distinct from measured or scenario-provided evidence.</p>",
      "simple": "A theoretical yield is a ceiling for the stated model. Percent yield compares collection with that prediction.",
      "analogy": "A plan for 100 pastries and a collection of 85 gives an 85% yield. The analogy describes recovery; chemical losses can have several different causes.",
      "example": "If 12.0 g is predicted and 9.60 g collected:<eq>Yield = (9.60/12.0) × 100% = 80.0%</eq>At a predicted recovery of 75.0%:<eq>Collected mass = 12.0 × 0.750 = 9.00 g</eq>",
      "sources": [
        "12.9"
      ],
      "teks": [
        "C.9(C)"
      ]
    }
  ],
  "visual": {
    "title": "Watch a limiting reactant stop a reaction",
    "instruction": "Choose the number of H₂ molecules available with four O₂ molecules. Predict the limiting reactant, then play the rearrangement.",
    "observe": "Every complete batch uses 2 H₂ and 1 O₂ to make 2 H₂O. The dots represent an intentionally tiny particle model. They are not a proposed real experiment.",
    "challenge": "With six H₂ and four O₂, how many water molecules form, and what remains?",
    "explanation": "Hydrogen limits the model: three batches produce six H₂O and leave one O₂. Both H and O atom counts are conserved at every completed step."
  },
  "honors": [
    {
      "id": "particles",
      "title": "Count the individual products",
      "mode": "stoich",
      "body": "Once you know product moles, multiply by Avogadro’s constant. The entity label matters: a mole of O₂ molecules contains two moles of O atoms. If 0.125 mol N₂ forms, <eq>N = 0.125 × 6.022 × 10²³ ≈ 7.53 × 10²² N₂ molecules</eq>.",
      "question": "How many nitrogen atoms are in that product?",
      "answer": "Twice the molecular count: about 1.51 × 10²³ N atoms. Multiplying by two changes the entity being counted, not the amount of material.",
      "sources": [
        "10.2",
        "12.2"
      ],
      "teks": [
        "C.9(C)"
      ]
    },
    {
      "id": "excess",
      "title": "Audit excess recovery",
      "mode": "lr",
      "body": "Consider 2.0 mol N₂ and 3.0 mol H₂ for this reaction:<eq>N₂ + 3H₂ → 2NH₃</eq>Hydrogen limits production. The reaction uses 1.0 mol N₂:<eq>N₂ remaining = 2.0 − 1.0 = 1.0 mol</eq>Subtract compatible mole amounts before converting the remainder to grams. Claimed recovery cannot exceed the available remainder in this model.",
      "question": "Would doubling only the nitrogen supply double ammonia production?",
      "answer": "No. Hydrogen still limits the reaction. Extra nitrogen increases the leftover inventory, not the theoretical ammonia yield.",
      "sources": [
        "12.7",
        "12.8"
      ],
      "teks": [
        "C.9(C)",
        "C.9(D)"
      ]
    }
  ],
  "checks": [
    {
      "question": "How should you balance an equation?",
      "options": [
        "Change subscripts until atom counts match",
        "Change coefficients without changing formulas",
        "Delete the excess atoms"
      ],
      "answer": 1,
      "why": "Subscripts define substances; coefficients change how many formula units participate.",
      "section": "balance"
    },
    {
      "question": "What identifies a limiting reactant?",
      "options": [
        "The smaller starting mass",
        "The smaller available amount divided by its coefficient",
        "The reactant written first"
      ],
      "answer": 1,
      "why": "Stoichiometric availability, not position or raw mass, determines how far the reaction can proceed.",
      "section": "limiting"
    }
  ],
  "assessment": [
    [
      "balance",
      "Balance",
      [
        "balance"
      ],
      "Conserve atoms with coefficients in lowest whole-number terms."
    ],
    [
      "classify",
      "Classify",
      [
        "classify"
      ],
      "Choose structural and chemical-behavior classifications."
    ],
    [
      "stoich",
      "Stoichiometry",
      [
        "stoich",
        "yield"
      ],
      "Calculate mass, gas volume, and yield."
    ],
    [
      "lr",
      "Limiting reactant",
      [
        "limiting"
      ],
      "Identify the limiting input and maximum output."
    ],
    [
      "capstone",
      "The tanker",
      [
        "balance",
        "classify",
        "stoich",
        "limiting",
        "yield"
      ],
      "Combine reaction identity, inventory, and quantitative evidence."
    ],
    [
      "casefile",
      "Airbag stoichiometry",
      [
        "classify",
        "stoich"
      ],
      "Convert between reactant and gas amounts using a balanced equation."
    ]
  ],
  "caseNote": "The airbag assessment uses 2NaN₃ → 2Na + 3N₂ to assess decomposition and the 3:2 mole ratio. It is a historical chemistry model, not a procedure for making an inflator or handling sodium azide.",
  "glossary": [
    [
      "Reactant",
      "A starting substance in a reaction."
    ],
    [
      "Product",
      "A substance formed by a reaction."
    ],
    [
      "Coefficient",
      "A multiplier before a chemical formula."
    ],
    [
      "Stoichiometry",
      "Quantitative relationships in a balanced reaction."
    ],
    [
      "Precipitate",
      "A solid formed from a solution."
    ],
    [
      "Redox",
      "A process involving changes in oxidation states."
    ],
    [
      "Limiting reactant",
      "The reactant that restricts product formation."
    ],
    [
      "Excess reactant",
      "A reactant supplied beyond the stoichiometric requirement."
    ],
    [
      "Theoretical yield",
      "Maximum predicted product for the stated model and inputs."
    ],
    [
      "Actual yield",
      "The product amount collected or reported."
    ],
    [
      "Percent yield",
      "Actual yield divided by theoretical yield, times 100%."
    ],
    [
      "Oxidation number",
      "A formal value used to track electron redistribution; an increase indicates oxidation."
    ]
  ],
  "skills": {
    "a": [
      "balance"
    ],
    "b": [
      "classify"
    ],
    "c": [
      "stoich",
      "yield"
    ],
    "d": [
      "limiting"
    ],
    "h1": [
      "honors-particles"
    ],
    "h2": [
      "honors-excess"
    ],
    "cap": [
      "balance",
      "classify",
      "stoich",
      "limiting",
      "yield"
    ]
  }
};
