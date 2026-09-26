export default {
  "number": 5,
  "title": "The Mole & Chemical Quantities",
  "question": "How can a balance count particles too small to see?",
  "intro": "Chemists handle visible samples but explain them using atoms, molecules, and ions. The mole connects those scales. You will use mass to count particles, analyze composition, and infer formulas before applying those tools to a life-support case.",
  "sections": [
    {
      "id": "mole",
      "title": "A counting unit on an enormous scale",
      "objective": "Convert between moles and specified particles using Avogadro’s constant.",
      "body": "<p>One <strong>mole</strong> contains exactly 6.02214076 × 10²³ specified entities: atoms, molecules, ions, or formula units. Always name the entity. The Avogadro constant N<sub>A</sub> is this count per mole:</p><eq label=\"Moles → particles\">N = nN<sub>A</sub></eq><eq label=\"Particles → moles\">n = N/N<sub>A</sub></eq><p>A mole is neither a fixed mass nor a fixed volume. One mole of He atoms and one mole of water molecules have equal entity counts but different masses. Each H₂O molecule has two H atoms and one O atom; therefore one mole of H₂O contains two moles of H atoms and one mole of O atoms. Ionic NaCl is counted in formula units, not separate molecules.</p>",
      "simple": "A mole is a counting package. Say exactly what is being counted.",
      "analogy": "A dozen eggs and a dozen bowling balls have the same count but different masses. A mole uses a much larger fixed count.",
      "example": "For 0.250 mol CO₂:<eq>N = 0.250 × 6.022 × 10²³</eq><eq>N = 1.51 × 10²³ CO₂ molecules</eq>Two O atoms per molecule give:<eq>N(O) = 2N(CO₂) = 3.01 × 10²³ O atoms</eq>",
      "sources": [
        "10.1",
        "10.2"
      ],
      "teks": [
        "C.8(A)",
        "C.8(B)"
      ]
    },
    {
      "id": "mass",
      "title": "The bridge between grams and moles",
      "objective": "Calculate molar mass and convert between mass, amount, particles, and a stated gas volume.",
      "body": "<p><strong>Molar mass</strong> M is mass per mole, usually in g/mol. Add each element’s atomic mass multiplied by its formula subscript. Parentheses multiply every atom inside them. <eq label=\"Grams → moles\">n = m/M</eq><eq label=\"Moles → grams\">m = nM</eq> Check the units: g divided by g/mol leaves mol.</p><p>The mole is the central conversion point. To move from mass to particles, first convert grams to moles and then multiply by N<sub>A</sub>. Reverse those steps to find mass from a particle count. Predict the scale first: a mass smaller than one molar mass represents less than one mole.</p><p>The missions may use the approximate molar gas volume 22.4 L/mol at 0 °C and 1 atm for an ideal gas. This is a stated condition, not a universal value. At other temperatures or pressures, use the gas-law relationship developed in Unit 7. Liquids and solids do not obey the 22.4 L/mol shortcut.</p>",
      "simple": "Divide by molar mass to go from grams to moles. Multiply to return to grams.",
      "analogy": "If a package has a known mass per dozen identical items, its total mass tells you how many dozens it contains. Molar mass provides the same kind of conversion for a specified chemical substance.",
      "example": "For water:<eq>M ≈ 2(1.008) + 16.00 = 18.02 g/mol</eq><eq>n = 9.01 g / 18.02 g/mol = 0.500 mol</eq><eq>N ≈ 0.500 × 6.022 × 10²³ = 3.01 × 10²³ molecules</eq>At 0 °C and 1 atm, for an ideal gas:<eq>V ≈ (0.500 mol)(22.4 L/mol) = 11.2 L</eq>",
      "sources": [
        "10.3",
        "10.4",
        "10.5",
        "10.6",
        "10.7"
      ],
      "teks": [
        "C.8(A)"
      ]
    },
    {
      "id": "percent",
      "title": "Composition is a mass fraction",
      "objective": "Calculate percent composition and compare a measured composition with a specification.",
      "body": "<p>Percent composition by mass compares one element’s mass with the compound’s total mass:</p><eq>Mass percent = (element mass / compound mass) × 100%</eq><p>Use a one-mole formula calculation: find each element’s mass contribution and divide by molar mass. Percentages sum to about 100%, allowing for rounding.</p><p>Mass percentage is not atom percentage. Oxygen supplies most of water’s mass even though H atoms outnumber O atoms two to one. For the purity mission, calculate the expected percentage, then compare the reported value and allowed tolerance. One matching percentage cannot alone prove real-sample purity or identity; the mission uses a simplified evidence rule.</p>",
      "simple": "Find the mass of the part, divide by the mass of the whole, and multiply by 100.",
      "analogy": "A small number of heavy textbooks can make up most of a backpack’s mass even if pencils outnumber them. Counts and mass fractions answer different questions.",
      "example": "Oxygen’s mass fraction in water is:<eq>% O = (16.00/18.02) × 100% ≈ 88.79%</eq>A ±1.5 percentage-point tolerance is an absolute difference between percentage values, not a relative 1.5% change.",
      "sources": [
        "10.10"
      ],
      "teks": [
        "C.8(C)"
      ]
    },
    {
      "id": "formula",
      "title": "From composition to empirical and molecular formulas",
      "objective": "Derive an empirical ratio and use molar mass to determine a molecular formula.",
      "body": "<p>An <strong>empirical formula</strong> gives the smallest whole-number atom ratio; a <strong>molecular formula</strong> gives the actual count per molecule. Glucose C₆H₁₂O₆ has empirical formula CH₂O. Ionic formulas ordinarily give the simplest charge-balanced ratio.</p><p>Convert each element’s mass to moles, divide all amounts by the smallest, then find whole-number ratios. For percentage data, assume a 100 g sample. Do not round 1.5 to 2: multiply every ratio by 2. Ratios near 1.33 or 1.67 may require multiplying all by 3; respect data precision.</p><p>A known molecular molar mass gives the subscript multiplier:</p><eq>k = molecular molar mass / empirical-formula mass</eq><p>Multiply every empirical subscript by the integer k. In the capstone, establish identity and then apply the composition tolerance to the approve, quarantine, or reject decision.</p>",
      "simple": "Convert masses to mole ratios first. The empirical formula is the simplest ratio; the molecular formula is a whole-number multiple.",
      "analogy": "A tile pattern of one red, two white, and one blue tile can repeat several times. The simplest pattern resembles an empirical formula; the total tile count resembles a molecular formula.",
      "example": "Assume 100 g for 40.0% C, 6.7% H, 53.3% O:<eq>n(C) ≈ 3.33; n(H) ≈ 6.65; n(O) ≈ 3.33 mol</eq><eq>C : H : O ≈ 1 : 2 : 1 → CH₂O</eq>With molecular molar mass about 180 g/mol:<eq>k ≈ 180/30.03 ≈ 6 → C₆H₁₂O₆</eq>",
      "sources": [
        "10.12",
        "10.13"
      ],
      "teks": [
        "C.8(D)"
      ]
    },
    {
      "id": "ratio",
      "title": "Read a reaction as a mole recipe",
      "objective": "Use a supplied balanced equation to connect amounts of two substances.",
      "body": "<p>Balanced coefficients compare particles and moles, not grams. Put the desired substance in the numerator of a mole-ratio conversion factor:</p><eq>2H₂ + O₂ → 2H₂O</eq><p>Two moles of H₂ react with one mole of O₂ to form two moles of H₂O.</p><p>For the Apollo 13 scrubber model:</p><eq>2LiOH + CO₂ → Li₂CO₃ + H₂O</eq><p>Each mole of CO₂ requires two moles of LiOH. Convert CO₂ amount to moles of LiOH, then to mass. Real canister performance also depends on airflow and design; this equation specifies chemical proportions, not complete engineering performance.</p>",
      "simple": "Use the equation’s coefficient ratio between moles, then convert to grams if needed.",
      "analogy": "A recipe requiring two bread slices per sandwich scales by a ratio. Chemical coefficients similarly scale quantities while preserving the reaction’s proportions.",
      "example": "For 5.00 mol CO₂, use the 2:1 mole ratio:<eq>n(LiOH) = 5.00 mol CO₂ × (2 mol LiOH / 1 mol CO₂)</eq><eq>n(LiOH) = 10.0 mol</eq><eq>m(LiOH) = 10.0 × 23.95 ≈ 2.40 × 10² g</eq>This is a capacity calculation under the stated reaction model.",
      "sources": [
        "12.2",
        "12.3",
        "nasa-apollo"
      ],
      "teks": [
        "C.9(C)"
      ]
    }
  ],
  "visual": {
    "title": "Watch grams become a particle count",
    "instruction": "Change the mass of a water sample. Predict the mole amount before reading the result. Play the animation to compare increasing sample sizes.",
    "observe": "The scale model uses M = 18.02 g/mol. Pictorial dots represent equal portions of an enormous population, not individual water molecules that a balance can see.",
    "challenge": "If mass doubles without changing the substance, what happens to moles and molecule count?",
    "explanation": "Both double. Molar mass and Avogadro’s constant stay fixed. Water’s physical volume is not calculated by this model."
  },
  "honors": [
    {
      "id": "hydrate",
      "title": "Count water in a crystal",
      "mode": "formula",
      "body": "A hydrate contains water in a defined ratio, salt·xH₂O. Find water lost from initial mass minus dry-salt mass, then convert both masses to moles. For this example:<eq>n(CuSO₄) = 1.60/159.61 ≈ 0.0100 mol</eq><eq>n(H₂O) = 0.90/18.02 ≈ 0.0499 mol</eq><eq>x = n(H₂O)/n(CuSO₄) ≈ 5</eq>Incomplete drying makes the dry mass too large and water loss too small, lowering inferred x. Decomposition or spattering causes other errors.",
      "question": "Why might incomplete drying give the wrong x?",
      "answer": "The apparent dry mass would be too large and the water loss too small, lowering the inferred hydration number. Decomposition or spattering would introduce different errors.",
      "sources": [
        "10.11"
      ],
      "teks": [
        "C.8(D)"
      ]
    },
    {
      "id": "combustion",
      "title": "Reconstruct a formula from combustion products",
      "mode": "formula",
      "body": "For complete combustion of a sample containing only C, H, and O, the products reveal carbon and hydrogen amounts:<eq>n(C) = n(CO₂)</eq><eq>n(H) = 2n(H₂O)</eq>Convert those amounts to masses. Obtain sample oxygen by subtraction:<eq>m(O) = m(sample) − m(C) − m(H)</eq>Then convert oxygen mass to moles and find the smallest atom ratio. Subtraction is invalid if other elements are present: product oxygen also includes oxygen supplied during combustion.",
      "question": "A product sample contains 0.020 mol CO₂ and 0.030 mol H₂O. What C:H atom ratio follows?",
      "answer": "<eq>n(C) = 0.020 mol</eq><eq>n(H) = 2 × 0.030 = 0.060 mol</eq><eq>C:H = 1:3</eq>Sample oxygen requires sample mass minus C/H masses. Product oxygen also comes from supplied combustion gas.",
      "sources": [
        "11.6",
        "10.12"
      ],
      "teks": [
        "C.8(C)",
        "C.8(D)"
      ]
    }
  ],
  "checks": [
    {
      "question": "What is the first step from grams of a compound to molecules?",
      "options": [
        "Multiply grams by Avogadro’s constant",
        "Divide grams by molar mass",
        "Divide grams by the number of atoms in the formula"
      ],
      "answer": 1,
      "why": "The mole connects mass and particle count: n = m/M, then N = nN_A.",
      "section": "mass"
    },
    {
      "question": "An empirical ratio is 1 : 1.5. What should you do?",
      "options": [
        "Round it to 1 : 2",
        "Multiply both entries by 2",
        "Change only the second entry to 3"
      ],
      "answer": 1,
      "why": "Multiplying every entry preserves the ratio, giving 2 : 3.",
      "section": "formula"
    }
  ],
  "assessment": [
    [
      "molg",
      "Life support",
      [
        "mass"
      ],
      "Calculate grams or moles for a required quantity."
    ],
    [
      "particles",
      "Tanks & counts",
      [
        "mole",
        "mass"
      ],
      "Count named entities or use the stated gas-volume condition."
    ],
    [
      "percent",
      "Purity check",
      [
        "percent"
      ],
      "Calculate a composition and compare with a specification."
    ],
    [
      "formula",
      "Mystery ID",
      [
        "formula"
      ],
      "Derive empirical and molecular formulas."
    ],
    [
      "capstone",
      "Resupply pod",
      [
        "formula",
        "percent"
      ],
      "Verify identity and composition before a decision."
    ],
    [
      "zoom",
      "Feel a mole",
      [
        "mole"
      ],
      "Explore the scale of Avogadro’s constant."
    ],
    [
      "casefile",
      "Apollo 13",
      [
        "mass",
        "ratio"
      ],
      "Convert CO₂ amount through the reaction ratio to a LiOH mass."
    ]
  ],
  "caseNote": "NASA documents the adaptation of incompatible canisters during Apollo 13. The lesson and quiz use rounded classroom quantities to practice chemical capacity calculations; they are not reconstructed operational canister schedules.",
  "glossary": [
    [
      "Mole",
      "An amount containing exactly 6.02214076 × 10²³ specified entities."
    ],
    [
      "Avogadro constant",
      "The number of specified entities per mole."
    ],
    [
      "Molar mass",
      "The mass of one mole of a substance."
    ],
    [
      "Formula unit",
      "The ratio unit used to describe an ionic compound."
    ],
    [
      "Percent composition",
      "An element’s mass fraction expressed as a percentage."
    ],
    [
      "Empirical formula",
      "The simplest whole-number atom ratio."
    ],
    [
      "Molecular formula",
      "The actual atom counts in a molecule."
    ],
    [
      "Mole ratio",
      "A ratio of amounts supplied by a balanced equation."
    ],
    [
      "Hydrate",
      "A crystalline compound containing water in a characteristic ratio."
    ],
    [
      "Combustion analysis",
      "Inferring composition from measured combustion products."
    ]
  ],
  "skills": {
    "a": [
      "mass"
    ],
    "b": [
      "mole",
      "mass"
    ],
    "c": [
      "percent"
    ],
    "d": [
      "formula"
    ],
    "h1": [
      "honors-hydrate"
    ],
    "h2": [
      "honors-combustion"
    ],
    "cap": [
      "formula",
      "percent"
    ]
  }
};
