// Scene sprite metadata only. Do not import scene-photo-part-0.js as JavaScript:
// that historical payload contains a newline before its closing quote and therefore
// cannot be parsed as an ES module. svg-fidelity.js fetches it as plain text instead.
export const SCENE_SPRITE_SOURCE_URL = new URL('./scene-photo-part-0.js?v=u1-photo-scenes-6', import.meta.url).href;

export const SCENE_SPRITE_POSITION = Object.freeze({
  'a-dechlor': ['0%', '0%'],
  'a-plantfood': ['25%', '0%'],
  'a-meds': ['50%', '0%'],
  'b-log': ['75%', '0%'],
  'b-volume': ['100%', '0%'],
  'b-pergallon': ['0%', '50%'],
  'c-ornament': ['25%', '50%'],
  'c-pendant': ['50%', '50%'],
  'c-anchor': ['75%', '50%'],
  'd-dropkit': ['100%', '50%'],
  'd-penmeter': ['0%', '100%'],
  'd-strips': ['25%', '100%'],
  'h1-sizecall': ['50%', '100%'],
  'h2-kitcall': ['75%', '100%'],
  'cap-waterchange': ['100%', '100%']
});
