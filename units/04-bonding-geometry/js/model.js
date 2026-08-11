// model.js: Unit 4 domain data (Bonding, Nomenclature & Geometry, TEKS C.7).
// Pure data plus the standards map. Electronegativity and the bond rule live in
// shared/js/chem.js; this file holds the pools each stage draws from and the scenario
// fiction that turns every call into a consequence.
//
// World: "Move-In Week". It is your first apartment. The last tenant left a shelf of
// unlabeled bottles under the kitchen sink and mystery jars in the kitchen, and nothing
// gets used, mixed, cooked with, or poured away until you know what holds it together.

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

// ---- C.7(B): nomenclature library (formula in mhchem, IUPAC name) ----
// Scenario-layer additions, all additive: `where` puts the compound somewhere in the
// apartment, and `disposal` ('keep' | 'drain' | 'haz') is the one defensible call for it
// at the end of the week. The six flagged `sink: true` are the ones that plausibly sit in
// a container under a kitchen sink, so the capstone draws its unlabeled bottle from those;
// each of those also carries a `clue`, the observation that settles the disposal call.
export const COMPOUNDS = [
  // binary ionic (On-Level)
  { formula: 'NaCl', name: 'sodium chloride', cat: 'Binary ionic', honors: false,
    where: 'the white jar by the stove', disposal: 'keep', sink: true,
    clue: 'a few crystals on the tongue are unmistakably salt, and a spoonful dissolves clear' },
  { formula: 'MgO', name: 'magnesium oxide', cat: 'Binary ionic', honors: false,
    where: 'the white powder in the first aid tin', disposal: 'keep', sink: true,
    clue: 'it hardly dissolves at all, and a spoonful in water settles back out as a chalky slurry' },
  { formula: 'CaCl2', name: 'calcium chloride', cat: 'Binary ionic', honors: false,
    where: 'the split de-icer sack on the porch', disposal: 'drain', sink: true,
    clue: 'the flakes pull water straight out of the air, and the jar warms in your hand as they dissolve' },
  { formula: 'K2O', name: 'potassium oxide', cat: 'Binary ionic', honors: false,
    where: 'an unlabeled tin from the hall closet', disposal: 'haz', sink: true,
    clue: 'one drop of water on it hisses, and the wet spot turns soapy enough to burn skin' },
  { formula: 'AlF3', name: 'aluminum fluoride', cat: 'Binary ionic', honors: false,
    where: 'a supplier sack nobody can explain', disposal: 'haz' },
  { formula: 'Na2S', name: 'sodium sulfide', cat: 'Binary ionic', honors: false,
    where: 'the dark jar at the back of the cupboard', disposal: 'haz', sink: true,
    clue: 'a single drop of vinegar on it and the whole room smells of rotten eggs' },
  // binary covalent prefixes (On-Level)
  { formula: 'CO2', name: 'carbon dioxide', cat: 'Binary covalent', honors: false,
    where: 'the cartridge in the fizzy drink maker', disposal: 'keep' },
  { formula: 'CO', name: 'carbon monoxide', cat: 'Binary covalent', honors: false,
    where: 'what the hallway alarm is listening for', disposal: 'haz' },
  { formula: 'SO2', name: 'sulfur dioxide', cat: 'Binary covalent', honors: false,
    where: 'the wine preservative in the pantry', disposal: 'haz' },
  { formula: 'SO3', name: 'sulfur trioxide', cat: 'Binary covalent', honors: false,
    where: 'a fume nobody wants in an apartment', disposal: 'haz' },
  { formula: 'CCl4', name: 'carbon tetrachloride', cat: 'Binary covalent', honors: false,
    where: 'the old spot remover under the sink', disposal: 'haz', sink: true,
    clue: 'a heavy clear liquid that will not mix with water and smells faintly sweet' },
  // polyatomic ionic (Honors)
  { formula: 'CaCO3', name: 'calcium carbonate', cat: 'Ionic + polyatomic', honors: true,
    where: 'the limescale ring in the kettle', disposal: 'drain' },
  { formula: 'Na2SO4', name: 'sodium sulfate', cat: 'Ionic + polyatomic', honors: true,
    where: 'the powder in the old detergent box', disposal: 'drain' },
  { formula: 'NH4Cl', name: 'ammonium chloride', cat: 'Ionic + polyatomic', honors: true,
    where: 'the salty liquorice tin somebody left behind', disposal: 'drain' },
  { formula: 'KNO3', name: 'potassium nitrate', cat: 'Ionic + polyatomic', honors: true,
    where: 'the plant food on the balcony shelf', disposal: 'drain' },
  { formula: 'Mg(OH)2', name: 'magnesium hydroxide', cat: 'Ionic + polyatomic', honors: true,
    where: 'the antacid bottle in the bathroom', disposal: 'keep' },
  { formula: 'Ca3(PO4)2', name: 'calcium phosphate', cat: 'Ionic + polyatomic', honors: true,
    where: 'the bone meal for the balcony pots', disposal: 'keep' },
  // transition-metal Stock system (Honors)
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
  // larger covalent prefixes (Honors)
  { formula: 'N2O', name: 'dinitrogen monoxide', cat: 'Binary covalent', honors: true,
    where: 'the charger for the whipped cream siphon', disposal: 'keep' },
  { formula: 'P4O10', name: 'tetraphosphorus decoxide', cat: 'Binary covalent', honors: true,
    where: 'the drying agent sachet in the toolbox', disposal: 'haz' },
  { formula: 'PCl5', name: 'phosphorus pentachloride', cat: 'Binary covalent', honors: true,
    where: 'a lab bottle nobody can explain', disposal: 'haz' }
];

// ---- C.7(C): VSEPR molecules. Geometry drives the 3D layout in vsepr.js ----
// geometry ∈ linear | bent | trigonal planar | trigonal pyramidal | tetrahedral
export const MOLECULES = [
  { key: 'CO2',  formula: 'CO2',  name: 'Carbon dioxide',    central: 'C',  ligand: 'O',  bonds: 2, lone: 0, geometry: 'linear',             angle: '180°',   polar: false },
  { key: 'BeF2', formula: 'BeF2', name: 'Beryllium fluoride', central: 'Be', ligand: 'F',  bonds: 2, lone: 0, geometry: 'linear',             angle: '180°',   polar: false },
  { key: 'SO2',  formula: 'SO2',  name: 'Sulfur dioxide',    central: 'S',  ligand: 'O',  bonds: 2, lone: 1, geometry: 'bent',               angle: '≈119°',  polar: true },
  { key: 'H2O',  formula: 'H2O',  name: 'Water',             central: 'O',  ligand: 'H',  bonds: 2, lone: 2, geometry: 'bent',               angle: '104.5°', polar: true },
  { key: 'BF3',  formula: 'BF3',  name: 'Boron trifluoride', central: 'B',  ligand: 'F',  bonds: 3, lone: 0, geometry: 'trigonal planar',    angle: '120°',   polar: false },
  { key: 'NH3',  formula: 'NH3',  name: 'Ammonia',           central: 'N',  ligand: 'H',  bonds: 3, lone: 1, geometry: 'trigonal pyramidal', angle: '107°',   polar: true },
  { key: 'PCl3', formula: 'PCl3', name: 'Phosphorus trichloride', central: 'P', ligand: 'Cl', bonds: 3, lone: 1, geometry: 'trigonal pyramidal', angle: '≈100°', polar: true },
  { key: 'CH4',  formula: 'CH4',  name: 'Methane',           central: 'C',  ligand: 'H',  bonds: 4, lone: 0, geometry: 'tetrahedral',        angle: '109.5°', polar: false },
  { key: 'CCl4', formula: 'CCl4', name: 'Carbon tetrachloride', central: 'C', ligand: 'Cl', bonds: 4, lone: 0, geometry: 'tetrahedral',      angle: '109.5°', polar: false }
];

export const GEOMETRIES = ['linear', 'bent', 'trigonal planar', 'trigonal pyramidal', 'tetrahedral'];

// ---- C.7(D): substance types, properties, and intermolecular forces ----
export const SUBSTANCE_TYPES = [
  {
    type: 'Ionic', example: 'NaCl (table salt)', intra: 'ionic bonds',
    mp: 'high (801 °C)', conduct: 'conducts when molten or dissolved, not as a solid',
    note: 'A rigid lattice of cations and anions held by strong electrostatic attraction.'
  },
  {
    type: 'Covalent molecular', example: 'CO₂ (dry ice)', intra: 'covalent bonds',
    mp: 'low', conduct: 'does not conduct',
    note: 'Discrete molecules held to each other only by weak intermolecular forces.'
  },
  {
    type: 'Covalent network', example: 'SiO₂ (quartz)', intra: 'covalent bonds',
    mp: 'very high', conduct: 'does not conduct (generally)',
    note: 'One continuous covalent lattice, so melting means breaking covalent bonds.'
  },
  {
    type: 'Metallic', example: 'Cu (copper)', intra: 'metallic bonds',
    mp: 'high', conduct: 'conducts as a solid and when molten',
    note: 'Cations in a sea of delocalized electrons, which carry charge and heat.'
  }
];

// Honors: dominant intermolecular force per molecular substance (weakest → strongest).
// `where` puts each one somewhere in the apartment; the last two are new.
export const IMF_TYPES = ['London dispersion', 'Dipole-dipole', 'Hydrogen bonding'];
export const IMF_EXAMPLES = [
  { formula: 'CH4', imf: 'London dispersion', why: 'nonpolar, so only temporary induced dipoles', where: 'the gas ring in the kitchen' },
  { formula: 'CO2', imf: 'London dispersion', why: 'nonpolar overall despite polar bonds', where: 'the cartridge in the fizzy drink maker' },
  { formula: 'C3H8', imf: 'London dispersion', why: 'a nonpolar chain, so only temporary induced dipoles', where: 'the camping stove cylinder on the balcony' },
  { formula: 'HCl', imf: 'Dipole-dipole', why: 'polar molecule, no H on N/O/F', where: 'the tile cleaner in the bathroom' },
  { formula: 'SO2', imf: 'Dipole-dipole', why: 'bent and polar, no H-bonding', where: 'the wine preservative in the pantry' },
  { formula: 'H2O', imf: 'Hydrogen bonding', why: 'H bonded directly to O', where: 'the glass of ice water on the counter' },
  { formula: 'NH3', imf: 'Hydrogen bonding', why: 'H bonded directly to N', where: 'the window cleaner under the sink' },
  { formula: 'C2H5OH', imf: 'Hydrogen bonding', why: 'an O-H group, so the molecules hydrogen bond to each other', where: 'the rubbing alcohol in the bathroom cabinet' }
];

// Honors h1 pool: two element symbols off a label, and where that bottle actually sits.
// The percent ionic character is computed from the real electronegativity gap, so nothing
// here is authored: the answer follows from the engine.
export const BOND_PAIRS = [
  { a: 'K',  b: 'Br', where: 'the salt substitute in the pantry' },
  { a: 'Ca', b: 'O',  where: 'the lime crust inside the kettle' },
  { a: 'Na', b: 'Cl', where: 'the white jar by the stove' },
  { a: 'O',  b: 'H',  where: 'the water standing in the sink trap' },
  { a: 'N',  b: 'H',  where: 'the window cleaner under the sink' },
  { a: 'C',  b: 'Cl', where: 'the old spot remover under the sink' },
  { a: 'H',  b: 'S',  where: 'the smell coming back up the drain' },
  { a: 'C',  b: 'H',  where: 'the candle wax on the windowsill' }
];

// Standards map. Stable ids key the mastery meters in the right rail; the three honors
// rows each hang off a different core skill (h1 off bond, h2 off geometry, h3 off forces).
export const SE = [
  { id: 'a',  code: 'C.7(A)', mode: 'bond',     honors: false, text: 'Argue how electronegativity trends predict bonding between elements.' },
  { id: 'b',  code: 'C.7(B)', mode: 'name',     honors: false, text: 'Name and write formulas for ionic and covalent compounds (IUPAC).' },
  { id: 'c',  code: 'C.7(C)', mode: 'geometry', honors: false, text: 'Classify and draw VSEPR geometries: linear, bent, trigonal planar/pyramidal, tetrahedral.' },
  { id: 'd',  code: 'C.7(D)', mode: 'forces',   honors: false, text: 'Relate properties of ionic, covalent, and metallic substances to their forces.' },
  { id: 'h1', code: 'Honors', mode: 'bond',     honors: true,  text: 'Honors: place a bond on the ionic-covalent continuum using the Pauling percent ionic character.' },
  { id: 'h2', code: 'Honors', mode: 'geometry', honors: true,  text: 'Honors: decide whether a molecule is polar overall from its shape and its bond dipoles.' },
  { id: 'h3', code: 'Honors', mode: 'forces',   honors: true,  text: 'Honors: rank the intermolecular force that dominates a molecular substance.' }
];

// SCENARIOS: the game layer for Move-In Week. One coherent world, an apartment nobody
// has cleaned out, and four kinds of call.
//   bond (C.7A):     decision. Two element symbols off a label. Name the bond that holds
//                    the thing together, and every option carries what that call does next.
//   name (C.7B):     identity. Name the compound, or write its formula, before it goes on
//                    a label somebody else will trust.
//   geometry (C.7C): identity. Rotate the molecule on the bench and classify the shape.
//   forces (C.7D):   decision. A dry pan, a bulb and a battery, a drop onto the floor.
//                    Classify the solid from what it did.
//   h1/h2/h3:        Honors percent ionic character, molecular polarity, and the dominant
//                    intermolecular force, each gated on its own parent core skill.
//   cap:             the last bottle under the sink, and what you do with it.
export const SCENARIOS = [
  // ---------- C.7(A) two element symbols, one bond ----------
  { id: 'a-white-jar', stage: 'bond', skill: 'a', type: 'decision',
    system: 'The white jar', icon: '\u{1F9C2}',
    goal: 'There is an unlabeled jar of white crystals by the stove. Before any of it goes in a pan or in food, work out what kind of bond holds it together from the two elements left on the label: sodium and chlorine.',
    why: 'What holds a solid together decides what it does in a hot pan and what it does in water. Get that wrong and you either ruin dinner or you dissolve something you should not have.',
    constraints: { a: 'Na', b: 'Cl' },
    consequences: {
      'ionic': 'Right. A metal and a nonmetal transfer electrons, so this is a lattice of ions. It will not melt in your pan, and dissolved in water it splits into ions that carry current. It is salt. It goes on the shelf, labeled.',
      'polar covalent': 'You call it a shared-electron molecule, so you treat it like sugar and drop a spoonful in a hot dry pan expecting it to melt and brown. It sits there at 200 degrees C doing nothing, because a lattice held by full charges needs 801 degrees C to break.',
      'nonpolar covalent': 'You decide the two atoms share evenly, which would mean it never splits into ions. So you write it off as a thickener, stir it into a pot, and oversalt the whole thing beyond saving.',
      'metallic': 'You call it metallic, so you expect it to bend rather than crush and to conduct dry. It does neither, and the label you write is wrong for everything that comes after it.'
    } },
  { id: 'a-lamp-cord', stage: 'bond', skill: 'a', type: 'decision',
    system: 'The lamp cord', icon: '\u{1F4A1}',
    goal: 'The lamp the last tenant left has a frayed sleeve, and under it the cord is bare: copper against copper the whole way. Work out what kind of bond holds a piece of copper together before you decide whether to tape it and plug it in.',
    why: 'What holds a metal together is also what carries the current, and it is why a cord bends instead of shattering. Expect the wrong thing and you either bin a lamp that needed tape or trust one that needed binning.',
    constraints: { a: 'Cu', b: 'Cu' },
    consequences: {
      'metallic': 'Right. Two metals pool their outer electrons into a sea that every ion shares, which is why copper bends instead of snapping and why it carries current while bone dry. The cord is sound. You tape the sleeve and the lamp goes on the shelf list.',
      'ionic': 'You call it a transfer of electrons, which would give you a brittle salt that only conducts once it is wet or molten. So you wet the contacts to make the lamp work. That is a shock, in an apartment where you do not yet know where the breaker is.',
      'polar covalent': 'You decide the atoms share unevenly, which would mean the cord cannot conduct at all. You write the lamp off as dead, cut the cord for the bin, and lose a lamp that only needed tape.',
      'nonpolar covalent': 'You call it a neutral molecular solid, which would melt at low heat and never carry a current. So you leave the bare stretch lying across the radiator, expecting nothing to happen.'
    } },
  { id: 'a-gas-ring', stage: 'bond', skill: 'a', type: 'decision',
    system: 'The gas ring', icon: '\u{1F525}',
    goal: 'The kitchen runs on gas. The line carries methane, carbon bonded to hydrogen. Work out what kind of bond that is before you decide how a leak would behave.',
    why: 'A leak behaves according to the bond. A molecular gas rises, spreads, and burns. If you expect a puddle you will be looking at the floor while the room fills.',
    constraints: { a: 'C', b: 'H' },
    consequences: {
      'nonpolar covalent': 'Right. Two nonmetals with almost no electronegativity gap share evenly, so these are neutral molecules with almost nothing holding them to each other. A leak is a gas that rises, so you open a window at the top of the room and kill every ignition source.',
      'polar covalent': 'You expect a strong partial charge, so you expect it to dissolve in the water in the sink trap and stay put. It does not. It fills the room over your head while you watch the drain.',
      'ionic': 'You call it a lattice of ions, which would be a solid you could sweep up rather than a gas at all. You spend the next ten minutes looking for a spill on the floor while the room fills above your head.',
      'metallic': 'You call it metallic, which would take two metals, and there is not one in the line. You go over the pipework hunting for corrosion instead of opening a window.'
    } },
  { id: 'a-tap-water', stage: 'bond', skill: 'a', type: 'decision',
    system: 'The kitchen tap', icon: '\u{1F6B0}',
    goal: 'First thing you do is run the tap. What comes out is water, oxygen bonded to hydrogen. Work out what kind of bond that is, because everything else in this apartment is about to be washed, dissolved, or rinsed in it.',
    why: 'Whether water can pull other things apart depends on whether its own bonds are lopsided. That one fact decides what rinses away and what sits in the trap waiting for you.',
    constraints: { a: 'O', b: 'H' },
    consequences: {
      'polar covalent': 'Right. Two nonmetals, but oxygen pulls the shared pair hard enough to leave one end of the molecule negative and the other positive. That lopsided bond is why water dissolves salts and why it beads on a greasy pan, and you can plan every clean-up in the place around it.',
      'nonpolar covalent': 'You decide oxygen and hydrogen share evenly, which would make water behave like cooking oil. You pour the salty water down the drain expecting it to sit in a layer, and you never work out why anything dissolves at all.',
      'ionic': 'You call it ionic, so you expect the tap to run a lattice that conducts on its own. Clean water barely conducts, and you spend the evening convinced the meter on the counter is broken.',
      'metallic': 'You call it metallic, which would take a metal, and neither oxygen nor hydrogen is one. You go looking for a corroded pipe that is not there while the real question goes unanswered.'
    } },

  // ---------- C.7(B) the label somebody else is going to trust ----------
  { id: 'b-hallway-alarm', stage: 'name', skill: 'b', type: 'identity',
    system: 'The hallway alarm', icon: '\u{1F6A8}',
    goal: 'The alarm bolted to the hallway ceiling says it watches for CO. A sticker on the boiler mentions CO2. A neighbour tells you they are the same thing and the alarm is decoration. Settle it: match the formula to the name.',
    why: 'One of those two is what you breathe out. The other one binds to your blood and kills people in their sleep. The prefix is the entire difference between them.',
    constraints: { formula: 'CO', distractors: ['CO2', 'SO2', 'SO3'] },
    success: 'Right. Mono means one oxygen, di means two, and the alarm watches for the one with a single oxygen. You leave it powered and put a spare battery in the drawer.',
    fail: 'You have the two of them crossed. Believe the alarm is sounding over the gas you breathe out and you will wave it off at three in the morning, which is the only hour it ever matters.' },
  { id: 'b-deicer', stage: 'name', skill: 'b', type: 'identity',
    system: 'The de-icer sack', icon: '\u{2744}\u{FE0F}',
    goal: 'A split sack on the porch says only "de-icer" and, in small print, a formula. Before you tip it into a jar and write a label, work the name out of the formula.',
    why: 'That jar is going to sit next to the cooking salt. A label that says nothing useful is how somebody ends up salting pasta with the stuff you spread on ice.',
    constraints: { formula: 'CaCl2', distractors: ['CCl4', 'AlF3', 'NaCl'] },
    success: 'Right. A metal and a nonmetal, so no prefixes: the metal keeps its name and the nonmetal takes the -ide ending, and the subscript is already fixed by the charges. The jar gets a label anyone can read.',
    fail: 'The name does not match what is in the sack. It goes on the shelf mislabeled, next to the food, and the next person to reach for it has no way to know.' },
  { id: 'b-pantry', stage: 'name', skill: 'b', type: 'identity',
    system: 'The pantry relabel', icon: '\u{1F3F7}\u{FE0F}',
    goal: 'Half the jars lost their labels in the move. You have a label maker, a pen, and a jar in your hand with half the information on the lid. Write the other half.',
    why: 'A pantry you cannot read is a pantry you cannot cook from, and some of what is in these jars was never food.',
    success: 'Right. The label goes on and the jar goes back on the shelf as something anybody in this apartment can identify without opening it.',
    fail: 'The label is wrong, which is worse than no label at all: nobody double checks a jar that already says what it is.' },

  // ---------- C.7(C) rotate it, then classify the shape ----------
  { id: 'c-ice-water', stage: 'geometry', skill: 'c', type: 'identity',
    system: 'The glass of ice water', icon: '\u{1F9CA}',
    goal: 'You fill a glass from the tap and drop ice in. The ice floats, which almost nothing else does in its own liquid. That comes down to the shape of one small molecule. Spin it on the bench and classify the shape.',
    why: 'Water is behind everything you are going to do in this kitchen. Its shape is why it dissolves the salt, why it beads on a greasy pan, and why the ice in your glass sits on top instead of on the bottom.',
    constraints: { molKey: 'H2O' },
    success: 'Right. Two bonding pairs and two lone pairs make four domains on the oxygen, and the two invisible lone pairs push the visible atoms down into a bend near 104.5 degrees. That bend is what leaves the molecule lopsided enough to dissolve salt and open enough, once frozen, to float.',
    fail: 'Call the shape wrong and you would expect water to be symmetric and to behave like oil. Nothing in this kitchen would work the way it actually does.' },
  { id: 'c-cleaning-shelf', stage: 'geometry', skill: 'c', type: 'identity',
    system: 'The cleaning shelf', icon: '\u{1F9F4}',
    goal: 'The shelf under the sink holds a bottle of window cleaner: ammonia in water, and the label warns you never to mix it with anything else. Put the ammonia molecule on the bench and classify its shape.',
    why: 'Ammonia has a lone pair sitting where a fourth atom would be. That lone pair is what makes it grab a proton, which is what makes it a cleaner, and it is why the shape it takes is not the flat one you might expect.',
    constraints: { molKey: 'NH3' },
    success: 'Right. Four domains around the nitrogen, three of them bonds and one a lone pair, so the three hydrogens are pressed down into a pyramid near 107 degrees rather than spread flat. The lone pair is doing the cleaning.',
    fail: 'You read the lone pair as empty space and flatten the molecule. A flat, symmetric ammonia would have no net dipole and would be no use to anyone as a cleaner.' },
  { id: 'c-gas-ring-shape', stage: 'geometry', skill: 'c', type: 'identity',
    system: 'What burns on the ring', icon: '\u{1F373}',
    goal: 'The methane on its way to the burner is one carbon holding four hydrogens with nothing left over. Spin it and classify the shape it takes.',
    why: 'Four identical bonds and no lone pairs is the most symmetric thing in the kitchen, and that symmetry is exactly why methane is a gas that will not dissolve in the water in your sink trap.',
    constraints: { molKey: 'CH4' },
    success: 'Right. Four bonding domains and nothing else push out to 109.5 degrees in three dimensions, which is a tetrahedron rather than a flat cross. Perfectly symmetric, so the bond dipoles cancel and the molecule is nonpolar.',
    fail: 'Draw it flat and you get the wrong angles and the wrong symmetry, which is how people end up expecting methane to dissolve in water or to pool on the floor.' },
  { id: 'c-extinguisher', stage: 'geometry', skill: 'c', type: 'identity',
    system: 'The extinguisher in the hall', icon: '\u{1F9EF}',
    goal: 'The extinguisher by the front door is carbon dioxide: one carbon, two oxygens, no lone pairs on the carbon. Put it on the bench and classify the shape.',
    why: 'Both bonds in carbon dioxide are strongly polar, yet the molecule as a whole is not. The only thing that can explain that is the shape, and the shape is why the gas spreads and smothers a fire instead of clinging to it.',
    constraints: { molKey: 'CO2' },
    success: 'Right. Two domains and no lone pairs get as far apart as they can, which is a straight line at 180 degrees. The two bond dipoles point in exactly opposite directions and cancel.',
    fail: 'Bend it and the two bond dipoles would stop cancelling, which would make carbon dioxide polar. It is not, and the straight line is the reason.' },

  // ---------- C.7(D) a dry pan, a meter, and a drop onto the tiles ----------
  { id: 'd-dry-pan', stage: 'forces', skill: 'd', type: 'decision',
    system: 'The dry pan test', tag: 'pan solid', icon: '\u{1F373}',
    goal: 'You put a spoonful of the mystery white solid in a dry pan on a low ring. It sits there. You take the ring to full and it still sits there. No melt, no brown, no smell. Then you drop a pinch in water and the meter across the glass reads current. Classify it.',
    why: 'The pan and the meter together tell you what kind of solid this is, and that tells you whether it belongs in food, down the drain, or in a bag going to the hazardous waste drop.',
    constraints: { answer: 'Ionic',
      melt: 'full heat on the ring for four minutes: no melt, no browning, no smell',
      conduct: 'a pinch dissolved in water: the meter across the glass reads current' },
    consequences: {
      'Ionic': 'Right. A lattice of ions needs enormous energy to pull apart, so it will not melt on a stove, and once the lattice comes apart in water the loose ions carry current. Safe to keep. You label the jar.',
      'Covalent molecular': 'You call it discrete molecules held by weak forces, which would have melted and browned on that ring inside a minute. It did not. You put it in a cake as sugar and the whole batch comes out salt.',
      'Covalent network': 'You call it one continuous covalent lattice, like quartz, which would not conduct dissolved. The meter says it does. You label it sand, and the next person scrubs a pan with table salt.',
      'Metallic': 'You call it a metal, which would have conducted dry in the pan with no water at all. It did not. It goes in the scrap bucket and you lose the one jar you could have used.'
    } },
  { id: 'd-bulb-battery', stage: 'forces', skill: 'd', type: 'decision',
    system: 'The bulb and battery test', tag: 'grey lump', icon: '\u{1F50B}',
    goal: 'There is a grey lump in the toolbox drawer. You touch both probes of a battery and bulb rig to it, dry, and the bulb lights straight away. You hit it with a hammer and it dents and spreads instead of shattering. Classify it.',
    why: 'If this thing conducts dry it can short something, and if it is soft enough to dent it can be flattened into a shim. Either way you need to know what it is before it goes in a drawer with the screws.',
    constraints: { answer: 'Metallic',
      melt: 'a hammer blow dents and spreads it, no cracking or shattering',
      conduct: 'dry, straight off the block: the bulb lights' },
    consequences: {
      'Metallic': 'Right. Cations in a shared sea of delocalized electrons: the electrons carry the current with no water needed, and the layers slide past each other under the hammer instead of splitting. You put it in the metal bin, labeled, and keep it for shims.',
      'Ionic': 'You call it a lattice of ions, which would only conduct once it was molten or dissolved and would have shattered under the hammer. It did neither. You drop it in a glass of water waiting for it to dissolve, and it sits there while a conducting lump goes back in the drawer unlabeled.',
      'Covalent molecular': 'You call it weakly held molecules, which would be soft and would never conduct at all. You leave a bare conductor loose in the drawer where the batteries are stored.',
      'Covalent network': 'You call it a continuous covalent lattice, like quartz, which would be hard, brittle, and an insulator. The hammer says soft and the bulb says conductor, and you have written off the one piece of metal you had.'
    } },
  { id: 'd-drop-test', stage: 'forces', skill: 'd', type: 'decision',
    system: 'The drop test', tag: 'sill chunk', icon: '\u{1FA9F}',
    goal: 'A clear chunk from the windowsill goes off the counter onto the tiles. It shatters into sharp pieces. It scratches the glass instead of the other way round, the dry probes get nothing, and it does not soften anywhere on the stove. Classify it.',
    why: 'You need to know whether this is a lump of sugar candy you can rinse away or a chunk of glassy mineral that has just put splinters across a floor you walk on barefoot.',
    constraints: { answer: 'Covalent network',
      melt: 'the hottest ring on the stove for five minutes: no softening at all',
      conduct: 'dry probes and dissolved: nothing either way' },
    consequences: {
      'Covalent network': 'Right. One continuous lattice of covalent bonds, so melting it would mean breaking the bonds themselves, and there are no free ions or free electrons anywhere to carry a current. It is a glassy mineral. You sweep every splinter off that floor before anyone walks on it.',
      'Covalent molecular': 'You call it small molecules held by weak forces, so you expect it to soften on the stove and rinse away in hot water. It does neither. You run water over it, decide the job is done, and leave sharp fragments in the trap and on the tiles.',
      'Ionic': 'You call it an ionic lattice, which would dissolve and conduct in water. It does not conduct at all. You mop it with water expecting it to disappear and just spread the splinters further across the floor.',
      'Metallic': 'You call it metallic, which would have dented under the drop rather than shattering, and would have lit the probes dry. It did neither. You put a bag of glass shards in the metal recycling.'
    } },
  { id: 'd-sugar-pan', stage: 'forces', skill: 'd', type: 'decision',
    system: 'The other white jar', tag: 'jar two', icon: '\u{1F36F}',
    goal: 'The second white jar goes in the dry pan. Within a minute it slumps, goes clear, then browns and smells of caramel. A spoonful in water dissolves completely, and the meter across the glass reads nothing at all. Classify it.',
    why: 'This is the jar you are deciding to bake with. Two white powders on the same shelf behave completely differently in a pan, and the pan is the cheapest test you own.',
    constraints: { answer: 'Covalent molecular',
      melt: 'a low ring for one minute: it slumps, goes clear, then browns and smells of caramel',
      conduct: 'dissolved in water: the meter reads nothing' },
    consequences: {
      'Covalent molecular': 'Right. The molecules themselves are held together by strong covalent bonds, but the forces between molecules are weak, so gentle heat is enough to pull them apart and it melts. Dissolving separates neutral molecules rather than ions, so nothing carries current. This is the sugar. It goes in the cake.',
      'Ionic': 'You call it a lattice of ions, which would have sat unmoved in that pan and would have lit the meter once dissolved. It melted at low heat and the meter stayed dark. You label it salt, and the next thing you bake is inedible.',
      'Covalent network': 'You call it one continuous covalent lattice, which could not melt on a domestic stove at all. It melted in under a minute. You write off the one jar in the kitchen that was actually food.',
      'Metallic': 'You call it metallic, which would conduct dry and would not caramelize. It browned and it conducted nothing. That call puts sugar in the scrap bucket.'
    } },

  // ---------- Honors h1: where the bond sits on the ionic-covalent continuum ----------
  { id: 'h1-percent-ionic', stage: 'bond', skill: 'h1', type: 'decision',
    system: 'How ionic is it really', icon: '\u{2696}\u{FE0F}',
    goal: 'No bond is purely one type. Take the electronegativity gap for this pair, read the Pauling percent ionic character off it, and say where on the continuum this bond actually sits.',
    why: 'The 0.4 and 1.7 cutoffs are teaching lines drawn across a continuum, not walls. Knowing how far along a bond sits tells you how completely it will come apart in water, which is the difference between something that rinses away and something that lingers in the trap.',
    consequences: {
      'ionic': 'You call it more than half ionic. That means the charges are close to whole, the solid is a lattice rather than a set of molecules, and water pulls it into free ions that carry current and rinse away completely.',
      'polar': 'You call it polar but still mostly covalent. The atoms keep sharing, but unevenly, so the molecule carries partial charges: it will mix with water and it will feel other polar things, without ever coming apart into ions.',
      'nonpolar': 'You call it essentially nonpolar. The sharing is close to even, there is almost no partial charge to work with, and water will have nothing to grip. It beads, floats or sits in a layer rather than dissolving.'
    },
    success: 'Right. The percentage follows straight from the gap, and it tells you what this will do in water before you pour anything.',
    fail: 'The percentage says otherwise, and treating a bond as further along the continuum than it is will have you expecting things to dissolve that never will.' },

  // ---------- Honors h2: is the whole molecule polar ----------
  { id: 'h2-polarity', stage: 'geometry', skill: 'h2', type: 'decision',
    system: 'Will water take it', icon: '\u{1F4A7}',
    goal: 'Polar bonds do not make a polar molecule on their own: the shape decides whether they cancel. Look at the molecule on the bench and call it, polar or nonpolar overall.',
    why: 'Like dissolves like. Whether this cleans up with water at the sink or needs the other bottle off the shelf comes down entirely to this one call.',
    consequences: {
      'polar': 'You call the molecule polar overall, so you expect it to mix with water and to be pulled at by other polar molecules. That means the sink handles it, and it means it boils higher than its size alone would suggest.',
      'nonpolar': 'You call the molecule nonpolar overall, so the bond dipoles cancel out and water has nothing to grab. It beads, floats, or sits in its own layer, and it takes a nonpolar solvent to shift it.'
    },
    success: 'Right, and that is a shape argument rather than a bond argument: the dipoles either cancel by symmetry or they do not.',
    fail: 'That is the wrong call, and it is the shape that gives it away. Symmetric molecules cancel their bond dipoles no matter how polar each individual bond is.' },

  // ---------- Honors h3: which force is actually holding them to each other ----------
  { id: 'h3-imf', stage: 'forces', skill: 'h3', type: 'decision',
    system: 'What holds the molecules together', icon: '\u{1F517}',
    goal: 'Inside a molecular substance the covalent bonds hold each molecule together, and something much weaker holds the molecules to each other. That weaker force is what you have to beat to boil it. Name the strongest one at work here.',
    why: 'Two bottles of the same size can boil sixty degrees apart, and the gap is entirely the force between the molecules. It decides what evaporates off the counter overnight and what is still sitting there in the morning.',
    consequences: {
      'London dispersion': 'You call it temporary induced dipoles, the weakest of the three and the only option for a molecule with no permanent charge separation. That means the lowest boiling point of the three, and something that leaves the counter fast.',
      'Dipole-dipole': 'You call it permanent partial charges lining up, positive end to negative end. Stronger than dispersion alone, so it holds on longer, but nothing like a hydrogen bond.',
      'Hydrogen bonding': 'You call it the special case: hydrogen bonded directly to nitrogen, oxygen or fluorine, exposed enough for a lone pair on the next molecule to reach. It is the strongest of the three by a wide margin, and it is why water is still a liquid at room temperature.'
    },
    success: 'Right, and the boiling point follows the ranking every time.',
    fail: 'That is not the dominant force here, and reading the ranking wrong means predicting the wrong boiling point and the wrong behaviour on the counter.' },

  // ---------- Capstone: the last bottle under the sink ----------
  { id: 'cap-underthesink', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'The last bottle', icon: '\u{1F9F9}',
    goal: 'One container is left under the sink. The label is gone except two element symbols. You have a melting test, a conductivity reading, and one observation nobody would forget. Work out the bond, the name, the class and the shape, then decide what happens to it.',
    why: 'This is the last thing standing between you and a finished apartment, and it is the one where a wrong call does not just cost you a jar. It goes in the water supply, or it sits in a cupboard where somebody else will find it.',
    options: [
      { key: 'keep', label: 'Keep it. Write a label and put it on the shelf.',
        good: 'It is useful and it is safe, so it stays. The label goes on and the next person to open the cupboard knows exactly what they have.',
        consequence: 'This one had a use and it was safe to keep. You got rid of something you needed, and whatever you did with it was more work than writing a label.' },
      { key: 'drain', label: 'Rinse it down the drain with plenty of water.',
        good: 'Soluble, non-toxic, and nothing it meets in the pipe will react with it, so the drain is genuinely the right answer. Plenty of water behind it and it is gone.',
        consequence: 'This one should not have gone down the drain. Once it is in the pipe there is no version of the next hour where you get it back.' },
      { key: 'haz', label: 'Bag it for the hazardous waste drop.',
        good: 'It is reactive or it is toxic, so it goes into a bag, out of the apartment, and to the drop. That is the only call that keeps it out of the water and out of the next tenant\'s hands.',
        consequence: 'You bagged something that did not need it. No harm done to anyone, but the hazardous waste drop is not a place to send things that were fine where they were.' }
    ] }
];
