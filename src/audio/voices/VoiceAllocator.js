// src/audio/voices/VoiceAllocator.js

import { Voice } from "./Voice.js";

export class VoiceAllocator {
    constructor(context, preset) {
        this.context = context;
        this.preset = preset;
        this.maxVoices = preset.maxVoices || 16;

        this.voices = [];
        this.activeVoices = new Map();
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
        this.preset = preset;
        this.maxVoices = preset.maxVoices || this.maxVoices;

        this.stopAll();
        this.buildVoices();
    }

    noteOn(note, velocity, time) {
        // If note is already active, retrigger the same voice
        if (this.activeVoices.has(note)) {
            const voice = this.activeVoices.get(note);
            voice.noteOn(note, velocity, time);
            return;
        }

        const voice = this.findFreeVoice() || this.stealVoice();

        if (!voice) return;

        this.activeVoices.set(note, voice);
        voice.noteOn(note, velocity, time);
    }

    noteOff(note, time) {
        const voice = this.activeVoices.get(note);
        if (!voice) return;

        voice.noteOff(time);
        this.activeVoices.delete(note);
        this.releasingVoices.add(voice);

        // Cleanup after release tail
        setTimeout(() => {
            if (!voice.active) {
                this.releasingVoices.delete(voice);
            }
        }, 2000);
    }

    findFreeVoice() {
        return this.voices.find(v => !v.active && !v.releasing);
    }

    stealVoice() {
        // Prefer stealing the oldest releasing voice
        for (const voice of this.releasingVoices) {
            this.releasingVoices.delete(voice);
            return voice;
        }

        // Otherwise steal the oldest active voice
        for (const voice of this.voices) {
            if (voice.active) {
                return voice;
            }
        }

        return null;
    }

    stopAll() {
        this.voices.forEach(v => v.stopAll());
        this.activeVoices.clear();
        this.releasingVoices.clear();
    }
}
