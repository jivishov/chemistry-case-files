// main.js — Unit 2 view-model (Atomic Structure & Theory, C.6 + C.5B).
import {
  ATOMIC_MODELS, BUILD_SET, ISOTOPE_ELEMENTS, SPECTRA,
  CONFIG_EXCEPTIONS, NOBLE_CORES, SE
} from './model.js';
import {
  ATOMIC_MASS, ELEMENTS, averageAtomicMass, electronConfiguration, formatConfig,
  shellOccupancy, valenceElectrons, frequencyOf, photonEnergy, rydbergWavelength, fmt
} from '../../../shared/js/chem.js';

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

export { SE };

export function createSim() {
  return {
    ATOMIC_MODELS, ISOTOPE_ELEMENTS, SPECTRA, CONFIG_EXCEPTIONS, SE, fmt,
    honors: false,
    mode: 'build',

    // ---- C.6(A/B) build an atom ----
    elZ: 6, nNeutrons: 6, nElectrons: 6,
    // ---- C.6(D) average atomic mass ----
    isoKey: 'Cl', isoAbund: {},
    // ---- C.6(C) emission spectra ----
    specKey: 'H', selLine: null,
    // ---- C.6(E)/C.5(B) electrons ----
    cfgZ: 11, vQuiz: null, vChecked: false,

    init() {
      this.onElement();
      this.resetNatural();
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
    massLineSvg() {
      const ms = this.iso.isotopes.map(m => m.mass);
      const lo = Math.floor(Math.min(...ms)) - 1, hi = Math.ceil(Math.max(...ms)) + 1;
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
