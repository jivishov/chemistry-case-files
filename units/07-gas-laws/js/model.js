// model.js: Unit 7 domain data (Gas Laws & Kinetic Molecular Theory, TEKS C.10).
// Pure data + view-side physics helpers. Core gas math lives in shared/js/chem.js.

// ---- C.10(A): the postulates of the kinetic molecular theory ----
export const KMT_POSTULATES = [
  { id: 1, short: 'Constant motion',  text: 'Gas particles are in constant, random, straight-line motion.' },
  { id: 2, short: 'Tiny particles',   text: 'Particle volume is negligible compared with the space they move in.' },
  { id: 3, short: 'Elastic collisions', text: 'Collisions with the walls and each other are perfectly elastic; no kinetic energy is lost.' },
  { id: 4, short: 'No attractions',   text: 'There are no attractive or repulsive forces between particles.' },
  { id: 5, short: 'KE ∝ T',      text: 'Average kinetic energy is proportional to the absolute (kelvin) temperature.' }
];

// Scenario -> which postulate explains it. Used by the C.10(A) check.
// Extended additively for the Scenario layer: `id` so a brief can pin a group of
// observations, `where` for the setting it turns up in, and `consequences` keyed by
// postulate id. The consequences live HERE rather than on the scenario because the
// answer varies inside a group, so the cost of a wrong mental model is a property of
// the observation being explained, not of the setting it happens in.
export const KMT_QUIZ = [
  { id: 'k-fill', answer: 1,
    scenario: 'A gas spreads out to fill every corner of its container.',
    where: 'a diesel smell that started at the stern and is now in the galley',
    consequences: {
      1: 'Right. Random straight-line motion with nothing to stop it means a particle keeps going until a wall turns it around, so the gas ends up everywhere. That is why a leak at one end of a boat is a problem at the other end within a minute.',
      2: 'You call it particle size. Being mostly empty space explains why a gas compresses, not why it travels. A tiny particle sitting still fills nothing.',
      3: 'You call it elastic collisions. That explains why the motion never runs down, but a gas that started still and lost nothing would stay still. Something has to be moving first.',
      4: 'You call it no attractions. Removing attraction lets particles separate, but it does not put them in motion. A gas with no forces and no motion sits in a heap.',
      5: 'You call it kinetic energy against temperature. That sets how fast, not that it moves at all. Cool the compartment and the smell still reaches you, just later.'
    } },
  { id: 'k-mix', answer: 1,
    scenario: 'Cracking the oxygen line into one end of a cylinder leaves an even mix end to end, with nothing stirring it.',
    where: 'the blending whip',
    consequences: {
      1: 'Right. Random straight-line motion does the stirring for you. Nobody rolls a cylinder to blend nitrox, because every particle has already been the length of it thousands of times before you close the valve.',
      2: 'You call it particle size. Empty space is why the oxygen fits, not why it distributes. Small and stationary still leaves a layer of oxygen sitting in the bottom.',
      3: 'You call it elastic collisions. That keeps the motion from dying out, but the mixing needs the motion to be random and everywhere in the first place.',
      4: 'You call it no attractions. If oxygen and nitrogen did attract each other you would still get a mix, just a clumpier one. Absence of attraction is not what moves them.',
      5: 'You call it kinetic energy against temperature. Warm the cylinder and it mixes faster, but it mixes at any temperature you can fill at.'
    } },
  { id: 'k-squeeze', answer: 2,
    scenario: 'You can squeeze a large volume of gas into a small steel cylinder.',
    where: 'the compressor, on every fill of the day',
    consequences: {
      2: 'Right. Nearly all of a gas is the space between particles, so compressing it mostly removes gaps. That is why two hundred atmospheres of air fits in a cylinder one person can carry down a dock.',
      1: 'You call it constant motion. Motion explains that a gas fills whatever it is in, not that the container can be two orders of magnitude smaller than the gas started out.',
      3: 'You call it elastic collisions. Lossless bounces are why the pressure holds once it is in there. They are not what made room for it.',
      4: 'You call it no attractions. If anything, attractions would help you compress it. What makes the room is that the particles are almost all gap.',
      5: 'You call it kinetic energy against temperature. Cooling does help you get a full fill, but a cold gas is still mostly empty space, and the space is what you are squeezing out.'
    } },
  { id: 'k-chips', answer: 2,
    scenario: 'A bag of chips sealed at the harbour is drum-tight by the top of the pass.',
    where: 'the drive over the pass to the harbour',
    consequences: {
      2: 'Right. The air inside is mostly gaps, so when the outside stops pushing so hard the gaps open up. Nothing was added to the bag; the same particles are simply taking more room.',
      1: 'You call it constant motion. The particles were moving just as constantly at the harbour, and the bag was flat. What changed is how hard the outside air pushes back.',
      3: 'You call it elastic collisions. Elastic bounces are why the bag holds any shape at all, and they are the same at both ends of the drive.',
      4: 'You call it no attractions. The chips do not stick together any less at altitude. The bag grew because there was less air pressing in on it.',
      5: 'You call it kinetic energy against temperature. It is colder at the top of the pass, which would shrink the bag rather than swell it. Temperature is the wrong lever on this one.'
    } },
  { id: 'k-settle', answer: 3,
    scenario: 'A sealed gas never slows down and settles at the bottom on its own.',
    where: 'the reserve cylinder in the locker that nobody has touched since last season',
    consequences: {
      3: 'Right. Every collision is perfectly elastic, so the motion has nowhere to leak away to. A cylinder filled last season still reads its pressure because nothing has been draining the particles of energy.',
      1: 'You call it constant motion. That is the observation said back to you, not the reason for it. The question is why the motion never runs down.',
      2: 'You call it particle size. Small particles would still settle if every bounce cost them energy. Size is not what keeps them up.',
      4: 'You call it no attractions. Attractions would clump them, but a clump can still be moving. What stops the slowdown is that the collisions cost nothing.',
      5: 'You call it kinetic energy against temperature. That tells you how much motion there is at a given temperature. It does not explain why none of it is lost.'
    } },
  { id: 'k-condense', answer: 4,
    scenario: 'An ideal gas is assumed never to condense into a liquid.',
    where: 'the fill tables, which treat bank air as ideal and the analyser line as not',
    consequences: {
      4: 'Right. Condensing needs particles to hold on to one another, and the ideal model says there is nothing to hold with. That is exactly the assumption that gives out on you: bank air is near enough ideal at bench temperatures, carbon dioxide is not.',
      1: 'You call it constant motion. Real gases move constantly and still condense on a cold enough wall. Motion is not what keeps them apart.',
      2: 'You call it particle size. Negligible size is what makes a gas compressible, and a compressible gas can still liquefy. Size is the other idealisation, not this one.',
      3: 'You call it elastic collisions. Lossless collisions keep the energy in the gas, which helps, but the model rules out condensing by ruling out the attraction, not the loss.',
      5: 'You call it kinetic energy against temperature. Temperature is precisely what you drop to condense a real gas. The ideal one refuses because it has nothing to condense with.'
    } },
  { id: 'k-balloon', answer: 5,
    scenario: 'Heating a balloon makes its particles move faster on average.',
    where: 'a cylinder gaining pressure on the sun side of the deck and losing it again overnight',
    consequences: {
      5: 'Right. Average kinetic energy is set by the absolute temperature and by nothing else, so heat is speed. It is why a cylinder reads high in the afternoon sun and back down at dawn.',
      1: 'You call it constant motion. They were already moving before you heated it. Constant motion says the motion never stops, not that it answers to a heat source.',
      2: 'You call it particle size. The balloon does grow, but a particle is the same size hot or cold. Size explains room, not speed.',
      3: 'You call it elastic collisions. Elastic collisions conserve the energy the gas already has. They do not add any when you heat it.',
      4: 'You call it no attractions. With attractions or without them, heating raises the average speed. This one is temperature, straight through.'
    } },
  { id: 'k-equalT', answer: 5,
    scenario: 'Two gases of equal temperature have equal average kinetic energy.',
    where: 'the helium bottle and the air bank standing side by side in the same rack',
    consequences: {
      5: 'Right. Temperature IS average kinetic energy, whatever the gas happens to be. Helium and air in the same rack carry the same average energy; the helium just carries it as speed, because it weighs less.',
      1: 'You call it constant motion. Both gases move constantly, and that is true at every temperature, which is why it cannot be the thing that makes the two equal.',
      2: 'You call it particle size. A helium particle is smaller than an oxygen molecule. If size drove the energy the two would not match, and they do.',
      3: 'You call it elastic collisions. Both keep whatever energy they have. That says neither one loses any, not that the two started out equal.',
      4: 'You call it no attractions. Attraction changes how a gas behaves near liquefying, not its average energy at a stated temperature.'
    } }
];

// ---- C.10(B): named gas-law relationships for the reference table ----
export const GAS_LAWS = [
  { name: "Boyle's law",      rel: 'P \\propto 1/V',  held: 'n, T constant', note: 'Squeeze the volume and the pressure rises.' },
  { name: "Charles's law",    rel: 'V \\propto T',    held: 'n, P constant', note: 'Heat a gas and it expands.' },
  { name: "Gay-Lussac's law", rel: 'P \\propto T',    held: 'n, V constant', note: 'Heat a rigid tank and the pressure climbs.' },
  { name: "Avogadro's law",   rel: 'V \\propto n',    held: 'P, T constant', note: 'More particles take more room.' },
  { name: 'Combined law',     rel: 'PV/T = \\text{const}', held: 'n constant', note: 'The three simple laws in one.' }
];

// Plottable relationships for the C.10(B) curve. axis tells the chart what to vary.
export const RELATIONSHIPS = [
  { key: 'boyle',     name: "Boyle (P vs V)",      vary: 'V', out: 'P', xLabel: 'Volume (L)',      yLabel: 'Pressure (atm)' },
  { key: 'charles',   name: "Charles (V vs T)",    vary: 'T', out: 'V', xLabel: 'Temperature (K)', yLabel: 'Volume (L)' },
  { key: 'gaylussac', name: "Gay-Lussac (P vs T)", vary: 'T', out: 'P', xLabel: 'Temperature (K)', yLabel: 'Pressure (atm)' }
];

// ---- C.10(C): gases offered in the Dalton partial-pressure mixer ----
// `where` is additive: the part each gas plays on this boat. Nothing computes from it.
export const DALTON_GASES = [
  { name: 'N₂',  formula: 'N2',  mol: 1.5, where: 'the bulk of every fill, and the part that narcs you deep' },
  { name: 'O₂',  formula: 'O2',  mol: 0.4, where: 'the line off the booster, and the only part with a ceiling' },
  { name: 'CO₂', formula: 'CO2', mol: 0.1, where: 'what comes back out of the diver, and what the analyser watches' },
  { name: 'He',       formula: 'He',  mol: 0, where: 'the trimix bottle nobody on this boat is signed off to blend' },
  { name: 'Ar',       formula: 'Ar',  mol: 0, where: 'the drysuit inflation bottle in the locker' }
];

// ---- Honors (C.10A): van der Waals constants for real gases ----
// a in L^2*atm/mol^2, b in L/mol. Mean molar mass M in g/mol drives the speed curve.
export const REAL_GASES = [
  { key: 'He',  name: 'Helium',          formula: 'He',  a: 0.0346, b: 0.0238, M: 4.003 },
  { key: 'N2',  name: 'Nitrogen',        formula: 'N2',  a: 1.370,  b: 0.0387, M: 28.014 },
  { key: 'O2',  name: 'Oxygen',          formula: 'O2',  a: 1.382,  b: 0.0319, M: 31.998 },
  { key: 'CO2', name: 'Carbon dioxide',  formula: 'CO2', a: 3.640,  b: 0.0427, M: 44.009 }
];

// Honors (C.10C): vapor pressure of water for "gas collected over water" problems.
// torr at each temperature; atm derived in the view.
export const WATER_VP = [
  { tC: 20, torr: 17.5 }, { tC: 25, torr: 23.8 }, { tC: 30, torr: 31.8 },
  { tC: 40, torr: 55.3 }, { tC: 50, torr: 92.5 }, { tC: 60, torr: 149.4 },
  { tC: 80, torr: 355.1 }, { tC: 100, torr: 760.0 }
];

// Maxwell-Boltzmann speed distribution for the Honors KMT chart.
// Returns [{x: speed m/s, y: relative probability}] for molar mass M (g/mol) at T (K).
export function maxwellBoltzmann(M, T, vMax = 2800, steps = 90) {
  const R = 8.314;            // J/(mol*K)
  const Mkg = M / 1000;       // kg/mol
  const k = Mkg / (2 * R * T);
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const v = (vMax * i) / steps;
    pts.push({ x: v, y: 4 * Math.PI * Math.pow(k / Math.PI, 1.5) * v * v * Math.exp(-k * v * v) });
  }
  return pts;
}

// Characteristic speeds (m/s) for the readouts.
export const rmsSpeed = (M, T) => Math.sqrt((3 * 8.314 * T) / (M / 1000));
export const mostProbableSpeed = (M, T) => Math.sqrt((2 * 8.314 * T) / (M / 1000));

// Spec tolerance for the dose stages. Measured, not chosen. On `ideal`, at the unit's
// own shipped default state (V = 12 L, n = 0.5 mol, T = 300 K, true P = 1.0257 atm),
// using 27 degrees Celsius instead of 300 K is 91 percent off, R = 8.314 instead of
// 0.08206 is 10032 percent off, and millilitres for litres is 99.9 percent off. On
// `dalton`, taking an equal share instead of the mole fraction is 56 to 567 percent off
// on the shipped default mix. A 3 percent acceptable window is far narrower than the
// smallest error either skill's own failure mode can produce. Relative mode is not
// optional on either: `ideal` solves for P, V, n or T, whose magnitudes differ by three
// orders, and a CO2 partial of 0.05 atm makes any absolute band on `dalton` either
// meaningless or unreachable.
const DOSE_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.03 };

// SCENARIOS: the game layer. You are the fill-station hand on a dive boat. One bench,
// one storage bank, a compressor, an oxygen line and a queue of cylinders. Every fill
// is the same equation, and the bank only holds so much. The chemistry tools are
// unchanged (the particle box, the PV = nRT solver, the Dalton mixer); the fiction, the
// consequences and the world-state (bank pressure + the day's log) are what make it a
// game rather than a worksheet.
//   Dose (C.10B, C.10C, h2, h3): commit a number. The band grades YOUR value against
//     the true requirement: on target vs too little / too much (each a named
//     consequence) vs unresolved.
//   Decision (C.10A, h1, capstone): per-option consequence text; the chemically-correct
//     option is the one good outcome. On C.10(A) the options are the five postulates and
//     the consequences live on the KMT_QUIZ item, because the answer varies within a
//     scenario's group of observations.
//   constraints: what the generator pins. `quiz` is a group of KMT_QUIZ ids; `solveFor`
//     plus the three ranges pin the ideal-gas state; `mix`/`find`/`total`/`depth` pin
//     the Dalton blend.
//   spend: bank pressure (atm) a call actually commits, per outcome. Most calls commit
//     nothing: reading a gauge or checking an analyser costs time, not gas. Only the
//     two that put gas in a cylinder carry a spend, so the world-state moves for a
//     reason the story can defend.
export const SCENARIOS = [
  // ---------- C.10(A) kinetic theory: name the postulate behind what you can see ----------
  { id: 'a-whip', stage: 'kmt', skill: 'a', type: 'decision',
    system: 'The blending whip', icon: '\u{1F4A8}',
    goal: 'Two things on this boat today are the same physics. The cylinder on the whip took the oxygen line at one end and analysed even end to end, and the diesel that went over at the stern is in the galley now. Read the observation on the card and name the postulate behind it.',
    why: 'The postulates are the reason you can trust an analyser reading taken at the valve instead of stirring the cylinder first, and the reason a leak anywhere on a boat is a leak everywhere on it inside a minute.',
    constraints: { quiz: ['k-mix', 'k-fill', 'k-settle'] } },
  { id: 'a-steel', stage: 'kmt', skill: 'a', type: 'decision',
    system: 'The compressor', icon: '\u{2699}\u{FE0F}',
    goal: 'The compressor has been running since five, putting a room full of air into a rack of steel. Somewhere in the postulates is the reason that is possible at all. Name the one the observation on the card rests on.',
    why: 'Every fill you do is an argument that a gas is mostly nothing. Knowing which idealisation you are leaning on is the same as knowing when it will give out, which on this bench is when the pressure goes high or the gas goes cold.',
    constraints: { quiz: ['k-squeeze', 'k-chips', 'k-condense'] } },
  { id: 'a-deck', stage: 'kmt', skill: 'a', type: 'decision',
    system: 'The hot deck', icon: '\u{2600}\u{FE0F}',
    goal: 'A cylinder that read 200 bar at dawn is reading 215 on the afternoon deck and nobody has been near it. Name the postulate behind the observation you are given.',
    why: 'A gauge that moves on its own is either a leak or a temperature, and telling those apart on a hot deck is a daily call. It is the same postulate that says a light gas and a heavy one at the same temperature are carrying the same energy.',
    constraints: { quiz: ['k-balloon', 'k-equalT'] } },

  // ---------- C.10(B) ideal gas: dose. Three of P, V, n, T given, the fourth committed ----------
  { id: 'b-tyre', stage: 'ideal', skill: 'b', type: 'dose',
    system: 'The truck in the lot', icon: '\u{1F697}',
    goal: 'The dive truck has sat in the lot all day on tyres you set cold this morning. You know the air in one tyre and how hot the tarmac has made it. Work out the pressure that tyre is actually carrying now, in atmospheres.',
    why: 'This is the gas-law calculation most people do without knowing they are doing it. Set them by a hot gauge and they are soft by morning; read a hot gauge as if it were cold and you bleed off air the tyre needed.',
    constraints: { solveFor: 'P', rel: 'gaylussac', V: [12, 16], n: [1.4, 2.0], T: [305, 325] },
    bands: DOSE_BANDS,
    actionLabel: 'Call the pressure',
    safeState: 'SET RIGHT', lowState: 'UNDER-CALLED', highState: 'OVER-CALLED',
    safe: 'The number matches the gauge when the truck cools, the tyres come back to where you set them, and the trailer tows straight all the way to the harbour.',
    low: 'You call it low, so you top the tyre up to a figure it had already passed. By morning it is over-pressure and riding on the middle of the tread.',
    high: 'You call it high, so you bleed a tyre that was fine. It is soft and running hot by the time the trailer is on the highway.',
    fail: 'The number never resolved, so the tyres get set by thumb and nobody writes anything down.' },
  { id: 'b-twinset', stage: 'ideal', skill: 'b', type: 'dose',
    system: 'The twin-set on the bench', icon: '\u{1F9EF}',
    goal: 'A twin-set is going out on a wreck at 30 m. You know the internal volume, the pressure the fill has to reach and the temperature on the bench. Work out how many moles of air that fill puts into the steel.',
    why: 'The bank does not lose pressure, it loses gas. Moles are what you are handing over, and moles are what the next four divers are competing with this one for. Guess it and the bank runs out before the queue does.',
    constraints: { solveFor: 'n', rel: 'boyle', P: [180, 232], V: [22, 26], T: [288, 300] },
    bands: DOSE_BANDS,
    spend: { ok: 24, low: 16, high: 38 },
    actionLabel: 'Put the fill in',
    safeState: 'FILL DELIVERED', lowState: 'SHORT FILL', highState: 'OVER-DRAWN',
    safe: 'The draw off the bank matches what went into the steel. The diver has the gas the plan asked for and the bank has what the rest of the queue needs.',
    low: 'You under-call it, so the fill stops short and the diver goes down on less gas than the plan. They turn the wreck early and come up on reserve.',
    high: 'You over-call it and pull more off the bank than the cylinder ever needed. The extra vents to the deck at the end of the whip, and it is the last diver of the day who finds out.',
    fail: 'The moles never resolved, so the fill goes on by eye and the log line stays blank.' },
  { id: 'b-sundeck', stage: 'ideal', skill: 'b', type: 'dose',
    system: 'The cylinder on the swim deck', icon: '\u{1F321}\u{FE0F}',
    goal: 'Somebody left a full cylinder lying on the swim deck in the sun and the gauge is reading high. You know the pressure, the internal volume and the moles that went in at the bench. Work out the temperature that steel has actually reached, in kelvin.',
    why: 'A cylinder has a working pressure and a test pressure and the gap between them is not large. Before you decide whether that reading is a hot cylinder or an over-fill, you have to know which of the two the number is telling you about.',
    constraints: { solveFor: 'T', rel: 'gaylussac', P: [200, 218], V: [11.5, 12.5], n: [92, 100] },
    bands: DOSE_BANDS,
    actionLabel: 'Call the steel temperature',
    safeState: 'DIAGNOSED', lowState: 'CALLED TOO COOL', highState: 'CALLED TOO HOT',
    safe: 'The temperature accounts for the whole of the extra pressure. The cylinder goes in the shade, comes back to its fill pressure, and goes out on the next dive.',
    low: 'You call the steel cooler than it is, so the rest of the pressure has to be an over-fill. The cylinder gets bled down, and at dawn it is a hundred bar short of what the diver paid for.',
    high: 'You call the steel hotter than it is and write the reading off as sunshine. It was over-filled at the bench, and it is still over-filled when it goes back in the rack.',
    fail: 'The temperature never resolved, so the cylinder sits on the deck in the sun while you work it out again.' },

  // ---------- C.10(C) Dalton: dose. The partial pressure is the thing that matters ----------
  { id: 'c-air', stage: 'dalton', skill: 'c', type: 'dose',
    system: 'The air on the dock', icon: '\u{1F32C}\u{FE0F}',
    goal: 'Before the first fill you check the analyser against plain air. You have the moles of each gas in the sample and the barometric pressure on the dock. Work out the partial pressure of the oxygen in it, in atmospheres.',
    why: 'Every blend you make today gets compared against this one reading. If you cannot recover air out of air on a normal morning, the analyser is out, and so is every mix that goes over the rail behind it.',
    constraints: { mix: 'air', find: 'O2', total: [0.96, 1.04] },
    bands: DOSE_BANDS,
    actionLabel: 'Log the check',
    safeState: 'ANALYSER GOOD', lowState: 'READ LOW', highState: 'READ HIGH',
    safe: 'The figure lands where air should land, the analyser agrees with it, and every blend behind it has a reference to be checked against.',
    low: 'You log it low, so the analyser looks like it is reading rich. You trim it down, and every nitrox blend today comes out leaner than its sticker.',
    high: 'You log it high, so the analyser looks lean and you trim it up. Now every mix reads richer than it is, which is the direction that puts a diver past their depth limit.',
    fail: 'The check never resolved, so the analyser goes into the day unreferenced.' },
  { id: 'c-blend', stage: 'dalton', skill: 'c', type: 'dose',
    system: 'The nitrox blend', icon: '\u{1F7E2}',
    goal: 'A cylinder is going out as nitrox, blended from the oxygen line and bank air. You have the moles of each gas going in and the pressure the finished fill reads. Work out the partial pressure of the oxygen in that cylinder.',
    why: 'Partial pressure is the whole of nitrox. The percentage on the sticker only matters because it becomes a partial pressure at depth, and the number you commit here is what the analyser has to agree with before the cylinder leaves the boat.',
    constraints: { mix: 'nitrox', find: 'O2', total: [180, 232] },
    bands: DOSE_BANDS,
    spend: { ok: 26, low: 18, high: 42 },
    actionLabel: 'Blend it',
    safeState: 'BLEND ANALYSED', lowState: 'BLEND LEAN', highState: 'BLEND RICH',
    safe: 'The oxygen goes in against the number you called, the analyser agrees inside a tenth of a percent, and the sticker on the cylinder is the truth.',
    low: "You call the oxygen low, so you keep feeding the line to reach a partial pressure you had already passed. The finished mix is richer than its sticker, which is the direction that shortens the diver's depth limit without telling them.",
    high: 'You call it high and stop the oxygen early. The mix is leaner than the sticker, the diver plans decompression on gas that is not in the cylinder, and the bank paid for the difference.',
    fail: 'The partial pressure never resolved, so the whip stays open and the cylinder is not going anywhere.' },
  { id: 'c-ppo2', stage: 'dalton', skill: 'c', type: 'dose',
    system: 'The dive plan', icon: '\u{1F30A}',
    goal: 'The blend is analysed and the diver wants a depth. You have the mix and the absolute pressure they will be breathing it at down there. Work out the oxygen partial pressure at that depth, in atmospheres, before anybody gets in.',
    why: 'Recreational diving works to 1.4 atm of oxygen, with 1.6 atm as a contingency limit. On a 32 percent mix that is comfortable at 30 m and past the working limit at 40 m. This number is the difference between a dive plan and an incident report.',
    constraints: { mix: 'nitrox', find: 'O2', depth: [20, 30, 40] },
    bands: DOSE_BANDS,
    actionLabel: 'Sign the plan',
    safeState: 'PLAN SIGNED', lowState: 'CALLED LOW', highState: 'CALLED HIGH',
    safe: 'The partial pressure is the one on the plan, the depth is inside the limit it implies, and the diver goes over the rail on a gas that matches the profile in their computer.',
    low: 'You call it low, so a depth that is actually past the limit looks fine on paper. Oxygen toxicity does not announce itself, and it happens at depth, on a diver holding a regulator.',
    high: 'You call it high and cut the dive to a depth the mix could have taken easily. Nobody is hurt, and the wreck they paid to see is eight metres below where you stopped them.',
    fail: 'The partial pressure never resolved, so nothing gets signed and the diver waits on the rail.' },

  // ---------- Honors h1 (parent a): speed against energy on the Boltzmann curve ----------
  { id: 'h1-speeds', stage: 'honors1', skill: 'h1', type: 'decision',
    system: 'The rack', icon: '\u{1F4CA}',
    goal: 'Two bottles standing in the same rack, at the temperature set on the kinetic-theory bench. Answer the question on the card: which one is greater, or are the two the same?',
    why: 'The Maxwell-Boltzmann curve is the whole answer to why helium finds a seal that holds air. Speed and energy are not the same question, and running the two together is the most common mistake anybody makes on this topic.',
    kinds: {
      ke: {
        right: 'Right. Temperature fixes the average kinetic energy and nothing else does, so at one temperature every gas in the rack carries the same average energy whatever it weighs.',
        wrong: 'Not that one. Average kinetic energy is set by the absolute temperature alone, so two bottles at the same temperature match, however far apart their molar masses are. What differs is how each gas carries that energy.'
      },
      speed: {
        right: 'Right. With the same average energy to carry, the lighter gas has to move faster, so the light one always peaks further right on the speed curve.',
        wrong: 'Not that one. Equal energy does not mean equal speed: energy goes as mass times speed squared, so the lighter gas has to run faster to carry the same amount, and it is the light bottle that peaks further right.'
      }
    } },

  // ---------- Honors h2 (parent b): the real-gas correction ----------
  { id: 'h2-real', stage: 'honors2', skill: 'h2', type: 'dose',
    system: 'The high-pressure bank', icon: '\u{1F4C9}',
    goal: 'At bank pressure the ideal gas law is a first guess, not the truth. You have the gas, the moles, the internal volume and the temperature. Work out the pressure the van der Waals equation actually gives, in atmospheres.',
    why: 'This correction is why a bank gauge and a fill table stop agreeing at the top of the range. Attraction pulls the pressure below ideal, and the room the particles themselves take up pushes it back above. Which one wins tells you which way your fills are out.',
    bands: DOSE_BANDS,
    actionLabel: 'Correct the table',
    safeState: 'TABLE CORRECTED', lowState: 'CORRECTION SHORT', highState: 'CORRECTION LONG',
    safe: 'The corrected figure matches the gauge on the bank, the fill table gets the note in the margin, and the top of the range stops being guesswork.',
    low: 'You correct it short. The table still over-states what the bank holds at the top end, and the last fill of the day is the one that finds the gap.',
    high: 'You correct it long. Now the table under-states the bank, so you stop drawing on gas that was there, and cylinders go out light for no reason.',
    fail: 'The correction never resolved, so the table keeps the ideal number and the note in the margin stays unwritten.' },

  // ---------- Honors h3 (parent c): the water vapour that came along for free ----------
  { id: 'h3-water', stage: 'honors3', skill: 'h3', type: 'dose',
    system: 'The collection tube', icon: '\u{1F4A7}',
    goal: 'You are collecting a gas over water in the inverted tube on the bench. You know the total pressure the tube reads and the temperature of the water. Work out the pressure of the dry gas on its own, in atmospheres.',
    why: 'What the tube reads is your gas plus water vapour that arrived for free. Report the total as if it were all yours and every mole you calculate off it is over-stated, every time, in the same direction.',
    bands: DOSE_BANDS,
    actionLabel: 'Report the dry gas',
    safeState: 'DRY GAS REPORTED', lowState: 'REPORTED SHORT', highState: 'REPORTED LONG',
    safe: 'The vapour comes off the total and what is left is the gas you actually collected. The mole figure downstream of it holds up.',
    low: 'You take off more than the vapour table says. The dry gas reads short, and everything you calculate from it under-states what is in the tube.',
    high: 'You leave some of the vapour in the number. The dry gas reads long, which is the standard version of this mistake, and it always points the same way.',
    fail: 'The dry-gas pressure never resolved, so the tube gets logged as a total and the vapour goes down as gas.' },

  // ---------- Capstone: the last fill of the day ----------
  { id: 'cap-lastfill', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'The last fill', icon: '\u{1F6A4}',
    goal: 'One diver left on the boat and one fill left in your shift. They want a depth, they want a mix, and the bank is down to whatever the day left in it. Read the cylinder, check the oxygen partial pressure at that depth against 1.4 atm, and make one call.',
    why: 'This is the whole day in one decision. The gas laws give you what the fill takes, Dalton gives you what the mix does at depth, and the bank gives you what you actually have. The call is what you do when the three do not agree.',
    options: [
      { key: 'send', label: 'Fill it and send them down',
        good: 'The bank covers the fill and the mix is inside its limit at that depth. The cylinder goes over the rail analysed and stickered, and the last dive of the day is the uneventful kind.',
        consequence: 'You send a diver down on a fill this bank could not cover or a mix that is past its oxygen limit at that depth. Neither of those announces itself at the surface, which is exactly why they get checked at the bench.' },
      { key: 'reblend', label: 'Re-blend leaner and cap the depth',
        good: 'The bank has the gas but the mix is past its oxygen limit at the depth they asked for. Leaner gas and a shallower cap puts the partial pressure back inside 1.4 atm, and they still get a dive.',
        consequence: 'You re-blend a mix that did not need it. If the bank could not cover the fill in the first place, leaner gas does not create pressure, and if the mix was already inside its limit you have taken depth off a diver for nothing.' },
      { key: 'off', label: 'Call it: the bank cannot do this one',
        good: 'The bank is below what this fill takes. You cannot make gas out of a gauge reading, and half a fill on the last dive of the day is how somebody ends up on reserve at depth. The dive is off and the compressor runs overnight.',
        consequence: 'You call off a dive the bank could have covered. The compressor was never the problem, the diver goes home without the dive they paid for, and the gas you were protecting is still sitting in the bank in the morning.' } ] }
];

export const SE = [
  { id: 'a',  code: 'C.10(A)', mode: 'kmt',    honors: false, text: 'Describe the postulates of the kinetic molecular theory.' },
  { id: 'b',  code: 'C.10(B)', mode: 'ideal',  honors: false, text: 'Calculate the relationships among volume, pressure, number of moles, and temperature for an ideal gas.' },
  { id: 'c',  code: 'C.10(C)', mode: 'dalton', honors: false, text: "Apply Dalton's law of partial pressures to a mixture of gases." },
  { id: 'h1', code: 'Honors',  mode: 'kmt',    honors: true,  text: 'Read the Maxwell-Boltzmann curve: molecular speed against kinetic energy.' },
  { id: 'h2', code: 'Honors',  mode: 'ideal',  honors: true,  text: 'Correct an ideal-gas pressure for real-gas behaviour with van der Waals.' },
  { id: 'h3', code: 'Honors',  mode: 'dalton', honors: true,  text: 'Subtract water vapour pressure from a gas collected over water.' }
];
