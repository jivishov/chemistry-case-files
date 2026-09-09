// main.js — Unit 1 composition root.
// Simulation/state logic remains in sim-core.js; calibrated live SVG rendering is isolated
// in svg-fidelity.js so later photorealistic assets cannot overwrite data-bearing geometry.

import { createSim as createCoreSim, SE } from './sim-core.js?v=u1-svg-fidelity-1';
import { installSvgFidelity } from './svg-fidelity.js?v=u1-svg-fidelity-1';

export { SE };

export function createSim() {
  return installSvgFidelity(createCoreSim());
}
