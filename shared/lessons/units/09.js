export default {
  "number": 9,
  "title": "Acids & Bases",
  "question": "What does pH tell you—and what does it leave out?",
  "intro": "Acids and bases connect chemical identity, proton transfer, concentration, and equilibrium. You will learn to name them, distinguish strength from concentration, calculate pH, and use reaction ratios before evaluating an acidic-drink case.",
  "sections": [
    {
      "id": "names",
      "title": "Read acid and base names",
      "objective": "Translate common acid and base names into formulas and back.",
      "body": "<p>For a binary acid in water, use <em>hydro-</em> + element root + <em>-ic acid</em>: HCl(aq) is hydrochloric acid. HCl(g) is hydrogen chloride; state and context matter. For oxyacids, an anion ending in <em>-ate</em> gives an <em>-ic acid</em>, while <em>-ite</em> gives an <em>-ous acid</em>. Nitrate gives nitric acid, HNO₃; nitrite gives nitrous acid, HNO₂. Preserve per- and hypo- prefixes where present.</p><p>Choose enough H⁺ to balance the anion’s charge: sulfate, SO₄²⁻, corresponds to H₂SO₄. Name hydroxide bases as ionic compounds, such as sodium hydroxide, NaOH, or calcium hydroxide, Ca(OH)₂. Not every base contains OH in its written formula; ammonia, NH₃, accepts protons from water.</p><p>A useful oxyanion reference is: carbonate CO₃²⁻, sulfate SO₄²⁻, sulfite SO₃²⁻, nitrate NO₃⁻, nitrite NO₂⁻, and phosphate PO₄³⁻. The chlorine series is perchlorate ClO₄⁻, chlorate ClO₃⁻, chlorite ClO₂⁻, and hypochlorite ClO⁻; the corresponding acid names are perchloric, chloric, chlorous, and hypochlorous. Acetic acid may be written CH₃COOH or HC₂H₃O₂. Learn phosphorous acid, H₃PO₃, as a reference formula: only two of its hydrogen atoms are normally acidic. Counting written H atoms alone does not establish the number of neutralization steps.</p>",
      "simple": "Use the anion name and charge to build an acid name and formula; use ionic naming for hydroxide bases.",
      "analogy": "A word ending can signal a grammatical role. Acid suffixes similarly convey a naming relationship, but they do not directly measure acid strength.",
      "example": "Phosphate is PO₄³⁻, so its neutral acid formula is H₃PO₄ and its name is phosphoric acid. Chlorite, ClO₂⁻, gives HClO₂, chlorous acid. The number of oxygen atoms must remain consistent with the anion.",
      "sources": [
        "7.12",
        "7.13",
        "7.9",
        "os-oxoacids"
      ],
      "teks": [
        "C.12(A)"
      ]
    },
    {
      "id": "definitions",
      "title": "Follow the proton",
      "objective": "Use Arrhenius and Brønsted–Lowry definitions and identify conjugate acid–base pairs.",
      "body": "<p>An <strong>Arrhenius acid</strong> increases hydronium concentration in water; an <strong>Arrhenius base</strong> increases hydroxide. H⁺(aq) abbreviates a hydrated proton, often represented as H₃O⁺. Some introductory definitions restrict bases to direct OH⁻ dissociation; under the broader concentration definition, ammonia also makes water basic.</p><p>A <strong>Brønsted–Lowry acid</strong> donates a proton; a base accepts one, whether or not its formula contains OH⁻. Losing H⁺ forms an acid’s conjugate base; gaining H⁺ forms a base’s conjugate acid. Each pair differs by one proton and one charge unit:</p><eq>NH₃ + H₂O ⇌ NH₄⁺ + OH⁻</eq><p>NH₃ is the base and H₂O the acid. The pairs are NH₃/NH₄⁺ and H₂O/OH⁻. Water can donate or accept a proton depending on its partner.</p>",
      "simple": "Track which species gives H⁺ and which receives it.",
      "analogy": "Passing a token can illustrate proton transfer. The donor and receiver change labels after the transfer, but the token analogy does not describe the energy or equilibrium of a real reaction.",
      "example": "Consider:<eq>HCl + H₂O → H₃O⁺ + Cl⁻</eq>The conjugate pairs are HCl/Cl⁻ and H₂O/H₃O⁺. HCl and H₃O⁺ are both acids here, so they are not a conjugate pair with each other.",
      "sources": [
        "21.3",
        "21.4",
        "21.5",
        "21.6",
        "os-acid-base"
      ],
      "teks": [
        "C.12(B)"
      ]
    },
    {
      "id": "strength",
      "title": "Strong does not mean concentrated",
      "objective": "Distinguish extent of ionization from the amount dissolved and interpret particle diagrams.",
      "body": "<p>Acid strength concerns the extent of proton transfer to water. A strong acid is essentially fully ionized in the dilute aqueous model; a weak acid establishes an equilibrium with a substantial un-ionized population. Strong bases such as soluble Group 1 hydroxides supply hydroxide ions extensively. Weak bases react only partly with water.</p><p>Concentration is amount per volume. A dilute strong acid can contain less H₃O⁺ than a sufficiently concentrated weak acid. Particle diagrams should distinguish dissolved molecules from ions and keep the atom and charge totals consistent. For a monoprotic acid, <eq>percent ionization = amount ionized/initial acid amount × 100%</eq>. “Weak” is not a safety classification, and low solubility is not the same as weak acid–base behavior.</p><p>For the mission’s reference set, HCl, HBr, HI, HNO₃, and HClO₄ are strong acids in water. H₂SO₄ has a strong first ionization; its second step is an equilibrium, so do not automatically set [H₃O⁺] = 2C in a pH calculation. HF, acetic acid, H₂CO₃, H₃PO₄, HNO₂, H₂S, HClO, and HCN are weak acids. The assessed strong bases are the Group 1 hydroxides and dissolved Ba(OH)₂; each dissolved formula unit of Ba(OH)₂ supplies two OH⁻. NH₃, methylamine CH₃NH₂, ethylamine C₂H₅NH₂, and hydrazine N₂H₄ are weak bases. Strength cannot be read reliably from a name or the number of H atoms.</p>",
      "simple": "Strength asks what fraction reacts with water; concentration asks how much substance was added per volume.",
      "analogy": "Attendance percentage and class size are different quantities. A small class with full attendance can have fewer students present than a large class with partial attendance.",
      "example": "In the ideal dilute model, 0.0010 M HCl gives approximately 0.0010 M H₃O⁺. You cannot assume 0.10 M acetic acid gives 0.10 M H₃O⁺; its equilibrium must be considered.",
      "sources": [
        "21.12",
        "21.13"
      ],
      "teks": [
        "C.12(C)"
      ]
    },
    {
      "id": "neutralize",
      "title": "Neutralization uses equivalent amounts",
      "objective": "Predict a salt and water where appropriate and calculate the reactant amounts required.",
      "body": "<p>For a strong acid and soluble hydroxide base:</p><eq>H⁺ + OH⁻ → H₂O</eq><p>Charge balance determines the remaining ions’ salt formula. More generally, acid–base reactions transfer protons; not all produce water.</p><p>Use the balanced equation, not equal volumes or assumed equal moles:</p><eq>H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O</eq><p>Complete neutralization here requires two moles of OH⁻ per mole of H₂SO₄. Find moles from M × V (in liters), apply coefficients, then calculate mass or volume. The salt and equilibrium determine the final pH; neutralization does not always give pH 7.</p>",
      "simple": "Match the reactive amounts required by the equation, not just the two liquid volumes.",
      "analogy": "Tickets can admit different numbers of people. Similarly, one mole of an acid can supply different proton amounts in complete neutralization.",
      "example": "For 25.0 mL of 0.100 M HCl:<eq>n(HCl) = 0.100 × 0.0250 = 0.00250 mol</eq>The 1:1 equation requires 0.00250 mol NaOH. With 0.200 M NaOH:<eq>V = n/M = 0.00250/0.200</eq><eq>V = 0.0125 L = 12.5 mL</eq>",
      "sources": [
        "21.16",
        "21.18"
      ],
      "teks": [
        "C.12(D)",
        "C.9(C)"
      ]
    },
    {
      "id": "ph",
      "title": "A logarithmic scale for hydrogen-ion concentration",
      "objective": "Calculate pH, pOH, and concentration ratios and qualify their temperature and dilution assumptions.",
      "body": "<p>For these dilute-solution calculations, use concentration in mol/L:</p><eq>pH ≈ −log₁₀[H₃O⁺]</eq><p>The general definition uses hydrogen-ion activity. A concentration of 10⁻³ M gives pH 3. A decrease of d pH units increases concentration by 10ᵈ.</p><p>At 25 °C:</p><eq>[H₃O⁺][OH⁻] = K_w ≈ 1.0 × 10⁻¹⁴</eq><eq>pH + pOH ≈ 14</eq><p>Neutrality means equal hydronium and hydroxide activities; neutral pH varies with temperature. The 0–14 display is not an absolute limit. Its endpoints imply about 1 M of an ion: those are idealized arithmetic examples, not dilute solutions. Concentrated solutions require activities.</p><p>Acid can promote enamel mineral loss, but pH alone measures neither total acid reserve nor exact damage. Saliva, exposure, buffering, and mineral composition matter. A buffer reacts with added acid or base to resist pH change; its capacity is finite.</p>",
      "simple": "Each pH step is a factor of ten. pH is not a direct measure of acid strength or total acid amount.",
      "analogy": "Each step on an exponential zoom changes scale. Small numerical pH differences can therefore represent large concentration ratios.",
      "example": "With [H₃O⁺] = 2.0 × 10⁻⁴ M:<eq>pH ≈ −log₁₀(2.0 × 10⁻⁴) = 3.70</eq>At 25 °C:<eq>pOH ≈ 14.00 − 3.70 = 10.30</eq>For pH 3 versus pH 5:<eq>Ratio = 10⁽⁵⁻³⁾ = 100</eq>Concentration is greater at pH 3.",
      "sources": [
        "21.8",
        "21.9",
        "21.10",
        "21.11",
        "21.23",
        "ada-erosion"
      ],
      "teks": [
        "C.12(E)"
      ]
    }
  ],
  "visual": {
    "title": "Watch a pH step change concentration by ten",
    "instruction": "Move the pH slider, then play the comparison. Predict the concentration change from pH 6 to pH 3.",
    "observe": "Equal pH steps represent equal factors. Readouts assume activity equals concentration divided by the standard concentration of 1 mol/L. Values near pH 0 and 14 extend that approximation into concentrated conditions and are illustrative calculations, not calibrated predictions for a real solution.",
    "challenge": "Does a three-unit decrease mean three times as many hydrogen ions?",
    "explanation": "A three-unit decrease gives a factor of 10³ = 1,000 in hydrogen-ion activity, and in concentration under the stated approximation. The model is at 25 °C; it does not predict dental damage."
  },
  "honors": [
    {
      "id": "titration",
      "title": "Endpoint and equivalence are different ideas",
      "mode": "neutralize",
      "body": "Equivalence is the stoichiometric point at which the required reacting amounts match. The endpoint is the observed indicator change. Choose an indicator whose transition range lies within the steep part of the titration curve. Strong acid–strong base equivalence is near pH 7 at 25 °C; weak acid–strong base equivalence is above 7 because the conjugate base reacts with water.",
      "question": "Why is equal acid and base volume not a universal equivalence rule?",
      "answer": "Concentrations and reaction coefficients may differ. Use stoichiometric moles. An indicator must match the relevant curve, not just a memorized “neutral” color.",
      "sources": [
        "21.17",
        "21.18",
        "21.19",
        "21.20"
      ],
      "teks": [
        "C.12(D)",
        "C.12(E)"
      ]
    },
    {
      "id": "weak-ph",
      "title": "Calculate the pH of a weak acid",
      "mode": "meter",
      "body": "For a weak monoprotic acid:<eq>HA ⇌ H⁺ + A⁻</eq>With initial concentration C and dissociated concentration x, neglecting water’s contribution:<eq>K_a = x²/(C − x)</eq>If x is small relative to C:<eq>x ≈ √(K_a C)</eq>Check x/C × 100% against the common 5% criterion. Otherwise solve:<eq>x = [−K_a + √(K_a² + 4K_aC)]/2</eq>Polyprotic acids have successive steps with separate K_a values. Do not multiply a first-step result by the formula’s H count.",
      "question": "For a hypothetical acid with K_a = 1.0 × 10⁻⁵ and C = 0.10 M, is the small-x estimate reasonable?",
      "answer": "<eq>x ≈ √(10⁻⁵ × 0.10) = 1.0 × 10⁻³ M</eq><eq>(x/C) × 100% ≈ 1%; pH ≈ 3.00</eq>The approximation passes. Much more dilute solutions may also require water ionization.",
      "sources": [
        "21.12",
        "21.15"
      ],
      "teks": [
        "C.12(C)",
        "C.12(E)"
      ]
    }
  ],
  "checks": [
    {
      "question": "A weak acid must always be dilute. Is that correct?",
      "options": [
        "Yes, the words mean the same thing",
        "No, strength and concentration are distinct",
        "Yes, if it contains oxygen"
      ],
      "answer": 1,
      "why": "Strength concerns ionization extent; concentration concerns amount per volume.",
      "section": "strength"
    },
    {
      "question": "pH decreases from 6 to 4. How does [H₃O⁺] change?",
      "options": [
        "It doubles",
        "It increases 100-fold",
        "It decreases 100-fold"
      ],
      "answer": 1,
      "why": "Two logarithmic steps give a factor of 10².",
      "section": "ph"
    }
  ],
  "assessment": [
    [
      "naming",
      "Naming",
      [
        "names"
      ],
      "Write acid and base names and formulas."
    ],
    [
      "define",
      "Definitions",
      [
        "definitions"
      ],
      "Identify proton donors, acceptors, and conjugate pairs."
    ],
    [
      "strength",
      "Strong vs weak",
      [
        "strength"
      ],
      "Distinguish ionization extent from concentration."
    ],
    [
      "neutralize",
      "Neutralize",
      [
        "neutralize"
      ],
      "Predict a salt and calculate required reacting amounts."
    ],
    [
      "meter",
      "pH meter",
      [
        "ph"
      ],
      "Calculate pH from ion concentration."
    ],
    [
      "capstone",
      "Capstone",
      [
        "names",
        "strength",
        "neutralize",
        "ph"
      ],
      "Combine naming, classification, salt construction, and neutralization."
    ],
    [
      "casefile",
      "Soda and enamel",
      [
        "ph"
      ],
      "Interpret a pH difference as a concentration ratio."
    ]
  ],
  "caseNote": "The case question compares example pH values mathematically. It does not measure an individual student’s mouth or predict a fixed amount of enamel loss. A quoted critical pH is a simplified reference, not a universal boundary.",
  "glossary": [
    [
      "Acid",
      "A proton donor in the Brønsted–Lowry framework."
    ],
    [
      "Base",
      "A proton acceptor in the Brønsted–Lowry framework."
    ],
    [
      "Conjugate pair",
      "Species differing by one proton."
    ],
    [
      "Hydronium",
      "H₃O⁺, a common representation of a hydrated proton."
    ],
    [
      "Strong acid",
      "An acid that ionizes essentially completely in the relevant dilute aqueous model."
    ],
    [
      "Weak acid",
      "An acid that establishes appreciable equilibrium with its un-ionized form."
    ],
    [
      "pH",
      "Negative base-ten logarithm of hydrogen-ion activity, approximated here using concentration."
    ],
    [
      "Neutralization",
      "An acid–base reaction; many common examples form salt and water."
    ],
    [
      "Equivalence point",
      "The stoichiometric completion point of a titration."
    ],
    [
      "Endpoint",
      "An observed signal used to stop a titration."
    ],
    [
      "Buffer",
      "A mixture that resists pH change on addition of limited acid or base."
    ],
    [
      "Kₐ",
      "The equilibrium constant for an acid’s ionization."
    ]
  ],
  "skills": {
    "a": [
      "names"
    ],
    "b": [
      "definitions"
    ],
    "c": [
      "strength"
    ],
    "d": [
      "neutralize"
    ],
    "e": [
      "ph"
    ],
    "h1": [
      "honors-titration"
    ],
    "h2": [
      "honors-weak-ph"
    ],
    "cap": [
      "names",
      "strength",
      "neutralize",
      "ph"
    ]
  }
};
