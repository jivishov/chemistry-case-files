// Photographs establish the setting. The original SVG remains available in-place;
// simulation diagrams, captions, scientific state and assessment logic stay authored.
import { SCENE_PHOTOS } from './scene-photo-manifest.js';

export const UNIT_PHOTOS = Object.freeze({
  1: 'aquarium', 2: 'spectroscopy', 3: 'materials', 4: 'kitchen',
  5: 'spacehab', 6: 'rescue', 7: 'scuba', 8: 'solutions',
  9: 'acidbase', 10: 'thermal', 11: 'nuclear'
});

const escapeText = value => String(value).replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function photoUrl(unit) {
  const name = UNIT_PHOTOS[unit];
  return name ? new URL(`../assets/photos/${name}.webp`, import.meta.url).href : '';
}

// Per-scenario counters belong to the Alpine component. Advance only when a new
// problem is generated, never while rendering, checking an answer or changing tabs.
export function createSceneMedia() {
  return {
    scenePhotoVisits: {},
    advanceScenePhoto(id) {
      this.scenePhotoVisits[id] = (this.scenePhotoVisits[id] || 0) + 1;
    },
    scenePhotoVariant(id) {
      return Math.max(0, (this.scenePhotoVisits[id] || 1) - 1) % 2;
    }
  };
}

export function scenePhotoUrl(unit, id, variant = 0) {
  if (!Object.hasOwn(SCENE_PHOTOS, unit) || !SCENE_PHOTOS[unit].includes(id)) return '';
  const view = Number.isInteger(variant) ? ((variant % 2) + 2) % 2 : 0;
  return new URL(`../assets/photos/missions/${unit}/${id}-${view}.webp`, import.meta.url).href;
}

export function photoScene(unit, id, svg, variant = 0) {
  const url = scenePhotoUrl(unit, id, variant);
  // An unknown scene must keep its own SVG, not borrow unrelated unit artwork.
  if (!svg || !url) return svg || '';
  // Captions are extracted after each unit's scientific-copy refinements. Never
  // generate scientific labels inside a bitmap or expose hidden answer state.
  const texts = [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)];
  const caption = texts.at(-1)?.[1].replace(/<[^>]*>/g, '') || '';
  return `<div class="scene-media" data-scene-id="${escapeText(id)}" data-unit="${unit}">`
    + `<div class="scene-original">${svg}</div>`
    + `<img class="scene-photo" src="${url}" alt="" aria-hidden="true" width="640" height="240" decoding="async" draggable="false" onload="this.parentElement.classList.add('is-photo-ready')" onerror="this.parentElement.classList.remove('is-photo-ready');this.hidden=true">`
    + `<span class="scene-caption" aria-hidden="true">${caption}</span>`
    + `<button type="button" class="scene-compare" aria-label="Show original scenario illustration" aria-pressed="false" onclick="const original=this.parentElement.classList.toggle('show-original');this.setAttribute('aria-pressed',String(original));this.textContent=original?'Photo':'Diagram';this.setAttribute('aria-label',original?'Show scenario photograph':'Show original scenario illustration')">Diagram</button>`
    + `</div>`;
}
