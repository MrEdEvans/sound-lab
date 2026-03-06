// ============================================================================
// GlobalGraphBuilder.js
// Builds the global FX chain (post‑mixer) from the preset.
// Only modules with signal: "global" are instantiated here.
// ============================================================================

export default class GlobalGraphBuilder {
    constructor(context, preset, voiceMixNode) {
        this.context = context;
        this.preset = preset;
        this.voiceMixNode = voiceMixNode;

        this.modules = {};
        this.globalModules = [];
    }

    // ------------------------------------------------------------------------
    // PUBLIC ENTRY POINT
    // ------------------------------------------------------------------------
    build() {
        this.partitionModules();
        this.instantiateModules();
        this.buildAudioRouting();

        return {
            modules: this.modules,
            output: this.findOutputNode()
        };
    }

    // ------------------------------------------------------------------------
    // PARTITION MODULES
    // ------------------------------------------------------------------------
    partitionModules() {
        const all = this.preset.modules || [];
        this.globalModules = all.filter(m => m.signal === "global");
    }

    // ------------------------------------------------------------------------
    // INSTANTIATE GLOBAL MODULES
    // ------------------------------------------------------------------------
    instantiateModules() {
        for (const mod of this.globalModules) {
            this.modules[mod.id] = this.createGlobalModule(mod);
        }
    }

    // ------------------------------------------------------------------------
    // FACTORY: CREATE GLOBAL MODULES
    // ------------------------------------------------------------------------
    createGlobalModule(mod) {
        switch (mod.type) {

            case "delay":
                const delay = this.context.createDelay();
                delay.delayTime.value = mod.parameters.time ?? 0.3;
                return delay;

            case "reverb":
                // Placeholder: real reverb uses a ConvolverNode with an IR
                const rev = this.context.createConvolver();
                return rev;

            case "gain":
                const g = this.context.createGain();
                g.gain.value = mod.parameters.gain ?? 1.0;
                return g;

            case "filter":
                const f = this.context.createBiquadFilter();
                f.type = mod.parameters.filterType || "lowpass";
                f.frequency.value = mod.parameters.cutoff ?? 1000;
                f.Q.value = mod.parameters.resonance ?? 0;
                return f;

            case "limiter":
                // Simple limiter placeholder using DynamicsCompressor
                const comp = this.context.createDynamicsCompressor();
                comp.threshold.value = -1;
                comp.ratio.value = 20;
                return comp;

            default:
                console.warn("Unknown global module type:", mod.type);
                return this.context.createGain();
        }
    }

    // ------------------------------------------------------------------------
    // BUILD GLOBAL AUDIO ROUTING
    // ------------------------------------------------------------------------
    buildAudioRouting() {
        const edges = this.preset.audioRouting || [];

        // First: connect voiceMix → first global module
        const firstGlobal = this.findFirstGlobalModule();
        if (firstGlobal) {
            this.voiceMixNode.connect(firstGlobal);
        }

        // Then: connect global → global edges
        for (const edge of edges) {
            const from = this.modules[edge.from];
            const to   = this.modules[edge.to];

            if (!from || !to) continue;

            // Only allow global→global
            if (this.isGlobal(edge.from) && this.isGlobal(edge.to)) {
                try {
                    from.connect(to);
                } catch (e) {
                    console.warn("Global routing failed:", edge, e);
                }
            }
        }
    }

    // ------------------------------------------------------------------------
    // HELPERS
    // ------------------------------------------------------------------------
    isGlobal(id) {
        return this.globalModules.some(m => m.id === id);
    }

    findFirstGlobalModule() {
        // First global module is any module that has no incoming global edges
        const edges = this.preset.audioRouting || [];
        const incoming = new Set(edges.map(e => e.to));
        return this.globalModules.find(m => !incoming.has(m.id))?.id
            ? this.modules[this.globalModules.find(m => !incoming.has(m.id)).id]
            : null;
    }

    findOutputNode() {
        // Output node is any global module with no outgoing edges
        const edges = this.preset.audioRouting || [];
        const outgoing = new Set(edges.map(e => e.from));

        const last = this.globalModules.find(m => !outgoing.has(m.id));
        if (last) return this.modules[last.id];

        // Fallback: return voiceMix if no global modules exist
        return this.voiceMixNode;
    }
}
