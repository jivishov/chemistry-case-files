import sceneSpriteBase64 from './scene-photo-part-0.js?v=u1-photo-scenes-5';

// The previous binary unit1-scenes.webp was malformed, so browsers correctly fell back
// to the original SVG. Keep the approved 5×3 photorealistic sprite in its already-valid
// base64 module and turn it into an image URL here. This removes the binary-decoding
// failure while preserving the SVG fallback path.
export const SCENE_SPRITE_URL = `data:image/webp;base64,${sceneSpriteBase64}`;

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
