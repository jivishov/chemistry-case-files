# Critical review of the Grade 10 lessons

> Historical local verification. See [the September 26 integration record](reading-mission-integration.md) for the current deployed structure and combined checks.

Reviewed and refined September 25, 2026 (America/Chicago).

The first version had substantive gaps. Several assessed operations were mentioned without enough instruction, one animation could imply forbidden intermediate electron energies, and some linked case explanations claimed more than their models supported. These findings were corrected in the active course. This is an author-led scientific and instructional review, not independent teacher approval.

## Scope and method

The review covered all 11 new lesson manuscripts: 54 core sections, 25 Honors extensions, the 11 local illustrations/models, worked examples, practice explanations, and glossaries. The readings were compared with the active mission skill definitions, question pools, calculation methods, and case-file questions. The alignment record now identifies preparatory sections for all **83 graded skills**, including Honors and capstones, in addition to the **69 assessment-tab mappings**.

The active path is the course home → `units/<unit>/learn.html` → `units/<unit>/index.html`. These assessment pages reuse the matching mission implementations in `units_new`. Separate prototype/alternate entry pages, including Unit 5A, were not brought into the new lesson sequence. Source availability checks and structural mapping tests complement the content review; neither proves that an explanation is sufficient or correct by itself.

## Findings and refinements

| Unit | Finding | Refinement |
| --- | --- | --- |
| 1 · Measurement | A first-order uncertainty estimate could be mistaken for an exact statistical interval. Cylinder markings did not justify the displayed precision clearly enough. | Distinguished worst-case bounds from standard deviations, included an exact endpoint density interval, added 1 mL graduations, and kept the sample drawing clear of scale labels. |
| 2 · Atomic structure | The core spectrum mission requires numerical photon energy, but the method was largely confined to Honors. Some assessed configurations and exceptions were missing. The moving marker crossed forbidden energies. | Added constants, nanometer conversion, a core numerical example, configurations beyond calcium, and the assessed Ag/Au exceptions. The marker now switches between allowed levels; no intermediate energy is drawn. Wavelength precision and the artificial animation timing are stated. |
| 3 · Periodic trends | Atomic-mass trends and the invented reactivity index needed explanation. The battery case conflated periodic clues with complete cell performance. | Added mass exceptions and the fictional index boundary. Rewrote the battery case around separate ion/electron paths and complete electrode reactions. Removed a universal phone-lithium mass and aqueous-potential claims. The graphite illustration now describes lithium leaving its host rather than depicting bare lithium metal. |
| 4 · Bonding | Naming questions require an ion reference; the assessed SO₂ geometry was not explicitly taught. Some scenario clues implied testing or disposing of real unknowns. | Added common ion charges, contrasted three-domain SO₂ with four-domain H₂O, and bounded the BeF₂ example. Changed the unknown-bottle task to supplied records and a classroom routing rule. Corrected the distinction between about 9% volume expansion and about 8% lower density for ordinary ice. |
| 5 · The mole | Significant-figure wording and the conversion analogy needed tightening. The Apollo calculation could be read as mission data or a complete life-support specification. | Improved precision and the analogy. Labeled the 20 mol assumption and ideal LiOH capacity. Changed the CO₂ illustration to a qualitative trend, removing unsupported numeric danger/safety thresholds. |
| 6 · Reactions | Assessed oxidation-number and disproportionation reasoning was insufficiently explained. Airbag timings, gas volume, and byproducts were overstated. | Added oxidation-number rules and H₂O₂ disproportionation. Recast the airbag as a historical primary-reaction example, with 67.2 L explicitly at 0 °C and 1 atm. Removed exact deployment deadlines, an unbalanced cleanup graphic, and blanket harmless-byproduct claims. |
| 7 · Gases | Temperature was described too directly as kinetic energy. One mission explanation implied immediate uniform mixing of breathing gas. | Stated proportionality to average kinetic energy, with different units. Replaced the instant-mixing claim with diffusion and condition-dependent mixing time. |
| 8 · Solutions | Qualitative precipitation missions needed more complete reference rules, while the distinction from quantitative precipitation was easy to miss. | Added relevant halide, sulfate, and hydroxide exceptions, with Q versus Ksp and mixed-volume concentration limits. |
| 9 · Acids and bases | The ammonia definition question depended on an unstated convention. Several assessed acids/bases and naming relationships lacked preparation. pH endpoints were all described as dilute. | Made the ammonia question explicitly about proton acceptance; explained the Arrhenius convention. Added the assessed reference list, H₃PO₃'s two acidic hydrogens, and stepwise sulfuric-acid behavior. The model distinguishes pH/activity from ideal concentration arithmetic. Dental examples no longer equate one pH with a guaranteed amount of damage. |
| 10 · Thermochemistry | The absolute-zero question and formation-enthalpy calculation needed more direct preparation. | Added the unattainability of absolute zero by finite cooling and a worked formation-enthalpy example, including coefficient scaling. |
| 11 · Nuclear | The neptunium series incorrectly ended at “stable” Bi-209. Several application, binding-energy, and effective-half-life operations lacked adequate preparation. Mission feedback made absolute shielding and clinical-outcome claims. | Changed the endpoint to stable Tl-205, requiring eight alpha and four beta-minus decays. Added worked binding-energy and retention-threshold calculations, metastable notation, neutron capture, specific activity, and assessed applications. Distinguished Co-60 beta decay from its daughter's gamma emission. Bounded radiation ranges, fusion activation waste, and the biological-clearance model; arithmetic outcomes are no longer labeled patient-release or overdose decisions. |

Core preparation is kept in the main reading. Optional Honors boxes retain advanced calculations and limitations, with their own challenge reasoning. The simpler restatements, bounded analogies, worked examples, objectives, and final glossaries remain in every unit. Scientific vocabulary is explained rather than replaced with informal synonyms. No exact reading-grade score or classroom learning gain is claimed.

## Source checks that informed corrections

References beside the lesson sections remain the student-facing source record. Targeted checks included:

- Discrete energies and photon calculations: [OpenStax, The Bohr Model](https://openstax.org/books/chemistry-2e/pages/6-2-the-bohr-model).
- Electron domains and molecular geometry: [OpenStax, Molecular Structure and Polarity](https://openstax.org/books/chemistry-2e/pages/7-6-molecular-structure-and-polarity).
- Sample spread and uncertainty: [NIST, Measures of Scale](https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm), alongside the analytical-chemistry uncertainty reference linked in Unit 1.
- Electrode hosts and lithium-ion operation: [Nobel Prize scientific background](https://www.nobelprize.org/uploads/2019/10/advanced-chemistryprize2019-2.pdf) and the NASA battery reference linked in Unit 3.
- Airbag system context: [NHTSA, Air Bags](https://www.nhtsa.gov/vehicle-safety/air-bags). This does not establish the example's calculated amount as an actual inflator specification.
- Proton-transfer definitions and oxyacid structure: [OpenStax, Brønsted–Lowry Acids and Bases](https://openstax.org/books/chemistry-2e/pages/14-1-bronsted-lowry-acids-and-bases) and [Oxygen Compounds](https://openstax.org/books/chemistry-2e/pages/18-9-occurrence-preparation-and-compounds-of-oxygen).
- Decay chains and nuclear reactions: [OpenStax, Nuclear Reactions](https://openstax.org/books/university-physics-volume-3/pages/10-4-nuclear-reactions). Application boundaries also use the linked NRC and DOE references, including [DOE, Fusion Energy](https://www.energy.gov/topics/fusion-energy).

The final [link check](lesson-source-check.json) records **202 of 202 section references available**. One Open University link returned an access challenge and was replaced with the accessible OpenStax treatment of the same oxyacid point. Khan Academy's optional high-school chemistry course was separately checked as a further-learning destination. Availability means a successful response without a detected error title; it is not a sentence-by-sentence source audit, a license grant, or publisher endorsement. No external images or videos were republished.

## Verification and limits

- The regenerated HTML matches all 11 lesson sources. `npm test` passes: 1,441 assertions in the existing suites, plus the expanded lesson checks.
- Lesson checks cover all 83 registered graded skills, 69 active tabs, valid instructional anchors, core/Honors placement, source identifiers, and independent numerical invariants. New regressions check allowed atomic energy states and all four nuclear-series endpoints through the actual mission's balance getter.
- Older prose tests that enforced the unsupported exact airbag timing, phone lithium mass, battery-voltage explanation, or zero-range radiation claim were revised to check the corrected content. Case data are checked independently of quote style and formatting.
- The connected browser loaded every lesson at 360 and 1366 pixels: 22 layouts, working model controls, no horizontal document overflow, and the glossary as the last instructional section.
- Focused browser checks verified the atomic marker before/after emission, displacement readouts and visible scale, pH endpoint caveats and reset, and all four steps in the six case files revised in this review. No new console errors were observed during those checks.

The broader initial implementation checks are recorded separately in [lesson-validation.md](lesson-validation.md); they are not all claimed as fresh checks in this review. Automated generator checks do not equal completing every randomized student assessment. This review does not establish classroom effectiveness, independent scientific approval, complete screen-reader acceptance, or operational validity for the stories' medical, engineering, and disposal contexts. No public deployment was performed.
