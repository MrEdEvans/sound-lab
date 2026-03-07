// ============================================================================
// ModulationGraph.js
// Connects modulation sources to AudioParams across voice + global scopes.
// Does not instantiate modules — only wires them together.
// ============================================================================

export default class ModulationGraph {
    constructor(preset, voiceModules, globalModules) {
        this.preset = preset;
        this.voiceModules = voiceModules;
        this.globalModules = globalModules;
    }

    // ------------------------------------------------------------------------
    // PUBLIC ENTRY POINT
    // ------------------------------------------------------------------------
    apply() {
        const routes = this.preset.modRouting || [];

        for (const route of routes) {
            const src = this.findModule(route.from);
            if (!src) continue;

            const [targetId, param] = route.to.split(".");
            const target = this.findModule(targetId);
            if (!target) continue;

            const amount = route.amount ?? 1.0;

            // Target must have an AudioParam
            if (target[param] && target[param] instanceof AudioParam) {
                try {
                    src.connect(target[param]);
                    target[param].value += amount;
                } catch (e) {
                    console.warn("Modulation routing failed:", route, e);
                }
            }
        }
    }

    // ------------------------------------------------------------------------
    // HELPERS
    // ------------------------------------------------------------------------
    findModule(id) {
        return this.voiceModules[id] || this.globalModules[id] || null;
    }
}
