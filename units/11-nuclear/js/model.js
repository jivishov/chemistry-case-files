// model.js - Unit 11 domain data (Nuclear Chemistry, TEKS C.14).
//
// Domain data reused by the active units/ entry page. Lesson-fidelity review corrects
// scientific claims and distinguishes classroom arithmetic from clinical decisions.
//
// Pure data plus the standards map. Every quantity that gets calculated lives in
// shared/js/chem.js (DECAY_PARTICLES, decayProduct, isBalancedNuclear, symbolForZ,
// halfLifeRemaining, radiometricAge, nucleonMassSum, massDefect, bindingEnergyMeV,
// effectiveHalfLife, NUCLIDES); this file only holds the pools the stages draw from
// and the scenario fiction that turns each number into a consequence.
//
// World: "Hot Lab". You are the nuclear medicine technologist in a hospital
// radiopharmacy. Eight patients are on this morning's list. The generator was eluted
// at 07:00 and the technetium in that vial has been decaying ever since, so the world
// state IS nuclear: an activity in millicuries that the clock eats whether you are
// ready or not. Every wrong call costs minutes, and minutes cost activity.

// Standards map: C.14 has three sub-letters, and (C) carries two stages because
// half-life is the vehicle for the imaging application rather than a letter of its
// own. Decay series, binding energy and patient dosage are not named in C.14, so all
// three ride the Honors track. Stable ids key the mastery meters in the right rail.
export const SE = [
  { id: 'a',  code: 'C.14(A)', mode: 'ident', honors: false,
    text: 'Describe the characteristics of alpha, beta, and gamma decay in terms of balanced nuclear equations.' },
  { id: 'b',  code: 'C.14(B)', mode: 'power', honors: false,
    text: 'Compare fission and fusion reactions.' },
  { id: 'c',  code: 'C.14(C)', mode: 'apply', honors: false,
    text: 'Give examples of applications of nuclear phenomena: nuclear stability, radiation therapy, diagnostic imaging, solar cells, and nuclear power.' },
  { id: 'hl', code: 'C.14(C)', mode: 'dose',  honors: false,
    text: 'Apply half-life to a real imaging schedule: work out how much activity is left by the time the dose is actually given.' },
  { id: 'h1', code: 'Honors',  mode: 'ident', honors: true,
    text: 'Honors: follow a whole decay series from an unstable parent down to a stable isotope, conserving mass number and atomic number the whole way.' },
  { id: 'h2', code: 'Honors',  mode: 'power', honors: true,
    text: 'Honors: mass defect and binding energy per nucleon, the curve that explains why fission and fusion both release energy.' },
  { id: 'h3', code: 'Honors',  mode: 'dose',  honors: true,
    text: 'Honors: combine physical and biological half-life in a stated first-order model and calculate when a specified activity fraction remains.' }
];

// The four emissions, with the field evidence that tells them apart. The penetration
// descriptions are the real ones a survey meter gives you, which is exactly what
// C.14(A) means by "characteristics". `notation` feeds the mhchem equation.
export const EMISSIONS = [
  { key: 'alpha', tag: 'Alpha', notation: '^{4}_{2}He',
    label: 'A helium-4 nucleus, charge +2, with a short range. Paper can stop typical alpha particles; internal exposure is a different situation.' },
  { key: 'beta', tag: 'Beta minus', notation: '^{0}_{-1}e',
    label: 'An electron emitted with an antineutrino as a neutron changes to a proton. Its range and suitable shielding depend on energy.' },
  { key: 'gamma', tag: 'Gamma', notation: '^{0}_{0}\\gamma',
    label: 'A photon emitted as a nucleus loses excitation energy. It has no rest mass or charge; shielding attenuates it rather than defining one universal stopping thickness.' },
  { key: 'positron', tag: 'Positron (beta plus)', notation: '^{0}_{+1}e',
    label: 'A positron emitted with a neutrino as a proton changes to a neutron. Annihilation with an electron commonly produces two approximately opposite 511 keV photons.' }
];

// Why an isotope is right for a job. One of these is the decisive property in each
// C.14(C) scenario, and the goal text always points at which kind of reason it is.
export const REASONS = [
  { key: 'penetrating',
    label: 'Its useful gamma photons can reach an external detector; their interactions still deposit some energy in matter.' },
  { key: 'positron',
    label: 'Positron emission can produce a pair of approximately 511 keV annihilation photons detected in coincidence by PET.' },
  { key: 'beta-local',
    // Used for beta-emitting sources in different settings; ranges depend on energy.
    label: 'Its beta emission deposits energy over a relatively short, energy-dependent range, useful in the specified application.' },
  { key: 'alpha-contained',
    label: 'Its short-range alpha particles ionize air within an intact, designed detector; containment and other emissions still matter.' },
  { key: 'short-half',
    label: 'Its relatively short half-life limits persistence on the timescale of the application; activity does not disappear at a fixed deadline.' },
  { key: 'long-half',
    label: 'Its long half-life permits useful activity over years, although output falls and suitability also depends on other properties.' },
  { key: 'matched-clock',
    label: 'Its decay timescale and the sample history allow a measurable remaining fraction appropriate for dating.' }
];

// Half-life units the dose stage works in, expressed in hours so a scenario can
// display every candidate isotope on one scale.
export const UNIT_HOURS = { min: 1 / 60, h: 1, d: 24, y: 8766 };
export const UNIT_LABEL = { min: 'minutes', h: 'hours', d: 'days', y: 'years' };

// Honors h1: four real decay series. Each runs from a long-lived parent to a stable
// end point, and the whole chain is fixed by two counts, because only alpha changes
// the mass number. The answer key is derived, not stored: A must fall by 4 per alpha,
// and Z must land on the end point once alphas take 2 each and betas give 1 back.
export const SERIES = [
  { id: 'u238', name: 'the uranium series',
    parent: { sym: 'U-238', A: 238, Z: 92 }, end: { sym: 'Pb-206', A: 206, Z: 82 },
    story: 'The geology department keeps a sealed uranium ore standard in the same vault as your sources. Everything in that rock older than the rock itself came down this chain, and the radon in a basement anywhere in the county is one of its steps.' },
  { id: 'u235', name: 'the actinium series',
    parent: { sym: 'U-235', A: 235, Z: 92 }, end: { sym: 'Pb-207', A: 207, Z: 82 },
    story: 'This is the chain under the uranium that reactors actually run on. The same fuel that fissions when it catches a neutron will, left alone, take this route instead, one small piece at a time.' },
  { id: 'th232', name: 'the thorium series',
    parent: { sym: 'Th-232', A: 232, Z: 90 }, end: { sym: 'Pb-208', A: 208, Z: 82 },
    story: 'Thorium is in the sand on half the beaches in the world and in the mantle of an old camping lantern. It is the reason a geiger counter never reads zero outdoors.' },
  { id: 'np237', name: 'the neptunium series',
    parent: { sym: 'Np-237', A: 237, Z: 93 }, end: { sym: 'Tl-205', A: 205, Z: 81 },
    story: 'The neptunium series ultimately reaches stable thallium-205. Bismuth-209 is an extremely long-lived alpha emitter, once regarded as stable. Count all alpha and beta-minus steps to the stated endpoint.' }
];

// Honors h2: measured atomic masses (u), from the standard mass tables. Pair each with
// nucleonMassSum and the binding energy per nucleon comes out on the real curve, which
// peaks near iron and falls away on both sides.
export const BINDING_CASES = [
  { sym: 'H-2',   name: 'deuterium',    A: 2,   Z: 1,  mass: 2.014102,
    story: 'The fusion vendor keeps quoting deuterium. Work out how tightly its one proton and one neutron are actually held together before you believe anything else in the brochure.' },
  { sym: 'He-4',  name: 'helium-4',     A: 4,   Z: 2,  mass: 4.002603,
    story: 'A helium-4 nucleus is an alpha particle, and helium-4 is the net product of the main hydrogen-fusion chains in the Sun. The mass supplied here is for a neutral helium-4 atom.' },
  { sym: 'C-12',  name: 'carbon-12',    A: 12,  Z: 6,  mass: 12.000000,
    story: 'Carbon-12 defines the mass unit itself, so its atomic mass is exactly 12 by definition. Its nucleons still weigh more apart than together, and that difference is the whole story.' },
  { sym: 'Fe-56', name: 'iron-56',      A: 56,  Z: 26, mass: 55.934936,
    story: 'Iron-56 lies near the broad binding-energy maximum in the iron-nickel region. The graph explains broad energy trends, but the energy of a particular reaction requires its complete reactants and products.' },
  { sym: 'Kr-92', name: 'krypton-92',   A: 92,  Z: 36, mass: 91.926156,
    story: 'Krypton-92 is one of the fragments the reactor leaves when a uranium-235 nucleus splits. Work out where it lands on the curve, then compare that against the uranium it came out of.' },
  { sym: 'U-235', name: 'uranium-235',  A: 235, Z: 92, mass: 235.043930,
    story: 'Uranium-235 is where the molybdenum in your generator starts. Work out how tightly bound it is, and you will see why splitting it is worth doing.' }
];

// Honors h3: real radiopharmaceutical dosimetry. Physical half-life is the isotope's
// own; biological half-life is how fast the body clears the compound it is bolted to;
// the retained activity falls on the combination of the two.
export const DOSAGE_CASES = [
  { id: 'i131-ward', agent: 'iodine-131 sodium iodide', isotope: 'I-131',
    physical: 8.02, biological: 7.0, unit: 'd', threshold: 0.30,
    story: 'Classroom retention model for iodine-131 sodium iodide: use the supplied physical and biological half-lives to find when the retained fraction reaches 30%. The biological value and threshold are example inputs, not a patient-release rule.',
    why: 'Assume independent first-order physical decay and biological removal. Their rates add. Real clearance can involve several compartments, and activity alone does not determine a clinical decision.' },
  { id: 'tc99m-room', agent: 'technetium-99m MDP bone agent', isotope: 'Tc-99m',
    physical: 6.0, biological: 24.0, unit: 'h', threshold: 0.25,
    story: 'Classroom retention model for technetium-99m MDP bone agent: use the supplied physical and biological half-lives to find when the retained fraction reaches 25%. The biological value and threshold are example inputs, not a patient-release rule.',
    why: 'Assume independent first-order physical decay and biological removal. Their rates add. Real clearance can involve several compartments, and activity alone does not determine a clinical decision.' },
  { id: 'f18-bay', agent: 'fluorine-18 FDG', isotope: 'F-18',
    physical: 1.8333, biological: 4.0, unit: 'h', threshold: 0.20,
    story: 'Classroom retention model for fluorine-18 FDG: use the supplied physical and biological half-lives to find when the retained fraction reaches 20%. The biological value and threshold are example inputs, not a patient-release rule.',
    why: 'Assume independent first-order physical decay and biological removal. Their rates add. Real clearance can involve several compartments, and activity alone does not determine a clinical decision.' }
];

// Dose tolerance. Activity readings genuinely vary with how carefully the learner
// handles the exponent, so the dose stage keeps the full four-band grading, relative
// because a millicurie means something different on a 300 mCi vial than a 12 mCi one.
const A_BANDS = { mode: 'relative', ideal: 0.02, acceptable: 0.06 };

// SCENARIOS — the game layer for Hot Lab. One coherent world: a hospital radiopharmacy
// on a Tuesday morning, a scan list, and a vial that is quietly getting weaker.
//   ident (C.14A): identity. Read the survey evidence to name the emission, then set
//                  the daughter's mass number and atomic number so the equation
//                  balances. Both halves are the standard.
//   power (C.14B): decision. Classify the equation as fission, fusion, or neither,
//                  then answer the supply-chain question that depends on it.
//   apply (C.14C): decision. Pick the isotope the job needs and name the property
//                  that decided it. Each wrong isotope carries its real consequence.
//   dose  (C.14C): dose. Pick the right half-life, then commit the activity that will
//                  actually be left when the dose is given.
//   h1/h2/h3:      decay series, binding energy per nucleon, effective half-life.
//   cap:           the last patient of the morning, called against a vial you spent.
export const SCENARIOS = [
  // ---------- C.14(A) name the emission, balance the equation ----------
  { id: 'a-generator', stage: 'ident', skill: 'a', type: 'identity',
    nuclide: 'Mo-99', system: 'Generator column', icon: '\u{1F9EA}',
    goal: 'The week\'s technetium generator arrives in its lead pig. The paperwork says the column is loaded with molybdenum-99. Confirm what it is doing before you elute it into a patient dose.',
    why: 'Everything on today\'s list comes off this column. If the parent is not what the label says, every dose you draw from it is wrong in a way no camera will show you.',
    evidence: 'The supplied nuclear record shows Mo-99 changing to Tc-99m with A unchanged and Z increasing by one. Charged beta particles are accompanied by photon emissions from the source and daughter system. Identify the parent transformation, not a complete shielding design.',
    consequences: {
      beta: 'Mo-99 undergoes beta-minus decay to technetium. The emitted electron is accompanied by an antineutrino; the generator also has photon radiation. A plastic sheet alone does not establish complete shielding.',
      alpha: 'You log it as an alpha emitter and handle it as a contamination-only hazard behind paper. A source that reads clean through paper is not alpha, and the shielding you just signed off does nothing.',
      gamma: 'Photon emissions are present, but pure gamma emission cannot change Z from 42 to 43. The parent transformation is beta-minus decay.',
      positron: 'You log a positron emitter and go looking for the paired 511 keV photons that a coincidence detector would see. They are not there, because there is no annihilation happening, and you have described the wrong nucleus.'
    } },
  { id: 'a-eluate', stage: 'ident', skill: 'a', type: 'identity',
    nuclide: 'Tc-99m', system: 'Morning elution', icon: '\u{1F489}',
    goal: 'You rinse the column with saline and draw off the eluate. This is the technetium-99m that goes into eight people today. Write what it does when it settles.',
    why: 'The whole reason this isotope owns nuclear medicine is what it does NOT do. Getting that equation right is the difference between an imaging agent and a dose of radiation with no picture attached.',
    evidence: 'Tc-99m has an excited nucleus. Its principal useful imaging emission is a photon near 140 keV; A and Z stay unchanged as it reaches Tc-99. Other transition channels, including conversion electrons, can also occur.',
    consequences: {
      gamma: 'Right. The m stands for metastable: the nucleus is holding excess energy and sheds it as a single 140 keV gamma photon, with no change to A or Z at all. That is why it images so cleanly, because nothing particulate is left in the patient.',
      alpha: 'You log an alpha emitter and inject it. If that were true you would be putting a heavily ionising particle emitter into eight people and getting no picture, because alphas never reach the camera.',
      beta: 'You log a beta emitter. A beta would raise the atomic number by one, and the spectrometer says the element never changed. You have also just claimed a particulate dose to every patient today that this isotope does not deliver.',
      positron: 'You log a positron emitter and book the patients onto the PET ring instead of the gamma camera. The ring sees nothing, because there are no 511 keV pairs, and eight people sit through a scan that produces no image.'
    } },
  { id: 'a-therapy', stage: 'ident', skill: 'a', type: 'identity',
    nuclide: 'I-131', system: 'Therapy capsule', icon: '\u{1F48A}',
    goal: 'A single iodine-131 capsule for a thyroid patient sits in its own shielded pot. Write the decay so you can brief her family about what she will be giving off.',
    why: 'She is going home with this inside her. Her family is going to ask what comes out of her, and "radiation" is not an answer anybody can act on.',
    evidence: 'The pot reads through paper. A centimetre of acrylic knocks most of it down, but a stubborn penetrating component gets through the acrylic and needs lead, because the daughter nucleus is left excited and sheds a gamma photon straight after.',
    consequences: {
      beta: 'Right. Iodine-131 beta decays, and the beta is what treats her: it stops inside a millimetre or two of thyroid tissue and kills the overactive cells. The gamma that follows is why she keeps her distance from small children for a few days.',
      alpha: 'You brief the family for an alpha emitter, which means no external hazard at all. There is a penetrating gamma coming off her, and you have just told a household with a toddler in it that there is nothing to keep clear of.',
      gamma: 'You brief them for a pure gamma emitter. That accounts for the distance rule but not for the treatment. If nothing particulate were deposited, the capsule would image her thyroid and do nothing to it.',
      positron: 'You brief a positron emitter, which would make her a walking 511 keV source in a way she is not. The instruction sheet you print is for the wrong energy and the wrong distance.'
    } },
  { id: 'a-pet', stage: 'ident', skill: 'a', type: 'identity',
    nuclide: 'F-18', system: 'PET tracer delivery', icon: '\u{2622}\u{FE0F}',
    goal: 'The FDG delivery from the cyclotron arrives at 08:20 with a smudged label. Confirm the fluorine-18 decay before it goes on the ring.',
    why: 'PET only works because of what this isotope does. Confirming it is confirming that the scanner will see anything at all.',
    evidence: 'The detector logs photons in pairs: two at 511 keV, arriving within nanoseconds of each other, travelling in exactly opposite directions. Nothing else in the vault does that.',
    consequences: {
      positron: 'Right. Fluorine-18 emits a positron, which travels about a millimetre before it meets an electron and annihilates. The two 511 keV photons fly apart back to back, and the ring draws a line between the two detectors that fired. Every PET image is built from those lines.',
      alpha: 'You call it alpha and route it to the gamma camera as a contamination case. Nothing images, the delivery decays in the corner, and the cyclotron will not have another batch until tomorrow.',
      beta: 'You call it ordinary beta decay. A beta minus would lower nothing into 511 keV pairs, and the coincidence signature you are looking at is the single most distinctive thing in the building.',
      gamma: 'You call it a gamma emitter. Gamma photons come out one at a time at whatever energy the nucleus sheds, not in back-to-back pairs at exactly 511 keV. That number is the rest mass of an electron, and it means annihilation.'
    } },
  { id: 'a-teletherapy', stage: 'ident', skill: 'a', type: 'identity',
    nuclide: 'Co-60', system: 'Teletherapy head', icon: '\u{2600}\u{FE0F}',
    goal: 'The old cobalt-60 teletherapy unit is being decommissioned and the physicist wants the source decay written on the transfer form.',
    why: 'That form travels with the source to the disposal facility. Whoever opens the crate at the other end plans their shielding from what you wrote.',
    evidence: 'The supplied record identifies Co-60 changing to excited Ni-60 by beta-minus decay, followed by penetrating gamma emissions. The photons dominate radiation outside the source capsule; identify the initial change in the parent nucleus.',
    consequences: {
      beta: 'Right. Cobalt-60 beta decays to nickel-60, and the point of the machine is the pair of high-energy gamma photons the excited nickel sheds immediately afterwards. The beta itself never leaves the source capsule, which is why the form has to say what the nucleus does, not just what escapes.',
      alpha: 'You write alpha on a form that travels with a source needing five centimetres of lead. The receiving crew plans for a contamination hazard and opens a crate they should have handled at arm\'s length behind shielding.',
      gamma: 'You write pure gamma. That matches what escapes the capsule, but the nucleus is transmuting: cobalt becomes nickel, and a pure gamma transition cannot change the element. The form now describes a nucleus that does not exist.',
      positron: 'You write positron emission, so the receiving facility sets up coincidence counting at 511 keV and sees an energy spectrum that does not match anything on the paperwork. The source is quarantined for a week.'
    } },
  { id: 'a-eye', stage: 'ident', skill: 'a', type: 'identity',
    nuclide: 'Sr-90', system: 'Eye applicator', icon: '\u{1F441}\u{FE0F}',
    goal: 'Ophthalmology has a strontium-90 applicator they press against the eye to treat a surface lesion. Write its decay for the annual source inventory.',
    why: 'This one touches a human eye. The inventory has to say exactly what is coming out of it and how deep that goes.',
    evidence: 'Sr-90 undergoes beta-minus decay to Y-90, which is also radioactive. The charged-particle range depends on energy, and shielding can generate bremsstrahlung. This question identifies the parent decay rather than prescribing shielding.',
    consequences: {
      beta: 'Right. Strontium-90 is a pure beta emitter, and that is exactly why it can sit against an eye: the electrons deposit their energy within a couple of millimetres of surface tissue and nothing carries on into the lens or the brain behind it.',
      alpha: 'You log alpha. An alpha would not make it through the applicator window at all, so the device would do nothing, and you have just certified a treatment source that on your own description cannot treat anything.',
      gamma: 'You log gamma on a source with no penetrating component whatsoever. If that were true, an applicator pressed against an eye would be irradiating the whole head, and the inventory would trigger a shielding review that is not needed.',
      positron: 'You log positron emission, which would put 511 keV photons through the patient\'s skull from an applicator held against the eyeball. The meter says nothing penetrating is coming out.'
    } },
  { id: 'a-radium', stage: 'ident', skill: 'a', type: 'identity',
    nuclide: 'Ra-226', system: 'Legacy find', icon: '\u{1F5DD}\u{FE0F}',
    goal: 'A contractor pulls a small lead box out of a wall cavity during the basement refit. Inside are 1940s radium needles from when this hospital ran its own brachytherapy. Write what radium-226 does.',
    why: 'The daughter of this decay is a gas, and the box has been leaking into a sealed basement for eighty years. What you write decides whether anybody goes back down there today.',
    evidence: 'The supplied record shows Ra-226 producing Rn-222 and a helium-4 nucleus. The source and its daughters can also emit penetrating radiation, and radon is a gas. Short alpha range does not make an uncharacterized source harmless.',
    consequences: {
      alpha: 'Right. Radium-226 alpha decays, and the reason the room air reads is that the daughter is radon-222, an alpha-emitting noble gas that will not stay put. The basement gets ventilated before anybody works down there and the needles go into a sealed transfer pot.',
      beta: 'You log beta. Betas are not stopped by a paper towel, and calling it beta means missing the daughter entirely: nobody looks for the gas, and the refit crew works a shift in an unventilated basement.',
      gamma: 'You log gamma. A gamma source does not go silent behind a paper towel, and gamma emission does not produce a new element, so there is no gas to explain the room reading. The ventilation never gets ordered.',
      positron: 'You log positron emission from a 1940s radium needle. There is no 511 keV coincidence anywhere in this reading, and the basement stays sealed with an unrecognised radon source in it.'
    } },
  { id: 'a-checksource', stage: 'ident', skill: 'a', type: 'identity',
    nuclide: 'Am-241', system: 'Daily check source', icon: '\u{1F6E1}\u{FE0F}',
    goal: 'Every survey meter in the department is checked each morning against a small sealed americium-241 button. Write its decay for the QA log.',
    why: 'If the check source is misdescribed, every meter in the building is being verified against the wrong expectation, and a meter that reads wrong is worse than no meter at all.',
    evidence: 'Held at contact the meter pegs. Slide a business card between the button and the probe and the reading collapses to background. There is a weak 60 keV photon that gets through, but the bulk of what it puts out does not clear a piece of card.',
    consequences: {
      alpha: 'Right. Americium-241 alpha decays, and that heavily ionising alpha is exactly what a smoke detector uses: it ionises the air in a small chamber, and smoke particles interrupt the current. A piece of card stops it because an alpha barely travels a few centimetres in air.',
      beta: 'You log beta on a source that a business card stops. Betas walk through card. Every meter in the department is now being checked against the wrong particle and the wrong energy.',
      gamma: 'You log gamma. The weak 60 keV photon is real, but it is the small part, not the bulk. Calling the whole source gamma means the QA log expects a reading that card should not change, and the next tech to check a meter will think the meter is broken.',
      positron: 'You log positron emission. There are no 511 keV pairs here, and the QA baseline you write down does not match any meter in the building.'
    } },

  // ---------- C.14(B) fission, fusion, or neither ----------
  { id: 'b-supply', stage: 'power', skill: 'b', type: 'decision',
    system: 'Where the molybdenum comes from', icon: '\u{1F3ED}',
    goal: 'Your generator column is loaded with molybdenum-99, and there are only a handful of reactors on Earth that make it. This is the reaction they run. Classify it, then answer supply.',
    why: 'When one of those reactors goes down for maintenance, scans get cancelled across whole countries. Knowing what the reaction actually is tells you why it cannot be done in a garage.',
    ce: '^{235}_{92}U + ^{1}_{0}n -> ^{99}_{42}Mo + ^{135}_{50}Sn + 2^{1}_{0}n',
    kind: 'fission',
    kindNote: 'A heavy nucleus absorbs a neutron and splits into two much smaller nuclei plus spare neutrons.',
    question: { prompt: 'What is happening inside that reactor?',
      options: [
        { key: 'split', label: 'Heavy nuclei absorb a neutron and split into smaller ones, releasing more neutrons that go on to split more nuclei' },
        { key: 'join',  label: 'Light nuclei are forced together into heavier ones' },
        { key: 'wait',  label: 'Uranium atoms are decaying on their own at a fixed rate and molybdenum is what they turn into' }
      ], correct: 'split' },
    consequences: {
      split: 'Right. The molybdenum in your column is a fission fragment: a piece of a uranium nucleus that came apart. That is why it takes a reactor, and why five ageing reactors supply most of the world.',
      join:  'You tell the supply meeting the reactor is a fusion machine. They budget for a technology that does not exist commercially, and nobody arranges the backup supply contract that a real reactor outage will need.',
      wait:  'You tell them uranium just turns into molybdenum on its own. It does not: the split has to be triggered by a neutron. The department stops treating the reactor schedule as a supply risk and gets caught flat when it goes offline.'
    } },
  { id: 'b-sun', stage: 'power', skill: 'b', type: 'decision',
    system: 'The panels on the roof', icon: '\u{2600}\u{FE0F}',
    goal: 'The vault chiller runs off the solar array on the roof. Somebody asks whether that makes the chiller nuclear powered. Classify the reaction that ultimately runs it, then answer.',
    why: 'A solar cell is not a nuclear device, but the energy it collects is nuclear all the way down. That distinction is worth being able to make out loud.',
    ce: '4^{1}_{1}H -> ^{4}_{2}He + 2^{0}_{+1}e',
    kind: 'fusion',
    kindNote: 'Four light nuclei end as one heavier nucleus. Mass goes down, energy comes out.',
    question: { prompt: 'Where does the energy in that sunlight actually start?',
      options: [
        { key: 'core',  label: 'Hydrogen nuclei fusing into helium in the sun\'s core, 150 million kilometres away' },
        { key: 'panel', label: 'Nuclei splitting inside the silicon of the panel itself' },
        { key: 'decay', label: 'Radioactive decay of trace isotopes in the panel material' }
      ], correct: 'core' },
    consequences: {
      core:  'Right. The panel is just a converter: photons in, electrons out, no nuclear process in the silicon at all. Every joule it delivers was released by fusion in a star and spent eight minutes in transit.',
      panel: 'You claim the panel splits nuclei. If silicon were fissioning on the roof, the array would be a licensable radiation source and the vault would need a survey. It is not, and the claim will not survive the first person who checks.',
      decay: 'You put it down to decay in the panel. A solar cell that ran on its own decay would work at night, and it does not. The energy is arriving from outside, and it is arriving as light.'
    } },
  { id: 'b-vendor', stage: 'power', skill: 'b', type: 'decision',
    system: 'The vendor pitch', icon: '\u{1F4BC}',
    goal: 'A sales rep is offering a compact fusion generator that would supposedly make the department energy independent. This is the reaction on the brochure. Classify it, then answer the obvious question.',
    why: 'Somebody in that meeting has to know why this has been twenty years away for seventy years. It is not a funding problem.',
    ce: '^{2}_{1}H + ^{3}_{1}H -> ^{4}_{2}He + ^{1}_{0}n',
    kind: 'fusion',
    kindNote: 'Two light nuclei are pushed together into one heavier nucleus plus a spare neutron.',
    question: { prompt: 'Why is there not one of these in every hospital basement already?',
      options: [
        { key: 'coulomb', label: 'Both nuclei are positive, so they repel hard, and getting them close enough takes conditions like the inside of a star' },
        { key: 'energy',  label: 'Fusion releases far less energy per kilogram of fuel than fission does' },
        { key: 'fuel',    label: 'Deuterium and tritium are too rare to obtain in any quantity' }
      ], correct: 'coulomb' },
    consequences: {
      coulomb: 'Right. The Coulomb barrier is the whole problem: two positive nuclei have to be brought within about a femtometre of each other, and that means temperatures over a hundred million degrees, held long enough to be worth it. You ask the rep what confinement time the device achieves and the meeting ends early.',
      energy:  'You argue fusion is not energetic enough. Per kilogram of fuel it is several times better than fission, so the rep corrects you in front of the finance director and the pitch survives on a point you handed over.',
      fuel:    'You argue there is no fuel. Deuterium is in ordinary seawater at about one part in six thousand, so that objection collapses in a sentence, and the real barrier never gets raised.'
    } },
  { id: 'b-column', stage: 'power', skill: 'b', type: 'decision',
    system: 'What the generator is doing', icon: '\u{1F9EB}',
    goal: 'Between elutions, the generator column just sits in its shielding making more technetium. This is the reaction inside it. Classify it, then answer what the column is actually doing.',
    why: 'It matters for scheduling. If the column made technetium on demand you could elute whenever you liked. It does not, and the reason is in this equation.',
    ce: '^{99}_{42}Mo -> ^{99m}_{43}Tc + ^{0}_{-1}e',
    kind: 'neither',
    kindNote: 'One nucleus becomes another by throwing out a small particle. Nothing splits in two and nothing merges.',
    question: { prompt: 'So what is the column doing between elutions?',
      options: [
        { key: 'grow',  label: 'Molybdenum is decaying at its own fixed rate and the technetium builds back up, which is why the column needs hours to recover' },
        { key: 'split', label: 'Molybdenum nuclei are splitting into two smaller pieces, one of which is technetium' },
        { key: 'ondemand', label: 'The saline rinse triggers the reaction, so the column makes technetium whenever you elute it' }
      ], correct: 'grow' },
    consequences: {
      grow:  'Right. It is plain beta decay running at 66 hours, and nothing you do speeds it up. The technetium regrows to near maximum in about a day, which is exactly why the list is built around one elution in the morning and a smaller one in the afternoon.',
      split: 'You describe it as fission. A split would give two comparable fragments, and technetium-99m has all but one of molybdenum\'s protons and every one of its nucleons. Nothing has come apart.',
      ondemand: 'You tell the scheduler the column makes technetium on demand, so they book back-to-back elutions all morning. The third one comes off at a third of the activity and two patients get rescheduled.'
    } },
  { id: 'b-waste', stage: 'power', skill: 'b', type: 'decision',
    system: 'The waste question', icon: '\u{1F5D1}\u{FE0F}',
    goal: 'A student asks why fission produces radioactive fragments. Classify the reaction, then distinguish its products from the helium made by hydrogen fusion.',
    why: 'Waste depends on the nuclides produced, their decay chains, and the materials exposed to radiation. Fusion systems can also create radioactive material through neutron activation.',
    ce: '^{235}_{92}U + ^{1}_{0}n -> ^{141}_{56}Ba + ^{92}_{36}Kr + 3^{1}_{0}n',
    kind: 'fission',
    kindNote: 'One heavy nucleus becomes two smaller nuclei plus free neutrons.',
    question: { prompt: 'Why are many fission products radioactive?',
      options: [
        { key: 'fragments', label: 'Many fragments have excess neutrons relative to stable nuclei of their size and undergo further decay' },
        { key: 'more', label: 'A large energy release automatically makes every product radioactive' },
        { key: 'neutrons', label: 'The free neutrons themselves remain stored as the long-lived waste' }
      ], correct: 'fragments' },
    consequences: {
      fragments: 'Correct. Many fission fragments undergo beta decay and other emissions along chains with differing half-lives. Some fission products and other nuclides in spent fuel remain radioactive for long periods. Hydrogen fusion can produce stable helium, but fusion neutrons can activate surrounding materials; fusion is not universally waste-free.',
      more: 'Radioactivity is determined by nuclear stability, not simply by the energy a reaction releases. Compare the actual product nuclides.',
      neutrons: 'Free neutrons are not stored as the long-lived waste. They can be captured and activate materials, or decay. Radioactive product nuclei account for the continuing activity.'
    } },
  { id: 'b-activation', stage: 'power', skill: 'b', type: 'decision',
    system: 'The alternative supplier', icon: '\u{1F4E6}',
    goal: 'A supplier offers molybdenum-99 made without a fission reactor: they put natural molybdenum in a neutron beam and let it absorb one. Classify their reaction, then work out the catch.',
    why: 'This is a real alternative route and the department is genuinely considering it. The chemistry decides whether the generator on your bench still fits in the hot cell.',
    ce: '^{98}_{42}Mo + ^{1}_{0}n -> ^{99}_{42}Mo + ^{0}_{0}\\gamma',
    kind: 'neither',
    kindNote: 'A nucleus absorbs a neutron and stays the same element, one mass number heavier. Nothing splits and nothing merges.',
    question: { prompt: 'What is the catch with molybdenum made this way?',
      options: [
        { key: 'specific', label: 'The product is mostly unreacted molybdenum-98, so the activity per gram is far lower and the column has to be much bigger to hold the same dose' },
        { key: 'element',  label: 'It produces a different element, so it will not work in a technetium generator at all' },
        { key: 'inactive', label: 'Neutron absorption does not make anything radioactive, so the product is useless' }
      ], correct: 'specific' },
    consequences: {
      specific: 'Right. Fission-produced molybdenum can be chemically separated from everything else, so it comes out nearly pure. Activation gives you a few molybdenum-99 atoms scattered through a lump of molybdenum-98 that is chemically identical, so it cannot be separated at all. The department asks the supplier for a specific activity figure and the quote gets a lot less attractive.',
      element:  'You reject it as the wrong element. It is molybdenum going in and molybdenum coming out, one neutron heavier, so the objection is wrong and the department loses a supplier they might have needed during the next reactor outage.',
      inactive: 'You claim the product is not radioactive. Neutron activation is how a great many isotopes are made, including the cobalt in the teletherapy head downstairs, and the claim does not survive the first question.'
    } },
  { id: 'b-decay', stage: 'power', skill: 'b', type: 'decision',
    system: 'Splitting the atom', icon: '\u{1FAA8}',
    goal: 'The geology department\'s uranium standard is decaying in the vault next to your sources. Someone describes it as "splitting the atom in there". Classify the reaction, then settle it.',
    why: 'Words matter on a radiation safety form. Fission and alpha decay need different licences, different shielding, and different paperwork.',
    ce: '^{238}_{92}U -> ^{234}_{90}Th + ^{4}_{2}He',
    kind: 'neither',
    kindNote: 'A small fixed fragment leaves and the nucleus is almost unchanged. That is decay, not splitting.',
    question: { prompt: 'Is that rock splitting atoms?',
      options: [
        { key: 'no',      label: 'No. One small fixed piece leaves and 98 percent of the nucleus stays behind, so it is alpha decay' },
        { key: 'yes',     label: 'Yes. The nucleus got smaller, so by definition it is fission' },
        { key: 'partial', label: 'Yes, because helium is one of the two fission fragments' }
      ], correct: 'no' },
    consequences: {
      no:      'Right. Fission means two comparable fragments and free neutrons, and it has to be induced. This is a nucleus shedding a fixed four-nucleon piece all by itself, over four and a half billion years. The safety form gets the right box ticked.',
      yes:     'You tick fission on a form for a sealed ore standard. That escalates it to a fissile-material entry, which means a licensing review, an inventory audit, and a very confused inspector.',
      partial: 'You call helium a fission fragment. Fission fragments come out at forty to sixty percent of the parent mass, not at less than two percent, and the distinction is exactly what the form is asking about.'
    } },

  // ---------- C.14(C) pick the isotope, name the property that decided it ----------
  { id: 'c-bone', stage: 'apply', skill: 'c', type: 'decision',
    system: 'Bone scan, 9 years old', icon: '\u{1F9B4}',
    goal: 'A nine-year-old with unexplained leg pain needs a whole-body bone scan. The camera sits outside her. Pick the isotope, then name the property that decided it.',
    why: 'The stated camera requires detectable photons and an appropriate radiopharmaceutical. A useful photon emission does not imply zero absorbed energy or guarantee an image.',
    offered: ['Tc-99m', 'Sr-90', 'Am-241'], correct: 'Tc-99m', reason: 'penetrating',
    consequences: {
      'Tc-99m': 'Tc-99m provides photons useful for external gamma imaging. Appropriate chemical targeting and instrumentation are also required; activity calculations alone do not determine dose or image quality.',
      'Sr-90': 'You inject a pure beta emitter. Every electron stops inside her within two millimetres, so the camera sees nothing at all, and a nine-year-old has absorbed a therapeutic dose of radiation for a blank image.',
      'Am-241': 'You inject an alpha emitter with a 432 year half-life. The alphas cannot leave the tissue they land in, the camera sees nothing, and she now carries a long-lived internal emitter. This is one of the worst things you can do with an isotope.'
    } },
  { id: 'c-pet', stage: 'apply', skill: 'c', type: 'decision',
    system: 'PET metabolism study', icon: '\u{1F9E0}',
    goal: 'A staging PET scan is booked on the ring downstairs. That machine only records photons that arrive in pairs, at 511 keV, from opposite directions. Pick the isotope, then name the property that decided it.',
    why: 'The detector ring is built around one specific nuclear signature. An isotope that does not produce it will not produce an image, however hot the vial reads.',
    offered: ['F-18', 'Tc-99m', 'I-131'], correct: 'F-18', reason: 'positron',
    consequences: {
      'F-18': 'Every positron annihilates within a millimetre or so of where the sugar was taken up, and the ring draws a line between the two detectors that fired at once. Thousands of lines become a metabolic map, and the tumour lights up.',
      'Tc-99m': 'You send technetium to a PET ring. It emits single 140 keV photons, never pairs, so the coincidence logic rejects essentially everything and the reconstruction is empty. The patient has been injected and the slot is gone.',
      'I-131': 'You send a therapy isotope to a diagnostic ring. There are no 511 keV pairs, so there is no image, and you have given a staging patient a dose that belongs to a treatment.'
    } },
  { id: 'c-thyroid', stage: 'apply', skill: 'c', type: 'decision',
    system: 'Overactive thyroid', icon: '\u{1F9B7}',
    goal: 'In the supplied thyroid-treatment example, iodine uptake helps localize a beta-emitting isotope. Choose the isotope and the relevant emission property from the reference choices.',
    why: 'Uptake and radiation range influence where energy is deposited, but neither guarantees that other tissues receive zero dose.',
    offered: ['I-131', 'Tc-99m', 'Co-60'], correct: 'I-131', reason: 'beta-local',
    consequences: {
      'I-131': 'I-131 has beta emission useful for localized energy deposition and also emits gamma radiation. Iodine uptake supports the thyroid application; the model does not predict a patient outcome or zero exposure elsewhere.',
      'Tc-99m': 'Tc-99m is primarily useful here as an imaging isotope. Detectable photons are not a guarantee of zero energy deposition, and this choice does not fit the stated therapeutic reference.',
      'Co-60': 'You reach for the teletherapy isotope. Cobalt-60 is not taken up by anything, it is a sealed external source, and its gamma beam would irradiate her whole neck rather than the tissue that concentrated the tracer.'
    } },
  { id: 'c-sterile', stage: 'apply', skill: 'c', type: 'decision',
    system: 'Sterilising surgical kits', icon: '\u{1FA79}',
    goal: 'The sterilisation plant irradiates sealed surgical kits, a pallet at a time, through the packaging, and the machine has to run for years without the source being changed. Pick the isotope, then name the property that decided it.',
    why: 'The kits are already sealed and cannot be opened, so the radiation has to get through cardboard and plastic. And a source that needs replacing every few months makes the plant uneconomic.',
    offered: ['Co-60', 'F-18', 'Tc-99m'], correct: 'Co-60', reason: 'long-half',
    consequences: {
      'Co-60': 'Its gamma photons go straight through the packaging and kill everything inside, and at a 5.27 year half-life the source is still doing useful work most of a decade later. This is how a large fraction of the world\'s disposable medical kit is sterilised.',
      'F-18': 'You specify an isotope with a 110 minute half-life for a plant that runs continuously. The source is down to a thousandth of its strength before the first shift ends, and it would have to be remade several times a day.',
      'Tc-99m': 'Six hours. The source is effectively gone overnight, the plant spends more time reloading than irradiating, and the 140 keV photons are soft enough that a dense pallet shields its own middle.'
    } },
  { id: 'c-smoke', stage: 'apply', skill: 'c', type: 'decision',
    system: 'Smoke detector over the vault', icon: '\u{1F6A8}',
    goal: 'The ionisation smoke detector above the source vault holds a tiny sealed isotope button. Its job is to ionise the air in a small chamber so smoke particles interrupt the current. Pick the isotope, then name the property that decided it.',
    why: 'The activity depends on alpha ionization within an intact, designed detector. Other emissions, source containment, and approved end-of-life handling still matter.',
    offered: ['Am-241', 'Co-60', 'I-131'], correct: 'Am-241', reason: 'alpha-contained',
    consequences: {
      'Am-241': 'The alpha particles ionise the chamber air heavily and travel a couple of centimetres at most, so nothing leaves the plastic housing. A 432 year half-life means the detector outlives the building. This is the most common radioactive source in ordinary life.',
      'Co-60': 'You put a penetrating gamma source in a ceiling detector. It would irradiate the room continuously, it would barely ionise the tiny chamber it is meant to serve, and every fire alarm in the hospital would need a radiation licence.',
      'I-131': 'You specify an isotope with an eight day half-life and a volatile chemistry. The detector stops working in a month and, worse, iodine sublimes, so the source does not stay in the housing.'
    } },
  { id: 'c-exit', stage: 'apply', skill: 'c', type: 'decision',
    system: 'Exit sign, no power run', icon: '\u{1F6AA}',
    goal: 'A back corridor needs an illuminated exit sign and there is no electrical run to it. The self-powered signs work by an isotope exciting a phosphor coating inside a sealed glass tube. Pick the isotope, then name the property that decided it.',
    why: 'The glass tube has to stop everything the isotope emits while the phosphor still gets lit. That is a very specific window.',
    offered: ['H-3', 'Co-60', 'F-18'], correct: 'H-3', reason: 'beta-local',
    consequences: {
      'H-3': 'Tritium emits an extremely low energy beta that cannot get through the glass but has no trouble exciting the phosphor painted on the inside of it. The sign glows for a decade or more, with nothing coming out of the tube at all.',
      'Co-60': 'You put a penetrating gamma source in a corridor sign. It would light the phosphor and also irradiate everybody who walks past, which is why no such sign has ever been made.',
      'F-18': 'A 110 minute half-life. The sign is dark before the end of the shift it was installed on.'
    } },
  { id: 'c-coffin', stage: 'apply', skill: 'c', type: 'decision',
    system: 'Dating a coffin lid', icon: '\u{26B0}\u{FE0F}',
    goal: 'The university sends over a fragment of a wooden coffin lid from a dig, thought to be about three thousand years old, and asks the hospital lab which isotope dates it. Pick the isotope, then name the property that decided it.',
    why: 'A clock is only readable while the hand is still moving. Pick a half-life that does not match the age and the measurement either saturates or reads nothing.',
    offered: ['C-14', 'U-238', 'Tc-99m'], correct: 'C-14', reason: 'matched-clock',
    consequences: {
      'C-14': 'The wood stopped exchanging carbon with the air when the tree was felled, and the carbon-14 in it has been decaying at 5,730 years per half-life ever since. Three thousand years leaves about 70 percent, which is a difference any modern lab can measure precisely.',
      'U-238': 'A 4.47 billion year half-life. In three thousand years the fraction that has decayed is around one part in a million and a half, far below anything measurable. The technique is right for rocks and hopeless for wood.',
      'Tc-99m': 'Six hours. Any technetium in that wood vanished within a couple of days of whenever it got there, and there was never any in it to begin with. There is nothing to measure.'
    } },
  { id: 'c-arctic', stage: 'apply', skill: 'c', type: 'decision',
    system: 'Arctic weather station', icon: '\u{1F328}\u{FE0F}',
    goal: 'A remote automatic weather station sits above the Arctic circle with no sun for four months of the year and no crew visit for a decade. It needs a few watts, continuously, from the heat of a decaying isotope. Pick the isotope, then name the property that decided it.',
    why: 'Nobody is going up there to change anything. The source has to still be producing useful heat when the next crew finally arrives.',
    offered: ['Sr-90', 'Tc-99m', 'F-18'], correct: 'Sr-90', reason: 'long-half',
    consequences: {
      'Sr-90': 'A 28.8 year half-life means it is still at about four fifths of its original output after a decade, and the beta energy turns into heat inside the source block, which thermocouples convert to a few watts. Dozens of these ran unattended along the Soviet Arctic coast.',
      'Tc-99m': 'Six hours. The station is dead before the installation team gets back to the helicopter.',
      'F-18': 'A hundred and ten minutes. By the time the crate is unpacked there is nothing in it, and you have flown a warm box to the Arctic.'
    } },

  // ---------- C.14(C) half-life: what is actually left when the dose is given ----------
  { id: 'hl-bone', stage: 'dose', skill: 'hl', type: 'dose',
    system: 'Bone scan draw', icon: '\u{1F4C9}',
    goal: 'The eluate was assayed the moment it came off the column. The bone scan patient is on the table now. Work out how much activity is still in the vial, so the dose you draw is the dose that was prescribed.',
    why: 'Use the reference activity, elapsed time, and the correct isotope half-life. This calculation predicts parent activity; it does not by itself establish dose, treatment outcome, or an operating schedule.',
    isotope: 'Tc-99m', unit: 'h',
    candidates: ['Tc-99m', 'Mo-99', 'I-131'],
    constraints: { a0Min: 240, a0Max: 420, elapsedMin: 1.2, elapsedMax: 5.0 },
    bands: A_BANDS, actionLabel: 'Draw the dose',
    safeState: 'MODEL VALUE MATCHED', lowState: 'ACTIVITY READ LOW', highState: 'ACTIVITY READ HIGH',
    safe: 'The entered activity agrees with the decay model and supplied reference inputs.',
    low: 'The entered activity is below the model prediction. Recheck elapsed time, half-life units, and the exponential factor.',
    high: 'The entered activity is above the model prediction. Recheck elapsed time, half-life units, and the exponential factor.',
    fail: 'No activity was ever committed, so nothing gets drawn and the patient waits on the table.' },
  { id: 'hl-pet', stage: 'dose', skill: 'hl', type: 'dose',
    system: 'FDG delivery', icon: '\u{1F69A}',
    goal: 'The FDG came off the cyclotron with an assayed activity and a calibration time stamped on the vial. The courier hit traffic. Work out what is left now, before the PET slot opens.',
    why: 'Use the reference activity, elapsed time, and the correct isotope half-life. This calculation predicts parent activity; it does not by itself establish dose, treatment outcome, or an operating schedule.',
    isotope: 'F-18', unit: 'min',
    candidates: ['F-18', 'Tc-99m', 'Mo-99'],
    constraints: { a0Min: 300, a0Max: 550, elapsedMin: 45, elapsedMax: 210 },
    bands: A_BANDS, actionLabel: 'Release for injection',
    safeState: 'MODEL VALUE MATCHED', lowState: 'ACTIVITY READ LOW', highState: 'ACTIVITY READ HIGH',
    safe: 'The entered activity agrees with the decay model and supplied reference inputs.',
    low: 'The entered activity is below the model prediction. Recheck elapsed time, half-life units, and the exponential factor.',
    high: 'The entered activity is above the model prediction. Recheck elapsed time, half-life units, and the exponential factor.',
    fail: 'No activity was committed, the slot passes, and the delivery is worth a fraction of what it was by the next one.' },
  { id: 'hl-capsule', stage: 'dose', skill: 'hl', type: 'dose',
    system: 'Therapy capsule', icon: '\u{1F48A}',
    goal: 'An iodine-131 therapy capsule was assayed at the supplier and has been in transit and in the safe since. The patient is here. Work out the activity in that capsule today.',
    why: 'Use the reference activity, elapsed time, and the correct isotope half-life. This calculation predicts parent activity; it does not by itself establish dose, treatment outcome, or an operating schedule.',
    isotope: 'I-131', unit: 'd',
    candidates: ['I-131', 'Mo-99', 'Rn-222'],
    constraints: { a0Min: 400, a0Max: 900, elapsedMin: 1.0, elapsedMax: 9.0 },
    bands: A_BANDS, actionLabel: 'Dispense the capsule',
    safeState: 'MODEL VALUE MATCHED', lowState: 'ACTIVITY READ LOW', highState: 'ACTIVITY READ HIGH',
    safe: 'The entered activity agrees with the decay model and supplied reference inputs.',
    low: 'The entered activity is below the model prediction. Recheck elapsed time, half-life units, and the exponential factor.',
    high: 'The entered activity is above the model prediction. Recheck elapsed time, half-life units, and the exponential factor.',
    fail: 'Nothing was committed, so nothing is dispensed and she goes home having taken the day off for nothing.' },
  { id: 'hl-shipment', stage: 'dose', skill: 'hl', type: 'dose',
    system: 'Generator shipment', icon: '\u{1F4E6}',
    goal: 'The replacement generator was assayed at the reactor site and shipped. Work out the molybdenum-99 activity that will actually be on the column when it lands here.',
    why: 'Use the reference activity, elapsed time, and the correct isotope half-life. This calculation predicts parent activity; it does not by itself establish dose, treatment outcome, or an operating schedule.',
    isotope: 'Mo-99', unit: 'h',
    candidates: ['Mo-99', 'Tc-99m', 'I-131'],
    constraints: { a0Min: 1200, a0Max: 2400, elapsedMin: 14, elapsedMax: 80 },
    bands: A_BANDS, actionLabel: 'Confirm the order',
    safeState: 'MODEL VALUE MATCHED', lowState: 'ACTIVITY READ LOW', highState: 'ACTIVITY READ HIGH',
    safe: 'The entered activity agrees with the decay model and supplied reference inputs.',
    low: 'The entered activity is below the model prediction. Recheck elapsed time, half-life units, and the exponential factor.',
    high: 'The entered activity is above the model prediction. Recheck elapsed time, half-life units, and the exponential factor.',
    fail: 'Nothing was committed, so no order was placed either way.' },

  // ---------- Honors h1: the full decay series ----------
  { id: 'h1-series', stage: 'ident', skill: 'h1', type: 'identity',
    system: 'Decay series', icon: '\u{26D3}\u{FE0F}',
    goal: 'A parent nuclide does not reach stability in one step. Work out how many alpha and how many beta decays the whole chain takes, using nothing but conservation of mass number and atomic number.',
    why: 'Only alpha changes the mass number, and it changes it by exactly four every time. That one fact fixes the number of alphas before you have thought about anything else, and the betas are then whatever it takes to land on the right atomic number.',
    success: 'Both numbers conserve, the chain is accounted for, and the physicist signs off the inventory entry.',
    fail: 'The chain does not conserve, so the series you have written turns into an element that is not the one at the end of it.' },

  // ---------- Honors h2: binding energy per nucleon ----------
  { id: 'h2-binding', stage: 'power', skill: 'h2', type: 'identity',
    system: 'Binding energy', icon: '\u{1F4C8}',
    goal: 'A nucleus weighs less than the loose nucleons that make it up, and the missing mass is what holds it together. Work out the binding energy per nucleon, then say which way this nuclide releases energy.',
    why: 'One curve explains both halves of C.14(B). Binding energy per nucleon rises steeply to iron and falls slowly after it, so light nuclei release energy by joining and heavy nuclei release it by splitting. Both are climbing the same hill.',
    success: 'The figure lands on the curve where it should, and the reason fission and fusion both work stops being two separate facts.',
    fail: 'The figure is off, so the nuclide gets placed on the wrong part of the curve and the conclusion drawn from it goes the wrong way.' },

  // ---------- Honors h3: effective half-life ----------
  { id: 'h3-effective', stage: 'dose', skill: 'h3', type: 'identity',
    system: 'Patient release', icon: '\u{1F6CF}\u{FE0F}',
    goal: 'Combine the supplied physical and biological half-lives, then calculate the time to the example retained-activity threshold. Treat the threshold as a classroom model input.',
    why: 'Decay and excretion are two independent first-order routes out, so their RATES add, not their half-lives. That is why the combined half-life is always shorter than either one on its own.',
    success: 'The effective half-life and time to the supplied model threshold agree. These two values do not establish a real patient-release decision.',
    fail: 'The time is wrong, so she is either held in isolation for no reason or released while still above the threshold.' },

  // ---------- Capstone: the last patient of the morning ----------
  { id: 'cap-lastcase', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'Last on the list', icon: '\u{1F4DE}',
    goal: 'Cardiac stress scan, last slot before lunch. The prescription needs a set activity at injection, and the only technetium in the building is what is left in the vial you have been spending all morning. Make the call.',
    why: 'Every wrong call this morning cost you minutes, and every minute cost you activity. This is where that bill arrives.',
    options: [
      { key: 'scan', label: 'Draw from this vial and scan her now',
        good: 'There is enough activity left to make the prescribed dose in a reasonable volume. She is injected, imaged, and off the list before lunch.',
        consequence: 'You draw from a vial that cannot make the prescribed activity. To get there you inject a volume far beyond protocol, and the study is still too quiet to report. She has taken a dose and gained nothing.' },
      { key: 'rebook', label: 'Hold her for the fresh generator arriving at 14:00',
        good: 'The vial cannot make the dose and there is an afternoon slot open. She waits two hours, gets a full-strength dose off the new column, and goes home the same day with a reportable study.',
        consequence: 'You send her to wait for an afternoon slot that is not there. She sits in the department for two hours and is then sent home unscanned anyway, having fasted since midnight.' },
      { key: 'refer', label: 'Send her across town to the partner hospital today',
        good: 'This vial cannot make the dose and there is no afternoon slot to put her in. The partner department has a camera free, so she gets scanned today rather than losing a week.',
        consequence: 'You send a patient across town when you could have scanned her here. She loses her afternoon, the partner department loses a slot, and your own scanner sits idle with a usable vial beside it.' }
    ] }
];
