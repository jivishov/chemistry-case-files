// main.js — Unit 2 view-model (Atomic Structure & Theory, C.6 + C.5B).
import {
  ATOMIC_MODELS, BUILD_SET, ISOTOPE_ELEMENTS, SPECTRA,
  CONFIG_EXCEPTIONS, NOBLE_CORES, SE, SCENARIOS, SHOP, EVIDENCE,
  SPECTRA_BANDS, MASS_BANDS, HONORS_BANDS
} from './model.js';
import {
  ATOMIC_MASS, ELEMENTS, averageAtomicMass, electronConfiguration, formatConfig,
  shellOccupancy, valenceElectrons, frequencyOf, photonEnergy, rydbergWavelength, fmt
} from '../../../shared/js/chem.js';
import { createGame, outcomeBand } from '../../../shared/js/game.js';
import { sceneArt } from './art.js';

// Approximate visible-spectrum colour for a wavelength in nm (Dan Bruton method).
function wavelengthToRGB(nm) {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else if (nm <= 780) { r = 1; }
  let f = 1;
  if (nm < 420) f = 0.3 + 0.7 * (nm - 380) / 40;
  else if (nm > 700) f = 0.3 + 0.7 * (780 - nm) / 80;
  const ch = c => Math.round(255 * Math.pow(Math.max(0, c * f), 0.8));
  return `rgb(${ch(r)},${ch(g)},${ch(b)})`;
}

const ORBITALS = { s: 1, p: 3, d: 5, f: 7 };
const pick = a => a[(Math.random() * a.length) | 0];
const skills = [
  { id:'a', code:'C.6(A)', label:'Atomic models', target:3 }, { id:'b', code:'C.6(B)', label:'Atomic structure', target:3 },
  { id:'d', code:'C.6(D)', label:'Average mass', target:3 }, { id:'c', code:'C.6(C)', label:'Spectra', target:3 },
  { id:'e', code:'C.6(E)', label:'Configuration', target:3 }, { id:'f', code:'C.5(B)', label:'Family behavior', target:3 },
  { id:'h1', code:'Honors', label:'Photon energy', target:2, honors:true }, { id:'h2', code:'Honors', label:'Orbital exceptions', target:2, honors:true },
  { id:'cap', code:'Capstone', label:'Cylinder call', target:1, honors:true }
];

export { SE };

export function createSim() {
  return {
    ...createGame({ unitId:'units_new/02-atomic-structure', skills }),
    ATOMIC_MODELS, ISOTOPE_ELEMENTS, SPECTRA, CONFIG_EXCEPTIONS, SE, SHOP, EVIDENCE, SCENARIOS, fmt,
    honors: false,
    teksOpen: false,
    mode: 'models',

    // Scenario and consequence state.  The old unit's instruments remain the source of
    // each calculation; these values bind a meaningful work order and a consequence to it.
    scIdx: { a:-1, b:-1, d:-1, c:-1, e:-1, f:-1 },
    modelsSc: null, buildSc: null, massSc: null, spectraSc: null, configSc: null, familySc: null,
    modelPick: null, familyPick: null, massInput: '', specEnergyInput: '', h1EnergyInput: '', h2Pick: null, capPick: null,
    modeVerdict: {}, activeScenario: {}, rack: [], shiftEvidence: [], shiftMin: 0, shiftDay: 1, worldLog: [], _wid: 0,

    // ---- C.6(A/B) build an atom ----
    elZ: 6, nNeutrons: 6, nElectrons: 6,
    // ---- C.6(D) average atomic mass ----
    isoKey: 'Cl', isoAbund: {},
    // ---- C.6(C) emission spectra ----
    specKey: 'H', selLine: null,
    // ---- C.6(E)/C.5(B) electrons ----
    // cfgZ is the configuration tool the learner drives; famZ is the element the family
    // work order hands them. Two orders, two elements: see the block comment above on why
    // one shared value made them mutually unsatisfiable.
    cfgZ: 11, famZ: 18, vQuiz: null, vChecked: false,
    // Per-commit reveal state for the three commits that share this bench.
    cfgVerdict: null, famVerdict: null, h2Verdict: null,

    init() {
      this.gLoad();
      this.onElement();
      this.resetNatural();
      this.nextModels(); this.nextBuild(); this.nextMass(); this.nextSpectra(); this.nextFamily(); this.nextConfig();
      this.$watch('elZ', () => this.onElement());
      this.$watch('isoKey', () => this.resetNatural());
      this.$watch('specKey', () => { this.selLine = null; });
      this.$watch('cfgZ', () => { this.vQuiz = null; this.vChecked = false; });
      // A <select x-model> binds before its child x-for has rendered its <option>s,
      // so an initial value that is not the first option does not stick. Re-apply
      // each selected value once the option lists exist.
      this.$nextTick(() => {
        ['elZ', 'isoKey', 'specKey', 'cfgZ'].forEach(k => { const v = this[k]; this[k] = null; this[k] = v; });
      });
    },

    setMode(m) {
      this.mode = m;
      if (m === 'capstone' && this.capUnlocked && !this.capPick) this.capPick = null;
    },
    resetProgress() {
      this.gReset(); this.modeVerdict = {}; this.activeScenario = {}; this.rack = []; this.shiftEvidence = []; this.shiftMin = 0; this.shiftDay = 1; this.worldLog = [];
      this.cfgVerdict = null; this.famVerdict = null; this.h2Verdict = null; this.h2Pick = null;
      this.scIdx = { a:-1, b:-1, d:-1, c:-1, e:-1, f:-1 };
      this.nextModels(); this.nextBuild(); this.nextMass(); this.nextSpectra(); this.nextFamily(); this.nextConfig();
    },
    nextScenario(skill) {
      const list = SCENARIOS.filter(s => s.skill === skill);
      const i = this.scIdx[skill] = ((this.scIdx[skill] ?? -1) + 1) % list.length;
      return list[i];
    },
    nextModels() { this.modelsSc = this.nextScenario('a'); this.modelPick = null; this.focusScenario('models', this.modelsSc); },
    nextBuild() {
      this.buildSc = this.nextScenario('b'); this.elZ = this.buildSc.z; this.onElement(); this.nNeutrons = this.buildSc.n; this.nElectrons = this.buildSc.e; this.focusScenario('build', this.buildSc);
    },
    nextMass() { this.massSc = this.nextScenario('d'); this.isoKey = this.massSc.iso; this.resetNatural(); this.massInput = ''; this.focusScenario('mass', this.massSc); },
    nextSpectra() { this.spectraSc = this.nextScenario('c'); this.specKey = this.spectraSc.spec; this.selLine = 0; this.specEnergyInput = ''; this.focusScenario('spectra', this.spectraSc); },
    nextConfig() { this.configSc = this.nextScenario('e'); this.cfgZ = this.configSc.z; this.vQuiz = null; this.vChecked = false; this.cfgVerdict = null; this.focusScenario('config', this.configSc); },
    nextFamily() { this.familySc = this.nextScenario('f'); this.famZ = this.familySc.z; this.familyPick = null; this.famVerdict = null; this.focusScenario('config', this.familySc); },
    focusScenario(mode, sc) { this.activeScenario[mode] = sc; delete this.modeVerdict[mode]; },
    get clockLabel() { const min = 13 * 60 + this.shiftMin; return `${String(Math.floor(min / 60) % 24).padStart(2,'0')}:${String(min % 60).padStart(2,'0')}`; },
    get rackState() { return this.rack.length >= 5 ? 'The last tube is on the rack' : (this.rack.length ? 'Jobs moving through the shop' : 'Rack open for the first job'); },
    recordWorld({ sc, good, detail, color = '#2a7d8a' }) {
      const minutes = good ? 18 : 48;
      this.shiftMin += minutes;
      if (good) {
        this.rack.push({ id:`${sc.id}-${this._wid}`, label:sc.system, color });
        this.shiftEvidence = [...new Set([...this.shiftEvidence, sc.skill])];
      }
      this.worldLog.unshift({ id:++this._wid, tone:good ? 'success' : 'fail', text:`${this.clockLabel} ${detail}` });
      if (this.worldLog.length > 6) this.worldLog.pop();
      // Six slots are one day's jobs, not a score cap.  Closing the rack advances the
      // shift and opens an empty next-day rack so continued practice remains meaningful.
      if (this.rack.length === SHOP.tubeSlots) {
        this.worldLog.unshift({ id:++this._wid, tone:'success', text:`${this.clockLabel} Six tubes shipped; next shift opens a fresh rack.` });
        this.rack = []; this.shiftDay += 1; this.shiftMin = 0;
      }
    },
    verdict(sc, good, detail, color) {
      const v = good
        ? { tone:'success', state:'SHIPPED', headline:'Evidence supports the call', detail }
        : { tone:'fail', state:'RETURN TO BENCH', headline:'The evidence does not support that call', detail };
      this.gRecord(sc.skill, good, true);
      this.modeVerdict[sc.stage] = v;
      this.activeScenario[sc.stage] = sc;
      this.recordWorld({ sc, good, detail:`${sc.system}: ${good ? 'job shipped' : 'job held for rework'}. ${detail}`, color });
      return v;
    },
    modelState(name) { const sc=this.modelsSc; if (!this.modeVerdict.models) return this.modelPick===name?'on':''; return name===sc.correct?'correct':(name===this.modelPick?'wrong':''); },
    commitModel() {
      if (!this.modelPick) return;
      const sc = this.modelsSc, evidence = EVIDENCE[sc.evidence], ok = this.modelPick === sc.correct;
      this.verdict(sc, ok, `${this.modelPick}: ${evidence.consequence[this.modelPick]}`);
    },
    commitBuild() { const sc=this.buildSc; const ok=this.elZ===sc.z && this.nNeutrons===sc.n && this.nElectrons===sc.e; this.verdict(sc, ok, ok ? `${this.isotopeName} is built with the requested charge.` : `The job requires Z ${sc.z}, ${sc.n} neutrons, and ${sc.e} electrons.`); },
    get massDialValue() { const v = parseFloat(this.massInput); return isFinite(v) ? v : this.avgMass; },
    commitMass() {
      const sc = this.massSc, value = parseFloat(this.massInput), target = sc.expected;
      const ok = this.isoKey === sc.iso && isFinite(value) && outcomeBand(value, target, MASS_BANDS).withinSpec;
      this.verdict(sc, ok,
        ok ? `${fmt(value,5)} u matches the weighted ${this.iso.name} assay.` : `Calculate the fixed assay and enter a value within 0.3% of ${fmt(target,5)} u.`);
    },
    commitSpectra() { const sc=this.spectraSc, val=parseFloat(this.specEnergyInput), line=this.selectedLine; const ok=this.specKey===sc.spec && !!line && isFinite(val) && outcomeBand(val,line.energy,SPECTRA_BANDS).withinSpec; this.verdict(sc, ok, ok ? `${line.wl.toFixed(1)} nm corresponds to ${fmt(line.energy,3)} J per photon.` : `Select a ${sc.spec} line and calculate E = hc/λ in joules.` , line ? line.color : '#2a7d8a'); },
    commitConfig() { const sc=this.configSc; const ok=this.cfgZ===sc.z; this.cfgVerdict = this.verdict(sc, ok, ok ? `${this.cfgEl.name}: ${this.cfgShorthand}. ${this.cfgIsException ? 'The d-subshell exception is identified.' : 'The configuration follows the displayed filling order.'}` : `Set the electron tool to Z ${sc.z} before certifying the configuration.`); },
    // The family element is given, so the graded call is the family behaviour and nothing
    // else -- which is what the f-* goals ask for and all that C.5(B) is about.
    get famEl() { return ELEMENTS.find(e => e.z === this.famZ); },
    familyState(name) { if (!this.famVerdict) return this.familyPick===name?'on':''; return name===this.familySc.correct?'correct':(name===this.familyPick?'wrong':''); },
    commitFamily() { const sc=this.familySc; const ok=this.familyPick===sc.correct; this.famVerdict = this.verdict(sc, ok, ok ? `${this.famEl.name} is correctly identified as ${sc.correct}.` : `${this.famEl.name} is not ${this.familyPick}. Read its valence count off the table and choose again.`); },
    commitH1() { const sc=SCENARIOS.find(s=>s.id==='h1-photon'), val=parseFloat(this.h1EnergyInput), line=this.selectedLine; const ok=!!line && isFinite(val) && outcomeBand(val,line.energy,HONORS_BANDS).withinSpec; this.verdict(sc, ok, ok ? `The selected photon carries ${fmt(line.energy,3)} J.` : 'Select a line and calculate E = hc/λ after converting nm to m.', line ? line.color : '#7651a8'); },
    h2State(v) { if (!this.h2Verdict) return this.h2Pick===v?'on':''; const correct=this.cfgIsException?'exception':'standard'; return v===correct?'correct':(v===this.h2Pick?'wrong':''); },
    commitH2() { const sc=SCENARIOS.find(s=>s.id==='h2-orbital'), correct=this.cfgIsException?'exception':'standard', ok=this.h2Pick===correct; this.h2Verdict = this.verdict(sc, ok, ok ? `${this.cfgEl.name} is ${correct==='exception'?'an explicit configuration exception':'not one of the listed exceptions'}.` : 'Compare the selected element to the explicit exception list.'); },
    get capUnlocked() { return this.gOverall() === 1; },
    get capCorrect() { return this.shiftEvidence.includes('c') && this.shiftEvidence.includes('f') ? 'fill' : 'return'; },
    capState(v) { if (!this.modeVerdict.capstone) return this.capPick===v?'on':''; return v===this.capCorrect?'correct':(v===this.capPick?'wrong':''); },
    commitCap() { if (!this.capPick) return; const sc=SCENARIOS.find(s=>s.id==='cap-glowroom'), ok=this.capPick===this.capCorrect; this.verdict(sc, ok, ok ? `The rack evidence supports “${this.capPick}” for this cylinder.` : 'The final call must follow the spectrum and family evidence assembled in this shift.', '#2f8f5b'); },
    get coreSkills() { return SE.filter(se=>!se.honors); },
    get teksMasteredCount() { return this.coreSkills.filter(se=>this.gMastered(se.id)).length; },
    get activeBrief() { return this.activeScenario[this.mode] || ({models:this.modelsSc,build:this.buildSc,mass:this.massSc,spectra:this.spectraSc,config:this.configSc,capstone:SCENARIOS.find(s=>s.id==='cap-glowroom')})[this.mode] || null; },
    get activeVerdict() { return this.modeVerdict[this.mode] || null; },
    get activeTone() { const t=this.activeVerdict&&this.activeVerdict.tone; return t==='success'?'safe':(t?'danger':'standby'); },
    get activeArtId() { return (this.activeBrief&&this.activeBrief.id)||'a-crt'; },
    get activeStationName() { return (this.activeBrief&&this.activeBrief.system)||'The Glow Room'; },
    get activeStateLabel() { return (this.activeVerdict&&this.activeVerdict.state)||''; },
    get activeOutcomeText() { const v=this.activeVerdict,b=this.activeBrief; return (v&&(v.detail||v.headline))||(b&&(b.why||b.goal))||'Choose a work order from the shop bench.'; },
    get activeReference() { if(this.mode==='spectra') return [{k:'Equation',v:'E = hc/λ'},{k:'Unit',v:'convert nm to m'}]; if(this.mode==='mass') return [{k:'Average',v:'sum(mass × fraction)'},{k:'Check',v:'fractions sum to 1'}]; if(this.mode==='config') return [{k:'Family',v:'main-group valence pattern'},{k:'Exception',v:'Cr and Cu have explicit cases'}]; return [{k:'Shop',v:'one correct call lights one tube'},{k:'Shift',v:'six tubes make one day'}]; },
    scArt(id) { return sceneArt(id); },
    get rackReadings() { return [{key:'jobs',label:'Jobs',raw:`${this.rack.length}/6`,pct:this.rack.length/6*100,color:'var(--accent)'},{key:'core',label:'Core',raw:`${this.teksMasteredCount}/6`,pct:this.gOverall()*100,color:'var(--accent-700)'},{key:'day',label:'Day',raw:`${this.shiftDay}`,pct:Math.min(100,this.shiftDay/3*100),color:'var(--success)'},{key:'log',label:'Log',raw:`${this.worldLog.length}`,pct:Math.min(100,this.worldLog.length/6*100),color:'var(--warn)'}]; },
    rackSvg() { return this.rack.map((r,i)=>`<g transform="translate(${8+i*36},4)"><title>${r.label}</title><rect x="7" y="8" width="18" height="48" rx="8" fill="${r.color}" opacity=".85"/><rect x="12" y="2" width="8" height="8" rx="2" fill="#dcebee"/></g>`).join(''); },

    // ======================= C.6(A/B) BUILD =======================
    get buildElements() { return ELEMENTS.filter(e => BUILD_SET.includes(e.z)); },
    get el() { return ELEMENTS.find(e => e.z === this.elZ); },
    onElement() {
      if (!this.el) return; // guard the transient null during the select re-apply
      const mass = ATOMIC_MASS[this.el.sym];
      this.nNeutrons = Math.max(0, Math.round(mass) - this.elZ);
      this.nElectrons = this.elZ;
    },
    stepNeutrons(d) { this.nNeutrons = Math.max(0, Math.min(this.elZ + 12, this.nNeutrons + d)); },
    stepElectrons(d) { this.nElectrons = Math.max(1, Math.min(this.elZ + 4, this.nElectrons + d)); },
    get massNumber() { return this.elZ + this.nNeutrons; },
    get charge() { return this.elZ - this.nElectrons; },
    get chargeStr() {
      const c = this.charge;
      if (c === 0) return 'neutral atom';
      return `${Math.abs(c)}${c > 0 ? '+' : '-'} ${c > 0 ? 'cation' : 'anion'}`;
    },
    get ionNotation() {
      const c = this.charge;
      if (c === 0) return '';
      return `${Math.abs(c) > 1 ? Math.abs(c) : ''}${c > 0 ? '+' : '-'}`;
    },
    get isotopeName() { return `${this.el.name}-${this.massNumber}`; },
    get massRef() { return ATOMIC_MASS[this.el.sym]; },
    get buildShells() { return shellOccupancy(this.nElectrons); },
    // Bohr shells + electrons are built as a string (x-for inside <svg> does not bind).
    bohrSvg() {
      const c = 150; let s = '';
      this.buildShells.forEach((count, i) => {
        const r = 38 + i * 26;
        s += `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#cfdbe0" stroke-width="1.2"></circle>`;
        for (let k = 0; k < count; k++) {
          const ang = -Math.PI / 2 + k * 2 * Math.PI / count;
          const x = (c + r * Math.cos(ang)).toFixed(1), y = (c + r * Math.sin(ang)).toFixed(1);
          s += `<circle cx="${x}" cy="${y}" r="5.5" fill="#2a7d8a"></circle>`;
        }
      });
      return s;
    },

    // ======================= C.6(D) AVERAGE MASS =======================
    get iso() { return ISOTOPE_ELEMENTS.find(e => e.sym === this.isoKey); },
    resetNatural() { const o = {}; this.iso.isotopes.forEach(m => (o[m.a] = m.abundance)); this.isoAbund = o; },
    get abundSum() { return this.iso.isotopes.reduce((s, m) => s + (+this.isoAbund[m.a] || 0), 0); },
    get isoRows() {
      const sum = this.abundSum;
      return this.iso.isotopes.map(m => {
        const ab = +this.isoAbund[m.a] || 0, frac = sum > 0 ? ab / sum : 0;
        return { ...m, ab, frac, contrib: m.mass * frac };
      });
    },
    get avgMass() {
      return averageAtomicMass(this.iso.isotopes.map(m => ({ mass: m.mass, abundance: +this.isoAbund[m.a] || 0 })));
    },
    get avgError() { return Math.abs(this.avgMass - this.iso.accepted); },
    // The mass number line and the average-mass dial read off ONE axis: from just
    // under the lightest isotope to just over the heaviest. Extracted so the SVG
    // and the dial can never drift apart and disagree about where the average is.
    get isoMassAxis() {
      const ms = this.iso.isotopes.map(m => m.mass);
      return { lo: Math.floor(Math.min(...ms)) - 1, hi: Math.ceil(Math.max(...ms)) + 1 };
    },
    massLineSvg() {
      const { lo, hi } = this.isoMassAxis;
      const x = v => 40 + (v - lo) / (hi - lo) * 520;
      let s = `<line x1="40" y1="60" x2="560" y2="60" stroke="#aebfc6" stroke-width="1.5"></line>`;
      for (let v = lo; v <= hi; v++) {
        s += `<line x1="${x(v).toFixed(1)}" y1="56" x2="${x(v).toFixed(1)}" y2="64" stroke="#aebfc6"></line>`;
        s += `<text x="${x(v).toFixed(1)}" y="80" font-size="9" fill="#687a82" text-anchor="middle" font-family="JetBrains Mono">${v}</text>`;
      }
      this.isoRows.forEach(m => {
        const px = x(m.mass).toFixed(1), h = 10 + m.frac * 34, ty = (60 - h).toFixed(1);
        s += `<line x1="${px}" y1="60" x2="${px}" y2="${ty}" stroke="#2a7d8a" stroke-width="2"></line>`;
        s += `<circle cx="${px}" cy="${ty}" r="4" fill="#2a7d8a"></circle>`;
        s += `<text x="${px}" y="${(60 - h - 7).toFixed(1)}" font-size="9" fill="#1d5b66" text-anchor="middle" font-family="JetBrains Mono">${m.a}</text>`;
      });
      const ax = x(this.avgMass).toFixed(1);
      s += `<line x1="${ax}" y1="20" x2="${ax}" y2="68" stroke="#bf4a30" stroke-width="1.6" stroke-dasharray="4 3"></line>`;
      s += `<polygon points="${ax - 5},20 ${+ax + 5},20 ${ax},28" fill="#bf4a30"></polygon>`;
      s += `<text x="${ax}" y="15" font-size="9" fill="#bf4a30" text-anchor="middle" font-family="JetBrains Mono">avg ${this.avgMass.toFixed(2)}</text>`;
      return s;
    },

    // ======================= C.6(C) SPECTRA =======================
    rgb(nm) { return wavelengthToRGB(nm); },
    nmToX(nm) { return 30 + (Math.max(380, Math.min(700, nm)) - 380) / 320 * 580; },
    get spec() { return SPECTRA.find(s => s.key === this.specKey); },
    // The visible strip drawn above runs 380-700 nm, so the wavelength and the
    // photon-energy dials share exactly those two endpoints. Because E = hc/λ the
    // energy axis is the wavelength axis inverted, which is the whole point of
    // showing the pair: one line puts the two needles on opposite sides, and
    // picking a different line swings them in opposite directions.
    get specAxis() {
      return {
        wlLo: 380, wlHi: 700,
        // Frequency and energy are the same axis twice over (E = h nu), so their
        // two needles move together while the wavelength needle opposes them.
        vLo: frequencyOf(700e-9), vHi: frequencyOf(380e-9),
        eLo: photonEnergy({ wavelength: 700e-9 }),
        eHi: photonEnergy({ wavelength: 380e-9 })
      };
    },
    get lines() {
      let raw;
      if (this.spec.computed) raw = [3, 4, 5, 6].map(n => ({ n, wl: rydbergWavelength(2, n) * 1e9 }));
      else raw = this.spec.lines.map(wl => ({ wl }));
      return raw.map(o => ({
        ...o, color: wavelengthToRGB(o.wl),
        freq: frequencyOf(o.wl * 1e-9), energy: photonEnergy({ wavelength: o.wl * 1e-9 })
      }));
    },
    get selectedLine() { return this.selLine != null ? this.lines[this.selLine] : null; },
    spectrumSvg() {
      let s = '';
      for (let nm = 380; nm <= 700; nm += 4) {
        const x = this.nmToX(nm), w = (this.nmToX(nm + 4) - x + 0.6).toFixed(1);
        s += `<rect x="${x.toFixed(1)}" y="8" width="${w}" height="24" fill="${wavelengthToRGB(nm)}"></rect>`;
      }
      s += `<rect x="30" y="46" width="580" height="40" fill="#0b0f12"></rect>`;
      this.lines.forEach((ln, i) => {
        const x = this.nmToX(ln.wl), sel = this.selLine === i;
        s += `<rect x="${(x - (sel ? 1.6 : 1)).toFixed(1)}" y="46" width="${sel ? 3.2 : 2}" height="40" fill="${ln.color}"></rect>`;
        if (sel) s += `<polygon points="${(x - 5).toFixed(1)},90 ${(x + 5).toFixed(1)},90 ${x.toFixed(1)},96" fill="#bf4a30"></polygon>`;
      });
      for (let nm = 400; nm <= 700; nm += 50) {
        const x = this.nmToX(nm).toFixed(1);
        s += `<line x1="${x}" y1="86" x2="${x}" y2="92" stroke="#aebfc6"></line>`;
        s += `<text x="${x}" y="106" font-size="9" fill="#687a82" text-anchor="middle" font-family="JetBrains Mono">${nm}</text>`;
      }
      return s;
    },
    // Honors: hydrogen energy-level diagram showing the quantized Balmer drops.
    energyLevelSvg() {
      const top = 22, bot = 205, yOf = n => top + (1 / (n * n)) * (bot - top);
      let s = '';
      for (let n = 1; n <= 6; n++) {
        const y = yOf(n).toFixed(1);
        s += `<line x1="70" y1="${y}" x2="300" y2="${y}" stroke="#aebfc6" stroke-width="1.2"></line>`;
        s += `<text x="58" y="${(+y + 3).toFixed(1)}" font-size="10" fill="#687a82" text-anchor="end" font-family="JetBrains Mono">n=${n}</text>`;
      }
      [3, 4, 5, 6].forEach((n, i) => {
        const x = 120 + i * 42, y1 = yOf(n).toFixed(1), y2 = yOf(2).toFixed(1);
        const col = wavelengthToRGB(rydbergWavelength(2, n) * 1e9);
        s += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${col}" stroke-width="2.6" marker-end="url(#arrh)"></line>`;
      });
      return s;
    },

    // ======================= C.6(E)/C.5(B) ELECTRONS =======================
    get cfgEl() { return ELEMENTS.find(e => e.z === this.cfgZ); },
    get cfgElements() { return ELEMENTS.filter(e => BUILD_SET.includes(e.z)); },
    get cfgConfig() { return electronConfiguration(this.cfgZ); },
    get cfgString() { return formatConfig(this.cfgConfig); },
    // Noble-gas shorthand for any Z, in the same fill order as the full config.
    shorthandOf(z) {
      const core = NOBLE_CORES.filter(n => n.z < z).pop();
      const full = electronConfiguration(z);
      if (!core) return formatConfig(full);
      const beyond = full.slice(electronConfiguration(core.z).length);
      return `[${core.sym}] ${formatConfig(beyond)}`;
    },
    get cfgShorthand() { return this.shorthandOf(this.cfgZ); },
    get valence() { return valenceElectrons(this.cfgZ); },
    get cfgLastL() { return this.cfgConfig[this.cfgConfig.length - 1].l; },
    get isMainGroup() { return this.cfgLastL === 's' || this.cfgLastL === 'p'; },
    get orbitalDiagram() {
      return this.cfgConfig.map(sub => {
        const orb = ORBITALS[sub.l]; let e = sub.e; const boxes = new Array(orb).fill(0);
        for (let i = 0; i < orb && e > 0; i++) { boxes[i] = 1; e--; }
        for (let i = 0; i < orb && e > 0; i++) { boxes[i] = 2; e--; }
        return { label: `${sub.n}${sub.l}`, boxes };
      });
    },
    arrows(state) { return state === 2 ? '↑↓' : state === 1 ? '↑' : ''; },
    lewisSvg() {
      const cx = 70, cy = 52, v = this.valence;
      const slots = {
        top: [[cx - 9, cy - 30], [cx + 9, cy - 30]],
        right: [[cx + 34, cy - 9], [cx + 34, cy + 9]],
        bottom: [[cx - 9, cy + 30], [cx + 9, cy + 30]],
        left: [[cx - 34, cy - 9], [cx - 34, cy + 9]]
      };
      const order = ['top', 'right', 'bottom', 'left'];
      const placed = [];
      for (let pass = 0; pass < 2; pass++) for (const side of order) { if (placed.length < v) placed.push(slots[side][pass]); }
      return placed.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#1d5b66"></circle>`).join('');
    },
    get family() {
      const z = this.cfgZ, v = this.valence;
      if (z === 1) return { name: 'Hydrogen (a nonmetal)', charge: '+1 or -1', behavior: 'It has 1 valence electron but stands alone; it can lose or gain one.' };
      if (z === 2) return { name: 'Noble gas (Group 18)', charge: '0', behavior: 'Helium fills the first shell with 2 electrons, so it is inert.' };
      if (!this.isMainGroup) return { name: 'Transition metal', charge: 'varies', behavior: 'It loses outer s and some d electrons, forming more than one possible ion.' };
      const map = {
        1: { name: 'Alkali metal (Group 1)', charge: '+1', behavior: 'Loses its 1 valence electron readily; very reactive.' },
        2: { name: 'Alkaline earth metal (Group 2)', charge: '+2', behavior: 'Loses 2 valence electrons.' },
        3: { name: 'Boron group (Group 13)', charge: '+3', behavior: 'Tends to lose 3 valence electrons.' },
        4: { name: 'Carbon group (Group 14)', charge: '±4', behavior: 'Usually shares electrons rather than transferring them.' },
        5: { name: 'Nitrogen group (Group 15)', charge: '-3', behavior: 'Tends to gain 3 electrons.' },
        6: { name: 'Chalcogens (Group 16)', charge: '-2', behavior: 'Tends to gain 2 electrons.' },
        7: { name: 'Halogen (Group 17)', charge: '-1', behavior: 'Gains 1 electron; a very reactive nonmetal.' },
        8: { name: 'Noble gas (Group 18)', charge: '0', behavior: 'Full valence shell, so it is very unreactive.' }
      };
      return map[v] || { name: 'Main-group element', charge: 'varies', behavior: '' };
    },
    // configuration-exception cross-check (Honors)
    get cfgIsException() { return CONFIG_EXCEPTIONS.some(x => x.z === this.cfgZ); },
    // valence quiz (assessment)
    pickV(n) { if (!this.vChecked) this.vQuiz = n; },
    checkV() { if (this.vQuiz !== null) this.vChecked = true; },
    vState(n) {
      if (!this.vChecked) return this.vQuiz === n ? 'on' : '';
      if (n === this.valence) return 'correct';
      if (n === this.vQuiz) return 'wrong';
      return '';
    },
    get vCorrect() { return this.vQuiz === this.valence; }
  };
}
