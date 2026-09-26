import { missionSourcePath } from './lesson-missions.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UNITS } from '../shared/js/teks.js';
import { renderLesson } from '../shared/lessons/render.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sources=JSON.parse(await fs.readFile(path.join(root,'shared/lessons/source-catalog.json'),'utf8'));
const alignment=['# Lesson-to-assessment alignment', '', 'Generated from the authored lessons. The root course page opens the reading first. Each mission and case file below has preparatory instruction; optional Honors boxes add the corresponding advanced methods. This map is a maintenance aid, not an independent certification of classroom learning.', ''];
for(const unit of UNITS){
  const {default:lesson}=await import(`../shared/lessons/units/${String(unit.n).padStart(2,'0')}.js`);
  await fs.writeFile(path.join(root,'units',unit.slug,'learn.html'),renderLesson(lesson,sources,unit));
  const page=`../units/${unit.slug}/learn.html`;
  alignment.push(`## Unit ${unit.n}: ${lesson.title}`, '', '### TEKS before the reading', '', '| Reading section | TEKS student expectation |', '| --- | --- |');
  for(const s of lesson.sections)alignment.push(`| [${s.title}](${page}#${s.id}) | ${s.teks.join('; ')} |`);
  alignment.push('', `[Open the reading](${page})`, '', `Interactive illustration: **${lesson.visual.title}**. ${lesson.visual.observe}`, '', '| Assessment | Preparatory sections | Demonstrated understanding |', '| --- | --- | --- |');
  for(const [mode,label,ids,task] of lesson.assessment){
    alignment.push(`| ${label} (${mode}) | ${ids.map(id=>`[${lesson.sections.find(s=>s.id===id).title}](${page}#${id})`).join('; ')} | ${task} |`);
  }
  alignment.push('', 'Honors extensions:', '');
  for(const h of lesson.honors)alignment.push(`- [${h.title}](${page}#honors-${h.id}) → ${lesson.assessment.find(a=>a[0]===h.mode)[1]}. ${h.question}`);
  const mission=await fs.readFile(path.join(root,missionSourcePath(unit)),'utf8');
  const skillBlock=mission.match(/const skills = (\[[\s\S]*?\n\]);/)?.[1];
  if(!skillBlock)throw new Error(`Unit ${unit.n}: cannot read graded skills`);
  const skills=[...skillBlock.matchAll(/\{\s*id:\s*['"]([^'"]+)['"][\s\S]*?label:\s*(['"])(.*?)\2[\s\S]*?\}/g)].map(m=>({id:m[1],label:m[3]}));
  alignment.push('', '### Graded skill coverage', '', 'This finer map includes each core skill, Honors skill, and capstone registered in the active mission implementation. It complements the tab map above; a named link alone does not demonstrate instructional sufficiency.', '', '| Graded skill | Preparatory instruction |', '| --- | --- |');
  for(const skill of skills){
    const targets=lesson.skills?.[skill.id];
    if(!targets?.length)throw new Error(`Unit ${unit.n}: no instruction mapped to ${skill.id}`);
    const links=targets.map(id=>{
      const section=lesson.sections.find(s=>s.id===id)||lesson.honors.find(h=>`honors-${h.id}`===id);
      if(!section)throw new Error(`Unit ${unit.n}: missing section ${id}`);
      return `[${section.title}](${page}#${id})`;
    });
    alignment.push(`| ${skill.label} (${skill.id}) | ${links.join('; ')} |`);
  }
  alignment.push('', `Case-file boundary: ${lesson.caseNote}`, '');
}
await fs.mkdir(path.join(root,'docs'),{recursive:true});
await fs.writeFile(path.join(root,'docs/lesson-alignment.md'),alignment.join('\n').trimEnd()+'\n');
console.log(`Built ${UNITS.length} complete reading pages. No build or external library is required to read the deployed pages.`);
