// One course-wide invitation, without moving focus or changing reading mode.
export function initBookHint() {
  const toggle = document.getElementById('lesson-book');
  const hint = document.getElementById('book-mode-hint');
  if (!toggle || !hint) return;
  const preference = 'chemistry-lessons-book-hint-dismissed';
  const dismiss = () => {
    const returnFocus = hint.contains(document.activeElement);
    hint.hidden = true;
    try { localStorage.setItem(preference, '1'); } catch {}
    if (returnFocus) toggle.focus({preventScroll:true});
  };
  // Readers who already use Book mode do not need an introduction to it.
  if (toggle.getAttribute('aria-pressed') === 'true') { dismiss(); return; }
  try { if (localStorage.getItem(preference) === '1') return; } catch {}

  const position = () => {
    if (hint.hidden) return;
    const button = toggle.getBoundingClientRect();
    const center = button.left + button.width / 2;
    const width = hint.getBoundingClientRect().width;
    const left = Math.max(12, Math.min(center - width / 2, document.documentElement.clientWidth - width - 12));
    hint.style.left = `${left}px`;
    hint.style.top = `${button.bottom + 12}px`;
    hint.style.setProperty('--hint-arrow-left', `${Math.max(16, Math.min(width - 24, center - left - 5))}px`);
  };
  hint.querySelector('#book-hint-dismiss').addEventListener('click', dismiss);
  hint.querySelector('#book-hint-try').addEventListener('click', () => { toggle.click(); });
  toggle.addEventListener('click', dismiss);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !hint.hidden) dismiss();
  });
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, {passive:true});
  hint.hidden = false;
  position();
  document.fonts?.ready.then(position);
}
