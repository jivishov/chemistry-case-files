const ELEMENT_Z = Object.freeze({ H: 1, He: 2, Ne: 10, Na: 11, Hg: 80 });

const STYLE_ID = 'u2-spectra-controls-style';

function mountStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .spectrum-element-field {
      position: relative;
      max-width: none !important;
      width: 100%;
      margin-bottom: var(--s-4);
    }
    .spectrum-element-field > label {
      display: block;
      margin-bottom: var(--s-2);
    }
    .spectrum-native-select {
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
    .spectrum-element-strip {
      display: grid;
      grid-template-columns: repeat(5, minmax(76px, 108px));
      gap: var(--s-2);
      align-items: stretch;
      overflow-x: auto;
      padding: 2px 2px 4px;
    }
    .spectrum-element-cell {
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
    .spectrum-element-cell::before {
      content: '';
      position: absolute;
      inset: 0 0 auto;
      height: 3px;
      border-radius: var(--r-sm) var(--r-sm) 0 0;
      background: transparent;
    }
    .spectrum-element-cell:hover {
      border-color: var(--accent-300);
      transform: translateY(-1px);
    }
    .spectrum-element-cell:focus-visible {
      outline: 3px solid var(--accent-300);
      outline-offset: 2px;
    }
    .spectrum-element-cell.is-selected {
      border-color: var(--accent);
      background: var(--accent-050);
      box-shadow: 0 0 0 1px var(--accent-100);
    }
    .spectrum-element-cell.is-selected::before { background: var(--accent); }
    .spectrum-element-cell .pt-z {
      display: block;
      font-family: var(--font-mono);
      font-size: var(--fs-2xs);
      line-height: 1;
      color: var(--muted);
    }
    .spectrum-element-cell .pt-symbol {
      display: block;
      margin: 2px 0 1px;
      font-family: var(--font-display);
      font-size: var(--fs-xl);
      font-weight: 800;
      line-height: 1;
      text-align: center;
      color: var(--accent-700);
    }
    .spectrum-element-cell .pt-name {
      display: block;
      overflow: hidden;
      font-size: var(--fs-2xs);
      line-height: 1.15;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .spectra-gauges {
      grid-template-columns: repeat(auto-fit, minmax(155px, 190px)) !important;
      justify-content: start;
      gap: var(--s-2) !important;
      max-width: 610px;
    }
    .spectra-gauges .stat {
      min-width: 0;
      padding: 6px 9px !important;
    }
    .spectra-gauges .stat .k { font-size: var(--fs-2xs); }
    .spectra-gauges .stat .v {
      margin-top: 1px;
      font-size: var(--fs-lg) !important;
      line-height: 1.15;
    }
    .spectra-gauges .dial-face { max-width: 118px; }
    .spectra-gauges .dial-foot { gap: 0; margin-top: -2px; }
    .spectra-gauges .dial-read { font-size: var(--fs-2xs); line-height: 1.2; }
  `;
  document.head.appendChild(style);
}

function mountSpectrumControls() {
  const select = document.getElementById('spec');
  if (!select || select.dataset.cellSelectorMounted === 'true') return;

  const field = select.closest('.field');
  const panel = select.closest('.panel');
  if (!field || !panel) return;

  const options = Array.from(select.options).filter(option => option.value);
  if (!options.length) {
    requestAnimationFrame(mountSpectrumControls);
    return;
  }

  select.dataset.cellSelectorMounted = 'true';
  field.classList.add('spectrum-element-field');
  select.classList.add('spectrum-native-select');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  const strip = document.createElement('div');
  strip.className = 'spectrum-element-strip';
  strip.setAttribute('role', 'group');
  const label = field.querySelector('label[for="spec"]');
  if (label) {
    label.id = label.id || 'spec-element-label';
    label.removeAttribute('for');
    strip.setAttribute('aria-labelledby', label.id);
  } else {
    strip.setAttribute('aria-label', 'Select element spectrum');
  }

  for (const option of options) {
    const key = option.value;
    const z = ELEMENT_Z[key] ?? '';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'spectrum-element-cell';
    button.dataset.specKey = key;
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
  const gaugeRow = panel.querySelector('.stat-row.has-dials');
  if (gaugeRow) gaugeRow.classList.add('spectra-gauges');

  function syncSelection() {
    const current = select.value;
    strip.querySelectorAll('.spectrum-element-cell').forEach(button => {
      const selected = button.dataset.specKey === current;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  select.addEventListener('change', () => requestAnimationFrame(syncSelection));
  panel.addEventListener('click', () => requestAnimationFrame(syncSelection));
  syncSelection();
}

mountStyles();
mountSpectrumControls();
