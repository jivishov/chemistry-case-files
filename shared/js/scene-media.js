// Photographs reproduce each mission's authored scene and static evidence.
// The original SVG remains available; live state and assessment logic stay authored.
import { SCENE_PHOTOS } from './scene-photo-manifest.js';

export const UNIT_PHOTOS = Object.freeze({
  1: 'aquarium', 2: 'spectroscopy', 3: 'materials', 4: 'kitchen',
  5: 'spacehab', 6: 'rescue', 7: 'scuba', 8: 'solutions',
  9: 'acidbase', 10: 'thermal', 11: 'nuclear'
});

const escapeText = value => String(value).replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Replaced artwork gets a fresh URL without invalidating the other mission photos.
const PHOTO_REVISIONS = Object.freeze({
  '7/a-whip/0': '20260927-1',
  '1/a-dechlor/0': '20260929-1',
  '1/a-dechlor/1': '20260929-1',
  '1/a-plantfood/0': '20260929-1',
  '1/a-plantfood/1': '20260929-1',
  '1/a-meds/0': '20260929-1',
  '1/a-meds/1': '20260929-1',
  '1/b-log/0': '20260929-1',
  '1/b-log/1': '20260929-1',
  '1/b-volume/0': '20260929-1',
  '1/b-volume/1': '20260929-1',
  '1/b-pergallon/0': '20260929-1',
  '1/b-pergallon/1': '20260929-1',
  '1/c-ornament/0': '20260929-1',
  '1/c-ornament/1': '20260929-1',
  '1/c-anchor/0': '20260929-1',
  '1/c-anchor/1': '20260929-1',
  '1/d-dropkit/0': '20260929-1',
  '1/d-dropkit/1': '20260929-1',
  '1/d-penmeter/0': '20260929-1',
  '1/d-penmeter/1': '20260929-1',
  '1/d-strips/0': '20260929-1',
  '1/d-strips/1': '20260929-1',
  '1/h1-sizecall/0': '20260929-1',
  '1/h1-sizecall/1': '20260929-1',
  '1/h2-kitcall/0': '20260929-1',
  '1/h2-kitcall/1': '20260929-1',
  '1/cap-waterchange/0': '20260929-1',
  '1/cap-waterchange/1': '20260929-1',
  '2/a-crt/0': '20260929-1',
  '2/a-crt/1': '20260929-1',
  '2/a-tube/0': '20260929-1',
  '2/a-tube/1': '20260929-1',
  '2/a-assay/0': '20260929-1',
  '2/a-assay/1': '20260929-1',
  '2/b-argon/0': '20260929-1',
  '2/b-argon/1': '20260929-1',
  '2/b-neon/0': '20260929-1',
  '2/b-neon/1': '20260929-1',
  '2/b-chlorine/0': '20260929-1',
  '2/b-chlorine/1': '20260929-1',
  '2/d-boron/0': '20260929-1',
  '2/d-boron/1': '20260929-1',
  '2/d-copper/0': '20260929-1',
  '2/d-copper/1': '20260929-1',
  '2/d-chlorine/0': '20260929-1',
  '2/d-chlorine/1': '20260929-1',
  '2/c-sodium/0': '20260929-1',
  '2/c-sodium/1': '20260929-1',
  '2/c-neon/0': '20260929-1',
  '2/c-neon/1': '20260929-1',
  '2/c-mercury/0': '20260929-1',
  '2/c-mercury/1': '20260929-1',
  '2/e-magnesium/0': '20260929-1',
  '2/e-magnesium/1': '20260929-1',
  '2/e-chromium/0': '20260929-1',
  '2/e-chromium/1': '20260929-1',
  '2/e-copper/0': '20260929-1',
  '2/e-copper/1': '20260929-1',
  '2/f-argon/0': '20260929-1',
  '2/f-argon/1': '20260929-1',
  '2/f-aluminum/0': '20260929-1',
  '2/f-aluminum/1': '20260929-1',
  '2/f-chlorine/0': '20260929-1',
  '2/f-chlorine/1': '20260929-1',
  '2/h1-photon/0': '20260929-1',
  '2/h1-photon/1': '20260929-1',
  '2/h2-orbital/0': '20260929-1',
  '2/h2-orbital/1': '20260929-1',
  '2/cap-glowroom/0': '20260929-1',
  '2/cap-glowroom/1': '20260929-1',
  '3/a-datasheet/0': '20260929-1',
  '3/a-datasheet/1': '20260929-1',
  '3/a-warehouse/0': '20260929-1',
  '3/a-warehouse/1': '20260929-1',
  '3/a-manual/0': '20260929-1',
  '3/a-manual/1': '20260929-1',
  '3/b-remote/0': '20260929-1',
  '3/b-remote/1': '20260929-1',
  '3/b-contact/0': '20260929-1',
  '3/b-contact/1': '20260929-1',
  '3/b-plastic/0': '20260929-1',
  '3/b-plastic/1': '20260929-1',
  '3/c-cell/0': '20260929-1',
  '3/c-cell/1': '20260929-1',
  '3/c-connector/0': '20260929-1',
  '3/c-connector/1': '20260929-1',
  '3/c-case/0': '20260929-1',
  '3/c-case/1': '20260929-1',
  '3/h1-shielding/0': '20260929-1',
  '3/h1-shielding/1': '20260929-1',
  '3/h2-dip/0': '20260929-1',
  '3/h2-dip/1': '20260929-1',
  '3/cap-substitute/0': '20260929-1',
  '3/cap-substitute/1': '20260929-1',
  '4/a-white-jar/0': '20260929-1',
  '4/a-white-jar/1': '20260929-1',
  '4/a-gas-ring/0': '20260929-1',
  '4/a-gas-ring/1': '20260929-1',
  '4/a-tap-water/0': '20260929-1',
  '4/a-tap-water/1': '20260929-1',
  '4/b-hallway-alarm/0': '20260929-1',
  '4/b-hallway-alarm/1': '20260929-1',
  '4/b-deicer/0': '20260929-1',
  '4/b-deicer/1': '20260929-1',
  '4/b-pantry/0': '20260929-1',
  '4/b-pantry/1': '20260929-1',
  '4/c-ice-water/0': '20260929-1',
  '4/c-ice-water/1': '20260929-1',
  '4/c-cleaning-shelf/0': '20260929-1',
  '4/c-cleaning-shelf/1': '20260929-1',
  '4/c-gas-ring-shape/0': '20260929-1',
  '4/c-gas-ring-shape/1': '20260929-1',
  '4/c-extinguisher/0': '20260929-1',
  '4/c-extinguisher/1': '20260929-1',
  '4/d-dry-pan/0': '20260929-1',
  '4/d-dry-pan/1': '20260929-1',
  '4/d-bulb-battery/0': '20260929-1',
  '4/d-bulb-battery/1': '20260929-1',
  '4/d-drop-test/0': '20260929-1',
  '4/d-drop-test/1': '20260929-1',
  '4/d-sugar-pan/0': '20260929-1',
  '4/d-sugar-pan/1': '20260929-1',
  '4/h1-percent-ionic/0': '20260929-1',
  '4/h1-percent-ionic/1': '20260929-1',
  '4/h2-polarity/0': '20260929-1',
  '4/h2-polarity/1': '20260929-1',
  '4/h3-imf/0': '20260929-1',
  '4/h3-imf/1': '20260929-1',
  '4/cap-underthesink/0': '20260929-1',
  '4/cap-underthesink/1': '20260929-1',
  '5/a-oxygen/0': '20260929-1',
  '5/a-oxygen/1': '20260929-1',
  '5/a-fuel/0': '20260929-1',
  '5/a-fuel/1': '20260929-1',
  '5/a-scrubber/0': '20260929-1',
  '5/a-scrubber/1': '20260929-1',
  '5/b-eva/0': '20260929-1',
  '5/b-eva/1': '20260929-1',
  '5/b-ration/0': '20260929-1',
  '5/b-ration/1': '20260929-1',
  '5/b-sample/0': '20260929-1',
  '5/b-sample/1': '20260929-1',
  '5/c-ore/0': '20260929-1',
  '5/c-ore/1': '20260929-1',
  '5/c-greenhouse/0': '20260929-1',
  '5/c-greenhouse/1': '20260929-1',
  '5/c-fuelpurity/0': '20260929-1',
  '5/c-fuelpurity/1': '20260929-1',
  '5/d-leak/0': '20260929-1',
  '5/d-leak/1': '20260929-1',
  '5/d-surface/0': '20260929-1',
  '5/d-surface/1': '20260929-1',
  '5/d-coolant/0': '20260929-1',
  '5/d-coolant/1': '20260929-1',
  '5/h1-desiccant/0': '20260929-1',
  '5/h1-desiccant/1': '20260929-1',
  '5/h2-arson/0': '20260929-1',
  '5/h2-arson/1': '20260929-1',
  '5/cap-pod/0': '20260929-1',
  '5/cap-pod/1': '20260929-1',
  '6/a-ladder/0': '20260929-1',
  '6/a-ladder/1': '20260929-1',
  '6/a-grill/0': '20260929-1',
  '6/a-grill/1': '20260929-1',
  '6/a-depot/0': '20260929-1',
  '6/a-depot/1': '20260929-1',
  '6/b-jumpkit/0': '20260929-1',
  '6/b-jumpkit/1': '20260929-1',
  '6/b-darkroom/0': '20260929-1',
  '6/b-darkroom/1': '20260929-1',
  '6/b-ditch/0': '20260929-1',
  '6/b-ditch/1': '20260929-1',
  '6/c-garage/0': '20260929-1',
  '6/c-garage/1': '20260929-1',
  '6/c-depot/0': '20260929-1',
  '6/c-depot/1': '20260929-1',
  '6/c-bobtail/0': '20260929-1',
  '6/c-bobtail/1': '20260929-1',
  '6/d-shack/0': '20260929-1',
  '6/d-shack/1': '20260929-1',
  '6/d-ditch/0': '20260929-1',
  '6/d-ditch/1': '20260929-1',
  '6/d-shed/0': '20260929-1',
  '6/d-shed/1': '20260929-1',
  '6/h1-particles/0': '20260929-1',
  '6/h1-particles/1': '20260929-1',
  '6/h2-recovery/0': '20260929-1',
  '6/h2-recovery/1': '20260929-1',
  '6/cap-tanker/0': '20260929-1',
  '6/cap-tanker/1': '20260929-1',
  '7/a-whip/1': '20260929-1',
  '7/a-steel/0': '20260929-1',
  '7/a-steel/1': '20260929-1',
  '7/a-deck/0': '20260929-1',
  '7/a-deck/1': '20260929-1',
  '7/b-tire/0': '20260929-1',
  '7/b-tire/1': '20260929-1',
  '7/b-twinset/0': '20260929-1',
  '7/b-twinset/1': '20260929-1',
  '7/b-sundeck/0': '20260929-1',
  '7/b-sundeck/1': '20260929-1',
  '7/c-air/0': '20260929-1',
  '7/c-air/1': '20260929-1',
  '7/c-blend/0': '20260929-1',
  '7/c-blend/1': '20260929-1',
  '7/c-ppo2/0': '20260929-1',
  '7/c-ppo2/1': '20260929-1',
  '7/h1-speeds/0': '20260929-1',
  '7/h1-speeds/1': '20260929-1',
  '7/h2-real/0': '20260929-1',
  '7/h2-real/1': '20260929-1',
  '7/h3-water/0': '20260929-1',
  '7/h3-water/1': '20260929-1',
  '7/cap-lastfill/0': '20260929-1',
  '7/cap-lastfill/1': '20260929-1'
});

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
  const url = new URL(`../assets/photos/missions/${unit}/${id}-${view}.webp`, import.meta.url);
  const revision = PHOTO_REVISIONS[`${unit}/${id}/${view}`];
  if (revision) url.searchParams.set('v', revision);
  return url.href;
}

export function photoScene(unit, id, svg, variant = 0) {
  const url = scenePhotoUrl(unit, id, variant);
  // An unknown scene must keep its own SVG, not borrow unrelated unit artwork.
  if (!svg || !url) return svg || '';
  // Captions are extracted after each unit's scientific-copy refinements. Photo
  // evidence must match this SVG and must not add live or hidden answer state.
  const texts = [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)];
  const caption = texts.at(-1)?.[1].replace(/<[^>]*>/g, '') || '';
  return `<div class="scene-media" data-scene-id="${escapeText(id)}" data-unit="${unit}">`
    + `<div class="scene-original">${svg}</div>`
    + `<img class="scene-photo" src="${url}" alt="" aria-hidden="true" width="640" height="240" decoding="async" draggable="false" onload="this.parentElement.classList.add('is-photo-ready')" onerror="this.parentElement.classList.remove('is-photo-ready');this.hidden=true">`
    + `<span class="scene-caption" aria-hidden="true">${caption}</span>`
    + `<button type="button" class="scene-compare" aria-label="Show original scenario illustration" aria-pressed="false" onclick="const original=this.parentElement.classList.toggle('show-original');this.setAttribute('aria-pressed',String(original));this.textContent=original?'Photo':'Diagram';this.setAttribute('aria-label',original?'Show scenario photograph':'Show original scenario illustration')">Diagram</button>`
    + `</div>`;
}
