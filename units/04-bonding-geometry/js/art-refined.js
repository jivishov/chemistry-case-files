// art-refined.js — copy-only refinements for Unit 4 scene artwork.
//
// The underlying SVG geometry in art.js is intentionally preserved. This wrapper changes
// only student-visible captions/labels that were scientifically overbroad, overly dramatic,
// or inconsistent with the revised simulation-safety wording.
import { sceneArt as baseSceneArt } from './art.js';

const COPY = {
  'a-white-jar': [
    ['THE WHITE JAR · Na + Cl, BEFORE THE PAN', 'THE WHITE JAR · Na + Cl BONDING EVIDENCE']
  ],
  'a-lamp-cord': [
    ['THE LAMP CORD · BARE COPPER, TAPE OR BIN', 'THE LAMP CORD · COPPER IS A METALLIC SOLID'],
    ['NOT YET', 'UNPLUGGED']
  ],
  'a-gas-ring': [
    ['THE GAS LINE · A LEAK RISES OR IT DOES NOT', 'METHANE · C-H BONDS IN A MOLECULAR GAS'],
    ['UP? OR DOWN?', 'MOLECULAR GAS']
  ],
  'a-tap-water': [
    ['THE KITCHEN TAP · O + H, AND EVERY CLEAN-UP', 'WATER · POLAR O-H BONDS + BENT GEOMETRY'],
    ['EVERYTHING', 'POLAR'],
    ['GETS RINSED IN IT', 'MOLECULE']
  ],
  'b-pantry': [
    ['THE PANTRY · HALF A LABEL IS NOT A LABEL', 'THE PANTRY · RESTORE THE CHEMICAL LABEL']
  ],
  'c-ice-water': [
    ['ICE WATER · THE BEND IS WHY IT FLOATS', 'H2O · BENT + POLAR · ICE HAS AN OPEN LATTICE']
  ],
  'c-cleaning-shelf': [
    ['THE CLEANING SHELF · A LONE PAIR DOES THE WORK', 'NH3 · THREE BONDS + ONE LONE PAIR'],
    ['THE LONE PAIR', 'ONE LONE PAIR'],
    ['DOES THE WORK', 'ON NITROGEN']
  ],
  'c-extinguisher': [
    ['THE EXTINGUISHER · TWO DIPOLES, CANCELLED', 'CO2 · LINEAR, SO BOND DIPOLES CANCEL']
  ],
  'd-dry-pan': [
    ['THE DRY PAN · NO MELT, AND THE METER READS', 'ACTIVITY DATA · SOLID + SOLUTION CONDUCTS'],
    ['FULL HEAT, 4 MIN', 'SIMULATED HEAT'],
    ['A PINCH IN WATER', 'SUPPLIED SOLUTION']
  ],
  'd-bulb-battery': [
    ['THE GREY LUMP · IT LIT DRY, IT DENTED', 'ACTIVITY DATA · SOLID CONDUCTS + SAMPLE DENTS']
  ],
  'd-drop-test': [
    ['THE DROP TEST · SHARDS, AND NOTHING CONDUCTS', 'ACTIVITY DATA · HARD, BRITTLE, NONCONDUCTING'],
    ['IT SCRATCHED THE GLASS', 'SCRATCHES GLASS'],
    ['OFF THE COUNTER', 'SIMULATED DROP']
  ],
  'd-sugar-pan': [
    ['THE OTHER WHITE JAR · IT WENT TO CARAMEL', 'SUCROSE MODEL · HEAT CHANGE + NO SOLUTION CURRENT'],
    ['LOW RING, 1 MIN', 'SIMULATED HEAT'],
    ['DISSOLVED', 'SOLUTION']
  ],
  'h1-percent-ionic': [
    ['HOW IONIC, REALLY · A CONTINUUM, NOT A WALL', 'IONIC CHARACTER · CONTINUUM + ACTIVITY BANDS']
  ],
  'h2-polarity': [
    ['WILL WATER TAKE IT · THE SHAPE DECIDES', 'MOLECULAR POLARITY · DO BOND DIPOLES CANCEL?'],
    ['THE SINK', 'VECTOR SUM'],
    ['YES', 'POLAR'],
    ['NO', 'NONPOLAR']
  ],
  'h3-imf': [
    ['BETWEEN THE MOLECULES · WHAT YOU HAVE TO BEAT', 'INTERMOLECULAR FORCES · THREE EXAMPLES'],
    ['weakest', 'nonpolar'],
    ['stronger', 'polar'],
    ['strongest', 'H-bond'],
    ['WHAT IT COSTS TO BOIL', 'EXAMPLE NORMAL BOILING POINTS'],
    ['SAME SIZE BOTTLE. SIXTY DEGREES APART.', 'IMF IS ONE FACTOR IN BOILING POINT']
  ],
  'cap-underthesink': [
    ['THE LAST BOTTLE · KEEP, DRAIN OR BAG IT', 'THE LAST BOTTLE · USE THE REFERENCE RECORD'],
    ['DRAIN', 'APPROVED'],
    ['HAZ WASTE', 'HHW'],
    ['ONE ROUTE IS NOT REVERSIBLE', 'FOLLOW LABEL + LOCAL WASTE GUIDANCE']
  ]
};

export function sceneArt(id) {
  let svg = baseSceneArt(id);
  for (const [before, after] of COPY[id] || []) svg = svg.replaceAll(before, after);
  return svg;
}
