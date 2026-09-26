export default {
  "number": 3,
  "title": "Periodic Table & Trends",
  "question": "How can an element’s position help you predict its behavior?",
  "intro": "The periodic table compresses many observations into a useful pattern. You will learn how evidence shaped the table and how electron structure explains its trends. You will also learn when a trend is an estimate that must be checked against data.",
  "sections": [
    {
      "id": "history",
      "title": "A table built from testable predictions",
      "objective": "Explain how evidence changed the organization of the periodic table.",
      "body": "<p>Early classifications grouped elements with similar properties. Döbereiner described triads; Newlands noticed repeating patterns among elements ordered by mass, although his scheme did not work universally. Mendeleev arranged elements using atomic mass and chemical similarity, leaving gaps where the pattern suggested undiscovered elements. Successful predictions made his table scientifically useful rather than merely tidy.</p><p>Moseley’s X-ray evidence connected element identity with atomic number. The modern table orders elements by increasing proton count, resolving several problems of mass ordering. A <strong>period</strong> is a row; a <strong>group</strong> is a column. Repeating valence-electron configurations explain why many properties recur. An occasional decrease in atomic mass does not require rearranging the modern table.</p>",
      "simple": "The table follows proton number. Repeating electron patterns explain repeating properties.",
      "analogy": "A well-designed calendar puts similar days in the same column. The table also organizes recurring patterns, but chemical behavior is not as perfectly repetitive as weekdays.",
      "example": "Argon has atomic number 18 and potassium has atomic number 19, so argon comes first even though its average atomic mass is slightly greater. Proton number determines the order.",
      "sources": [
        "6.1",
        "6.2",
        "6.3",
        "6.4"
      ],
      "teks": [
        "C.5(A)"
      ]
    },
    {
      "id": "families",
      "title": "Families share valence patterns",
      "objective": "Predict common family properties and ion charges from main-group valence electrons.",
      "body": "<p>Group 1 alkali metals have one outer electron and commonly form +1 ions. Group 2 alkaline-earth metals commonly form +2 ions. Group 17 halogens have seven valence electrons and commonly form −1 ions in binary ionic compounds. Group 18 noble gases have filled outer shells and are relatively unreactive, although “unreactive” does not mean incapable of forming compounds. Hydrogen has one electron but is a nonmetal with distinctive behavior.</p><p>Metals usually conduct heat and electricity and can be shaped without shattering. Nonmetals have varied properties and generally poor electrical conductivity. Metalloids have intermediate characteristics useful in some semiconductors. Transition metals often have multiple common oxidation states; do not apply a single main-group charge rule to all of them. Similarity within a family supports a prediction, not a guarantee that every property is identical.</p>",
      "simple": "Use a family to predict a pattern, then check the specific element and conditions.",
      "analogy": "Members of one instrument family have related designs but different ranges. Chemical families also share structure without having interchangeable properties.",
      "example": "Calcium and magnesium are both Group 2 metals. Predict +2 ions for each in common ionic compounds. A chloride formula is therefore CaCl₂ or MgCl₂, because two −1 chloride ions balance one +2 cation.",
      "sources": [
        "6.5",
        "6.6",
        "6.7",
        "6.9",
        "6.10",
        "6.11",
        "6.12",
        "6.13"
      ],
      "teks": [
        "C.5(B)"
      ]
    },
    {
      "id": "trends",
      "title": "Size, ionization energy, and electronegativity",
      "objective": "Interpret periodic data and explain the main directions of three trends.",
      "body": "<p><strong>Atomic radius</strong> describes size using a stated convention; atoms lack sharp boundaries. Down a main-group column, added shells generally increase radius. Across a period, increasing nuclear charge usually draws the same outer shell inward.</p><p><strong>First ionization energy</strong>, the positive energy needed to remove an electron from a gaseous neutral atom, generally decreases down a group as distance and shielding increase. It generally rises across a period, with exceptions. <strong>Electronegativity</strong>, attraction for shared electrons, generally rises toward the upper right. Noble gases are usually omitted on the Pauling scale; a missing value is not zero.</p><p>Metallic character generally increases toward the lower left. Reactivity needs a specified reaction: alkali-metal reactions with water generally grow more vigorous downward, while halogen oxidizing ability decreases. No universal reactivity arrow works.</p><p>Average atomic mass generally increases across and down as nucleon counts grow, but isotope abundances produce exceptions such as Ar/K and Co/Ni. Read actual values. The mission’s reactivity index is invented for its scenario, not a universal measured scale or corrosion predictor.</p>",
      "simple": "More occupied shells usually make atoms larger; a stronger effective attraction usually makes outer electrons harder to remove.",
      "analogy": "Distance can weaken the pull felt by a tethered object. This is only a partial analogy: atomic attraction also depends on electric charge, electron repulsion, and quantum structure.",
      "example": "Compared with sodium, potassium generally has a larger radius and lower first ionization energy because its valence electron occupies a higher principal shell. Compare fluorine and lithium within Period 2: fluorine is smaller and attracts bonding electrons more strongly.",
      "sources": [
        "6.15",
        "6.17",
        "6.18",
        "6.21",
        "6.22"
      ],
      "teks": [
        "C.5(C)"
      ]
    },
    {
      "id": "evidence",
      "title": "Read data before making the final choice",
      "objective": "Estimate missing values cautiously and use evidence to distinguish a trend from a mission decision rule.",
      "body": "<p>When comparing data, use the same property definition and units. A graph of first ionization energy is not a graph of electronegativity, even if their broad patterns resemble each other. Examine neighboring elements, identify whether you are moving across a row or down a group, and note exceptions. Interpolation uses nearby known values to estimate a missing value. It is a model-based estimate, not a measurement.</p><p>For a simple midpoint estimate between equally spaced neighboring values, take their arithmetic mean. Do not use that method across a large shell change or known discontinuity without justification. In the capstone, compare your estimate with the activity’s stated acceptance rule and explain the evidence. The scenario’s purchase or repair decision is a classroom rule, not a universal chemical law.</p><p>Lithium’s low mass and +1 chemistry help explain its usefulness in batteries. During discharge, ions move through electrolyte and electrons travel through an external circuit. Actual battery voltage depends on the complete electrode reactions and materials, not on gas-phase ionization energy alone.</p>",
      "simple": "A trend narrows a prediction. The actual data and the stated decision criterion determine your answer.",
      "analogy": "Estimating a missing temperature between neighboring weather stations is useful only if no mountain or front breaks the pattern. Shell changes can similarly interrupt a smooth chemical trend.",
      "example": "Given neighboring values of 110 and 130 pm and a justified locally smooth pattern:<eq>Midpoint estimate = (110 + 130)/2 = 120 pm</eq>Label it an estimate and compare with the mission’s allowed range. It is not an observed radius.",
      "sources": [
        "6.2",
        "6.15",
        "6.17",
        "6.18",
        "nobel-battery",
        "nasa-battery"
      ],
      "teks": [
        "C.5(C)"
      ]
    }
  ],
  "visual": {
    "title": "Watch electron shells change down Group 1",
    "instruction": "Select lithium, sodium, or potassium. Predict how the number of occupied shells changes, then play the comparison.",
    "observe": "Each model has one electron in its outer shell, while the occupied-shell count increases. The circles represent shell organization, not measured atomic radii or electron trajectories.",
    "challenge": "Why can two elements have one valence electron yet different sizes and ionization energies?",
    "explanation": "Their outer electrons occupy different shells and experience different shielding. The shared valence count predicts a family resemblance, not identical properties."
  },
  "honors": [
    {
      "id": "shielding",
      "title": "Effective nuclear charge",
      "mode": "trends",
      "body": "Effective nuclear charge describes net nuclear attraction after accounting for other electrons. A qualitative model is:<eq>Z_eff ≈ Z − S</eq>Here S represents shielding. Across a main-group period, electrons added to the same shell do not fully cancel added nuclear charge, so effective attraction usually rises.",
      "question": "Why does adding a proton and an electron not keep atomic size constant across a period?",
      "answer": "The added electron does not completely shield the increased nuclear charge. The outer-electron distribution usually contracts. Z − core-electron count is a classroom approximation, not a precise measurement.",
      "sources": [
        "6.18"
      ],
      "teks": [
        "C.5(C)"
      ]
    },
    {
      "id": "exceptions",
      "title": "Explain a dip instead of hiding it",
      "mode": "trends",
      "body": "First ionization energy dips from Be to B and Mg to Al because the electron removed from the Group 13 atom occupies a higher-energy p subshell. It also dips from N to O and P to S: the added p electron pairs with another electron, and repulsion makes removal somewhat easier. These are changes in subshell occupancy, not failures of conservation or evidence.",
      "question": "Should you replace an observed dip with the value predicted by a smooth arrow?",
      "answer": "No. Keep the measured data and improve the explanation. A broad trend describes an overall pattern; subshell energy and electron pairing explain local exceptions.",
      "sources": [
        "6.17",
        "5.17"
      ],
      "teks": [
        "C.5(C)"
      ]
    }
  ],
  "checks": [
    {
      "question": "Which property defines the order of the modern periodic table?",
      "options": [
        "Average atomic mass",
        "Atomic number",
        "Atomic radius"
      ],
      "answer": 1,
      "why": "Atomic number is proton count; it increases across the modern table.",
      "section": "history"
    },
    {
      "question": "An electronegativity value is missing from a table. What should you do?",
      "options": [
        "Treat it as zero",
        "Treat it as unknown or not assigned on that scale",
        "Assume the element cannot react"
      ],
      "answer": 1,
      "why": "An absent datum is not a zero measurement or proof of chemical impossibility.",
      "section": "trends"
    }
  ],
  "assessment": [
    [
      "table",
      "How the table developed",
      [
        "history"
      ],
      "Connect organizing schemes to evidence and predictions."
    ],
    [
      "families",
      "Chemical families",
      [
        "families"
      ],
      "Use valence patterns to predict family behavior."
    ],
    [
      "trends",
      "Periodic trends",
      [
        "trends",
        "evidence"
      ],
      "Compare data and explain a trend."
    ],
    [
      "capstone",
      "The substitute part",
      [
        "evidence",
        "trends"
      ],
      "Estimate a missing value and apply the activity’s decision rule."
    ],
    [
      "casefile",
      "Lithium batteries",
      [
        "families",
        "trends",
        "evidence"
      ],
      "Compare two Group 1 atoms without confusing atomic trends with cell voltage."
    ]
  ],
  "caseNote": "The battery case asks you to compare lithium and sodium. Explain radius and first ionization energy using shells and shielding. The battery context motivates that comparison; it does not make ionization energy a direct formula for cell voltage.",
  "glossary": [
    [
      "Period",
      "A horizontal row of the periodic table."
    ],
    [
      "Group",
      "A vertical column of the periodic table."
    ],
    [
      "Periodic law",
      "The recurrence of properties when elements are ordered by atomic number."
    ],
    [
      "Valence electron",
      "An electron in the outer-electron pattern relevant to bonding."
    ],
    [
      "Atomic radius",
      "A convention-dependent measure of atomic size."
    ],
    [
      "Ionization energy",
      "Energy required to remove an electron from a gaseous species."
    ],
    [
      "Electronegativity",
      "An atom’s attraction for shared electrons in a bond."
    ],
    [
      "Shielding",
      "Reduction of nuclear attraction experienced by an electron due to other electrons."
    ],
    [
      "Effective nuclear charge",
      "The net nuclear attraction experienced by an electron."
    ],
    [
      "Interpolation",
      "Estimating a value within the range of nearby known data."
    ]
  ],
  "skills": {
    "a": [
      "history"
    ],
    "b": [
      "families"
    ],
    "c": [
      "trends",
      "evidence"
    ],
    "h1": [
      "honors-shielding"
    ],
    "h2": [
      "honors-exceptions"
    ],
    "cap": [
      "evidence",
      "trends"
    ]
  }
};
