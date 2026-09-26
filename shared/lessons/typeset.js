import { escapeHTML as e } from './models.js';

// Authors mark display mathematics explicitly. No heuristic extraction from prose:
// chemical names, isotope labels and numeric observations remain normal sentences.
function math(text) {
  return text.replace(/_([A-Za-z]+)\b/g, '<sub>$1</sub>')
    .replace(/\^\(([^)]+)\)/g, '<sup>$1</sup>');
}

export function typeset(text, {html = false} = {}) {
  const equations = [];
  const marked = text.replace(/<eq(?: label="([^"]*)")?>([\s\S]*?)<\/eq>/g, (_, label, value) => {
    const index = equations.length;
    const content = html ? value : e(value);
    equations.push(`<div class="lesson-equation">${label ? `<span class="equation-label">${e(label)}</span>` : ''}<div class="equation-math">${math(content)}</div></div>`);
    return `@@DISPLAY${index}@@`;
  });
  const paragraphs = html ? marked : `<p>${e(marked)}</p>`;
  return paragraphs.replace(/<p>([\s\S]*?)<\/p>/g, (_, body) =>
    body.split(/(@@DISPLAY\d+@@)/g).map((part, index) => {
      const match = part.match(/^@@DISPLAY(\d+)@@$/);
      if (match) return equations[Number(match[1])];
      const prose = (index ? part.replace(/^\s*[.,;]\s*/, '') : part).trim();
      return prose ? `<p>${math(prose)}</p>` : '';
    }).join('')).replace(/@@DISPLAY(\d+)@@/g, (_, index) => equations[Number(index)]);
}
