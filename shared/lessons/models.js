// Small, deterministic teaching models. Values are configured or calculated,
// never presented as student measurements. No assessment or progress state is used.
export const MODEL_CONFIG = {
  1:{label:'Submerged object volume (mL)',min:5,max:25,step:1,start:10,sweep:true},
  2:{label:'Starting hydrogen energy level, n',min:3,max:6,step:1,start:3},
  3:{label:'Group 1 element',min:0,max:2,step:1,start:0,sweep:true,choices:['Lithium (Li)','Sodium (Na)','Potassium (K)']},
  4:{label:'Molecule to examine',min:0,max:1,step:1,start:1,choices:['Carbon dioxide (CO₂)','Water (H₂O)']},
  5:{label:'Water sample mass (g)',min:9.01,max:72.08,step:9.01,start:9.01,sweep:true},
  6:{label:'Starting H₂ molecules (with 4 O₂)',min:2,max:12,step:2,start:6},
  7:{label:'Gas volume (L)',min:5,max:25,step:1,start:20,sweep:true},
  8:{label:'Final solution volume (L)',min:0.1,max:1,step:0.05,start:0.25,sweep:true},
  9:{label:'pH at 25 °C',min:0,max:14,step:1,start:7,sweep:true},
  10:{label:'Initial hot-water temperature (°C)',min:30,max:90,step:10,start:60},
  11:{label:'Elapsed half-lives',min:0,max:6,step:0.5,start:0,sweep:true}
};

export function modelState(unit, value, progress = 0) {
  const config = MODEL_CONFIG[unit];
  if (!config || !Number.isFinite(value) || value < config.min - 1e-9 || value > config.max + 1e-9) throw new RangeError('Value outside this teaching model.');
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new RangeError('Progress must be between zero and one.');
  if ((config.choices || unit === 2 || unit === 6) && Math.abs((value-config.min)/config.step-Math.round((value-config.min)/config.step))>1e-7) throw new RangeError('Choose a discrete model setting.');
  switch(unit) {
    case 1:return {volume:value,before:20,after:20+value,mass:2.7*value,density:2.7};
    // A two-state teaching sequence, never a trajectory through forbidden energies.
    case 2:{const wavelength=1e9/(10973731.568160*(1/4-1/value**2));return {upper:value,lower:2,level:progress<0.5?value:2,emitted:progress>=0.5,wavelength,energy:6.62607015e-34*2.99792458e8/(wavelength*1e-9),progress};}
    case 3:return [{symbol:'Li',z:3,shells:[2,1]},{symbol:'Na',z:11,shells:[2,8,1]},{symbol:'K',z:19,shells:[2,8,8,1]}][value];
    case 4:return {water:value===1,domains:value===1?4:2,lonePairs:value===1?2:0,angle:value===1?104.5:180,progress};
    case 5:return {mass:value,molarMass:18.02,moles:value/18.02,particles:value/18.02*6.02214076e23};
    case 6:{const batches=Math.min(value/2,4),done=Math.min(batches,Math.floor(progress*batches+1e-9));return {initialH2:value,initialO2:4,batches,done,h2:value-2*done,o2:4-done,water:2*done,limiting:value<8?'H₂':value>8?'O₂':'Neither in excess',progress};}
    case 7:return {volume:value,moles:0.5,temperature:300,pressure:0.5*0.08206*300/value};
    case 8:return {volume:value,moles:0.1,molarity:0.1/value};
    case 9:return {ph:value,poh:14-value,hydronium:10**-value,hydroxide:10**-(14-value)};
    case 10:{const final=(value+20)/2,hot=value-(value-final)*progress,cold=20+(final-20)*progress;return {initialHot:value,initialCold:20,hot,cold,final,qCold:100*4.184*(cold-20),qHot:100*4.184*(hot-value),progress};}
    case 11:{const fraction=2**-value;return {halflives:value,fraction,percent:fraction*100,markers:Math.round(64*fraction)};}
  }
}

export const escapeHTML = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const teal='#256776', red='#a54335', blue='#486393', ink='#233841', pale='#dbecee';
const txt=(x,y,s,size=17,color=ink,anchor='start')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}">${escapeHTML(s)}</text>`;
const line=(x1,y1,x2,y2,color=teal,width=2,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const circle=(x,y,r,fill=teal,stroke='none')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const rect=(x,y,w,h,fill=pale,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const atom=(x,y,r,label,color)=>circle(x,y,r,color)+txt(x,y+5,label,15,'#fff','middle');
const arrow=(x1,y1,x2,y2,color=teal)=>line(x1,y1,x2,y2,color,3)+`<path d="M ${x2-9},${y2-6} L ${x2},${y2} L ${x2-9},${y2+6}" fill="none" stroke="${color}" stroke-width="3"/>`;
const fmt=(n,d=2)=>Number(n).toFixed(d);
// Text superscripts work in SVG labels, captions, accessible text, and readouts.
const superscript = {'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
const sci = n => {
  const [mantissa, exponent] = n.toExponential(2).split('e');
  return `${mantissa} × 10${String(Number(exponent)).replace(/[-\d]/g, character => superscript[character])}`;
};

/** Returns an accessible SVG image, a textual equivalent, and numerical evidence. */
export function renderModel(unit, value, progress=0) {
  const m=modelState(unit,value,progress); let art='',summary='',rows=[];
  switch(unit){
    case 1:{
      const cylinder=(x,vol,label)=>{
        let g=rect(x,36,110,213,'#fff','#76959e')+rect(x+2,246-vol*4,106,vol*4,pale)+txt(x+55,282,label,16,ink,'middle');
        for(let v=0;v<=50;v++){
          g+=line(x+(v%5===0?70:91),246-v*4,x+108,246-v*4,teal,1);
          if(v%5===0)g+=txt(x+64,251-v*4,v,12,ink,'end');
        }
        return g+`<path d="M ${x+2},${246-vol*4-4} Q ${x+55},${246-vol*4+4} ${x+108},${246-vol*4-4}" fill="none" stroke="${teal}" stroke-width="2"/>`;
      };
      art=cylinder(65,20,'Before (mL)')+cylinder(290,m.after,'After (mL)')+rect(300,242-5*m.volume,34,5*m.volume,blue)+arrow(188,130,272,130)+txt(447,92,`Rise = ${fmt(m.volume,1)} mL`,22)+txt(447,138,`${fmt(m.mass,1)} g ÷ ${fmt(m.volume,1)} mL`,18)+txt(447,174,'= 2.70 g/mL',23,teal)+txt(447,228,'Same material; larger sample.',15);
      summary=`The water rises from 20.0 to ${fmt(m.after,1)} mL. Displacement is ${fmt(m.volume,1)} mL. A ${fmt(m.mass,1)} g sample has density 2.70 g/mL. Object dimensions are schematic; read the marked water levels.`;
      rows=[['Before', '20.0 mL'],['After',`${fmt(m.after,1)} mL`],['Object volume',`${fmt(m.volume,1)} mL`],['Calculated mass',`${fmt(m.mass,1)} g`]];break;
    }
    case 2:{
      const energyY=n=>65+760/n**2;
      for(let n=2;n<=6;n++){const labelY=({2:260,3:155,4:127,5:101,6:75})[n];art+=line(62,energyY(n),296,energyY(n),n===m.upper||n===2?teal:'#bccace',2)+line(53,labelY-5,62,energyY(n),'#78969e',1)+txt(23,labelY,`n=${n}`,14);}
      art+=`<circle data-electron-level="${m.level}" cx="178" cy="${energyY(m.level)}" r="8" fill="${blue}"/>`+line(198,energyY(m.upper),198,energyY(2),blue,2,'4 5')+txt(62,299,'Energy diagram; no path between states.',14);
      if(m.emitted){let path='';for(let i=0;i<=180;i+=3)path+=`${i?'L':'M'}${310+i},${162+13*Math.sin(i/(13*m.wavelength/656.11))}`;art+=`<path data-emitted-photon="true" d="${path}" fill="none" stroke="${m.upper===3?red:blue}" stroke-width="3"/>`+arrow(496,162,548,162,blue);}
      art+=txt(372,63,`${m.upper} → 2`,26,teal)+txt(372,100,`≈ ${fmt(m.wavelength,0)} nm`,23)+txt(372,226,`${sci(m.energy)} J`,20)+txt(372,262,m.emitted?'Lower state + emitted photon':'Excited state before emission',15);
      summary=`Hydrogen transition n=${m.upper} to n=2 releases a photon of approximately ${fmt(m.wavelength,0)} nm and energy ${sci(m.energy)} J. ${m.emitted?'The marker is on n=2 and the photon is shown.':'The marker is on the excited level before emission.'} No intermediate energy is depicted; the sequence is not a physical time scale.`;
      rows=[['Upper level',`n = ${m.upper}`],['Lower level','n = 2'],['Model wavelength',`≈ ${fmt(m.wavelength,0)} nm`],['Photon energy',`${sci(m.energy)} J`]];break;
    }
    case 3:{
      art=atom(190,157,25,m.symbol,teal);
      m.shells.forEach((count,i)=>{const r=44+i*23;art+=circle(190,157,r,'none','#a7bcc2');for(let e=0;e<count;e++){const angle=e*2*Math.PI/count-Math.PI/2;art+=circle(190+Math.cos(angle)*r,157+Math.sin(angle)*r,5,i===m.shells.length-1?red:blue);}});
      art+=txt(355,80,`${m.symbol}: ${m.z} electrons`,24)+txt(355,125,`${m.shells.length} occupied shells`,22,teal)+txt(355,167,'1 outer-shell electron',22,red)+txt(355,213,'Down Group 1:',17)+txt(355,245,'more occupied shells; generally larger atoms.',14)+txt(64,304,'Shell spacing is schematic; these are not electron orbits.',14);
      summary=`${m.symbol} has shell populations ${m.shells.join(', ')}. The outer shell has one electron. This is a shell-organization diagram, not a measured radius.`;rows=[['Element',m.symbol],['Atomic number',m.z],['Shell populations',m.shells.join(' · ')],['Valence electrons',1]];break;
    }
    case 4:{
      if(m.water){
        const dx=85*Math.sin(104.5*Math.PI/360),dy=85*Math.cos(104.5*Math.PI/360);
        art=line(188,130,188-dx,130+dy,teal,5)+line(188,130,188+dx,130+dy,teal,5)+atom(188,130,24,'O',red)+atom(188-dx,130+dy,17,'H',blue)+atom(188+dx,130+dy,17,'H',blue);
        if(m.progress>=0.33)art+=circle(151,83,17,pale)+circle(225,83,17,pale)+circle(146,83,3,ink)+circle(156,83,3,ink)+circle(220,83,3,ink)+circle(230,83,3,ink)+txt(188,48,'Two lone pairs',16,ink,'middle');
        art+=txt(188,229,'104.5° · bent',19,ink,'middle');
      }else{art=line(76,121,178,121,teal,4)+line(76,139,178,139,teal,4)+line(198,121,300,121,teal,4)+line(198,139,300,139,teal,4)+atom(76,130,22,'O',red)+atom(188,130,24,'C',ink)+atom(300,130,22,'O',red)+txt(188,208,'180° · linear',19,ink,'middle');}
      art+=txt(367,77,`${m.domains} electron domains`,23,teal)+txt(367,120,`${m.lonePairs} central lone pairs`,20)+txt(367,180,m.progress<0.66?'Count all central domains first.':m.water?'Bond dipoles do not cancel.':'Equivalent bond dipoles cancel.',18)+txt(367,224,m.progress<0.66?'Then consider shape and polarity.':m.water?'Polar molecule':'Nonpolar molecule',20,teal)+txt(64,291,'Schematic structure; atom sizes and distances are not to scale.',14);
      summary=`${m.water?'H₂O':'CO₂'} has ${m.domains} central electron domains, ${m.lonePairs} central lone pairs, and an angle of ${m.angle} degrees. ${m.water?'Water is bent and polar.':'Carbon dioxide is linear and nonpolar overall.'}`;
      rows=[['Molecule',m.water?'H₂O':'CO₂'],['Central domains',m.domains],['Central lone pairs',m.lonePairs],['Bond angle',`${m.angle}°`]];break;
    }
    case 5:{
      art=rect(45,54,214,170,'#fff','#a7bcc2')+rect(67,175,171,26,pale)+txt(152,122,`${fmt(m.mass,2)} g`,31,teal,'middle')+txt(152,249,'Mass of H₂O',17,ink,'middle')+arrow(275,136,357,136)+txt(315,112,'÷ 18.02 g/mol',13,ink,'middle')+txt(414,66,`${fmt(m.moles,2)} mol`,27,teal)+txt(414,112,`${sci(m.particles)}`,22)+txt(414,142,'water molecules',17);
      for(let i=0;i<32;i++)art+=circle(424+i%8*29,180+Math.floor(i/8)*28,8,i<Math.round(m.moles*8)?teal:'#e0e9ec');
      art+=txt(414,306,'Each filled dot represents 0.125 mol.',13);
      summary=`${fmt(m.mass,2)} g H₂O divided by 18.02 g/mol gives ${fmt(m.moles,2)} mol, containing ${sci(m.particles)} water molecules.`;rows=[['Mass',`${fmt(m.mass,2)} g`],['Molar mass','18.02 g/mol'],['Amount',`${fmt(m.moles,2)} mol`],['Molecule count',sci(m.particles)]];break;
    }
    case 6:{
      art=txt(32,30,'Reactants remaining',19)+txt(421,30,'Products formed',19)+txt(33,139,`${m.h2} H₂`,16,blue)+txt(33,264,`${m.o2} O₂`,16,red)+arrow(337,158,386,158);
      for(let i=0;i<m.h2;i++){const x=48+i%6*47,y=62+Math.floor(i/6)*38;art+=circle(x,y,8,blue)+circle(x+14,y,8,blue);}
      for(let i=0;i<m.o2;i++){const x=48+i*59;art+=circle(x,198,11,red)+circle(x+18,198,11,red);}
      for(let i=0;i<m.water;i++){const x=438+i%4*64,y=85+Math.floor(i/4)*77;art+=circle(x,y,12,red)+circle(x-12,y+15,8,blue)+circle(x+12,y+15,8,blue);}
      art+=txt(423,248,`${m.water} H₂O`,19,teal)+txt(32,304,`2 H₂ + O₂ → 2 H₂O   •   ${m.done} of ${m.batches} complete batches`,17);
      summary=`${m.done} of ${m.batches} possible batches completed. Remaining: ${m.h2} H₂ and ${m.o2} O₂. Product: ${m.water} H₂O. Maximum yield is ${m.batches*2} H₂O; limiting input: ${m.limiting}.`;
      rows=[['Remaining H₂',m.h2],['Remaining O₂',m.o2],['Formed H₂O',m.water],['Limiting input',m.limiting]];break;
    }
    case 7:{
      const w=260*m.volume/25;art=rect(42,54,w,175,pale,teal)+rect(42+w,45,10,193,ink)+line(52+w,140,315,140,ink,7);
      for(let i=0;i<24;i++)art+=circle(50+(i%6+0.5)*(w-18)/6,72+Math.floor(i/6)*40,4,teal);
      art+=txt(42,262,`${fmt(m.volume,1)} L`,22)+txt(42,294,'Fixed: 0.500 mol; 300 K',16);
      let path='';for(let v=5;v<=25;v+=0.25)path+=`${v===5?'M':'L'}${400+(v-5)*12},${247-(0.5*0.08206*300/v)*65}`;
      art+=line(400,55,400,247,ink)+line(400,247,663,247,ink)+`<path d="${path}" fill="none" stroke="${teal}" stroke-width="3"/>`+circle(400+(m.volume-5)*12,247-m.pressure*65,7,red)+txt(409,38,'Pressure (atm)',16)+txt(526,286,'Volume (L)',16,ink,'middle')+txt(397,266,'5',12)+txt(637,266,'25',12)+txt(474,124,`${fmt(m.pressure,2)} atm`,23,red);
      for(const p of [0,1,2])art+=txt(390,252-p*65,p,12,ink,'end');
      summary=`At ${fmt(m.volume,1)} L, 0.500 mol ideal gas at 300 K exerts ${fmt(m.pressure,3)} atm. Decreasing volume raises pressure; P times V remains constant.`;rows=[['Volume',`${fmt(m.volume,1)} L`],['Pressure',`${fmt(m.pressure,3)} atm`],['Amount','0.500 mol'],['Temperature','300 K']];break;
    }
    case 8:{
      const height=190*m.volume;art=rect(70,40,196,218,'#fff','#7e9da5')+rect(73,255-height,190,height,pale)+line(73,255-height,263,255-height,teal,2)+txt(167,291,`${fmt(m.volume,2)} L solution`,17,ink,'middle');
      for(let i=0;i<20;i++)art+=circle(89+i%5*34,255-height+height*(0.14+Math.floor(i/5)*0.23),4,teal);
      art+=txt(350,79,'Solute stays fixed',24,teal)+txt(350,126,'0.100 mol',25)+txt(350,178,`M = 0.100 ÷ ${fmt(m.volume,2)}`,20)+txt(350,221,`= ${fmt(m.molarity,3)} mol/L`,26,teal)+txt(350,274,'Same 20 population markers at every volume.',14);
      summary=`A fixed 0.100 mol of solute in ${fmt(m.volume,2)} L solution has molarity ${fmt(m.molarity,3)} M. Adding solvent reduces concentration without removing solute.`;rows=[['Solute amount','0.100 mol'],['Solution volume',`${fmt(m.volume,2)} L`],['Molarity',`${fmt(m.molarity,3)} M`],['Solute removed','0 mol']];break;
    }
    case 9:{
      art=txt(43,42,'Equal pH steps = equal tenfold factors',22,teal)+line(56,127,651,127,ink,3);
      for(let p=0;p<=14;p++)art+=line(56+p*42.5,119,56+p*42.5,136,ink)+txt(56+p*42.5,158,p,14,ink,'middle');
      art+=circle(56+m.ph*42.5,127,9,red)+txt(354,94,`pH ${m.ph}`,25,red,'middle')+txt(56,202,'[H₃O⁺] ≈',18)+txt(56,238,`${sci(m.hydronium)} mol/L`,22)+txt(397,202,'[OH⁻] ≈',18)+txt(397,238,`${sci(m.hydroxide)} mol/L`,22)+txt(56,284,'At 25 °C: pH + pOH = 14 in this idealized model.',15)+txt(56,311,m.ph<=1||m.ph>=13?'Concentrated endpoints: activity corrections can matter.':'Concentrations approximate activities in dilute solutions.',14);
      summary=`pH ${m.ph}; idealized hydronium concentration ${sci(m.hydronium)} mol/L; pOH ${m.poh}. The scale is logarithmic. Concentration readouts assume activity coefficients of one; concentrated endpoints need not match real measurements.`;rows=[['pH',m.ph],['pOH',m.poh],['Approximate [H₃O⁺]',`${sci(m.hydronium)} M`],['Approximate [OH⁻]',`${sci(m.hydroxide)} M`]];break;
    }
    case 10:{
      art=rect(59,60,190,178,'#fff','#9fb8bf')+rect(62,128,184,107,'#e9c9c3')+rect(450,60,190,178,'#fff','#9fb8bf')+rect(453,128,184,107,pale)+rect(220,80,10,137,'#fff',ink)+rect(222,213-(m.hot-20)*1.8,6,(m.hot-20)*1.8,red)+circle(225,218,8,red)+rect(611,80,10,137,'#fff',ink)+rect(613,213-(m.cold-20)*1.8,6,(m.cold-20)*1.8,teal)+circle(616,218,8,teal)+txt(136,181,'100 g water',15,ink,'middle')+txt(527,181,'100 g water',15,ink,'middle')+(m.progress<1?arrow(280,147,417,147):line(280,147,417,147,'#9fb8bf',2))+txt(350,121,m.progress<1?'heat transfer':'no net heat',16,ink,'middle')+txt(155,39,'Initially hotter water',17,ink,'middle')+txt(546,39,'Initially cooler water',17,ink,'middle')+txt(155,273,`${fmt(m.hot,1)} °C`,24,red,'middle')+txt(546,273,`${fmt(m.cold,1)} °C`,24,teal,'middle')+txt(155,305,`${fmt(m.qHot/1000,2)} kJ`,17,ink,'middle')+txt(546,305,`+${fmt(m.qCold/1000,2)} kJ`,17,ink,'middle');
      summary=`At ${Math.round(m.progress*100)}% of the modeled transfer, hotter water is ${fmt(m.hot,1)} °C and cooler water is ${fmt(m.cold,1)} °C. Heat lost and gained have equal magnitude. Final equilibrium temperature is ${fmt(m.final,1)} °C.`;rows=[['Hot-water temperature',`${fmt(m.hot,1)} °C`],['Cold-water temperature',`${fmt(m.cold,1)} °C`],['Hot-water heat',`${fmt(m.qHot/1000,3)} kJ`],['Cold-water heat',`${fmt(m.qCold/1000,3)} kJ`]];break;
    }
    case 11:{
      for(let i=0;i<64;i++)art+=circle(44+i%8*29,67+Math.floor(i/8)*27,8,i<m.markers?teal:'#fff',i<m.markers?'none':'#a8bbc0');
      art+=txt(44,306,'64 symbolic parent-population units',14);
      let path='';for(let h=0;h<=6;h+=0.05)path+=`${h===0?'M':'L'}${376+h*46},${256-190*2**-h}`;
      art+=line(376,57,376,256,ink)+line(376,256,665,256,ink)+`<path d="${path}" fill="none" stroke="${teal}" stroke-width="3"/>`+circle(376+m.halflives*46,256-190*m.fraction,7,red)+txt(385,34,'Parent fraction remaining',17)+txt(359,71,'1',13,ink,'end')+txt(359,166,'½',13,ink,'end')+txt(359,261,'0',13,ink,'end');
      for(let h=0;h<=6;h++)art+=txt(376+h*46,277,h,13,ink,'middle');
      art+=txt(520,309,'Elapsed half-lives',15,ink,'middle')+txt(460,125,`${fmt(m.percent,2)}%`,29,teal);
      summary=`After ${m.halflives} half-lives, the expected remaining parent fraction is ${fmt(m.fraction,5)}, or ${fmt(m.percent,2)}%. The diagram rounds this to ${m.markers} of 64 symbolic markers.`;rows=[['Elapsed half-lives',m.halflives],['Parent fraction',fmt(m.fraction,5)],['Parent remaining',`${fmt(m.percent,2)}%`],['Symbolic markers',`${m.markers} / 64 (rounded)`]];break;
    }
  }
  return {svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 332" role="img" aria-label="${escapeHTML(summary)}" style="font-family:system-ui,sans-serif"><title>${escapeHTML(summary)}</title><rect width="720" height="332" fill="#f6fafb"/>${art}</svg>`,summary,rows};
}
