// tests/chem.test.js — regression tests for the shared engine. Run: node tests/chem.test.js
import {
  parseFormula, molarMass, percentComposition, isBalanced, isLowestTerms,
  limitingReactant, moleRatio, percentYield, bondType, percentIonicCharacter,
  ELECTRONEGATIVITY, fmt,
  idealGasSolve, compressibility, vanderWaalsPressure, partialPressures,
  sigFigs, roundToSigFigs, density, percentError, mean, sampleStdDev,
  ELEMENTS, averageAtomicMass, electronConfiguration, formatConfig,
  shellOccupancy, valenceElectrons, frequencyOf, photonEnergy, rydbergWavelength,
  period, effectiveNuclearCharge,
  empiricalFormula, combustionFormula,
  molarity, dilute, predictSolubility, ionicFormula, doubleReplacement,
  IONS, SOLUBILITY_RULES
} from '../shared/js/chem.js';
import { pH, pOH, pHfromPOH, equivalenceVolume, titrationPH, phWeakAcid } from '../shared/js/chem.js';
import {
  SPECIFIC_HEAT, heatTransfer, finalTemperature, classifyThermal, hessCombine,
  enthalpyFromFormation,
  DECAY_PARTICLES, decayProduct, isBalancedNuclear, CARBON14_HALFLIFE, MEV_PER_U,
  halfLifeRemaining, halfLivesElapsed, radiometricAge, massDefect, bindingEnergyMeV,
  NUCLIDES, NUCLEAR_ELEMENTS, symbolForZ, nameForZ,
  HYDROGEN_ATOM_MASS_U, NEUTRON_MASS_U, nucleonMassSum, effectiveHalfLife
} from '../shared/js/chem.js';

const approx = (a, b, t = 0.05) => Math.abs(a - b) < t;
let pass = 0, fail = 0;
const t = (name, cond) => { cond ? pass++ : (fail++, console.log('FAIL:', name)); };
// True when fn() throws (used for the engine's validation guards).
const throws = fn => { try { fn(); return false; } catch { return true; } };

// formula parsing + molar mass
t('parse Fe2O3', JSON.stringify(parseFormula('Fe2O3')) === '{"Fe":2,"O":3}');
t('parse Ca(OH)2', JSON.stringify(parseFormula('Ca(OH)2')) === '{"Ca":1,"O":2,"H":2}');
t('M(H2O)=18.015', approx(molarMass('H2O'), 18.015));
t('M(Fe2O3)~159.7', approx(molarMass('Fe2O3'), 159.69, 0.1));
t('%O in water ~88.8', approx(percentComposition('H2O')[0].percent, 88.8, 0.3));

// balancing
t('Haber balanced', isBalanced([{ f: 'N2', c: 1 }, { f: 'H2', c: 3 }], [{ f: 'NH3', c: 2 }]));
t('lowest terms', isLowestTerms([{ f: 'N2', c: 1 }, { f: 'H2', c: 3 }], [{ f: 'NH3', c: 2 }]));
t('reject 2x multiple', !isLowestTerms([{ f: 'N2', c: 2 }, { f: 'H2', c: 6 }], [{ f: 'NH3', c: 4 }]));

// stoichiometry + limiting reactant (rust: 4Fe + 3O2 -> 2Fe2O3, 100 g each)
const rust = { reactants: [{ f: 'Fe', c: 4 }, { f: 'O2', c: 3 }], products: [{ f: 'Fe2O3', c: 2 }] };
const lr = limitingReactant(rust, { Fe: 100, O2: 100 });
t('rust Fe limiting', lr.limiting === 'Fe');
t('rust ~143 g Fe2O3', approx(lr.products[0].grams, 143, 2));
t('mole ratio NH3 from 2 mol H2', approx(moleRatio({ f: 'H2', c: 3 }, { f: 'NH3', c: 2 }, 2), 1.333, 0.01));
t('percent yield 80', approx(percentYield(8, 10), 80));

// bonding (metal/nonmetal-aware rule)
t('NaCl ionic', bondType('Na', 'Cl') === 'ionic');
t('FeO ionic (metal+nonmetal)', bondType('Fe', 'O') === 'ionic');
t('BF3 polar covalent (two nonmetals)', bondType('B', 'F') === 'polar covalent');
t('HCl polar covalent', bondType('H', 'Cl') === 'polar covalent');
t('Cl2 nonpolar covalent', bondType('Cl', 'Cl') === 'nonpolar covalent');
t('CuZn metallic', bondType('Cu', 'Zn') === 'metallic');
// METALS covers every metal that has an electronegativity entry. Before it was widened
// these five fell through to the two-nonmetals branch and came back covalent.
t('BaCl2 ionic (Ba is a metal)', bondType('Ba', 'Cl') === 'ionic');
t('PbO ionic (Pb is a metal)', bondType('Pb', 'O') === 'ionic');
t('HgCl2 ionic (Hg is a metal)', bondType('Hg', 'Cl') === 'ionic');
t('TiO2 ionic (transition metal)', bondType('Ti', 'O') === 'ionic');
t('Au-Au metallic', bondType('Au', 'Au') === 'metallic');
t('Fe-Ni alloy metallic', bondType('Fe', 'Ni') === 'metallic');
// The metalloid boundary: B and Si stay OUT of METALS on purpose at HS level.
t('BF3 stays polar covalent (B is not a metal)', bondType('B', 'F') === 'polar covalent');
t('SiO2 polar covalent (Si is not a metal)', bondType('Si', 'O') === 'polar covalent');
t('%ionic NaCl ~70.7', approx(percentIonicCharacter(Math.abs(ELECTRONEGATIVITY.Na - ELECTRONEGATIVITY.Cl)), 70.7, 1.5));
t('%ionic of 0 is 0', percentIonicCharacter(0) === 0);

// gas laws & kinetic theory (Unit 7)
t('V of 1 mol ideal gas at STP ~22.41 L', approx(idealGasSolve({ n: 1, T: 273.15, P: 1 }, 'V'), 22.41, 0.05));
t('P from nRT/V ~1 atm', approx(idealGasSolve({ n: 1, V: 22.414, T: 273.15 }, 'P'), 1, 0.005));
t('n from PV/RT ~1 mol', approx(idealGasSolve({ P: 1, V: 22.414, T: 273.15 }, 'n'), 1, 0.005));
t('T from PV/nR ~273.15 K', approx(idealGasSolve({ P: 1, V: 22.414, n: 1 }, 'T'), 273.15, 0.5));
t('ideal gas Z = 1', approx(compressibility({ P: 1, V: 22.414, n: 1, T: 273.15 }), 1, 0.005));
t('vdW O2 ~ ideal at low density', approx(vanderWaalsPressure({ n: 1, V: 22.414, T: 273.15, a: 1.36, b: 0.0318 }), 1, 0.02));
const dalton = partialPressures([{ name: 'O2', mol: 0.5 }, { name: 'N2', mol: 1.5 }], 4);
t('Dalton O2 fraction 0.25', approx(dalton[0].fraction, 0.25));
t('Dalton O2 partial 1 atm', approx(dalton[0].partial, 1));
t('Dalton partials sum to total', approx(dalton[0].partial + dalton[1].partial, 4));

// measurement & data analysis (Unit 1)
t('sigFigs 100 -> 1', sigFigs('100') === 1);
t('sigFigs 100. -> 3', sigFigs('100.') === 3);
t('sigFigs 0.00250 -> 3', sigFigs('0.00250') === 3);
t('sigFigs 1500 -> 2', sigFigs('1500') === 2);
t('sigFigs 100.0 -> 4', sigFigs('100.0') === 4);
t('sigFigs 2.50e3 -> 3', sigFigs('2.50e3') === 3);
t('sigFigs 0.5 -> 1', sigFigs('0.5') === 1);
t('round 123.456 to 4sf', roundToSigFigs(123.456, 4) === 123.5);
t('round 0.0012345 to 2sf', approx(roundToSigFigs(0.0012345, 2), 0.0012, 1e-9));
t('round 9.96 to 2sf', roundToSigFigs(9.96, 2) === 10);
t('density 27.0/10.0 = 2.7', approx(density(27.0, 10.0), 2.7));
t('percentError 9.8 vs 10 = 2', approx(percentError(9.8, 10), 2));
t('mean 1,2,3 = 2', mean([1, 2, 3]) === 2);
t('sampleStdDev classic ~2.138', approx(sampleStdDev([2, 4, 4, 4, 5, 5, 7, 9]), 2.138, 0.01));

// atomic structure & light (Unit 2)
t('ELEMENTS H is z1', ELEMENTS[0].z === 1 && ELEMENTS[0].sym === 'H');
t('ELEMENTS has 37 entries', ELEMENTS.length === 37);
t('avg atomic mass Cl ~35.45', approx(averageAtomicMass([{ mass: 34.969, abundance: 75.77 }, { mass: 36.966, abundance: 24.23 }]), 35.45, 0.01));
t('avg atomic mass works with fractions', approx(averageAtomicMass([{ mass: 10.013, abundance: 0.199 }, { mass: 11.009, abundance: 0.801 }]), 10.81, 0.01));
t('config Na = 1s2 2s2 2p6 3s1', formatConfig(electronConfiguration(11)) === '1s2 2s2 2p6 3s1');
t('config Ar = 1s2 2s2 2p6 3s2 3p6', formatConfig(electronConfiguration(18)) === '1s2 2s2 2p6 3s2 3p6');
t('config Fe fills 4s before 3d', formatConfig(electronConfiguration(26)) === '1s2 2s2 2p6 3s2 3p6 4s2 3d6');
t('config electrons sum to count', electronConfiguration(26).reduce((s, x) => s + x.e, 0) === 26);
t('shellOccupancy Na = 2,8,1', JSON.stringify(shellOccupancy(11)) === '[2,8,1]');
t('shellOccupancy Ca = 2,8,8,2', JSON.stringify(shellOccupancy(20)) === '[2,8,8,2]');
t('shellOccupancy Fe = 2,8,14,2', JSON.stringify(shellOccupancy(26)) === '[2,8,14,2]');
t('valence Cl = 7', valenceElectrons(17) === 7);
t('valence Mg = 2', valenceElectrons(12) === 2);
t('valence Ne = 8', valenceElectrons(10) === 8);
t('valence He = 2', valenceElectrons(2) === 2);
t('Balmer alpha ~656 nm', approx(rydbergWavelength(2, 3) * 1e9, 656.3, 0.5));
t('Balmer beta ~486 nm', approx(rydbergWavelength(2, 4) * 1e9, 486.2, 0.5));
t('frequency of 656nm ~4.57e14', approx(frequencyOf(656.3e-9) / 1e14, 4.568, 0.01));
t('photon E from 656nm ~3.03e-19 J', approx(photonEnergy({ wavelength: 656.3e-9 }) / 1e-19, 3.027, 0.01));
t('photon E from freq = h*nu', approx(photonEnergy({ frequency: 5e14 }) / 1e-19, 3.313, 0.01));

// periodic position + effective nuclear charge (Unit 3)
t('period He = 1', period(2) === 1);
t('period Na = 3', period(11) === 3);
t('period Fe = 4', period(26) === 4);
t('period Pb = 6', period(82) === 6);
t('Zeff Na = 1', effectiveNuclearCharge(11) === 1);
t('Zeff Cl = 7', effectiveNuclearCharge(17) === 7);
t('Zeff Ar = 8', effectiveNuclearCharge(18) === 8);
t('Zeff rises across period 3 (Na<Cl)', effectiveNuclearCharge(11) < effectiveNuclearCharge(17));
t('Zeff constant down group 1 (Li = K)', effectiveNuclearCharge(3) === effectiveNuclearCharge(19));
t('EN extended with Sc = 1.36', ELECTRONEGATIVITY.Sc === 1.36);
t('EN extended with Au = 2.54', ELECTRONEGATIVITY.Au === 2.54);
t('EN leaves noble gases undefined', ELECTRONEGATIVITY.Ne === undefined && ELECTRONEGATIVITY.Ar === undefined);

// empirical + combustion formulas (Unit 5, C.8D + Honors)
const ef = a => JSON.stringify(empiricalFormula(a));
t('empirical Fe2O3 from 1.5 ratio', ef([{ el: 'Fe', moles: 1 }, { el: 'O', moles: 1.5 }]) === '[{"el":"Fe","n":2},{"el":"O","n":3}]');
t('empirical 1.33 ratio -> 3:4', ef([{ el: 'C', moles: 3 }, { el: 'H', moles: 4 }]) === '[{"el":"C","n":3},{"el":"H","n":4}]');
t('empirical 1.25 ratio -> 4:5', ef([{ el: 'C', moles: 4 }, { el: 'H', moles: 5 }]) === '[{"el":"C","n":4},{"el":"H","n":5}]');
t('empirical reduces common factor', ef([{ el: 'C', moles: 2 }, { el: 'H', moles: 4 }, { el: 'O', moles: 2 }]) === '[{"el":"C","n":1},{"el":"H","n":2},{"el":"O","n":1}]');
t('empirical from grams -> H2O', ef([{ el: 'H', grams: 2.016 }, { el: 'O', grams: 15.999 }]) === '[{"el":"H","n":2},{"el":"O","n":1}]');
t('combustion methane -> CH4', JSON.stringify(combustionFormula({ massCO2: 44.009, massH2O: 36.03 })) === '[{"el":"C","n":1},{"el":"H","n":4}]');
t('combustion ethanol (O by diff) -> C2H6O', JSON.stringify(combustionFormula({ massCO2: 8.802, massH2O: 5.404, sampleMass: 4.607 })) === '[{"el":"C","n":2},{"el":"H","n":6},{"el":"O","n":1}]');

// solutions & solubility (Unit 8, C.11)
t('molarity 0.5 mol in 2 L = 0.25 M', approx(molarity(0.5, 2), 0.25));
t('molarity guards zero volume', molarity(0.5, 0) === 0);
t('dilute solve v1 (6 M -> 1.5 M in 500)', approx(dilute({ c1: 6, c2: 1.5, v2: 500 }, 'v1'), 125));
t('dilute solve c2 (125 of 6 M -> 500)', approx(dilute({ c1: 6, v1: 125, v2: 500 }, 'c2'), 1.5));
t('dilute solve v2', approx(dilute({ c1: 6, v1: 125, c2: 1.5 }, 'v2'), 500));
t('dilute solve c1', approx(dilute({ v1: 125, c2: 1.5, v2: 500 }, 'c1'), 6));
t('ionicFormula NaCl', ionicFormula('Na', 'Cl') === 'NaCl');
t('ionicFormula CaCl2', ionicFormula('Ca', 'Cl') === 'CaCl2');
t('ionicFormula Al2(SO4)3', ionicFormula('Al', 'SO4') === 'Al2(SO4)3');
t('ionicFormula (NH4)2SO4', ionicFormula('NH4', 'SO4') === '(NH4)2SO4');
t('ionicFormula Na3PO4', ionicFormula('Na', 'PO4') === 'Na3PO4');
t('ionicFormula reduces MgSO4', ionicFormula('Mg', 'SO4') === 'MgSO4');
t('ionicFormula Al(OH)3', ionicFormula('Al', 'OH') === 'Al(OH)3');
t('ionicFormula output parses', JSON.stringify(parseFormula(ionicFormula('Al', 'SO4'))) === '{"Al":2,"S":3,"O":12}');
t('predict Na2CO3 soluble (group 1)', predictSolubility('Na', 'CO3').soluble === true);
t('predict KNO3 soluble (nitrate)', predictSolubility('K', 'NO3').soluble === true);
t('predict AgNO3 soluble (nitrate beats Ag)', predictSolubility('Ag', 'NO3').soluble === true);
t('predict AgCl insoluble (halide except Ag)', predictSolubility('Ag', 'Cl').soluble === false);
t('predict PbI2 insoluble', predictSolubility('Pb', 'I').soluble === false);
t('predict CaCl2 soluble (halide, Ca ok)', predictSolubility('Ca', 'Cl').soluble === true);
t('predict BaSO4 insoluble', predictSolubility('Ba', 'SO4').soluble === false);
t('predict Na2SO4 soluble', predictSolubility('Na', 'SO4').soluble === true);
t('predict Mg(OH)2 insoluble', predictSolubility('Mg', 'OH').soluble === false);
t('predict Ba(OH)2 soluble (hydroxide except Ba)', predictSolubility('Ba', 'OH').soluble === true);
t('predict FePO4 insoluble', predictSolubility('Fe3', 'PO4').soluble === false);
t('rules data has 6 entries', SOLUBILITY_RULES.length === 6);
t('copper flagged honors', IONS.cations.Cu.honors === true);
const drPrecip = doubleReplacement({ cation: 'Ag', anion: 'NO3' }, { cation: 'Na', anion: 'Cl' });
t('double replacement AgNO3+NaCl precipitates AgCl', drPrecip.formsPrecipitate && drPrecip.precipitates.includes('AgCl'));
const drBa = doubleReplacement({ cation: 'Ba', anion: 'Cl' }, { cation: 'Na', anion: 'SO4' });
t('double replacement BaCl2+Na2SO4 precipitates BaSO4', drBa.precipitates.includes('BaSO4'));
const drNone = doubleReplacement({ cation: 'Na', anion: 'Cl' }, { cation: 'K', anion: 'NO3' });
t('double replacement NaCl+KNO3 no precipitate', drNone.formsPrecipitate === false);

// acids & bases (Unit 9, C.12)
t('pH of 1e-7 is 7 (neutral)', approx(pH(1e-7), 7));
t('pH of 1e-3 is 3', approx(pH(1e-3), 3));
t('pH of 2.0e-3 ~ 2.70', approx(pH(2e-3), 2.699, 0.01));
t('pOH of 1e-2 is 2', approx(pOH(1e-2), 2));
t('pHfromPOH(2) is 12', approx(pHfromPOH(2), 12));
t('strong base [OH-]=1e-2 -> pH 12', approx(pHfromPOH(pOH(1e-2)), 12));
t('equivalence 0.1M/25mL by 0.1M base = 25 mL', approx(equivalenceVolume({ Ca: 0.1, Va: 25, Cb: 0.1 }), 25));
t('equivalence with 0.2M acid = 50 mL', approx(equivalenceVolume({ Ca: 0.2, Va: 25, Cb: 0.1 }), 50));
t('equivalence diprotic acid doubles titrant', approx(equivalenceVolume({ Ca: 0.1, Va: 25, na: 2, Cb: 0.1 }), 50));
t('titration start pH = -log10(Ca)', approx(titrationPH({ Ca: 0.1, Va: 25, Cb: 0.1, Vb: 0 }), 1));
t('titration at equivalence is 7', approx(titrationPH({ Ca: 0.1, Va: 25, Cb: 0.1, Vb: 25 }), 7));
t('titration past equivalence is basic', titrationPH({ Ca: 0.1, Va: 25, Cb: 0.1, Vb: 35 }) > 11);
t('phWeakAcid acetic 0.1 M ~ 2.87', approx(phWeakAcid(1.8e-5, 0.1), 2.87, 0.02));
t('phWeakAcid more dilute is higher pH', phWeakAcid(1.8e-5, 0.01) > phWeakAcid(1.8e-5, 0.1));

// thermochemistry (Unit 10, C.13)
t('specific heat of water 4.184', SPECIFIC_HEAT.water === 4.184);
t('specific heat of copper 0.385', SPECIFIC_HEAT.copper === 0.385);
t('specific heat of lead 0.128 (lowest listed)', Math.min(...Object.values(SPECIFIC_HEAT)) === SPECIFIC_HEAT.lead);
t('specific heat table covers the 14 unit materials', Object.keys(SPECIFIC_HEAT).length >= 14);
t('specific heat keys are lowercase', Object.keys(SPECIFIC_HEAT).every(k => k === k.toLowerCase()));
t('heatTransfer solves q = m*c*dT', approx(heatTransfer({ m: 100, c: 4.184, dT: 25 }).q, 10460, 0.5));
t('heatTransfer solves m', approx(heatTransfer({ q: 10460, c: 4.184, dT: 25 }).m, 100, 0.01));
t('heatTransfer solves c', approx(heatTransfer({ q: 10460, m: 100, dT: 25 }).c, 4.184, 0.001));
t('heatTransfer solves dT', approx(heatTransfer({ q: 10460, m: 100, c: 4.184 }).dT, 25, 0.01));
t('heatTransfer returns all four values', (() => {
  const r = heatTransfer({ m: 50, c: 0.385, dT: 40 });
  return [r.q, r.m, r.c, r.dT].every(v => typeof v === 'number' && isFinite(v));
})());
t('heatTransfer negative dT gives negative q (cooling)', heatTransfer({ m: 100, c: 4.184, dT: -25 }).q < 0);
t('heatTransfer treats null as the unknown', approx(heatTransfer({ q: null, m: 100, c: 4.184, dT: 25 }).q, 10460, 0.5));
t('heatTransfer throws with 0 unknowns', throws(() => heatTransfer({ q: 10460, m: 100, c: 4.184, dT: 25 })));
t('heatTransfer throws with 2 unknowns', throws(() => heatTransfer({ m: 100, c: 4.184 })));
t('heatTransfer throws on a non-numeric known', throws(() => heatTransfer({ m: '100', c: 4.184, dT: 25 })));
t('heatTransfer throws on NaN', throws(() => heatTransfer({ m: NaN, c: 4.184, dT: 25 })));
t('heatTransfer throws solving m when c*dT is 0', throws(() => heatTransfer({ q: 10460, c: 4.184, dT: 0 })));
t('heatTransfer throws solving c when m*dT is 0', throws(() => heatTransfer({ q: 10460, m: 0, dT: 25 })));
t('heatTransfer throws solving dT when m*c is 0', throws(() => heatTransfer({ q: 10460, m: 100, c: 0 })));
const mixWater = finalTemperature({ m: 100, c: SPECIFIC_HEAT.water, t: 20 }, { m: 50, c: SPECIFIC_HEAT.water, t: 80 });
t('100g water at 20 + 50g water at 80 -> 40 degC', approx(mixWater.tFinal, 40, 1e-9));
t('that mix moves 8368 J', approx(mixWater.qTransferred, 8368, 0.5));
t('the hotter body (b) is the one that cooled', mixWater.from === 'b');
const mixCu = finalTemperature({ m: 50, c: SPECIFIC_HEAT.copper, t: 100 }, { m: 200, c: SPECIFIC_HEAT.water, t: 20 });
t('50g hot copper barely warms 200g water (~21.8 degC)', approx(mixCu.tFinal, 21.8, 0.05));
t('hot copper is body a, so it cooled', mixCu.from === 'a');
t('mix final T sits between the two starts', mixCu.tFinal > 20 && mixCu.tFinal < 100);
t('equal starting temps transfer nothing', (() => {
  const r = finalTemperature({ m: 100, c: 4.184, t: 25 }, { m: 30, c: 0.897, t: 25 });
  return r.from === 'none' && approx(r.qTransferred, 0, 1e-9) && approx(r.tFinal, 25, 1e-9);
})());
t('finalTemperature throws on m <= 0', throws(() => finalTemperature({ m: 0, c: 4.184, t: 20 }, { m: 50, c: 4.184, t: 80 })));
t('finalTemperature throws on c <= 0', throws(() => finalTemperature({ m: 100, c: 4.184, t: 20 }, { m: 50, c: -1, t: 80 })));
t('finalTemperature throws on a non-finite t', throws(() => finalTemperature({ m: 100, c: 4.184, t: NaN }, { m: 50, c: 4.184, t: 80 })));
t('classifyThermal -890 is exothermic', classifyThermal(-890.5) === 'exothermic');
t('classifyThermal +6.01 is endothermic', classifyThermal(6.01) === 'endothermic');
t('classifyThermal 0 is thermoneutral', classifyThermal(0) === 'thermoneutral');
t('classifyThermal throws on non-finite dH', throws(() => classifyThermal(Infinity)));
t('hessCombine sums plain steps', approx(hessCombine([{ dH: -100 }, { dH: -50 }]), -150));
t('hessCombine flip negates', approx(hessCombine([{ dH: -100, flip: true }]), 100));
t('hessCombine scale multiplies', approx(hessCombine([{ dH: -100, scale: 2 }]), -200));
t('hessCombine flip and scale together', approx(hessCombine([{ dH: -100, flip: true, scale: 0.5 }]), 50));
t('hessCombine CO formation ~ -110.5 kJ', approx(hessCombine([{ dH: -393.5 }, { dH: -283.0, flip: true }]), -110.5, 0.01));
t('hessCombine throws on an empty array', throws(() => hessCombine([])));
t('hessCombine throws on a non-array', throws(() => hessCombine(null)));
t('hessCombine throws on a non-finite dH', throws(() => hessCombine([{ dH: undefined }])));
t('hessCombine throws on a non-finite scale', throws(() => hessCombine([{ dH: -100, scale: NaN }])));
t('enthalpyFromFormation methane combustion ~ -890.5 kJ', approx(
  enthalpyFromFormation(
    [{ dHf: -393.5 }, { dHf: -285.8, coefficient: 2 }],
    [{ dHf: -74.6 }, { dHf: 0, coefficient: 2 }]
  ), -890.5, 0.01));
t('enthalpyFromFormation defaults coefficient to 1', approx(enthalpyFromFormation([{ dHf: -100 }], [{ dHf: -40 }]), -60));
t('enthalpyFromFormation elements in standard state contribute 0', approx(
  enthalpyFromFormation([{ dHf: -411.2 }], [{ dHf: 0 }, { dHf: 0, coefficient: 0.5 }]), -411.2));
t('enthalpyFromFormation empty sides give 0', enthalpyFromFormation([], []) === 0);
t('enthalpyFromFormation throws on a non-finite dHf', throws(() => enthalpyFromFormation([{ dHf: 'x' }], [])));
t('enthalpyFromFormation throws on a non-finite coefficient', throws(() => enthalpyFromFormation([{ dHf: -100, coefficient: NaN }], [])));
t('enthalpyFromFormation throws on a non-array side', throws(() => enthalpyFromFormation([{ dHf: -100 }], undefined)));

// nuclear chemistry (Unit 11, C.14)
t('alpha particle is A4 Z2', DECAY_PARTICLES.alpha.A === 4 && DECAY_PARTICLES.alpha.Z === 2);
t('beta particle is A0 Z-1', DECAY_PARTICLES.beta.A === 0 && DECAY_PARTICLES.beta.Z === -1);
t('gamma ray is A0 Z0', DECAY_PARTICLES.gamma.A === 0 && DECAY_PARTICLES.gamma.Z === 0);
t('positron is A0 Z+1', DECAY_PARTICLES.positron.A === 0 && DECAY_PARTICLES.positron.Z === 1);
t('every decay particle carries a symbol and name', Object.values(DECAY_PARTICLES).every(p => p.symbol && p.name));
const c14 = decayProduct(14, 6, 'beta');
t('C-14 beta decay -> N-14 (A14 Z7)', c14.A === 14 && c14.Z === 7);
t('beta decay raises Z by exactly 1', decayProduct(90, 38, 'beta').Z === 39);
const u238 = decayProduct(238, 92, 'alpha');
t('U-238 alpha decay -> Th-234 (A234 Z90)', u238.A === 234 && u238.Z === 90);
t('gamma emission changes neither A nor Z', (() => {
  const r = decayProduct(99, 43, 'gamma');
  return r.A === 99 && r.Z === 43;
})());
t('F-18 positron emission -> O-18 (A18 Z8)', (() => {
  const r = decayProduct(18, 9, 'positron');
  return r.A === 18 && r.Z === 8;
})());
t('decayProduct echoes the mode and particle', c14.mode === 'beta' && c14.particle === DECAY_PARTICLES.beta);
t('decayProduct throws on an unknown mode', throws(() => decayProduct(14, 6, 'neutron')));
t('decayProduct throws on a non-integer A', throws(() => decayProduct(14.5, 6, 'beta')));
t('decayProduct throws on a negative Z', throws(() => decayProduct(14, -6, 'beta')));
t('decayProduct throws when the daughter A would go negative', throws(() => decayProduct(2, 1, 'alpha')));
t('decayProduct throws when the daughter Z would go negative', throws(() => decayProduct(4, 1, 'alpha')));
t('U-238 -> Th-234 + alpha is balanced', isBalancedNuclear(
  [{ A: 238, Z: 92 }], [{ A: 234, Z: 90 }, { A: 4, Z: 2 }]));
t('dropping the alpha leaves it unbalanced', isBalancedNuclear(
  [{ A: 238, Z: 92 }], [{ A: 234, Z: 90 }]) === false);
t('U-235 fission balances with 3 neutrons via count', isBalancedNuclear(
  [{ A: 235, Z: 92 }, { A: 1, Z: 0 }],
  [{ A: 141, Z: 56 }, { A: 92, Z: 36 }, { A: 1, Z: 0, count: 3 }]));
t('the same fission with 1 neutron is unbalanced', isBalancedNuclear(
  [{ A: 235, Z: 92 }, { A: 1, Z: 0 }],
  [{ A: 141, Z: 56 }, { A: 92, Z: 36 }, { A: 1, Z: 0 }]) === false);
t('D + D fusion -> He-3 + n balances', isBalancedNuclear(
  [{ A: 2, Z: 1, count: 2 }], [{ A: 3, Z: 2 }, { A: 1, Z: 0 }]));
t('isBalancedNuclear throws on a non-integer A', throws(() => isBalancedNuclear([{ A: 238.5, Z: 92 }], [])));
t('isBalancedNuclear throws on a non-integer Z', throws(() => isBalancedNuclear([{ A: 238, Z: 92.5 }], [])));
t('isBalancedNuclear throws on count < 1', throws(() => isBalancedNuclear([{ A: 1, Z: 0, count: 0 }], [])));
t('isBalancedNuclear throws on a non-array side', throws(() => isBalancedNuclear([{ A: 4, Z: 2 }], 'x')));
t('carbon-14 half-life is 5730 y', CARBON14_HALFLIFE === 5730);
t('MeV per u is 931.494', MEV_PER_U === 931.494);
t('one half-life leaves half', approx(halfLifeRemaining(100, 5730, 5730), 50, 1e-9));
t('two half-lives leave a quarter', approx(halfLifeRemaining(100, 11460, 5730), 25, 1e-9));
t('no elapsed time leaves everything', approx(halfLifeRemaining(100, 0, 5730), 100, 1e-9));
t('80 g I-131 after 8.02 d is 40 g', approx(halfLifeRemaining(80, 8.02, 8.02), 40, 1e-9));
t('half a half-life leaves ~70.7 percent', approx(halfLifeRemaining(100, 2865, 5730), 70.71, 0.01));
t('halfLifeRemaining throws on a negative initial', throws(() => halfLifeRemaining(-1, 100, 5730)));
t('halfLifeRemaining throws on a negative elapsed', throws(() => halfLifeRemaining(100, -1, 5730)));
t('halfLifeRemaining throws on halfLife 0', throws(() => halfLifeRemaining(100, 100, 0)));
t('halfLifeRemaining throws on a non-finite input', throws(() => halfLifeRemaining(100, 100, NaN)));
t('50 percent remaining is 1 half-life', approx(halfLivesElapsed(0.5), 1, 1e-9));
t('25 percent remaining is 2 half-lives', approx(halfLivesElapsed(0.25), 2, 1e-9));
t('100 percent remaining is 0 half-lives', approx(halfLivesElapsed(1), 0, 1e-9));
t('halfLivesElapsed inverts halfLifeRemaining', approx(halfLivesElapsed(halfLifeRemaining(1, 3 * 5730, 5730)), 3, 1e-9));
t('halfLivesElapsed throws on fraction 0', throws(() => halfLivesElapsed(0)));
t('halfLivesElapsed throws on a negative fraction', throws(() => halfLivesElapsed(-0.5)));
t('halfLivesElapsed throws on a fraction above 1', throws(() => halfLivesElapsed(1.2)));
t('halfLivesElapsed throws on a non-finite fraction', throws(() => halfLivesElapsed(NaN)));
t('50 percent C-14 dates to one half-life', approx(radiometricAge(0.5, CARBON14_HALFLIFE), 5730, 1e-6));
t('25 percent C-14 dates to two half-lives', approx(radiometricAge(0.25, CARBON14_HALFLIFE), 11460, 1e-6));
t('fresh sample dates to age 0', approx(radiometricAge(1, CARBON14_HALFLIFE), 0, 1e-9));
t('78.3 percent C-14 dates to ~2020 y', approx(radiometricAge(0.783, CARBON14_HALFLIFE), 2021, 5));
t('radiometricAge scales with the half-life used', approx(radiometricAge(0.5, 1600), 1600, 1e-6));
t('radiometricAge throws on fraction 0', throws(() => radiometricAge(0, CARBON14_HALFLIFE)));
t('radiometricAge throws on a fraction above 1', throws(() => radiometricAge(1.5, CARBON14_HALFLIFE)));
t('radiometricAge throws on halfLife <= 0', throws(() => radiometricAge(0.5, 0)));
t('radiometricAge throws on a non-finite fraction', throws(() => radiometricAge(NaN, CARBON14_HALFLIFE)));
t('He-4 mass defect ~0.03038 u', approx(massDefect(4.03298, 4.002602), 0.030378, 1e-6));
t('massDefect is 0 when nothing is missing', massDefect(4, 4) === 0);
t('massDefect throws on a non-finite input', throws(() => massDefect(4.03298, undefined)));
t('He-4 binding energy ~28.3 MeV', approx(bindingEnergyMeV(massDefect(4.03298, 4.002602)), 28.30, 0.02));
t('bindingEnergyMeV of 1 u is 931.494 MeV', approx(bindingEnergyMeV(1), 931.494, 1e-9));
t('bindingEnergyMeV of 0 is 0', bindingEnergyMeV(0) === 0);
t('bindingEnergyMeV throws on a non-finite input', throws(() => bindingEnergyMeV('0.03')));
t('NUCLIDES has the 16 unit nuclides', NUCLIDES.length === 16);
const nuc = sym => NUCLIDES.find(n => n.sym === sym);
t('Tc-99m is Z43 and a gamma emitter', nuc('Tc-99m').Z === 43 && nuc('Tc-99m').mode === 'gamma');
t('I-131 half-life is 8.02 d', nuc('I-131').halfLife === 8.02 && nuc('I-131').halfLifeUnit === 'd');
t('C-14 half-life matches CARBON14_HALFLIFE', nuc('C-14').halfLife === CARBON14_HALFLIFE);
t('U-238 is an alpha emitter at 4.47e9 y', nuc('U-238').mode === 'alpha' && nuc('U-238').halfLife === 4.47e9);
t('F-18 is the positron emitter', nuc('F-18').mode === 'positron' && nuc('F-18').halfLifeUnit === 'min');
t('Am-241 lists the smoke-detector use', /smoke/.test(nuc('Am-241').use));
t('every nuclide is fully described', NUCLIDES.every(n =>
  n.sym && n.name && Number.isInteger(n.A) && Number.isInteger(n.Z) &&
  n.halfLife > 0 && n.halfLifeUnit && n.use));
t('every nuclide mode is a known decay particle', NUCLIDES.every(n => n.mode in DECAY_PARTICLES));
t('every nuclide has more nucleons than protons', NUCLIDES.every(n => n.A > n.Z));
t('every nuclide decays to a legal daughter', NUCLIDES.every(n => decayProduct(n.A, n.Z, n.mode).A >= 0));
t('nuclide symbols are unique', new Set(NUCLIDES.map(n => n.sym)).size === NUCLIDES.length);

// Z -> symbol across both reference tables (ELEMENTS leaves gaps that decay walks into)
t('symbolForZ reads the main table', symbolForZ(6) === 'C' && symbolForZ(82) === 'Pb');
t('symbolForZ fills the transition gap', symbolForZ(43) === 'Tc' && symbolForZ(42) === 'Mo');
t('symbolForZ reaches the actinides', symbolForZ(90) === 'Th' && symbolForZ(92) === 'U' && symbolForZ(95) === 'Am');
t('symbolForZ returns null off the end of both tables', symbolForZ(120) === null);
t('nameForZ matches symbolForZ coverage', nameForZ(90) === 'Thorium' && nameForZ(6) === 'Carbon' && nameForZ(120) === null);
t('the two element tables do not overlap', (() => {
  const main = new Set(ELEMENTS.map(e => e.z));
  return NUCLEAR_ELEMENTS.every(e => !main.has(e.z));
})());
t('every nuclear element entry is complete', NUCLEAR_ELEMENTS.every(e =>
  Number.isInteger(e.z) && e.z > 0 && /^[A-Z][a-z]?$/.test(e.sym) && e.name));
t('every nuclide symbol resolves from its Z', NUCLIDES.every(n => symbolForZ(n.Z) !== null));
t('every nuclide daughter symbol resolves too', NUCLIDES.every(n => symbolForZ(decayProduct(n.A, n.Z, n.mode).Z) !== null));
t('Mo-99 beta decay lands on technetium', symbolForZ(decayProduct(99, 42, 'beta').Z) === 'Tc');
t('U-235 fission fragments resolve', symbolForZ(56) === 'Ba' && symbolForZ(36) === 'Kr');

// mass defect and binding energy from the nucleon sum
t('hydrogen atom mass is 1.007825 u', HYDROGEN_ATOM_MASS_U === 1.007825);
t('neutron mass is 1.008665 u', NEUTRON_MASS_U === 1.008665);
t('nucleonMassSum of He-4', approx(nucleonMassSum(4, 2), 4.03298, 1e-5));
t('nucleonMassSum of Fe-56', approx(nucleonMassSum(56, 26), 56.4634, 1e-3));
t('nucleonMassSum of H-1 is just the hydrogen atom', nucleonMassSum(1, 1) === HYDROGEN_ATOM_MASS_U);
t('nucleonMassSum throws when Z exceeds A', throws(() => nucleonMassSum(4, 5)));
t('nucleonMassSum throws on a non-integer A', throws(() => nucleonMassSum(4.5, 2)));
t('He-4 binding energy is about 28.3 MeV', approx(bindingEnergyMeV(massDefect(nucleonMassSum(4, 2), 4.002602)), 28.30, 0.05));
t('Fe-56 binding energy per nucleon is about 8.79 MeV', (() => {
  const be = bindingEnergyMeV(massDefect(nucleonMassSum(56, 26), 55.934936));
  return approx(be / 56, 8.79, 0.01);
})());
t('U-235 binding energy per nucleon is about 7.59 MeV', (() => {
  const be = bindingEnergyMeV(massDefect(nucleonMassSum(235, 92), 235.043930));
  return approx(be / 235, 7.59, 0.01);
})());
t('deuterium binding energy is about 2.22 MeV', approx(bindingEnergyMeV(massDefect(nucleonMassSum(2, 1), 2.014102)), 2.22, 0.01));
t('iron binds tighter per nucleon than uranium does', (() => {
  const fe = bindingEnergyMeV(massDefect(nucleonMassSum(56, 26), 55.934936)) / 56;
  const u = bindingEnergyMeV(massDefect(nucleonMassSum(235, 92), 235.043930)) / 235;
  return fe > u;
})());

// effective half-life: decay and excretion clear the body at the same time
t('effective half-life of Tc-99m in the body', approx(effectiveHalfLife(6, 24), 4.8, 1e-9));
t('equal physical and biological half-lives halve the result', approx(effectiveHalfLife(8, 8), 4, 1e-9));
t('effective half-life is always shorter than either input', (() => {
  const e = effectiveHalfLife(8.02, 7.5);
  return e < 8.02 && e < 7.5;
})());
t('a very long biological half-life leaves the physical one', approx(effectiveHalfLife(6, 1e9), 6, 1e-4));
t('effectiveHalfLife throws on a zero half-life', throws(() => effectiveHalfLife(0, 24)));
t('effectiveHalfLife throws on a negative half-life', throws(() => effectiveHalfLife(6, -24)));
t('effectiveHalfLife throws on a non-finite input', throws(() => effectiveHalfLife(6, NaN)));

// formatting
t('fmt 143.2', fmt(143.234, 4) === '143.2');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
