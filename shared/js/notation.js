// notation.js — chemical and scientific typography, as HTML, with no dependencies.
//
// WHY THIS EXISTS. Formulas and exponents were reaching the page as plain ASCII: "2Na +
// 2H2O -> 2NaOH + H2" in Unit 3's family panel, "6.022e23" in Unit 6's reference card,
// "1.882e+24" in its Honors verdict. H2O is not H₂O, and e-notation is not scientific
// notation. KaTeX + mhchem handles this wherever a binding was written as `x-ce`, but three
// units never load KaTeX at all, most formula readouts are plain `x-text`, and even where
// KaTeX is loaded a CDN miss silently degrades every formula on the page to ASCII.
//
// WHY MARKUP AND NOT UNICODE. The obvious fix is U+2080-2089 and U+2070-2079. It does not
// work here, for the reason gauge.js's exp10Parts and molezoom.js's exp10Html already record:
// the display and mono faces this project ships carry ¹²³ (Latin-1) but not ⁰ or ⁴-⁹, and
// Atkinson Hyperlegible does not cover the Superscripts and Subscripts block at all. A
// Unicode subscript would silently swap fonts in the middle of a formula. So every raised or
// lowered run here is a real <sub>/<sup> element, which is also what a screen reader wants.
// The two non-ASCII characters used, × (U+00D7) and → (U+2192), are single glyphs rather than
// digits inside a number, so a fallback face for them costs nothing.
//
// EVERY EXPORT ESCAPES ITS INPUT FIRST. These functions produce HTML that callers bind with
// x-html, so escaping is not optional. It is done before any markup is inserted, which makes
// x-html + notation strictly safer than the x-text it replaces was informative.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);

// All 118 symbols, not chem.js's 37-element teaching subset: this module has to RECOGNISE a
// formula, and Unit 9 alone reaches Rb and Cs while Unit 1 weighs Ag, Au and Pb.
const SYMBOLS = new Set(`H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe
Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce
Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th
Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og`.split(/\s+/));

// Groups that are written lowercase inside parentheses and are NOT formulas: the phase
// labels. Kept explicit so `(aq)` never tries to parse as a chemical group.
const PHASES = new Set(['s', 'l', 'g', 'aq']);

const ARROWS = [
  ['<=>', '⇌'], ['<->', '⇌'], ['-->', '→'],
  ['->', '→'], ['=>', '→'], ['→', '→'], ['⇌', '⇌'],
];

// ---------------------------------------------------------------------------------------
// formulaHTML: one formula, or a whole equation, as HTML.
//
// The scanner carries one bit of state -- whether the previous token can take a subscript --
// and that bit is what separates a COEFFICIENT from a SUBSCRIPT. In "2 H2O" the leading 2
// follows an operator (nothing subscriptable) so it stays full size; the second 2 follows the
// symbol H, so it drops. Same bit decides `+`: immediately after an atom it is a charge and
// goes up, with space around it it is the plus between two species.
//
// Accepts the mhchem spellings the models already store, because those strings are also fed
// to KaTeX and must not be forked: `->` and `<=>` for arrows, `^2-` for a charge, and a bare
// `v` / `^` for a precipitate or an evolved gas.
// ---------------------------------------------------------------------------------------
export function formulaHTML(src) {
  const s = String(src ?? '');
  if (!s) return '';
  let out = '', i = 0;
  // True when the thing just emitted was an atom, a closing bracket or a subscript, i.e.
  // something a digit or a sign could attach to.
  let attachable = false;
  const boundary = k => k <= 0 || k >= s.length || /\s/.test(s[k]);

  while (i < s.length) {
    const rest = s.slice(i);

    // --- arrows, longest spelling first so '-->' never matches as '->' ---
    const arrow = ARROWS.find(([lit]) => rest.startsWith(lit));
    if (arrow) {
      // Own the spacing on both sides, so ' -> ' does not come out as two spaces, an arrow
      // and two more: the whitespace branch has already emitted the space before this.
      out = out.replace(/\s+$/, '') + ' ' + arrow[1] + ' ';
      i += arrow[0].length;
      while (/\s/.test(s[i] ?? '')) i++;
      attachable = false;
      continue;
    }

    const ch = s[i];

    // --- whitespace: ends the unit, so the next digit is a coefficient ---
    // Without the reset, "[Ne] 3s2" lowered the 3: the ']' left the scanner attachable and
    // the space did not clear it.
    if (/\s/.test(ch)) { out += ' '; i++; attachable = false; continue; }

    // --- a lone v or ^ is mhchem's precipitate / gas marker ---
    if ((ch === 'v' || ch === '^') && boundary(i - 1) && boundary(i + 1)) {
      out += ch === 'v' ? '↓' : '↑';
      i++; attachable = false; continue;
    }

    // --- nuclide prescripts: ^{235}_{92}U ---
    // Unit 11 writes its nuclear equations in the braced TeX form, which is a third notation
    // again: the mass number and the atomic number both come BEFORE the symbol and stack on
    // top of each other. KaTeX stacks them; without it they used to reach the page as literal
    // "^{235}_{92}U". A one-cell inline-block with a block-level sup over a block-level sub
    // is the same stack in plain HTML (the .nuclide rule in shared/css/base.css).
    {
      const st = /^\^\{([^}]*)\}_\{([^}]*)\}/.exec(rest) || /^_\{([^}]*)\}\^\{([^}]*)\}/.exec(rest);
      if (st) {
        const reversed = rest[0] === '_';
        const mass = reversed ? st[2] : st[1];
        const num = reversed ? st[1] : st[2];
        out += `<span class="nuclide"><sup>${escapeHTML(mass)}</sup><sub>${escapeHTML(num)}</sub></span>`;
        i += st[0].length; attachable = false; continue;
      }
      const one = /^\^\{([^}]*)\}/.exec(rest);
      if (one) { out += '<sup>' + escapeHTML(one[1]) + '</sup>'; i += one[0].length; attachable = false; continue; }
      const low = /^_\{([^}]*)\}/.exec(rest);
      if (low) { out += '<sub>' + escapeHTML(low[1]) + '</sub>'; i += low[0].length; attachable = false; continue; }
    }

    // --- element symbol: one capital plus any lowercase run ---
    if (/[A-Z]/.test(ch)) {
      let sym = ch, j = i + 1;
      while (j < s.length && /[a-z]/.test(s[j])) { sym += s[j]; j++; }
      // Longest-match failure: "Nas" is not a symbol, but "Na" is, so back off to the
      // longest prefix that is. Keeps prose like "Nitrogen" from being read as N + itrogen
      // only when nothing matches at all, which is handled by the caller (notationHTML).
      while (sym.length > 1 && !SYMBOLS.has(sym)) sym = sym.slice(0, -1);
      out += escapeHTML(sym);
      i += sym.length;
      attachable = true;
      continue;
    }

    // --- brackets ---
    if (ch === '(' || ch === '[') {
      // A phase label is a unit, not a group: emit it whole so its letters never look like
      // symbols and its closing bracket never takes a subscript.
      const m = /^[([]([slgaq]{1,2})[)\]]/.exec(rest);
      if (m && PHASES.has(m[1])) {
        out += '<span class="phase">' + escapeHTML(m[0]) + '</span>';
        i += m[0].length;
        attachable = false;
        continue;
      }
      out += ch; i++; attachable = false; continue;
    }
    if (ch === ')' || ch === ']') { out += ch; i++; attachable = true; continue; }

    // --- digits: subscript when they can attach, coefficient when they cannot ---
    if (/[0-9]/.test(ch)) {
      let n = '', j = i;
      while (j < s.length && /[0-9]/.test(s[j])) { n += s[j]; j++; }
      out += attachable ? '<sub>' + n + '</sub>' : n;
      i = j;
      // A coefficient makes the NEXT digit-bearing thing a formula, not a subscript target;
      // a subscript leaves the unit still attachable so Ca2+ works.
      continue;
    }

    // --- explicit charge: ^2-, ^+, ^3+ ---
    if (ch === '^') {
      const m = /^\^([0-9]*)([+-]+)/.exec(rest);
      if (m) {
        out += '<sup>' + m[1] + m[2] + '</sup>';
        i += m[0].length;
        attachable = false;
        continue;
      }
      out += '^'; i++; continue;
    }

    // --- + and - : a charge when welded to an atom, an operator when spaced ---
    if (ch === '+' || ch === '-') {
      const welded = attachable && !/\s/.test(s[i - 1] ?? ' ');
      if (welded) {
        let sign = '', j = i;
        while (j < s.length && (s[j] === '+' || s[j] === '-')) { sign += s[j]; j++; }
        out += '<sup>' + sign + '</sup>';
        i = j; attachable = false; continue;
      }
      out += ch; i++; attachable = false; continue;
    }

    // --- hydrate dot; the multiplier after it is a coefficient, not a subscript ---
    if (ch === '·' || ch === '*') { out += '·'; i++; attachable = false; continue; }

    out += escapeHTML(ch); i++; attachable = false;
  }
  return out;
}

// ---------------------------------------------------------------------------------------
// configHTML: an electron configuration.
//
// This needs its own function because it is NOT a chemical formula and putting it through
// formulaHTML gets it wrong twice over: in "1s2 2s2 2p6 3s2" the digit BEFORE the letter is
// the principal quantum number and stays full size, while the digit AFTER it is the electron
// count and belongs in a SUPERSCRIPT -- the opposite of a subscript, which is what a formula
// would have done to it. A noble-gas core in brackets passes through untouched.
//
// The config PILLS in the markup already build <sup> per subshell by hand; this is for the
// flat string forms (chem.js's formatConfig and each unit's shorthand) that were plain text.
// ---------------------------------------------------------------------------------------
export function configHTML(src) {
  const s = String(src ?? '');
  if (!s) return '';
  // n, then the subshell letter, then the electron count. Everything else (spaces, a [Ne]
  // core, a stray comma) is escaped and passed through by the replace callback's default.
  return escapeHTML(s).replace(/(\d+)([spdf])(\d+)/g, (_, n, l, e) => `${n}${l}<sup>${e}</sup>`);
}

// ---------------------------------------------------------------------------------------
// sciHTML: a number as scientific notation, mantissa × 10^exponent.
//
// `always` false (the default) leaves numbers a reader would rather see in full alone, on the
// same 1e-3..1e5 window fmt() uses, because "0.5" is more use to a learner than
// "5 × 10⁻¹". Above and below that the exponent IS the information.
// ---------------------------------------------------------------------------------------
export function sciHTML(value, { sig = 3, always = false } = {}) {
  const n = Number(value);
  if (!isFinite(n)) return '&mdash;';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (!always && abs < 1e5 && abs >= 1e-3) return escapeHTML(String(Number(n.toPrecision(sig))));
  const [mant, exp] = n.toExponential(Math.max(0, sig - 1)).split('e');
  return expHTML(mant, Number(exp));
}

// mantissa × 10^exp, already split. A mantissa of exactly 1 is dropped, because 10²³ reads
// better than 1 × 10²³ and is what a chemistry text prints.
//
// The mantissa is emitted as GIVEN, not re-parsed through Number(): "3.0e-8" carries two
// significant figures and Number() would silently print it as 3.
export function expHTML(mantissa, exponent) {
  const text = String(mantissa);
  const lead = (Number(text) === 1 && !/\.\d*[1-9]/.test(text)) ? '' : escapeHTML(text) + ' × ';
  // U+2212 is not in every face here, so a superscript minus is the ASCII hyphen. At
  // superscript size, in a <sup>, that is the conventional rendering anyway.
  return lead + '10<sup>' + escapeHTML(String(exponent)) + '</sup>';
}

// ---------------------------------------------------------------------------------------
// notationHTML: authored prose, with the formulas and exponents inside it marked up.
//
// This is the one function that has to be conservative, because it runs over English. It
// rewrites exactly three things and leaves every other character alone:
//
//   1. e-notation with a mantissa:  6.022e23, 1.88e+24, 3.0e-8  ->  6.022 × 10²³
//   2. a written power of ten:      10^4, 10^-7                 ->  10⁴
//   3. a token that is a REAL formula: every letter run in it is an element symbol, it
//      carries at least one digit or charge, and it is delimited by non-word characters.
//
// Rule 3's three conditions are what keep it off English and off the standards codes. "NO"
// has no digit, so the word survives. "In" is a symbol but has no digit. "C.9(C)" splits at
// the period into "C" (no digit) and a run starting with a digit, so neither qualifies.
// "pH" starts lowercase. "Bronsted-Lowry" contains letter runs that are not symbols. The
// cost of being this strict is that a bare "CO" or "Fe" in prose stays plain, which is
// correct: there is nothing to raise or lower in it.
// ---------------------------------------------------------------------------------------
// Two guards on the exponent rules, both aimed at the same real hazard: a CSS hex colour.
// "#0e2836" contains "0e2836", which a naive e-notation rule reads as 0 × 10^2836 and
// silently destroys. So the mantissa may not follow a '#', and the exponent is capped at
// three digits -- no quantity in this curriculum passes 10^30, while a hex triplet always
// runs longer. Either guard alone would be enough; both are cheap.
const E_NOTATION = /(?<![\w.#])(\d+(?:\.\d+)?)[eE]([+-]?\d{1,3})(?![\w.])/g;
const POWER_TEN = /(?<![\w.#])10\^(-?\d{1,3})(?![\w.])/g;
// A candidate formula token: starts uppercase, then letters, digits, brackets, dots, and an
// optional trailing charge. Validated properly by isFormulaToken before anything is rewritten.
const CANDIDATE = /(?<![\w^])[A-Z][A-Za-z0-9()[\]]*(?:\^[0-9]*[+-]+|[0-9]*[+-](?![\w]))?(?![\w])/g;

// Is this token a formula, rather than a word that happens to start with a capital?
export function isFormulaToken(tok) {
  const t = String(tok);
  if (!/[0-9]/.test(t) && !/[+-]/.test(t)) return false;   // nothing to typeset
  if (!/^[A-Z]/.test(t)) return false;
  // Strip a trailing charge, then every bracket and digit, and require what is left to be a
  // clean concatenation of element symbols.
  const body = t.replace(/(\^[0-9]*[+-]+|[0-9]*[+-]+)$/, '').replace(/[()[\]]/g, '');
  if (!body) return false;
  let i = 0;
  while (i < body.length) {
    if (!/[A-Z]/.test(body[i])) return false;
    let sym = body[i], j = i + 1;
    while (j < body.length && /[a-z]/.test(body[j])) { sym += body[j]; j++; }
    while (sym.length > 1 && !SYMBOLS.has(sym)) { sym = sym.slice(0, -1); j--; }
    if (!SYMBOLS.has(sym)) return false;
    i = j;
    while (i < body.length && /[0-9]/.test(body[i])) i++;
  }
  return true;
}

export function notationHTML(text) {
  let s = escapeHTML(text);
  // Order matters: the exponent rules run first, so a formula pass can never see a bare
  // exponent digit and can never land inside markup the exponent rules just wrote.
  s = s.replace(E_NOTATION, (_, mant, exp) => expHTML(mant, Number(exp)));
  s = s.replace(POWER_TEN, (_, exp) => '10<sup>' + exp + '</sup>');
  s = s.replace(CANDIDATE, tok => (isFormulaToken(tok) ? formulaHTML(tok) : tok));
  return s;
}

// ---------------------------------------------------------------------------------------
// Alpine directives. Each is the x-html counterpart of an x-text binding, so converting a
// site is a one-word edit:
//   x-formula  the value IS a formula or an equation
//   x-config   the value IS an electron configuration (1s2 2s2 -> 1s² 2s²)
//   x-sci      the value IS a number, shown in scientific notation
//   x-prose    the value is authored prose that may contain either
// x-sci takes modifiers: .always forces the exponent form, and a numeric modifier sets the
// significant figures, e.g. x-sci.always.4="target".
// ---------------------------------------------------------------------------------------
export function registerNotation(Alpine) {
  const bind = (name, render) => Alpine.directive(name, (el, { expression, modifiers }, { evaluateLater, effect }) => {
    const get = evaluateLater(expression);
    effect(() => get(v => { el.innerHTML = render(v, modifiers); }));
  });
  bind('formula', v => formulaHTML(v));
  bind('config', v => configHTML(v));
  bind('prose', v => notationHTML(v));
  bind('sci', (v, mods) => {
    const digits = mods.map(Number).find(n => Number.isInteger(n) && n > 0);
    return sciHTML(v, { sig: digits || 3, always: mods.includes('always') });
  });
}
