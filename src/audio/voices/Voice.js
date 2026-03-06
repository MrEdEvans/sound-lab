// ============================================================================
// Voice.js
// A single polyphonic voice: oscillator lifecycle, envelopes, smoothing,
// timing, and DSP behavior. Routing is delegated to VoiceGraphBuilder.
// ============================================================================

import VoiceGraphBuilder from "../graph/VoiceGraphBuilder";

export default class Voice {
    constructor(context, preset, note, velocity) {
        this.context = context;
        this.preset = preset;
        this.note = note;
        this.velocity = velocity;

        this.active = false;
        this.oscillators = [];
        this.startTime = null;

        // Validate preset structure before building anything
        this.validatePreset();

        // Build the per‑voice graph dynamically
        this.graph = new VoiceGraphBuilder(context, preset).build();

        // The final output of this voice
        this.output = this.graph.voiceBus;

        // Envelope state (strict: must exist)
        this.ampEnv = preset.envelopes.amp;
    }

    // ------------------------------------------------------------------------
    // PRESET VALIDATION (strict)
    // ------------------------------------------------------------------------
    validatePreset() {
        if (!this.preset.oscillators || this.preset.oscillators.length === 0) {
            throw new Error("Preset must define at least one oscillator.");
        }

        for (const osc of this.preset.oscillators) {
            if (!osc.id) {
                throw new Error("Each oscillator must have an 'id'.");
            }
            if (!osc.type) {
                throw new Error(`Oscillator '${osc.id}' is missing required field 'type'.`);
            }
            if (typeof osc.transpose !== "number") {
                throw new Error(`Oscillator '${osc.id}' must define numeric 'transpose'.`);
            }
        }

        if (!this.preset.envelopes || !this.preset.envelopes.amp) {
            throw new Error("Preset must define an amp envelope at preset.envelopes.amp.");
        }

        const env = this.preset.envelopes.amp;
        ["attack", "decay", "sustain", "release"].forEach(param => {
            if (typeof env[param] !== "number") {
                throw new Error(`Amp envelope missing required numeric field '${param}'.`);
            }
        });
    }

    // ------------------------------------------------------------------------
    // NOTE ON
    // ------------------------------------------------------------------------
    noteOn(time = this.context.currentTime) {
        this.active = true;
        this.startTime = time;

        // Create oscillators per preset
        this.createOscillators(time);

        // Apply amplitude envelope
        this.applyAmpEnvelope(time);
    }

    // ------------------------------------------------------------------------
    // CREATE OSCILLATORS (preserves your DSP behavior)
    // ------------------------------------------------------------------------
    createOscillators(time) {
        const oscDefs = this.preset.oscillators;

        oscDefs.forEach((oscDef) => {
            const osc = this.context.createOscillator();

            // Strict: waveform must be explicitly defined
            osc.type = oscDef.type;

            // Frequency with smoothing
            const freq = this.midiToFreq(this.note + oscDef.transpose);
            osc.frequency.setValueAtTime(freq, time);

            // Micro‑delay start to avoid phase alignment clicks
            const startAt = time + (oscDef.startDelay || 0);

            // Connect oscillator → its gain node (created by VoiceGraphBuilder)
            const gainNode = this.graph[oscDef.id];
            if (!gainNode) {
                throw new Error(`VoiceGraphBuilder did not create module for oscillator '${oscDef.id}'.`);
            }

            osc.connect(gainNode);
            osc.start(startAt);

            this.oscillators.push(osc);
        });
    }

    // ------------------------------------------------------------------------
    // APPLY AMP ENVELOPE (preserves your smoothing behavior)
    // ------------------------------------------------------------------------
    applyAmpEnvelope(time) {
        const env = this.ampEnv;
        const g = this.graph.voiceBus.gain;

        const attackEnd = time + env.attack;
        const decayEnd = attackEnd + env.decay;

        g.cancelScheduledValues(time);
        g.setValueAtTime(0, time);
        g.linearRampToValueAtTime(1, attackEnd);
        g.linearRampToValueAtTime(env.sustain, decayEnd);
    }

    // ------------------------------------------------------------------------
    // NOTE OFF
    // ------------------------------------------------------------------------
    noteOff(time = this.context.currentTime) {
        if (!this.active) return;
        this.active = false;

        const env = this.ampEnv;
        const g = this.graph.voiceBus.gain;

        g.cancelScheduledValues(time);
        g.setValueAtTime(g.value, time);
        g.linearRampToValueAtTime(0, time + env.release);

        // Stop oscillators after release
        this.oscillators.forEach(osc => {
            osc.stop(time + env.release + 0.01);
        });
    }

    // ------------------------------------------------------------------------
    // CLEANUP
    // ------------------------------------------------------------------------
    dispose() {
        this.oscillators.forEach(osc => {
            try { osc.disconnect(); } catch {}
        });

        Object.values(this.graph).forEach(node => {
            if (node && node.disconnect) {
                try { node.disconnect(); } catch {}
            }
        });
    }

    // ------------------------------------------------------------------------
    // HELPERS
    // ------------------------------------------------------------------------
    midiToFreq(m) {
        return 440 * Math.pow(2, (m - 69) / 12);
    }
}
