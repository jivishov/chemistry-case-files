// Unit 11 audit refinements.
//
// This module changes student-facing copy only. The existing simulation engine keeps its
// calculations, scenario rotation, grading, world-state, SVG art, and persistence behavior.
// The data objects exported by model.js and case.js are mutable references, so updating them
// before Alpine starts gives every generated prompt and consequence the audited wording.

import {
  SE, EMISSIONS, REASONS, SERIES, BINDING_CASES, DOSAGE_CASES, SCENARIOS
} from './model.js';
import { CASE } from './case.js';

let contentApplied = false;

const find = (arr, key, value) => arr.find(item => item && item[key] === value);
const scenario = id => find(SCENARIOS, 'id', id);
const assign = (obj, patch) => { if (obj) Object.assign(obj, patch); };
const setConsequence = (id, key, text) => {
  const s = scenario(id);
  if (s && s.consequences) s.consequences[key] = text;
};

export function applyContentRefinements() {
  if (contentApplied) return;
  contentApplied = true;

  // Standards remain TEKS C.14. Add concise labels because the popover renders `se.label`.
  const seCopy = {
    a: {
      label: 'Decay equations',
      text: 'Describe alpha, beta, and gamma decay using balanced nuclear equations.'
    },
    b: {
      label: 'Fission and fusion',
      text: 'Compare fission and fusion reactions.'
    },
    c: {
      label: 'Nuclear applications',
      text: 'Connect nuclear phenomena to stability, radiation therapy, diagnostic imaging, solar energy, and nuclear power.'
    },
    hl: {
      label: 'Half-life calculation',
      text: 'Use half-life to calculate the activity remaining after a stated time.'
    },
    h1: {
      label: 'Net decay-series counts',
      text: 'Honors: use conservation to find net alpha and beta-minus counts between two nuclides in a simplified decay-series model.'
    },
    h2: {
      label: 'Binding energy',
      text: 'Honors: calculate binding energy per nucleon and locate a nuclide on the binding-energy curve.'
    },
    h3: {
      label: 'Effective half-life',
      text: 'Honors: combine physical decay and biological clearance in a simplified first-order effective-half-life model.'
    }
  };
  SE.forEach(se => assign(se, seCopy[se.id]));

  // Radiation descriptions are deliberately qualitative: penetration and shielding depend
  // on particle/photon energy, material, thickness, and geometry.
  assign(find(EMISSIONS, 'key', 'alpha'), {
    label: 'A helium nucleus: two protons and two neutrons leave together. Heavy and doubly positive; alpha particles travel only a short distance and are stopped by paper or the outer dead layer of skin.'
  });
  assign(find(EMISSIONS, 'key', 'beta'), {
    label: 'In beta-minus decay, a neutron becomes a proton and an electron is emitted. Beta particles travel farther than alpha particles and can often be reduced strongly by a few millimetres of plastic.'
  });
  assign(find(EMISSIONS, 'key', 'gamma'), {
    label: 'A gamma ray is a high-energy photon emitted when a nucleus drops to a lower energy state. It has no charge or mass number and requires dense shielding, such as lead, to reduce its intensity.'
  });
  assign(find(EMISSIONS, 'key', 'positron'), {
    label: 'In beta-plus decay, a proton becomes a neutron and emits a positron, the electron’s antiparticle. After slowing down, the positron annihilates with an electron and usually produces two 511 keV photons.'
  });

  assign(find(REASONS, 'key', 'penetrating'), {
    label: 'It emits a gamma photon that can leave the body and reach an external detector. Some radiation is still absorbed in tissue, so the patient dose is not zero.'
  });
  assign(find(REASONS, 'key', 'positron'), {
    label: 'It emits positrons. Annihilation usually produces two 511 keV photons traveling in nearly opposite directions, which a PET detector ring records in coincidence.'
  });
  assign(find(REASONS, 'key', 'beta-local'), {
    label: 'Its beta particles have a relatively short range in tissue or shielding, so much of their energy is deposited close to the source. The exact range depends on beta energy and material.'
  });
  assign(find(REASONS, 'key', 'alpha-contained'), {
    label: 'Its alpha particles have a very short range. In a properly sealed source, the radioactive material is contained and the alpha particles do not travel far outside the source assembly.'
  });
  assign(find(REASONS, 'key', 'short-half'), {
    label: 'Its short half-life makes activity fall rapidly after use, which is useful when a source is needed for only a short time.'
  });
  assign(find(REASONS, 'key', 'long-half'), {
    label: 'Its long half-life lets a sealed source remain useful for years, although its activity still decreases continuously.'
  });
  assign(find(REASONS, 'key', 'matched-clock'), {
    label: 'Its half-life is on the same timescale as the age or process being measured, so the remaining fraction changes enough to measure.'
  });

  // Decay-series context. The exercise asks for net alpha/beta-minus counts, not every branch.
  const seriesCopy = {
    u238: 'Uranium-238 begins the uranium decay series and eventually reaches stable lead-206. Radon-222 is one intermediate nuclide in this natural series.',
    u235: 'Uranium-235 begins the actinium series and eventually reaches stable lead-207. The same nuclide can undergo induced fission in a reactor or radioactive decay on its own.',
    th232: 'Thorium-232 begins a natural decay series that ends at stable lead-208. Thorium occurs naturally in rocks, soils, and some mineral sands.',
    np237: 'Neptunium-237 begins the neptunium series. Primordial neptunium-237 has essentially disappeared because its half-life is far shorter than Earth’s age; most present-day neptunium-237 is produced in nuclear technology.'
  };
  SERIES.forEach(s => { if (seriesCopy[s.id]) s.story = seriesCopy[s.id]; });

  const bindingCopy = {
    'H-2': 'Deuterium is a light nuclide used in fusion research. Calculate its binding energy per nucleon and compare its position with nuclides near the peak of the curve.',
    'He-4': 'Helium-4 is especially tightly bound for such a light nuclide. It appears as an alpha particle and as a product in important fusion reactions.',
    'C-12': 'Carbon-12 defines the unified atomic mass unit scale. Its atomic mass is exactly 12 u by definition, but its separated nucleons would have a greater total mass.',
    'Fe-56': 'Iron-56 lies near the peak of the binding-energy-per-nucleon curve. Fusion beyond the iron-group region generally no longer releases energy the way fusion of light nuclei does.',
    'Kr-92': 'Krypton-92 can occur as a fission product. Compare its binding energy per nucleon with the uranium nucleus from which fission products are formed.',
    'U-235': 'Uranium-235 lies on the heavy side of the binding-energy curve. Suitable fission reactions can form products with greater binding energy per nucleon.'
  };
  BINDING_CASES.forEach(c => { if (bindingCopy[c.sym]) c.story = bindingCopy[c.sym]; });

  // These percentages are exercise thresholds, not patient-release regulations.
  const dosageCopy = {
    'i131-ward': {
      story: 'For this calculation exercise, use 30% of the starting retained activity as the threshold. Find when the simplified model falls below it.',
      why: 'The model combines radioactive decay with biological clearance as independent first-order processes. Real I-131 patient-release decisions are dose-based and patient-specific, not a fixed percentage of administered activity.'
    },
    'tc99m-room': {
      story: 'For this calculation exercise, find when retained Tc-99m activity falls below 25% of its starting value.',
      why: 'The activity can fall by both physical decay and biological clearance. This one-compartment first-order model is for practicing the calculation, not for setting a clinical restriction.'
    },
    'f18-bay': {
      story: 'For this calculation exercise, find when retained F-18 activity falls below 20% of its starting value.',
      why: 'Physical decay and biological clearance both reduce retained activity. The exercise threshold is a mathematical target, not a patient-release rule.'
    }
  };
  DOSAGE_CASES.forEach(c => assign(c, dosageCopy[c.id]));

  // ------------------------------- C.14(A) -------------------------------
  assign(scenario('a-generator'), {
    goal: 'The technetium generator arrives labeled molybdenum-99. Use the survey evidence to identify the decay, then balance the daughter equation.',
    why: 'The decay mode determines how mass number and atomic number change and what shielding is appropriate.',
    evidence: 'For this activity, the detector is focused on the beta component: paper has little effect, while several millimetres of acrylic reduce the reading strongly.'
  });
  setConsequence('a-generator', 'beta', 'Correct. Molybdenum-99 undergoes beta-minus decay. Low-Z shielding such as plastic is commonly used for beta particles because it limits bremsstrahlung compared with high-Z shielding.');
  setConsequence('a-generator', 'alpha', 'Not alpha. An alpha particle would be stopped much more easily, and alpha decay would lower the mass number by 4 and the atomic number by 2.');
  setConsequence('a-generator', 'gamma', 'Not a pure gamma transition. Gamma emission leaves A and Z unchanged, but molybdenum-99 changes element during beta-minus decay.');
  setConsequence('a-generator', 'positron', 'Not beta-plus. Positron emission would lower the atomic number by 1; beta-minus decay raises it by 1, producing technetium.');

  assign(scenario('a-eluate'), {
    goal: 'Fresh technetium-99m eluate is ready. Use the shielding evidence to identify its nuclear transition, then balance the equation.',
    why: 'Tc-99m is useful for imaging because its isomeric transition produces a penetrating gamma photon.',
    evidence: 'Paper and acrylic have little effect on the penetrating reading, while lead reduces it substantially. That pattern is characteristic of gamma radiation.'
  });
  setConsequence('a-eluate', 'gamma', 'Correct. Technetium-99m undergoes isomeric transition to technetium-99 and emits a gamma photon. The mass number and atomic number stay the same.');
  setConsequence('a-eluate', 'alpha', 'Not alpha. Alpha emission would change both A and Z and would be stopped much more easily.');
  setConsequence('a-eluate', 'beta', 'Not beta-minus. Beta-minus decay would increase Z by 1, but an isomeric gamma transition leaves the element unchanged.');
  setConsequence('a-eluate', 'positron', 'Not beta-plus. Positron emission would decrease Z by 1; the technetium-99m transition leaves Z unchanged.');

  assign(scenario('a-therapy'), {
    goal: 'An iodine-131 therapy capsule is ready. Identify the transmutation step and balance it; penetrating gamma photons can also follow daughter de-excitation.',
    why: 'The beta-minus decay changes iodine into xenon, while accompanying photons contribute to external exposure.',
    evidence: 'Paper has little effect. Acrylic reduces the beta component, while dense shielding is needed to reduce the penetrating photon component.'
  });
  setConsequence('a-therapy', 'beta', 'Correct. Iodine-131 undergoes beta-minus decay to xenon-131. Beta energy is useful therapeutically, and accompanying gamma radiation is one reason radiation-safety instructions are needed after some treatments.');
  setConsequence('a-therapy', 'alpha', 'Not alpha. Alpha decay would lower A by 4 and Z by 2, which does not match iodine-131 decay.');
  setConsequence('a-therapy', 'gamma', 'Gamma photons are emitted in the decay scheme, but gamma emission alone cannot explain iodine changing into xenon. The transmutation step is beta-minus decay.');
  setConsequence('a-therapy', 'positron', 'Not beta-plus. Positron emission would lower Z; iodine-131 beta-minus decay raises Z from 53 to 54.');

  assign(scenario('a-pet'), {
    goal: 'An F-18 FDG delivery arrives for PET imaging. Use the 511 keV coincidence evidence to identify the decay and balance the daughter equation.',
    why: 'PET detects the annihilation photons produced after positron emission.',
    evidence: 'The detector records pairs of photons at about 511 keV arriving almost simultaneously from nearly opposite directions.'
  });
  setConsequence('a-pet', 'positron', 'Correct. Fluorine-18 emits a positron. After slowing in tissue, the positron annihilates with an electron and usually produces two 511 keV photons moving in nearly opposite directions.');
  setConsequence('a-pet', 'alpha', 'Not alpha. Alpha emission would not produce the paired 511 keV annihilation photons detected by PET.');
  setConsequence('a-pet', 'beta', 'Not beta-minus. An emitted electron does not create the characteristic two-photon annihilation signal used by PET.');
  setConsequence('a-pet', 'gamma', 'Not a simple gamma transition. The paired 511 keV photons are produced by positron-electron annihilation after beta-plus decay.');

  assign(scenario('a-teletherapy'), {
    goal: 'A cobalt-60 teletherapy source is being transferred. Identify the nuclear decay that changes cobalt into nickel, then balance the equation.',
    why: 'Co-60 beta-minus decays to excited nickel-60, which then emits the penetrating gamma photons used by the treatment unit.',
    evidence: 'Paper and acrylic have little effect on the penetrating photon reading. Several centimetres of lead reduce the intensity, showing why dense shielding is required.'
  });
  setConsequence('a-teletherapy', 'beta', 'Correct. Cobalt-60 beta-minus decays to excited nickel-60. The excited daughter then emits high-energy gamma photons; the beta particles are contained by the sealed source assembly.');
  setConsequence('a-teletherapy', 'alpha', 'Not alpha. Alpha decay would lower A by 4 and Z by 2, which does not produce nickel-60.');
  setConsequence('a-teletherapy', 'gamma', 'The source produces important gamma photons, but gamma emission alone does not change cobalt into nickel. The transmutation step is beta-minus decay.');
  setConsequence('a-teletherapy', 'positron', 'Not beta-plus. Positron emission would decrease Z; cobalt-60 becomes nickel-60 by beta-minus decay, which increases Z by 1.');

  assign(scenario('a-eye'), {
    goal: 'A strontium-90 eye applicator is in the sealed-source inventory. Identify the parent decay and balance its daughter equation.',
    why: 'The source is used because beta radiation has a much shorter range in tissue than penetrating gamma radiation.',
    evidence: 'The reading passes through paper but is reduced strongly by a few millimetres of acrylic. No strong penetrating gamma component is seen in this simplified survey.'
  });
  setConsequence('a-eye', 'beta', 'Correct. Strontium-90 undergoes beta-minus decay to yttrium-90. In a properly designed applicator, beta radiation can concentrate dose near the treated surface compared with penetrating photons.');
  setConsequence('a-eye', 'alpha', 'Not alpha. Alpha particles would be stopped much more easily, and the daughter A and Z would not match strontium-90 beta-minus decay.');
  setConsequence('a-eye', 'gamma', 'Not a pure gamma transition. Gamma emission leaves the element unchanged, but strontium-90 changes to yttrium-90.');
  setConsequence('a-eye', 'positron', 'Not beta-plus. Positron emission would decrease Z; strontium-90 beta-minus decay increases Z to yttrium.');

  assign(scenario('a-radium'), {
    goal: 'Legacy radium-226 sources are found during a renovation. Identify the parent decay and balance the daughter equation.',
    why: 'Radium-226 produces radon-222 by alpha decay, so source control and air monitoring may both matter.',
    evidence: 'An alpha-sensitive probe reads strongly at close range and the alpha response is blocked by paper. A separate air sample shows activity from radon progeny.'
  });
  setConsequence('a-radium', 'alpha', 'Correct. Radium-226 alpha decays to radon-222. Because radon is a noble gas, a radiation-safety response may include controlling the area, checking containment, and assessing the air before work continues.');
  setConsequence('a-radium', 'beta', 'Not beta-minus. Beta emission would leave A unchanged and raise Z by 1; the observed alpha response and daughter radon require A − 4 and Z − 2.');
  setConsequence('a-radium', 'gamma', 'Not a pure gamma transition. Gamma emission leaves A and Z unchanged and cannot produce radon-222 from radium-226.');
  setConsequence('a-radium', 'positron', 'Not beta-plus. Positron emission changes Z by −1 but leaves A unchanged; radium-226 to radon-222 requires alpha decay.');

  assign(scenario('a-checksource'), {
    goal: 'A sealed americium-241 check source is used to verify an alpha-sensitive survey meter. Identify the parent decay and balance it.',
    why: 'Americium-241 is primarily an alpha emitter and also produces a low-energy gamma photon in its decay scheme.',
    evidence: 'The alpha-sensitive response is strong at close range and drops sharply when a card blocks the alpha particles. A weaker penetrating photon component can still be detected.'
  });
  setConsequence('a-checksource', 'alpha', 'Correct. Americium-241 alpha decays to neptunium-237. The short-range alpha radiation is also what makes small sealed Am-241 sources useful in ionization smoke detectors.');
  setConsequence('a-checksource', 'beta', 'Not beta-minus. A card would not stop beta particles as effectively, and beta-minus decay would raise Z instead of lowering it by 2.');
  setConsequence('a-checksource', 'gamma', 'A low-energy gamma photon is present in the decay scheme, but the parent transmutation is alpha decay.');
  setConsequence('a-checksource', 'positron', 'Not beta-plus. Positron emission would lower Z by only 1 and would produce annihilation photons; neither matches the parent decay here.');

  // ------------------------------- C.14(B) -------------------------------
  assign(scenario('b-supply'), {
    goal: 'Molybdenum-99 can be produced as a uranium-235 fission product. Classify the reaction, then connect the process to isotope supply.',
    why: 'Production routes matter because reactor maintenance or outages can affect availability of medical isotopes.'
  });
  setConsequence('b-supply', 'split', 'Correct. A heavy uranium nucleus absorbs a neutron and splits into much lighter fission products while releasing additional neutrons. Mo-99 can be one of the useful products separated from that mixture.');
  setConsequence('b-supply', 'join', 'That describes fusion, not the reaction shown. Here one heavy nucleus produces two much smaller nuclei plus neutrons.');
  setConsequence('b-supply', 'wait', 'Uranium-235 can decay naturally, but the reaction shown is neutron-induced fission. The molybdenum product is formed during the split, not by simply waiting for uranium to decay into molybdenum.');

  assign(scenario('b-sun'), {
    goal: 'A rooftop solar panel converts sunlight into electricity. Classify the simplified net nuclear reaction that supplies the Sun’s energy, then identify where that energy begins.',
    why: 'The panel itself is not nuclear: it converts incoming light. The Sun’s core is where the fusion reactions occur.',
    kindNote: 'This is a simplified net proton-proton-chain equation. The real chain occurs in several steps and also carries energy away in photons and neutrinos.'
  });
  setConsequence('b-sun', 'core', 'Correct. The solar cell converts incoming photons into electrical energy; it does not carry out a nuclear reaction. The sunlight ultimately comes from fusion reactions in the Sun.');
  setConsequence('b-sun', 'panel', 'Silicon nuclei are not fissioning in an ordinary solar panel. The panel uses the photovoltaic effect to convert light into electrical energy.');
  setConsequence('b-sun', 'decay', 'Ordinary solar panels are not powered by radioactive decay. Their energy arrives from the Sun as electromagnetic radiation.');

  assign(scenario('b-vendor'), {
    why: 'Fusion can release large amounts of energy, but positively charged nuclei repel each other. A practical reactor must create suitable plasma conditions and confine it effectively.'
  });
  setConsequence('b-vendor', 'coulomb', 'Correct. Positive nuclei repel through the Coulomb force. Fusion systems therefore need very high temperatures and sufficient confinement so enough nuclei can approach closely enough to fuse.');
  setConsequence('b-vendor', 'energy', 'Fusion is not limited because it releases too little energy per mass of fuel. The major engineering challenge is achieving and maintaining conditions that produce useful net energy.');
  setConsequence('b-vendor', 'fuel', 'Fuel supply is not the fundamental Coulomb-barrier problem shown by the reaction. Deuterium is naturally available, while tritium supply and breeding are separate engineering challenges.');

  assign(scenario('b-column'), {
    goal: 'Between elutions, molybdenum-99 on the generator continues to decay and technetium-99m grows in. Classify the simplified reaction, then explain the regrowth.',
    why: 'The decay proceeds on its own timescale. Elution removes available technetium but does not switch the parent decay on or off.',
    kindNote: 'This simplified generator pathway shows beta-minus decay producing Tc-99m. It is radioactive decay, not fission or fusion.'
  });
  setConsequence('b-column', 'grow', 'Correct. Mo-99 continues to decay whether or not the generator is eluted, so Tc-99m grows back after an elution. The amount available depends on both parent decay and daughter ingrowth.');
  setConsequence('b-column', 'split', 'This is not fission. The mass number stays 99 while the atomic number changes by one, which is the pattern for beta-minus decay.');
  setConsequence('b-column', 'ondemand', 'The saline elution separates available technetium from the column; it does not trigger the nuclear decay. The parent Mo-99 decays continuously.');

  const bw = scenario('b-waste');
  if (bw) {
    bw.goal = 'A student asks why fission produces radioactive waste. Classify the reaction, then identify what makes many fission products radioactive.';
    bw.why = 'The key idea is nuclear stability: heavy nuclei split into products that are often neutron-rich and therefore unstable.';
    bw.question.prompt = 'Why are many fission products radioactive?';
    bw.question.options = [
      { key: 'fragments', label: 'Many fission products are neutron-rich and decay toward greater stability, often through beta decay' },
      { key: 'more', label: 'Because fission always releases more energy than fusion' },
      { key: 'neutrons', label: 'Because the free neutrons remain radioactive for thousands of years' }
    ];
    bw.question.correct = 'fragments';
  }
  setConsequence('b-waste', 'fragments', 'Correct. Many fission products are unstable and decay on timescales ranging from very short to long. Reactor waste can also include activation products and transuranic nuclides, so the waste inventory is broader than fission fragments alone.');
  setConsequence('b-waste', 'more', 'Radioactive waste is not explained by the total energy released. It depends on which nuclides are produced and how stable they are.');
  setConsequence('b-waste', 'neutrons', 'Free neutrons do not remain stored as long-lived radioactive waste. Neutrons can instead be captured by materials and create radioactive activation products.');

  assign(scenario('b-activation'), {
    why: 'Neutron capture can make Mo-99 without fission, but the product remains mixed with chemically identical molybdenum, which lowers specific activity.'
  });
  setConsequence('b-activation', 'specific', 'Correct. After neutron capture, radioactive Mo-99 is mixed with a much larger amount of nonradioactive molybdenum that cannot be removed by ordinary chemical separation. The result has lower specific activity than fission-produced Mo-99.');
  setConsequence('b-activation', 'element', 'The element remains molybdenum because neutron capture changes A but not Z. It can still decay to technetium in a generator.');
  setConsequence('b-activation', 'inactive', 'Neutron capture can create radioactive nuclides. Mo-98 capturing a neutron produces radioactive Mo-99.');

  assign(scenario('b-decay'), {
    why: 'Alpha decay and fission are different nuclear processes even though both make the parent nucleus smaller.',
    kindNote: 'An alpha particle is a small, fixed fragment. Fission produces two substantial fragments and may be spontaneous or induced.'
  });
  setConsequence('b-decay', 'no', 'Correct. This is alpha decay: the nucleus emits a helium-4 nucleus. Fission instead produces two substantial fragments and may occur spontaneously or be induced, depending on the nuclide and conditions.');
  setConsequence('b-decay', 'yes', 'A nucleus becoming smaller does not automatically make the process fission. The helium-4 product identifies this reaction as alpha decay.');
  setConsequence('b-decay', 'partial', 'A helium-4 nucleus is an alpha particle, not one of the two large fragments characteristic of fission.');

  // ------------------------------- C.14(C) applications -------------------------------
  assign(scenario('c-bone'), {
    why: 'An external gamma camera needs photons that can leave the body. Charged alpha and beta particles have short ranges in tissue and are not the signal used by that camera.'
  });
  setConsequence('c-bone', 'Tc-99m', 'Correct. Tc-99m emits a useful 140 keV gamma photon that can leave the body and reach a gamma camera. Its roughly 6-hour half-life also limits how long activity remains. Actual administered activity depends on the study and clinical protocol.');
  setConsequence('c-bone', 'Sr-90', 'Sr-90 is a beta emitter. Its electrons deposit energy in tissue but do not provide the penetrating gamma signal the camera needs, so it is not an appropriate diagnostic tracer for this scan.');
  setConsequence('c-bone', 'Am-241', 'Am-241 is primarily an alpha emitter with a very long half-life. Alpha particles have too little range to provide an external-camera signal, so it is not an appropriate diagnostic tracer here.');

  assign(scenario('c-pet'), {
    why: 'PET coincidence detection is designed for the annihilation photons produced after positron emission.'
  });
  setConsequence('c-pet', 'F-18', 'Correct. F-18 emits a positron. Positron-electron annihilation usually produces two 511 keV photons moving in nearly opposite directions; many coincidence events are reconstructed into a tracer-distribution image.');
  setConsequence('c-pet', 'Tc-99m', 'Tc-99m is well suited to gamma-camera or SPECT imaging, but it does not provide the paired 511 keV annihilation photons required for PET coincidence detection.');
  setConsequence('c-pet', 'I-131', 'I-131 is not a standard PET positron emitter. Its decay does not provide the paired 511 keV annihilation signal this detector is designed to use.');

  assign(scenario('c-thyroid'), {
    goal: 'A patient with an overactive thyroid needs radioiodine treatment. Pick the isotope whose chemistry targets the thyroid and whose particle radiation deposits energy over a short tissue range.',
    why: 'The thyroid concentrates iodine. I-131 beta particles deposit much of their energy near the iodine-avid tissue, although dose outside the target is not zero.'
  });
  setConsequence('c-thyroid', 'I-131', 'Correct. The thyroid concentrates iodine, and I-131 beta radiation deposits much of its energy over a short tissue range. Nearby tissues receive less dose than the thyroid target, but not zero dose.');
  setConsequence('c-thyroid', 'Tc-99m', 'Tc-99m can be used in thyroid imaging, but its photon emission is chosen for detection rather than for delivering the beta-particle treatment requested here.');
  setConsequence('c-thyroid', 'Co-60', 'Co-60 teletherapy sources are sealed external sources, not iodine tracers concentrated by thyroid tissue. It does not match the targeting mechanism in this scenario.');

  assign(scenario('c-sterile'), {
    why: 'Industrial sterilization needs penetrating radiation and a validated absorbed dose throughout the product load. A long-lived sealed source can support repeated use.'
  });
  setConsequence('c-sterile', 'Co-60', 'Correct. Co-60 gamma radiation is penetrating enough for packaged products, and its 5.27-year half-life supports long-term source use. Industrial sterilization still requires validated dose mapping and source management.');
  setConsequence('c-sterile', 'F-18', 'F-18 has a half-life of about 110 minutes, far too short for a long-lived industrial sealed source.');
  setConsequence('c-sterile', 'Tc-99m', 'Tc-99m has a roughly 6-hour half-life, so its activity falls too rapidly for a source intended to operate for years.');

  assign(scenario('c-smoke'), {
    why: 'The detector needs a tiny, long-lived sealed source that ionizes air inside a small chamber while keeping radioactive material contained.'
  });
  setConsequence('c-smoke', 'Am-241', 'Correct. A small sealed Am-241 source emits short-range alpha particles that ionize air in the chamber. Its long half-life supports years of use, while source encapsulation keeps the radioactive material contained.');
  setConsequence('c-smoke', 'Co-60', 'Co-60 emits penetrating gamma radiation and is not appropriate for the tiny ionization chamber used in a household-style smoke detector.');
  setConsequence('c-smoke', 'I-131', 'I-131 has an approximately 8-day half-life, so its activity would fall far too quickly for a detector expected to operate for years.');

  assign(scenario('c-exit'), {
    why: 'A self-luminous sign needs a long-lived source whose radiation can excite a phosphor while remaining contained by the tube under normal use.'
  });
  setConsequence('c-exit', 'H-3', 'Correct. Tritium emits very low-energy beta particles that excite the phosphor and are stopped by the sealed tube under normal use. Its 12.3-year half-life supports multi-year operation.');
  setConsequence('c-exit', 'Co-60', 'Co-60 gamma radiation is far too penetrating for this application and would create unnecessary external exposure.');
  setConsequence('c-exit', 'F-18', 'F-18 has a half-life of about 110 minutes, so it cannot provide years of self-powered illumination.');

  assign(scenario('c-coffin'), {
    why: 'Radiocarbon dating is useful for once-living material over thousands of years because carbon-14 changes measurably on that timescale. Real dates also require calibration and contamination control.'
  });
  setConsequence('c-coffin', 'C-14', 'Correct. Carbon-14 has a 5,730-year half-life, so a several-thousand-year-old wood sample retains a measurable fraction. Laboratories convert the measurement to a radiocarbon age and then calibrate it to calendar time.');
  setConsequence('c-coffin', 'U-238', 'U-238 has a 4.47-billion-year half-life, so its relative change over only a few thousand years is tiny. It is also not the carbon clock used for once-living wood.');
  setConsequence('c-coffin', 'Tc-99m', 'Tc-99m has a 6-hour half-life and is not naturally incorporated into wood as a dating clock. It is unsuitable for an archaeological sample thousands of years old.');

  assign(scenario('c-arctic'), {
    why: 'A remote radioisotope power source needs a long-lived nuclide so heat production remains useful for years. Engineering also requires shielding, containment, and security.'
  });
  setConsequence('c-arctic', 'Sr-90', 'Correct. Sr-90 has a 28.8-year half-life, so a shielded radioisotope thermoelectric generator can continue producing useful heat and electrical power for years.');
  setConsequence('c-arctic', 'Tc-99m', 'Tc-99m loses half its activity every 6 hours, far too quickly for a remote power source expected to operate for years.');
  setConsequence('c-arctic', 'F-18', 'F-18 loses half its activity in about 110 minutes, so it is unsuitable for long-term remote power.');

  // ------------------------------- half-life practice -------------------------------
  const halfLifeCopy = {
    'hl-bone': {
      goal: 'The Tc-99m eluate was assayed earlier. Calculate the activity remaining now from the elapsed time and the correct half-life.',
      why: 'This activity practices radioactive decay. Real nuclear-medicine doses are verified with calibrated instruments and site protocols before administration.',
      actionLabel: 'Check the activity'
    },
    'hl-pet': {
      goal: 'An F-18 delivery was assayed at its calibration time and arrived later. Calculate the activity remaining when the PET slot begins.',
      why: 'F-18 has a short half-life, so elapsed time matters. Real clinical activity is verified with calibrated equipment before administration.',
      actionLabel: 'Check the activity'
    },
    'hl-capsule': {
      goal: 'An I-131 therapy capsule was assayed before shipment. Calculate the activity remaining on the treatment day.',
      why: 'This activity isolates the half-life calculation. Real dispensing and administration require calibrated measurements and clinical/radiation-safety procedures.',
      actionLabel: 'Check the activity'
    },
    'hl-shipment': {
      goal: 'A Mo-99 generator was assayed before shipping. Calculate the parent activity expected when it arrives.',
      why: 'The estimate helps with planning because Mo-99 decays during transport. Delivery measurements and supplier specifications determine real acceptance decisions.',
      actionLabel: 'Check shipment activity'
    }
  };
  Object.entries(halfLifeCopy).forEach(([id, patch]) => {
    const s = scenario(id);
    if (!s) return;
    assign(s, patch);
    s.safeState = 'WITHIN MODEL RANGE';
    s.lowState = 'CALCULATION LOW';
    s.highState = 'CALCULATION HIGH';
    s.safe = 'Your result is within the activity’s ±6% grading range around the model value. That band is a simulation scoring rule, not a clinical tolerance.';
    s.low = 'Your result is below the model value. Recheck the half-life and exponent. In real practice, activity is verified with calibrated instrumentation before use.';
    s.high = 'Your result is above the model value. Recheck the half-life and exponent. In real practice, activity is verified with calibrated instrumentation before use.';
    s.fail = 'No numerical activity was submitted. Enter the calculated activity before checking the result.';
  });

  // ------------------------------- Honors -------------------------------
  assign(scenario('h1-series'), {
    system: 'Net decay-series model',
    goal: 'In this simplified net-chain model, find the total alpha and beta-minus decays needed to connect the parent nuclide to the listed stable endpoint.',
    why: 'Each alpha changes A by −4 and Z by −2; each beta-minus leaves A unchanged and changes Z by +1. Real decay series can branch, but this activity uses net counts only.',
    success: 'The net alpha and beta-minus counts conserve both mass number and atomic number.',
    fail: 'The net counts do not conserve A and Z. Recheck the alpha count from the mass-number change, then use beta-minus decays to reach the target Z.'
  });

  assign(scenario('h2-binding'), {
    system: 'Binding-energy curve',
    goal: 'Calculate the binding energy per nucleon, then place the nuclide on the light side, near the iron/nickel peak, or on the heavy side of the curve.',
    why: 'Binding energy per nucleon rises toward the iron/nickel region and then decreases gradually. Energy can be released when a reaction forms products with greater binding energy per nucleon; the curve is a trend, not a rule that every nuclide automatically fuses or fissions.',
    success: 'The calculation and curve region agree.',
    fail: 'Recheck the mass defect and divide the total binding energy by the number of nucleons before choosing a curve region.'
  });

  assign(scenario('h3-effective'), {
    system: 'Effective half-life model',
    goal: 'Treat physical decay and biological clearance as independent first-order processes. Calculate the effective half-life, then the time to the exercise threshold.',
    why: 'In this simplified model, the removal rates add, so the reciprocals of the half-lives add. Real patient-release decisions use dose-based rules and patient-specific instructions, not these exercise percentages.',
    success: 'Both calculations match the simplified first-order model.',
    fail: 'Recheck the reciprocal-rate calculation and the number of effective half-lives needed to reach the exercise threshold.'
  });

  // ------------------------------- capstone -------------------------------
  const cap = scenario('cap-lastcase');
  if (cap) {
    cap.system = 'Final schedule decision';
    cap.goal = 'A cardiac stress scan is the last morning slot. Using only the simulated vial activity and the displayed afternoon availability, choose the best action.';
    cap.why = 'This capstone uses a simplified activity-and-schedule rule to connect half-life with planning. It is not clinical guidance.';
    cap.options = [
      { key: 'scan', label: 'Use this vial and keep the current slot',
        good: 'In this simulation, the vial meets the displayed activity target, so the current slot can proceed.',
        consequence: 'The displayed vial activity is below the simulation target, so this option does not meet the stated criterion.' },
      { key: 'rebook', label: 'Use the fresh generator in the open afternoon slot',
        good: 'The current vial is below the target and an afternoon slot is available, so this option satisfies both displayed constraints.',
        consequence: 'The displayed schedule has no afternoon opening, so this option cannot be completed as stated.' },
      { key: 'refer', label: 'Use the partner site today',
        good: 'The current vial is below the target and no afternoon slot is open, so referral is the available option in this simulation.',
        consequence: 'The displayed information shows a workable option at this site, so referral is unnecessary in this simulation.' }
    ];
  }

  // ------------------------------- Case File -------------------------------
  assign(CASE, {
    kicker: 'a real archaeological dating case',
    title: 'Radiocarbon dating placed Ötzi in the Copper Age',
    teaser: 'How carbon-14 helped date a 5,300-year-old glacier mummy',
    hook: 'Hikers discovered Ötzi in the Alps on 19 September 1991. Archaeological evidence and radiocarbon measurements showed that he lived more than 5,000 years ago. Radiocarbon dating is not just one fraction plugged into one equation: laboratories measure carbon-14 and calibrate the radiocarbon age against reference records to estimate calendar age.',
    stats: [
      { v: '1991', k: 'year Ötzi was discovered in the Alps' },
      { v: '>5,300 y', k: 'time since he lived in the Copper Age' },
      { v: '5,730 y', k: 'carbon-14 half-life used in radiocarbon dating' },
      { v: 'C-14', k: 'radioactive isotope measured in once-living material' }
    ],
    steps: [
      {
        t: 'A body emerged from the ice',
        body: 'On 19 September 1991, hikers found a naturally preserved body near the Tisenjoch in the Alps. At first it was treated as a recent death. The clothing, tools, and later laboratory measurements showed that the find was prehistoric.',
        chem: 'Preservation alone cannot give a numerical age. Dating requires a measurable process that changes with time, such as radioactive decay.',
        cap: '1991: a glacier mummy is found, but its age is not yet known.'
      },
      {
        t: 'Carbon-14 provides a clock',
        body: 'Cosmic-ray reactions in the atmosphere continually produce carbon-14. Carbon enters living organisms through the carbon cycle. After an organism dies, it no longer exchanges carbon in the same way, and its carbon-14 continues to decay.',
        chem: 'Carbon-14 beta-minus decays with a half-life of about 5,730 years. The fraction remaining decreases exponentially, so thousands of years can produce a measurable change.',
        cap: 'Living material exchanges carbon; after death, carbon-14 decay becomes the clock.'
      },
      {
        t: 'Measurement becomes a calendar date',
        body: 'Laboratories can measure the carbon-14 content of organic samples and calculate a radiocarbon age. Because atmospheric carbon-14 has varied over time, that radiocarbon age must be calibrated with independently dated records such as tree rings. Ötzi’s dating places him in the Copper Age, more than 5,300 years ago.',
        chem: 'The simple decay equation explains how fraction remaining relates to elapsed time. Real radiocarbon dating adds calibration, uncertainty, sample preparation, and contamination control before reporting a calendar-age range.',
        cap: 'Measure carbon-14, calculate a radiocarbon age, then calibrate it to calendar time.'
      },
      {
        t: 'The date gave the finds context',
        body: 'Once researchers knew Ötzi belonged to the Copper Age, objects found with him—including a copper axe, bow equipment, clothing, and containers—could be interpreted in the correct archaeological period. Later imaging also identified a flint arrowhead in his left shoulder, adding evidence about the circumstances of his death.',
        chem: 'Radiometric dating supplies a time scale. The same exponential-decay mathematics can be used for very different isotopes, but the useful time range depends on the isotope’s half-life.',
        cap: 'A reliable time range made the body and equipment interpretable as one Copper Age find.'
      }
    ],
    quiz: {
      q: 'A once-living sample has 25% of the carbon-14 it started with in the simplified decay model. How many carbon-14 half-lives have passed?',
      options: [
        { label: 'Two half-lives, because 100% → 50% → 25%', correct: true },
        { label: 'One quarter of a half-life, because 25% remains', correct: false },
        { label: 'Four half-lives, because 25% is one quarter', correct: false }
      ],
      explain: 'Each half-life halves the amount remaining. Two halvings take 100% to 50% to 25%, so the simplified model gives two half-lives. For carbon-14 that is 11,460 radiocarbon years before calibration; real archaeological dates are then calibrated to calendar time.'
    },
    punch: 'The half-life equation gives the decay clock; careful measurement, calibration, and uncertainty turn that clock into a defensible radiocarbon date.',
    careers: ['Archaeologist', 'Radiocarbon laboratory scientist', 'Nuclear medicine technologist', 'Forensic anthropologist'],
    cta: { label: 'Practice a half-life calculation', call: "setMode('dose')" }
  });
}

function replaceExactText(root, from, to) {
  root.querySelectorAll('button, span, p, div').forEach(el => {
    if (el.children.length === 0 && el.textContent.trim() === from) el.textContent = to;
  });
}

function replaceAttr(root, attr, from, to) {
  root.querySelectorAll(`[${CSS.escape(attr)}]`).forEach(el => {
    if (el.getAttribute(attr) === from) el.setAttribute(attr, to);
  });
}

export function applyStaticCopy(root = document) {
  const meta = root.querySelector('meta[name="description"]');
  if (meta) meta.content = 'Unit 11 Nuclear Chemistry: decay equations, half-life, nuclear applications, fission and fusion, with TEKS C.14 practice.';

  replaceAttr(root, 'aria-label', 'The last call', 'Final decision');
  replaceAttr(root, 'title', 'The last call · capstone', 'Final decision · capstone');
  replaceExactText(root, 'The last call', 'Final decision');
  replaceExactText(root, 'Call', 'Decision');
  replaceExactText(root, 'Half-life on the clock is a fourth core skill and gates the last call.', 'Half-life calculation is the fourth core skill and helps unlock the final decision.');
  replaceExactText(root, 'Log the source', 'Check the decay');
  replaceAttr(root, 'x-text', "'Say what it is emitting first.'", "'Identify the emission first.'");
  replaceExactText(root, 'Certify the decay equations bench (three correct in a row) to unlock the series bench.', 'Get three decay-equation problems correct in a row to unlock the decay-series model.');
  replaceExactText(root, 'Close the chain', 'Check net counts');
  replaceExactText(root, 'under-read', 'below model');
  replaceExactText(root, 'on the assay', 'within model');
  replaceExactText(root, 'over-read', 'above model');
  replaceExactText(root, 'Certify the half-life bench to unlock the patient release bench.', 'Get three half-life problems correct in a row to unlock the effective-half-life model.');
  replaceExactText(root, 'release below', 'exercise threshold');
  replaceExactText(root, 'Tell the ward', 'Check threshold time');
  replaceExactText(root, '1. Which vial do you reach for?', '1. Which isotope fits the job?');
  replaceExactText(root, 'Send it up', 'Submit isotope choice');
  replaceExactText(root, 'Fission: one heavy nucleus splits into two smaller ones', 'Fission: a heavy nucleus splits into two substantial fragments');
  replaceExactText(root, 'Fusion: light nuclei join into a heavier one', 'Fusion: light nuclei join to form a heavier nucleus');
  replaceExactText(root, 'Neither: this is ordinary decay or capture, not splitting or joining', 'Neither: this is decay or capture, not fission or fusion');
  replaceExactText(root, 'Put it on the record', 'Submit classification');
  replaceExactText(root, 'Certify the fission and fusion bench to unlock the binding-energy bench.', 'Get three fission/fusion problems correct in a row to unlock binding energy.');
  replaceExactText(root, 'Which way does this nuclide release energy?', 'Which region of the binding-energy curve is this nuclide in?');
  replaceExactText(root, 'By fusion: it is light enough that joining moves it up the curve', 'Light side: suitable fusion reactions can move products toward the peak');
  replaceExactText(root, 'By fission: it is heavy enough that splitting moves it up the curve', 'Heavy side: suitable fission reactions can move products toward the peak');
  replaceExactText(root, 'Neither: it already sits near the top of the curve', 'Near peak: binding energy per nucleon is already close to the maximum');
  replaceAttr(root, 'x-text', "beVal === '' ? 'Work out the binding energy per nucleon first.' : 'Now say which way this nuclide releases energy.'", "beVal === '' ? 'Calculate the binding energy per nucleon first.' : 'Now choose its curve region.'");
  replaceExactText(root, 'Take the call', 'Start final decision');
  replaceExactText(root, 'Make the call.', 'Choose the best action using the displayed activity and schedule.');
  replaceExactText(root, 'Commit', 'Submit decision');
  replaceAttr(root, 'x-text', "'Make the call on the vial first.'", "'Choose an action first.'");
  replaceAttr(root, 'x-text', "worldLog.length ? worldLog[0].text : 'The vial was eluted at 07:00. No call has been made yet.'", "worldLog.length ? worldLog[0].text : 'The vial was eluted at 07:00. No task has been completed yet.'");

  // Capstone unlock sentence contains a live Alpine <span>, so replace only its text nodes.
  const capNote = Array.from(root.querySelectorAll('.note.note-info')).find(el =>
    el.textContent.includes('The last call unlocks once all four core benches'));
  if (capNote) {
    const textNodes = Array.from(capNote.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
    if (textNodes[0]) textNodes[0].textContent = ' The final decision unlocks after all four core activities are mastered. Mastered so far: ';
  }

  // Make the activity unit explicit wherever the world-state uses the fixed 25 mCi divisor.
  const shift = root.querySelector('.cockpit-instincts p');
  if (shift) {
    const tail = Array.from(shift.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.includes('doses still available'));
    if (tail) tail.textContent = ' simulated 25 mCi doses available';
  }

  const capPrescription = Array.from(root.querySelectorAll('.readout .cell .k')).find(el => el.textContent.trim() === 'prescription');
  if (capPrescription) capPrescription.textContent = 'simulation target';
}

function rewriteWorldText(text) {
  return String(text)
    .replace(/called correctly/gi, 'classified correctly')
    .replace(/right call/gi, 'decision supported')
    .replace(/wrong call/gi, 'decision needs revision');
}

function installGetter(obj, name, getter) {
  Object.defineProperty(obj, name, { configurable: true, enumerable: true, get: getter });
}

function after(sim, method, fn) {
  const base = sim[method].bind(sim);
  sim[method] = function (...args) {
    const result = base(...args);
    fn.call(this);
    return result;
  };
}

function refineSim(sim) {
  const baseRecordWorld = sim.recordWorld.bind(sim);
  sim.recordWorld = function (event) {
    return baseRecordWorld({ ...event, text: rewriteWorldText(event.text) });
  };

  installGetter(sim, 'activeReference', function () {
    if (this.mode === 'ident') {
      if (this.screenIsHonors) return [
        { k: 'Net-chain model', v: 'real series can branch; this activity counts only net alpha and beta-minus steps' },
        { k: 'Alpha', v: 'A − 4 and Z − 2 for each alpha decay' },
        { k: 'Beta minus', v: 'A unchanged and Z + 1 for each beta-minus decay' }
      ];
      return [
        { k: 'Alpha', v: 'A − 4, Z − 2' },
        { k: 'Beta', v: 'beta minus: A same, Z + 1 · beta plus: A same, Z − 1' },
        { k: 'Gamma', v: 'A and Z stay the same' }
      ];
    }
    if (this.mode === 'dose') {
      if (this.screenIsHonors) return [
        { k: 'Model assumption', v: 'physical decay and biological clearance are independent first-order processes' },
        { k: 'Rates add', v: '1/te = 1/tp + 1/tb' },
        { k: 'Exercise threshold', v: 'a calculation target here, not a patient-release rule' }
      ];
      return [
        { k: 'Decay law', v: 'N = N0(1/2)^(t/t1/2)' },
        { k: 'Use the right isotope', v: 'apply the half-life of the nuclide whose activity is being calculated' },
        { k: 'Scoring band', v: '±6% is this simulation’s grading range, not a clinical tolerance' }
      ];
    }
    if (this.mode === 'apply') return [
      { k: 'Imaging', v: 'a useful photon must escape the body and reach the detector; absorbed radiation still contributes dose' },
      { k: 'Therapy', v: 'short-range charged particles can deposit energy locally; exact range depends on energy and tissue' },
      { k: 'Half-life', v: 'match the source lifetime to how long the application needs it' }
    ];
    if (this.mode === 'power') {
      if (this.screenIsHonors) return [
        { k: 'Mass defect', v: 'separated-nucleon mass minus measured atomic mass' },
        { k: 'Curve peak', v: 'the iron/nickel region is near 8.8 MeV per nucleon' },
        { k: 'Energy trend', v: 'reactions can release energy when products have greater binding energy per nucleon' }
      ];
      return [
        { k: 'Fission', v: 'a heavy nucleus splits into two substantial fragments; fission may be spontaneous or induced' },
        { k: 'Fusion', v: 'light nuclei combine; overcoming electric repulsion requires extreme conditions' },
        { k: 'Neither', v: 'ordinary decay or neutron capture is not fission or fusion' }
      ];
    }
    if (this.mode === 'capstone') return [
      { k: 'Activity rule', v: 'use the displayed simulation target' },
      { k: 'Schedule rule', v: 'use the displayed afternoon availability' },
      { k: 'Scope', v: 'this is a simplified planning exercise, not clinical guidance' }
    ];
    return [];
  });

  const vialDescriptor = Object.getOwnPropertyDescriptor(sim, 'vialReadings');
  if (vialDescriptor && vialDescriptor.get) {
    const baseVialReadings = vialDescriptor.get;
    installGetter(sim, 'vialReadings', function () {
      return baseVialReadings.call(this).map(r => r.key === 'right'
        ? { ...r, label: 'Accuracy', hint: 'share of completed activity checks answered correctly' }
        : r.key === 'doses'
          ? { ...r, hint: 'simulated 25 mCi doses the vial can still provide' }
          : r);
    });
  }

  after(sim, 'pwCommit', function () {
    if (!this.pwVerdict) return;
    if (this.pwVerdict.state === 'CALLED IT') this.pwVerdict.state = 'CORRECTLY CLASSIFIED';
    this.pwVerdict.detail = this.pwVerdict.detail.replace(
      'Classify it wrong and everything downstream of it is wrong too.',
      'Misclassifying the process also makes the second conclusion unreliable.'
    );
  });

  after(sim, 'dsCommit', function () {
    const v = this.dsVerdict;
    if (!v) return;
    v.headline = v.headline
      .replace('On the prescription', 'Calculation matches the model')
      .replace('Under-read the vial', 'Calculation is low')
      .replace('Over-read the vial', 'Calculation is high');
    v.detail = v.detail
      .replace(/You called ([^,]+) against the ([^ ]+ mCi) actually in it\./, 'Your calculation is $1; the model value is $2.')
      .replace(/You called ([^,]+), ([^ ]+) below the ([^ ]+ mCi) in it\./, 'Your result is $1, $2 below the model value of $3.')
      .replace(/You called ([^,]+), ([^ ]+) above the ([^ ]+ mCi) in it\./, 'Your result is $1, $2 above the model value of $3.');
  });

  after(sim, 'srCommit', function () {
    if (!this.srVerdict) return;
    this.srVerdict.state = this.srOk ? 'NET COUNTS MATCH' : 'RECHECK NET COUNTS';
    this.srVerdict.headline = this.srOk ? 'Mass number and atomic number are conserved' : 'The net counts do not conserve';
    if (!this.srVerdict.detail.startsWith('In this simplified net-chain model,')) {
      this.srVerdict.detail = `In this simplified net-chain model, ${this.srVerdict.detail}`;
    }
  });

  after(sim, 'beCommit', function () {
    if (!this.be || !this.beVerdict) return;
    const c = this.be.c;
    const valueOk = this.beValueOk;
    const classOk = this.beClass === this.be.route;
    const region = this.be.route === 'fusion' ? 'light side'
      : this.be.route === 'fission' ? 'heavy side' : 'near-peak region';
    const calc = `Separated nucleons total ${this.fmt(this.be.sum, 7)} u; the measured atom is ${this.fmt(c.mass, 7)} u. The mass defect is ${this.fmt(this.be.defect, 4)} u, giving ${this.fmt(this.be.total, 5)} MeV total or ${this.fmt(this.be.per, 3)} MeV per nucleon.`;
    if (valueOk && classOk) {
      this.beVerdict.state = 'CURVE REGION IDENTIFIED';
      this.beVerdict.headline = 'Calculation and curve region match';
      this.beVerdict.detail = `${calc} ${c.name} is in the ${region}. The iron/nickel region is near the maximum of the binding-energy-per-nucleon curve.`;
    } else if (!valueOk) {
      this.beVerdict.state = 'RECHECK CALCULATION';
      this.beVerdict.headline = 'Binding-energy value needs revision';
      this.beVerdict.detail = `${calc} Recheck the mass defect, convert with ${this.MEV_PER_U} MeV/u, and divide by A.`;
    } else {
      this.beVerdict.state = 'RECHECK CURVE REGION';
      this.beVerdict.headline = 'Calculation is right; region needs revision';
      this.beVerdict.detail = `${calc} At A = ${c.A}, this activity places ${c.sym} in the ${region}. This classification is a simplified curve-region model, not a claim that the isolated nuclide automatically fuses or fissions.`;
    }
  });

  after(sim, 'efCommit', function () {
    if (!this.ef || !this.efVerdict) return;
    const c = this.ef.c;
    const truth = `In the simplified first-order model, 1/te = 1/${this.fmt(c.physical)} + 1/${this.fmt(c.biological)}, so te = ${this.fmt(this.ef.te)} ${this.ef.unit}. Reaching ${Math.round(c.threshold * 100)}% of the starting retained activity takes ${this.fmt(this.ef.time)} ${this.ef.unit}.`;
    if (this.efTeOk && this.efTimeOk) {
      this.efVerdict.state = 'THRESHOLD TIME FOUND';
      this.efVerdict.headline = 'Both calculations match the model';
      this.efVerdict.detail = `${truth} The percentage is an exercise threshold, not a patient-release rule.`;
    } else if (!this.efTeOk) {
      this.efVerdict.state = 'RECHECK EFFECTIVE HALF-LIFE';
      this.efVerdict.headline = 'Effective half-life needs revision';
      this.efVerdict.detail = `${truth} Add the reciprocal rates; do not add or average the half-lives themselves.`;
    } else {
      this.efVerdict.state = 'RECHECK THRESHOLD TIME';
      this.efVerdict.headline = 'Effective half-life is right; time needs revision';
      this.efVerdict.detail = truth;
    }
  });

  after(sim, 'capCommit', function () {
    if (!this.cap || !this.capVerdict) return;
    const opt = this.cap.sc.options.find(o => o.key === this.capPick);
    const good = this.capPick === this.cap.correct;
    const facts = `At ${this.cap.clockAtCall}, the vial has ${this.fmt(this.cap.vialAtCall)} mCi and the simulation target is ${this.fmt(this.cap.needed)} mCi. The afternoon schedule ${this.cap.afternoonOpen ? 'has an open slot' : 'has no open slot'}.`;
    this.capVerdict.state = good ? 'DECISION SUPPORTED' : 'REVISE DECISION';
    this.capVerdict.headline = good ? 'The displayed constraints support this choice' : 'This choice conflicts with a displayed constraint';
    this.capVerdict.detail = `${facts} ${good ? opt.good : opt.consequence}`;
  });

  return sim;
}

export function refineCreateSim(baseCreateSim) {
  return function refinedCreateSim(...args) {
    return refineSim(baseCreateSim.apply(this, args));
  };
}
