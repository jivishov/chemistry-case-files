// Second-pass output refinements for Unit 11.
// Keeps the full workbench explanations intact while making the mission screen concise
// and correcting labels embedded in the existing SVG scene strings.

export function refineOutputCreateSim(baseCreateSim) {
  return function createAuditedSim(...args) {
    const sim = baseCreateSim.apply(this, args);

    const baseScArt = sim.scArt;
    sim.scArt = function (id) {
      // Keep Alpine's reactive receiver so a new problem with the same scenario
      // still tracks its photo variant, even when the mission ID stays unchanged.
      return baseScArt.call(this, id)
        .replaceAll('GENERATOR COLUMN · STOPPED BY PLASTIC', 'GENERATOR COLUMN · BETA REDUCED BY PLASTIC')
        .replaceAll('beta stops here', 'beta reduced here')
        .replaceAll('MORNING ELUTION · ONLY LEAD TOUCHES IT', 'MORNING ELUTION · LEAD REDUCES GAMMA')
        .replaceAll('halved by 3 mm Pb', 'lead reduces gamma')
        .replaceAll('THERAPY CAPSULE · BETA STOPS, GAMMA FOLLOWS', 'THERAPY CAPSULE · BETA LOCAL, GAMMA PENETRATING')
        .replaceAll('COBALT HEAD · GAMMA NEEDS LEAD', 'COBALT HEAD · LEAD REDUCES GAMMA')
        .replaceAll('EYE APPLICATOR · BETA STOPS LOCALLY', 'EYE APPLICATOR · SHORT-RANGE BETA')
        .replaceAll('LEGACY NEEDLES · ALPHA STAYS IN THE BOX', 'LEGACY SOURCES · SHORT-RANGE ALPHA')
        .replaceAll('STERILE KITS · GAMMA PASSES THROUGH CARTONS', 'STERILE KITS · GAMMA PENETRATES PACKAGING')
        .replaceAll('EXIT SIGN · BETA STAYS INSIDE THE GLASS', 'EXIT SIGN · LOW-ENERGY BETA IN SEALED TUBE')
        // The Arctic scenario asks for Sr-90; the original illustration was mislabeled Pu-238.
        .replaceAll('Pu-238', 'Sr-90');
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
