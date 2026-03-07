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
        this.activeVoices = new Map();   // note → voice
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
            this.voices.push(v);
        }
    }

    // --------------------------------------------------------------------------
    // STATE HELPERS
    // --------------------------------------------------------------------------
    isActive(voice) {
        // any map value equal to this voice
        for (const v of this.activeVoices.values()) {
            if (v === voice) return true;
        }
        return false;
    }

    isReleasing(voice) {
        return this.releasingVoices.has(voice);
    }

    // A voice is free only when it is neither active nor releasing
    isFree(voice) {
        return !this.isActive(voice) && !this.isReleasing(voice);
    }

    // --------------------------------------------------------------------------
    // Find a free voice (never reuse a releasing voice)
    // --------------------------------------------------------------------------
    findFreeVoice() {
        return this.voices.find(v => this.isFree(v));
    }

    // --------------------------------------------------------------------------
    // Steal the quietest *active* voice (as a last resort)
    // --------------------------------------------------------------------------
    stealVoice() {
        let quietest = null;
        let minGain = Infinity;

        for (const v of this.voices) {
            if (!this.isActive(v)) continue; // only steal from active voices

            const g = v.graph.voiceBus.gain.value;
            if (g < minGain) {
                minGain = g;
                quietest = v;
            }
        }

        // If somehow none are active (edge case), fall back to any non‑releasing voice
        if (!quietest) {
            quietest = this.voices.find(v => !this.isReleasing(v)) || this.voices[0];
        }

        this.forceSilent(quietest);
        return quietest;
    }

    // --------------------------------------------------------------------------
    // Force a voice to silence with a 5ms fade
    // --------------------------------------------------------------------------
    forceSilent(voice) {
        const now = this.context.currentTime;
        const g = voice.graph.voiceBus.gain;

        g.cancelScheduledValues(now);
        g.setValueAtTime(g.value, now);
        g.linearRampToValueAtTime(0, now + 0.005);
    }

    // --------------------------------------------------------------------------
    // NOTE ON
    // --------------------------------------------------------------------------
    noteOn(note, velocity = 1.0, time = this.context.currentTime) {
        // Retrigger same note if already active
        if (this.activeVoices.has(note)) {
            const voice = this.activeVoices.get(note);
            voice.note = note;
            voice.velocity = velocity;
            voice.noteOn(time);
            return;
        }

        // Find a truly free voice (not active, not releasing)
        let voice = this.findFreeVoice();

        // If none free, steal the quietest active voice
        if (!voice) {
            voice = this.stealVoice();
        }

        // This voice is now active
        this.releasingVoices.delete(voice);

        voice.note = note;
        voice.velocity = velocity;
        voice.noteOn(time);

        this.activeVoices.set(note, voice);
    }

    // --------------------------------------------------------------------------
    // NOTE OFF
    // --------------------------------------------------------------------------
    noteOff(note, time = this.context.currentTime) {
        const voice = this.activeVoices.get(note);
        if (!voice) return;

        voice.noteOff(time);

        this.activeVoices.delete(note);
        this.releasingVoices.add(voice);

        voice.onReleaseComplete = () => {
            this.releasingVoices.delete(voice);
            // At this point, voice is fully free and eligible for reuse
        };
    }

    // --------------------------------------------------------------------------
    // STOP ALL
    // --------------------------------------------------------------------------
    stopAll() {
        const now = this.context.currentTime;

        for (const v of this.voices) {
            try {
                v.noteOff(now);
            } catch {
                // ignore
            }
        }

        this.activeVoices.clear();
        this.releasingVoices.clear();
    }
}
