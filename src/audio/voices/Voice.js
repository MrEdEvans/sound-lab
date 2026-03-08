// ============================================================================
// src/audio/voices/Voice.js
// Per‑voice synthesizer voice with diagnostics.
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

        this.oscillators = [];

        this.graph = buildVoiceGraph(context, preset);
        this.output = this.graph.voiceMix;

        console.log(
            `%c[Voice] Created voice, voiceMix.gain node=`,
            "color:#0ff",
            this.graph.voiceMix.gain
        );

        this.ampEnv = this.getAmpEnvelope();
        this.validatePreset();
    }

    validatePreset() {
        const oscModules = this.preset.modules.filter(m => m.type === "oscillator");
        if (oscModules.length === 0) throw new Error("Preset must define at least one oscillator.");

        if (!this.ampEnv) throw new Error("Preset must include an amp envelope.");

        ["attack", "decay", "sustain", "release"].forEach(p => {
            if (typeof this.ampEnv[p] !== "number") {
                throw new Error(`Amp envelope missing numeric field '${p}'.`);
            }
        });
    }

    getAmpEnvelope() {
        const env = this.preset.modules.find(m => m.type === "envelope");
        return env ? env.parameters : null;
    }

    // --------------------------------------------------------------------------
    // NOTE ON
    // --------------------------------------------------------------------------
    noteOn(time = this.context.currentTime) {

        console.log("Voice.noteOn", this.note, "at", time);
        console.log("Voice.noteOn: VoiceMix gain at noteOn:", this.graph.voiceMix.gain.value);

        this.active = true;
        this.startTime = time;

        this.createOscillators(time);
        this.applyAmpEnvelope(time);

        applyVoiceModMatrix(
            this.context,
            this.preset,
            this.graph.modules,
            this.graph,
            time
        );

        console.log(
            `%c[Mod] voiceMix.gain after mod = ${this.graph.voiceMix.gain.value}`,
            "color:#f0f"
        );


        console.log(
            `%c[Voice] osc count=${this.oscillators.length}`,
            "color:#0af"
        );
    }

    // --------------------------------------------------------------------------
    // CREATE OSCILLATORS
    // --------------------------------------------------------------------------
    createOscillators(time) {
        console.log("Creating oscillators for note", this.note);

        const oscModules = this.preset.modules.filter(m => m.type === "oscillator");

        oscModules.forEach(oscDef => {
            const osc = this.context.createOscillator();

            const wf = oscDef.parameters.waveform;
            switch (wf) {
                case "saw": osc.type = "sawtooth"; break;
                case "square":
                case "sine":
                case "triangle": osc.type = wf; break;
                default: osc.type = "sine"; break;
            }

            const pitch = Number(oscDef.parameters.pitch) || 0;
            const detune = Number(oscDef.parameters.detune) || 0;

            const freq = this.midiToFreq(this.note + pitch);

            osc.frequency.setValueAtTime(freq, time);
            osc.detune.setValueAtTime(detune, time);

            const startDelay = Number(oscDef.parameters.startDelay) || 0.002;
            const startAt = time + startDelay;

            const gainNode = this.graph.modules.get(oscDef.id);
            if (!gainNode) throw new Error(`Missing gain node for oscillator '${oscDef.id}'.`);

            osc.connect(gainNode);

            console.log("Osc connected →", oscDef.id, "startAt", startAt);

            osc.start(startAt);

            this.oscillators.push(osc);
        });
    }

    // --------------------------------------------------------------------------
    // APPLY AMP ENVELOPE
    // --------------------------------------------------------------------------
    applyAmpEnvelope(time) {
        const env = this.ampEnv;
        const g = this.graph.voiceMix.gain;

        console.log(
            `[Env Params] attack=${env.attack} decay=${env.decay} sustain=${env.sustain} release=${env.release}`
        );

        console.log(
            `%c[Env] start gain=${g.value.toFixed(4)} at t=${time.toFixed(3)}`,
            "color:#0a0"
        );

        const startAt = time + 0.002;
        const attackEnd = startAt + env.attack;
        const decayEnd = attackEnd + env.decay;

        g.cancelScheduledValues(time);
        g.setValueAtTime(0, time);

        g.linearRampToValueAtTime(1, attackEnd);
        g.linearRampToValueAtTime(env.sustain, decayEnd);

        setTimeout(() => {
            console.log(
                `%c[Env] gain 100ms later=${this.graph.voiceMix.gain.value.toFixed(4)}`,
                "color:#aa0"
            );
        }, 100);

        setTimeout(() => {
            console.log("VoiceMix gain after envelope:", this.graph.voiceMix.gain.value);
        }, 50);
    }

    // --------------------------------------------------------------------------
    // NOTE OFF
    // --------------------------------------------------------------------------
    noteOff(time = this.context.currentTime) {

        console.log("Voice.noteOff", this.note, "at", time);

        if (!this.active) return;
        this.active = false;

        const env = this.ampEnv;
        const g = this.graph.voiceMix.gain;

        console.log(
            `%c[Env] release from gain=${g.value.toFixed(4)} at t=${time.toFixed(3)}`,
            "color:#a00"
        );

        g.cancelScheduledValues(time);
        g.setValueAtTime(g.value, time);
        g.linearRampToValueAtTime(0, time + env.release);

        const stopAt = time + env.release + 0.02;

        console.log(
            `%c[Osc] stopping ${this.oscillators.length} oscillators at t=${stopAt.toFixed(3)}`,
            "color:#f80"
        );

        this.oscillators.forEach(osc => {
            try { osc.stop(stopAt); } catch { }
        });

        this.oscillators = [];

        // ⭐ NEW: tell allocator when release is done
        const releaseDoneAt = time + env.release;
        setTimeout(() => {
            if (this.onReleaseComplete) {
                this.onReleaseComplete();
            }
        }, env.release * 1000);

        setTimeout(() => {
            console.log(
                `%c[Voice] peak gain after note=${this.graph.voiceMix.gain.value.toFixed(4)}`,
                "color:#fa0"
            );
        }, 10);
    }


    dispose() {
        this.oscillators.forEach(osc => { try { osc.disconnect(); } catch { } });
        this.graph.allNodes.forEach(node => { try { node.disconnect(); } catch { } });
    }

    midiToFreq(m) {
        return 440 * Math.pow(2, (m - 69) / 12);
    }
}
