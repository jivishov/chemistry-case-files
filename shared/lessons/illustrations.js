import { escapeHTML as e } from './models.js';

// Original, local, schematic teaching illustrations. Each entry states what the
// marks mean; no decorative photograph stands in for a scientific explanation.
const ink='#203c38', green='#19725b', blue='#386f9c', orange='#b65b32', pale='#e5efe8';
const text=(x,y,s,size=15,anchor='middle',fill=ink)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-size="${size}">${e(s)}</text>`;
const line=(x,y,x2,y2,color=green,dash='')=>`<path d="M${x},${y} L${x2},${y2}" fill="none" stroke="${color}" stroke-width="2" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
const arrow=(x,y,x2,y2,color=green)=>{
  const a=Math.atan2(y2-y,x2-x), length=7;
  return line(x,y,x2,y2,color)+`<path d="M${x2-length*Math.cos(a-.45)},${y2-length*Math.sin(a-.45)} L${x2},${y2} L${x2-length*Math.cos(a+.45)},${y2-length*Math.sin(a+.45)}" fill="none" stroke="${color}" stroke-width="2"/>`;
};
const rect=(x,y,w,h,fill=pale,stroke=green)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
const circle=(x,y,r,fill=pale,stroke=green)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
const atom=(x,y,s,r=12)=>circle(x,y,r,s==='O'?'#f5dfce':s==='N'?'#dbe8f5':pale,s==='O'?orange:s==='N'?blue:green)+text(x,y+4,s,r>10?13:11);
const pair=(x,y,s='H')=>line(x,y,x+23,y)+atom(x,y,s)+atom(x+23,y,s);
const water=(x,y)=>line(x,y,x-19,y+14.7)+line(x,y,x+19,y+14.7)+atom(x,y,'O')+atom(x-19,y+14.7,'H',9)+atom(x+19,y+14.7,'H',9);
const dots=(x,y,n,cols=4,color=green,r=5)=>Array.from({length:n},(_,i)=>circle(x+i%cols*19,y+Math.floor(i/cols)*19,r,color,color)).join('');
const vessel=(x,y,w,h,level=.7)=>rect(x,y,w,h,'none')+`<path d="M${x+2},${y+h*(1-level)} H${x+w-2} V${y+h-2} H${x+2} Z" fill="#dcebf1"/>`;
const panel=(x,title,inner)=>text(x+110,21,title,15)+inner;
const two=(a,b,captionA,captionB)=>panel(10,captionA,a)+panel(250,captionB,b);
const route=(labels,notes=[])=>labels.map((s,i)=>{
  const w=430/labels.length,x=20+i*(440/labels.length);
  return rect(x,45,w-20,50)+text(x+(w-20)/2,75,s,labels.length>3?13:16)+(notes[i]?text(x+(w-20)/2,120,notes[i],13):'')+(i<labels.length-1?arrow(x+w-17,70,x+440/labels.length-4,70):'');
}).join('');
const bars=(labels,values,unit='')=>labels.map((s,i)=>text(12,40+i*37,s,14,'start')+rect(125,23+i*37,320*values[i],24,i===0?'#dcebf1':pale)+text(116+320*values[i],40+i*37,unit?Math.round(values[i]*100)+unit:'',13,'end')).join('');
const reaction=()=>pair(34,74)+pair(92,74)+text(145,80,'+',20)+pair(176,74,'O')+arrow(235,74,279,74)+water(329,66)+water(413,66)+text(76,126,'2H₂',16)+text(188,126,'O₂',16)+text(371,126,'2H₂O',16);
const orbital=(x,y,arrows)=>rect(x,y,33,30,'#fffef9')+text(x+16.5,y+22,arrows,23);
const orbitals=(x,y,items)=>items.map((a,i)=>orbital(x+i*40,y,a)).join('');
const trendTable=()=>Array.from({length:4},(_,r)=>Array.from({length:8},(_,c)=>rect(110+c*27,40+r*18,23,14,'#f2f5ee','#a2b6aa')).join('')).join('');
const diagrams={};
const add=(key,caption,draw)=>{diagrams[key]={caption,draw};};

add('1/matter','A mixture keeps distinct substances; a compound joins elements in a fixed ratio.',()=>two(
  dots(60,58,6,3)+dots(134,58,6,3,orange),
  [0,1,2].map(i=>atom(295+i*48,63,'A')+atom(312+i*48,81,'B')).join(''),
  'Mixture: variable proportions','Compound: repeated AB units'));
add('1/measure','Read the bottom of the meniscus with your eye at the same height.',()=>{
  let s=vessel(170,18,95,115,.6)+`<path d="M172,61 Q218,77 263,61" fill="none" stroke="${blue}" stroke-width="3"/>`;
  for(let i=0;i<5;i++)s+=line(245,38+i*17,263,38+i*17)+text(287,43+i*17,String(28-i),13);
  return s+line(35,69,230,69,orange,'4 4')+`<ellipse cx="45" cy="69" rx="20" ry="10" fill="white" stroke="${ink}"/>`+circle(45,69,5,ink)+text(88,113,'Eye level',14)+text(386,70,'Bottom of curve',14)+text(217,151,'Scale in mL',13);
});
add('1/sigfig','One estimated digit extends an analog reading beyond the marked scale.',()=>{
  let s=line(40,80,440,80);for(let i=0;i<=10;i++)s+=line(40+i*40,80,40+i*40,i%5?65:51)+text(40+i*40,107,String(20+i),13);
  return s+arrow(296,20,296,77,orange)+text(296,17,'26.4 mL',16)+text(240,141,'1 mL divisions → estimate tenths',14);
});
add('1/density','Displaced water gives the object’s volume; mass divided by volume gives density.',()=>two(
  vessel(75,39,90,96,.38)+text(120,153,'20.0 mL',14),
  vessel(315,39,90,96,.76)+rect(341,82,35,39,'#839b90')+text(360,153,'40.0 mL',14),
  'Before immersion','After immersion')+arrow(193,87,275,87)+text(235,61,'+20.0 mL',14));
add('1/evaluate','A tight cluster can miss the reference. Precision alone does not establish accuracy.',()=>{
  const target=(x)=>[38,25,10].map(r=>circle(x,79,r,'none','#91aba0')).join('')+line(x-45,79,x+45,79,'#91aba0')+line(x,34,x,124,'#91aba0');
  return two(target(120)+dots(91,61,4,2,orange,3),target(360)+circle(358,77,3,green)+circle(366,84,3,green)+circle(354,85,3,green),'Precise, biased','Precise, near reference');
});
add('1/uncertainty','Overlapping density intervals leave an identification unresolved.',()=>line(55,114,435,114)+line(100,57,320,57,blue)+line(205,85,392,85,orange)+circle(210,57,5,blue)+circle(297,85,5,orange)+text(210,39,'Material A interval',15)+text(300,106,'Material B interval',15)+text(245,144,'Density →',14));
add('1/spread','Spread measures scatter around the mean; the reference may lie elsewhere.',()=>line(45,90,435,90)+[110,205,300].map(x=>circle(x,80,6,blue)).join('')+line(205,32,205,111,green,'3 3')+text(205,23,'Mean 10.0',14)+text(110,132,'9.8',14)+text(300,132,'10.2 mL',14)+line(405,35,405,113,orange)+text(397,23,'Reference 10.5',13));

add('2/models','Most alpha probes pass through; rare large deflections support a compact nucleus.',()=>{
  let s=circle(237,76,62,'none','#a6b7ad')+circle(237,76,7,orange)+text(239,155,'Atom shown schematically; nucleus enlarged',13);
  s+=arrow(30,37,440,37,blue)+arrow(30,116,440,116,blue)+line(30,76,213,76,orange)+arrow(213,76,123,21,orange);
  return s+text(380,82,'Rare deflection',13)+text(340,16,'Most pass through',13);
});
add('2/build','Protons fix the element, neutrons the isotope, and electrons the ion’s charge.',()=>route(['12 protons','13 neutrons','10 electrons'],['Z = 12 (Mg)','A = 25','Charge = +2']));
add('2/mass','Three light isotopes for every heavy isotope place the mean closer to the light mass.',()=>[70,151,232,368].map((x,i)=>circle(x,68,24,i===3?'#f5dfce':pale)+text(x,73,i===3?'11 u':'10 u',15)).join('')+line(75,124,375,124)+text(75,150,'10.00',13)+text(375,150,'11.00 u',13)+arrow(150,97,150,124)+text(223,112,'Mean 10.25 u',14));
add('2/spectra','A larger downward energy change emits a higher-energy photon.',()=>line(50,125,50,22)+text(51,16,'Energy',13)+[35,77,120].map((y,i)=>line(80,y,273,y)+text(298,y+5,['Excited','Intermediate','Lower'][i],13,'start')).join('')+arrow(126,40,126,115,blue)+arrow(222,81,222,115,orange)+text(111,150,'Larger ΔE',13)+text(239,150,'Smaller ΔE',13));
add('2/config','Oxygen’s six outer-shell electrons occupy one 2s and three 2p orbitals.',()=>orbitals(70,54,['↑↓'])+orbitals(188,54,['↑↓','↑','↑'])+text(86,35,'2s²',17)+text(244,35,'2p⁴',17)+text(241,128,'Each box is one orbital, not an electron path.',14));
add('2/photon','At the same light speed, a shorter wavelength means more cycles and higher photon energy.',()=>{
  const wave=(y,period,color)=>`<path d="${Array.from({length:401},(_,i)=>`${i?'L':'M'}${40+i},${y+13*Math.sin(i/period*2*Math.PI)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2"/>`;
  return text(240,19,'Shorter λ: higher energy per photon',14)+wave(47,55,blue)+wave(108,105,orange)+text(240,150,'Longer λ: lower energy per photon',14);
});
add('2/orbitals','Chromium’s observed configuration has five singly occupied 3d orbitals and one 4s electron.',()=>orbitals(55,57,['↑','↑','↑','↑','↑'])+orbital(364,57,'↑')+text(152,37,'3d⁵',17)+text(381,37,'4s¹',17)+text(240,131,'[Ar] core omitted; boxes show orbitals.',14));

add('3/history','A gap was a prediction to test; the modern ordering follows atomic number.',()=>[0,1,2,3,4].map((i)=>rect(25+i*88,47,70,53,i===2?'#fffef9':pale,i===2?orange:green)+text(60+i*88,80,['Known','Known','?','Known','Known'][i],15)).join('')+text(236,25,'Repeated chemical patterns',15)+text(240,134,'A successful prediction gives the pattern evidence.',14));
add('3/families','Main-group valence patterns help predict common ions; helium is a two-electron exception.',()=>['1','2','17','18'].map((g,i)=>rect(25+i*115,37,89,76)+text(69+i*115,24,'Group '+g,15)+text(69+i*115,66,['1 outer e⁻','2 outer e⁻','7 outer e⁻','Full shell'][i],13)+text(69+i*115,96,['+1','+2','−1','Often inert'][i],15)).join(''));
add('3/trends','These are broad main-group patterns. Local exceptions and reaction-specific behavior still matter.',()=>trendTable()+arrow(118,125,322,125)+arrow(339,109,339,35)+text(229,148,'Ionization energy generally rises',13)+arrow(97,45,97,112,orange)+arrow(313,26,117,26,orange)+text(51,89,'Radius',13)+text(386,77,'EN also rises',13));
add('3/evidence','The middle point is an estimate between supplied neighbors, not a new measurement.',()=>line(64,125,423,125)+line(64,125,64,23)+line(96,105,391,39,blue,'4 4')+circle(96,105,6,blue)+circle(243,72,6,'white',orange)+circle(391,39,6,blue)+text(103,88,'110 pm',14)+text(241,55,'120 pm?',14)+text(390,23,'130 pm',14)+text(246,151,'Neighboring positions',13));
add('3/shielding','Other electrons reduce the net attraction felt by an outer electron; shielding is incomplete.',()=>circle(196,81,62,'none','#a7bbaa')+circle(196,81,30,'#e5efe8')+atom(196,81,'+',17)+[0,1,2,3].map(i=>circle(196+30*Math.cos(i*Math.PI/2),81+30*Math.sin(i*Math.PI/2),6,blue)).join('')+circle(258,81,7,orange)+arrow(250,81,220,81,orange)+text(365,59,'Outer electron',14)+text(365,92,'Reduced attraction',14)+text(104,153,'Core electrons shield partly',14,'start'));
add('3/exceptions','Pairing in oxygen’s 2p subshell helps explain the ionization-energy dip from N to O.',()=>two(orbitals(64,56,['↑','↑','↑'])+text(120,126,'Three unpaired',14),orbitals(304,56,['↑↓','↑','↑'])+text(360,126,'One paired orbital',14),'N: 2p³','O: 2p⁴'));

add('4/bond','H–Cl shares electron density unevenly. Partial charges are not full ion charges.',()=>`<ellipse cx="266" cy="78" rx="93" ry="30" fill="#dbe8dd"/>`+line(145,78,320,78)+atom(145,78,'H',24)+atom(320,78,'Cl',29)+text(145,32,'δ+',18)+text(320,32,'δ−',18)+arrow(194,117,283,117)+text(240,148,'Electron density shifted toward Cl',14));
add('4/names','Two Al³⁺ and three O²⁻ ions balance charge in Al₂O₃; this is a ratio, not a molecule.',()=>[60,129].map(x=>atom(x,75,'Al³⁺',25)).join('')+text(190,81,'+',23)+[257,327,397].map(x=>atom(x,75,'O²⁻',25)).join('')+text(95,130,'Total +6',15)+text(327,130,'Total −6',15));
add('4/shape','Water has four electron domains: two bonds and two lone pairs. Its atoms form a bent shape.',()=>line(239,65,151,133.2)+line(239,65,327,133.2)+atom(239,65,'O',24)+atom(151,133.2,'H',18)+atom(327,133.2,'H',18)+dots(192,24,2,2,green,4)+dots(267,24,2,2,green,4)+text(82,51,'Lone pairs',14)+text(370,59,'104.5°',18)+`<path d="M211,87 Q239,121 267,87" fill="none" stroke="${orange}"/>`);
add('4/properties','Fixed ions cannot carry charge through a solid; mobile dissolved ions can.',()=>two(
  [0,1,2,3,4,5].map(i=>atom(68+i%3*45,59+Math.floor(i/3)*44,i%2?'+':'−',13)).join(''),
  atom(306,56,'+',13)+arrow(322,56,347,44)+atom(390,93,'−',13)+arrow(375,93,347,112)+atom(323,112,'−',13)+atom(394,42,'+',13),
  'Solid lattice: fixed positions','Solution: mobile ions'));
add('4/ionic-character','The model describes a continuous bond character, not a count of purely ionic bonds.',()=>{
  let s='';for(let i=0;i<30;i++)s+=rect(42+i*13,57,13,27,`hsl(${155-i*3}, 32%, ${91-i*.8}%)`,'none');
  return s+arrow(141,23,141,52)+text(147,17,'≈22% at Δχ = 1.0',14)+text(43,124,'More covalent',14,'start')+text(433,124,'More ionic',14,'end');
});
add('4/polarity','Equivalent bond dipoles cancel in linear CO₂; bent water has a net dipole.',()=>two(
  atom(62,79,'O')+atom(121,79,'C')+atom(180,79,'O')+arrow(108,60,67,60)+arrow(133,60,175,60)+text(121,134,'Net dipole = 0',14),
  water(359,62)+arrow(340,111,355,77)+arrow(382,111,365,77)+arrow(414,111,414,49,orange)+text(359,144,'Dipoles do not cancel',14),'CO₂','H₂O'));
add('4/imf','A hydrogen bond acts between molecules. The O–H bonds within water remain covalent.',()=>water(112,61)+water(298,77)+line(130,78,286,77,orange,'5 5')+text(209,49,'Hydrogen bond',14)+text(221,135,'O–H ··· O',18)+text(406,94,'Not a new',13)+text(406,113,'O–H bond',13));

add('5/mole','A dozen always means 12. A mole also fixes the count, while the mass depends on the entity.',()=>{
  const eggs=Array.from({length:12},(_,i)=>`<ellipse cx="${54+i%6*26}" cy="${55+Math.floor(i/6)*32}" rx="9" ry="12" fill="#f1e1c8" stroke="#987842"/>`).join('');
  const balls=Array.from({length:12},(_,i)=>circle(294+i%6*26,55+Math.floor(i/6)*32,11,'#dcebf1',blue)+circle(292+i%6*26,52+Math.floor(i/6)*32,1.5,blue)).join('');
  return two(eggs+text(120,136,'12 eggs',15),balls+text(360,136,'12 bowling balls',15),'Same count','Different mass');
});
add('5/mass','Molar mass and Avogadro’s constant connect three different descriptions of one sample.',()=>route(['Mass (g)','Amount (mol)','Particle count'],['÷ molar mass','× Nₐ','Name the entity']));
add('5/percent','Water has twice as many H atoms as O atoms, but oxygen contributes most of its mass.',()=>water(103,66)+text(103,136,'Atom count H:O = 2:1',13)+rect(204,56,233,32,'#f5dfce',orange)+rect(204,56,26,32,pale)+text(325,79,'O ≈ 88.79% by mass',14)+text(220,120,'H ≈ 11.21%',13)+text(321,31,'Mass of one mole of water',14));
add('5/formula','Dividing every subscript by the same factor gives the empirical ratio.',()=>route(['C₆H₁₂O₆','÷ 6','CH₂O'],['Molecular formula','All subscripts','Empirical formula']));
add('5/ratio','Balanced coefficients compare molecules or moles; they do not directly compare grams.',reaction);
add('5/hydrate','Loss of water changes the measured mass; compare moles of water with moles of dry salt.',()=>vessel(46,51,116,73,.45)+dots(66,95,5,5,green)+arrow(185,91,300,91)+vessel(323,51,115,73,.1)+dots(344,102,5,5,green)+water(224,39)+arrow(237,44,277,21,orange)+text(104,148,'Hydrated salt',14)+text(379,148,'Dry salt',14));
add('5/combustion','Count carbon from CO₂ and hydrogen from H₂O. Product oxygen also comes from supplied O₂.',()=>route(['CO₂ formed','H₂O formed','Sample O'],['1 C per molecule','2 H per molecule','By mass difference']));

add('6/balance','Changing coefficients conserves each type of atom without changing the substances.',reaction);
add('6/classify','One reaction can match both a structural pattern and a chemical-behavior category.',()=>rect(112,13,256,38)+text(240,38,'AgNO₃ + NaCl reaction',16)+arrow(187,53,113,86)+arrow(293,53,368,86)+rect(20,93,204,37)+text(122,117,'Double replacement',15)+rect(258,93,204,37)+text(360,117,'Precipitation: AgCl(s)',15));
add('6/stoich','The balanced coefficient ratio belongs between the two mole quantities.',()=>route(['Known grams','Known moles','Wanted moles','Wanted grams'],['÷ M_known','Coefficient ratio','× M_wanted','Final quantity']));
add('6/limiting','Three frames and ten wheels make three bicycles; four wheels remain.',()=>{
  let s='';for(let i=0;i<3;i++)s+=`<path d="M${36+i*48},83 l17,-28 l17,28 Z" fill="none" stroke="${green}" stroke-width="2"/>`;
  for(let i=0;i<10;i++)s+=circle(229+i%5*41,58+Math.floor(i/5)*37,13,'none',blue);
  return s+text(103,24,'3 frames',15)+text(310,24,'10 wheels',15)+text(240,147,'Frames limit production: 3 bikes, 4 spare wheels.',14);
});
add('6/yield','Actual recovery is compared with the calculated maximum for the same product.',()=>bars(['Theoretical','Collected'],[1,.8],'%')+text(240,141,'12.0 g predicted → 9.60 g collected',15));
add('6/particles','Each N₂ molecule contributes two nitrogen atoms to the atom count.',()=>pair(76,71,'N')+pair(161,71,'N')+arrow(223,71,271,71)+[311,350,389,428].map(x=>atom(x,71,'N')).join('')+text(131,128,'2 N₂ molecules',15)+text(367,128,'4 N atoms counted',15));
add('6/excess','For each reaction batch, one N₂ reacts with three H₂; extra nitrogen stays unreacted.',()=>route(['2 mol N₂','3 mol H₂','2 mol NH₃'],['1 mol remains','Limiting supply','Product formed']));

const piston=(x,w,height,label,particles=6)=>rect(x,27,w,105,'none')+rect(x+2,132-height,w-4,height-2,'#e6eff3','none')+line(x+2,132-height,x+w-2,132-height,ink)+dots(x+18,142-height,particles,3,blue,4)+text(x+w/2,152,label,14);
add('7/kmt','Moving particles transfer momentum to the walls; arrow lengths represent different speeds.',()=>rect(125,27,230,103,'#edf3f5')+[[161,53,183,42],[223,58,261,65],[310,102,337,102],[214,104,205,82],[295,46,317,37]].map(([x,y,x2,y2])=>circle(x,y,5,blue)+arrow(x+7,y,x2,y2,blue)).join('')+text(240,18,'Collisions produce pressure',15)+text(240,154,'Particle size is unchanged by heating.',14));
add('7/laws','At fixed pressure and amount, increasing absolute temperature increases gas volume.',()=>piston(56,131,68,'300 K · 2.00 L')+piston(290,131,75,'330 K · 2.20 L')+arrow(215,89,264,89)+text(240,22,'Charles’s law: same P and n',15));
add('7/ideal','Pressure, volume, temperature, and amount belong to one relationship.',()=>rect(151,55,181,46)+text(241,84,'PV = nRT',24)+text(86,31,'Pressure P',14)+arrow(118,36,163,55)+text(390,31,'Volume V',14)+arrow(361,36,318,55)+text(81,139,'Amount n',14)+arrow(115,122,163,101)+text(391,139,'Kelvin T',14)+arrow(358,122,318,101));
add('7/dalton','Both gases occupy the same space. Each component contributes to total pressure.',()=>rect(28,31,192,95,'#edf3f5')+[0,1,2,3,4,5,6,7,8,9].map(i=>circle(55+i%5*33,57+Math.floor(i/5)*43,8,i<2?orange:blue)).join('')+rect(276,47,150,34,'#dcebf1',blue)+rect(276,47,30,34,'#f5dfce',orange)+text(350,30,'Total: 2.50 atm',15)+text(350,111,'O₂: 0.50 atm (20%)',14)+text(350,135,'N₂: 2.00 atm (80%)',14));
add('7/ascent','With fixed amount and temperature, lower external pressure permits a larger gas volume.',()=>circle(100,78,29,'#e6eff3',blue)+circle(373,78,46,'#e6eff3',blue)+arrow(165,78,298,78)+text(101,24,'4.0 atm',15)+text(372,19,'1.0 atm',15)+text(101,139,'0.50 L',15)+text(373,149,'2.0 L',15));
add('7/speeds','At higher temperature, the speed distribution is broader and its peak shifts to the right.',()=>{
  // Normalized Maxwell speed densities in arbitrary, common speed units.
  const curve=(sigma,color)=>`<path d="${Array.from({length:201},(_,i)=>{const v=i/40,f=Math.sqrt(2/Math.PI)*v*v/Math.pow(sigma,3)*Math.exp(-v*v/(2*sigma*sigma));return `${i?'L':'M'}${48+i*1.96},${127-f*95}`;}).join(' ')}" fill="none" stroke="${color}" stroke-width="2"/>`;
  return line(48,127,440,127)+line(48,127,48,24)+curve(.7,blue)+curve(1.1,orange)+text(126,34,'Cooler',14,'middle',blue)+text(239,66,'Hotter',14,'middle',orange)+text(239,151,'Molecular speed →',14)+text(49,16,'Relative number',12,'start');
});
add('7/real','Finite particle volume reduces available space; attractions pull particles toward each other.',()=>rect(29,29,188,104,'#edf3f5')+[[65,62],[124,63],[180,59],[91,108],[160,108]].map(([x,y])=>circle(x,y,17,'#dbe6ed',blue)).join('')+atom(302,80,'●',17)+atom(416,80,'●',17)+arrow(326,80,349,80,orange)+arrow(391,80,368,80,orange)+text(122,19,'Finite particle size',14)+text(358,25,'Attractions',14)+text(352,137,'Lower wall force',14));
add('7/wet-gas','A collected wet gas contains target gas and water vapor; subtract the vapor contribution.',()=>vessel(51,21,128,116,.26)+dots(72,43,6,3,blue)+water(130,67)+text(115,153,'Gas above water',14)+rect(252,37,180,38)+text(342,62,'100.0 kPa total',16)+text(342,99,'− 3.2 kPa water vapor',14)+text(342,133,'= 96.8 kPa dry gas',15));

add('8/dissolve','Around a cation, water’s partially negative oxygen ends point toward the positive ion.',()=>atom(242,80,'+',19)+[0,1,2,3].map(i=>{
  const a=i*Math.PI/2,x=242+48*Math.cos(a),y=80+48*Math.sin(a),x2=242+68*Math.cos(a),y2=80+68*Math.sin(a);
  return line(x,y,x2-10*Math.sin(a),y2+10*Math.cos(a))+line(x,y,x2+10*Math.sin(a),y2-10*Math.cos(a))+atom(x,y,'O',11)+atom(x2-10*Math.sin(a),y2+10*Math.cos(a),'H',8)+atom(x2+10*Math.sin(a),y2-10*Math.cos(a),'H',8);
}).join('')+text(64,68,'O end: δ−',14)+text(395,98,'H ends: δ+',14));
add('8/types','At saturation, dissolved particles can exchange with excess solid at equal opposing rates.',()=>vessel(52,27,180,112,.83)+dots(76,55,8,4,blue)+dots(72,118,8,8,green)+arrow(265,106,265,57)+arrow(301,57,301,106,orange)+text(388,54,'Dissolving',14)+text(388,115,'Crystallizing',14)+text(145,155,'Excess solid is not dissolved.',13));
add('8/curve','Read capacity from the supplied curve and scale it to solvent mass, not solution mass.',()=>line(72,123,416,123)+line(72,123,72,20)+line(111,98,352,44,blue)+circle(111,98,5,blue)+circle(352,44,5,blue)+text(120,82,'20',14)+text(352,28,'40',14)+text(248,151,'Temperature →',14)+text(27,38,'g per',12)+text(28,55,'100 g',12)+text(29,72,'water',12));
add('8/precip','Ag⁺ and Cl⁻ join a solid lattice; spectator ions remain dissolved.',()=>vessel(52,23,175,113,.83)+dots(77,118,8,8,green)+atom(93,65,'Na⁺',17)+atom(171,74,'NO₃⁻',22)+arrow(271,54,271,117,orange)+text(368,55,'Ag⁺ + Cl⁻',17)+text(368,91,'AgCl solid forms',15)+text(369,130,'Spectators stay in water',13));
add('8/molarity','At the same final solution volume, twice the dissolved amount gives twice the molarity.',()=>two(vessel(65,36,117,91,.86)+dots(84,70,4,2,blue)+text(123,149,'1 mol / 1 L',14),vessel(305,36,117,91,.86)+dots(324,70,8,4,blue)+text(363,149,'2 mol / 1 L',14),'1 M','2 M'));
add('8/dilution','Adding solvent increases volume while keeping the dissolved solute count unchanged.',()=>two(vessel(65,33,116,97,.48)+dots(87,103,4,4,blue)+text(122,153,'Smaller volume',14),vessel(305,33,116,97,.88)+dots(332,66,4,2,blue)+text(362,153,'Larger volume',14),'Before','After dilution')+arrow(203,86,275,86));
add('8/ksp','Compare the ion product after mixing with Ksp to predict whether precipitation is favored.',()=>route(['Q < Ksp','Q = Ksp','Q > Ksp'],['Below saturation','At equilibrium','Precipitation favored']));
add('8/crystallize','Cooling a saturated solution can transfer dissolved solute into crystals without losing solute.',()=>two(vessel(65,32,117,95,.88)+dots(87,61,12,4,blue),vessel(305,32,117,95,.88)+dots(327,61,4,4,blue)+dots(327,114,8,4,green),'Hot: more dissolved','Cool: crystals form'));

add('9/names','Oxyacid naming preserves the anion’s oxygen count: -ate becomes -ic; -ite becomes -ous.',()=>two(rect(29,39,182,38)+text(120,64,'NO₃⁻ · nitrate',16)+arrow(120,80,120,102)+text(120,133,'HNO₃ · nitric acid',15),rect(269,39,182,38)+text(360,64,'NO₂⁻ · nitrite',16)+arrow(360,80,360,102)+text(360,133,'HNO₂ · nitrous acid',15),'Three oxygen atoms','Two oxygen atoms'));
add('9/definitions','A conjugate acid–base pair differs by one proton. The transfer changes both partners.',()=>rect(35,29,122,38)+text(96,54,'NH₃ (base)',16)+rect(321,29,122,38)+text(382,54,'H₂O (acid)',16)+arrow(310,47,169,47,orange)+text(240,31,'H⁺ transferred',13)+arrow(96,72,96,104)+arrow(382,72,382,104)+text(96,134,'NH₄⁺',20)+text(382,134,'OH⁻',20)+text(240,97,'Conjugate',13)+text(240,119,'partners',13));
add('9/strength','Equal initial amounts can ionize to different extents. Diagrams show solute species; water is omitted.',()=>two(
  [0,1,2,3].map(i=>atom(46+i*47,58,'H⁺',14)+atom(46+i*47,108,'A⁻',14)).join(''),
  atom(287,58,'H⁺',14)+atom(287,108,'A⁻',14)+[337,382,427].map(x=>atom(x,82,'HA',16)).join(''),
  'Strong acid: all four ionized','Weak acid: one of four ionized'));
add('9/neutralize','A proton and a hydroxide ion form water, conserving atoms and total charge.',()=>atom(66,80,'H⁺',22)+text(121,86,'+',23)+atom(179,80,'OH⁻',27)+arrow(236,80,288,80)+water(366,67)+text(132,136,'Net charge: 0',14)+text(366,137,'H₂O: neutral',14));
add('9/ph','Each upward pH step divides hydronium concentration by ten in the dilute model.',()=>[0,1,2].map(i=>rect(32+i*152,37,113,70)+text(88+i*152,63,'pH '+(3+i),19)+text(88+i*152,89,['10⁻³ M','10⁻⁴ M','10⁻⁵ M'][i],17)+(i<2?arrow(147+i*152,72,180+i*152,72):'')).join('')+text(240,145,'pH 3 → pH 5: concentration ÷ 100',15));
add('9/titration','Choose an indicator whose transition falls within the curve’s steep region.',()=>line(56,130,440,130)+line(56,130,56,21)+`<path d="M60,119 C187,115 225,109 236,75 S249,26 437,24" fill="none" stroke="${blue}" stroke-width="3"/>`+rect(58,56,368,23,'#e4edcd99','none')+line(240,23,240,128,orange,'3 3')+text(326,73,'Indicator range',13)+text(225,151,'Base volume added →',13)+text(34,29,'pH',14)+text(165,18,'Illustrative curve',13));
add('9/weak-ph','A small dissociated fraction supports the small-x approximation; check it against the starting amount.',()=>rect(25,34,251,94,'#edf3f5')+[0,1,2,3,4,5].map(i=>atom(52+i%3*82,62+Math.floor(i/3)*40,'HA',17)).join('')+arrow(296,77,338,77)+atom(385,54,'H⁺',20)+atom(385,106,'A⁻',20)+text(150,20,'Mostly un-ionized HA',14)+text(378,150,'Small x',14));

add('10/laws','Spontaneous heat transfer is from hotter to colder matter. Energy crosses a chosen boundary.',()=>rect(32,35,130,87,'#f5dfce',orange)+text(97,74,'Hot metal',18)+rect(319,35,130,87,'#dcebf1',blue)+text(384,74,'Cool water',18)+arrow(177,77,302,77,orange)+text(240,56,'Heat transfer',14)+text(240,147,'Energy lost by one part is gained elsewhere.',14));
add('10/exo','The activation barrier is distinct from the reactant-to-product enthalpy change.',()=>line(48,130,439,130)+line(48,130,48,20)+`<path d="M60,79 H122 C171,80 170,18 217,31 C265,43 259,115 322,115 H432" fill="none" stroke="${green}" stroke-width="3"/>`+text(99,64,'Reactants',13)+text(373,103,'Products',13)+arrow(300,80,300,112,orange)+text(341,78,'ΔH < 0',14)+text(227,18,'Barrier',13)+text(234,152,'Reaction progress →',13));
add('10/heat','The same sample warms as it gains energy; the temperature change is final minus initial.',()=>two(vessel(75,34,87,88,.8)+text(120,89,'20.0 °C',16)+text(120,149,'100.0 g water',14),vessel(315,34,87,88,.8)+text(360,89,'25.0 °C',16)+text(360,149,'Same mass',14),'Before','After')+arrow(194,80,276,80,orange)+text(235,53,'+ heat',14));
add('10/calorimeter','An ideal final temperature is weighted toward the part with greater heat capacity.',()=>line(59,105,421,105)+text(70,136,'20 °C',16)+text(414,136,'60 °C',16)+arrow(158,41,158,101,orange)+text(158,30,'30 °C final',17)+text(162,68,'3 parts cold',14)+text(378,68,'1 part hot',14)+text(240,155,'Water only; insulated; no phase change.',12));
add('10/food','Capital-C food Calories and small-c calories differ by a factor of one thousand.',()=>route(['1 Cal','1,000 cal','4,184 J'],['1 food Calorie','1 kilocalorie','4.184 kJ']));
add('10/hess','The net enthalpy change depends on the endpoints, even when the route has intermediate steps.',()=>text(50,105,'A',23)+text(239,35,'B',23)+text(434,105,'C',23)+arrow(75,84,218,32)+arrow(264,32,410,85)+text(133,44,'+40 kJ',15)+text(357,44,'−65 kJ',15)+arrow(77,112,410,112,orange)+text(240,141,'Direct A → C: −25 kJ',16));
add('10/formation','Subtract reactant formation enthalpies from product formation enthalpies, with coefficients and phases.',()=>line(63,38,210,38)+line(288,119,437,119)+arrow(246,42,246,115,orange)+text(134,22,'C(graphite) + O₂(g)',14)+text(365,146,'CO₂(g)',17)+text(355,35,'−393.5 kJ/mol',15)+text(105,85,'Elemental',14)+text(105,106,'reference states',14));

add('11/decay','Alpha emission changes both A and Z; beta-minus changes Z; gamma emission changes neither.',()=>['Alpha','Beta-minus','Gamma'].map((s,i)=>rect(20+i*156,31,139,92)+text(89+i*156,55,s,16)+text(89+i*156,84,['A − 4','A unchanged','A unchanged'][i],14)+text(89+i*156,107,['Z − 2','Z + 1','Z unchanged'][i],14)).join(''));
add('11/half','Each interval leaves half the previous parent population. Individual nuclei do not decay in synchrony.',()=>[16,8,4].map((n,i)=>dots(33+i*161,49,n,4,green)+text(65+i*161,25,["Start: 16","1 half-life: 8","2 half-lives: 4"][i],13)+(i<2?arrow(113+i*161,79,177+i*161,79):'')).join(''));
add('11/applications','Select an isotope by the needed signal, chemical destination, and timing together.',()=>route(['Emission','Chemical form','Half-life'],['Detect or deposit energy','Destination in matter','Match the timing']));
add('11/power','Fission divides a heavy nucleus; fusion joins light nuclei. Energy depends on the specific products.',()=>two(circle(58,77,21,pale)+arrow(84,77,126,77)+circle(153,63,14,pale)+circle(181,95,12,pale)+circle(196,57,3,blue),circle(285,60,12,pale)+circle(285,102,12,pale)+arrow(307,80,354,80)+circle(390,80,21,pale),'Fission: split','Fusion: join'));
add('11/dating','Three halvings leave 12.5% of a reference amount; a real radiocarbon age also needs calibration.',()=>route(['100%','50%','25%','12.5%'],['Start','1 half-life','2 half-lives','3 half-lives']));
add('11/series','Alpha followed by two beta-minus decays returns Z to its starting value while A stays four lower.',()=>route(['α decay','β⁻ decay','β⁻ decay'],['A − 4; Z − 2','A same; Z + 1','Net: A − 4; Z same']));
add('11/binding','The assembled bound system has lower rest mass; the difference corresponds to binding energy.',()=>rect(32,33,172,65)+text(118,59,'Separated',16)+text(118,83,'constituents',16)+arrow(219,65,263,65)+rect(280,33,172,65)+text(366,59,'Bound system',16)+text(366,83,'Lower rest mass',14)+arrow(241,81,241,116,orange)+text(240,143,'Mass difference × c² → energy',15));
add('11/effective','Independent physical decay and biological removal both decrease retained activity in this model.',()=>rect(150,52,181,47)+text(240,81,'Retained tracer',18)+arrow(150,63,64,31)+arrow(330,87,414,124,orange)+text(103,20,'Physical decay',14)+text(376,148,'Biological elimination',13)+text(77,139,'6 h and 12 h → 4 h effective',13,'start'));

export const ILLUSTRATIONS = Object.freeze(diagrams);
export function renderIllustration(number, id) {
  const key=`${number}/${id}`, diagram=diagrams[key];
  if(!diagram) throw new Error(`Missing teaching illustration: ${key}`);
  return `<figure class="lesson-illustration" data-illustration="${key}"><svg viewBox="0 0 480 160" role="img" aria-label="${e(diagram.caption)}" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif"><title>${e(diagram.caption)}</title>${diagram.draw()}</svg><figcaption>${e(diagram.caption)}</figcaption></figure>`;
}
