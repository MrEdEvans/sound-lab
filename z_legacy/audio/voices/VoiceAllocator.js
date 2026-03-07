// src/audio/voices/VoiceAllocator.js

import { Voice } from "./Voice.js";

export class VoiceAllocator {
    constructor(context, preset) {
        this.context = context;
        this.preset = preset;
        this.maxVoices = preset.maxVoices;

        this.voices = [];
        this.activeVoices = new Map();   // note → voice
        this.releasingVoices = new Set();

        this.buildVoices();
    }

    buildVoices() {
        this.voices = [];
        for (let i = 0; i < this.maxVoices; i++) {
            this.voices.push(new Voice(this.context, this.preset));
        }
    }

    applyPreset(preset) {
        this.stopAll();
        this.preset = preset;
        this.maxVoices = preset.maxVoices || this.maxVoices;
        this.buildVoices();
        this.activeVoices.clear();
        this.releasingVoices.clear();
    }

    // ------------------------------------------------------------
    // A voice is only free if its gain is actually silent
    // ------------------------------------------------------------
    isSilent(voice) {
        const g = voice.ampGain.gain.value;
        return g < 0.0001;   // effectively zero
    }

    // ------------------------------------------------------------
    // Find a truly free voice (silent)
    // ------------------------------------------------------------
    findFreeVoice() {
        return this.voices.find(v => this.isSilent(v));
    }

    // ------------------------------------------------------------
    // Steal the quietest voice (never steal a loud one)
    // ------------------------------------------------------------
    stealVoice() {
        let quietest = null;
        let minGain = Infinity;

        for (const v of this.voices) {
            const g = v.ampGain.gain.value;
            if (g < minGain) {
                minGain = g;
                quietest = v;
            }
        }

        // Hard fade-out to silence before reuse
        this.forceSilent(quietest);

        return quietest;
    }

    // ------------------------------------------------------------
    // Force a voice to silence immediately (no reuse clicks)
    // ------------------------------------------------------------
    forceSilent(voice) {
        const now = this.context.currentTime;
        const g = voice.ampGain.gain;

        g.cancelScheduledValues(now);
        g.setValueAtTime(g.value, now);
        g.linearRampToValueAtTime(0, now + 0.005); // 5ms fade
    }

    // ------------------------------------------------------------
    // NOTE ON
    // ------------------------------------------------------------
    noteOn(note, velocity = 1, time = this.context.currentTime) {
        // Retrigger same note
        if (this.activeVoices.has(note)) {
            const voice = this.activeVoices.get(note);
            voice.noteOn(note, velocity, time);
            return;
        }

        // Find a silent voice
        let voice = this.findFreeVoice();

        // If none silent, steal the quietest
        if (!voice) {
            voice = this.stealVoice();
        }

        // Trigger
        voice.noteOn(note, velocity, time);
        this.activeVoices.set(note, voice);
    }

    // ------------------------------------------------------------
    // NOTE OFF
    // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    // STOP ALL
    // ------------------------------------------------------------
    stopAll() {
        this.voices.forEach(v => v.stop());
        this.activeVoices.clear();
        this.releasingVoices.clear();
    }
}
