// ============================================================================
// src/audio/voices/VoiceAllocator.js
// Manages polyphony, voice stealing, release tracking, and click‑free reuse.
// ============================================================================

import Voice from "./Voice.js";

export class VoiceAllocator {
    constructor(context, preset) {
        this.context = context;
        this.preset = preset;

        this.maxVoices = preset.engine?.polyphony || 8;

        this.voices = [];
        this.activeVoices = new Map();    // note → voice
        this.releasingVoices = new Set(); // voices currently in release

        this.buildVoices();
    }

    // --------------------------------------------------------------------------
    // BUILD VOICES
    // --------------------------------------------------------------------------
    buildVoices() {
        this.voices = [];

        for (let i = 0; i < this.maxVoices; i++) {
            const v = new Voice(this.context, this.preset, null, 0);
            console.log(
                `%c[Allocator] Built voice ${i}, voiceBus.gain=`,
                "color:#0ff",
                v.graph.voiceBus.gain
            );
            this.voices.push(v);
        }
    }

    // --------------------------------------------------------------------------
    // STATE HELPERS
    // --------------------------------------------------------------------------
    isActive(voice) {
        for (const v of this.activeVoices.values()) {
            if (v === voice) return true;
        }
        return false;
    }

    isReleasing(voice) {
        return this.releasingVoices.has(voice);
    }

    isFree(voice) {
        return !this.isActive(voice) && !this.isReleasing(voice);
    }

    // --------------------------------------------------------------------------
    // Find a free voice
    // --------------------------------------------------------------------------
    findFreeVoice() {
        return this.voices.find(v => this.isFree(v));
    }

    // --------------------------------------------------------------------------
    // Steal the quietest active voice
    // --------------------------------------------------------------------------
    stealVoice() {
        // 1. Prefer stealing a releasing voice
        for (const v of this.voices) {
            if (this.isReleasing(v)) {
                console.log(`[Allocator] Stealing releasing voice ${this.voices.indexOf(v)}`);
                this.forceSilent(v);
                return v;
            }
        }

        // 2. Otherwise steal the quietest active voice
        let quietest = null;
        let minGain = Infinity;

        for (const v of this.voices) {
            if (!this.isActive(v)) continue;

            const g = v.graph.voiceMix.gain.value; // FIX
            if (g < minGain) {
                minGain = g;
                quietest = v;
            }
        }

        console.log(
            `[Allocator] Stealing active voice ${this.voices.indexOf(quietest)} (gain=${minGain})`
        );

        this.forceSilent(quietest);
        return quietest;
    }


    // --------------------------------------------------------------------------
    // Force a voice silent
    // --------------------------------------------------------------------------
    forceSilent(voice) {
        const now = this.context.currentTime;
        const g = voice.graph.voiceMix.gain;

        g.cancelScheduledValues(now);
        g.setValueAtTime(g.value, now);
        g.linearRampToValueAtTime(0, now + 0.005);
    }

    // --------------------------------------------------------------------------
    // NOTE ON
    // --------------------------------------------------------------------------
    noteOn(note, velocity = 1.0, time = this.context.currentTime) {

        if (this.activeVoices.has(note)) {
            const voice = this.activeVoices.get(note);
            console.log(
                `%c[Allocator] noteOn (retrigger) ${note} → voice ${this.voices.indexOf(voice)}`,
                "color:#4af"
            );
            voice.note = note;
            voice.velocity = velocity;
            voice.noteOn(time);
            return;
        }

        let voice = this.findFreeVoice();
        if (!voice) voice = this.stealVoice();

        this.releasingVoices.delete(voice);

        voice.note = note;
        voice.velocity = velocity;

        console.log(
            `%c[Allocator] noteOn ${note} → voice ${this.voices.indexOf(voice)}`,
            "color:#4af"
        );

        voice.noteOn(time);

        this.activeVoices.set(note, voice);
    }

    // --------------------------------------------------------------------------
    // NOTE OFF
    // --------------------------------------------------------------------------
    noteOff(note, time = this.context.currentTime) {
        const voice = this.activeVoices.get(note);
        if (!voice) return;

        console.log(
            `%c[Allocator] noteOff ${note} → voice ${this.voices.indexOf(voice)}`,
            "color:#48f"
        );

        voice.noteOff(time);

        this.activeVoices.delete(note);
        this.releasingVoices.add(voice);

        voice.onReleaseComplete = () => {
            this.releasingVoices.delete(voice);
        };
    }

    // --------------------------------------------------------------------------
    // STOP ALL
    // --------------------------------------------------------------------------
    stopAll() {
        const now = this.context.currentTime;

        for (const v of this.voices) {
            try { v.noteOff(now); } catch { }
        }

        this.activeVoices.clear();
        this.releasingVoices.clear();
    }
}
