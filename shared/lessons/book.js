// Optional, local-only pagination. Move original content, never duplicate model or form state.
// Each topic starts a sheet; overflow continues at paragraph/list-item/table-row boundaries.
export function initBookMode({closeContents = () => {}} = {}) {
  const main = document.getElementById('lesson-main');
  const toggle = document.getElementById('lesson-book');
  const sections = [...main.querySelectorAll(':scope > [data-book-section]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const preference = 'chemistry-lessons-book-mode';
  const reader = document.createElement('div');
  reader.id = 'book-reader'; reader.hidden = true;
  reader.innerHTML = `<div id="book-stage" aria-label="Book pages"></div>
    <nav class="book-controls" aria-label="Book navigation">
      <button type="button" id="book-contents" data-lesson-contents-toggle aria-controls="lesson-contents" aria-expanded="false">Contents</button>
      <button type="button" id="book-prev" aria-label="Previous page">← Previous</button>
      <label class="book-jump-label"><span class="sr-only">Go to section</span><select id="book-jump" aria-label="Go to section"></select></label>
      <span id="book-status" role="status" aria-live="polite"></span>
      <button type="button" id="book-next" aria-label="Next page">Next →</button>
    </nav>`;
  main.prepend(reader);
  const stage = reader.querySelector('#book-stage');
  const previous = reader.querySelector('#book-prev'), next = reader.querySelector('#book-next');
  const status = reader.querySelector('#book-status'), jump = reader.querySelector('#book-jump');
  for (const section of sections) jump.add(new Option(section.dataset.bookTitle, section.id));
  let enabled = false, rebuilding = false, index = 0, pages = [], moved = [];
  let animations = [], turn = 0, resizeTimer, printResume = false;
  let originalDetails = new Map();

  function cancelTurn() {
    turn++;
    animations.forEach(a => a.cancel()); animations = [];
    reader.removeAttribute('data-turning');
  }
  function restoreNodes() {
    cancelTurn();
    for (const {node, marker} of moved) marker.replaceWith(node);
    moved = []; pages = []; stage.replaceChildren();
  }
  const removeIds = node => {
    node.removeAttribute('id');
    node.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    return node;
  };
  function atomsFor(section) {
    const flow = section.querySelector(':scope > .lesson-flow');
    const atoms = [];
    for (const container of [...flow.children]) {
      const group = container.matches('[data-book-group]') ? container : container.querySelector('[data-book-group]');
      const nodes = group ? [...group.children] : [container];
      for (const node of nodes) {
        const marker = document.createComment('book position');
        node.before(marker);
        const atom = {node, marker, owner:group ? container : null, makeFrame:null};
        if (group) atom.makeFrame = () => {
          const root = removeIds(container.cloneNode(true));
          const parent = root.matches('[data-book-group]') ? root : root.querySelector('[data-book-group]');
          parent.replaceChildren();
          return {root, parent, owner:container};
        };
        moved.push(atom); atoms.push(atom);
      }
    }
    return atoms;
  }
  function makePage(section, part) {
    const el = document.createElement('article');
    el.className = `book-sheet ${section.className}`;
    el.dataset.bookKind = section.dataset.bookKind;
    el.dataset.bookSource = section.id;
    el.setAttribute('aria-label', `${section.dataset.bookTitle}${part ? ' — continued' : ''}`);
    const head = removeIds(section.querySelector(':scope > .lesson-section-head').cloneNode(true));
    head.tabIndex = -1;
    if (part && section.dataset.bookKind !== 'honors') {
      const continuation = document.createElement('span');
      continuation.className = 'book-continuation'; continuation.textContent = 'Continued';
      head.append(continuation);
    }
    const flow = document.createElement('div'); flow.className = 'book-flow lesson-flow';
    el.append(head, flow); stage.append(el);
    const page = {el, head, flow, section, atoms:[], lastFrame:null};
    pages.push(page); return page;
  }
  function mount(page, atom) {
    if (atom.node.hasAttribute('data-book-own-page')) page.el.setAttribute('aria-label', `Honors: ${atom.node.dataset.bookOwnPage}`);
    if (atom.owner) {
      if (page.lastFrame?.owner !== atom.owner) {
        page.lastFrame = atom.makeFrame(); page.flow.append(page.lastFrame.root);
      }
      page.lastFrame.parent.append(atom.node);
    } else {
      page.flow.append(atom.node); page.lastFrame = null;
    }
    page.atoms.push(atom);
  }
  function unmount(page, atom) {
    atom.node.remove(); page.atoms.pop();
    if (page.lastFrame && !page.lastFrame.parent.children.length) {
      page.lastFrame.root.remove(); page.lastFrame = null;
    }
  }
  function overflow(page) {
    return page.flow.scrollWidth > page.flow.clientWidth + 2 || page.flow.scrollHeight > page.flow.clientHeight + 2;
  }
  function sourceForHash(hash) {
    let id;
    try { id = decodeURIComponent((hash || '').replace(/^#/, '')); } catch { return -1; }
    const target = document.getElementById(id);
    return pages.findIndex(p => p.el.contains(target) || p.section.id === id || p.section.contains(target));
  }
  function flipTo(destination, {animate=true, focus=false, updateHash=true}={}) {
    if (!enabled || !pages.length) return;
    destination = Math.max(0, Math.min(destination, pages.length - 1));
    const old = pages[index], incoming = pages[destination], direction = destination >= index ? -1 : 1;
    cancelTurn(); const ticket = turn;
    pages.forEach(p => {p.el.hidden = true; p.el.inert = true;});
    incoming.el.hidden = false; incoming.el.inert = false;
    index = destination;
    previous.disabled = index === 0; next.disabled = index === pages.length - 1;
    status.textContent = `Page ${index + 1} of ${pages.length}`;
    reader.dataset.page = String(index + 1); reader.dataset.pages = String(pages.length);
    jump.value = incoming.section.id;
    document.querySelectorAll('.lesson-sidebar a[href^="#"]').forEach(a => {
      if (a.hash === '#' + incoming.section.id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (updateHash) history.replaceState(history.state, '', '#' + incoming.section.id);
    if (focus) (incoming.el.querySelector('.lesson-honors-box > summary') || incoming.head).focus({preventScroll:true});
    window.dispatchEvent(new Event('lessonpagechange'));
    if (animate && !reduced.matches && document.documentElement.dataset.motion !== 'reduced' && old && old !== incoming) {
      reader.dataset.turning = direction < 0 ? 'forward' : 'backward';
      old.el.hidden = false; old.el.style.zIndex = '2'; incoming.el.style.zIndex = '1';
      const origin = direction < 0 ? 'left center' : 'right center';
      animations = [
        old.el.animate([{transform:'rotateY(0deg)',filter:'brightness(1)'},{transform:`rotateY(${direction * 86}deg)`,filter:'brightness(.82)'}],{duration:360,easing:'cubic-bezier(.3,.7,.2,1)',fill:'forwards'}),
        incoming.el.animate([{transform:`rotateY(${-direction * 7}deg)`,opacity:.55},{transform:'rotateY(0deg)',opacity:1}],{duration:360,easing:'ease-out'})
      ];
      old.el.style.transformOrigin = origin; incoming.el.style.transformOrigin = origin;
      Promise.allSettled(animations.map(a => a.finished)).then(() => {
        if (ticket !== turn) return;
        old.el.hidden = true; animations.forEach(a=>a.cancel()); animations = [];
        reader.removeAttribute('data-turning');
      });
    }
  }
  function rebuild(anchor) {
    if (!enabled || rebuilding) return;
    rebuilding = true;
    const pivot = pages[index]?.atoms[0]?.node;
    const focused = document.activeElement;
    const priorSource = pages[index]?.section.id;
    restoreNodes();
    main.style.setProperty('--book-height', `${Math.max(260, innerHeight - main.getBoundingClientRect().top - 12)}px`);
    reader.setAttribute('aria-busy', 'true');
    for (const section of sections) {
      let part = 0, page = makePage(section, part);
      for (const atom of atomsFor(section)) {
        if (atom.node.hasAttribute('data-book-own-page') && page.atoms.length) page = makePage(section, ++part);
        mount(page, atom);
        // Keep a teaching section on one readable laptop sheet. First recover
        // space with tighter typography; never scale or clip the whole page.
        if (overflow(page) && ['topic','honors'].includes(section.dataset.bookKind) && innerWidth > 820) {
          page.el.classList.add('book-compact');
        }
        // Balancing around indivisible diagrams can leave avoidable whitespace.
        // Try sequential column fill before declaring a topic too tall.
        if (overflow(page) && section.dataset.bookKind === 'topic' && innerWidth > 820) {
          page.flow.style.columnFill = 'auto';
        }
        if (overflow(page) && page.atoms.length > 1) {
          unmount(page, atom); page = makePage(section, ++part); mount(page, atom);
        }
        // Accessible fallback for very small viewports or unusually large text settings.
        // At tested laptop sizes all sheets fit without this internal scroll region.
        if (overflow(page)) {
          page.el.dataset.overflow = 'true'; page.flow.classList.add('book-overflow');
          page.flow.tabIndex = 0; page.flow.setAttribute('aria-label', 'Additional content; scroll within this page');
        }
      }
    }
    reader.removeAttribute('aria-busy');
    let destination = anchor ? sourceForHash(anchor) : pages.findIndex(p=>pivot && p.el.contains(pivot));
    if (destination < 0) destination = sourceForHash(priorSource || location.hash);
    index = -1; flipTo(Math.max(0, destination), {animate:false});
    if (focused?.isConnected && reader.contains(focused) && !focused.closest('[hidden]')) focused.focus({preventScroll:true});
    rebuilding = false;
  }
  function setMode(on, {persist=true, anchor, scroll=true}={}) {
    if (on === enabled) return;
    closeContents();
    const currentSource = pages[index]?.section.id;
    if (on) {
      anchor ||= location.hash || sections.find(s=>s.getBoundingClientRect().bottom > 70)?.id || 'overview';
      originalDetails = new Map([...main.querySelectorAll('details')].map(d=>[d,d.open]));
      main.querySelectorAll('.lesson-honors-box').forEach(d=>{d.open=true;});
      enabled = true; reader.hidden = false; document.body.classList.add('book-mode');
      window.dispatchEvent(new Event('lessonmodechange'));
      window.scrollTo({top:0,behavior:'instant'});
      rebuild(anchor);
    } else {
      enabled = false; restoreNodes(); reader.hidden = true; document.body.classList.remove('book-mode');
      window.dispatchEvent(new Event('lessonmodechange'));
      main.style.removeProperty('--book-height');
      originalDetails.forEach((open, d)=>{d.open=open;}); originalDetails.clear();
      document.querySelectorAll('.lesson-sidebar a[aria-current]').forEach(a=>a.removeAttribute('aria-current'));
      if (scroll && currentSource) document.getElementById(currentSource)?.scrollIntoView({block:'start',behavior:'instant'});
    }
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.title = enabled ? 'Return to continuous reading' : 'Read one section at a time with page turns';
    if (persist) try {localStorage.setItem(preference, enabled ? 'book' : 'scroll');} catch {}
  }
  toggle.hidden = false;
  toggle.addEventListener('click', ()=>setMode(!enabled));
  previous.addEventListener('click', ()=>flipTo(index - 1, {focus:true}));
  next.addEventListener('click', ()=>flipTo(index + 1, {focus:true}));
  jump.addEventListener('change', ()=>flipTo(sourceForHash(jump.value), {focus:true}));
  document.addEventListener('click', event=>{
    if (!enabled || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]'); if (!link) return;
    const destination = sourceForHash(link.hash);
    if (destination >= 0) {event.preventDefault(); flipTo(destination, {focus:true});}
    else if (link.hash === '#lesson-main') {event.preventDefault(); pages[index]?.head.focus({preventScroll:true});}
  });
  document.addEventListener('keydown', event=>{
    if (!enabled || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,select,textarea,button,.lesson-sidebar,[contenteditable="true"]')) return;
    if (['ArrowRight','PageDown','ArrowLeft','PageUp'].includes(event.key)) {
      event.preventDefault(); flipTo(index + (['ArrowRight','PageDown'].includes(event.key) ? 1 : -1), {focus:true});
    }
  });
  const schedule = () => {
    if (!enabled) return;
    reader.setAttribute('aria-busy','true');
    clearTimeout(resizeTimer); resizeTimer=setTimeout(()=>rebuild(),120);
  };
  window.addEventListener('resize', schedule);
  window.addEventListener('lessonappearancechange', event=>{
    if(!enabled)return;
    if(event.detail?.key==='motion')flipTo(index,{animate:false,updateHash:false});
    else schedule();
  });
  document.fonts?.ready.then(()=>{if(enabled)rebuild();});
  main.addEventListener('toggle', event=>{
    if(enabled && !rebuilding && event.target.matches('.lesson-reveal,.model-guidance')) schedule();
  }, true);
  main.addEventListener('submit', ()=>{if(enabled)requestAnimationFrame(schedule);});
  window.addEventListener('hashchange', ()=>{if(enabled){const n=sourceForHash(location.hash);if(n>=0)flipTo(n,{focus:true,updateHash:false});}});
  reduced.addEventListener('change', ()=>{if(enabled)flipTo(index,{animate:false});});
  try {if(localStorage.getItem(preference)==='book')setMode(true,{persist:false});} catch {}
  return {
    suspend(){printResume=enabled;if(enabled)setMode(false,{persist:false,scroll:false});},
    resume(){if(printResume)setMode(true,{persist:false});printResume=false;}
  };
}
