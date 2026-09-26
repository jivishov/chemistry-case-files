import { MODEL_CONFIG, renderModel, escapeHTML as e } from './models.js?v=2';
import { initBookMode } from './book.js?v=9';

const {number,checks}=JSON.parse(document.getElementById('lesson-data').textContent);
const config=MODEL_CONFIG[number];
const input=document.getElementById('model-value');
const play=document.getElementById('model-play');
const step=document.getElementById('model-step');
const state=document.getElementById('model-state');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let value=config.start, progress=0, timer=null;
const playLabel=config.sweep?'Play comparison':'Play animation';
const stop=()=>{if(timer!==null)clearInterval(timer);timer=null;play.textContent=playLabel;play.setAttribute('aria-pressed','false');};
const draw=(announce=false)=>{
  const result=renderModel(number,value,progress);
  input.value=String(value);
  const output=document.getElementById('model-value-output');
  if(output)output.value=String(Number(value.toFixed(3)));
  document.getElementById('model-image').innerHTML=result.svg;
  document.getElementById('model-summary').textContent=result.summary;
  document.getElementById('model-evidence').innerHTML=result.rows.map(([label,val])=>`<div><dt>${e(label)}</dt><dd>${e(val)}</dd></div>`).join('');
  step.disabled=config.sweep?value>=config.max-1e-7:progress>=1;
  if(announce)document.getElementById('model-announcement').textContent=result.summary;
  state.textContent=config.sweep?'Change one setting and compare the result.':`Teaching sequence: ${Math.round(progress*100)}% complete. The animation does not represent elapsed physical time.`;
};
const next=()=>{
  if(config.sweep)value=Math.min(config.max,Number((value+config.step).toFixed(8)));
  else progress=Math.min(1,Number((progress+0.25).toFixed(2)));
};
input.addEventListener('input',()=>{stop();value=Number(input.value);progress=0;draw(true);});
step.addEventListener('click',()=>{stop();next();draw(true);});
document.getElementById('model-reset').addEventListener('click',()=>{stop();value=config.start;progress=0;draw(true);});
play.addEventListener('click',()=>{
  if(timer!==null){stop();draw(true);return;}
  if(config.sweep)value=config.min;else progress=0;
  draw();play.textContent='Pause';play.setAttribute('aria-pressed','true');
  const ticks=config.sweep?(config.max-config.min)/config.step:reduced.matches?4:40;
  timer=setInterval(()=>{
    if(config.sweep)next();else progress=Math.min(1,Number((progress+(reduced.matches?0.25:0.025)).toFixed(5)));
    draw();
    if(config.sweep?value>=config.max-1e-7:progress>=1){stop();draw(true);}
  },Math.max(reduced.matches?800:150,6000/ticks));
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('pagehide',stop);
window.addEventListener('lessonpagechange',stop);
reduced.addEventListener('change',stop);
document.getElementById('model-controls').hidden=false;
play.setAttribute('aria-pressed','false');
draw();
document.querySelectorAll('[data-check]').forEach(form=>{
  const check=checks[Number(form.dataset.check)],feedback=form.querySelector('.check-feedback');
  form.querySelector('button').hidden=false;
  form.addEventListener('change',()=>{feedback.textContent='';feedback.removeAttribute('data-correct');});
  form.addEventListener('submit',event=>{
    event.preventDefault();const selected=form.querySelector('input:checked');if(!selected)return;
    const correct=Number(selected.value)===check.answer;
    feedback.dataset.correct=String(correct);
    feedback.innerHTML=`<strong>${correct?'That reasoning fits.':'Revisit this idea.'}</strong> ${e(check.why)} <a href="#${check.section}">Review the explanation</a>.`;
  });
});
const print=document.getElementById('lesson-print');print.hidden=false;print.addEventListener('click',()=>window.print());
const book=initBookMode();
// Print expanded instructional content and restore the student's choices afterward.
let closed=[];
window.addEventListener('beforeprint',()=>{stop();book.suspend();closed=[...document.querySelectorAll('details:not([open])')];closed.forEach(el=>{el.open=true;});});
window.addEventListener('afterprint',()=>{closed.forEach(el=>{el.open=false;});closed=[];book.resume();});
