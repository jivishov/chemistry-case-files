// model.js — Unit 1 domain data (Practices, Measurement & Matter, SEP C.1-C.4).
// Pure data. Measurement math lives in shared/js/chem.js.

// ---- C.1: SI reference shown beside the graduated-cylinder reader ----
export const SI_UNITS = [
  { quantity: 'Length',      unit: 'meter',    sym: 'm' },
  { quantity: 'Mass',        unit: 'kilogram', sym: 'kg' },
  { quantity: 'Time',        unit: 'second',   sym: 's' },
  { quantity: 'Temperature', unit: 'kelvin',   sym: 'K' },
  { quantity: 'Amount',      unit: 'mole',     sym: 'mol' }
];

export const PREFIXES = [
  { name: 'kilo',  sym: 'k', factor: '10³' },
  { name: 'deci',  sym: 'd', factor: '10⁻¹' },
  { name: 'centi', sym: 'c', factor: '10⁻²' },
  { name: 'milli', sym: 'm', factor: '10⁻³' },
  { name: 'micro', sym: 'μ', factor: '10⁻⁶' }
];

// ---- C.2: number pools for the significant-figure drills ----
export const SF_COUNT = ['0.00450', '1200', '100.0', '3.080', '45000', '0.067', '12.000', '5.0', '908', '0.0010', '2.50', '60800'];
export const SF_ROUND = [123.456, 0.0023456, 45678, 9.8765, 0.10472, 2345.6, 0.085019, 7654.3];
export const SF_CALC = [
  ['2.5', '3.42'], ['12.0', '4.8'], ['3.14', '2.0'], ['0.50', '6.755'],
  ['25.0', '1.2'], ['8.4', '0.025'], ['100.', '3.1'], ['6.022', '2.0']
];

// ---- C.3: substances for density-by-displacement identification (g/mL) ----
export const SUBSTANCES = [
  { name: 'Aluminum', density: 2.70 },
  { name: 'Titanium', density: 4.51 },
  { name: 'Zinc',     density: 7.14 },
  { name: 'Iron',     density: 7.87 },
  { name: 'Copper',   density: 8.96 },
  { name: 'Silver',   density: 10.49 },
  { name: 'Lead',     density: 11.34 },
  { name: 'Gold',     density: 19.32 }
];

// ---- C.4: the four accuracy/precision combinations (static reference board) ----
// dots are normalized [-1,1] target coordinates; center is the accepted value.
export const AP_BOARDS = [
  { key: 'both',     title: 'Accurate + precise', desc: 'Close to the true value and tightly grouped.',
    dots: [[0.05, -0.08], [-0.06, 0.04], [0.02, 0.09], [-0.03, -0.05], [0.07, 0.02]] },
  { key: 'precise',  title: 'Precise, not accurate', desc: 'Tightly grouped but off the true value (systematic error).',
    dots: [[0.55, 0.42], [0.62, 0.5], [0.5, 0.55], [0.58, 0.46], [0.64, 0.4]] },
  { key: 'accurate', title: 'Accurate, not precise', desc: 'Centered on the true value but widely scattered (random error).',
    dots: [[0.5, -0.1], [-0.45, 0.2], [0.1, 0.55], [-0.2, -0.5], [0.15, -0.2]] },
  { key: 'neither',  title: 'Neither', desc: 'Off the true value and scattered.',
    dots: [[0.45, 0.5], [0.7, 0.2], [0.3, 0.75], [0.8, 0.55], [0.55, 0.3]] }
];

export const SE = [
  { code: 'C.1', mode: 'measure',  honors: false, text: 'Plan and safely conduct investigations using appropriate tools, models, and SI units.' },
  { code: 'C.2', mode: 'sigfig',   honors: false, text: 'Analyze and interpret data, including significant figures, precision, and error.' },
  { code: 'C.3', mode: 'density',  honors: false, text: 'Develop and communicate evidence-based explanations and conclusions.' },
  { code: 'C.4', mode: 'evaluate', honors: false, text: 'Evaluate the accuracy, precision, and reliability of scientific measurements.' }
];
