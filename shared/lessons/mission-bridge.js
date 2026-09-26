// Route only through existing controls, so their normal unlock rules still apply.
(() => {
  const params=new URLSearchParams(location.search);
  const selectRequestedMission=()=>{
    const requested=params.get('mission');
    if(!requested || !/^[a-z]+$/.test(requested))return;
    const tab=[...document.querySelectorAll('button[role="tab"]')].find(button=>button.getAttribute('@click')===`setMode('${requested}')`);
    if(tab)tab.click();
  };
  document.addEventListener('alpine:initialized',()=>queueMicrotask(selectRequestedMission),{once:true});
})();
