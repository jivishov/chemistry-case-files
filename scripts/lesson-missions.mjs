// Unit 1 separates its state engine from the calibrated SVG composition root.
export const missionSourcePath = unit => `units/${unit.slug}/js/${unit.n === 1 ? 'sim-core' : 'main'}.js`;
