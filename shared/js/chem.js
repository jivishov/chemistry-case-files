// chem.js: shared chemistry engine (pure, framework-free, unit-testable)
// Used across all simulators. No DOM, no dependencies.

// IUPAC 2021 standard atomic weights (g/mol), rounded to values used in HS chemistry.
export const ATOMIC_MASS = {
  H: 1.008,  He: 4.003, Li: 6.94,  Be: 9.012, B: 10.81, C: 12.011, N: 14.007,
  O: 15.999, F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982,
  Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098,
  Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938,
  Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Br: 79.904,
  Ag: 107.868, I: 126.904, Ba: 137.327, Au: 196.967, Hg: 200.592, Pb: 207.2
};

export const MOLAR_VOLUME_STP = 22.4; // L/mol of ideal gas at STP (0 degC, 1 atm)
export const AVOGADRO = 6.022e23;

// Atomic number + name for every element that has a tabulated mass above.
// Reference data shared by the atomic-structure and periodic-trend units.
export const ELEMENTS = [
  { z: 1, sym: 'H', name: 'Hydrogen' },   { z: 2, sym: 'He', name: 'Helium' },
  { z: 3, sym: 'Li', name: 'Lithium' },   { z: 4, sym: 'Be', name: 'Beryllium' },
  { z: 5, sym: 'B', name: 'Boron' },      { z: 6, sym: 'C', name: 'Carbon' },
  { z: 7, sym: 'N', name: 'Nitrogen' },   { z: 8, sym: 'O', name: 'Oxygen' },
  { z: 9, sym: 'F', name: 'Fluorine' },   { z: 10, sym: 'Ne', name: 'Neon' },
  { z: 11, sym: 'Na', name: 'Sodium' },   { z: 12, sym: 'Mg', name: 'Magnesium' },
  { z: 13, sym: 'Al', name: 'Aluminum' }, { z: 14, sym: 'Si', name: 'Silicon' },
  { z: 15, sym: 'P', name: 'Phosphorus' },{ z: 16, sym: 'S', name: 'Sulfur' },
  { z: 17, sym: 'Cl', name: 'Chlorine' }, { z: 18, sym: 'Ar', name: 'Argon' },
  { z: 19, sym: 'K', name: 'Potassium' }, { z: 20, sym: 'Ca', name: 'Calcium' },
  { z: 21, sym: 'Sc', name: 'Scandium' }, { z: 22, sym: 'Ti', name: 'Titanium' },
  { z: 23, sym: 'V', name: 'Vanadium' },  { z: 24, sym: 'Cr', name: 'Chromium' },
  { z: 25, sym: 'Mn', name: 'Manganese' },{ z: 26, sym: 'Fe', name: 'Iron' },
  { z: 27, sym: 'Co', name: 'Cobalt' },   { z: 28, sym: 'Ni', name: 'Nickel' },
  { z: 29, sym: 'Cu', name: 'Copper' },   { z: 30, sym: 'Zn', name: 'Zinc' },
  { z: 35, sym: 'Br', name: 'Bromine' },  { z: 47, sym: 'Ag', name: 'Silver' },
  { z: 53, sym: 'I', name: 'Iodine' },    { z: 56, sym: 'Ba', name: 'Barium' },
  { z: 79, sym: 'Au', name: 'Gold' },     { z: 80, sym: 'Hg', name: 'Mercury' },
  { z: 82, sym: 'Pb', name: 'Lead' }
];

// Parse a chemical formula into an element -> count map.
// Handles nested parentheses and group multipliers, e.g. "Ca(OH)2" -> {Ca:1, O:2, H:2}.
export function parseFormula(formula) {
  let i = 0;
  const readNumber = () => {
    let s = '';
    while (i < formula.length && /[0-9]/.test(formula[i])) { s += formula[i]; i++; }
    return s === '' ? 1 : parseInt(s, 10);
  };
  const parseGroup = () => {
    const counts = {};
    while (i < formula.length) {
      const ch = formula[i];
      if (ch === '(' || ch === '[') {
        i++;
        const inner = parseGroup();
        const mult = readNumber();
        for (const k in inner) counts[k] = (counts[k] || 0) + inner[k] * mult;
      } else if (ch === ')' || ch === ']') {
        i++;
        return counts;
      } else if (/[A-Z]/.test(ch)) {
        let sym = ch; i++;
        while (i < formula.length && /[a-z]/.test(formula[i])) { sym += formula[i]; i++; }
        const n = readNumber();
        counts[sym] = (counts[sym] || 0) + n;
      } else {
        i++; // skip charges, dots, spaces
      }
    }
    return counts;
  };
  return parseGroup();
}

// Molar mass (g/mol) of a formula.
export function molarMass(formula) {
  const comp = parseFormula(formula);
  let m = 0;
  for (const el in comp) {
    if (!(el in ATOMIC_MASS)) throw new Error(`Unknown element: ${el}`);
    m += ATOMIC_MASS[el] * comp[el];
  }
  return m;
}

// Percent composition by mass: returns [{el, percent}] descending.
export function percentComposition(formula) {
  const comp = parseFormula(formula);
  const total = molarMass(formula);
  return Object.keys(comp)
    .map(el => ({ el, percent: (ATOMIC_MASS[el] * comp[el] / total) * 100 }))
    .sort((a, b) => b.percent - a.percent);
}

// Total atoms on one side of an equation. species: [{f, c}]
export function atomTally(species) {
  const t = {};
  for (const s of species) {
    const comp = parseFormula(s.f);
    for (const k in comp) t[k] = (t[k] || 0) + comp[k] * s.c;
  }
  return t;
}

// Are reactant and product sides mass-balanced for the given coefficients?
export function isBalanced(reactants, products) {
  const L = atomTally(reactants), R = atomTally(products);
  const keys = new Set([...Object.keys(L), ...Object.keys(R)]);
  for (const k of keys) if ((L[k] || 0) !== (R[k] || 0)) return false;
  return true;
}

export function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
export function gcdArray(arr) { return arr.reduce((g, n) => gcd(g, Math.abs(n)), 0); }

// Balanced AND in lowest whole-number terms (no common factor > 1).
export function isLowestTerms(reactants, products) {
  const coefs = [...reactants, ...products].map(s => s.c);
  if (coefs.some(c => c <= 0 || !Number.isInteger(c))) return false;
  return gcdArray(coefs) === 1;
}

export const gramsToMoles = (g, f) => g / molarMass(f);
export const molesToGrams = (mol, f) => mol * molarMass(f);
export const molesToParticles = (mol) => mol * AVOGADRO;

// Empirical formula from element amounts (Unit 5, C.8D). Each entry is
// { el, moles } OR { el, grams } (grams are converted to moles via ATOMIC_MASS).
// Returns [{ el, n }] in input order with the smallest whole-number subscripts:
// divide every amount by the smallest, then scale the ratios up to whole numbers
// (handles .5 -> x2, .33 -> x3, .25 -> x4), then reduce by any common factor.
export function empiricalFormula(amounts) {
  const moles = amounts.map(a => ({
    el: a.el,
    n: a.moles != null ? a.moles : a.grams / ATOMIC_MASS[a.el]
  }));
  const min = Math.min(...moles.map(m => m.n));
  if (!(min > 0)) throw new Error('empiricalFormula needs positive amounts');
  const ratios = moles.map(m => m.n / min);
  // smallest multiplier k that turns every ratio into (near) a whole number
  let k = 1;
  for (; k <= 8; k++) {
    if (ratios.every(r => Math.abs(r * k - Math.round(r * k)) <= 0.1)) break;
  }
  let subs = ratios.map(r => Math.round(r * k));
  const g = gcdArray(subs);
  if (g > 1) subs = subs.map(s => s / g);
  return moles.map((m, i) => ({ el: m.el, n: subs[i] }));
}

// Combustion analysis (Unit 5, Honors). A C/H/(O) compound is burned completely:
// all carbon ends up in CO2, all hydrogen in H2O. If sampleMass is given and
// exceeds the carbon + hydrogen mass, the remainder is oxygen (found by mass
// difference). Returns the empirical formula as [{ el, n }] (C, then H, then O).
export function combustionFormula({ massCO2, massH2O, sampleMass = null }) {
  const molC = massCO2 / molarMass('CO2');
  const molH = 2 * (massH2O / molarMass('H2O'));
  const amounts = [{ el: 'C', moles: molC }, { el: 'H', moles: molH }];
  if (sampleMass != null) {
    const massO = sampleMass - molC * ATOMIC_MASS.C - molH * ATOMIC_MASS.H;
    if (massO > 1e-3) amounts.push({ el: 'O', moles: massO / ATOMIC_MASS.O });
  }
  return empiricalFormula(amounts);
}

// Limiting-reactant analysis.
// reaction: { reactants:[{f,c}], products:[{f,c}] }
// amounts:  { [formula]: grams }
export function limitingReactant(reaction, amounts) {
  let limiting = null, extent = Infinity;
  for (const r of reaction.reactants) {
    const mol = (amounts[r.f] ?? 0) / molarMass(r.f);
    const e = mol / r.c;                 // moles of reaction this reactant allows
    if (e < extent) { extent = e; limiting = r; }
  }
  const products = reaction.products.map(p => ({
    f: p.f, mol: extent * p.c, grams: extent * p.c * molarMass(p.f)
  }));
  const leftover = reaction.reactants.map(r => {
    const mol0 = (amounts[r.f] ?? 0) / molarMass(r.f);
    const used = extent * r.c;
    const molLeft = Math.max(0, mol0 - used);
    return {
      f: r.f, mol0, used, molLeft,
      gramsLeft: molLeft * molarMass(r.f),
      isLimiting: r === limiting
    };
  });
  return { limiting: limiting.f, extent, products, leftover };
}

// Single mole-ratio conversion: from a known amount of one species, find another.
// given/find: {f, c}; amountMol: moles of the given species.
export function moleRatio(givenSpecies, findSpecies, givenMol) {
  return givenMol * (findSpecies.c / givenSpecies.c);
}

export const percentYield = (actual, theoretical) =>
  theoretical > 0 ? (actual / theoretical) * 100 : 0;

// Pauling electronegativities (subset used across bonding + periodic-trend units).
// The second block adds the first-row transition metals and heavy main-group
// elements that the periodic-trend unit charts (additive new keys only, so the
// bonding unit is unaffected). Noble gases are intentionally left out: they do
// not form ordinary bonds, so a Pauling value is not defined for them.
export const ELECTRONEGATIVITY = {
  H: 2.20, Li: 0.98, Be: 1.57, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98,
  Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.90, P: 2.19, S: 2.58, Cl: 3.16,
  K: 0.82, Ca: 1.00, Fe: 1.83, Cu: 1.90, Zn: 1.65, Br: 2.96, Ag: 1.93, I: 2.66,
  Sc: 1.36, Ti: 1.54, V: 1.63, Cr: 1.66, Mn: 1.55, Co: 1.88, Ni: 1.91,
  Ba: 0.89, Au: 2.54, Hg: 2.00, Pb: 2.33
};

// Every metal that carries an ELECTRONEGATIVITY entry above. The set drives bondType(),
// so anything missing here falls through to the two-nonmetals branch and gets classified
// covalent: leaving Ba, Au, Hg, Pb and the transition block out made bondType('Ba','Cl')
// return 'polar covalent'. The metalloids B and Si stay out on purpose, because at HS
// level bondType('B','F') has to stay 'polar covalent'.
export const METALS = new Set([
  'Li', 'Be', 'Na', 'Mg', 'Al', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn',
  'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ag', 'Ba', 'Au', 'Hg', 'Pb'
]);

// Approximate HS bond-type rule. Returns 'metallic' | 'ionic' | 'polar covalent' | 'nonpolar covalent'.
// Metal + metal -> metallic; metal + nonmetal -> ionic (electron transfer);
// two nonmetals -> covalent, polarity from the electronegativity gap.
export function bondType(elA, elB) {
  const mA = METALS.has(elA), mB = METALS.has(elB);
  if (mA && mB) return 'metallic';
  if (mA !== mB) return 'ionic';
  const dEN = Math.abs(ELECTRONEGATIVITY[elA] - ELECTRONEGATIVITY[elB]);
  return dEN >= 0.4 ? 'polar covalent' : 'nonpolar covalent';
}

// Pauling % ionic character from the electronegativity difference.
export function percentIonicCharacter(dEN) {
  return (1 - Math.exp(-0.25 * dEN * dEN)) * 100;
}

// ---- Gas laws & kinetic theory (Unit 7, C.10) ----
export const GAS_CONSTANT_R = 0.08206; // L·atm·mol^-1·K^-1

// Solve PV = nRT for one variable given the other three.
// state: { P, V, n, T } in atm, L, mol, K. solveFor in {'P','V','n','T'}.
export function idealGasSolve(state, solveFor) {
  const R = GAS_CONSTANT_R, { P, V, n, T } = state;
  switch (solveFor) {
    case 'P': return (n * R * T) / V;
    case 'V': return (n * R * T) / P;
    case 'n': return (P * V) / (R * T);
    case 'T': return (P * V) / (n * R);
    default: throw new Error("solveFor must be 'P', 'V', 'n', or 'T'");
  }
}

// Compressibility factor Z = PV / nRT. Exactly 1 for an ideal gas.
export function compressibility({ P, V, n, T }) {
  return (P * V) / (n * GAS_CONSTANT_R * T);
}

// van der Waals pressure (atm) for a real gas.
// a in L^2·atm·mol^-2, b in L·mol^-1.
export function vanderWaalsPressure({ n, V, T, a, b }) {
  return (n * GAS_CONSTANT_R * T) / (V - n * b) - a * (n * n) / (V * V);
}

// Dalton's law: split a total pressure among components by mole fraction.
// components: [{ name, mol }]. Returns [{ name, mol, fraction, partial }].
export function partialPressures(components, totalPressure) {
  const totalMol = components.reduce((s, c) => s + (c.mol || 0), 0);
  return components.map(c => {
    const fraction = totalMol > 0 ? (c.mol || 0) / totalMol : 0;
    return { name: c.name, mol: c.mol || 0, fraction, partial: fraction * totalPressure };
  });
}

// ---- Solutions & solubility (Unit 8, C.11) ----

// Molarity (mol/L): moles of solute per litre of solution. Guarded against a
// zero volume so a half-built flask reads 0 instead of Infinity.
export function molarity(moles, liters) {
  return liters > 0 ? moles / liters : 0;
}

// Dilution by C1*V1 = C2*V2. Pass the three known values and the one to solve for.
// state: { c1, v1, c2, v2 } (concentrations in M; volumes in any consistent unit).
export function dilute(state, solveFor) {
  const { c1, v1, c2, v2 } = state;
  switch (solveFor) {
    case 'c1': return (c2 * v2) / v1;
    case 'v1': return (c2 * v2) / c1;
    case 'c2': return (c1 * v1) / v2;
    case 'v2': return (c1 * v1) / c2;
    default: throw new Error("solveFor must be 'c1', 'v1', 'c2', or 'v2'");
  }
}

// Ion reference for the solubility-rules predictor (C.11D). Each ion carries its
// charge magnitude (sign is implied by cation vs anion), a display token, a name,
// and a `poly` flag (polyatomic, so it takes parentheses when its subscript is > 1).
// Copper is flagged honors so the core generator can leave it out.
export const IONS = {
  cations: {
    Li:  { token: 'Li',  charge: 1, name: 'lithium' },
    Na:  { token: 'Na',  charge: 1, name: 'sodium' },
    K:   { token: 'K',   charge: 1, name: 'potassium' },
    NH4: { token: 'NH4', charge: 1, name: 'ammonium', poly: true },
    Ag:  { token: 'Ag',  charge: 1, name: 'silver' },
    Mg:  { token: 'Mg',  charge: 2, name: 'magnesium' },
    Ca:  { token: 'Ca',  charge: 2, name: 'calcium' },
    Ba:  { token: 'Ba',  charge: 2, name: 'barium' },
    Zn:  { token: 'Zn',  charge: 2, name: 'zinc' },
    Fe2: { token: 'Fe',  charge: 2, name: 'iron(II)' },
    Pb:  { token: 'Pb',  charge: 2, name: 'lead(II)' },
    Cu:  { token: 'Cu',  charge: 2, name: 'copper(II)', honors: true },
    Al:  { token: 'Al',  charge: 3, name: 'aluminum' },
    Fe3: { token: 'Fe',  charge: 3, name: 'iron(III)' }
  },
  anions: {
    NO3:    { token: 'NO3',    charge: 1, name: 'nitrate',   poly: true },
    ClO3:   { token: 'ClO3',   charge: 1, name: 'chlorate',  poly: true },
    C2H3O2: { token: 'C2H3O2', charge: 1, name: 'acetate',   poly: true },
    Cl:     { token: 'Cl',     charge: 1, name: 'chloride' },
    Br:     { token: 'Br',     charge: 1, name: 'bromide' },
    I:      { token: 'I',      charge: 1, name: 'iodide' },
    OH:     { token: 'OH',     charge: 1, name: 'hydroxide', poly: true },
    SO4:    { token: 'SO4',    charge: 2, name: 'sulfate',   poly: true },
    CO3:    { token: 'CO3',    charge: 2, name: 'carbonate', poly: true },
    S:      { token: 'S',      charge: 2, name: 'sulfide' },
    PO4:    { token: 'PO4',    charge: 3, name: 'phosphate', poly: true }
  }
};

// General solubility rules at the HS level, in priority order. The predictor walks
// this list and the first matching rule decides. `soluble` is the verdict when the
// rule applies; `except` lists cation keys that flip that verdict.
export const SOLUBILITY_RULES = [
  { id: 'group1',    soluble: true,                            text: 'Salts of Group 1 cations (Li+, Na+, K+) and ammonium (NH4+) are soluble.' },
  { id: 'nitrate',   soluble: true,                            text: 'Nitrates (NO3-), chlorates (ClO3-), and acetates (C2H3O2-) are soluble.' },
  { id: 'halide',    soluble: true,  except: ['Ag', 'Pb'],     text: 'Chlorides, bromides, and iodides are soluble except those of Ag+ and Pb2+.' },
  { id: 'sulfate',   soluble: true,  except: ['Ba', 'Ca', 'Pb', 'Ag'], text: 'Sulfates (SO4 2-) are soluble except those of Ba2+, Ca2+, Pb2+, and Ag+.' },
  { id: 'hydroxide', soluble: false, except: ['Ba'],           text: 'Hydroxides (OH-) are insoluble except those of Group 1, NH4+, and Ba2+.' },
  { id: 'insoluble', soluble: false,                           text: 'Carbonates (CO3 2-), phosphates (PO4 3-), and sulfides (S 2-) are insoluble except with Group 1 / NH4+.' }
];

const GROUP1 = new Set(['Li', 'Na', 'K', 'NH4']);

function solubilityRuleFor(cationKey, anionKey) {
  if (GROUP1.has(cationKey)) return SOLUBILITY_RULES[0];
  if (anionKey === 'NO3' || anionKey === 'ClO3' || anionKey === 'C2H3O2') return SOLUBILITY_RULES[1];
  if (anionKey === 'Cl' || anionKey === 'Br' || anionKey === 'I') return SOLUBILITY_RULES[2];
  if (anionKey === 'SO4') return SOLUBILITY_RULES[3];
  if (anionKey === 'OH') return SOLUBILITY_RULES[4];
  return SOLUBILITY_RULES[5]; // carbonate / phosphate / sulfide (and any remaining)
}

// Predict whether the ionic compound of a cation+anion (keys into IONS) dissolves.
// Returns { soluble, ruleId, reason }.
export function predictSolubility(cationKey, anionKey) {
  const rule = solubilityRuleFor(cationKey, anionKey);
  const exception = rule.except ? rule.except.includes(cationKey) : false;
  const soluble = exception ? !rule.soluble : rule.soluble;
  return { soluble, ruleId: rule.id, reason: rule.text };
}

// Build the neutral ionic formula for a cation+anion (keys into IONS), criss-crossing
// the charges and reducing to the lowest whole-number ratio. Polyatomic ions get
// parentheses when their subscript exceeds 1. The result parses with parseFormula
// (e.g. 'Al2(SO4)3', '(NH4)2SO4', 'CaCl2').
export function ionicFormula(cationKey, anionKey) {
  const c = IONS.cations[cationKey], a = IONS.anions[anionKey];
  if (!c || !a) throw new Error('Unknown ion');
  const g = gcd(c.charge, a.charge);
  return ionPart(c, a.charge / g) + ionPart(a, c.charge / g);
}

function ionPart(ion, n) {
  if (n === 1) return ion.token;
  return ion.poly ? `(${ion.token})${n}` : `${ion.token}${n}`;
}

// Double-replacement outcome for two soluble reactants (each { cation, anion } as
// IONS keys). The cations trade anions; each product's solubility is predicted and a
// precipitate forms if either product is insoluble. Returns the two products (with
// formula + solubility) and the list of precipitate formulas.
export function doubleReplacement(rA, rB) {
  const make = (cat, an) => {
    const { soluble, reason } = predictSolubility(cat, an);
    return { cation: cat, anion: an, formula: ionicFormula(cat, an), soluble, reason };
  };
  const products = [make(rA.cation, rB.anion), make(rB.cation, rA.anion)];
  const precipitates = products.filter(p => !p.soluble).map(p => p.formula);
  return { products, precipitates, formsPrecipitate: precipitates.length > 0 };
}

// ---- Measurement & data analysis (Unit 1, SEP C.1-C.4) ----

// Count significant figures in a number written as a string.
// Rules: leading zeros never count; captive zeros count; trailing zeros count
// only when a decimal point is present; scientific notation counts the mantissa.
export function sigFigs(numStr) {
  let s = String(numStr).trim();
  const sci = s.match(/^[+-]?(\d*\.?\d+)[eE][+-]?\d+$/);
  if (sci) return sigFigs(sci[1]);
  s = s.replace(/^[+-]/, '');
  if (s.includes('.')) {
    s = s.replace('.', '').replace(/^0+/, '');
    return s.length || 1;
  }
  s = s.replace(/^0+/, '').replace(/0+$/, '');
  return s.length || 1;
}

// Round x to n significant figures.
export function roundToSigFigs(x, n) {
  if (x === 0 || !isFinite(x)) return 0;
  const mag = Math.pow(10, n - Math.ceil(Math.log10(Math.abs(x))));
  return Math.round(x * mag) / mag;
}

export const density = (mass, volume) => (volume === 0 ? 0 : mass / volume);

export const percentError = (measured, accepted) =>
  accepted === 0 ? 0 : Math.abs(measured - accepted) / Math.abs(accepted) * 100;

export const mean = arr => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0);

// Sample standard deviation (n-1 denominator); spread is a measure of precision.
export function sampleStdDev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1));
}

// ---- Atomic structure & light (Unit 2, C.6) ----

// Average atomic mass from isotopic composition. isotopes: [{ mass, abundance }].
// Abundance may be percent (sum ~100), fraction (sum ~1), or any weights; the
// result is normalized by the total abundance.
export function averageAtomicMass(isotopes) {
  let num = 0, den = 0;
  for (const i of isotopes) { num += i.mass * i.abundance; den += i.abundance; }
  return den === 0 ? 0 : num / den;
}

// Aufbau (Madelung) subshell filling order: [principal n, subshell, capacity].
const FILL_ORDER = [
  [1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2], [3, 'p', 6], [4, 's', 2],
  [3, 'd', 10], [4, 'p', 6], [5, 's', 2], [4, 'd', 10], [5, 'p', 6], [6, 's', 2],
  [4, 'f', 14], [5, 'd', 10], [6, 'p', 6], [7, 's', 2], [5, 'f', 14], [6, 'd', 10], [7, 'p', 6]
];

// Ground-state electron configuration predicted by the Aufbau principle for a
// given number of electrons. Returns occupied subshells in fill order:
// [{ n, l, e }]. Real exceptions (Cr, Cu, ...) are handled as data, not here.
export function electronConfiguration(numElectrons) {
  const out = [];
  let left = numElectrons;
  for (const [n, l, cap] of FILL_ORDER) {
    if (left <= 0) break;
    const e = Math.min(cap, left);
    out.push({ n, l, e });
    left -= e;
  }
  return out;
}

// Format a configuration array as "1s2 2s2 2p6 ..." in fill order.
export function formatConfig(config) {
  return config.map(s => `${s.n}${s.l}${s.e}`).join(' ');
}

// Electrons per principal shell (Bohr "shells"); index 0 = shell n=1. Works for
// any electron count, so it also serves ions (pass the ion's electron count).
export function shellOccupancy(numElectrons) {
  const shells = [];
  for (const s of electronConfiguration(numElectrons)) {
    shells[s.n - 1] = (shells[s.n - 1] || 0) + s.e;
  }
  for (let i = 0; i < shells.length; i++) shells[i] = shells[i] || 0;
  return shells;
}

// Valence electrons for a representative (main-group) element: the s and p
// electrons in the highest occupied principal shell.
export function valenceElectrons(numElectrons) {
  const config = electronConfiguration(numElectrons);
  const sp = config.filter(s => s.l === 's' || s.l === 'p');
  const maxN = Math.max(...sp.map(s => s.n));
  return sp.filter(s => s.n === maxN).reduce((sum, s) => sum + s.e, 0);
}

// Period (the periodic-table row) of a neutral element: the number of occupied
// principal electron shells. Verified: He -> 1, Na -> 3, Fe -> 4, Pb -> 6.
export function period(z) {
  return shellOccupancy(z).length;
}

// Crude effective nuclear charge: the atomic number minus the core electrons,
// where the "core" is every shell except the outermost. This is the simplest
// "core electrons shield fully, valence electrons do not" model. It is meant for
// main-group trends, where across a period it climbs (Na 1 ... Cl 7 ... Ar 8)
// and down a group it stays roughly constant. Real Slater shielding is subtler.
export function effectiveNuclearCharge(z) {
  const shells = shellOccupancy(z);
  const core = shells.slice(0, -1).reduce((sum, n) => sum + n, 0);
  return z - core;
}

export const PLANCK = 6.626e-34;        // J*s
export const SPEED_OF_LIGHT = 2.998e8;  // m/s
export const RYDBERG = 1.097e7;         // m^-1 (hydrogen)

// Frequency (Hz) of light from its wavelength (m).
export const frequencyOf = wavelength => SPEED_OF_LIGHT / wavelength;

// Photon energy (J) from a wavelength (m) or a frequency (Hz): E = hc/lambda = h*nu.
export function photonEnergy({ wavelength, frequency }) {
  if (wavelength != null) return PLANCK * SPEED_OF_LIGHT / wavelength;
  return PLANCK * frequency;
}

// Rydberg formula: wavelength (m) of the hydrogen line for a transition
// n2 -> n1 (n2 > n1). The visible Balmer series uses n1 = 2.
export function rydbergWavelength(n1, n2) {
  return 1 / (RYDBERG * (1 / (n1 * n1) - 1 / (n2 * n2)));
}

// ---- Acids & bases (Unit 9, C.12) ----

// pH from the hydrogen-ion concentration [H+] (mol/L): pH = -log10[H+].
export const pH = hConc => -Math.log10(hConc);

// pOH from the hydroxide-ion concentration [OH-] (mol/L): pOH = -log10[OH-].
export const pOH = ohConc => -Math.log10(ohConc);

// pH from pOH via water autoionization at 25 degC: pH + pOH = 14.
export const pHfromPOH = poh => 14 - poh;

// Equivalence-point volume of titrant for an acid-base titration. At equivalence
// the moles of acidic protons equal the moles of hydroxide:
//   Ca*Va*na = Cb*Vb*nb  ->  Vtitrant = (Ca*Va*na)/(Cb*nb).
// Concentrations in mol/L; Va in any volume unit (the result shares that unit).
// na/nb default to 1 (monoprotic acid, single-hydroxide base); raise them for a
// polyprotic acid or a poly-hydroxide base.
export function equivalenceVolume({ Ca, Va, na = 1, Cb, nb = 1 }) {
  return (Ca * Va * na) / (Cb * nb);
}

// pH along a strong monoprotic acid titrated by a strong base. Volumes share one
// unit (e.g. mL); concentrations in mol/L. Returns the pH after Vb of base has
// been added: excess H+ is acidic, excess OH- is basic, an exact match is 7.
export function titrationPH({ Ca, Va, Cb, Vb }) {
  const molAcid = Ca * Va;        // proportional to mmol of H+
  const molBase = Cb * Vb;        // proportional to mmol of OH-
  const vTot = Va + Vb;
  const net = molAcid - molBase;
  if (Math.abs(net) < 1e-12) return 7;
  if (net > 0) return -Math.log10(net / vTot);        // leftover acid
  return 14 - (-Math.log10(-net / vTot));             // leftover base
}

// pH of a weak monoprotic acid (Unit 9 Honors) from its acid-dissociation
// constant Ka and formal concentration C (mol/L). Solves Ka = x^2/(C - x)
// exactly for x = [H+] (no small-x approximation), then pH = -log10(x).
export function phWeakAcid(Ka, C) {
  const x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * C)) / 2;
  return -Math.log10(x);
}

// ---- Thermochemistry (U10, C.13) ----

// Specific heat capacity in J/(g*degC): the energy one gram absorbs per degree of
// temperature rise. Keys are lowercase material names so a <select> can bind them
// directly. Water's high value is why it buffers climate and cools engines; the
// metals are low, which is why a pan handle burns you and a pool does not.
export const SPECIFIC_HEAT = {
  water: 4.184, ice: 2.09, steam: 2.01, ethanol: 2.44, air: 1.01,
  aluminum: 0.897, copper: 0.385, iron: 0.449, lead: 0.128,
  silver: 0.235, gold: 0.129, glass: 0.84, granite: 0.79, sand: 0.83
};

// Throw unless every listed value is a finite number.
function requireFinite(values, where) {
  for (const k in values) {
    const v = values[k];
    if (typeof v !== 'number' || !isFinite(v)) {
      throw new Error(`${where}: ${k} must be a finite number`);
    }
  }
}

// Solve q = m*c*dT for whichever ONE of the four is missing (undefined or null).
// Returns the complete { q, m, c, dT }: q in joules, m in grams, c in J/(g*degC),
// dT in degC. Exactly one unknown is required, every known value must be a finite
// number, and the divisor for the solve must not be zero (a 0 degC change carries
// no information about mass, so that case is an error rather than Infinity).
export function heatTransfer({ q, m, c, dT }) {
  const given = { q, m, c, dT };
  const unknowns = Object.keys(given).filter(k => given[k] === undefined || given[k] === null);
  if (unknowns.length !== 1) {
    throw new Error(`heatTransfer needs exactly 1 unknown, got ${unknowns.length}`);
  }
  const known = {};
  for (const k in given) if (!unknowns.includes(k)) known[k] = given[k];
  requireFinite(known, 'heatTransfer');
  const solveFor = unknowns[0];
  const divide = (numerator, denominator, label) => {
    if (denominator === 0) throw new Error(`heatTransfer cannot solve ${solveFor}: ${label} is zero`);
    return numerator / denominator;
  };
  const out = { ...known };
  switch (solveFor) {
    case 'q':  out.q = known.m * known.c * known.dT; break;
    case 'm':  out.m = divide(known.q, known.c * known.dT, 'c*dT'); break;
    case 'c':  out.c = divide(known.q, known.m * known.dT, 'm*dT'); break;
    default:   out.dT = divide(known.q, known.m * known.c, 'm*c');
  }
  return { q: out.q, m: out.m, c: out.c, dT: out.dT };
}

// Calorimetry: two bodies { m, c, t } touch inside a perfect calorimeter, so all the
// heat the hot one loses is heat the cold one gains and they settle at one temperature
//   tFinal = (mA*cA*tA + mB*cB*tB) / (mA*cA + mB*cB).
// Returns { tFinal, qTransferred, from } where qTransferred is the POSITIVE magnitude
// of heat that moved and `from` names the body that cooled ('none' if they started
// at the same temperature, so nothing moved).
export function finalTemperature(bodyA, bodyB) {
  const check = (body, label) => {
    requireFinite({ m: body.m, c: body.c, t: body.t }, `finalTemperature ${label}`);
    if (body.m <= 0) throw new Error(`finalTemperature ${label}: m must be > 0`);
    if (body.c <= 0) throw new Error(`finalTemperature ${label}: c must be > 0`);
  };
  check(bodyA, 'bodyA');
  check(bodyB, 'bodyB');
  const capA = bodyA.m * bodyA.c, capB = bodyB.m * bodyB.c;
  const tFinal = (capA * bodyA.t + capB * bodyB.t) / (capA + capB);
  return {
    tFinal,
    qTransferred: Math.abs(capA * (tFinal - bodyA.t)),
    from: bodyA.t === bodyB.t ? 'none' : (bodyA.t > bodyB.t ? 'a' : 'b')
  };
}

// Sign convention for enthalpy change: a system that releases heat has dH < 0.
// Returns 'exothermic' | 'endothermic' | 'thermoneutral'.
export function classifyThermal(dH) {
  requireFinite({ dH }, 'classifyThermal');
  if (dH < 0) return 'exothermic';
  if (dH > 0) return 'endothermic';
  return 'thermoneutral';
}

// Hess's law (U10 Honors): enthalpy is a state function, so a target reaction's dH is
// the sum of any set of steps that adds up to it. steps: [{ dH, flip, scale }].
// Reversing a step negates its dH; scaling multiplies it. Returns the summed dH.
export function hessCombine(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error('hessCombine needs at least one step');
  }
  let total = 0;
  for (const s of steps) {
    const scale = s.scale === undefined ? 1 : s.scale;
    requireFinite({ dH: s.dH, scale }, 'hessCombine');
    total += (s.flip ? -s.dH : s.dH) * scale;
  }
  return total;
}

// Standard enthalpy of reaction from heats of formation (U10 Honors):
//   dHrxn = sum(coefficient * dHf) over products - the same sum over reactants.
// Each side is [{ dHf, coefficient }]. An element in its standard state has dHf = 0.
export function enthalpyFromFormation(products, reactants) {
  const side = (list, label) => {
    if (!Array.isArray(list)) throw new Error(`enthalpyFromFormation: ${label} must be an array`);
    let sum = 0;
    for (const s of list) {
      const coefficient = s.coefficient === undefined ? 1 : s.coefficient;
      requireFinite({ dHf: s.dHf, coefficient }, `enthalpyFromFormation ${label}`);
      sum += coefficient * s.dHf;
    }
    return sum;
  };
  return side(products, 'products') - side(reactants, 'reactants');
}

// ---- Nuclear chemistry (U11, C.14) ----

// The emitted particles, written as the mass number / atomic number they carry away.
// An alpha particle is a helium nucleus (A 4, Z 2). A beta particle is an electron,
// so it carries Z -1: subtracting -1 RAISES the daughter's atomic number by one.
// Gamma is pure energy and changes neither number. A positron carries Z +1.
export const DECAY_PARTICLES = {
  alpha:    { symbol: 'alpha', A: 4, Z: 2,  name: 'alpha particle' },
  beta:     { symbol: 'beta-', A: 0, Z: -1, name: 'beta particle' },
  gamma:    { symbol: 'gamma', A: 0, Z: 0,  name: 'gamma ray' },
  positron: { symbol: 'beta+', A: 0, Z: 1,  name: 'positron' }
};

// Throw unless n is a non-negative integer.
function requireCount(n, label) {
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    throw new Error(`${label} must be an integer`);
  }
  if (n < 0) throw new Error(`${label} must not be negative`);
}

// Balance a decay by conserving mass number and atomic number: the daughter gets
// whatever the emitted particle did not take. Returns { A, Z, mode, particle }.
// Verified: C-14 beta -> A 14, Z 7 (nitrogen); U-238 alpha -> A 234, Z 90 (thorium).
export function decayProduct(A, Z, mode) {
  const particle = DECAY_PARTICLES[mode];
  if (!particle) throw new Error(`Unknown decay mode: ${mode}`);
  requireCount(A, 'decayProduct A');
  requireCount(Z, 'decayProduct Z');
  const dA = A - particle.A, dZ = Z - particle.Z;
  if (dA < 0 || dZ < 0) throw new Error(`${mode} decay of A ${A} Z ${Z} would give a negative daughter`);
  return { A: dA, Z: dZ, mode, particle };
}

// Is a nuclear equation balanced? Each side is [{ A, Z, count }]; the sums of the
// mass numbers and of the atomic numbers must match across the arrow.
export function isBalancedNuclear(left, right) {
  const tally = (list, label) => {
    if (!Array.isArray(list)) throw new Error(`isBalancedNuclear: ${label} must be an array`);
    let A = 0, Z = 0;
    for (const s of list) {
      const count = s.count === undefined ? 1 : s.count;
      if (!Number.isInteger(s.A)) throw new Error(`isBalancedNuclear ${label}: A must be an integer`);
      if (!Number.isInteger(s.Z)) throw new Error(`isBalancedNuclear ${label}: Z must be an integer`);
      if (!Number.isInteger(count) || count < 1) {
        throw new Error(`isBalancedNuclear ${label}: count must be an integer >= 1`);
      }
      A += s.A * count; Z += s.Z * count;
    }
    return { A, Z };
  };
  const L = tally(left, 'left'), R = tally(right, 'right');
  return L.A === R.A && L.Z === R.Z;
}

export const CARBON14_HALFLIFE = 5730;  // years
export const MEV_PER_U = 931.494;       // MeV released per atomic mass unit of defect

// Amount left after `elapsed` time: N = initial * (1/2)^(elapsed/halfLife).
// Decay is first order, so the fraction lost per half-life never changes.
export function halfLifeRemaining(initial, elapsed, halfLife) {
  requireFinite({ initial, elapsed, halfLife }, 'halfLifeRemaining');
  if (initial < 0) throw new Error('halfLifeRemaining: initial must not be negative');
  if (elapsed < 0) throw new Error('halfLifeRemaining: elapsed must not be negative');
  if (halfLife <= 0) throw new Error('halfLifeRemaining: halfLife must be > 0');
  return initial * Math.pow(0.5, elapsed / halfLife);
}

// Inverse of halfLifeRemaining: how many half-lives leave this fraction behind.
// n = log2(1/fraction), so 0.5 -> 1 and 0.25 -> 2.
export function halfLivesElapsed(fractionRemaining) {
  requireFinite({ fractionRemaining }, 'halfLivesElapsed');
  if (!(fractionRemaining > 0) || fractionRemaining > 1) {
    throw new Error('halfLivesElapsed: fractionRemaining must be in (0, 1]');
  }
  return Math.log2(1 / fractionRemaining);
}

// Radiometric dating: age = halfLife * log2(1/fraction), in the same time unit as
// halfLife. Pass CARBON14_HALFLIFE for carbon dating.
export function radiometricAge(fractionRemaining, halfLife) {
  requireFinite({ fractionRemaining, halfLife }, 'radiometricAge');
  if (!(fractionRemaining > 0) || fractionRemaining > 1) {
    throw new Error('radiometricAge: fractionRemaining must be in (0, 1]');
  }
  if (halfLife <= 0) throw new Error('radiometricAge: halfLife must be > 0');
  return halfLife * Math.log2(1 / fractionRemaining);
}

// Mass defect (u): a nucleus weighs LESS than its loose nucleons do, and the missing
// mass is the binding energy that holds it together.
export function massDefect(nucleonMassTotal, actualMass) {
  requireFinite({ nucleonMassTotal, actualMass }, 'massDefect');
  return nucleonMassTotal - actualMass;
}

// Binding energy (MeV) from the mass defect (u) via E = mc^2, with c^2 folded into
// the MeV-per-u conversion.
export function bindingEnergyMeV(massDefectU) {
  requireFinite({ massDefectU }, 'bindingEnergyMeV');
  return massDefectU * MEV_PER_U;
}

// Nuclide pool for the nuclear unit. Half-lives are measured values in the stated
// unit; `use` is the real application that makes the nuclide worth knowing.
export const NUCLIDES = [
  { sym: 'Tc-99m', name: 'technetium-99m', A: 99,  Z: 43, mode: 'gamma',    halfLife: 6,      halfLifeUnit: 'h',   use: 'medical imaging tracer' },
  { sym: 'I-131',  name: 'iodine-131',     A: 131, Z: 53, mode: 'beta',     halfLife: 8.02,   halfLifeUnit: 'd',   use: 'thyroid therapy and imaging' },
  { sym: 'Co-60',  name: 'cobalt-60',      A: 60,  Z: 27, mode: 'beta',     halfLife: 5.27,   halfLifeUnit: 'y',   use: 'external beam cancer therapy' },
  { sym: 'F-18',   name: 'fluorine-18',    A: 18,  Z: 9,  mode: 'positron', halfLife: 110,    halfLifeUnit: 'min', use: 'PET scan tracer' },
  { sym: 'Mo-99',  name: 'molybdenum-99',  A: 99,  Z: 42, mode: 'beta',     halfLife: 66,     halfLifeUnit: 'h',   use: 'parent in the Tc-99m generator' },
  { sym: 'C-14',   name: 'carbon-14',      A: 14,  Z: 6,  mode: 'beta',     halfLife: 5730,   halfLifeUnit: 'y',   use: 'radiocarbon dating of organic remains' },
  { sym: 'U-238',  name: 'uranium-238',    A: 238, Z: 92, mode: 'alpha',    halfLife: 4.47e9, halfLifeUnit: 'y',   use: 'uranium-lead dating of rocks' },
  { sym: 'U-235',  name: 'uranium-235',    A: 235, Z: 92, mode: 'alpha',    halfLife: 7.04e8, halfLifeUnit: 'y',   use: 'fission fuel in reactors' },
  { sym: 'Ra-226', name: 'radium-226',     A: 226, Z: 88, mode: 'alpha',    halfLife: 1600,   halfLifeUnit: 'y',   use: 'historic radium dial paint' },
  { sym: 'Am-241', name: 'americium-241',  A: 241, Z: 95, mode: 'alpha',    halfLife: 432,    halfLifeUnit: 'y',   use: 'ionization smoke detectors' },
  { sym: 'Pu-239', name: 'plutonium-239',  A: 239, Z: 94, mode: 'alpha',    halfLife: 2.41e4, halfLifeUnit: 'y',   use: 'reactor fuel and weapons material' },
  { sym: 'Sr-90',  name: 'strontium-90',   A: 90,  Z: 38, mode: 'beta',     halfLife: 28.8,   halfLifeUnit: 'y',   use: 'fallout bone seeker, thermal generators' },
  { sym: 'Rn-222', name: 'radon-222',      A: 222, Z: 86, mode: 'alpha',    halfLife: 3.82,   halfLifeUnit: 'd',   use: 'indoor air hazard from soil uranium' },
  { sym: 'Po-210', name: 'polonium-210',   A: 210, Z: 84, mode: 'alpha',    halfLife: 138,    halfLifeUnit: 'd',   use: 'static eliminators, alpha source' },
  { sym: 'H-3',    name: 'tritium',        A: 3,   Z: 1,  mode: 'beta',     halfLife: 12.3,   halfLifeUnit: 'y',   use: 'self-powered exit signs and gun sights' },
  { sym: 'K-40',   name: 'potassium-40',   A: 40,  Z: 19, mode: 'beta',     halfLife: 1.25e9, halfLifeUnit: 'y',   use: 'potassium-argon dating, natural background dose' }
];

// ELEMENTS above only lists the elements that also have a tabulated atomic mass, so
// it skips most of the transition block and stops at lead. Nuclear decay and fission
// walk straight through those gaps (Mo-99 decays to Tc, U-238 to Th, U-235 fissions to
// Kr and Ba), so this table fills them: Z 31 to 60 and Z 81 to 96, minus the ones
// ELEMENTS already covers. Look nuclides up with symbolForZ, never with either table
// directly, so the two never have to be kept in sync by hand.
export const NUCLEAR_ELEMENTS = [
  { z: 31, sym: 'Ga', name: 'Gallium' },      { z: 32, sym: 'Ge', name: 'Germanium' },
  { z: 33, sym: 'As', name: 'Arsenic' },      { z: 34, sym: 'Se', name: 'Selenium' },
  { z: 36, sym: 'Kr', name: 'Krypton' },      { z: 37, sym: 'Rb', name: 'Rubidium' },
  { z: 38, sym: 'Sr', name: 'Strontium' },    { z: 39, sym: 'Y',  name: 'Yttrium' },
  { z: 40, sym: 'Zr', name: 'Zirconium' },    { z: 41, sym: 'Nb', name: 'Niobium' },
  { z: 42, sym: 'Mo', name: 'Molybdenum' },   { z: 43, sym: 'Tc', name: 'Technetium' },
  { z: 44, sym: 'Ru', name: 'Ruthenium' },    { z: 45, sym: 'Rh', name: 'Rhodium' },
  { z: 46, sym: 'Pd', name: 'Palladium' },    { z: 48, sym: 'Cd', name: 'Cadmium' },
  { z: 49, sym: 'In', name: 'Indium' },       { z: 50, sym: 'Sn', name: 'Tin' },
  { z: 51, sym: 'Sb', name: 'Antimony' },     { z: 52, sym: 'Te', name: 'Tellurium' },
  { z: 54, sym: 'Xe', name: 'Xenon' },        { z: 55, sym: 'Cs', name: 'Caesium' },
  { z: 57, sym: 'La', name: 'Lanthanum' },    { z: 58, sym: 'Ce', name: 'Cerium' },
  { z: 59, sym: 'Pr', name: 'Praseodymium' }, { z: 60, sym: 'Nd', name: 'Neodymium' },
  { z: 81, sym: 'Tl', name: 'Thallium' },     { z: 83, sym: 'Bi', name: 'Bismuth' },
  { z: 84, sym: 'Po', name: 'Polonium' },     { z: 85, sym: 'At', name: 'Astatine' },
  { z: 86, sym: 'Rn', name: 'Radon' },        { z: 87, sym: 'Fr', name: 'Francium' },
  { z: 88, sym: 'Ra', name: 'Radium' },       { z: 89, sym: 'Ac', name: 'Actinium' },
  { z: 90, sym: 'Th', name: 'Thorium' },      { z: 91, sym: 'Pa', name: 'Protactinium' },
  { z: 92, sym: 'U',  name: 'Uranium' },      { z: 93, sym: 'Np', name: 'Neptunium' },
  { z: 94, sym: 'Pu', name: 'Plutonium' },    { z: 95, sym: 'Am', name: 'Americium' },
  { z: 96, sym: 'Cm', name: 'Curium' }
];

const Z_INDEX = new Map([...ELEMENTS, ...NUCLEAR_ELEMENTS].map(e => [e.z, e]));

// Atomic number to symbol, across both reference tables. Returns null for a Z that
// neither table covers, so a caller can fall back to writing the bare number.
export function symbolForZ(z) {
  const e = Z_INDEX.get(z);
  return e ? e.sym : null;
}

// Atomic number to element name, same coverage as symbolForZ.
export function nameForZ(z) {
  const e = Z_INDEX.get(z);
  return e ? e.name : null;
}

// Binding-energy bookkeeping uses the ATOMIC mass of hydrogen-1, not the bare proton
// mass, because the nuclide masses it is compared against are atomic masses too. The
// Z electrons then cancel on both sides and the defect comes out right.
export const HYDROGEN_ATOM_MASS_U = 1.007825;
export const NEUTRON_MASS_U = 1.008665;

// What the loose nucleons of a nuclide would weigh if they were never bound together.
// Subtract the measured atomic mass from this and the difference is the mass defect.
export function nucleonMassSum(A, Z) {
  requireCount(A, 'nucleonMassSum A');
  requireCount(Z, 'nucleonMassSum Z');
  if (Z > A) throw new Error('nucleonMassSum: Z must not exceed A');
  return Z * HYDROGEN_ATOM_MASS_U + (A - Z) * NEUTRON_MASS_U;
}

// Effective half-life: a radiopharmaceutical leaves the body two ways at once, by
// decaying and by being excreted, so the rates add. 1/te = 1/tp + 1/tb. Both inputs
// must be in the same time unit, and the result is always shorter than either.
export function effectiveHalfLife(physical, biological) {
  requireFinite({ physical, biological }, 'effectiveHalfLife');
  if (physical <= 0) throw new Error('effectiveHalfLife: physical must be > 0');
  if (biological <= 0) throw new Error('effectiveHalfLife: biological must be > 0');
  return (physical * biological) / (physical + biological);
}

// Display helpers.
export function fmt(n, sig = 3) {
  if (!isFinite(n)) return '-';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e5 || abs < 1e-3) return n.toExponential(2);
  return Number(n.toPrecision(sig)).toString();
}
