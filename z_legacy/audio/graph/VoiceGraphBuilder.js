// ============================================================================
// VoiceGraphBuilder.js
// Builds the per‑voice audio + modulation graph dynamically from the preset.
// This file handles ONLY per‑voice modules ("voice" and "modulation").
// Global modules are handled by GlobalGraphBuilder.
// ============================================================================

export default class VoiceGraphBuilder {
    constructor(context, preset) {
        this.context = context;
        this.preset = preset;

        // All instantiated modules for this voice
        this.modules = {};

        // Convenience maps
        this.voiceModules = [];
        this.modModules = [];
    }

    // ------------------------------------------------------------------------
    // PUBLIC ENTRY POINT
    // ------------------------------------------------------------------------
    build() {
        this.partitionModules();
        this.instantiateModules();
        this.buildAudioRouting();
        this.buildModulationRouting();

        return this.modules;
    }

    // ------------------------------------------------------------------------
    // PARTITION MODULES BY SCOPE
    // ------------------------------------------------------------------------
    partitionModules() {
        const all = this.preset.modules || [];

        this.voiceModules = all.filter(m => m.signal === "voice");
        this.modModules   = all.filter(m => m.signal === "modulation");
    }

    // ------------------------------------------------------------------------
    // INSTANTIATE MODULES
    // ------------------------------------------------------------------------
    instantiateModules() {
        // Voice audio modules
        for (const mod of this.voiceModules) {
            this.modules[mod.id] = this.createVoiceModule(mod);
        }

        // Modulation modules
        for (const mod of this.modModules) {
            this.modules[mod.id] = this.createModModule(mod);
        }

        // Always create the per‑voice output bus
        this.modules.voiceBus = this.context.createGain();
        this.modules.voiceBus.gain.value = 1.0;
    }

    // ------------------------------------------------------------------------
    // FACTORY: CREATE VOICE AUDIO MODULES
    // ------------------------------------------------------------------------
    createVoiceModule(mod) {
        switch (mod.type) {

            case "oscillator":
                // Oscillators are created per-note in Voice.js, not here.
                // We create a placeholder Gain node for routing.
                const oscGain = this.context.createGain();
                oscGain.gain.value = mod.parameters.level ?? 1.0;
                return oscGain;

            case "filter":
                const f = this.context.createBiquadFilter();
                f.type = mod.parameters.filterType || "lowpass";
                f.frequency.value = mod.parameters.cutoff ?? 1000;
                f.Q.value = mod.parameters.resonance ?? 0;
                return f;

            case "distortion":
                const dist = this.context.createWaveShaper();
                dist.curve = this.makeDistortionCurve(mod.parameters.amount ?? 0);
                return dist;

            case "gain":
                const g = this.context.createGain();
                g.gain.value = mod.parameters.gain ?? 1.0;
                return g;

            case "envelope":
                // Envelope is not an AudioNode — it's a modulation source.
                // But if someone marks it as "voice", treat it as a Gain.
                const envGain = this.context.createGain();
                envGain.gain.value = 1.0;
                return envGain;

            default:
                console.warn("Unknown voice module type:", mod.type);
                return this.context.createGain();
        }
    }

    // ------------------------------------------------------------------------
    // FACTORY: CREATE MODULATION MODULES
    // ------------------------------------------------------------------------
    createModModule(mod) {
        switch (mod.type) {

            case "envelope":
                // Envelope is not an AudioNode; we create a Gain as a control signal.
                const env = this.context.createGain();
                env.gain.value = 0;
                env._isEnvelope = true;
                env._params = mod.parameters;
                return env;

            case "lfo":
                const osc = this.context.createOscillator();
                osc.frequency.value = mod.parameters.frequency ?? 5;

                const lfoGain = this.context.createGain();
                lfoGain.gain.value = mod.parameters.amount ?? 1;

                osc.connect(lfoGain);
                osc.start();

                // Return the gain node as the modulation output
                return lfoGain;

            default:
                console.warn("Unknown modulation module type:", mod.type);
                return this.context.createGain();
        }
    }

    // ------------------------------------------------------------------------
    // BUILD AUDIO ROUTING (VOICE SCOPE ONLY)
    // ------------------------------------------------------------------------
    buildAudioRouting() {
        const edges = this.preset.audioRouting || [];

        for (const edge of edges) {
            const from = this.modules[edge.from];
            const to   = this.modules[edge.to];

            if (!from || !to) continue;

            // Only connect voice→voice
            if (this.isVoice(edge.from) && this.isVoice(edge.to)) {
                try {
                    from.connect(to);
                } catch (e) {
                    console.warn("Audio routing failed:", edge, e);
                }
            }

            // Special case: voice → voiceBus
            if (edge.to === "voiceBus") {
                try {
                    from.connect(this.modules.voiceBus);
                } catch (e) {
                    console.warn("Failed to connect to voiceBus:", edge, e);
                }
            }
        }
    }

    // ------------------------------------------------------------------------
    // BUILD MODULATION ROUTING
    // ------------------------------------------------------------------------
    buildModulationRouting() {
        const routes = this.preset.modRouting || [];

        for (const route of routes) {
            const src = this.modules[route.from];
            if (!src) continue;

            const [targetId, param] = route.to.split(".");
            const target = this.modules[targetId];
            if (!target) continue;

            const amount = route.amount ?? 1.0;

            // Modulation target must be an AudioParam
            if (target[param] && target[param] instanceof AudioParam) {
                try {
                    src.connect(target[param]);
                    target[param].value += amount;
                } catch (e) {
                    console.warn("Mod routing failed:", route, e);
                }
            }
        }
    }

    // ------------------------------------------------------------------------
    // HELPERS
    // ------------------------------------------------------------------------
    isVoice(id) {
        return this.voiceModules.some(m => m.id === id);
    }

    isMod(id) {
        return this.modModules.some(m => m.id === id);
    }

    makeDistortionCurve(amount) {
        const n = 1024;
        const curve = new Float32Array(n);
        const k = amount * 100;

        for (let i = 0; i < n; i++) {
            const x = (i * 2) / n - 1;
            curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
        }
        return curve;
    }
}
