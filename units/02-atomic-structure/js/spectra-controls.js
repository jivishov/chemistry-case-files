const ELEMENT_Z = Object.freeze({
  H: 1, He: 2, B: 5, Ne: 10, Na: 11, Mg: 12, Cl: 17, Cu: 29, Br: 35, Hg: 80
});

const STYLE_ID = 'u2-element-controls-style';

function mountStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .u2-element-field {
      position: relative;
      max-width: none !important;
      width: 100%;
      margin-bottom: var(--s-4);
    }
    .u2-element-field > label {
      display: block;
      margin-bottom: var(--s-2);
    }
    .u2-native-select {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      border: 0 !important;
      opacity: 0 !important;
      pointer-events: none !important;
      clip-path: inset(50%) !important;
      overflow: hidden !important;
      white-space: nowrap !important;
    }
    .u2-element-strip {
      display: grid;
      grid-template-columns: repeat(5, minmax(76px, 108px));
      gap: var(--s-2);
      align-items: stretch;
      overflow-x: auto;
      padding: 2px 2px 4px;
    }
    .u2-element-cell {
      position: relative;
      min-height: 72px;
      padding: 6px 8px 7px;
      border: 1px solid var(--border-strong);
      border-radius: var(--r-sm);
      background: var(--surface);
      color: var(--ink);
      cursor: pointer;
      text-align: left;
      box-shadow: var(--shadow-sm);
      transition: border-color var(--t-fast), background var(--t-fast), box-shadow var(--t-fast), transform var(--t-fast);
    }
    .u2-element-cell::before {
      content: '';
      position: absolute;
      inset: 0 0 auto;
      height: 3px;
      border-radius: var(--r-sm) var(--r-sm) 0 0;
      background: transparent;
    }
    .u2-element-cell:hover {
      border-color: var(--accent-300);
      transform: translateY(-1px);
    }
    .u2-element-cell:focus-visible {
      outline: 3px solid var(--accent-300);
      outline-offset: 2px;
    }
    .u2-element-cell.is-selected {
      border-color: var(--accent);
      background: var(--accent-050);
      box-shadow: 0 0 0 1px var(--accent-100);
    }
    .u2-element-cell.is-selected::before { background: var(--accent); }
    .u2-element-cell .pt-z {
      display: block;
      font-family: var(--font-mono);
      font-size: var(--fs-2xs);
      line-height: 1;
      color: var(--muted);
    }
    .u2-element-cell .pt-symbol {
      display: block;
      margin: 2px 0 1px;
      font-family: var(--font-display);
      font-size: var(--fs-xl);
      font-weight: 800;
      line-height: 1;
      text-align: center;
      color: var(--accent-700);
    }
    .u2-element-cell .pt-name {
      display: block;
      overflow: hidden;
      font-size: var(--fs-2xs);
      line-height: 1.15;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .mass-element-row {
      grid-template-columns: minmax(0, 1fr) auto !important;
      align-items: end !important;
    }
    .mass-element-row .u2-element-field { margin-bottom: 0; }
    .mass-element-row .u2-element-strip {
      grid-template-columns: repeat(5, minmax(68px, 88px));
    }
    .mass-element-row .u2-element-cell {
      min-height: 64px;
      padding: 5px 7px 6px;
    }
    .mass-element-row .u2-element-cell .pt-symbol { font-size: var(--fs-lg); }
    .mass-answer-field {
      width: min(100%, 20rem) !important;
      max-width: 20rem !important;
    }

    .spectra-gauges,
    .mass-gauges {
      grid-template-columns: repeat(auto-fit, minmax(155px, 190px)) !important;
      justify-content: start;
      gap: var(--s-2) !important;
    }
    .spectra-gauges { max-width: 610px; }
    .mass-gauges { max-width: 420px; }
    .spectra-gauges .stat,
    .mass-gauges .stat {
      min-width: 0;
      padding: 6px 9px !important;
    }
    .spectra-gauges .stat .k,
    .mass-gauges .stat .k { font-size: var(--fs-2xs); }
    .spectra-gauges .stat .v,
    .mass-gauges .stat .v {
      margin-top: 1px;
      font-size: var(--fs-lg) !important;
      line-height: 1.15;
    }
    .spectra-gauges .dial-face,
    .mass-gauges .dial-face { max-width: 118px; }
    .spectra-gauges .dial-foot,
    .mass-gauges .dial-foot { gap: 0; margin-top: -2px; }
    .spectra-gauges .dial-read,
    .mass-gauges .dial-read { font-size: var(--fs-2xs); line-height: 1.2; }

    @media (max-width: 980px) {
      .mass-element-row { grid-template-columns: minmax(0, 1fr) !important; }
      .mass-element-row > div:last-child { justify-self: start; }
    }
  `;
  document.head.appendChild(style);
}

function mountElementSelector({ selectId, fieldClass = '', stripClass = '' }) {
  const select = document.getElementById(selectId);
  if (!select || select.dataset.cellSelectorMounted === 'true') return null;

  const field = select.closest('.field');
  if (!field) return null;

  const options = Array.from(select.options).filter(option => option.value);
  if (!options.length) {
    requestAnimationFrame(() => mountElementSelector({ selectId, fieldClass, stripClass }));
    return null;
  }

  select.dataset.cellSelectorMounted = 'true';
  field.classList.add('u2-element-field');
  if (fieldClass) field.classList.add(fieldClass);
  select.classList.add('u2-native-select');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  const strip = document.createElement('div');
  strip.className = `u2-element-strip${stripClass ? ` ${stripClass}` : ''}`;
  strip.setAttribute('role', 'group');

  const label = field.querySelector(`label[for="${selectId}"]`);
  if (label) {
    label.id = label.id || `${selectId}-element-label`;
    label.removeAttribute('for');
    strip.setAttribute('aria-labelledby', label.id);
  } else {
    strip.setAttribute('aria-label', 'Select element');
  }

  for (const option of options) {
    const key = option.value;
    const z = ELEMENT_Z[key] ?? '';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'u2-element-cell';
    button.dataset.elementKey = key;
    button.setAttribute('aria-label', `${option.textContent}, atomic number ${z}`);
    button.setAttribute('aria-pressed', 'false');

    const number = document.createElement('span');
    number.className = 'pt-z';
    number.textContent = z;
    const symbol = document.createElement('span');
    symbol.className = 'pt-symbol';
    symbol.textContent = key;
    const name = document.createElement('span');
    name.className = 'pt-name';
    name.textContent = option.textContent;

    button.append(number, symbol, name);
    button.addEventListener('click', () => {
      if (select.value !== key) {
        select.value = key;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      requestAnimationFrame(syncSelection);
    });
    strip.appendChild(button);
  }

  field.insertBefore(strip, select);

  function syncSelection() {
    const current = select.value;
    strip.querySelectorAll('.u2-element-cell').forEach(button => {
      const selected = button.dataset.elementKey === current;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  select.addEventListener('change', () => requestAnimationFrame(syncSelection));
  const panel = select.closest('.panel');
  if (panel) panel.addEventListener('click', () => requestAnimationFrame(syncSelection));
  syncSelection();
  return { select, field, strip, panel, syncSelection };
}

function mountSpectrumControls() {
  const mounted = mountElementSelector({ selectId: 'spec', fieldClass: 'spectrum-element-field' });
  if (!mounted) return;
  const gaugeRow = mounted.panel?.querySelector('.stat-row.has-dials');
  if (gaugeRow) gaugeRow.classList.add('spectra-gauges');
}

function mountMassControls() {
  const mounted = mountElementSelector({ selectId: 'iso', fieldClass: 'mass-element-field' });
  if (!mounted) return;

  const row = mounted.field.closest('.a-row');
  if (row) row.classList.add('mass-element-row');

  const answerField = mounted.panel?.querySelector('.work-order .field.field-260');
  if (answerField) answerField.classList.add('mass-answer-field');

  const gaugeRow = mounted.panel?.querySelector('.stat-row.has-dials');
  if (gaugeRow) gaugeRow.classList.add('mass-gauges');
}

mountStyles();
mountSpectrumControls();
mountMassControls();
