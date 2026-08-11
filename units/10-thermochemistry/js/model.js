// model.js — Unit 10 domain data (Thermochemistry, TEKS C.13).
// Pure data plus the standards map. Every quantity that gets calculated lives in
// shared/js/chem.js (SPECIFIC_HEAT, heatTransfer, finalTemperature, classifyThermal,
// hessCombine, enthalpyFromFormation); this file only holds the pools the stages
// draw from and the scenario fiction that turns each number into a consequence.
//
// World: "Heat Line". You are the thermal medic on a mountain rescue team. A climber
// is going hypothermic on a ledge at 3,100 m. You carry chemical packs, a stove, a
// pot, and a shelter, and every call you make is a heat calculation.

// Standards map: each C.13 sub-letter drives one stage. Hess's law and enthalpy from
// formation are NOT named in C.13, so both ride the Honors track. Stable ids key the
// mastery meters in the right rail.
export const SE = [
  { id: 'a',  code: 'C.13(A)', mode: 'laws',        honors: false,
    text: 'Explain everyday examples that illustrate the four laws of thermodynamics.' },
  { id: 'b',  code: 'C.13(B)', mode: 'calorimeter', honors: false,
    text: 'Investigate the process of heat transfer using calorimetry.' },
  { id: 'c',  code: 'C.13(C)', mode: 'pack',        honors: false,
    text: 'Classify processes as exothermic or endothermic and represent the energy change with a thermochemical equation and an energy diagram.' },
  { id: 'd',  code: 'C.13(D)', mode: 'warm',        honors: false,
    text: 'Perform calculations involving heat, mass, temperature change, and specific heat.' },
  { id: 'h1', code: 'Honors',  mode: 'calorimeter', honors: true,
    text: "Honors: combine measured steps with Hess's law to get the enthalpy of a route nobody can measure directly." },
  { id: 'h2', code: 'Honors',  mode: 'calorimeter', honors: true,
    text: 'Honors: calculate a reaction enthalpy from standard heats of formation.' }
];

// The four laws, in the order a student meets them. `label` is the button text and
// has to be readable on its own, because picking the law IS the answer.
export const LAWS = [
  { key: 'zeroth', tag: 'Zeroth law',
    label: 'Two bodies that read the same temperature are in thermal equilibrium, so no net heat moves between them.' },
  { key: 'first',  tag: 'First law',
    label: 'Energy is conserved. It changes form or moves somewhere else, but none of it is created or destroyed.' },
  { key: 'second', tag: 'Second law',
    label: 'Heat flows on its own only from hot to cold, and the entropy of the universe rises.' },
  { key: 'third',  tag: 'Third law',
    label: 'No finite process can cool matter all the way to absolute zero.' }
];

// Materials the medic can actually pick from on the mountain. Keys match the
// SPECIFIC_HEAT table in chem.js so the <select> reads its c straight from the engine.
export const FIELD_MATERIALS = ['water', 'ice', 'ethanol', 'aluminum', 'copper', 'iron', 'granite', 'sand', 'glass'];

// Chemical packs the team carries. Every enthalpy is the real published value for the
// process as written: the dissolution enthalpies are per mole of salt, and the iron
// warmer is per 2 mol of Fe2O3 formed (2 x -824.2 kJ/mol of formation).
// `ea` is the schematic height of the energy barrier drawn on the diagram, not a
// measured activation energy; the diagram caption says so.
export const PACKS = [
  { key: 'cacl2',  name: 'calcium chloride hot pack',
    ce: 'CaCl2(s) -> Ca^2+(aq) + 2Cl^-(aq)', dH: -82.8, ea: 30, per: 'per mole of CaCl2',
    feel: 'the pouch climbs past 50 degrees Celsius in about ten seconds' },
  { key: 'mgso4',  name: 'magnesium sulfate hot pack',
    ce: 'MgSO4(s) -> Mg^2+(aq) + SO4^2-(aq)', dH: -91.2, ea: 34, per: 'per mole of MgSO4',
    feel: 'the pouch gets hot fast and holds it for about twenty minutes' },
  { key: 'ironair', name: 'air-activated iron warmer',
    ce: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)', dH: -1648.4, ea: 90, per: 'per 2 moles of Fe2O3 formed',
    feel: 'it warms slowly once air reaches the powder and stays warm for hours' },
  { key: 'nh4no3', name: 'ammonium nitrate cold pack',
    ce: 'NH4NO3(s) -> NH4^+(aq) + NO3^-(aq)', dH: 25.7, ea: 28, per: 'per mole of NH4NO3',
    feel: 'the pouch drops toward 2 degrees Celsius and sweats on the outside' },
  { key: 'nh4cl',  name: 'ammonium chloride cold pack',
    ce: 'NH4Cl(s) -> NH4^+(aq) + Cl^-(aq)', dH: 14.8, ea: 20, per: 'per mole of NH4Cl',
    feel: 'a gentle chill, cool enough for skin with a cloth between' },
  { key: 'kno3',   name: 'potassium nitrate cold pack',
    ce: 'KNO3(s) -> K^+(aq) + NO3^-(aq)', dH: 34.9, ea: 36, per: 'per mole of KNO3',
    feel: 'the coldest pouch in the kit, cold enough to burn bare skin' }
];

// Honors: routes for the stove that nobody can put in a calorimeter directly, so the
// enthalpy has to be assembled from steps that CAN be burned cleanly. Every dH is a
// real standard value in kJ, and every target is the exact sum of the listed steps.
export const HESS_ROUTES = [
  { id: 'coke-gas',
    story: 'The team can run the stove on wood gas, which means burning carbon short of full combustion so it stops at carbon monoxide. Nobody can measure that partial burn on its own, because carbon in air always runs on to carbon dioxide. So you burn it two ways you CAN measure and rebuild the route.',
    target: { ce: 'C(s) + 1/2 O2(g) -> CO(g)', dH: -110.5 },
    steps: [
      { ce: 'C(s) + O2(g) -> CO2(g)',           dH: -393.5, flip: false, scale: 1 },
      { ce: 'CO(g) + 1/2 O2(g) -> CO2(g)',      dH: -283.0, flip: true,  scale: 1 }
    ] },
  { id: 'acetylene',
    story: 'The emergency cutting torch runs on acetylene. Rescue base wants the enthalpy of building acetylene out of charcoal and hydrogen, a reaction that will not go in a calorimeter. All three combustions below burn cleanly, so you assemble the route from them.',
    target: { ce: '2C(s) + H2(g) -> C2H2(g)', dH: 226.8 },
    steps: [
      { ce: 'C(s) + O2(g) -> CO2(g)',                     dH: -393.5,  flip: false, scale: 2 },
      { ce: 'H2(g) + 1/2 O2(g) -> H2O(l)',                dH: -285.8,  flip: false, scale: 1 },
      { ce: 'C2H2(g) + 5/2 O2(g) -> 2CO2(g) + H2O(l)',    dH: -1299.6, flip: true,  scale: 1 }
    ] },
  { id: 'nox',
    story: 'The stove runs hot enough to cook nitrogen and oxygen straight out of the shelter air into brown nitrogen dioxide, which is why you never run it with the door zipped. You cannot measure that one step, but the two below are standard.',
    target: { ce: 'N2(g) + 2O2(g) -> 2NO2(g)', dH: 66.4 },
    steps: [
      { ce: 'N2(g) + O2(g) -> 2NO(g)',      dH: 180.6, flip: false, scale: 1 },
      { ce: '2NO(g) + O2(g) -> 2NO2(g)',    dH: -114.2, flip: false, scale: 1 }
    ] }
];

// Honors: standard enthalpies of formation, kJ/mol at 298 K. Elements in their
// standard state are exactly zero by definition. Values are the published standards,
// not invented, so the computed dHrxn matches a data table a student can check.
export const FORMATION_CASES = [
  { id: 'propane',
    story: 'The team packs propane cartridges. Before you commit to carrying three of them up the couloir, work out how much heat one mole of propane actually gives back.',
    ce: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(l)',
    reactants: [{ label: 'C3H8(g)', dHf: -103.8, coefficient: 1 }, { label: 'O2(g)', dHf: 0, coefficient: 5 }],
    products:  [{ label: 'CO2(g)', dHf: -393.5, coefficient: 3 }, { label: 'H2O(l)', dHf: -285.8, coefficient: 4 }] },
  { id: 'methane',
    story: 'The base camp stove burns methane off the mains line. Compare it against the propane cartridges you carry, one mole against one mole.',
    ce: 'CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)',
    reactants: [{ label: 'CH4(g)', dHf: -74.6, coefficient: 1 }, { label: 'O2(g)', dHf: 0, coefficient: 2 }],
    products:  [{ label: 'CO2(g)', dHf: -393.5, coefficient: 1 }, { label: 'H2O(l)', dHf: -285.8, coefficient: 2 }] },
  { id: 'ethanol',
    story: 'The backup stove burns ethanol, which will not freeze in the fuel bottle the way a gas cartridge chokes in the cold. Find out what one mole of it is worth.',
    ce: 'C2H5OH(l) + 3O2(g) -> 2CO2(g) + 3H2O(l)',
    reactants: [{ label: 'C2H5OH(l)', dHf: -277.6, coefficient: 1 }, { label: 'O2(g)', dHf: 0, coefficient: 3 }],
    products:  [{ label: 'CO2(g)', dHf: -393.5, coefficient: 2 }, { label: 'H2O(l)', dHf: -285.8, coefficient: 3 }] },
  { id: 'thermite',
    story: 'The signal kit holds a thermite charge for burning a mark into the snow that a pilot can see from ten kilometres out. Find out how much heat one charge dumps, so you know how far back the team has to stand.',
    ce: '2Al(s) + Fe2O3(s) -> Al2O3(s) + 2Fe(s)',
    reactants: [{ label: 'Al(s)', dHf: 0, coefficient: 2 }, { label: 'Fe2O3(s)', dHf: -824.2, coefficient: 1 }],
    products:  [{ label: 'Al2O3(s)', dHf: -1675.7, coefficient: 1 }, { label: 'Fe(s)', dHf: 0, coefficient: 2 }] },
  { id: 'lime',
    story: 'Somebody suggests baking the spent lime heaters back to life over the stove. Work out the enthalpy of that regeneration before anyone wastes fuel on it.',
    ce: 'CaCO3(s) -> CaO(s) + CO2(g)',
    reactants: [{ label: 'CaCO3(s)', dHf: -1207.6, coefficient: 1 }],
    products:  [{ label: 'CaO(s)', dHf: -634.9, coefficient: 1 }, { label: 'CO2(g)', dHf: -393.5, coefficient: 1 }] }
];

// Dose tolerance. The measurement stages genuinely vary, so both keep the four-band
// grading: relative for the q calculation, absolute degrees for the equilibrium
// prediction (a degree is a degree, whatever the pot holds).
const Q_BANDS = { mode: 'relative', ideal: 0.01, acceptable: 0.03 };
const T_BANDS = { mode: 'absolute', ideal: 0.4, acceptable: 1.2 };

// SCENARIOS — the game layer for Heat Line. One coherent world: a climber going
// hypothermic on a ledge, a team with packs, a stove, a pot, and a shelter.
//   laws (C.13A):        decision. Read the situation, name the law, and read the
//                        direction of heat flow. Every option carries its real
//                        consequence on the mountain.
//   pack (C.13C):        decision. Pick the pack the injury needs and classify it
//                        exothermic or endothermic; the energy diagram then draws it.
//   warm (C.13D):        dose. q = mc(dT). Pick the specific heat, work out the
//                        temperature change, commit the heat in kilojoules.
//   calorimeter (C.13B): dose. Balance heat lost against heat gained and predict the
//                        equilibrium temperature.
//   h1/h2 (Honors):      Hess's law routes and enthalpy from formation data.
//   cap:                 the whole rescue, then the evacuation call.
export const SCENARIOS = [
  // ---------- C.13(A) the four laws, read off real mountain situations ----------
  { id: 'a-two-packs', stage: 'laws', skill: 'a', type: 'decision',
    system: 'Spent pack check', icon: '\u{1F9E4}',
    goal: 'Two used heat packs have been in the same chest pocket for an hour. Both thermometers read 31.0 degrees Celsius. A rookie presses them together, hoping one will top the other one up. Name the law that settles it.',
    why: 'Eight minutes spent on a pack that cannot warm anything is eight minutes the climber spends losing core heat.',
    lawKey: 'zeroth',
    flow: { prompt: 'Which way does heat move between the two packs?',
      options: [
        { key: 'a2b',  label: 'From the first pack into the second' },
        { key: 'b2a',  label: 'From the second pack into the first' },
        { key: 'none', label: 'Neither way. There is no net flow.' }
      ], correct: 'none' },
    consequences: {
      zeroth: 'Right. Equal temperatures means thermal equilibrium and zero net flow. You drop the spent packs and crack a fresh one open.',
      first:  'You treat it as energy bookkeeping and keep the two spent packs pressed together waiting for the total to add up. Nothing warms. The climber loses eight minutes she does not have.',
      second: 'You wait for heat to run hot to cold, but neither pack is hotter, so nothing runs anywhere. You burn the minutes you should have spent on a fresh pack.',
      third:  'You go looking for a broken thermometer, because you think something is reading near absolute zero. It is reading 31 degrees Celsius, and the delay costs you.'
    } },
  { id: 'a-thermometer', stage: 'laws', skill: 'a', type: 'decision',
    system: 'Core temperature reading', icon: '\u{1F321}\u{FE0F}',
    goal: 'You hold a glass thermometer against the climber. The reading climbs, slows, then parks at 33.4 degrees Celsius and stays there. Name the law that explains why a thermometer can tell you anything at all.',
    why: 'Pull the thermometer too early and you read a number that is still climbing, which means you under-call the hypothermia and under-treat it.',
    lawKey: 'zeroth',
    flow: { prompt: 'Why does the reading stop climbing?',
      options: [
        { key: 'equal', label: 'The thermometer and the skin have reached the same temperature, so no net heat flows' },
        { key: 'full',  label: 'The thermometer has run out of room on its scale' },
        { key: 'cold',  label: 'The thermometer keeps pulling heat out, so the skin cools to match it' }
      ], correct: 'equal' },
    consequences: {
      zeroth: 'Right. A thermometer works only because it comes to equilibrium with what it touches. You hold it until the number parks, and you get a reading you can treat from.',
      first:  'You call it conservation of energy and pull the thermometer at nine seconds, mid climb. You log 31.8 degrees Celsius instead of 33.4 and radio in the wrong severity.',
      second: 'You reason that heat only ever flows one way and decide the thermometer will read low forever. You add a correction that is not real and log a number nobody can trust.',
      third:  'You decide the instrument is bottoming out near absolute zero and swap it for a spare, losing four minutes and getting the same reading.'
    } },
  { id: 'a-stove-books', stage: 'laws', skill: 'a', type: 'decision',
    system: 'Fuel accounting', icon: '\u{1F525}',
    goal: 'You burn one measured gas cartridge under the pot. The water gets hot, but so does the pot, the windscreen, and the air in the shelter. Add up the energy that landed in the water and it comes to far less than the fuel released. Name the law.',
    why: 'If you budget fuel as though every joule lands in the water, you run out of gas halfway through the night.',
    lawKey: 'first',
    flow: { prompt: 'Where did the rest of the energy go?',
      options: [
        { key: 'gone',  label: 'The flame destroyed it' },
        { key: 'spread', label: 'Into the pot, the windscreen, and the shelter air. It moved, it did not vanish.' },
        { key: 'stored', label: 'It is still locked inside the unburned fuel' }
      ], correct: 'spread' },
    consequences: {
      first:  'Right. Energy is conserved, so the shortfall is not missing, it is somewhere else. You add a lid and a windscreen, capture more of it, and stretch the cartridge through the night.',
      zeroth: 'You call it equilibrium and assume the pot and the water even out for free, so you budget one cartridge for the whole night. You are out of gas by 02:00 with hours of dark left.',
      second: 'You blame entropy, shrug, and change nothing. The heat keeps leaking into the shelter air and you burn a second cartridge you were saving for dawn.',
      third:  'You decide the cold is simply eating the energy. You stop trying to insulate anything and lose the same heat all night.'
    } },
  { id: 'a-shivering', stage: 'laws', skill: 'a', type: 'decision',
    system: 'Shivering', icon: '\u{1F976}',
    goal: 'The climber is shivering hard. Her muscles are burning through blood sugar fast, and the heat coming off her chest is climbing with it. Name the law that connects the sugar she is spending to the warmth you can feel.',
    why: 'Shivering is the body making its own heat, and it stops when the fuel runs out. Knowing that tells you to feed her and start external heat before the shivering quits.',
    lawKey: 'first',
    flow: { prompt: 'What happens to the chemical energy in the sugar?',
      options: [
        { key: 'heat', label: 'It becomes muscle work and heat. Nothing is created or destroyed.' },
        { key: 'gone', label: 'It is used up and disappears' },
        { key: 'cold', label: 'It turns into cold, which is what she feels' }
      ], correct: 'heat' },
    consequences: {
      first:  'Right. Chemical energy converts to work and heat, and the total is conserved. You get sugar into her and start external warming before the shivering burns out.',
      zeroth: 'You call it equilibrium and assume she will settle at a safe temperature on her own. She does settle, at 31 degrees Celsius, and the shivering stops.',
      second: 'You call it entropy and treat the shivering as waste to be stopped. You talk her out of it, and the one heat source she still had switches off.',
      third:  'You reach for absolute zero, which has nothing to do with a person burning sugar. Meanwhile nobody starts external rewarming.'
    } },
  { id: 'a-snow-windscreen', stage: 'laws', skill: 'a', type: 'decision',
    system: 'Stove windscreen', icon: '\u{2744}\u{FE0F}',
    goal: 'A teammate banks snow against the stove windscreen, saying the stove will pull the cold out of the snow and run cooler and safer. Name the law that says which way this actually goes.',
    why: 'That snow is going to melt into the burner and put the stove out. With the pot half heated and the light going, that is not a mistake you can afford.',
    lawKey: 'second',
    flow: { prompt: 'Which way does heat actually flow here?',
      options: [
        { key: 's2snow', label: 'From the stove into the snow' },
        { key: 'snow2s', label: 'From the snow into the stove, as cold' },
        { key: 'none',   label: 'Neither way, because snow is an insulator' }
      ], correct: 's2snow' },
    consequences: {
      second: 'Right. Heat only runs hot to cold on its own, so the stove melts the snow, not the other way round. You move the snow bank back and the burner stays lit.',
      zeroth: 'You call it equilibrium and leave the snow packed against the windscreen. Meltwater floods the burner and the stove dies with the pot half warm.',
      first:  'You call it conservation, decide it all balances out, and leave the snow where it is. The stove drowns in its own meltwater.',
      third:  'You bring up absolute zero, which is 273 degrees below anything on this mountain. The snow stays, the burner floods, and the pot goes cold.'
    } },
  { id: 'a-spent-pack', stage: 'laws', skill: 'a', type: 'decision',
    system: 'Cold pack on a warm chest', icon: '\u{1F9CA}',
    goal: 'The spent pack is now down to 6 degrees Celsius. The climber’s chest is 33 degrees Celsius. A teammate wants to strap the pack on anyway to hold the warmth in. Name the law that tells you what will really happen.',
    why: 'Strapping something cold to a hypothermic chest pulls heat straight out of the core she has left. That is the direction that kills people.',
    lawKey: 'second',
    flow: { prompt: 'Which way will heat flow once the pack touches her chest?',
      options: [
        { key: 'chest2pack', label: 'Out of her chest and into the pack' },
        { key: 'pack2chest', label: 'Out of the pack and into her chest' },
        { key: 'none',       label: 'Neither, because the pack is spent' }
      ], correct: 'chest2pack' },
    consequences: {
      second: 'Right. Heat runs from the warm chest into the cold pack, never the reverse. You bin the pack and get a fresh warm one against her skin.',
      zeroth: 'You call it equilibrium and see no harm in it. The pack sits on her chest pulling core heat out for eleven minutes before anyone notices her shivering stop.',
      first:  'You call it conservation, reason the warmth is held rather than lost, and strap it on. Her core drops another half degree while it sits there.',
      third:  'You argue about absolute zero while the cold pack sits on a hypothermic chest.'
    } },
  { id: 'a-battery-cold', stage: 'laws', skill: 'a', type: 'decision',
    system: 'Radio batteries', icon: '\u{1F50B}',
    goal: 'A new team member asks whether a night on the summit could get cold enough to reach absolute zero and freeze the radio batteries solid forever. Name the law that answers her.',
    why: 'The radio is your only line to the helicopter. You need the real reason batteries fail in the cold, which is sluggish chemistry, not a run at absolute zero.',
    lawKey: 'third',
    flow: { prompt: 'What does that law actually say about absolute zero?',
      options: [
        { key: 'unreachable', label: 'No finite process can cool matter all the way to 0 kelvin' },
        { key: 'reached',     label: 'It is reached on clear polar nights' },
        { key: 'below',       label: 'Temperature can drop below it if the wind chill is severe enough' }
      ], correct: 'unreachable' },
    consequences: {
      third:  'Right. Absolute zero is a limit nothing finite reaches, and the summit is 230 degrees above it. You keep the batteries inside your jacket for the real reason, which is slow chemistry in the cold.',
      zeroth: 'You call it equilibrium and leave the batteries in the outside pocket to even out with the air. They even out at minus 22 degrees Celsius and the radio dies on the first call.',
      first:  'You call it conservation and tell her the energy is all still in there. The radio still cuts out, because the cold slowed the cell chemistry, and you never fixed that.',
      second: 'You call it entropy and leave it there. Nobody warms the batteries and the helicopter call drops halfway through the grid reference.'
    } },
  { id: 'a-cryo-stage', stage: 'laws', skill: 'a', type: 'decision',
    system: 'Base camp lab cooler', icon: '\u{1F9EA}',
    goal: 'Rescue base runs a cooler that takes a blood sample to 0.5 kelvin and then stalls. Each extra cooling stage they bolt on removes less heat than the one before it. Name the law.',
    why: 'The lab wants to buy two more stages. Someone has to tell them what those stages will and will not buy.',
    lawKey: 'third',
    flow: { prompt: 'Why does each extra stage remove less heat?',
      options: [
        { key: 'harder', label: 'Entropy is closing on its minimum, so each step toward 0 kelvin takes more work and returns less cooling' },
        { key: 'broken', label: 'The cooler is worn out and needs a service' },
        { key: 'leak',   label: 'Heat is leaking back in through the insulation, and better insulation would fix it' }
      ], correct: 'harder' },
    consequences: {
      third:  'Right. Approaching absolute zero costs unbounded work for shrinking returns. You tell the lab to stop at 0.5 kelvin and spend the money on a second centrifuge.',
      zeroth: 'You call it equilibrium and tell them to wait longer. They wait three weeks and the sample never goes below 0.5 kelvin.',
      first:  'You call it conservation and tell them to feed in more power. They double the power draw, trip the camp generator, and still sit at 0.5 kelvin.',
      second: 'You call it entropy in general and tell them to add insulation. They rewrap the whole cryostat and gain 0.02 kelvin for four days of work.'
    } },

  // ---------- C.13(C) pick the pack, classify the process, draw the diagram ----------
  { id: 'c-hypothermia', stage: 'pack', skill: 'c', type: 'decision',
    system: 'Chest rewarming', icon: '\u{1F525}',
    goal: 'The climber is at 33.4 degrees Celsius and shivering. You need heat against her chest and armpits now. Two pouches are left in the kit. Pick the one that will actually put heat into her, then classify the process running inside it.',
    why: 'Below 32 degrees Celsius shivering stops, and once it stops she has no way left to make her own heat. Get the wrong pouch out of the bag and you speed that up.',
    constraints: { packs: ['cacl2', 'nh4no3'], need: 'hot' },
    consequences: {
      cacl2:  'The pouch turns hot in your hands and you get it against her chest. Ten minutes later she is shivering harder, which is the sign you wanted.',
      nh4no3: 'The pouch goes cold against her chest and pulls heat straight out of the core she has left. Her shivering stops at 31.8 degrees Celsius and now you are in a much worse rescue.'
    } },
  { id: 'c-ankle', stage: 'pack', skill: 'c', type: 'decision',
    system: 'Swollen ankle', icon: '\u{1F9B6}',
    goal: 'The second climber rolled an ankle on the descent and it is ballooning. You want cold on it to hold the swelling down before the boot stops fitting. Pick the pouch, then classify what is happening inside it.',
    why: 'If that ankle swells past the boot he is not walking out, and a carry off this slope means four more people in the dark.',
    constraints: { packs: ['nh4cl', 'mgso4'], need: 'cold' },
    consequences: {
      nh4cl: 'The pouch chills, you wrap it with a layer of cloth between, and the swelling stalls. He gets the boot back on and walks down.',
      mgso4: 'The pouch turns hot on a fresh injury. Blood floods the joint, the ankle swells past the boot inside twenty minutes, and now you are planning a carry.'
    } },
  { id: 'c-heat-exhaust', stage: 'pack', skill: 'c', type: 'decision',
    system: 'Heat exhaustion', icon: '\u{2600}\u{FE0F}',
    goal: 'Summer callout, south face, no shade. A hiker is flushed, cramping, and stumbling at 39.8 degrees Celsius. You need heat out of him fast. Pick the pouch for the back of his neck and armpits, then classify the process.',
    why: 'Above 40 degrees Celsius you are heading for heat stroke and organ damage. Cooling in the first thirty minutes is the whole treatment.',
    constraints: { packs: ['kno3', 'ironair'], need: 'cold' },
    consequences: {
      kno3:    'The pouch runs cold, you get it on his neck through a shirt, and his temperature is falling by the time the helicopter lifts.',
      ironair: 'The warmer heats up against a man already at 39.8 degrees Celsius. He crosses 40, stops sweating, and goes quiet. You have just made a heat emergency into a heat stroke.'
    } },
  { id: 'c-fluid-bag', stage: 'pack', skill: 'c', type: 'decision',
    system: 'Warming the fluid bag', icon: '\u{1F4A7}',
    goal: 'The saline bag has been in the pack all day and reads 2 degrees Celsius. Cold fluid into a hypothermic patient makes her colder. Pick the pouch to wrap around the bag, then classify the process.',
    why: 'Room temperature fluid into a 33 degree patient is a cooling drip. It has to be warmed on the way in or you are treating her backwards.',
    constraints: { packs: ['ironair', 'nh4no3'], need: 'hot' },
    consequences: {
      ironair: 'The warmer holds a steady heat for hours, which is exactly what a slow drip needs. The fluid goes in warm and she stops losing ground.',
      nh4no3: 'You wrap a cold pack around a bag that was already too cold. The fluid goes in at 3 degrees Celsius and drives her core down while you watch.'
    } },

  // ---------- C.13(D) q = mc(dT), the rewarming dose ----------
  { id: 'd-bottle', stage: 'warm', skill: 'd', type: 'dose',
    system: 'Chest bottle', icon: '\u{1F6B0}',
    goal: 'Fill the rewarming bottle from the pot and heat it to the temperature the protocol wants, then tell the stove how much heat to put in.',
    why: 'This bottle goes against the skin of her chest. Short the heat and it is a warm rock that does nothing. Overdo it and you burn a patient who cannot feel the burn.',
    constraints: { material: 'water', massMin: 900, massMax: 1400, startMin: 4, startMax: 12, targetMin: 40, targetMax: 45 },
    bands: Q_BANDS, actionLabel: 'Run the stove',
    safeState: 'BOTTLE ON SPEC', lowState: 'STILL COLD', highState: 'BURN RISK',
    safe: 'The bottle comes off the stove right on temperature and goes against her chest. Her core stops falling.',
    low: 'The bottle comes out lukewarm. It does nothing against her chest, she keeps dropping, and you have burned fuel for no gain.',
    high: 'The bottle comes off far too hot. She cannot feel how hot because the cold has numbed her skin, and you leave a contact burn across her chest.',
    fail: 'The heat never resolved, so the stove stays off and the bottle stays cold.' },
  { id: 'd-saline', stage: 'warm', skill: 'd', type: 'dose',
    system: 'Fluid warmer', icon: '\u{1F489}',
    goal: 'The saline has to come up to body temperature before it goes in. Work out the heat the warming coil has to deliver.',
    why: 'Fluid that goes in cold cools her from the inside, where you cannot get it back. Fluid that goes in hot damages blood cells.',
    constraints: { material: 'water', massMin: 400, massMax: 700, startMin: 2, startMax: 8, targetMin: 37, targetMax: 40 },
    bands: Q_BANDS, actionLabel: 'Start the drip',
    safeState: 'FLUID AT BODY TEMP', lowState: 'COLD DRIP', highState: 'OVERHEATED',
    safe: 'The line runs warm into her arm and her core temperature starts climbing instead of sliding.',
    low: 'The drip runs cold into a hypothermic patient. Every millilitre pulls heat out of her core and the monitor shows it.',
    high: 'The coil overheats the saline. Warm fluid becomes hot fluid, red cells break down, and the line has to come out.',
    fail: 'The heat never resolved, so the coil stays off and the fluid runs in at pack temperature.' },
  { id: 'd-stone', stage: 'warm', skill: 'd', type: 'dose',
    system: 'Heated stone', icon: '\u{1FAA8}',
    goal: 'There is a granite slab by the stove. Heat it, wrap it, and put it at the foot of her sleeping bag. Work out the heat the stove has to deliver to the slab.',
    why: 'Granite holds heat for hours, which is why it is worth the fuel. But granite takes far less heat per degree than water, so the same fuel takes it much higher, and a slab that runs too hot scorches the bag and the skin under it.',
    constraints: { material: 'granite', massMin: 1500, massMax: 2500, startMin: -2, startMax: 4, targetMin: 55, targetMax: 68 },
    bands: Q_BANDS, actionLabel: 'Heat the slab',
    safeState: 'SLAB ON SPEC', lowState: 'SLAB TOO COOL', highState: 'SCORCH RISK',
    safe: 'The slab comes off the stove on temperature, wrapped and set at her feet. It is still giving heat back at 04:00.',
    low: 'The slab never gets hot enough to matter. It is stone cold again by midnight and the fuel is gone.',
    high: 'The slab comes off dangerously hot. It scorches the sleeping bag liner and leaves a burn on her calf that nobody feels happening.',
    fail: 'The heat never resolved, so the slab sits cold beside the stove.' },

  // ---------- C.13(B) calorimetry: heat lost equals heat gained ----------
  { id: 'b-stone-pot', stage: 'calorimeter', skill: 'b', type: 'dose',
    system: 'Shelter pot', icon: '\u{1F958}',
    goal: 'A stone has been sitting in the fire. Drop it into the pot of meltwater in the shelter and predict the temperature the two will settle at. Nothing escapes the insulated pot, so the heat the stone loses is exactly the heat the water gains.',
    why: 'That pot is the shelter’s heat store for the night, and it is also the water she drinks. Predict it wrong and you either refreeze it or scald her.',
    constraints: { hotMaterial: 'granite', hotMin: 600, hotMax: 900, hotTMin: 150, hotTMax: 220,
                   coldMaterial: 'water', coldMin: 1200, coldMax: 1800, coldTMin: 2, coldTMax: 6 },
    bands: T_BANDS, actionLabel: 'Drop the stone in',
    safeState: 'SHELTER HOLDS', lowState: 'POT REFREEZES', highState: 'SCALD RISK',
    safe: 'You call the settling temperature to the degree, and the pot holds a working heat all night without ever getting near scalding.',
    low: 'You call it colder than it lands, so you drop in a second stone. The pot climbs past 60 degrees Celsius and the first cup you pour scalds her mouth.',
    high: 'You call it warmer than it lands, so you skip the second stone. The pot skins over with ice by 03:00 and the shelter loses its heat store.',
    fail: 'The balance never resolved, so nobody knows what the pot will do.' },
  { id: 'b-hot-water', stage: 'calorimeter', skill: 'b', type: 'dose',
    system: 'Mixing the pot', icon: '\u{1F375}',
    goal: 'You have hot water in the kettle and cold meltwater in the pot. Pour the hot into the cold and predict where the mix settles, before you commit the fuel you spent heating it.',
    why: 'This mix fills the rewarming bottle. Too cool and the bottle is useless. Too hot and you cannot put it against her skin.',
    constraints: { hotMaterial: 'water', hotMin: 500, hotMax: 800, hotTMin: 86, hotTMax: 96,
                   coldMaterial: 'water', coldMin: 1000, coldMax: 1600, coldTMin: 1, coldTMax: 5 },
    bands: T_BANDS, actionLabel: 'Pour it in',
    safeState: 'MIX ON SPEC', lowState: 'MIX TOO COOL', highState: 'TOO HOT TO USE',
    safe: 'The mix lands exactly where you said, and the bottle you fill from it goes straight against her chest.',
    low: 'You predicted cooler than it lands, so you add another kettle. The bottle comes out too hot to hold against skin and has to be set aside to cool while she waits.',
    high: 'You predicted warmer than it lands. The bottle is lukewarm, you find out when it is already inside her jacket, and the whole kettle of fuel is wasted.',
    fail: 'The balance never resolved, so the pour is a guess.' },
  { id: 'b-skillet', stage: 'calorimeter', skill: 'b', type: 'dose',
    system: 'Iron plate', icon: '\u{1F373}',
    goal: 'The team carries a cast iron plate for the stove. It is glowing hot. Quench it in the pot and predict the settling temperature, so you know whether the pot is safe to drink from afterwards.',
    why: 'Iron takes far less heat per gram than water does, so the plate has less stored in it than its temperature suggests. Read that wrong and you plan the night around heat that is not there.',
    constraints: { hotMaterial: 'iron', hotMin: 400, hotMax: 700, hotTMin: 200, hotTMax: 280,
                   coldMaterial: 'water', coldMin: 900, coldMax: 1400, coldTMin: 3, coldTMax: 8 },
    bands: T_BANDS, actionLabel: 'Quench the plate',
    safeState: 'POT SAFE', lowState: 'POT REFREEZES', highState: 'SCALD RISK',
    safe: 'You call it right. The pot lands at a temperature you can drink from and it stays useful for hours.',
    low: 'You underestimate the settle, so you quench the plate a second time. The pot goes past scalding and burns her lip.',
    high: 'You overestimate the settle and treat the pot as the night’s heat store. It is back to 6 degrees Celsius before midnight.',
    fail: 'The balance never resolved, so the quench is a guess.' },

  // ---------- Honors: Hess's law route for the stove ----------
  { id: 'h1-route', stage: 'calorimeter', skill: 'h1', type: 'identity',
    system: 'Fuel route', icon: '\u{2699}\u{FE0F}',
    goal: 'Rescue base needs the enthalpy of a reaction nobody can run in a calorimeter. Take the steps that CAN be measured, flip and scale them until they add up to the route you want, and read off the total.',
    why: 'Enthalpy is a state function, so any set of steps that sums to the target gives the same answer. That is the only reason a table of measured combustions can price a reaction nobody has ever isolated.',
    success: 'The steps sum to the target and base gets a number they can plan fuel loads from.',
    fail: 'The steps do not sum to the target, so the number is wrong and the fuel plan is built on it.' },

  // ---------- Honors: enthalpy from formation data ----------
  { id: 'h2-formation', stage: 'calorimeter', skill: 'h2', type: 'identity',
    system: 'Formation data', icon: '\u{1F4D8}',
    goal: 'Base sends the standard heats of formation for every species in the equation. Work the reaction enthalpy out of them, then classify the reaction.',
    why: 'Formation data is one table that prices any reaction you can balance, which beats running a calorimeter for every fuel the team might carry.',
    success: 'The enthalpy checks out and the fuel comparison goes in the report.',
    fail: 'The enthalpy is off, so the comparison sends the team up with the wrong fuel.' },

  // ---------- Capstone: the whole rescue, then the call ----------
  { id: 'cap-evac', stage: 'capstone', skill: 'cap', type: 'decision',
    system: 'The call', icon: '\u{1F681}',
    goal: 'Light is going. Pick the pack, size the rewarming heat, predict what the shelter pot will settle at, then make the evacuation call.',
    why: 'Every one of those is a heat calculation, and the last one decides whether she comes off this mountain tonight or in the morning.',
    options: [
      { key: 'heli', label: 'Call the helicopter to the ledge',
        good: 'The ceiling is above the ledge, so the aircraft can reach you. She is in a hospital bed inside forty minutes.',
        consequence: 'You call for an aircraft that cannot get in under this ceiling. The crew burns an hour trying, and you have spent the last of the light waiting on a rotor you were never going to hear.' },
      { key: 'carry', label: 'Carry her down on foot now',
        good: 'She is warm enough and stable enough to move, and the ceiling is on the deck, so the team gets her down the ridge before full dark.',
        consequence: 'You move a patient who is not stable enough for it. Cold blood from her limbs washes into her core on the first hard section of the carry, her rhythm goes, and she arrests on the ridge.' },
      { key: 'hold', label: 'Hold in the shelter until first light',
        good: 'Nothing can fly in and she is too cold to move safely, so you hold, keep the heat going, and hand her over at first light with a core temperature two degrees better than you found.',
        consequence: 'You hold when you did not have to. She spends a night on a ledge that she could have spent in a hospital, and her core is lower at dawn than it was at dusk.' }
    ] }
];
