(() => {
  'use strict';

  const STORAGE_KEY = 'chemistry-case-files.design';
  const DEFAULT_MODE = 'clear';
  const MODES = new Set(['clear', 'atlas']);
  const root = document.documentElement;

  /* Typography is shared across the landing page and all unit workbenches.
     Load it from this script's own directory so root and nested unit pages use
     the same URL without duplicating <link> markup in eleven HTML files. */
  const scriptUrl = document.currentScript && document.currentScript.src
    ? new URL(document.currentScript.src, document.baseURI)
    : null;
  const typographyUrl = scriptUrl
    ? new URL('./typography.css?v=type-20260908-1', scriptUrl).href
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
    document.querySelectorAll('.design-mode-toggle [data-design-choice]').forEach(button => {
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

    let group = actions.querySelector('.design-mode-toggle');
    if (!group) {
      group = document.createElement('div');
      group.className = 'design-mode-toggle';
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', 'Design');

      const choices = [
        ['clear', 'Clear', 'Clear Lab design'],
        ['atlas', 'Atlas', 'Evidence Atlas design'],
      ];

      for (const [value, label, accessibleName] of choices) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.designChoice = value;
        button.setAttribute('aria-label', accessibleName);
        button.textContent = label;
        button.addEventListener('click', () => applyMode(value, true));
        group.appendChild(button);
      }

      const honors = actions.querySelector('.switch');
      actions.insertBefore(group, honors || actions.firstElementChild);
    }

    syncPressedState(normalize(root.dataset.design));
  };

  const loadUnitEnhancement = () => {
    if (!/\/units\/02-atomic-structure(?:\/index\.html)?\/?$/i.test(location.pathname)) return;
    const url = new URL('./js/spectra-controls.js?v=20260902-3', location.href);
    import(url.href).catch(error => console.error('Unit 2 element controls failed to load.', error));
  };

  applyMode(readStoredMode());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountControl, { once: true });
    document.addEventListener('DOMContentLoaded', loadUnitEnhancement, { once: true });
  } else {
    mountControl();
    loadUnitEnhancement();
  }

  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) applyMode(event.newValue);
  });
})();