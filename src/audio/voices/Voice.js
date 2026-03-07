// ============================================================================
// src/audio/voices/Voice.js
// Schema‑driven per‑voice synthesizer voice.
// Creates oscillators on noteOn(), applies envelopes, smoothing, and
// preserves all anti‑click behavior from the legacy engine.
// ============================================================================

import { buildVoiceGraph } from "../graph/buildVoiceGraph.js";
import { applyVoiceModMatrix } from "../modulation/applyVoiceModMatrix.js";

export default class Voice {
    constructor(context, preset, note = null, velocity = 1.0) {
        this.context = context;
        this.preset = preset;

        this.note = note;
        this.velocity = velocity;

        this.active = false;
        this.startTime = null;

        // Oscillator instances created on noteOn()
        this.oscillators = [];

        // Build per‑voice graph directly
        this.graph = buildVoiceGraph(context, preset, new Map());

        // Final output
        this.output = this.graph.voiceBus;

        // Extract amp envelope
        this.ampEnv = this.getAmpEnvelope();

        // Validate preset
        this.validatePreset();
    }

    // --------------------------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------------------------
    validatePreset() {
        const oscModules = this.preset.modules.filter(m => m.type === "oscillator");
        if (oscModules.length === 0) {
            throw new Error("Preset must define at least one oscillator module.");
        }

        if (!this.ampEnv) {
            throw new Error("Preset must include an envelope module with id 'amp' or type 'envelope'.");
        }

        ["attack", "decay", "sustain", "release"].forEach(param => {
            if (typeof this.ampEnv[param] !== "number") {
                throw new Error(`Amp envelope missing required numeric field '${param}'.`);
            }
        });
    }

    // --------------------------------------------------------------------------
    // EXTRACT AMP ENVELOPE
    // --------------------------------------------------------------------------
    getAmpEnvelope() {
        const env = this.preset.modules.find(
            m => m.type === "envelope" && (m.id === "amp" || true)
        );
        return env ? env.parameters : null;
    }

    // --------------------------------------------------------------------------
    // NOTE ON
    // --------------------------------------------------------------------------
    noteOn(time = this.context.currentTime) {

        console.log("Voice.noteOn", this.note, "at", time);
        console.log("Voice.noteOn: VoiceBus gain at noteOn:", this.graph.voiceBus.gain.value);


        this.active = true;
        this.startTime = time;

        this.createOscillators(time);
        this.applyAmpEnvelope(time);

        // Apply modulation matrix
        applyVoiceModMatrix(
            this.context,
            this.preset,
            this.graph.modules,
            this.graph,
            time
        );
    }

    // --------------------------------------------------------------------------
    // CREATE OSCILLATORS (schema‑driven, anti‑click preserved)
    // --------------------------------------------------------------------------
    createOscillators(time) {
        console.log("Creating oscillators for note", this.note);

        const oscModules = this.preset.modules.filter(m => m.type === "oscillator");

        oscModules.forEach(oscDef => {
            const osc = this.context.createOscillator();

            // Waveform
            osc.type = oscDef.parameters.waveform;

            // Force numeric conversion (fixes tuning)
            const pitch = Number(oscDef.parameters.pitch) || 0;
            const detune = Number(oscDef.parameters.detune) || 0;

            const freq = this.midiToFreq(this.note + pitch);

            osc.frequency.setValueAtTime(freq, time);
            osc.detune.setValueAtTime(detune, time);

            // Micro‑delay start
            const startDelay = Number(oscDef.parameters.startDelay) || 0;
            const startAt = time + startDelay;

            // Correct module lookup
            const gainNode = this.graph.modules.get(oscDef.id);
            if (!gainNode) {
                console.warn("Missing gain node for oscillator", oscDef.id, this.graph.modules);
                throw new Error(`Voice graph missing gain node for oscillator '${oscDef.id}'.`);
            }

            osc.connect(gainNode);

            console.log("Osc connected →", oscDef.id, "startAt", startAt);

            osc.start(startAt);

            this.oscillators.push(osc);
        });
    }


    // --------------------------------------------------------------------------
    // APPLY AMP ENVELOPE (anti‑click preserved)
    // --------------------------------------------------------------------------
    applyAmpEnvelope(time) {
        const env = this.ampEnv;
        const g = this.graph.voiceBus.gain;

        const attackEnd = time + env.attack;
        const decayEnd = attackEnd + env.decay;

        g.cancelScheduledValues(time);
        g.setValueAtTime(0, time);

        g.linearRampToValueAtTime(1, attackEnd);
        g.linearRampToValueAtTime(env.sustain, decayEnd);

        // Diagnostic
        setTimeout(() => {
            console.log("VoiceBus gain after envelope:", this.graph.voiceBus.gain.value);
        }, 50);



    }

    // --------------------------------------------------------------------------
    // NOTE OFF (anti‑click preserved)
    // --------------------------------------------------------------------------
    noteOff(time = this.context.currentTime) {

        console.log("Voice.noteOff", this.note, "at", time);

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

    // --------------------------------------------------------------------------
    // CLEANUP
    // --------------------------------------------------------------------------
    dispose() {
        this.oscillators.forEach(osc => {
            try { osc.disconnect(); } catch { }
        });

        this.graph.allNodes.forEach(node => {
            try { node.disconnect(); } catch { }
        });
    }

    // --------------------------------------------------------------------------
    // HELPERS
    // --------------------------------------------------------------------------
    midiToFreq(m) {
        return 440 * Math.pow(2, (m - 69) / 12);
    }
}
