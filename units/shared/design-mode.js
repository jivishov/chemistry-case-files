(() => {
  'use strict';

  const STORAGE_KEY = 'chemistry-case-files.design';
  const DEFAULT_MODE = 'field';
  const MODES = new Set(['field', 'clear', 'atlas']);
  const root = document.documentElement;

  /* Typography is shared across the landing page and all unit workbenches.
     Load it from this script's own directory so root and nested unit pages use
     the same URL without duplicating <link> markup in eleven HTML files. */
  const scriptUrl = document.currentScript && document.currentScript.src
    ? new URL(document.currentScript.src, document.baseURI)
    : null;
  const typographyUrl = scriptUrl
    ? new URL('./typography.css?v=field-20260922-1', scriptUrl).href
    : null;

  const ensureStylesheet = (id, href) => {
    if (!href || document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  ensureStylesheet(
    'chemistry-fonts-v2',
    'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Source+Serif+4:wght@600;700&display=swap'
  );
  ensureStylesheet('chemistry-typography-v2', typographyUrl);

  const normalize = value => MODES.has(value) ? value : DEFAULT_MODE;

  const readStoredMode = () => {
    try {
      return normalize(localStorage.getItem(STORAGE_KEY));
    } catch {
      return DEFAULT_MODE;
    }
  };

  const syncPressedState = mode => {
    document.querySelectorAll('[data-design-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.designChoice === mode));
    });
  };

  const applyMode = (mode, persist = false) => {
    const next = normalize(mode);
    root.dataset.design = next;
    syncPressedState(next);

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // The visual choice still applies for this page when storage is unavailable.
      }
    }
  };

  const allowedSettings = { art: ['enhanced', 'original'], motion: ['system', 'reduced'] };
  const normalizeSetting = (key, value) => allowedSettings[key].includes(value) ? value : allowedSettings[key][0];
  const readSetting = key => {
    try { return normalizeSetting(key, localStorage.getItem(`chemistry-case-files.${key}`)); }
    catch { return allowedSettings[key][0]; }
  };
  const applySetting = (key, value, persist = false) => {
    const next = normalizeSetting(key, value);
    root.dataset[key] = next;
    document.querySelectorAll(`[data-${key}-choice]`).forEach(button => {
      button.setAttribute('aria-pressed', String(button.getAttribute(`data-${key}-choice`) === next));
    });
    if (persist) {
      try { localStorage.setItem(`chemistry-case-files.${key}`, next); } catch { /* Page-local setting still works. */ }
    }
  };

  const unitMarker = () => {
    const match = location.pathname.match(/\/units\/(\d{2})-/i);
    return match ? `C${match[1]}` : '';
  };

  const mountControl = () => {
    const actions = document.querySelector('.command-actions');
    if (!actions) return;

    const brand = document.querySelector('.command-brand');
    const marker = unitMarker();
    if (brand && marker) brand.dataset.designUnit = marker;

    let group = actions.querySelector('.appearance');
    if (!group) {
      group = document.createElement('details');
      group.className = 'appearance';
      const summary = document.createElement('summary');
      summary.textContent = 'Appearance';
      summary.setAttribute('aria-label', 'Appearance settings');
      group.appendChild(summary);
      const panel = document.createElement('div');
      panel.className = 'appearance-panel';
      const addChoices = (title, choices, attribute, onSelect) => {
        const field = document.createElement('fieldset');
        const legend = document.createElement('legend'); legend.textContent = title;
        const row = document.createElement('div'); row.className = 'appearance-choices';
        for (const [value, label, name] of choices) {
          const button = document.createElement('button'); button.type = 'button';
          button.setAttribute(attribute, value); button.setAttribute('aria-label', name || label);
          button.textContent = label;
          button.addEventListener('click', () => onSelect(value));
          row.appendChild(button);
        }
        field.append(legend, row); panel.appendChild(field);
      };
      addChoices('Theme', [
        ['field', 'Field Lab', 'Field Lab design'],
        ['clear', 'Clear', 'Clear Lab design'],
        ['atlas', 'Atlas', 'Evidence Atlas design']
      ], 'data-design-choice', value => applyMode(value, true));
      addChoices('Artwork', [
        ['enhanced', 'Realistic', 'Realistic artwork'],
        ['original', 'Original', 'Original illustrations']
      ], 'data-art-choice', value => applySetting('art', value, true));
      addChoices('Decorative motion', [
        ['system', 'System', 'Follow system motion preference'],
        ['reduced', 'Pause', 'Pause decorative animation']
      ], 'data-motion-choice', value => applySetting('motion', value, true));
      group.appendChild(panel);
      const honors = actions.querySelector('.switch');
      actions.insertBefore(group, honors || actions.firstElementChild);
      document.addEventListener('click', event => { if (!group.contains(event.target)) group.open = false; });
      group.addEventListener('keydown', event => {
        if (event.key === 'Escape') { group.open = false; summary.focus(); }
      });
    }
    applySetting('art', readSetting('art'));
    applySetting('motion', readSetting('motion'));
    syncPressedState(normalize(root.dataset.design));
  };

  const loadUnitEnhancement = () => {
    if (!/\/units\/02-atomic-structure(?:\/index\.html)?\/?$/i.test(location.pathname)) return;
    const url = new URL('./js/spectra-controls.js?v=20260902-3', location.href);
    import(url.href).catch(error => console.error('Unit 2 element controls failed to load.', error));
  };

  applyMode(readStoredMode());
  applySetting('art', readSetting('art'));
  applySetting('motion', readSetting('motion'));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountControl, { once: true });
    document.addEventListener('DOMContentLoaded', loadUnitEnhancement, { once: true });
  } else {
    mountControl();
    loadUnitEnhancement();
  }

  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) applyMode(event.newValue);
    for (const key of Object.keys(allowedSettings)) {
      if (event.key === `chemistry-case-files.${key}`) applySetting(key, event.newValue);
    }
  });
})();