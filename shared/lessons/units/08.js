export default {
  "number": 8,
  "title": "Solutions & Solubility",
  "question": "What determines whether a substance dissolves, stays dissolved, or forms a solid?",
  "intro": "A clear solution can contain enormous numbers of invisible particles. You will use particle interactions and concentration to explain dissolving, dilution, crystallization, and precipitation, then apply those ideas to gas released from a lake.",
  "sections": [
    {
      "id": "dissolve",
      "title": "Dissolving is a competition among interactions",
      "objective": "Identify solute and solvent and explain water’s behavior as a polar solvent.",
      "body": "<p>A solution is a homogeneous mixture at the molecular or ionic scale. The <strong>solvent</strong> is the dissolving medium; the <strong>solute</strong> is the dissolved substance. Dissolving changes solute–solute, solvent–solvent, and solute–solvent interactions. Whether mixing is favorable depends on both energy changes and the ways particles can be distributed.</p><p>Water is polar: its oxygen region is partially negative and its hydrogen regions are partially positive. Water can surround cations with oxygen ends oriented inward and anions with hydrogen ends oriented inward. This hydration can stabilize separated ions. Many polar molecules also interact favorably with water, while many nonpolar substances dissolve better in nonpolar solvents. “Like dissolves like” is a useful guide, not a guarantee that every ionic or polar substance is highly soluble.</p>",
      "simple": "Dissolving works when the new interactions and particle distribution favor mixing.",
      "analogy": "Separating a group requires replacing its existing connections with new ones. This suggests competing interactions, but particles do not choose friends or have intentions.",
      "example": "NaCl can separate into hydrated Na⁺ and Cl⁻ ions in water. Sugar can dissolve as neutral molecules. Oil and water interact differently and ordinarily separate into layers rather than forming one uniform solution.",
      "sources": [
        "os-dissolution",
        "8.9",
        "9.17"
      ],
      "teks": [
        "C.11(A)",
        "C.11(C)"
      ]
    },
    {
      "id": "types",
      "title": "Capacity and conductivity are different properties",
      "objective": "Distinguish unsaturated, saturated, and supersaturated solutions and classify electrolytes.",
      "body": "<p>At specified temperature and pressure, an <strong>unsaturated</strong> solution can dissolve more solute. A <strong>saturated</strong> solution is at its equilibrium dissolved concentration. Excess solid at the bottom can coexist with a saturated solution; that solid is not part of the dissolved concentration. Dissolution and crystallization continue at equal rates at equilibrium.</p><p>A <strong>supersaturated</strong> solution temporarily contains more dissolved material than its equilibrium capacity. It is unstable with respect to crystallization and can release crystals after a disturbance or a seed is introduced. Merely adding too much solid does not necessarily produce supersaturation.</p><p>An electrolyte solution conducts through mobile ions. Soluble ionic compounds often act as strong electrolytes because the dissolved portion separates into ions. Some molecular substances form ions by reaction with water. Nonelectrolytes such as sugar largely remain neutral. Solubility, ionization extent, and concentration are related but distinct questions.</p>",
      "simple": "Saturation asks how much can stay dissolved. Conductivity asks whether mobile ions are present.",
      "analogy": "A full parking lot represents a capacity limit. Supersaturation is more like a temporary overcrowded arrangement than extra cars waiting outside; undissolved solid resembles the waiting cars.",
      "example": "If 30 g can dissolve in 100 g water at a stated temperature, adding 40 g and allowing equilibrium may leave 10 g solid. The dissolved solution is saturated, not automatically supersaturated.",
      "sources": [
        "os-solubility",
        "os-electrolytes"
      ],
      "teks": [
        "C.11(B)"
      ]
    },
    {
      "id": "curve",
      "title": "Read the axes of a solubility curve",
      "objective": "Distinguish dissolving rate from solubility and use temperature or pressure data to predict changes.",
      "body": "<p>A common solubility graph reports grams of solute per 100 g of water against temperature. It does not report grams per 100 g of solution. Scale the capacity to the actual solvent mass. Many solids become more soluble when heated, but some do not; read the given curve instead of assuming a universal rule.</p><p>Stirring and crushing often increase dissolution rate by improving contact or surface area. They do not necessarily change the final equilibrium solubility at the same temperature. Temperature can affect both rate and capacity, so distinguish the question being asked.</p><p>For many gases in water, solubility decreases as temperature rises. At constant temperature, higher partial pressure of the gas generally increases its dissolved concentration, summarized for dilute systems by Henry’s law, <eq>C = kP</eq>. In Lake Nyos, elevated pressure allowed deep water to hold substantial CO₂. A pressure decrease can promote bubble formation and further gas release. This is not the same temperature behavior as many dissolved solids.</p>",
      "simple": "Rate means how fast. Solubility means how much can remain dissolved under stated conditions.",
      "analogy": "Opening more checkout lanes can speed shopping without increasing the store’s shelf capacity. Stirring can likewise change a rate without changing equilibrium capacity.",
      "example": "At 40 g solute per 100 g water, with 250 g water:<eq>Capacity = (40/100) × 250 = 100 g solute</eq>When capacity falls to 20 g per 100 g water:<eq>Dissolved at equilibrium = (20/100) × 250 = 50 g</eq>",
      "sources": [
        "os-solubility",
        "os-dissolution",
        "usgs-nyos"
      ],
      "teks": [
        "C.11(C)"
      ]
    },
    {
      "id": "precip",
      "title": "Predict a precipitate from dissolved ions",
      "objective": "Use a solubility table to predict products and write a net ionic equation.",
      "body": "<p>Mixing ionic solutions may form a poorly soluble <strong>precipitate</strong>. First write charge-balanced products, then apply solubility rules to each complete ion pair.</p><p>Group 1, ammonium, and nitrate salts are generally soluble. Cl⁻, Br⁻, and I⁻ salts have important exceptions with Ag⁺, Pb²⁺, and Hg₂²⁺. Carbonates and phosphates are generally poorly soluble except with Group 1 or ammonium. Sulfates of Ba²⁺, Sr²⁺, and Pb²⁺ are poorly soluble; CaSO₄ is sparingly soluble. Most hydroxides are poorly soluble; Group 1 hydroxides are soluble, and Ca²⁺, Sr²⁺, Ba²⁺ have important exceptions with differing solubilities.</p><p>For a complete ionic equation, split strong dissolved electrolytes into ions; retain solids, liquids, and weak molecular electrolytes. Cancel unchanged <strong>spectator ions</strong> for the net equation. Conserve atoms and charge.</p><p>If products remain dissolved and no other driving reaction occurs, exchanging written partners is not a net reaction. Qualitative rules predict tendencies; sufficiently dilute mixtures may not precipitate. Honors uses Q versus K_sp to address concentration.</p>",
      "simple": "Check whether any new ion combination forms a solid. Do not assume every mixture reacts.",
      "analogy": "Some puzzle pieces fit into a new stable assembly while others remain separate. The analogy represents selective association, not literal rigid ion shapes.",
      "example": "Mixing AgNO₃(aq) and NaCl(aq) forms AgCl(s) and dissolved NaNO₃. Cancel spectator Na⁺ and NO₃⁻:<eq>Ag⁺(aq) + Cl⁻(aq) → AgCl(s)</eq>Each side has one Ag, one Cl, and zero total charge.",
      "sources": [
        "os-classify",
        "os-ksp"
      ],
      "teks": [
        "C.11(D)"
      ]
    },
    {
      "id": "molarity",
      "title": "Concentration counts solute per solution volume",
      "objective": "Calculate molarity and the mass needed for a target solution.",
      "body": "<p><strong>Molarity</strong> compares moles of solute with final solution volume in liters:</p><eq>M = n/V</eq><p>One molar means one mole per liter of solution. Convert mL to L; if given mass, first divide by molar mass. For a target concentration:</p><eq>n = MV</eq><eq>m = n × molar mass</eq><p>Final solution volume includes dissolved solute. Adding a volume of water does not necessarily produce that same solution volume. The capstone combines classification, concentration, and precipitation: a correctly named stock can still fail if its concentration is wrong.</p>",
      "simple": "Molarity tells you how many moles are present in each liter of the final solution.",
      "analogy": "Students per bus is a concentration-like ratio. More students at unchanged bus capacity raises the ratio; more buses at unchanged student count lowers it.",
      "example": "Dissolve 5.85 g NaCl (58.44 g/mol) to a final solution volume of 0.500 L:<eq>n = 5.85/58.44 ≈ 0.100 mol</eq><eq>M = 0.100 mol / 0.500 L ≈ 0.200 mol/L</eq>Do not treat 500 mL as 500 L.",
      "sources": [
        "os-molarity",
        "10.4"
      ],
      "teks": [
        "C.11(E)"
      ]
    },
    {
      "id": "dilution",
      "title": "Dilution preserves solute amount",
      "objective": "Use M₁V₁ = M₂V₂ and distinguish final volume from added solvent.",
      "body": "<p>When only solvent is added and no solute reacts, escapes, or precipitates, the number of dissolved solute moles remains constant. Therefore <eq>M₁V₁ = M₂V₂</eq>. Volumes can use the same unit on both sides for this ratio, but calculations of moles separately require liters.</p><p>V₂ is the final solution volume, not the amount of water added. Dilution decreases concentration but does not remove the solute. In practice, carefully bring the solution to its final marked volume rather than assuming all liquid volumes add exactly.</p>",
      "simple": "The same amount of solute is spread through a larger volume.",
      "analogy": "Spreading the same students across more classrooms lowers students per classroom without removing students from the school.",
      "example": "Make 250 mL of 0.100 M solution from 1.00 M stock:<eq>V₁ = M₂V₂/M₁</eq><eq>V₁ = (0.100 × 250)/1.00 = 25.0 mL</eq>Bring that stock portion to a total volume of 250 mL. Do not add 250 mL water to the stock.",
      "sources": [
        "os-molarity"
      ],
      "teks": [
        "C.11(F)"
      ]
    }
  ],
  "visual": {
    "title": "Watch dilution preserve the solute",
    "instruction": "Change the final solution volume while keeping 0.100 mol solute fixed. Predict the concentration at double the volume, then play the dilution.",
    "observe": "The same number of symbolic solute dots occupies a larger volume. The displayed concentration follows M = n/V. Dots are population markers, not literal individually visible molecules.",
    "challenge": "Why does a lower concentration not imply that solute has disappeared?",
    "explanation": "Only the denominator changes. At 0.250 L the concentration is 0.400 M; at 0.500 L it is 0.200 M. Both contain 0.100 mol solute. The model excludes precipitation and reaction."
  },
  "honors": [
    {
      "id": "ksp",
      "title": "When does precipitation begin?",
      "mode": "precip",
      "body": "For the equilibrium dissolution of silver chloride:<eq>AgCl(s) ⇌ Ag⁺ + Cl⁻</eq><eq>K_sp = [Ag⁺][Cl⁻]</eq>Calculate Q using concentrations immediately after mixing, including dilution. Q > K_sp favors precipitation; Q < K_sp is below saturation. Coefficients determine powers in other expressions:<eq>For CaF₂: K_sp = [Ca²⁺][F⁻]²</eq>Adding a common ion generally reduces molar solubility.",
      "question": "In a hypothetical 1:1 salt with K_sp = 1.0 × 10⁻⁸, does a mixture with both ions at 2.0 × 10⁻⁴ M favor precipitation?",
      "answer": "The mixed concentrations give:<eq>Q = (2.0 × 10⁻⁴)² = 4.0 × 10⁻⁸</eq>This exceeds K_sp, so precipitation is favored. Stock concentrations cannot be substituted without accounting for mixing.",
      "sources": [
        "os-ksp"
      ],
      "teks": [
        "C.11(D)"
      ]
    },
    {
      "id": "crystallize",
      "title": "Predict a crystallization yield",
      "mode": "curve",
      "body": "If a solution starts saturated, subtract the cold solubility from the hot solubility, then multiply by water mass/100 when the curve uses g per 100 g water. For capacities 60 and 20 g per 100 g water with 150 g water, the modeled crystallized mass is <eq>(60 − 20) × 1.5 = 60 g</eq>.",
      "question": "Would the same subtraction work for an initially unsaturated solution?",
      "answer": "Not automatically. Start with the amount actually dissolved, then subtract the final capacity and limit the result to zero or greater. Account for evaporation if solvent mass changes.",
      "sources": [
        "os-solubility"
      ],
      "teks": [
        "C.11(C)"
      ]
    }
  ],
  "checks": [
    {
      "question": "A saturated solution has extra solid at the bottom. What is true?",
      "options": [
        "The dissolved phase must be supersaturated",
        "The extra solid is not part of the dissolved concentration",
        "All the added solute belongs in the molarity numerator"
      ],
      "answer": 1,
      "why": "Concentration counts dissolved solute; a separate solid phase can coexist at saturation.",
      "section": "types"
    },
    {
      "question": "What stays constant in a simple dilution?",
      "options": [
        "Solute moles",
        "Molarity",
        "Final volume"
      ],
      "answer": 0,
      "why": "Adding only solvent increases volume and decreases molarity while preserving solute amount.",
      "section": "dilution"
    }
  ],
  "assessment": [
    [
      "dissolve",
      "Dissolving",
      [
        "dissolve"
      ],
      "Explain solvent–solute interactions."
    ],
    [
      "types",
      "Solution types",
      [
        "types"
      ],
      "Classify saturation and conductivity independently."
    ],
    [
      "curve",
      "Solubility curves",
      [
        "curve"
      ],
      "Read capacity and distinguish it from rate."
    ],
    [
      "precip",
      "Precipitation",
      [
        "precip"
      ],
      "Predict products and identify an insoluble solid."
    ],
    [
      "molarity",
      "Molarity",
      [
        "molarity"
      ],
      "Calculate a solution concentration."
    ],
    [
      "dilute",
      "Dilution",
      [
        "dilution"
      ],
      "Find a stock or final volume while conserving solute."
    ],
    [
      "capstone",
      "The final batch",
      [
        "types",
        "molarity",
        "dilution",
        "precip"
      ],
      "Classify the stock, meet a concentration target, and predict products."
    ],
    [
      "casefile",
      "Lake Nyos",
      [
        "curve"
      ],
      "Explain how pressure changes alter dissolved-gas capacity."
    ]
  ],
  "caseNote": "The Lake Nyos assessment uses gas solubility, especially the effect of pressure. Lower temperature often increases gas solubility, but the disaster’s mechanism also involved deep-water gas accumulation and lake structure; do not treat a generic cold-versus-warm rule as a complete history of the event.",
  "glossary": [
    [
      "Solution",
      "A homogeneous mixture at molecular or ionic scale."
    ],
    [
      "Solute",
      "A dissolved component."
    ],
    [
      "Solvent",
      "The dissolving medium."
    ],
    [
      "Hydration",
      "Interaction of dissolved species with surrounding water molecules."
    ],
    [
      "Solubility",
      "Equilibrium capacity to dissolve a substance under specified conditions."
    ],
    [
      "Saturated",
      "At the equilibrium dissolved concentration."
    ],
    [
      "Supersaturated",
      "Temporarily above equilibrium dissolved capacity."
    ],
    [
      "Electrolyte",
      "A substance that supplies mobile ions in solution."
    ],
    [
      "Molarity",
      "Moles of solute per liter of solution."
    ],
    [
      "Dilution",
      "Lowering concentration by adding solvent."
    ],
    [
      "Spectator ion",
      "An ion unchanged in the net reaction."
    ],
    [
      "Solubility product",
      "The equilibrium constant for dissolution of a specified solid."
    ]
  ],
  "skills": {
    "a": [
      "dissolve"
    ],
    "b": [
      "types"
    ],
    "c": [
      "curve"
    ],
    "d": [
      "precip"
    ],
    "e": [
      "molarity"
    ],
    "f": [
      "dilution"
    ],
    "h1": [
      "honors-ksp"
    ],
    "h2": [
      "honors-crystallize"
    ],
    "cap": [
      "types",
      "molarity",
      "dilution",
      "precip"
    ]
  }
};
