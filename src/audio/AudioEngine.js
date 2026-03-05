// src/audio/AudioEngine.js

import { VoiceAllocator } from "./voices/VoiceAllocator.js";
import { FXChain } from "./fx/FXChain.js";
import { validatePreset } from "../presets/validatePreset.js";
import { Sequencer } from "./sequencer/Sequencer.js";

const diagnosticPreset = {
    name: "Engine Diagnostic",
    maxVoices: 8,

    oscillators: [
        { type: "sine", detune: 0, gain: 0.5 }
    ],

    filters: [
        {
            type: "lowpass",
            cutoff: 800,
            resonance: 0.5,
            keytrack: 0.5
        }
    ],

    envelopes: {
        amp: { attack: 0.02, decay: 0.25, sustain: 0.7, release: 0.4 },
        filter: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.3, amount: 3000 },
        pitch: { attack: 0.0, decay: 0.1, sustain: 0.0, release: 0.0, amount: 20 }
    },

    lfo: [
        { target: "pitch", shape: "sine", rate: 5, amount: 10 },
        { target: "filterCutoff", shape: "triangle", rate: 0.8, amount: 500 }
    ],

    modMatrix: [
        { source: "lfo1",      target: "osc1.frequency",  amount: 10 },
        { source: "lfo2",      target: "filter1.cutoff",   amount: 500 },
        { source: "envFilter", target: "filter1.cutoff",   amount: 3000 },
        { source: "envPitch",  target: "osc1.frequency",   amount: 20 }
    ],

    fx: [
        { type: "delay", time: 0.25, feedback: 0.3, mix: 0.2 },
        { type: "reverb", mix: 0.15 }
    ]
};

export class AudioEngine {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.fxChain = null;
        this.voices = null;
        this.sequencer = null;

        this.currentPreset = null;
        this.defaultPreset = diagnosticPreset;

        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        this.context = new AudioContext();

        // Master output
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 1;
        this.masterGain.connect(this.context.destination);

        // Load preset
        this.currentPreset = this.currentPreset || this.defaultPreset;

        // Build FX chain
        this.buildFxChain();

        // Build voices
        this.voices = new VoiceAllocator(
            this.context,
            this.currentPreset,
            this.currentPreset.maxVoices || 8
        );

        // Connect allocator output to FX chain
        this.voices.output.connect(this.fxChain.input);

        this.sequencer = new Sequencer(this);

        this.initialized = true;
    }

    buildFxChain() {
        const presetFX = this.currentPreset.fx || [];

        this.fxChain = new FXChain(
            this.context,
            presetFX,
            this.reverbIR
        );

        this.fxChain.output.connect(this.masterGain);
    }

    noteOn(note, velocity = 1.0, time = this.context.currentTime) {
        if (!this.initialized) return;
        this.voices.noteOn(note, velocity, time);
    }

    noteOff(note, time = this.context.currentTime) {
        if (!this.initialized) return;
        this.voices.noteOff(note, time);
    }

    stopAllNotes() {
        if (!this.voices) return;
        this.voices.voices.forEach(v => v.stop());
        this.voices.activeNotes.clear();
    }

    loadPreset(preset) {
        if (!this.initialized) return;

        const { valid, errors, preset: cleaned } = validatePreset(preset);
        if (!valid) {
            console.error("Preset validation failed:", errors);
            return;
        }

        this.currentPreset = cleaned;

        this.stopAllNotes();

        this.voices = new VoiceAllocator(
            this.context,
            cleaned,
            cleaned.maxVoices || 8
        );

        this.voices.output.connect(this.fxChain.input);

        this.buildFxChain();
    }

    suspend() { return this.context.suspend(); }
    resume() { return this.context.resume(); }
}

export default AudioEngine;
