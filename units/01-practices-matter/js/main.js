// main.js — Unit 1 view-model (Practices, Measurement & Matter, SEP C.1-C.4).
import { SI_UNITS, PREFIXES, SF_COUNT, SF_ROUND, SF_CALC, SUBSTANCES, AP_BOARDS, SE } from './model.js';
import { sigFigs, roundToSigFigs, density, percentError, mean, sampleStdDev, fmt } from '../../../shared/js/chem.js';

const pick = a => a[(Math.random() * a.length) | 0];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const r1 = x => Math.round(x * 10) / 10;
const r2 = x => Math.round(x * 100) / 100;
const numClose = (a, b, tol) => Math.abs(a - b) <= (tol ?? 1e-6 * Math.max(1, Math.abs(b)));
// crude normal sample (sum of uniforms), mean 0, sd ~1
const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 0.816;
// Keep a target dot inside the outer ring, pulling it straight back along its own
// direction so a clamped dot still reads as "off this way", not "off to the corner".
const onBoard = (x, y) => {
  const r = Math.hypot(x, y);
  return r <= 0.92 ? { x, y } : { x: x * 0.92 / r, y: y * 0.92 / r };
};

// graduated-cylinder SVG geometry (50 mL)
const MAXV = 50, TOP = 20, BOT = 300, SPAN = BOT - TOP;

const EV_SCENARIOS = [
  { label: 'density of a copper sample', accepted: 8.96, unit: 'g/mL', dec: 2 },
  { label: 'boiling point of water', accepted: 100.0, unit: '°C', dec: 1 },
  { label: 'volume delivered by a 25 mL pipette', accepted: 25.00, unit: 'mL', dec: 2 }
];

export { SE };

export function createSim() {
  return {
    SI_UNITS, PREFIXES, SUBSTANCES, AP_BOARDS, SE, fmt,
    honors: false,
    mode: 'measure',
    MAXV,

    // C.1
    mVal: 0, mGuess: '', mChecked: false,
    // C.2
    sfTask: 'count', sfQ: null, sfPick: null, sfInput: '', sfChecked: false,
    // C.3
    dSub: null, dMass: 0, dBefore: 0, dAfter: 0, dVolInput: '', dDensInput: '', dOptions: [], dPick: null, dChecked: false,
    // C.4
    evScenario: null, evTrials: [], evAccepted: 0, evDots: [], evClassPick: null, evChecked: false,

    init() {
      this.newMeasure();
      this.newSF();
      this.newSample();
      this.newDataset();
    },

    // ================= C.1 reading the meniscus =================
    // Alpine x-for/x-if on a <template> inside <svg> does not bind scope, so the
    // repeated SVG markup is built as a string and injected with x-html on a <g>.
    get ticks() {
      const out = [];
      for (let v = 0; v <= MAXV; v++) out.push({ v, y: this.lvlY(v), major: v % 10 === 0 });
      return out;
    },
    lvlY(v) { return BOT - (v / MAXV) * SPAN; },
    lvlH(v) { return (v / MAXV) * SPAN; },
    ticksSvg(labels = false) {
      let s = '';
      for (const t of this.ticks) {
        s += `<line x1="${t.major ? 80 : 88}" x2="99" y1="${t.y}" y2="${t.y}" stroke="#7d929b" stroke-width="${t.major ? 1.4 : 0.7}"></line>`;
        if (labels && t.major) s += `<text x="104" y="${t.y + 3}" font-size="9" fill="#687a82" font-family="JetBrains Mono">${t.v}</text>`;
      }
      return s;
    },
    boardDots(dots) { return dots.map(d => `<circle cx="${(60 + d[0] * 46).toFixed(2)}" cy="${(60 + d[1] * 46).toFixed(2)}" r="3.5" fill="#1d5b66"></circle>`).join(''); },
    liveDots() { return this.evDots.map(d => `<circle cx="${(60 + d.x * 46).toFixed(2)}" cy="${(60 + d.y * 46).toFixed(2)}" r="4" fill="#2a7d8a"></circle>`).join(''); },
    newMeasure() {
      const base = 6 + ((Math.random() * 40) | 0);   // 6..45
      const tenth = 1 + ((Math.random() * 9) | 0);    // .1 .. .9 (force estimation)
      this.mVal = base + tenth / 10;
      this.mGuess = ''; this.mChecked = false;
    },
    checkMeasure() { if (this.mGuess !== '') this.mChecked = true; },
    get mCorrect() { return Math.abs(parseFloat(this.mGuess) - this.mVal) <= 0.1 + 1e-9; },

    // ================= C.2 significant figures =================
    setTask(t) { this.sfTask = t; this.newSF(); },
    newSF() {
      if (this.sfTask === 'count') {
        const str = pick(SF_COUNT);
        this.sfQ = { str, ans: sigFigs(str) };
        this.sfPick = null;
      } else if (this.sfTask === 'round') {
        const base = pick(SF_ROUND), n = pick([2, 3]);
        this.sfQ = { base, n, ans: roundToSigFigs(base, n) };
        this.sfInput = '';
      } else {
        const [a, b] = pick(SF_CALC), sf = Math.min(sigFigs(a), sigFigs(b)), raw = parseFloat(a) * parseFloat(b);
        this.sfQ = { a, b, sf, raw, ans: roundToSigFigs(raw, sf) };
        this.sfInput = '';
      }
      this.sfChecked = false;
    },
    pickSF(n) { if (!this.sfChecked) this.sfPick = n; },
    checkSF() {
      if (this.sfTask === 'count') { if (this.sfPick !== null) this.sfChecked = true; }
      else if (this.sfInput !== '') this.sfChecked = true;
    },
    countState(n) {
      if (!this.sfChecked) return this.sfPick === n ? 'on' : '';
      if (n === this.sfQ.ans) return 'correct';
      if (n === this.sfPick) return 'wrong';
      return '';
    },
    get sfCorrect() {
      if (this.sfTask === 'count') return this.sfPick === this.sfQ.ans;
      return numClose(parseFloat(this.sfInput), this.sfQ.ans, 1e-6 * Math.max(1, Math.abs(this.sfQ.ans)));
    },
    // Show the rounded answer with the right number of sig figs (trailing zeros, or
    // unambiguous scientific notation), which a bare JS number cannot represent.
    get sfAnsDisplay() {
      if (this.sfTask === 'round') return Number(this.sfQ.base).toPrecision(this.sfQ.n);
      if (this.sfTask === 'calc') return Number(this.sfQ.raw).toPrecision(this.sfQ.sf);
      return String(this.sfQ.ans);
    },

    // ================= C.3 density by displacement =================
    newSample() {
      const sub = pick(SUBSTANCES);
      const vs = r1(3 + Math.random() * 6);
      this.dSub = sub;
      this.dMass = r1(sub.density * vs);
      this.dBefore = pick([15.0, 20.0, 25.0]);
      this.dAfter = r1(this.dBefore + vs);
      this.dOptions = shuffle([sub, ...shuffle(SUBSTANCES.filter(s => s !== sub)).slice(0, 3)]).map(s => s.name);
      this.dVolInput = ''; this.dDensInput = ''; this.dPick = null; this.dChecked = false;
    },
    get dVolTrue() { return r1(this.dAfter - this.dBefore); },
    get dDensTrue() { return density(this.dMass, this.dVolTrue); },
    get dNearest() { return SUBSTANCES.reduce((best, s) => Math.abs(s.density - this.dDensTrue) < Math.abs(best.density - this.dDensTrue) ? s : best); },
    pickSub(name) { if (!this.dChecked) this.dPick = name; },
    subState(name) {
      if (!this.dChecked) return this.dPick === name ? 'on' : '';
      if (name === this.dSub.name) return 'correct';
      if (name === this.dPick) return 'wrong';
      return '';
    },
    checkDensity() { if (this.dPick) this.dChecked = true; },
    get dVolOk() { return numClose(parseFloat(this.dVolInput), this.dVolTrue, 0.05); },
    get dDensOk() { return numClose(parseFloat(this.dDensInput), this.dDensTrue, Math.abs(this.dDensTrue) * 0.02); },
    get dIdOk() { return this.dPick === this.dSub.name; },
    // Honors: propagate reading uncertainties into the density.
    get dUncert() {
      const dm = 0.1, dv = 0.2;        // balance +/-0.1 g, two volume reads +/-0.1 mL each
      const rel = dm / this.dMass + dv / this.dVolTrue;
      return { rel: rel * 100, abs: this.dDensTrue * rel };
    },

    // ================= C.4 accuracy vs precision =================
    // Place five trials on the target the way the AP_BOARDS reference cards read: the
    // cluster's distance from the bullseye is the mean's error (accuracy), and the scatter
    // inside the cluster is the trial-to-trial spread (precision). Both axes have to carry
    // data. Using a fixed vertical ladder for y drew every dataset as the same stripe, so a
    // tightly grouped set looked scattered and contradicted the answer the student is asked
    // to pick.
    plotDataset(trials, accepted) {
      const NORM = accepted * 0.09;           // 9% off the accepted value reaches the rim
      const avg = mean(trials);
      const dir = Math.random() * Math.PI * 2; // which way the systematic error points
      const cx = ((avg - accepted) / NORM) * Math.cos(dir);
      const cy = ((avg - accepted) / NORM) * Math.sin(dir);
      // golden angle, so five dots scatter organically instead of forming a pentagon
      const GOLDEN = 2.39996;
      return trials.map((v, i) => {
        const rad = Math.abs(v - avg) / NORM;
        const th = dir + GOLDEN * (i + 1);
        return onBoard(cx + rad * Math.cos(th), cy + rad * Math.sin(th));
      });
    },
    newDataset() {
      const sc = pick(EV_SCENARIOS);
      const accurate = Math.random() < 0.5, precise = Math.random() < 0.5;
      const offset = accurate ? 0 : (Math.random() < 0.5 ? -1 : 1) * sc.accepted * 0.06;
      const spread = (precise ? 0.005 : 0.05) * sc.accepted;
      const f = sc.dec === 1 ? r1 : r2;
      this.evScenario = sc; this.evAccepted = sc.accepted;
      this.evTrials = Array.from({ length: 5 }, () => f(sc.accepted + offset + gauss() * spread));
      this.evDots = this.plotDataset(this.evTrials, sc.accepted);
      this.evClassPick = null; this.evChecked = false;
    },
    get evMean() { return mean(this.evTrials); },
    get evStd() { return sampleStdDev(this.evTrials); },
    get evPctError() { return percentError(this.evMean, this.evAccepted); },
    get evRelStd() { return this.evMean ? this.evStd / Math.abs(this.evMean) * 100 : 0; },
    get evAccurate() { return this.evPctError < 2.5; },
    get evPrecise() { return this.evRelStd < 2; },
    get evVerdict() { return this.evAccurate && this.evPrecise ? 'both' : this.evPrecise ? 'precise' : this.evAccurate ? 'accurate' : 'neither'; },
    pickClass(k) { if (!this.evChecked) this.evClassPick = k; },
    classState(k) {
      if (!this.evChecked) return this.evClassPick === k ? 'on' : '';
      if (k === this.evVerdict) return 'correct';
      if (k === this.evClassPick) return 'wrong';
      return '';
    },
    checkEval() { if (this.evClassPick) this.evChecked = true; }
  };
}
