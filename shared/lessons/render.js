import { MODEL_CONFIG, renderModel, escapeHTML as e } from './models.js';
import { STANDARDS, TEKS_SOURCE, TEKS_REFERENCE } from './standards.js';
import { LESSON_SCENES } from './scenes.js';
import { typeset } from './typeset.js';
import { renderIllustration } from './illustrations.js';

export function standardBlock(codes, {honors=false, note=''}={}) {
  return '<div class="lesson-standards" aria-label="TEKS alignment">'+(honors?'<p class="teks-extension">Honors extension · builds on these expectations</p>':'')+codes.map(code=>{
    if(!STANDARDS[code])throw new Error('Unknown TEKS expectation: '+code);
    return '<p><a href="'+TEKS_SOURCE+'" target="_blank" rel="noopener noreferrer">TEKS '+e(code)+'</a> <span>'+e(STANDARDS[code])+'</span></p>';
  }).join('')+(note?'<p class="teks-extension">'+e(note)+'</p>':'')+'</div>';
}


const EXPLORE_AFTER={1:'density',2:'spectra',3:'trends',4:'shape',5:'mass',6:'limiting',7:'ideal',8:'dilution',9:'ph',10:'calorimeter',11:'half'};
export function renderLesson(lesson, sources, unit) {
  const {number,sections,honors}=lesson, config=MODEL_CONFIG[number];
  const scene = `<figure class="lesson-context"><img src="../../shared/lessons/assets/photos/${LESSON_SCENES[number]}.webp" width="1280" height="480" alt="Illustrative chemistry setting for ${e(lesson.title)}" decoding="async"><figcaption>Illustrative scene</figcaption></figure>`;
  const appearance = `<details class="appearance" id="lesson-appearance" hidden><summary aria-label="Appearance settings">Appearance</summary><div class="appearance-panel">
    <fieldset><legend>Theme</legend><div class="appearance-choices"><button type="button" data-design-choice="field" aria-pressed="true">Field Lab</button><button type="button" data-design-choice="clear" aria-pressed="false">Clear</button><button type="button" data-design-choice="atlas" aria-pressed="false">Atlas</button></div></fieldset>
    <fieldset><legend>Artwork</legend><div class="appearance-choices"><button type="button" data-art-choice="enhanced" aria-pressed="true">Realistic</button><button type="button" data-art-choice="original" aria-pressed="false">Original</button></div></fieldset>
    <fieldset><legend>Decorative motion</legend><div class="appearance-choices"><button type="button" data-motion-choice="system" aria-pressed="true">System</button><button type="button" data-motion-choice="reduced" aria-pressed="false">Pause</button></div></fieldset>
  </div></details>`;
  const linkedSources=ids=>`<p class="lesson-citations">Read the source: ${ids.map(id=>{
    if(!sources[id])throw new Error(`Unit ${number}: missing source ${id}`);
    return `<a href="${e(sources[id].url)}" title="${e(sources[id].title)}" aria-label="${e(sources[id].title)}" target="_blank" rel="noopener noreferrer">${e(sources[id].title)}</a>`;
  }).join(' · ')}</p>`;
  const allSourceIds=[...new Set([...sections,...honors].flatMap(s=>s.sources))];
  const initial=renderModel(number,config.start);
  const evidence=rows=>rows.map(([label,value])=>`<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('');
  const exploration=`<section class="lesson-explore" id="explore" data-book-section data-book-kind="explore" data-book-title="Explore the model" aria-labelledby="explore-title">
    <div class="lesson-section-head">${standardBlock(sections.find(s=>s.id===EXPLORE_AFTER[number]).teks)}
    <p class="lesson-eyebrow">Observe · predict · explain</p><h2 id="explore-title">${e(lesson.visual.title)}</h2>
    <p class="model-instruction">${e(lesson.visual.instruction)}</p></div>
    <div class="lesson-flow"><div class="model-workbench"><figure><div id="model-image">${initial.svg}</div><figcaption id="model-summary">${e(initial.summary)}</figcaption></figure>
    <div class="model-console"><div class="model-controls" id="model-controls" hidden>
      <div class="model-input"><label for="model-value">${e(config.label)}</label>
      ${config.choices?`<select id="model-value">${config.choices.map((label,i)=>`<option value="${i}" ${i===config.start?'selected':''}>${e(label)}</option>`).join('')}</select>`:`<input id="model-value" type="range" min="${config.min}" max="${config.max}" step="${config.step}" value="${config.start}"><output for="model-value" id="model-value-output">${config.start}</output>`}</div>
      <div class="model-buttons"><button type="button" id="model-play">${config.sweep?'Play comparison':'Play animation'}</button><button type="button" id="model-step">Next step</button><button type="button" id="model-reset">Reset model</button></div>
    </div>
    <p class="model-state" id="model-state">Static starting view. Interactive controls become available when the lesson finishes loading.</p>
    <p class="sr-only" id="model-announcement" role="status" aria-live="polite"></p>
    <dl id="model-evidence" class="model-evidence">${evidence(initial.rows)}</dl></div></div>
    <details class="model-guidance"><summary>What to notice &amp; explain</summary>
    <p><strong>Notice:</strong> ${e(lesson.visual.observe)}</p><p><strong>Try explaining:</strong> ${e(lesson.visual.challenge)}</p>
    <details class="lesson-reveal"><summary>Compare your explanation</summary><p>${e(lesson.visual.explanation)}</p></details>
    </details><p class="lesson-caption">Schematic teaching model. Calculated values, not measurements; practice is unscored.</p></div>
  </section>`;
  const toc=sections.map((s,i)=>`<li><a href="#${s.id}"><span>${String(i+1).padStart(2,'0')}</span>${e(s.title)}</a></li>${s.id===EXPLORE_AFTER[number]?'<li class="toc-explore"><a href="#explore">Explore the model</a></li>':''}`).join('');
  const prose=sections.map((s,i)=>`<section class="lesson-section" id="${s.id}" data-book-section data-book-kind="topic" data-book-title="${e(s.title)}" aria-labelledby="heading-${s.id}">
    <div class="lesson-section-head">${standardBlock(s.teks,{note:s.alignmentNote})}
    <p class="lesson-eyebrow">${String(i+1).padStart(2,'0')} · ${e(s.objective)}</p><h2 id="heading-${s.id}">${e(s.title)}</h2></div><div class="lesson-flow">
    <div class="lesson-spread"><div class="lesson-explanation"><aside class="lesson-simple"><strong>In simpler language</strong><p>${e(s.simple)}</p></aside>${typeset(s.body,{html:true})}</div><div class="lesson-support">
    ${renderIllustration(number,s.id)}<p class="lesson-analogy"><strong>Think of it this way.</strong> ${e(s.analogy)}</p>
    <div class="lesson-example"><h3>Worked example</h3>${typeset(s.example)}</div>${linkedSources(s.sources)}</div></div></div>
  </section>${s.id===EXPLORE_AFTER[number]?exploration:''}`).join('');
  const honorsHTML=honors.map(h=>`<details class="lesson-honors-box${(h.answer.match(/<eq/g)||[]).length>1?' honors-worked':''}" id="honors-${h.id}" data-book-own-page="${e(h.title)}"><summary><span>Honors</span> ${e(h.title)}</summary><div>${standardBlock(h.teks,{honors:true})}<div class="lesson-spread"><div class="lesson-explanation">${typeset(h.body)}</div><div class="lesson-support">${renderIllustration(number,h.id)}<p><strong>Challenge:</strong> ${e(h.question)}</p><details class="lesson-reveal"><summary>Show the reasoning</summary>${typeset(h.answer)}</details>${linkedSources(h.sources)}</div></div></div></details>`).join('');
  const checks=lesson.checks.map((c,i)=>`<form class="lesson-check" data-check="${i}"><fieldset><legend>${i+1}. ${e(c.question)}</legend>${c.options.map((text,j)=>`<label><input type="radio" name="check-${i}" value="${j}" required> <span>${e(text)}</span></label>`).join('')}</fieldset><button type="submit" class="check-button" hidden>Check my reasoning</button><p class="check-feedback" role="status" aria-live="polite"></p><noscript><p>For feedback, enable JavaScript. Review <a href="#${c.section}">the related section</a> to check your reasoning.</p></noscript></form>`).join('');
  const mappings=lesson.assessment.map(([mode,label,ids,task])=>`<tr><th scope="row">${e(label)}</th><td>${ids.map(id=>`<a href="#${id}">${e(sections.find(s=>s.id===id).title)}</a>`).join('; ')}</td><td>${e(task)}</td></tr>`).join('');
  return `<!doctype html>
<html lang="en" data-design="field" data-art="enhanced" data-motion="system"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Learn · Unit ${number} · ${e(lesson.title)}</title><meta name="description" content="Grade 10 chemistry lesson: ${e(lesson.title)}. Explanations, diagrams, an interactive model, worked examples, honors extensions, and a glossary.">
<script src="../../shared/lessons/appearance.js?v=1"></script>
<link rel="stylesheet" href="../../shared/css/tokens.css"><link rel="stylesheet" href="../../shared/lessons/lesson.css?v=13"><link rel="stylesheet" href="../../shared/lessons/appearance.css?v=2">
<script type="module" src="../../shared/lessons/lesson.js?v=12"></script></head>
<body class="lesson-page"><a class="lesson-skip" href="#lesson-main">Skip to lesson</a>
<header class="lesson-topbar"><a class="lesson-brand" href="../../index.html"><span aria-hidden="true">CF</span>Chemistry Case Files</a><nav aria-label="Learning path"><a href="learn.html" aria-current="page">1 · Learn</a><a href="index.html">2 · Missions</a><a href="index.html?mission=casefile">3 · Case file</a></nav><div class="lesson-view-actions">${appearance}<button type="button" id="lesson-book" aria-pressed="false" hidden>Book mode</button><button type="button" id="lesson-print" hidden>Print lesson</button></div></header>
<div class="lesson-layout"><aside class="lesson-sidebar"><p class="lesson-eyebrow">Unit ${String(number).padStart(2,'0')}</p><p class="lesson-sidebar-title">${e(lesson.title)}</p>${scene}<nav aria-label="Lesson contents"><ol><li><a href="#overview">Learning objectives</a></li>${toc}<li><a href="#honors">Honors extensions</a></li><li><a href="#check">Check your understanding</a></li><li><a href="#assessment">Ready for the missions</a></li><li><a href="#sources">Sources & further learning</a></li><li><a href="#glossary">Glossary</a></li></ol></nav><a class="lesson-sidebar-back" href="../../index.html">← All 11 units</a></aside>
<main id="lesson-main"><section class="lesson-overview" id="overview" data-book-section data-book-kind="overview" data-book-title="Learning objectives"><div class="lesson-section-head"><div class="lesson-cover-copy"><p class="lesson-eyebrow">Grade 10 chemistry · Core lesson + optional honors</p><h1>${e(lesson.title)}</h1><p class="lesson-question">${e(lesson.question)}</p></div>${scene}</div><div class="lesson-flow"><p>${e(lesson.intro)}</p><p class="lesson-path-note">Read and explore first. Use the practice checks to find ideas to revisit. Then demonstrate your understanding in the missions and apply it in the case file.</p><p class="lesson-teks-reference">Aligned with <a href="${TEKS_SOURCE}" target="_blank" rel="noopener noreferrer">${e(TEKS_REFERENCE)}</a>. Exact expectations appear before each topic; Honors work is identified as an extension.</p><h2>By the end, you should be able to…</h2><ul class="lesson-objectives" data-book-group>${sections.map(s=>`<li><a href="#${s.id}"><span class="objective-code">${e(s.teks.join(" · "))}</span> ${e(s.objective)}</a></li>`).join('')}</ul></div></section>
${prose}
<section class="lesson-section" id="honors" data-book-section data-book-kind="honors" data-book-title="Honors extensions"><div class="lesson-section-head"><p class="lesson-eyebrow">Optional extension</p><h2>Take the reasoning further</h2><p>These boxes prepare you for the unit’s Honors missions. Open one to explore the additional model, calculation, or limitation.</p></div><div class="lesson-flow">${honorsHTML}</div></section>
<section class="lesson-section" id="check" data-book-section data-book-kind="check" data-book-title="Check your understanding"><div class="lesson-section-head"><p class="lesson-eyebrow">Practice, without a score</p><h2>Check your understanding</h2><p>Choose an answer and explain your reasoning to yourself before checking it.</p></div><div class="lesson-flow">${checks}</div></section>
<section class="lesson-section" id="assessment" data-book-section data-book-kind="assessment" data-book-title="Ready for the missions"><div class="lesson-section-head"><p class="lesson-eyebrow">Use what you have learned</p><h2>Ready for the missions</h2><p>The missions and case file assess the ideas below. Revisit a linked section whenever you need a reminder. The capstone uses the unit’s existing mission requirements.</p></div><div class="lesson-flow"><div class="lesson-table-wrap"><table class="lesson-alignment"><caption>Lesson-to-assessment alignment</caption><thead><tr><th scope="col">Assessment</th><th scope="col">Prepare here</th><th scope="col">What you will demonstrate</th></tr></thead><tbody data-book-group>${mappings}</tbody></table></div><div class="lesson-case-note"><h3>Before the case file</h3><p>${e(lesson.caseNote)}</p></div><div class="lesson-next"><a class="lesson-primary" href="index.html">Continue to missions →</a><a href="index.html?mission=casefile">Open the case file</a></div></div></section>
<section class="lesson-section lesson-sources" id="sources" data-book-section data-book-kind="sources" data-book-title="Sources & further learning"><div class="lesson-section-head"><h2>Sources & further learning</h2></div><div class="lesson-flow"><p>The explanations, analogies, practice examples, and diagrams on this page were written for this course. The references below support the underlying chemistry; they are not copied lessons or endorsements. CK-12 material is linked through Chemistry LibreTexts. External resources may require an internet connection.</p><ul data-book-group>${allSourceIds.map(id=>`<li><a href="${e(sources[id].url)}" target="_blank" rel="noopener noreferrer">${e(sources[id].title)}</a><span>${e(sources[id].publisher)}</span></li>`).join('')}</ul><p>For another explanation or video, explore <a href="https://www.khanacademy.org/science/high-school-biology/hs-chemistry" target="_blank" rel="noopener noreferrer">Khan Academy’s high school chemistry course</a> and find the matching topic. The reading and interactive model here work without an external video.</p></div></section>
<section class="lesson-section" id="glossary" data-book-section data-book-kind="glossary" data-book-title="Glossary"><div class="lesson-section-head"><p class="lesson-eyebrow">Keep the language precise</p><h2>Glossary</h2></div><div class="lesson-flow"><dl class="lesson-glossary" data-book-group>${lesson.glossary.map(([term,definition])=>`<div><dt>${e(term)}</dt><dd>${e(definition)}</dd></div>`).join('')}</dl></div></section>
<footer class="lesson-footer"><a href="../../index.html">Course home</a><span>Unit ${number} · ${e(unit.teks.join(' · '))}</span><a href="index.html">Continue to missions →</a></footer>
</main></div><script id="lesson-data" type="application/json">${JSON.stringify({number,checks:lesson.checks}).replaceAll('<','\\u003c')}</script>
</body></html>\n`;
}
