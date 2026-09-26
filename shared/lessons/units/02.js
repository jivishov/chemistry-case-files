export default {
  "number": 2,
  "title": "Atomic Structure & Theory",
  "question": "How does an invisible atomic structure produce visible evidence?",
  "intro": "The color of a lamp and the mass of an element are clues about particles too small to see directly. In this unit, you will connect evidence to atomic models, build atoms and ions, and explain why atoms absorb and emit particular energies of light.",
  "sections": [
    {
      "id": "models",
      "title": "Models change when evidence demands it",
      "objective": "Connect major atomic models to the evidence and limitations that shaped them.",
      "body": "<p>Dalton used patterns in chemical combination to describe matter as atoms. His claim that all atoms of an element have identical masses was later revised by the discovery of isotopes. Thomson’s cathode-ray experiments identified negatively charged electrons, showing that atoms have internal structure. His positive “pudding” model could not explain the rare, large deflections seen in the gold-foil experiments associated with Rutherford.</p><p>Those deflections supported a small, dense, positive nucleus in an atom that is mostly empty space. Bohr then used discrete electron energies to explain hydrogen’s line spectrum. His fixed-orbit picture is useful but cannot fully describe many-electron atoms. The modern quantum model uses orbitals—probability distributions, not miniature planetary paths. Heisenberg’s uncertainty principle limits simultaneous precision in position and momentum; it is not merely a statement about poor instruments.</p>",
      "simple": "A model is an explanation tested against evidence. Useful models still have limits.",
      "analogy": "A transit map helps you plan a journey without showing every tree. Likewise, a shell drawing highlights electron organization without being a literal picture of an atom.",
      "example": "If nearly all probe particles pass through a foil but a few turn sharply, a diffuse positive charge is an inadequate explanation. A compact region of concentrated charge explains why strong deflections are rare.",
      "sources": [
        "4.6",
        "4.11",
        "4.14",
        "5.6",
        "5.10",
        "5.11"
      ],
      "teks": [
        "C.6(A)"
      ]
    },
    {
      "id": "build",
      "title": "Count protons, neutrons, and electrons",
      "objective": "Determine element identity, mass number, isotope, and charge from particle counts.",
      "body": "<p>Protons (+1 charge) and neutrons (0) occupy the nucleus and each have mass near 1 u. Electrons (−1) occupy orbitals and have much smaller mass. Atomic number Z fixes the element; integer mass number A counts nucleons:</p><eq>Z = proton count; A = protons + neutrons</eq><p>A is not the periodic table’s decimal average atomic mass. Isotopes have equal proton counts but different neutron counts. Changing protons changes the element.</p><p>Losing electrons forms a positive cation; gaining electrons forms a negative anion:</p><eq>Charge = protons − electrons</eq><p>The charge is in elementary-charge units. Ordinary chemical electron transfer leaves the nucleus unchanged.</p>",
      "simple": "Protons name the element, neutrons select the isotope, and electrons help set the charge.",
      "analogy": "Think of element identity as a team name and isotope identity as a jersey version. The analogy separates labels; particles do not literally wear identities or choose roles.",
      "example": "With 12 protons and 13 neutrons, the atom is magnesium-25:<eq>A = 12 + 13 = 25; Z = 12</eq>With 10 electrons:<eq>Charge = 12 − 10 = +2</eq>Two missing electrons change the ion charge, not the element.",
      "sources": [
        "4.8",
        "4.9",
        "4.10",
        "4.16",
        "4.17",
        "4.18",
        "6.16"
      ],
      "teks": [
        "C.6(B)"
      ]
    },
    {
      "id": "mass",
      "title": "Why atomic mass is usually a decimal",
      "objective": "Calculate a weighted average atomic mass using isotope masses and fractional abundances.",
      "body": "<p>A natural sample may contain several isotopes. Its average atomic mass weights each isotope mass by its abundance: <eq>average = Σ(mass × fractional abundance)</eq>. Convert percentages to fractions, and check that the fractions add to one. The answer must lie between the lightest and heaviest isotope masses and closer to the more abundant isotope.</p><p>This average does not mean that individual nuclei contain fractional neutrons. It describes a collection. Use the isotope masses supplied in a problem rather than assuming that every isotope mass equals its integer mass number.</p>",
      "simple": "A common isotope contributes more to the average than a rare isotope.",
      "analogy": "A class average weights each group by how many students it contains; two groups with different sizes do not each get half the influence.",
      "example": "Use hypothetical isotope masses 10.00 u and 11.00 u with fractions 0.7500 and 0.2500:<eq>Average = (0.7500 × 10.00) + (0.2500 × 11.00)</eq><eq>Average = 10.25 u</eq>The average lies nearer the more abundant 10.00 u isotope. An individual atom has one isotope mass, not this average.",
      "sources": [
        "4.19",
        "4.20"
      ],
      "teks": [
        "C.6(D)"
      ]
    },
    {
      "id": "spectra",
      "title": "Energy levels leave a light fingerprint",
      "objective": "Relate emission lines to discrete energy changes and compare photon energy, frequency, and wavelength.",
      "body": "<p>Absorbing energy can excite an atom. A transition to a lower allowed state can emit a photon with the energy difference. Discrete differences produce spectral lines.</p><p>Wavelength λ is crest-to-crest distance; frequency ν is cycles per second. In vacuum:</p><eq>c = λν</eq><eq>E = hν = hc/λ</eq><p>Shorter wavelength means higher frequency and photon energy: violet photons carry more energy than red photons. Brightness can instead reflect photon number. A line pattern can identify emitting species. Real fireworks can also include molecular bands and glowing hot particles; the mission simplifies this to atomic emission.</p><p>For mission calculations:</p><eq>h = 6.626 × 10⁻³⁴ J·s; c = 2.998 × 10⁸ m/s</eq><eq>600 nm = 6.00 × 10⁻⁷ m → E ≈ 3.31 × 10⁻¹⁹ J</eq><p>The energy is per photon. Convert nanometers to meters before using c in m/s.</p>",
      "simple": "A larger energy drop produces a higher-energy photon with a shorter wavelength.",
      "analogy": "A staircase permits only certain height changes. It represents discrete energies, not a physical path followed by electrons.",
      "example": "Compare individual photons at 450 nm and 600 nm:<eq>E₄₅₀/E₆₀₀ = 600/450 ≈ 1.33</eq>The 450 nm photon carries about one-third more energy. This is not a comparison of total energy in differently bright beams.",
      "sources": [
        "5.1",
        "5.2",
        "5.3",
        "5.5",
        "acs-fireworks",
        "os-bohr"
      ],
      "teks": [
        "C.6(C)"
      ]
    },
    {
      "id": "config",
      "title": "Electron configurations and valence patterns",
      "objective": "Write simple electron configurations and Lewis symbols and use valence electrons to predict family behavior.",
      "body": "<p>An electron configuration records occupied subshells. For the first twenty elements, the filling sequence is:</p><eq>1s → 2s → 2p → 3s → 3p → 4s</eq><p>Capacities are s: 2, p: 6, d: 10, f: 14 electrons. Superscripts sum to the species’ electron count. Oxygen’s 1s² 2s² 2p⁴ gives eight total electrons, six in the outer occupied shell.</p><p>Main-group <strong>valence electrons</strong> occupy the outer shell and strongly influence bonding. Lewis symbols show them as dots: place one on each side before pairing. Group 1 has one; Group 2 has two; Groups 13–18 have three through eight. Helium instead has a full two-electron shell.</p><p>After calcium, continue with 3d then 4p. Iron is [Ar]4s²3d⁶ in filling order; brackets replace the noble gas’s complete core. Similar group configurations support similar chemistry: Al commonly forms Al³⁺; Cl forms Cl⁻. These simple charge rules do not apply unchanged to transition metals.</p>",
      "simple": "Configurations tell you where electrons are organized; Lewis dots focus on the electrons most relevant to simple bonding.",
      "analogy": "A building directory gives every floor, while a visitor badge highlights only the department you need. Neither is a literal picture of electron motion.",
      "example": "Sodium is 1s² 2s² 2p⁶ 3s¹, or [Ne]3s¹. It has one valence electron. Na⁺ has lost that electron and has ten electrons, with the same occupied configuration as neon but a different nucleus.",
      "sources": [
        "5.13",
        "5.15",
        "5.18",
        "5.19",
        "5.20",
        "8.1"
      ],
      "teks": [
        "C.6(E)",
        "C.5(B)"
      ]
    }
  ],
  "visual": {
    "title": "Watch an electron transition produce a photon",
    "instruction": "Choose the starting level for a hydrogen transition ending at n = 2. Predict which selection emits the shortest wavelength, then play the transition.",
    "observe": "Horizontal lines show allowed hydrogen energies, not physical orbits. The marker changes directly from the selected upper line to n = 2 as a photon appears; it never occupies the gap. The timing is a teaching sequence, not a predicted lifetime. Wavelengths are rounded Rydberg-model estimates; fine spectral details and air corrections are omitted.",
    "challenge": "Compare n = 3 → 2 with n = 5 → 2. Explain the difference in color using the energy gap.",
    "explanation": "The n = 5 → 2 transition releases more energy and has a shorter wavelength. This one-electron model does not predict every firework compound’s spectrum."
  },
  "honors": [
    {
      "id": "photon",
      "title": "Calculate one photon’s energy",
      "mode": "spectra",
      "body": "Use these constants and convert wavelength to meters:<eq>h = 6.62607015 × 10⁻³⁴ J·s</eq><eq>c = 2.99792458 × 10⁸ m/s</eq><eq>520 nm = 5.20 × 10⁻⁷ m</eq>Then calculate energy for one photon:<eq>E = hc/λ ≈ 3.82 × 10⁻¹⁹ J</eq>The tiny result is appropriate for one photon.",
      "question": "Would doubling the wavelength double the photon energy?",
      "answer": "No. E and λ are inversely proportional, so doubling wavelength halves the energy per photon.",
      "sources": [
        "5.2",
        "5.3"
      ],
      "teks": [
        "C.6(C)"
      ]
    },
    {
      "id": "orbitals",
      "title": "The simple filling order has limits",
      "mode": "config",
      "body": "Pauli’s principle permits two electrons per orbital with opposite spins. Hund’s rule fills equal-energy orbitals singly with parallel spins before pairing. For p³, draw one arrow in each of three boxes. Chromium is [Ar]3d⁵4s¹ and copper is [Ar]3d¹⁰4s¹: exceptions to the simplest filling prediction caused by closely spaced subshell energies and electron interactions. The mission also lists silver, [Kr]5s¹4d¹⁰, and gold, [Xe]6s¹4f¹⁴5d¹⁰. These are reference configurations, not exceptions you can deduce reliably from a slogan. An orbital is one electron-state region; a subshell contains 1, 3, 5, or 7 orbitals for s, p, d, or f, respectively.",
      "question": "Is [Ar]3d⁴4s² the observed ground-state configuration of chromium?",
      "answer": "No. The mission’s listed exception is [Ar]3d⁵4s¹. Use the stated exceptions rather than applying a “half-filled is always best” rule to every element.",
      "sources": [
        "5.16",
        "5.17",
        "5.18"
      ],
      "teks": [
        "C.6(E)"
      ]
    }
  ],
  "checks": [
    {
      "question": "Which change makes an isotope of the same element?",
      "options": [
        "Change the proton count",
        "Change the neutron count",
        "Remove all electrons"
      ],
      "answer": 1,
      "why": "Isotopes share an atomic number but differ in neutron number.",
      "section": "build"
    },
    {
      "question": "An emitted photon has a shorter wavelength. What can you conclude?",
      "options": [
        "Its energy is greater",
        "Its energy is smaller",
        "The source must be brighter"
      ],
      "answer": 0,
      "why": "E = hc/λ; the energy of each photon increases as wavelength decreases.",
      "section": "spectra"
    }
  ],
  "assessment": [
    [
      "models",
      "Atomic models",
      [
        "models"
      ],
      "Match evidence and limitations to a historical model."
    ],
    [
      "build",
      "Build an atom",
      [
        "build"
      ],
      "Identify an element, isotope, mass number, and charge."
    ],
    [
      "mass",
      "Average atomic mass",
      [
        "mass"
      ],
      "Weight isotope masses by fractional abundance."
    ],
    [
      "spectra",
      "Emission spectra",
      [
        "spectra"
      ],
      "Identify lines and compare photon energies."
    ],
    [
      "config",
      "Electron configuration",
      [
        "config"
      ],
      "Organize electrons and identify valence patterns."
    ],
    [
      "capstone",
      "Final evidence",
      [
        "build",
        "mass",
        "spectra",
        "config"
      ],
      "Combine independent atomic clues into a defensible identification."
    ],
    [
      "casefile",
      "Firework colors",
      [
        "spectra"
      ],
      "Compare two wavelengths and explain their energy gaps."
    ]
  ],
  "caseNote": "The firework question assesses the relationship between wavelength and energy. Treat its selected wavelengths as comparison values; real pyrotechnic spectra can involve molecules and multiple overlapping emissions.",
  "glossary": [
    [
      "Atomic number",
      "The number of protons in a nucleus."
    ],
    [
      "Mass number",
      "The total number of protons and neutrons."
    ],
    [
      "Isotope",
      "One of an element’s forms with a particular neutron count."
    ],
    [
      "Ion",
      "An atom or group with a net electric charge."
    ],
    [
      "Atomic mass unit",
      "A mass unit defined as one-twelfth the mass of a carbon-12 atom."
    ],
    [
      "Orbital",
      "A quantum description of an electron’s probability distribution."
    ],
    [
      "Ground state",
      "The lowest-energy state of a species."
    ],
    [
      "Excited state",
      "A state with energy above the ground state."
    ],
    [
      "Photon",
      "A quantum of electromagnetic radiation."
    ],
    [
      "Wavelength",
      "Distance between successive wave crests."
    ],
    [
      "Frequency",
      "Wave cycles per second."
    ],
    [
      "Valence electron",
      "An electron involved in the outer-electron patterns that govern bonding."
    ],
    [
      "Subshell",
      "A group of orbitals labeled s, p, d, or f within an electron configuration."
    ]
  ],
  "skills": {
    "a": [
      "models"
    ],
    "b": [
      "build"
    ],
    "d": [
      "mass"
    ],
    "c": [
      "spectra"
    ],
    "e": [
      "config"
    ],
    "f": [
      "config"
    ],
    "h1": [
      "honors-photon"
    ],
    "h2": [
      "honors-orbitals"
    ],
    "cap": [
      "build",
      "mass",
      "spectra",
      "config"
    ]
  }
};
