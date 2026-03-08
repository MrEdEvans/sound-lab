// ============================================================================
// src/audio/voices/Voice.js
// Per‑voice synthesizer voice with diagnostics + invariants.
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

        // IMPORTANT: ensure voice starts silent
        const g = this.graph.voiceMix.gain;
        g.setValueAtTime(0, this.context.currentTime);

        console.log(
            `%c[Voice] Created voice, voiceMix.gain=`,
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
    // INVARIANT HELPERS
    // --------------------------------------------------------------------------
    killAllOscillators(time = this.context.currentTime) {
        if (this.oscillators.length > 0) {
            console.log(
                `%c[Voice] killAllOscillators (${this.oscillators.length}) at t=${time.toFixed(3)}`,
                "color:#f80"
            );
        }
        this.oscillators.forEach(osc => {
            try { osc.stop(time); } catch { }
        });
        this.oscillators = [];
    }

    resetEnvelope(time = this.context.currentTime) {
        const g = this.graph.voiceMix.gain;
        console.log(
            `%c[Voice] resetEnvelope at t=${time.toFixed(3)} (gain was ${g.value.toFixed(4)})`,
            "color:#0aa"
        );
        g.cancelScheduledValues(time);
        g.setValueAtTime(0, time);
    }

    // --------------------------------------------------------------------------
    // NOTE ON
    // --------------------------------------------------------------------------
    noteOn(time = this.context.currentTime) {
        const g = this.graph.voiceMix.gain;

        // Invariant: no leftover oscillators or envelope when reusing a voice
        this.killAllOscillators(time);
        this.resetEnvelope(time);

        console.log(
            `%c[Voice] noteOn note=${this.note} t=${time.toFixed(3)} gain=${g.value.toFixed(4)}`,
            "color:#4af"
        );

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
            `%c[Voice] osc count=${this.oscillators.length}`,
            "color:#0af"
        );
    }

    // --------------------------------------------------------------------------
    // CREATE OSCILLATORS
    // --------------------------------------------------------------------------
    createOscillators(time) {
        console.log(
            `%c[Voice] Creating oscillators for note ${this.note}`,
            "color:#0cf"
        );

        const oscModules = this.preset.modules.filter(m => m.type === "oscillator");

        oscModules.forEach(oscDef => {
            const osc = this.context.createOscillator();

            const wf = oscDef.parameters.waveform;
            osc.type = wf === "saw" ? "sawtooth" : wf;

            const pitch = Number(oscDef.parameters.pitch) || 0;
            const detune = Number(oscDef.parameters.detune) || 0;
            const freq = this.midiToFreq(this.note + pitch);

            const startDelay = Number(oscDef.parameters.startDelay) || 0.002;
            const startAt = time + startDelay;

            const gainNode = this.graph.modules.get(oscDef.id);
            if (!gainNode) {
                throw new Error(`Missing gain node for oscillator '${oscDef.id}'.`);
            }

            console.log(
                `%c[Voice] Osc → id=${oscDef.id} wf=${osc.type} freq=${freq.toFixed(
                    2
                )} detune=${detune} startAt=${startAt.toFixed(3)}`,
                "color:#0cf"
            );

            osc.frequency.setValueAtTime(freq, time);
            osc.detune.setValueAtTime(detune, time);

            osc.connect(gainNode);
            osc.start(startAt);

            this.oscillators.push(osc);
        });
    }

    // --------------------------------------------------------------------------
    // APPLY AMP ENVELOPE (on voiceMix.gain)
    // --------------------------------------------------------------------------
    applyAmpEnvelope(time) {
        const env = this.ampEnv;
        const g = this.graph.voiceMix.gain;

        console.log(
            `%c[Env] ADSR A=${env.attack} D=${env.decay} S=${env.sustain} R=${env.release}`,
            "color:#0a0"
        );
        console.log(
            `%c[Env] start gain=${g.value.toFixed(4)} t=${time.toFixed(3)}`,
            "color:#0a0"
        );

        const startAt = time + 0.002;
        const attackEnd = startAt + env.attack;
        const decayEnd = attackEnd + env.decay;

        console.log(
            `[Env] schedule startAt=${startAt.toFixed(3)} attackEnd=${attackEnd.toFixed(
                3
            )} decayEnd=${decayEnd.toFixed(3)}`
        );

        g.cancelScheduledValues(time);
        g.setValueAtTime(0, time);

        g.linearRampToValueAtTime(1, attackEnd);
        g.linearRampToValueAtTime(env.sustain, decayEnd);

        setTimeout(() => {
            console.log(
                `%c[Env] gain @attackEnd≈${g.value.toFixed(4)}`,
                "color:#aa0"
            );
        }, env.attack * 1000);

        setTimeout(() => {
            console.log(
                `%c[Env] gain @decayEnd≈${g.value.toFixed(4)}`,
                "color:#aa0"
            );
        }, (env.attack + env.decay) * 1000);

        setTimeout(() => {
            console.log(
                `%c[Env] gain 100ms later=${g.value.toFixed(4)}`,
                "color:#aa0"
            );
        }, 100);
    }

    // --------------------------------------------------------------------------
    // NOTE OFF
    // --------------------------------------------------------------------------
    noteOff(time = this.context.currentTime) {
        const g = this.graph.voiceMix.gain;

        console.log(
            `%c[Voice] noteOff note=${this.note} t=${time.toFixed(3)} gain=${g.value.toFixed(4)}`,
            "color:#f44"
        );

        if (!this.active) {
            console.log("[Voice] noteOff ignored (not active)");
            return;
        }

        this.active = false;

        const env = this.ampEnv;

        console.log(
            `%c[Env] release from gain=${g.value.toFixed(4)} t=${time.toFixed(3)}`,
            "color:#a00"
        );

        g.cancelScheduledValues(time);
        g.setValueAtTime(g.value, time);
        g.linearRampToValueAtTime(0, time + env.release);

        const stopAt = time + env.release + 0.02;

        console.log(
            `%c[Voice] stopping ${this.oscillators.length} osc at t=${stopAt.toFixed(3)}`,
            "color:#f80"
        );

        this.oscillators.forEach(osc => {
            try { osc.stop(stopAt); } catch { }
        });
        this.oscillators = [];

        // Notify allocator when release is done
        setTimeout(() => {
            console.log(
                `%c[Voice] release complete, gain=${g.value.toFixed(4)}`,
                "color:#0f0"
            );
            if (this.onReleaseComplete) this.onReleaseComplete();
        }, env.release * 1000);

        setTimeout(() => {
            console.log(
                `%c[Voice] gain after note=${g.value.toFixed(4)}`,
                "color:#fa0"
            );
        }, 10);
    }

    dispose() {
        this.killAllOscillators();
        this.graph.allNodes.forEach(node => { try { node.disconnect(); } catch { } });
    }

    midiToFreq(m) {
        return 440 * Math.pow(2, (m - 69) / 12);
    }
}
