// model.js: Unit 6 domain data (Reactions & Stoichiometry, TEKS C.9).
// Pure data + classification constants. No DOM, no framework.

export const STRUCTURAL_TYPES = [
  'Synthesis', 'Decomposition', 'Single replacement', 'Double replacement', 'Combustion'
];

// C.9(B) sub-classifications layered on top.
export const SUBTYPES = ['Acid-base', 'Precipitation', 'Redox'];

// Rule of thumb used for the Redox tag at HS level: a free element (single-element
// formula) appearing as a reactant or product means oxidation states change.

// Each species: { f: formula, c: coefficient, state: 's'|'l'|'g'|'aq' }
// display: mhchem string rendered by KaTeX.
// where: the setting this reaction actually turns up in on the rotation. Additive,
// used by the briefs and the reaction picker; nothing computes from it.
export const REACTIONS = [
  {
    id: 'haber', display: 'N2(g) + 3 H2(g) -> 2 NH3(g)',
    where: 'the co-op fertilizer depot at the edge of town',
    structural: 'Synthesis', subs: ['Redox'],
    reactants: [{ f: 'N2', c: 1, state: 'g' }, { f: 'H2', c: 3, state: 'g' }],
    products:  [{ f: 'NH3', c: 2, state: 'g' }]
  },
  {
    id: 'peroxide', display: '2 H2O2(aq) -> 2 H2O(l) + O2(g)',
    where: 'the brown bottle in the jump kit',
    structural: 'Decomposition', subs: ['Redox'],
    reactants: [{ f: 'H2O2', c: 2, state: 'aq' }],
    products:  [{ f: 'H2O', c: 2, state: 'l' }, { f: 'O2', c: 1, state: 'g' }]
  },
  {
    id: 'zinc-acid', display: 'Zn(s) + 2 HCl(aq) -> ZnCl2(aq) + H2(g)',
    where: 'muriatic acid running under a galvanized shelf',
    structural: 'Single replacement', subs: ['Redox'],
    reactants: [{ f: 'Zn', c: 1, state: 's' }, { f: 'HCl', c: 2, state: 'aq' }],
    products:  [{ f: 'ZnCl2', c: 1, state: 'aq' }, { f: 'H2', c: 1, state: 'g' }]
  },
  {
    id: 'silver-halide', display: 'AgNO3(aq) + NaCl(aq) -> AgCl v + NaNO3(aq)',
    where: 'the stained bench in the old darkroom on Third',
    structural: 'Double replacement', subs: ['Precipitation'],
    reactants: [{ f: 'AgNO3', c: 1, state: 'aq' }, { f: 'NaCl', c: 1, state: 'aq' }],
    products:  [{ f: 'AgCl', c: 1, state: 's' }, { f: 'NaNO3', c: 1, state: 'aq' }]
  },
  {
    id: 'methane', display: 'CH4(g) + 2 O2(g) -> CO2(g) + 2 H2O(g)',
    where: 'the space heater in a sealed ice-fishing shack',
    structural: 'Combustion', subs: ['Redox'],
    reactants: [{ f: 'CH4', c: 1, state: 'g' }, { f: 'O2', c: 2, state: 'g' }],
    products:  [{ f: 'CO2', c: 1, state: 'g' }, { f: 'H2O', c: 2, state: 'g' }]
  },
  {
    id: 'neutralize', display: 'HCl(aq) + NaOH(aq) -> NaCl(aq) + H2O(l)',
    where: 'the ditch at the county line, under an overturned tanker',
    structural: 'Double replacement', subs: ['Acid-base'],
    reactants: [{ f: 'HCl', c: 1, state: 'aq' }, { f: 'NaOH', c: 1, state: 'aq' }],
    products:  [{ f: 'NaCl', c: 1, state: 'aq' }, { f: 'H2O', c: 1, state: 'l' }]
  },
  {
    id: 'rust', display: '4 Fe(s) + 3 O2(g) -> 2 Fe2O3(s)',
    where: "the ladder truck's frame, every winter it sits in road salt",
    structural: 'Synthesis', subs: ['Redox'],
    reactants: [{ f: 'Fe', c: 4, state: 's' }, { f: 'O2', c: 3, state: 'g' }],
    products:  [{ f: 'Fe2O3', c: 2, state: 's' }]
  },
  {
    id: 'aluminum-chloride', display: '2 Al(s) + 3 Cl2(g) -> 2 AlCl3(s)',
    where: 'a leaking chlorine cylinder in a shed full of aluminium stock',
    structural: 'Synthesis', subs: ['Redox'],
    reactants: [{ f: 'Al', c: 2, state: 's' }, { f: 'Cl2', c: 3, state: 'g' }],
    products:  [{ f: 'AlCl3', c: 2, state: 's' }]
  },
  {
    id: 'copper-displacement', display: 'Fe(s) + CuSO4(aq) -> FeSO4(aq) + Cu(s)',
    where: 'the rinse tank at the plating shop on the industrial road',
    structural: 'Single replacement', subs: ['Redox'],
    reactants: [{ f: 'Fe', c: 1, state: 's' }, { f: 'CuSO4', c: 1, state: 'aq' }],
    products:  [{ f: 'FeSO4', c: 1, state: 'aq' }, { f: 'Cu', c: 1, state: 's' }]
  },
  {
    id: 'propane', display: 'C3H8(g) + 5 O2(g) -> 3 CO2(g) + 4 H2O(g)',
    where: 'a grill bottle in somebody’s yard, and the bobtail on the highway',
    structural: 'Combustion', subs: ['Redox'], honors: true,
    reactants: [{ f: 'C3H8', c: 1, state: 'g' }, { f: 'O2', c: 5, state: 'g' }],
    products:  [{ f: 'CO2', c: 3, state: 'g' }, { f: 'H2O', c: 4, state: 'g' }]
  }
];

// Spec tolerance for the dose stages. Measured, not chosen: swept across all ten
// reactions, omitting the mole ratio is at minimum a 20.0 percent error and inverting
// it is at minimum 36.0 percent, so a 3 percent acceptable window is at least six
// times narrower than the smallest error the skill's own failure mode can produce.
const DOSE_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.03 };

// Two generator rules that the bands alone cannot enforce, both measured:
//   1. A stoich scenario must pin a NON-1:1 (given, find) pair. 50 of the 96 pairs in
//      this bank are already 1:1, and on those there is no mole-ratio error to make:
//      the task collapses to a molar-mass conversion, which is C.8, not C.9(C).
//   2. It must avoid propane's C3H8 (44.10 g/mol) against CO2 (44.01), a 0.2 percent
//      gap, where a learner using the wrong molar mass lands inside `ideal` by luck.
//      That is the only sub-3-percent molar-mass pair among the 46 usable ones.
// Every `constraints` block below satisfies both.

// SCENARIOS: the game layer. You are second due on a small-town volunteer fire and
// hazmat crew. One engine, one squad, and a co-op fertilizer depot at the edge of
// town. Every call comes down to the same question: what reaction is running, and how
// much of what does it take to stop it. The chemistry tools are unchanged (coefficient
// inputs, the classify grid, the factor-label readout, the particle tokens); the
// fiction, the consequences and the world-state (soda ash on the truck + the incident
// log) are what make it a game rather than a worksheet.
//   Dose (C.9C, C.9D, Honors): commit a number. The band grades YOUR value against the
//     true requirement: on target vs too little / too much (each a named consequence)
//     vs unresolved. icon + state words drive the visual reaction.
//   Decision (C.9B, capstone): per-option consequence text; the chemically-correct
//     option is the one good outcome.
//   Identity (C.9A): the CONSTRUCTED coefficient set maps to success/fail.
//   constraints: { reaction, given, find, unit } so the generators apply the picks.
export const SCENARIOS = [
  // ---------- C.9(A) balance: get the equation right before anything else ----------
  { id: 'a-ladder', stage: 'balance', skill: 'a', type: 'identity',
    system: 'The ladder truck', icon: '\u{1F692}',
    goal: 'The frame rails on the ladder truck are scaling off in orange sheets after nine winters in road salt. Write the iron-and-oxygen equation the way it actually runs, in the smallest whole numbers.',
    why: 'The shop orders steel and primer off this equation. Get the ratio wrong and you either under-order and leave bare metal through another winter, or you over-order and the money comes out of the same budget that buys air packs.',
    constraints: { reaction: 'rust' },
    safeState: 'BALANCED', failState: 'NOT BALANCED',
    correct: 'Four iron to three oxygen to two of the oxide. Atoms conserved, lowest terms. The shop order goes in and the rails get cut back to clean steel.',
    wrong: 'The atoms do not tally, so the equation says matter appeared or vanished. Anything you order off it is guesswork.' },
  { id: 'a-grill', stage: 'balance', skill: 'a', type: 'identity',
    system: 'The backyard bottle', icon: '\u{1F525}',
    goal: 'A grill bottle let go in somebody’s yard and the fire is out, but the report needs the combustion equation balanced. Propane and oxygen in, carbon dioxide and water out.',
    why: 'The oxygen coefficient is the whole story on a propane fire: it tells you how much air the leak needed to burn, which is what decides whether a leak in an enclosed space smoulders or goes off all at once.',
    constraints: { reaction: 'propane' },
    safeState: 'BALANCED', failState: 'NOT BALANCED',
    correct: 'One propane to five oxygen, three carbon dioxide and four water. That five is why a bottle in a closed garage is a different call from a bottle in open air.',
    wrong: 'The tally does not close. Report it like this and the oxygen demand is wrong, which is the one number on the page anybody will use.' },
  { id: 'a-depot', stage: 'balance', skill: 'a', type: 'identity',
    system: 'The depot ammonia line', icon: '\u{1F3ED}',
    goal: 'The co-op runs an ammonia line and dispatch wants the synthesis equation on the pre-plan sheet before the next inspection. Nitrogen and hydrogen to ammonia, lowest whole numbers.',
    why: 'That sheet is what the crew reads at two in the morning with the line venting. The three-to-one hydrogen ratio is the reason the depot is a flammable-gas problem and not just a corrosive one.',
    constraints: { reaction: 'haber' },
    safeState: 'BALANCED', failState: 'NOT BALANCED',
    correct: 'One nitrogen to three hydrogen to two ammonia. The pre-plan goes up on the board with the hydrogen load stated correctly.',
    wrong: 'The equation does not balance, so the hydrogen figure on the pre-plan is wrong, and that is the figure that decides how far back the crew stages.' },

  // ---------- C.9(B) classify: name the pattern, and know what it means ----------
  { id: 'b-jumpkit', stage: 'classify', skill: 'b', type: 'decision',
    system: 'The jump kit', icon: '\u{1FA79}',
    goal: 'You put hydrogen peroxide on a cut and it foams white. One bottle went in, two things came out. Classify what just happened on that arm.',
    why: 'The same reaction is why the bottle in your bathroom is brown glass and why it stops working after a year. If you know what class it is, you know what makes it run faster and what it turns into.',
    constraints: { reaction: 'peroxide' },
    consequences: {
      'Decomposition': 'Right. One compound broke into two, water and oxygen gas, and the foam is the oxygen coming off. It also tells you the bottle under the sink has been quietly doing this in the dark, which is why the old one does nothing.',
      'Synthesis': 'You call it two things combining. Then you would expect the foam to be something new forming, and you would store the bottle anywhere. It is the opposite: it is falling apart on its own, and warm lit storage is what kills it.',
      'Single replacement': 'You call it an element swapping in. There is no free element on the left, only H2O2, so there is nothing to swap. If that were the pattern you would be looking for a metal that is not there.',
      'Double replacement': 'You call it two compounds trading partners. There is only one compound on the left. You would go looking for a precipitate that never forms and miss that this is a shelf-life problem.',
      'Combustion': 'You call it burning. It foams cold, with no flame and no fuel. Treat it as combustion and you would keep it away from air instead of away from light and heat, which is the wrong shelf.'
    } },
  { id: 'b-darkroom', stage: 'classify', skill: 'b', type: 'decision',
    system: 'The darkroom on Third', icon: '\u{1F4F7}',
    goal: 'A building check turns up an old darkroom with silver nitrate and table salt on the same bench and a grey-white crust where they ran together. Classify the reaction that left the crust.',
    why: 'The crust is the whole point: it is a solid that came out of two clear solutions. Recognising a precipitation tells you the silver is now sitting there as a solid rather than soaking into the floor, which changes how the room gets cleared.',
    constraints: { reaction: 'silver-halide' },
    consequences: {
      'Double replacement': 'Right. The two solutions traded partners and one of the products will not stay dissolved, so it drops out as that grey-white solid. The silver is bound up in the crust, not in the runoff.',
      'Synthesis': 'You call it a combination. Two compounds went in and two came out, so nothing was built up from simpler pieces. You would be looking for one product where there are two.',
      'Decomposition': 'You call it a breakdown. Nothing came apart here; both sides have two compounds. Treat it as decomposition and you would expect a gas that never appears.',
      'Single replacement': 'You call it an element swapping in. There is no free element anywhere in this equation, so there is nothing to do the swapping. This is two ionic compounds exchanging partners.',
      'Combustion': 'You call it burning. There is no oxygen consumed, no flame, and no fuel. Nothing about a wet bench in a dark room is a combustion problem.'
    } },
  { id: 'b-ditch', stage: 'classify', skill: 'b', type: 'decision',
    system: 'The ditch at the county line', icon: '\u{1F6A8}',
    goal: 'The tanker is on its side and the acid in the ditch has met the caustic you just laid across it. It is warm to the back of your hand through the glove and it has stopped fizzing. Classify it.',
    why: 'This is the reaction you are deliberately causing, so you had better know its name. Acid-base neutralisation runs hot and it runs to completion, which is why you lay the reagent in a line and back off rather than standing over it.',
    constraints: { reaction: 'neutralize' },
    // Misreading this one at the ditch means a bag off the truck goes down for nothing.
    spendWrong: 5,
    consequences: {
      'Double replacement': 'Right. The acid and the base traded partners and what you have left in the ditch is salt water and heat. That is the whole reason this is the intervention: the products are things you can hose to the creek.',
      'Synthesis': 'You call it a combination. Then you would expect one product, and you would not be expecting the heat that is coming up through your glove right now.',
      'Decomposition': 'You call it a breakdown. Two compounds went in. Nothing here came apart into simpler pieces, and reading it that way tells you nothing about what is left in the ditch.',
      'Single replacement': 'You call it an element swapping in. There is no free element on either side. If you went looking for a displaced metal you would be looking for something that was never in the tanker.',
      'Combustion': 'You call it burning. It is hot, which is the trap, but nothing is oxidising and there is no flame. Treat a neutralisation as a fire and you would be putting water on it for the wrong reason.'
    } },

  // ---------- C.9(C) stoichiometry: dose. Every pair below is non-1:1 by design ----------
  { id: 'c-garage', stage: 'stoich', skill: 'c', type: 'dose',
    system: 'The garage on Bell Street', icon: '\u{1FAA3}',
    goal: 'A jug of muriatic acid went over in a closed garage and it is running under a galvanized shelf unit. The zinc coating is fizzing. Work out how many grams of hydrogen the spilled acid can put into that room.',
    why: 'Hydrogen collects at the ceiling of a closed garage and there is a water heater with a pilot light on the far wall. The number decides whether you ventilate first or go straight in.',
    constraints: { reaction: 'zinc-acid', given: 'HCl', find: 'H2', unit: 'g', amount: [40, 260] },
    bands: DOSE_BANDS,
    actionLabel: 'Call the ventilation',
    safeState: 'VENTED', lowState: 'UNDER-CALLED', highState: 'OVER-CALLED',
    safe: 'You call it right, the fan goes in the door before anybody does, and the meter reads clean at the ceiling before the shelf gets touched.',
    low: 'You call it low, so the crew treats it as a small spill and walks in. The meter at head height is already reading, and the pilot light is nine feet away.',
    high: 'You call it high and the street gets shut down for a two-gram leak. Nobody is hurt, but the next time you call for an evacuation the officer is going to want it twice.',
    fail: 'The numbers never resolved, so nothing gets called, and the crew is standing in the doorway of a garage nobody has measured.' },
  { id: 'c-depot', stage: 'stoich', skill: 'c', type: 'dose',
    system: 'The depot synthesis loop', icon: '\u{1F3ED}',
    goal: 'The co-op line is down with a known charge of nitrogen still in it, and the loop runs three hydrogen for every nitrogen. Before anybody cuts power, work out the mass of hydrogen sitting in that pipe.',
    why: 'Ammonia is the corrosive problem and everybody sees it. Hydrogen is the one that decides where you stage, because it is the part that will find an ignition source. Whatever you call in is what the stage-back distance gets set from.',
    constraints: { reaction: 'haber', given: 'N2', find: 'H2', unit: 'g', amount: [200, 1400] },
    bands: DOSE_BANDS,
    actionLabel: 'Set the stage-back',
    safeState: 'STAGED CORRECTLY', lowState: 'STAGED TOO CLOSE', highState: 'STAGED TOO FAR',
    safe: 'The number holds. The engine sits back at a distance that matches what is actually in the pipe, and the depot crew bleeds the line down with everybody where they should be.',
    low: 'You call the hydrogen low and the engine stages close. When the line is bled the vent plume reaches further than the number said it would, and the crew moves in a hurry.',
    high: 'You call it high and the engine sits so far back the hose lay will not reach the depot. The bleed goes fine, but you were not covering it.',
    fail: 'The hydrogen mass never resolved, so the stage-back is set by eye and the pre-plan sheet stays blank.' },
  { id: 'c-bobtail', stage: 'stoich', skill: 'c', type: 'dose',
    system: 'The propane bobtail', icon: '\u{1F69B}',
    goal: 'A propane bobtail is on its side on the highway with a known mass of product venting. Work out the mass of oxygen that much propane needs to burn completely.',
    why: 'That number is the size of the air the cloud has to find. It is what tells you whether you are looking at a fire in the open, which burns where it is, or a cloud that drifts to a culvert and finds its air somewhere you are not standing.',
    constraints: { reaction: 'propane', given: 'C3H8', find: 'O2', unit: 'g', amount: [1500, 9000] },
    bands: DOSE_BANDS,
    actionLabel: 'Call the exclusion zone',
    safeState: 'ZONE HELD', lowState: 'ZONE TOO TIGHT', highState: 'ZONE TOO WIDE',
    safe: 'The oxygen demand comes out right, the exclusion zone matches the cloud, and the burn stays inside the tape until the product is gone.',
    low: 'You under-call the air it needs, so the zone is drawn tight. The cloud drifts past the tape looking for oxygen and finds it at a driveway with people still in it.',
    high: 'You over-call it and the zone swallows two subdivisions. It is safe, and it is four hours of people out of their houses for a cloud that was never going to reach them.',
    fail: 'The oxygen demand never resolved, so there is no zone, only tape where somebody guessed.' },

  // ---------- C.9(D) limiting reactant: dose plus the call that follows ----------
  { id: 'd-shack', stage: 'lr', skill: 'd', type: 'dose',
    system: 'The ice-fishing shack', icon: '\u{1F3D5}\u{FE0F}',
    goal: 'A propane heater has been running in a sealed shack on the lake. You know the methane charge that burned and the oxygen that was in the room. Work out the mass of carbon dioxide the reaction actually produced.',
    why: 'Whichever runs out first is the whole story. If the oxygen went first the burn was incomplete, and incomplete means carbon monoxide, which is why the person inside is unconscious and the flame looked normal.',
    constraints: { reaction: 'methane' },
    bands: DOSE_BANDS,
    actionLabel: 'Log it for the medics',
    safeState: 'READ CORRECTLY', lowState: 'UNDER-READ', highState: 'OVER-READ',
    safe: 'You work it off the reactant that ran out first and the number matches what the meter found in the room. The medics get told what they are treating before the patient is in the truck.',
    low: 'You come in under. The medics are told this was a small exposure and the patient goes to the county hospital instead of the chamber two towns over.',
    high: 'You come in over, off the reactant that was still there in excess when it stopped. The number is impossible for the size of that room, and the medic reading it back stops trusting the rest of the sheet.',
    fail: 'The yield never resolved, so the medics get a shrug and a room full of an unnamed gas.' },
  { id: 'd-ditch', stage: 'lr', skill: 'd', type: 'dose',
    system: 'The soda ash on the truck', icon: '\u{1F69B}',
    goal: 'The acid is in the ditch and the caustic is on the truck. You know both masses. Work out the mass of salt the reaction can actually make, which is the part of the spill you have neutralised.',
    why: 'It comes down to which one runs out. If the acid runs out you have taken the whole spill and the extra reagent is just cost. If your reagent runs out first, the acid that is left keeps moving, and it moves toward the creek.',
    constraints: { reaction: 'neutralize' },
    bands: DOSE_BANDS,
    // The only core stage that actually commits reagent: this call lays soda ash in a
    // ditch. Under-reading calls for more than the job needs; over-reading empties the
    // compartment onto a spill that was already taken.
    spend: { ok: 8, low: 5, high: 14 },
    actionLabel: 'Lay it in',
    safeState: 'SPILL TAKEN', lowState: 'UNDER-READ', highState: 'OVER-READ',
    safe: 'You work it off the reactant that runs out and the line of reagent takes the spill to the end of the ditch. The creek reads clean at the culvert.',
    low: 'You under-read what the reaction can take, so you call for more reagent than the call needs and burn the truck’s load on a spill that was already handled.',
    high: 'You over-read it, off the reactant that was in excess. You stand down thinking the ditch is done. It is not, and the far end is still running.',
    fail: 'The number never resolved, so nothing goes in the ditch while you work it out again.' },
  { id: 'd-shed', stage: 'lr', skill: 'd', type: 'dose',
    system: 'The chlorine shed', icon: '\u{2622}\u{FE0F}',
    goal: 'A chlorine cylinder is leaking in a shed stacked with aluminium stock, and the two are reacting. You know the mass of each. Work out the mass of aluminium chloride the shed can actually produce.',
    why: 'The product is a solid, so it tells you how much of the chlorine is being taken out of the air by the metal and how much is still gas looking for the door. Read it off the wrong reactant and you have the two backwards.',
    constraints: { reaction: 'aluminum-chloride' },
    bands: DOSE_BANDS,
    actionLabel: 'Call it to the shed team',
    safeState: 'READ CORRECTLY', lowState: 'UNDER-READ', highState: 'OVER-READ',
    safe: 'You take it off the one that runs out first. The figure matches what the crew finds as white solid on the stock, and the rest is accounted for as gas.',
    low: 'You under-read the solid, so more chlorine is written off as airborne than actually is. The downwind evacuation goes wider than it needed to on a windy afternoon.',
    high: 'You over-read the solid, off the reactant that was still sitting there. That says most of the chlorine is bound up safely. It is not, and the crew going in is dressed for the wrong problem.',
    fail: 'The yield never resolved, so nobody knows how much of that cylinder is on the stock and how much is still in the air.' },

  // ---------- Honors h1 (parent c): particle counts, a genuine C.8 crossover ----------
  { id: 'h1-particles', stage: 'honors1', skill: 'h1', type: 'dose',
    system: 'The state lab sample', icon: '\u{1F52C}',
    goal: 'The state lab wants the product from this call reported as a count of particles, not as a mass. Convert what the reaction makes into representative particles.',
    why: 'Mass is what you weigh and particles are what reacts, and the lab reports in the second because that is what compares across substances. Avogadro’s number is the bridge, and it is the step people drop when they are tired.',
    constraints: {}, bands: DOSE_BANDS,
    actionLabel: 'File it with the lab',
    safeState: 'FILED', lowState: 'COUNT LOW', highState: 'COUNT HIGH',
    safe: 'The count matches the mass you logged at the scene, and the sample goes into the state system clean.',
    low: 'The count comes in low against the mass on the same sheet. The lab flags the file and the sample sits until somebody re-does it.',
    high: 'The count comes in high against the logged mass. Same flag, same delay, and now two of your numbers disagree in a state database.',
    fail: 'The conversion never resolved, so the sample goes in with a mass and no count and comes straight back.' },

  // ---------- Honors h2 (parent d): what is left over, in grams ----------
  { id: 'h2-recovery', stage: 'honors2', skill: 'h2', type: 'dose',
    system: 'What comes back on the truck', icon: '\u{1F4E6}',
    goal: 'The call is over and the excess reactant is still sitting there unreacted. Work out how many grams of it are left, because that is what gets swept up and put back on the truck.',
    why: 'Reagent you recover is reagent the next call still has. Reagent you write off is reagent you buy again out of a volunteer budget. The leftover mass is the difference, and it is already sitting in the numbers you just ran.',
    constraints: {}, bands: DOSE_BANDS,
    actionLabel: 'Book it back in',
    safeState: 'RECOVERED', lowState: 'UNDER-BOOKED', highState: 'OVER-BOOKED',
    safe: 'The recovery figure matches what goes back in the compartment, and the truck starts the next call with a load you can trust.',
    low: 'You book back less than is actually there. The inventory says you are short, so the co-op order goes in early and the money goes out early with it.',
    high: 'You book back more than is there. The sheet says the truck is stocked. The next call finds out it is not, at the ditch, in the dark.',
    fail: 'The leftover never resolved, so it gets swept into a drum marked with a question mark.' },

  // ---------- Capstone: one call, everything at once ----------
  { id: 'cap-tanker', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'The tanker at the county line', icon: '\u{1F6A8}',
    goal: 'A tanker is leaking hydrochloric acid into a storm drain that runs to the creek. You have balanced it, you know it is an acid-base neutralisation, and you have the mass of soda ash it takes. Now check that against what is actually on your truck and make one call.',
    why: 'This is the whole rotation in one decision. The chemistry gives you a number; the truck gives you a different one; the call is what you do when they do not match. There is one defensible answer and it depends on both.',
    options: [
      { key: 'lay', label: 'Lay it down now',
        good: 'You have the reagent for this spill and you use it. The line goes in across the ditch above the drain, the reaction fizzes out inside four minutes, and the creek reads clean downstream.',
        consequence: 'You commit the truck to a spill it cannot cover. The line runs out two thirds of the way across, the rest goes down the drain, and now you have neither the reagent nor the time.' },
      { key: 'hold', label: 'Dam the drain, hold for mutual aid',
        good: 'You do not have enough on board, but the county does, and it is close enough to matter. The drain gets dammed with what you have, the second truck arrives with the balance, and the whole spill gets taken at once.',
        consequence: 'You hold when you did not need to. The reagent to finish this was on your own truck the whole time, and the acid ran for another eleven minutes while everybody waited on a second engine.' },
      { key: 'withdraw', label: 'Withdraw, call the state team',
        good: 'This is past what a volunteer crew and a mutual-aid truck can neutralise. You pull back, protect the drain, and hand it to a team with the tonnage for it, which is the call that keeps everybody out of a spill they cannot finish.',
        consequence: 'You withdraw from a spill you could have taken. The state team is ninety minutes out, the drain runs the whole time, and the creek is what pays for a call that was inside your capability.' }
    ] }
];
