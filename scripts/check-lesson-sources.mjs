import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(await fs.readFile(path.join(root,'shared/lessons/source-catalog.json'),'utf8'));
const used=new Set();
for(let n=1;n<=11;n++){
  const {default:l}=await import(`../shared/lessons/units/${String(n).padStart(2,'0')}.js`);
  for(const section of [...l.sections,...l.honors])for(const id of section.sources)used.add(id);
}
const ids=[...used], results=[];
let cursor=0;
await Promise.all(Array.from({length:6},async()=>{
  while(cursor<ids.length){
    const id=ids[cursor++],source=catalog[id];
    if(!source){results.push({id,error:'Missing reference'});continue;}
    try{
      const response=await fetch(source.url,{signal:AbortSignal.timeout(25000)});
      const html=await response.text();
      const title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]*>/g,'').trim()||'';
      const main=html.slice(html.indexOf('mt-content-container'));
      const paragraphs=[...main.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)].map(m=>m[1].replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim()).filter(t=>t.length>80&&t.length<1000&&!/newcommand|\\definecolor|Copyright|libraries are|page titled|funded|Save as PDF/.test(t));
      results.push({id,url:source.url,finalUrl:response.url,status:response.status,pageTitle:title,checkedAt:new Date().toISOString(),contentAvailable:response.ok&&!/Page not found|Access denied|Just a moment|404 -/i.test(title),reviewSnippet:paragraphs.slice(0,2).join(' ').slice(0,600)});
    }catch(error){results.push({id,url:source.url,error:error.message,checkedAt:new Date().toISOString()});}
  }
}));
results.sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id));
await fs.mkdir(path.join(root,'docs'),{recursive:true});
// Keep verification metadata; excerpts are printed for review, not redistributed.
await fs.writeFile(path.join(root,'docs/lesson-source-check.json'),JSON.stringify(results.map(({reviewSnippet,...rest})=>rest),null,2)+'\n');
const issues=results.filter(r=>!r.contentAvailable);
console.log(JSON.stringify({checked:results.length,available:results.length-issues.length,issues},null,2));
if(process.argv.includes('--review'))for(const r of results)console.log(r.id+' '+r.pageTitle+'\n'+r.reviewSnippet+'\n');
if(issues.length)process.exitCode=1;
