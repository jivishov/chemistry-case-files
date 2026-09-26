// One contents controller for continuous reading and the optional book reader.
export function initLessonContents() {
  const body = document.body;
  const sidebar = document.getElementById('lesson-contents');
  const viewport = document.getElementById('lesson-toc-scroll');
  const earlier = document.getElementById('lesson-toc-earlier');
  const more = document.getElementById('lesson-toc-more');
  const closeButton = document.getElementById('lesson-contents-close');
  const shade = document.getElementById('lesson-contents-shade');
  const header = document.querySelector('.lesson-topbar');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let drawer = false, open = false, opener;

  const updateScroll = () => {
    earlier.disabled = viewport.scrollTop <= 2;
    more.disabled = viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop <= 2;
    earlier.querySelector('span').textContent = earlier.disabled ? 'Start of contents' : 'Earlier sections';
    more.querySelector('span').textContent = more.disabled ? 'End of contents' : 'More sections';
  };
  const revealCurrent = () => {
    const link = viewport.querySelector('[aria-current="page"]');
    if (!link) return;
    const row = link.getBoundingClientRect(), frame = viewport.getBoundingClientRect();
    if (row.top < frame.top) viewport.scrollTop += row.top - frame.top;
    else if (row.bottom > frame.bottom) viewport.scrollTop += row.bottom - frame.bottom;
    updateScroll();
  };
  const sync = () => {
    body.classList.toggle('contents-open', open);
    sidebar.inert = drawer && !open;
    if (drawer && !open) sidebar.setAttribute('aria-hidden', 'true');
    else sidebar.removeAttribute('aria-hidden');
    if (drawer && open) {
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', 'true');
    } else {
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
    }
    shade.hidden = !open;
    document.querySelectorAll('[data-lesson-contents-toggle]').forEach(button => button.setAttribute('aria-expanded', String(open)));
    updateScroll();
  };
  const close = ({restoreFocus = false} = {}) => {
    const wasOpen = open;
    open = false;
    sync();
    if (restoreFocus && wasOpen && opener?.isConnected) opener.focus({preventScroll:true});
  };
  const layout = () => {
    body.style.setProperty('--lesson-header-height', `${header.getBoundingClientRect().height}px`);
    const next = innerWidth <= 820 || (body.classList.contains('book-mode') && innerWidth <= 1280);
    const sidebarHadFocus = sidebar.contains(document.activeElement);
    if (next !== drawer) {
      open = false;
      drawer = next;
      body.classList.toggle('contents-drawer', drawer);
    }
    sync();
    if (drawer && !open && sidebarHadFocus) {
      const toggle = document.getElementById(body.classList.contains('book-mode') ? 'book-contents' : 'lesson-contents-toggle');
      toggle?.focus({preventScroll:true});
    }
  };
  const scroll = direction => {
    const smooth = !reduced.matches && document.documentElement.dataset.motion !== 'reduced';
    viewport.scrollBy({top: direction * Math.max(100, viewport.clientHeight * .7), behavior:smooth ? 'smooth' : 'instant'});
  };
  earlier.addEventListener('click', () => scroll(-1));
  more.addEventListener('click', () => scroll(1));
  viewport.addEventListener('scroll', updateScroll, {passive:true});
  closeButton.addEventListener('click', () => close({restoreFocus:true}));
  shade.addEventListener('click', () => close({restoreFocus:true}));
  document.addEventListener('click', event => {
    const toggle = event.target.closest('[data-lesson-contents-toggle]');
    if (toggle) {
      if (open) return close({restoreFocus:true});
      if (!drawer) return;
      opener = toggle; open = true; sync(); revealCurrent();
      // Flush the newly visible panel before moving focus into it.
      closeButton.getBoundingClientRect();
      closeButton.focus({preventScroll:true});
      requestAnimationFrame(() => {if (open) closeButton.focus({preventScroll:true});});
    } else if (open && event.target.closest('.lesson-sidebar a')) {
      const link = event.target.closest('a');
      close();
      if (link.hash && !body.classList.contains('book-mode')) requestAnimationFrame(() => {
        const target = document.getElementById(link.hash.slice(1));
        if (target) { target.tabIndex = -1; target.focus({preventScroll:true}); }
      });
    }
  });
  document.addEventListener('keydown', event => {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); close({restoreFocus:true}); }
    if (event.key === 'Tab') {
      const targets = [...sidebar.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')];
      const first = targets[0], last = targets.at(-1);
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
    }
  });
  body.classList.add('contents-ready');
  for (const button of [earlier, more, closeButton, document.getElementById('lesson-contents-toggle')]) button.hidden = false;
  const observer = new ResizeObserver(layout);
  observer.observe(header); observer.observe(viewport); observer.observe(viewport.querySelector('ol'));
  window.addEventListener('resize', layout);
  window.addEventListener('lessonmodechange', layout);
  window.addEventListener('lessonpagechange', revealCurrent);
  window.addEventListener('beforeprint', () => close());
  document.fonts?.ready.then(layout);
  layout();
  return {close};
}
