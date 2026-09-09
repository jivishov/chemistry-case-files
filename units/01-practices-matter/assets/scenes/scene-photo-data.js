import p0 from './scene-photo-part-0.js';
import p1 from './scene-photo-part-1.js';
import p2 from './scene-photo-part-2.js';
import p3 from './scene-photo-part-3.js';

export const SCENE_SPRITE = `data:image/webp;base64,${p0}${p1}${p2}${p3}`;

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
