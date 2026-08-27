// Second-pass output refinements for Unit 11.
// Keeps the full workbench explanations intact while making the mission screen concise
// and correcting labels embedded in the existing SVG scene strings.

export function refineOutputCreateSim(baseCreateSim) {
  return function createAuditedSim(...args) {
    const sim = baseCreateSim.apply(this, args);

    const baseScArt = sim.scArt.bind(sim);
    sim.scArt = function (id) {
      return baseScArt(id)
        .replace('GENERATOR COLUMN · STOPPED BY PLASTIC', 'GENERATOR COLUMN · BETA REDUCED BY PLASTIC')
        .replace('beta stops here', 'beta reduced here')
        .replace('MORNING ELUTION · ONLY LEAD TOUCHES IT', 'MORNING ELUTION · LEAD REDUCES GAMMA')
        .replace('halved by 3 mm Pb', 'lead reduces gamma')
        .replace('THERAPY CAPSULE · BETA STOPS, GAMMA FOLLOWS', 'THERAPY CAPSULE · BETA LOCAL, GAMMA PENETRATING')
        .replace('COBALT HEAD · GAMMA NEEDS LEAD', 'COBALT HEAD · LEAD REDUCES GAMMA')
        .replace('EYE APPLICATOR · BETA STOPS LOCALLY', 'EYE APPLICATOR · SHORT-RANGE BETA')
        .replace('LEGACY NEEDLES · ALPHA STAYS IN THE BOX', 'LEGACY SOURCES · SHORT-RANGE ALPHA')
        .replace('STERILE KITS · GAMMA PASSES THROUGH CARTONS', 'STERILE KITS · GAMMA PENETRATES PACKAGING')
        .replace('EXIT SIGN · BETA STAYS INSIDE THE GLASS', 'EXIT SIGN · LOW-ENERGY BETA IN SEALED TUBE')
        // The Arctic scenario asks for Sr-90; the original illustration was mislabeled Pu-238.
        .replace('Pu-238', 'Sr-90');
    };

    const outcome = Object.getOwnPropertyDescriptor(sim, 'activeOutcomeText');
    if (outcome && outcome.get) {
      const fullOutcome = outcome.get;
      Object.defineProperty(sim, 'activeOutcomeText', {
        configurable: true,
        enumerable: true,
        get() {
          const text = String(fullOutcome.call(this) || '');
          // Before a submission, keep the scenario rationale. After a submission, the
          // mission column needs only the first explanatory sentence; the complete verdict
          // remains visible in the scrolling workbench panel.
          if (!this.activeVerdict) return text;
          const first = text.match(/^.*?[.!?](?=\s|$)/);
          return first ? first[0].trim() : text;
        }
      });
    }

    return sim;
  };
}
