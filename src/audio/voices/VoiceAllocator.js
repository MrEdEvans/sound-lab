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
            this.voices.push(v);
        }
    }

    // --------------------------------------------------------------------------
    // APPLY NEW PRESET
    // --------------------------------------------------------------------------
    applyPreset(preset) {
        this.stopAll();

        this.preset = preset;
        this.maxVoices = preset.engine?.polyphony || this.maxVoices;

        this.buildVoices();
        this.activeVoices.clear();
        this.releasingVoices.clear();
    }

    // --------------------------------------------------------------------------
    // A voice is free only when its gain is silent
    // --------------------------------------------------------------------------
    isSilent(voice) {
        const g = voice.graph.voiceBus.gain.value;
        return g < 0.0001;
    }

    // --------------------------------------------------------------------------
    // Find a free (silent) voice
    // --------------------------------------------------------------------------
    findFreeVoice() {
        return this.voices.find(v => this.isSilent(v));
    }

    // --------------------------------------------------------------------------
    // Steal the quietest voice
    // --------------------------------------------------------------------------
    stealVoice() {
        let quietest = null;
        let minGain = Infinity;

        for (const v of this.voices) {
            const g = v.graph.voiceBus.gain.value;
            if (g < minGain) {
                minGain = g;
                quietest = v;
            }
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
        // Retrigger same note
        if (this.activeVoices.has(note)) {
            const voice = this.activeVoices.get(note);
            voice.note = note;
            voice.velocity = velocity;
            voice.noteOn(time);
            return;
        }

        // Find a silent voice
        let voice = this.findFreeVoice();

        // If none silent, steal the quietest
        if (!voice) {
            voice = this.stealVoice();
        }

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
        };
    }

    // --------------------------------------------------------------------------
    // STOP ALL
    // --------------------------------------------------------------------------
    stopAll() {
        for (const v of this.voices) {
            try { v.noteOff(this.context.currentTime); } catch { }
        }

        this.activeVoices.clear();
        this.releasingVoices.clear();
    }
}
