// ============================================================================
// src/audio/voices/VoiceAllocator.js
// Cross‑browser safe version — no getValueAtTime(), tracks gain manually.
// ============================================================================

import Voice from "./Voice.js";

export class VoiceAllocator {
    constructor(context, preset) {
        this.context = context;
        this.preset = preset;

        this.maxVoices = preset.engine?.polyphony || 8;

        this.voices = [];
        this.activeVoices = new Map();
        this.releasingVoices = new Set();

        this.buildVoices();
    }

    // --------------------------------------------------------------------------
    // BUILD VOICES
    // --------------------------------------------------------------------------
    buildVoices() {
        this.voices = [];

        for (let i = 0; i < this.maxVoices; i++) {
            const v = new Voice(this.context, this.preset, null, 0);

            // Track gain manually (cross‑browser)
            v.currentGain = 0;

            console.log(
                `%c[Allocator] Built voice ${i}, voiceMix.gain=`,
                "color:#0ff",
                v.graph.voiceMix.gain
            );

            this.voices.push(v);
        }

        this.dumpState("After buildVoices()");
    }

    // --------------------------------------------------------------------------
    // STATE HELPERS
    // --------------------------------------------------------------------------
    isActive(voice) {
        return [...this.activeVoices.values()].includes(voice);
    }

    isReleasing(voice) {
        return this.releasingVoices.has(voice);
    }

    isTrulyFree(voice) {
        return (
            !this.isActive(voice) &&
            !this.isReleasing(voice) &&
            voice.oscillators.length === 0 &&
            voice.currentGain === 0
        );
    }

    // --------------------------------------------------------------------------
    // DIAGNOSTICS
    // --------------------------------------------------------------------------
    dumpState(label = "") {
        console.log(`%c=== VoiceAllocator State ${label} ===`, "color:#fa0");

        this.voices.forEach((v, i) => {
            const state = this.isActive(v)
                ? "ACTIVE"
                : this.isReleasing(v)
                    ? "RELEASING"
                    : this.isTrulyFree(v)
                        ? "FREE"
                        : "BUSY";

            console.log(
                `Voice ${i}: ${state}, note=${v.note}, vel=${v.velocity}, gain=${v.currentGain.toFixed(4)}, osc=${v.oscillators.length}`
            );
        });

        console.log("Active voices:", this.activeVoices);
        console.log("Releasing voices:", this.releasingVoices);
        console.log("%c=============================", "color:#fa0");
    }

    // --------------------------------------------------------------------------
    // Find a truly free voice
    // --------------------------------------------------------------------------
    findFreeVoice() {
        const v = this.voices.find(v => this.isTrulyFree(v));
        console.log(
            `%c[Allocator] findFreeVoice → ${v ? this.voices.indexOf(v) : "none"}`,
            "color:#8f8"
        );
        return v || null;
    }

    // --------------------------------------------------------------------------
    // Steal an ACTIVE voice (polyphonic mode)
    // --------------------------------------------------------------------------
    stealActiveVoice() {
        console.log("%c[Allocator] stealActiveVoice() called", "color:#f44");

        let quietest = null;
        let minGain = Infinity;

        for (const v of this.voices) {
            if (!this.isActive(v)) continue;

            const g = v.currentGain;
            const idx = this.voices.indexOf(v);

            console.log(`[Allocator] Active voice ${idx} gain=${g.toFixed(4)}`);

            if (g < minGain) {
                minGain = g;
                quietest = v;
            }
        }

        if (!quietest) return null;

        const idx = this.voices.indexOf(quietest);
        console.log(
            `%c[Allocator] Insufficient voices. Stealing ACTIVE voice ${idx}.`,
            "color:#f84"
        );

        const t = this.context.currentTime;

        // Remove from active map
        for (const [note, v] of this.activeVoices.entries()) {
            if (v === quietest) {
                this.activeVoices.delete(note);
                break;
            }
        }

        // Cleanup
        this.forceSilent(quietest, t);
        quietest.killAllOscillators(t);
        quietest.resetEnvelope(t);

        quietest.currentGain = 0;

        return quietest;
    }

    // --------------------------------------------------------------------------
    // Force a voice silent
    // --------------------------------------------------------------------------
    forceSilent(voice, time = this.context.currentTime) {
        const g = voice.graph.voiceMix.gain;

        console.log(
            `%c[Allocator] forceSilent voice ${this.voices.indexOf(voice)}, gain=${voice.currentGain}`,
            "color:#f0a"
        );

        g.cancelScheduledValues(time);
        g.setValueAtTime(voice.currentGain, time);
        g.linearRampToValueAtTime(0, time + 0.005);

        voice.currentGain = 0;
    }

    // --------------------------------------------------------------------------
    // NOTE ON
    // --------------------------------------------------------------------------
    noteOn(note, velocity = 1.0, time = this.context.currentTime) {
        console.log(
            `%c[Allocator] noteOn(${note}) t=${time.toFixed(3)} vel=${velocity}`,
            "color:#4af"
        );

        // Retrigger same note
        if (this.activeVoices.has(note)) {
            const voice = this.activeVoices.get(note);
            voice.note = note;
            voice.velocity = velocity;
            voice.noteOn(time);
            this.dumpState("After noteOn (retrigger)");
            return;
        }

        // 1. Try free voice
        let voice = this.findFreeVoice();

        // 2. Try stealing an ACTIVE voice (polyphonic mode)
        if (!voice) voice = this.stealActiveVoice();

        // 3. MONO MODE: always steal the single voice
        if (!voice && this.maxVoices === 1) {
            const v = this.voices[0];

            console.log(
                "%c[Allocator] Polyphony=1. Stealing the only voice.",
                "color:#f84"
            );

            const t = time;

            this.activeVoices.clear();
            this.releasingVoices.delete(v);

            this.forceSilent(v, t);
            v.killAllOscillators(t);

            v.currentGain = 0;

            voice = v;
        }

        // 4. Emergency fallback: all voices releasing (polyphony > 1)
        if (!voice) {
            const releasing = [...this.releasingVoices][0];
            if (releasing) {
                console.log(
                    "%c[Allocator] All voices releasing. Stealing RELEASING voice.",
                    "color:#f84"
                );

                const t = time;

                this.releasingVoices.delete(releasing);

                this.forceSilent(releasing, t);
                releasing.killAllOscillators(t);
                releasing.resetEnvelope(t);

                releasing.currentGain = 0;

                voice = releasing;
            }
        }

        if (!voice) {
            console.log(
                "%c[Allocator] noteOn: no voice available. Dropping note.",
                "color:#f00"
            );
            return;
        }

        // Use the chosen voice
        voice.note = note;
        voice.velocity = velocity;

        voice.noteOn(time);

        // Voice.noteOn() will schedule gain ramps — we track manually
        voice.currentGain = 0;

        this.activeVoices.set(note, voice);

        this.dumpState("After noteOn");
    }

    // --------------------------------------------------------------------------
    // NOTE OFF
    // --------------------------------------------------------------------------
    noteOff(note, time = this.context.currentTime) {
        console.log(
            `%c[Allocator] noteOff(${note}) t=${time.toFixed(3)}`,
            "color:#48f"
        );

        const voice = this.activeVoices.get(note);
        if (!voice) {
            console.log("[Allocator] noteOff ignored (no active voice for note)", note);
            return;
        }

        voice.noteOff(time);

        this.activeVoices.delete(note);
        this.releasingVoices.add(voice);

        voice.onReleaseComplete = () => {
            voice.currentGain = 0;
            this.releasingVoices.delete(voice);
            this.dumpState("After release complete");
            voice.onReleaseComplete = null;
        };

        this.dumpState("After noteOff");
    }

    // --------------------------------------------------------------------------
    // STOP ALL
    // --------------------------------------------------------------------------
    stopAll() {
        console.log("%c[Allocator] stopAll()", "color:#f00");

        const now = this.context.currentTime;

        for (const v of this.voices) {
            try { v.noteOff(now); } catch { }
            v.currentGain = 0;
        }

        this.activeVoices.clear();
        this.releasingVoices.clear();

        this.dumpState("After stopAll");
    }
}
