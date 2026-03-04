// src/audio/AudioEngine.js

import { VoiceAllocator } from "./voices/VoiceAllocator.js";
import { AudioScheduler } from "./scheduler/AudioScheduler.js";
import { FXChain } from "./fx/FXChain.js";

export class AudioEngine {
    constructor() {
        this.context = null;
        this.scheduler = null;

        this.fxBus = null;
        this.masterGain = null;

        this.voices = null;
        this.currentPreset = null;

        this.initialized = false;
    }

    async init(preset) {
        if (this.initialized) return;

        this.context = new AudioContext();
        this.scheduler = new AudioScheduler(this.context);

        // Global FX bus
        this.fxBus = this.context.createGain();
        this.fxBus.gain.value = 1;

        // Master output
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 1;

        // Wire FX → master → destination
        this.fxBus.connect(this.masterGain);
        this.masterGain.connect(this.context.destination);

        // Build FX chain (placeholder)
        this.buildFxChain();

        // Voices
        this.currentPreset = preset;
        this.voices = new VoiceAllocator(this.context, preset);

        // Connect each voice to the FX bus
        this.voices.voices.forEach(voice => {
            voice.graph.voiceBus.connect(this.fxBus);
        });

        this.initialized = true;
    }


    buildFxChain() {
        const presetFX = this.currentPreset.fx || [];

        this.fxChain = new FXChain(
            this.context,
            presetFX,
            this.reverbIR // optional impulse buffer
        );

        this.fxBus.connect(this.fxChain.input);
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

    setParam(path, value, time = this.context.currentTime) {
        if (!this.initialized) return;
        this.scheduler.scheduleParam(path, value, time);
    }

    loadPreset(preset) {
        if (!this.initialized) return;

        this.currentPreset = preset;

        this.voices.stopAll();
        this.voices.applyPreset(preset);

        // Reconnect voices to FX bus
        this.voices.voices.forEach(voice => {
            voice.graph.voiceBus.connect(this.fxBus);
        });
    }

    suspend() {
        return this.context.suspend();
    }

    resume() {
        return this.context.resume();
    }
}
