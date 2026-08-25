// model.js - Unit 4 domain data (Bonding, Nomenclature & Geometry, TEKS C.7).
// Pure data plus the standards map. The interactive mechanics live in main.js.

// ---- C.7(A): elements offered in the bond-type predictor ----
export const ELEMENTS = [
  { sym: 'H', name: 'Hydrogen' }, { sym: 'Li', name: 'Lithium' }, { sym: 'Be', name: 'Beryllium' },
  { sym: 'B', name: 'Boron' }, { sym: 'C', name: 'Carbon' }, { sym: 'N', name: 'Nitrogen' },
  { sym: 'O', name: 'Oxygen' }, { sym: 'F', name: 'Fluorine' }, { sym: 'Na', name: 'Sodium' },
  { sym: 'Mg', name: 'Magnesium' }, { sym: 'Al', name: 'Aluminum' }, { sym: 'Si', name: 'Silicon' },
  { sym: 'P', name: 'Phosphorus' }, { sym: 'S', name: 'Sulfur' }, { sym: 'Cl', name: 'Chlorine' },
  { sym: 'K', name: 'Potassium' }, { sym: 'Ca', name: 'Calcium' }, { sym: 'Fe', name: 'Iron' },
  { sym: 'Cu', name: 'Copper' }, { sym: 'Zn', name: 'Zinc' }, { sym: 'Br', name: 'Bromine' }
];

// ---- C.7(B): nomenclature library ----
// `disposal` is an internal capstone key. It does not authorize real-world disposal.
// `clue` is supplied reference information; students are never directed to test an unknown substance.
export const COMPOUNDS = [
  { formula: 'NaCl', name: 'sodium chloride', cat: 'Binary ionic', honors: false,
    where: 'the white jar by the stove', disposal: 'keep', sink: true,
    clue: 'Reference record: nonreactive white crystals; water-soluble; no hazardous-waste flag on the original inventory.' },
  { formula: 'MgO', name: 'magnesium oxide', cat: 'Binary ionic', honors: false,
    where: 'the white powder in the first aid tin', disposal: 'keep', sink: true,
    clue: 'Reference record: white mineral powder; only slightly soluble in water; original inventory marks it for labeled storage.' },
  { formula: 'CaCl2', name: 'calcium chloride', cat: 'Binary ionic', honors: false,
    where: 'the split de-icer sack on the porch', disposal: 'drain', sink: true,
    clue: 'Reference record: moisture-absorbing de-icer; dissolving is exothermic; original inventory lists an approved nonhazardous disposal route.' },
  { formula: 'K2O', name: 'potassium oxide', cat: 'Binary ionic', honors: false,
    where: 'an unlabeled tin from the hall closet', disposal: 'haz', sink: true,
    clue: 'Reference record: reacts strongly with water to form corrosive potassium hydroxide; hazardous-waste handling is required.' },
  { formula: 'AlF3', name: 'aluminum fluoride', cat: 'Binary ionic', honors: false,
    where: 'a supplier sack in the hall closet', disposal: 'haz' },
  { formula: 'Na2S', name: 'sodium sulfide', cat: 'Binary ionic', honors: false,
    where: 'the dark jar at the back of the cupboard', disposal: 'haz', sink: true,
    clue: 'Reference record: sulfide salt; contact with acid can release toxic hydrogen sulfide gas; hazardous-waste handling is required.' },

  { formula: 'CO2', name: 'carbon dioxide', cat: 'Binary covalent', honors: false,
    where: 'the cartridge in the fizzy drink maker', disposal: 'keep' },
  { formula: 'CO', name: 'carbon monoxide', cat: 'Binary covalent', honors: false,
    where: 'the gas the hallway alarm monitors', disposal: 'haz' },
  { formula: 'SO2', name: 'sulfur dioxide', cat: 'Binary covalent', honors: false,
    where: 'the preservative listed on a pantry label', disposal: 'haz' },
  { formula: 'SO3', name: 'sulfur trioxide', cat: 'Binary covalent', honors: false,
    where: 'a reference sample listed in the old inventory', disposal: 'haz' },
  { formula: 'CCl4', name: 'carbon tetrachloride', cat: 'Binary covalent', honors: false,
    where: 'the old spot remover under the sink', disposal: 'haz', sink: true,
    clue: 'Reference record: carbon tetrachloride, a toxic volatile solvent that is denser than water and only slightly soluble in it; hazardous-waste handling is required.' },

  { formula: 'CaCO3', name: 'calcium carbonate', cat: 'Ionic + polyatomic', honors: true,
    where: 'the limescale ring in the kettle', disposal: 'drain' },
  { formula: 'Na2SO4', name: 'sodium sulfate', cat: 'Ionic + polyatomic', honors: true,
    where: 'the powder in the old detergent box', disposal: 'drain' },
  { formula: 'NH4Cl', name: 'ammonium chloride', cat: 'Ionic + polyatomic', honors: true,
    where: 'the old pantry inventory', disposal: 'drain' },
  { formula: 'KNO3', name: 'potassium nitrate', cat: 'Ionic + polyatomic', honors: true,
    where: 'the plant food on the balcony shelf', disposal: 'drain' },
  { formula: 'Mg(OH)2', name: 'magnesium hydroxide', cat: 'Ionic + polyatomic', honors: true,
    where: 'the antacid bottle in the bathroom', disposal: 'keep' },
  { formula: 'Ca3(PO4)2', name: 'calcium phosphate', cat: 'Ionic + polyatomic', honors: true,
    where: 'the bone meal for the balcony pots', disposal: 'keep' },

  { formula: 'FeCl3', name: 'iron(III) chloride', cat: 'Transition metal (Stock)', honors: true,
    where: 'the etching bottle in the toolbox', disposal: 'haz' },
  { formula: 'FeCl2', name: 'iron(II) chloride', cat: 'Transition metal (Stock)', honors: true,
    where: 'the tarnished jar beside it', disposal: 'haz' },
  { formula: 'CuO', name: 'copper(II) oxide', cat: 'Transition metal (Stock)', honors: true,
    where: 'the black powder in the pottery glaze kit', disposal: 'haz' },
  { formula: 'Cu2O', name: 'copper(I) oxide', cat: 'Transition metal (Stock)', honors: true,
    where: 'the red powder next to it', disposal: 'haz' },
  { formula: 'Fe2O3', name: 'iron(III) oxide', cat: 'Transition metal (Stock)', honors: true,
    where: 'the rust scraped off the balcony rail', disposal: 'keep' },

  { formula: 'N2O', name: 'dinitrogen monoxide', cat: 'Binary covalent', honors: true,
    where: 'the charger for the whipped-cream siphon', disposal: 'keep' },
  { formula: 'P4O10', name: 'tetraphosphorus decoxide', cat: 'Binary covalent', honors: true,
    where: 'the drying-agent inventory in the toolbox', disposal: 'haz' },
  { formula: 'PCl5', name: 'phosphorus pentachloride', cat: 'Binary covalent', honors: true,
    where: 'a lab bottle listed in the old inventory', disposal: 'haz' }
];

// ---- C.7(C): VSEPR molecules ----
export const MOLECULES = [
  { key: 'CO2',  formula: 'CO2',  name: 'Carbon dioxide', central: 'C', ligand: 'O', bonds: 2, lone: 0, geometry: 'linear', angle: '180°', polar: false },
  { key: 'BeF2', formula: 'BeF2', name: 'Beryllium fluoride', central: 'Be', ligand: 'F', bonds: 2, lone: 0, geometry: 'linear', angle: '180°', polar: false },
  { key: 'SO2',  formula: 'SO2',  name: 'Sulfur dioxide', central: 'S', ligand: 'O', bonds: 2, lone: 1, geometry: 'bent', angle: '≈119°', polar: true },
  { key: 'H2O',  formula: 'H2O',  name: 'Water', central: 'O', ligand: 'H', bonds: 2, lone: 2, geometry: 'bent', angle: '104.5°', polar: true },
  { key: 'BF3',  formula: 'BF3',  name: 'Boron trifluoride', central: 'B', ligand: 'F', bonds: 3, lone: 0, geometry: 'trigonal planar', angle: '120°', polar: false },
  { key: 'NH3',  formula: 'NH3',  name: 'Ammonia', central: 'N', ligand: 'H', bonds: 3, lone: 1, geometry: 'trigonal pyramidal', angle: '107°', polar: true },
  { key: 'PCl3', formula: 'PCl3', name: 'Phosphorus trichloride', central: 'P', ligand: 'Cl', bonds: 3, lone: 1, geometry: 'trigonal pyramidal', angle: '≈100°', polar: true },
  { key: 'CH4',  formula: 'CH4',  name: 'Methane', central: 'C', ligand: 'H', bonds: 4, lone: 0, geometry: 'tetrahedral', angle: '109.5°', polar: false },
  { key: 'CCl4', formula: 'CCl4', name: 'Carbon tetrachloride', central: 'C', ligand: 'Cl', bonds: 4, lone: 0, geometry: 'tetrahedral', angle: '109.5°', polar: false }
];

export const GEOMETRIES = ['linear', 'bent', 'trigonal planar', 'trigonal pyramidal', 'tetrahedral'];

// ---- C.7(D): activity comparison model ----
// These are representative patterns for the simulation, not universal definitions.
export const SUBSTANCE_TYPES = [
  {
    type: 'Ionic', example: 'NaCl (sodium chloride)', intra: 'electrostatic attraction between ions',
    mp: 'often high; NaCl: 801 °C', conduct: 'not as a solid; conducts when molten or when dissolved ions are mobile',
    heat: 'remains solid during this activity heat test',
    note: 'Ions are fixed in a crystal lattice when solid. Mobile ions can carry charge when molten or in solution.'
  },
  {
    type: 'Covalent molecular', example: 'sucrose (table sugar)', intra: 'covalent bonds within molecules',
    mp: 'often lower than ionic/network solids', conduct: 'usually a poor conductor',
    heat: 'softens, melts, or decomposes during this activity heat test',
    note: 'Discrete molecules are attracted by intermolecular forces. Melting behavior varies with molecular structure and intermolecular forces.'
  },
  {
    type: 'Covalent network', example: 'SiO2 (quartz)', intra: 'covalent bonds throughout a network',
    mp: 'usually very high', conduct: 'often a poor conductor; graphite is an important exception',
    heat: 'remains solid during this activity heat test',
    note: 'Atoms are connected through an extended covalent network. Properties vary among different network solids.'
  },
  {
    type: 'Metallic', example: 'Cu (copper)', intra: 'metallic bonding',
    mp: 'varies; many are moderate to high', conduct: 'usually conducts well as a solid',
    heat: 'remains solid during this activity heat test',
    note: 'Delocalized electrons help explain electrical and thermal conductivity; nondirectional metallic bonding helps explain malleability and ductility.'
  }
];

// Honors: strongest intermolecular force from the three listed choices.
export const IMF_TYPES = ['London dispersion', 'Dipole-dipole', 'Hydrogen bonding'];
export const IMF_EXAMPLES = [
  { formula: 'CH4', imf: 'London dispersion', why: 'nonpolar; dispersion forces are the only intermolecular force listed here', where: 'the methane supplied to the gas ring' },
  { formula: 'CO2', imf: 'London dispersion', why: 'nonpolar overall even though each C=O bond is polar', where: 'the carbon-dioxide cartridge in the drink maker' },
  { formula: 'C3H8', imf: 'London dispersion', why: 'nonpolar; dispersion forces dominate among these choices', where: 'the propane reference sample' },
  { formula: 'HCl', imf: 'Dipole-dipole', why: 'polar molecule with no H bonded to N, O, or F', where: 'the hydrogen-chloride reference sample' },
  { formula: 'SO2', imf: 'Dipole-dipole', why: 'bent and polar, with no hydrogen-bond donor', where: 'the sulfur-dioxide reference sample' },
  { formula: 'H2O', imf: 'Hydrogen bonding', why: 'H is bonded directly to O, and O has lone pairs', where: 'the glass of ice water on the counter' },
  { formula: 'NH3', imf: 'Hydrogen bonding', why: 'H is bonded directly to N, and N has a lone pair', where: 'the ammonia example from the cleaning shelf' },
  { formula: 'C2H5OH', imf: 'Hydrogen bonding', why: 'the O–H group allows molecules to hydrogen bond to one another', where: 'the ethanol in rubbing alcohol' }
];

export const BOND_PAIRS = [
  { a: 'K', b: 'Br', where: 'the salt-substitute reference sample' },
  { a: 'Ca', b: 'O', where: 'the lime reference sample' },
  { a: 'Na', b: 'Cl', where: 'the white jar by the stove' },
  { a: 'O', b: 'H', where: 'the water in the sink trap' },
  { a: 'N', b: 'H', where: 'the ammonia reference sample' },
  { a: 'C', b: 'Cl', where: 'the old spot-remover reference' },
  { a: 'H', b: 'S', where: 'the hydrogen-sulfide reference sample' },
  { a: 'C', b: 'H', where: 'the candle-wax reference sample' }
];

// Current Texas Chemistry TEKS C.7(A-D), with compact internal IDs for mastery tracking.
export const SE = [
  { id: 'a', code: 'C.7(A)', mode: 'bond', honors: false, text: 'Construct an argument to support how periodic trends such as electronegativity can predict bonding between elements.' },
  { id: 'b', code: 'C.7(B)', mode: 'name', honors: false, text: 'Name and write the chemical formulas for ionic and covalent compounds using IUPAC nomenclature rules.' },
  { id: 'c', code: 'C.7(C)', mode: 'geometry', honors: false, text: 'Classify and draw electron dot structures for molecules with linear, bent, trigonal planar, trigonal pyramidal, and tetrahedral molecular geometries using VSEPR theory.' },
  { id: 'd', code: 'C.7(D)', mode: 'forces', honors: false, text: 'Analyze properties of ionic, covalent, and metallic substances in terms of intramolecular and intermolecular forces.' },
  { id: 'h1', code: 'Honors', mode: 'bond', honors: true, text: 'Estimate percent ionic character and place a bond on the ionic-covalent continuum.' },
  { id: 'h2', code: 'Honors', mode: 'geometry', honors: true, text: 'Determine molecular polarity from bond dipoles and molecular geometry.' },
  { id: 'h3', code: 'Honors', mode: 'forces', honors: true, text: 'Identify the strongest intermolecular force from the choices provided.' }
];

// ---- Scenario layer ----
export const SCENARIOS = [
  // C.7(A)
  { id: 'a-white-jar', stage: 'bond', skill: 'a', type: 'decision',
    system: 'The white jar', icon: '\u{1F9C2}',
    goal: 'Two symbols remain on the label: Na and Cl. Use the elements and their electronegativities to classify the bonding.',
    why: 'Bond type helps explain structure, melting behavior, and conductivity. It does not by itself establish whether an unknown substance is safe to use.',
    constraints: { a: 'Na', b: 'Cl' },
    consequences: {
      'ionic': 'Supported. Sodium is a metal and chlorine is a nonmetal, and their large electronegativity difference is consistent with ionic bonding. In solid NaCl, Na+ and Cl− ions occupy a crystal lattice; mobile ions can carry current when molten or dissolved.',
      'polar covalent': 'Recheck the element types and electronegativity difference. A metal–nonmetal pair such as Na and Cl is modeled as ionic in this activity, not as a discrete polar molecule.',
      'nonpolar covalent': 'Recheck the electronegativity difference. Na and Cl do not share bonding electrons nearly equally, so nonpolar covalent is not supported.',
      'metallic': 'Metallic bonding applies to metals bonded within a metallic solid. Chlorine is a nonmetal, so metallic bonding is not supported for Na–Cl.'
    } },
  { id: 'a-lamp-cord', stage: 'bond', skill: 'a', type: 'decision',
    system: 'The lamp cord', icon: '\u{1F4A1}',
    goal: 'The damaged cord exposes copper. Classify the bonding that holds a piece of copper metal together.',
    why: 'Metallic bonding helps explain why copper conducts electricity and can bend without shattering. Electrical safety is a separate issue: a damaged cord should remain unplugged until properly repaired or replaced.',
    constraints: { a: 'Cu', b: 'Cu' },
    consequences: {
      'metallic': 'Supported. Copper atoms form a metallic solid with delocalized valence electrons. That model helps explain copper’s electrical conductivity and ductility. The damaged cord still remains unplugged until properly repaired or replaced.',
      'ionic': 'Ionic bonding requires oppositely charged ions. A sample of elemental copper is a metallic solid, so the ionic model does not fit.',
      'polar covalent': 'A polar covalent bond describes unequal sharing between bonded atoms. Elemental copper is better described by metallic bonding with delocalized electrons.',
      'nonpolar covalent': 'Nonpolar covalent bonding describes shared electron pairs in covalent species. Bulk copper is a metallic solid, not a molecular covalent substance.'
    } },
  { id: 'a-gas-ring', stage: 'bond', skill: 'a', type: 'decision',
    system: 'The gas ring', icon: '\u{1F525}',
    goal: 'Methane contains C–H bonds. Use the electronegativity difference to classify a C–H bond in this activity.',
    why: 'The C–H electronegativity difference is small. Bond type is only one part of methane’s behavior; molecular geometry, intermolecular forces, temperature, and pressure also matter.',
    constraints: { a: 'C', b: 'H' },
    consequences: {
      'nonpolar covalent': 'Supported by this activity guide. Carbon and hydrogen have a small electronegativity difference, so the C–H bond is treated as essentially nonpolar covalent here. Methane is also tetrahedral and nonpolar overall.',
      'polar covalent': 'The C–H bond has only a small electronegativity difference. In this activity it is classified as essentially nonpolar covalent rather than polar covalent.',
      'ionic': 'Carbon and hydrogen are both nonmetals, and their electronegativity difference is far too small for the activity’s ionic classification.',
      'metallic': 'Neither carbon nor hydrogen forms a metallic bond in methane. Methane is a molecular covalent substance.'
    } },
  { id: 'a-tap-water', stage: 'bond', skill: 'a', type: 'decision',
    system: 'The kitchen tap', icon: '\u{1F6B0}',
    goal: 'Water contains O–H bonds. Use electronegativity to classify an O–H bond.',
    why: 'Bond polarity contributes to water’s molecular polarity, but geometry matters too. The bent shape prevents the two O–H bond dipoles from canceling.',
    constraints: { a: 'O', b: 'H' },
    consequences: {
      'polar covalent': 'Supported. Oxygen attracts the shared electrons more strongly than hydrogen, so O carries a partial negative charge and H a partial positive charge. Because H2O is bent, its bond dipoles do not cancel and the molecule is polar.',
      'nonpolar covalent': 'The O–H electronegativity difference is substantial, so the electrons are not shared nearly equally. Polar covalent is the better classification.',
      'ionic': 'The O–H bond in a water molecule is covalent, not ionic. The electrons are shared unequally rather than transferred to form an ionic lattice.',
      'metallic': 'Oxygen and hydrogen are nonmetals. Metallic bonding does not describe the O–H bond in water.'
    } },

  // C.7(B)
  { id: 'b-hallway-alarm', stage: 'name', skill: 'b', type: 'identity',
    system: 'The hallway alarm', icon: '\u{1F6A8}',
    goal: 'The alarm is labeled CO, while the boiler information mentions CO2. Match each formula with the correct compound name.',
    why: 'Carbon monoxide and carbon dioxide are different substances. Carbon monoxide is toxic because it interferes with oxygen transport in blood, so the names and formulas must not be confused.',
    constraints: { formula: 'CO', distractors: ['CO2', 'SO2', 'SO3'] },
    success: 'Correct. CO is carbon monoxide: the second element uses the prefix mono- for one oxygen. CO2 is carbon dioxide, with two oxygen atoms.',
    fail: 'Recheck the oxygen subscript and the covalent prefix. CO and CO2 represent different compounds with different properties.' },
  { id: 'b-deicer', stage: 'name', skill: 'b', type: 'identity',
    system: 'The de-icer sack', icon: '\u{2744}\u{FE0F}',
    goal: 'The de-icer formula is CaCl2. Determine its name before the container is relabeled.',
    why: 'Clear chemical labels prevent mix-ups. For a binary ionic compound, name the metal first and change the nonmetal ending to -ide.',
    constraints: { formula: 'CaCl2', distractors: ['CCl4', 'AlF3', 'NaCl'] },
    success: 'Correct. CaCl2 is calcium chloride. Binary ionic names do not use prefixes to show the subscripts.',
    fail: 'Recheck whether the first element is a metal. Calcium is a metal, so use binary ionic naming rather than covalent prefixes.' },
  { id: 'b-pantry', stage: 'name', skill: 'b', type: 'identity',
    system: 'The pantry relabel', icon: '\u{1F3F7}\u{FE0F}',
    goal: 'Several containers lost part of their labels during the move. Use the formula or name provided to restore the missing information.',
    why: 'A correct chemical label communicates identity without opening or testing the container.',
    success: 'Correct. The restored name and formula match, so the label communicates the compound’s identity clearly.',
    fail: 'The name and formula do not match. Recheck whether the compound is ionic or covalent, then apply the appropriate naming rule.' },

  // C.7(C)
  { id: 'c-ice-water', stage: 'geometry', skill: 'c', type: 'identity',
    system: 'The glass of ice water', icon: '\u{1F9CA}',
    goal: 'Rotate H2O and classify its molecular geometry from the two O–H bonds and two lone pairs on oxygen.',
    why: 'Water’s bent geometry makes the molecule polar. Hydrogen bonding between polar water molecules then helps form the open crystal lattice that makes ice less dense than liquid water.',
    constraints: { molKey: 'H2O' },
    success: 'Correct. Oxygen has four electron domains: two bonding domains and two lone pairs. The electron-domain geometry is tetrahedral, while the molecular geometry is bent, with an H–O–H angle of about 104.5°.',
    fail: 'Count both bonding domains and lone-pair domains around oxygen. Four electron domains with two lone pairs produce a bent molecular geometry.' },
  { id: 'c-cleaning-shelf', stage: 'geometry', skill: 'c', type: 'identity',
    system: 'The cleaning shelf', icon: '\u{1F9F4}',
    goal: 'Rotate NH3 and classify its molecular geometry from three N–H bonds and one lone pair on nitrogen.',
    why: 'The lone pair affects both shape and reactivity. Ammonia is a Lewis base because the nitrogen lone pair can be donated to form a bond, such as when NH3 accepts H+ to form NH4+.',
    constraints: { molKey: 'NH3' },
    success: 'Correct. Four electron domains surround nitrogen: three bonding domains and one lone pair. The electron-domain geometry is tetrahedral, but the molecular geometry is trigonal pyramidal, with an H–N–H angle near 107°.',
    fail: 'Do not treat the lone pair as empty space. It occupies an electron domain and changes the molecular geometry from trigonal planar to trigonal pyramidal.' },
  { id: 'c-gas-ring-shape', stage: 'geometry', skill: 'c', type: 'identity',
    system: 'What burns on the ring', icon: '\u{1F373}',
    goal: 'Methane has four C–H bonds and no lone pairs on carbon. Rotate CH4 and classify its molecular geometry.',
    why: 'Four bonding domains arrange themselves to minimize repulsion. The tetrahedral symmetry also causes the four C–H bond dipoles to cancel.',
    constraints: { molKey: 'CH4' },
    success: 'Correct. Four bonding domains point toward the corners of a tetrahedron, giving bond angles of about 109.5°. With four identical bonds arranged symmetrically, CH4 is nonpolar overall.',
    fail: 'A flat cross would not maximize separation among four electron domains. The four C–H bonds arrange tetrahedrally in three dimensions.' },
  { id: 'c-extinguisher', stage: 'geometry', skill: 'c', type: 'identity',
    system: 'The extinguisher in the hall', icon: '\u{1F9EF}',
    goal: 'Carbon dioxide has two electron domains around carbon and no lone pairs on the central atom. Rotate CO2 and classify its molecular geometry.',
    why: 'Each C=O bond is polar, but molecular geometry determines whether the bond dipoles add or cancel.',
    constraints: { molKey: 'CO2' },
    success: 'Correct. Two electron domains point 180° apart, so CO2 is linear. The two equal C=O bond dipoles point in opposite directions and cancel, making the molecule nonpolar overall.',
    fail: 'With two electron domains and no lone pairs on carbon, the domains point 180° apart. CO2 is linear, not bent.' },

  // C.7(D)
  { id: 'd-dry-pan', stage: 'forces', skill: 'd', type: 'decision',
    system: 'The simulated heat test', tag: 'white solid', icon: '\u{1F373}',
    goal: 'The activity record shows a white solid that remains solid during heating. When a small supplied sample is dissolved in water, the solution conducts. Choose the best-matching solid type from the activity table.',
    why: 'Use both observations together. High thermal stability in this model plus mobile charged particles in solution is consistent with an ionic solid.',
    constraints: { answer: 'Ionic',
      melt: 'simulation heat test: remains solid; no visible change',
      conduct: 'supplied aqueous sample: conductivity meter reads current' },
    consequences: {
      'Ionic': 'Supported by the activity model. Ionic solids often have high melting points, and an ionic substance can conduct when dissolved if its ions are free to move. These observations classify the solid type; they do not identify the exact compound or establish that it is safe to use.',
      'Covalent molecular': 'The supplied observations do not best match the molecular example in this activity. Recheck the combination of heat behavior and conductivity of the aqueous sample.',
      'Covalent network': 'Network solids can remain solid at high temperature, but the activity record says the dissolved sample conducts. That points to mobile ions rather than the network example.',
      'Metallic': 'A metallic solid should conduct in the solid state. Here the key conductivity observation is for the dissolved sample, which better matches the ionic model.'
    } },
  { id: 'd-bulb-battery', stage: 'forces', skill: 'd', type: 'decision',
    system: 'The conductivity test', tag: 'gray sample', icon: '\u{1F50B}',
    goal: 'A gray solid conducts electricity while dry and deforms under a simulated hammer test instead of shattering. Choose the best-matching solid type.',
    why: 'Electrical conductivity in the solid state and malleability are characteristic properties explained by metallic bonding.',
    constraints: { answer: 'Metallic',
      melt: 'simulation deformation test: dents and spreads without shattering',
      conduct: 'dry solid: conductivity circuit reads current' },
    consequences: {
      'Metallic': 'Supported. Delocalized electrons explain conductivity in the solid state, and nondirectional metallic bonding allows layers of metal atoms to shift without the crystal shattering.',
      'Ionic': 'Solid ionic crystals are typically brittle and do not conduct because their ions are fixed in place. The supplied observations better match a metallic solid.',
      'Covalent molecular': 'Molecular solids are generally poor electrical conductors. The dry conductivity result points away from the molecular example.',
      'Covalent network': 'Many network solids are hard and poor electrical conductors. The combination of dry conductivity and malleability better matches metallic bonding.'
    } },
  { id: 'd-drop-test', stage: 'forces', skill: 'd', type: 'decision',
    system: 'The simulated drop test', tag: 'clear sample', icon: '\u{1FA9F}',
    goal: 'The activity record shows a hard, brittle clear solid that does not soften during the heat test and does not conduct in the tested states. Choose the best-matching solid type.',
    why: 'Among the four activity models, a hard, brittle, high-melting, nonconducting sample best matches a covalent-network solid such as quartz.',
    constraints: { answer: 'Covalent network',
      melt: 'simulation heat test: no softening',
      conduct: 'dry and in the supplied test medium: no current' },
    consequences: {
      'Covalent network': 'Supported by the activity model. An extended covalent network can be very hard and have a very high melting point. Many network solids are poor conductors, although important exceptions such as graphite exist.',
      'Covalent molecular': 'The activity’s molecular example is expected to soften, melt, or decompose more readily. The supplied sample remains hard and unchanged under the heat test.',
      'Ionic': 'The activity record does not show the conductivity behavior expected for the soluble ionic example. The hard, nonconducting, high-melting pattern better matches the network model.',
      'Metallic': 'The sample is brittle and nonconducting in the dry test. Those observations do not match the metallic model used here.'
    } },
  { id: 'd-sugar-pan', stage: 'forces', skill: 'd', type: 'decision',
    system: 'The second white sample', tag: 'sample two', icon: '\u{1F36F}',
    goal: 'The simulation record shows a white sample that softens and browns on heating. A supplied aqueous sample does not conduct. Choose the best-matching solid type.',
    why: 'In this activity, the observations match a molecular substance such as sucrose: neutral molecules and relatively weaker attractions between molecules than in ionic or network solids.',
    constraints: { answer: 'Covalent molecular',
      melt: 'simulation heat test: softens, browns, and caramelizes',
      conduct: 'supplied aqueous sample: conductivity meter reads no current' },
    consequences: {
      'Covalent molecular': 'Supported by the activity model. Sucrose is a molecular covalent substance; heating causes melting and decomposition reactions, while dissolved sucrose remains as neutral molecules and its solution conducts poorly.',
      'Ionic': 'The nonconducting aqueous sample and the lower-temperature softening/decomposition do not match the ionic example in this activity.',
      'Covalent network': 'An extended covalent network would not soften this readily under the activity heat test. The observations better match a molecular solid.',
      'Metallic': 'A metallic sample would conduct while dry and would not caramelize. The observations do not match metallic bonding.'
    } },

  // Honors: percent ionic character
  { id: 'h1-percent-ionic', stage: 'bond', skill: 'h1', type: 'decision',
    system: 'Ionic character estimate', icon: '\u{2696}\u{FE0F}',
    goal: 'Use the electronegativity difference and the Pauling expression to estimate percent ionic character, then place the bond in the activity band.',
    why: 'Bonding lies on a continuum. The 0.4 and 1.7 cutoffs used in this simulation are teaching guidelines, not universal boundaries, and percent ionic character does not by itself predict solubility.',
    consequences: {
      'ionic': 'This activity band represents the larger ionic-character estimates. The estimate describes how unevenly bonding electron density is distributed; it is not a stand-alone prediction of solubility or disposal behavior.',
      'polar': 'This activity band represents an intermediate electronegativity difference and unequal sharing of electron density in a polar covalent bond.',
      'nonpolar': 'This activity band represents a small electronegativity difference and nearly even sharing of electron density.'
    },
    success: 'Correct. Your band agrees with the percent ionic-character estimate for this electronegativity difference.',
    fail: 'Recalculate the electronegativity difference and percent ionic character, then compare the result with the activity bands.' },

  // Honors: molecular polarity
  { id: 'h2-polarity', stage: 'geometry', skill: 'h2', type: 'decision',
    system: 'Molecular polarity', icon: '\u{1F4A7}',
    goal: 'Use bond dipoles and molecular geometry to determine whether the molecule has a net dipole.',
    why: 'Molecular polarity can influence properties such as solubility and intermolecular attraction, but it is not the only factor that controls them.',
    consequences: {
      'polar': 'A polar classification means the vector sum of the bond dipoles is not zero, so the molecule has a net molecular dipole.',
      'nonpolar': 'A nonpolar classification means the bond-dipole vectors cancel, or the individual bonds are essentially nonpolar, so the molecule has no net dipole.'
    },
    success: 'Correct. The molecular geometry gives the correct vector sum of the bond dipoles.',
    fail: 'Recheck the molecular geometry and the directions of the bond dipoles. Symmetric arrangements of identical bond dipoles can cancel; asymmetric arrangements may not.' },

  // Honors: intermolecular forces
  { id: 'h3-imf', stage: 'forces', skill: 'h3', type: 'decision',
    system: 'Intermolecular forces', icon: '\u{1F517}',
    goal: 'Identify the strongest intermolecular force from the three listed choices for the molecular substance shown.',
    why: 'Intermolecular forces influence boiling point, but molecular size, polarizability, and shape matter too. Comparisons are most useful when those other factors are similar.',
    consequences: {
      'London dispersion': 'London dispersion forces act between all atoms and molecules. For the nonpolar examples in this activity, dispersion is the strongest intermolecular force listed.',
      'Dipole-dipole': 'Polar molecules attract through permanent partial charges. Dipole-dipole attraction is present in addition to London dispersion forces.',
      'Hydrogen bonding': 'When H is bonded to N, O, or F and an appropriate lone pair is available on a neighboring molecule, hydrogen bonding can occur. London dispersion forces are still present as well.'
    },
    success: 'Correct. You identified the strongest intermolecular force listed for this molecule.',
    fail: 'Recheck molecular polarity and whether H is bonded directly to N, O, or F. Remember that London dispersion forces are always present.' },

  // Capstone
  { id: 'cap-underthesink', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'The last bottle', icon: '\u{1F9F9}',
    goal: 'Use the supplied reference record, bonding evidence, and property data to classify the last container and choose the activity’s supported handling category.',
    why: 'This is a simulation, not a procedure for testing unknown household chemicals. In real life, keep unknown chemicals closed and use the original label, SDS, manufacturer information, or local hazardous-waste guidance.',
    options: [
      { key: 'keep', label: 'Keep it in labeled storage.',
        good: 'The supplied reference information supports labeled storage. Keep the material in an appropriate labeled container and follow its handling information.',
        consequence: 'The supplied reference information supports keeping this material in labeled storage, so another disposal category is not supported.' },
      { key: 'drain', label: 'Use the approved nonhazardous disposal route in the activity.',
        good: 'The supplied reference information lists an approved nonhazardous disposal route for this activity. Real disposal must still follow the product label and local rules.',
        consequence: 'The supplied reference information does not support the activity’s nonhazardous disposal route for this material.' },
      { key: 'haz', label: 'Use local household hazardous-waste collection.',
        good: 'The supplied reference information identifies a reactive or toxic material. Household hazardous-waste collection is the supported category.',
        consequence: 'The supplied reference information does not classify this material for the hazardous-waste category used in the activity.' }
    ] }
];
