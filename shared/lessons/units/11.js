export default {
  "number": 11,
  "title": "Nuclear Chemistry",
  "question": "How can changes in an atomic nucleus supply energy and act as a clock?",
  "intro": "Chemical reactions rearrange electrons and bonds; nuclear processes change nuclei. You will learn to balance nuclear equations, predict fractions remaining, compare fission and fusion, and judge what radioactive measurements can establish.",
  "sections": [
    {
      "id": "decay",
      "title": "Conserve charge and nucleon count",
      "objective": "Identify alpha, beta, and gamma processes and balance nuclear equations.",
      "body": "<p>A nuclide has atomic number Z and mass number A. Both sums must balance in a nuclear equation. Total rest mass need not remain identical; nuclear energy requires mass–energy accounting.</p><p><strong>Alpha decay</strong> emits a helium-4 nucleus (⁴₂He), lowering A by four and Z by two. In <strong>beta-minus decay</strong>, a neutron becomes a proton, emitting an electron and antineutrino. A stays fixed; Z rises by one. The electron is created in the decay, not lost from an orbital. Beta-plus changes a proton to a neutron, emitting a positron and neutrino and lowering Z by one.</p><p><strong>Gamma emission</strong> releases a photon from an excited nucleus, changing neither A nor Z. Element identity changes only when Z changes. Introductory equations may omit neutrinos as a simplification.</p><p>The m in Tc-99m means a metastable excited state, not a different mass number. Co-60 undergoes beta-minus decay to Ni-60; the daughter then emits gamma photons. Identify the requested step.</p>",
      "simple": "Alpha changes both mass number and atomic number; beta changes atomic number; gamma changes nuclear energy without changing either number.",
      "analogy": "A roster can change a team’s composition while preserving its size. This suggests beta bookkeeping; nuclear change follows physical laws.",
      "example": "Alpha decay:<eq>²³⁸₉₂U → ²³⁴₉₀Th + ⁴₂He</eq><eq>A: 238 = 234 + 4; Z: 92 = 90 + 2</eq>Beta-minus decay:<eq>¹⁴₆C → ¹⁴₇N + ⁰₋₁e + antineutrino</eq>Mass number stays 14; charge-number sums remain 6.",
      "sources": [
        "24.2",
        "os-nuclear-stability"
      ],
      "teks": [
        "C.14(A)"
      ]
    },
    {
      "id": "half",
      "title": "Half-life removes a fraction, not a fixed amount",
      "objective": "Calculate the fraction or activity remaining and infer elapsed half-lives.",
      "body": "<p>A <strong>half-life</strong> t½ is the time for the expected undecayed parent population to halve. Individual decay times are unpredictable; large populations follow a statistical law:</p><eq>f = (1/2)^(t/t½)</eq><eq>N = N₀f; A = A₀f</eq><p>The activity relation assumes one parent isotope without replenishment. After one, two, or three half-lives, fractions remaining are 1/2, 1/4, or 1/8. Loss per interval shrinks as the remaining population shrinks. Starting with a smaller sample does not change its half-life.</p><p>Measure elapsed time from the stated reference to the event; use the exponential for non-integer half-lives. To infer time:</p><eq>t = t½ × log₂(1/f)</eq><p>Keep time units consistent. Activity in becquerels counts decays per second, not absorbed dose or total risk.</p>",
      "simple": "Every half-life halves what remains. The same fraction can correspond to different absolute amounts.",
      "analogy": "Repeatedly folding a strip in half leaves half the previous length, not the same number of centimeters each time. Actual nuclei decay randomly, not in synchronized folds.",
      "example": "Start with 80 MBq and a 6 h half-life. After 12 h:<eq>Half-lives = 12 h / 6 h = 2</eq><eq>A = 80 × (1/2)² = 20 MBq</eq>This is remaining parent activity, not a clinical dose.",
      "sources": [
        "24.3",
        "24.4"
      ],
      "teks": [
        "C.14(C)"
      ],
      "alignmentNote": "Half-life is a supporting model for nuclear applications; it is not a separately named student expectation in C.14."
    },
    {
      "id": "applications",
      "title": "Match a nuclear property to an application",
      "objective": "Explain why isotope choice depends on emission, half-life, chemistry, and the intended purpose.",
      "body": "<p>A diagnostic tracer must reach the target and emit a detectable signal. Therapy aims to deposit energy in selected tissue. Match <strong>emission, chemical form, and timing</strong>, using every mission rule; half-life alone is insufficient.</p><p>Tc-99m supports gamma imaging, F-18 positron-emission imaging, I-131 selected thyroid applications, and C-14 dating suitable once-living material. PET detects paired photons near 511 keV from positron–electron annihilation, not positrons reaching the camera. These are application examples, not clinical recommendations.</p><p>Other assessed uses: Co-60 gamma rays penetrate sealed packages for sterilization; Am-241 alpha emission ionizes air in intact smoke detectors; tritium (H-3) low-energy beta emission excites phosphor in sealed signs; Sr-90 decay heat powered historical remote generators. A radioisotope generator converts decay heat, unlike a fission reactor. An isotope’s useful emission need not be its only emission.</p><p>Alpha particles have short ranges and strong local ionization; beta usually penetrates farther; gamma can penetrate deeply. Shielding depends on energy, material, geometry, and exposure route. Short-range emitters can be hazardous internally. Solar cells convert light electronically; the Sun supplies light through fusion, but the cell does not fuse nuclei.</p>",
      "simple": "Choose a property for a purpose, and distinguish detection, treatment, dating, and energy conversion.",
      "analogy": "Choosing a camera lens depends on what you need to observe. Isotope selection also depends on a purpose, but requires specialized controls beyond a classroom comparison.",
      "example": "A tracer that decays long before an observation cannot provide the intended signal. One that persists unnecessarily long can create other constraints. The useful choice also needs the right emission and chemical behavior.",
      "sources": [
        "24.9",
        "24.10",
        "24.11",
        "24.12",
        "os-solar",
        "nrc-smoke",
        "nrc-tritium",
        "doe-sr90"
      ],
      "teks": [
        "C.14(C)"
      ]
    },
    {
      "id": "power",
      "title": "Fission and fusion change nuclear binding",
      "objective": "Compare fission and fusion and explain how both can release energy.",
      "body": "<p><strong>Fission</strong> splits a heavy nucleus, often releasing neutrons that trigger further fissions. Reactors regulate neutrons and remove heat. This is nuclear change, not combustion; a balanced equation alone cannot establish safe operation.</p><p><strong>Fusion</strong> joins light nuclei. High-energy collisions and quantum effects overcome positive-charge repulsion. Fusion powers stars. Some reactions emit neutrons that activate surrounding materials, so radioactive waste remains possible.</p><p>More tightly bound products can have lower rest mass, releasing the difference as energy:</p><eq>E = Δmc²</eq><p>Binding energy per nucleon explains favorable fusion of sufficiently light nuclei and fission of sufficiently heavy nuclei.</p><p>Other processes include alpha decay and neutron capture. Capture adds a neutron without splitting:</p><eq>⁹⁸Mo + ¹n → ⁹⁹Mo + γ</eq><p>Capture samples may retain stable carrier, affecting specific activity (activity per mass) versus material separated from fission products. Reactor production and subsequent generator decay are distinct steps.</p>",
      "simple": "Fission divides heavy nuclei; fusion joins light ones. The energy comes from a change in nuclear binding and total mass–energy.",
      "analogy": "Water descending suggests energy release between states. It does not model the nuclear mechanism or imply every split or join releases energy.",
      "example": "One illustrative fission channel:<eq>²³⁵₉₂U + ¹₀n → ¹⁴¹₅₆Ba + ⁹²₃₆Kr + 3¹₀n</eq><eq>A: 235 + 1 = 141 + 92 + 3 = 236</eq><eq>Z: 92 = 56 + 36</eq>Real fission has many fragment pairs.",
      "sources": [
        "24.6",
        "24.7",
        "24.8",
        "os-nuclear-stability",
        "doe-fusion"
      ],
      "teks": [
        "C.14(B)"
      ]
    },
    {
      "id": "dating",
      "title": "A radioactive clock needs a starting model",
      "objective": "Use the half-life model for radiocarbon dating while identifying calibration and sample limitations.",
      "body": "<p>Living organisms exchange carbon with their environments. After death, that exchange largely stops, and remaining carbon-14 decays. Comparing an appropriate measured isotope ratio with an inferred initial ratio supports an age estimate. The calculation assumes a suitable sample and accounts for contamination and reservoir effects.</p><p>Atmospheric carbon-14 has varied over time. Laboratories therefore calibrate conventional radiocarbon ages using independent records, such as tree rings. The simple exponential formula is an instructional model, not the whole laboratory dating process. The 53% fraction in the case diagram is a classroom example, not a reported measurement of Ötzi. Its model age does not replace a calibrated archaeological date.</p><p>The Iceman case connects the decay model with archaeology. A reported archaeological age combines laboratory evidence, calibration, and uncertainty. For the case’s separate wooden-tool problem, count halvings before multiplying by the supplied half-life.</p>",
      "simple": "A remaining fraction becomes an age only with a justified initial condition and a suitable decay model.",
      "analogy": "A clock is useful when you know when it started and whether it ran correctly. Radiocarbon dating similarly requires more than reading one number, although radioactive decay does not behave like a mechanical clock.",
      "example": "For a hypothetical object with 12.5% of its reference carbon-14:<eq>100% → 50% → 25% → 12.5%</eq>That is three half-lives:<eq>t = 3 × 5,730 = 17,190 years</eq>This is an uncalibrated classroom estimate.",
      "sources": [
        "24.4",
        "os-radiometric",
        "iceman-dating"
      ],
      "teks": [
        "C.14(C)"
      ]
    }
  ],
  "visual": {
    "title": "Watch equal intervals halve the parent population",
    "instruction": "Move through elapsed half-lives, or play the decay sequence. Predict the remaining fraction after each interval.",
    "observe": "Solid dots represent the expected remaining parent fraction in a large sample; outlined dots represent transformed parents. The display uses 64 symbolic units and an ideal exponential curve.",
    "challenge": "Why does the second interval lose fewer parent nuclei than the first?",
    "explanation": "Each interval removes half of the amount still present. This is an expected population model, not a schedule for when any particular nucleus decays."
  },
  "honors": [
    {
      "id": "series",
      "title": "Follow a decay chain",
      "mode": "ident",
      "body": "Track both A and Z at every step; use Z to identify each daughter. Alpha followed by two beta-minus decays has net ΔA = −4, ΔZ = 0: the final element is unchanged but its isotope differs. For chains containing only those steps:<eq>Alpha count = (A_start − A_end)/4</eq><eq>Beta count = Z_end − Z_start + 2(alpha count)</eq>U-238 to Pb-206 needs eight alpha and six beta-minus steps. The neptunium series ultimately reaches stable Tl-205: Bi-209 has an extremely long alpha-decay half-life.",
      "question": "Could you infer the final isotope by tracking mass number alone?",
      "answer": "No. Track atomic number as well. Different elements can share a mass number. Real chains also have branching probabilities and daughter half-lives.",
      "sources": [
        "24.2",
        "os-nuclear-reactions"
      ],
      "teks": [
        "C.14(A)"
      ]
    },
    {
      "id": "binding",
      "title": "Calculate mass defect consistently",
      "mode": "power",
      "body": "Mass defect compares separated constituents with the assembled system, using consistent masses. With neutral atomic masses:<eq>Δm = Zm(¹H) + (A − Z)m_n − m_atom</eq>Hydrogen-atom masses include electrons, matching the atomic-mass convention. For deuterium:<eq>Δm ≈ 1.007825 + 1.008665 − 2.014102</eq><eq>Δm ≈ 0.002388 u</eq><eq>E ≈ 0.002388 × 931.5 = 2.224 MeV</eq><eq>E/A ≈ 1.112 MeV per nucleon</eq>The broad binding-energy peak lies near iron–nickel. It does not imply every possible split or fusion releases energy.",
      "question": "Why should bare-proton masses not be mixed silently with a neutral atomic mass?",
      "answer": "The electron masses would be counted inconsistently. Use nuclear masses with bare nucleons, or a compatible atomic-mass convention.",
      "sources": [
        "os-nuclear-stability"
      ],
      "teks": [
        "C.14(B)"
      ]
    },
    {
      "id": "effective",
      "title": "Two independent removal processes",
      "mode": "dose",
      "body": "If physical decay and biological elimination are independent first-order processes, their removal rates add:<eq>1/t_eff = 1/t_phys + 1/t_bio</eq><eq>t_eff = t_phys t_bio/(t_phys + t_bio)</eq>For physical and biological half-lives of 6 h and 12 h:<eq>t_eff = (6 × 12)/(6 + 12) = 4 h</eq>Time to retained fraction f is:<eq>t = t_eff log₂(1/f)</eq>Reaching 25% takes two effective half-lives, or 8 h. These are classroom retention thresholds, not universal patient-release criteria.",
      "question": "Can this effective half-life exceed both component half-lives?",
      "answer": "No, under these assumptions it is shorter than either. It describes a simplified retention model, not a complete patient-release decision.",
      "sources": [
        "nrc-effective"
      ],
      "teks": [
        "C.14(C)"
      ]
    }
  ],
  "checks": [
    {
      "question": "After two half-lives, what expected parent fraction remains?",
      "options": [
        "0%",
        "25%",
        "50%"
      ],
      "answer": 1,
      "why": "Half of one-half is one-quarter.",
      "section": "half"
    },
    {
      "question": "What changes in beta-minus decay?",
      "options": [
        "A decreases by 4",
        "Z increases by 1 while A stays fixed",
        "Both A and Z stay fixed"
      ],
      "answer": 1,
      "why": "A neutron changes to a proton, with an electron and antineutrino emitted.",
      "section": "decay"
    }
  ],
  "assessment": [
    [
      "ident",
      "Identify the source",
      [
        "decay"
      ],
      "Identify emissions and conserve A and Z."
    ],
    [
      "dose",
      "What is left",
      [
        "half"
      ],
      "Calculate parent activity remaining at a stated time."
    ],
    [
      "apply",
      "Pick the isotope",
      [
        "applications"
      ],
      "Match emission, half-life, and application requirements."
    ],
    [
      "power",
      "Fission or fusion",
      [
        "power"
      ],
      "Compare nuclear processes and their energy basis."
    ],
    [
      "capstone",
      "The last call",
      [
        "decay",
        "half",
        "applications",
        "power"
      ],
      "Evaluate a nuclear claim using all supplied evidence."
    ],
    [
      "casefile",
      "Ötzi and radiocarbon",
      [
        "half",
        "dating"
      ],
      "Infer elapsed half-lives while distinguishing a classroom model from calibrated dating."
    ]
  ],
  "caseNote": "The wooden-tool quiz assesses the exponential half-life relationship. The illustrated fraction is a classroom value; archaeological dates require actual measurements and calibration.",
  "glossary": [
    [
      "Nuclide",
      "A nucleus specified by proton and neutron counts."
    ],
    [
      "Radioactivity",
      "Spontaneous transformation of unstable nuclei."
    ],
    [
      "Alpha particle",
      "A helium-4 nucleus."
    ],
    [
      "Beta-minus particle",
      "An electron emitted in a nuclear transformation."
    ],
    [
      "Gamma ray",
      "A high-energy photon emitted in a nuclear transition."
    ],
    [
      "Half-life",
      "Time for the expected parent population to fall by half."
    ],
    [
      "Activity",
      "Radioactive transformations per unit time."
    ],
    [
      "Becquerel",
      "One nuclear decay per second."
    ],
    [
      "Fission",
      "Splitting a heavy nucleus."
    ],
    [
      "Fusion",
      "Combining light nuclei."
    ],
    [
      "Mass defect",
      "The rest-mass difference associated with nuclear binding."
    ],
    [
      "Calibration",
      "Relating a measurement or model estimate to independent reference evidence."
    ],
    [
      "Effective half-life",
      "Combined half-life for specified independent removal processes."
    ],
    [
      "Metastable nuclear state",
      "An excited nuclear state that persists long enough to be distinguished, marked with m in a name such as Tc-99m."
    ],
    [
      "Neutron capture",
      "A nuclear reaction in which a nucleus absorbs a neutron; capture does not necessarily cause fission."
    ],
    [
      "Specific activity",
      "Radioactive activity per unit mass of a material."
    ]
  ],
  "skills": {
    "a": [
      "decay"
    ],
    "b": [
      "power"
    ],
    "c": [
      "applications"
    ],
    "hl": [
      "half"
    ],
    "h1": [
      "honors-series"
    ],
    "h2": [
      "honors-binding"
    ],
    "h3": [
      "honors-effective"
    ],
    "cap": [
      "decay",
      "half",
      "applications",
      "power"
    ]
  }
};
