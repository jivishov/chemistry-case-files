// Reading-page presentation, using the published course's preference names.
// Kept separate from the older local mission shell so lesson styling stays scoped.
(() => {
  const root = document.documentElement;
  const choices = {design:['field','clear','atlas'], art:['enhanced','original'], motion:['system','reduced']};
  const normalize = (key, value) => choices[key].includes(value) ? value : choices[key][0];
  const read = key => {
    try {return normalize(key, localStorage.getItem(`chemistry-case-files.${key}`));}
    catch {return choices[key][0];}
  };
  function apply(key, value, persist=false) {
    value = normalize(key, value);
    root.dataset[key] = value;
    document.querySelectorAll(`[data-${key}-choice]`).forEach(button => {
      button.setAttribute('aria-pressed', String(button.getAttribute(`data-${key}-choice`) === value));
    });
    if (persist) try {localStorage.setItem(`chemistry-case-files.${key}`, value);} catch {}
    window.dispatchEvent(new CustomEvent('lessonappearancechange', {detail:{key,value}}));
  }
  Object.keys(choices).forEach(key=>apply(key, read(key)));
  function mount() {
    const menu = document.getElementById('lesson-appearance');
    if (!menu) return;
    menu.hidden = false;
    Object.keys(choices).forEach(key=>{
      document.querySelectorAll(`[data-${key}-choice]`).forEach(button=>{
        button.addEventListener('click', ()=>apply(key, button.getAttribute(`data-${key}-choice`), true));
      });
      apply(key, root.dataset[key]);
    });
    document.addEventListener('click', event=>{if(!menu.contains(event.target))menu.open=false;});
    menu.addEventListener('keydown', event=>{
      if(event.key==='Escape'){menu.open=false;menu.querySelector('summary').focus();}
    });
    // The scene is decorative context. An unavailable image must not create broken-image UI.
    const hideImage = img=>{
      document.querySelectorAll('.lesson-context img').forEach(copy=>{
        if(copy.getAttribute('src')===img.getAttribute('src'))copy.closest('.lesson-context').hidden=true;
      });
      window.dispatchEvent(new CustomEvent('lessonappearancechange',{detail:{key:'image'}}));
    };
    document.addEventListener('error', event=>{
      if(event.target.matches?.('.lesson-context img'))hideImage(event.target);
    }, true);
    document.querySelectorAll('.lesson-context img').forEach(img=>{if(img.complete && !img.naturalWidth)hideImage(img);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
  window.addEventListener('storage', event=>{
    for(const key of Object.keys(choices))if(event.key===null || event.key===`chemistry-case-files.${key}`)apply(key,read(key));
  });
})();
