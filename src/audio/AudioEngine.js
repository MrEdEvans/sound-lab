// ============================================================================
// src/audio/AudioEngine.js
// Schema‑driven modular synthesizer engine.
// Coordinates voices, global FX, routing, modulation, and preset loading.
// ============================================================================

import { buildGlobalGraph } from "./graph/buildGlobalGraph.js";
import { VoiceAllocator } from "./voices/VoiceAllocator.js";

export default class AudioEngine {
    constructor() {
        this.context = null;
        this.masterGain = null;

        this.voiceAllocator = null;
        this.globalGraph = null;

        this.currentPreset = null;
        this.initialized = false;
    }

    // --------------------------------------------------------------------------
    // INITIALIZE AUDIO ENGINE
    // --------------------------------------------------------------------------
    async init(preset) {
        if (this.initialized) return;

        this.context = new AudioContext();

        // Master output
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 1.0;
        this.masterGain.connect(this.context.destination);

        // TEMP: sanity beep
        const testOsc = this.context.createOscillator();
        testOsc.frequency.value = 440;
        testOsc.connect(this.masterGain);
        testOsc.start(this.context.currentTime + 0.05);
        testOsc.stop(this.context.currentTime + 0.25);

        // Load preset
        this.currentPreset = preset;

        // Build voices
        this.voiceAllocator = new VoiceAllocator(this.context, this.currentPreset);

        // Build global FX chain
        this.buildGlobalFX();

        this.initialized = true;
    }

    // --------------------------------------------------------------------------
    // BUILD GLOBAL FX CHAIN
    // --------------------------------------------------------------------------
    buildGlobalFX() {
        // 1. Sum per‑voice *post‑envelope* outputs (voiceBus)
        const voiceBusSum = this.context.createGain();
        voiceBusSum.gain.value = 1.0;

        for (const voice of this.voiceAllocator.voices) {
            if (!voice.graph || !voice.graph.voiceBus) {
                console.warn("[AudioEngine] Voice missing voiceBus in graph:", voice);
                continue;
            }
            voice.graph.voiceBus.connect(voiceBusSum);
        }

        // 2. Build global FX graph from summed voiceBus
        this.globalGraph = buildGlobalGraph(
            this.context,
            this.currentPreset,
            voiceBusSum
        );

        // 3. Connect global output → master
        this.globalGraph.output.connect(this.masterGain);

        // 4. Diagnostics
        console.log(
            "%c[AudioEngine] Global FX built. Input = summed voiceBus, Output → masterGain",
            "color:#0af"
        );
    }


    // --------------------------------------------------------------------------
    // LOAD NEW PRESET
    // --------------------------------------------------------------------------
    loadPreset(preset) {
        if (!this.initialized) return;

        this.currentPreset = preset;

        // Stop all voices before rebuilding
        this.voiceAllocator.stopAll();

        // Rebuild voice allocator with new preset
        this.voiceAllocator = new VoiceAllocator(this.context, this.currentPreset);

        // Rebuild global FX
        this.buildGlobalFX();
    }

    // --------------------------------------------------------------------------
    // NOTE ON
    // --------------------------------------------------------------------------
    noteOn(note, velocity = 1.0, time = this.context.currentTime) {
        if (!this.initialized) return;
        this.voiceAllocator.noteOn(note, velocity, time);
    }

    // --------------------------------------------------------------------------
    // NOTE OFF
    // --------------------------------------------------------------------------
    noteOff(note, time = this.context.currentTime) {
        if (!this.initialized) return;
        this.voiceAllocator.noteOff(note, time);
    }

    // --------------------------------------------------------------------------
    // STOP ALL NOTES
    // --------------------------------------------------------------------------
    stopAll() {
        if (!this.voiceAllocator) return;
        this.voiceAllocator.stopAll();
    }

    // --------------------------------------------------------------------------
    // AUDIO CONTEXT CONTROL
    // --------------------------------------------------------------------------
    suspend() {
        return this.context?.suspend();
    }

    resume() {
        return this.context?.resume();
    }

    // --------------------------------------------------------------------------
    // DEBUG: DUMP GRAPH
    // --------------------------------------------------------------------------
    dumpGraph() {
        console.log("=== Voice Graphs ===");
        this.voiceAllocator.voices.forEach((voice, i) => {
            console.log(`Voice ${i}:`, voice.graph);
        });

        console.log("=== Global Graph ===");
        console.log(this.globalGraph);
    }
}
