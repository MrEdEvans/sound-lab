// src/audio/engineState/engineSpec.js

export const engineSpec = {
    engine: {
        polyphony: { type: "number", min: 1, max: 64, default: 8 },
        tuning: { type: "number", min: -1200, max: 1200, default: 0, unit: "cents" },
        glide: { type: "number", min: 0, max: 2, default: 0, unit: "seconds" },
        legato: { type: "boolean", default: false },
        macros: { type: "array", default: [] }
    },

    moduleTypes: {
        oscillator: {
            signal: "audio",
            params: {
                waveform: {
                    type: "string",
                    enum: ["sine", "saw", "square", "triangle", "noise"],
                    default: "saw"
                },
                pitch: { type: "number", min: -48, max: 48, default: 0, unit: "semitones" },
                detune: { type: "number", min: -1200, max: 1200, default: 0, unit: "cents" },
                phase: { type: "number", min: 0, max: 1, default: 0, unit: "cycle" },
                level: { type: "number", min: 0, max: 1, default: 0.8 }
            }
        },

        filter: {
            signal: "audio",
            params: {
                filterType: {
                    type: "string",
                    enum: ["lowpass", "highpass", "bandpass", "notch"],
                    default: "lowpass"
                },
                cutoff: {
                    type: "number",
                    min: 20,
                    max: 20000,
                    default: 1000,
                    unit: "Hz",
                    scale: "log"
                },
                resonance: { type: "number", min: 0, max: 1, default: 0.2 },
                drive: { type: "number", min: 0, max: 1, default: 0 },
                mix: { type: "number", min: 0, max: 1, default: 1 }
            }
        },

        envelope: {
            signal: "mod",
            params: {
                attack: { type: "number", min: 0, max: 10, default: 0.01, unit: "seconds" },
                decay: { type: "number", min: 0, max: 10, default: 0.2, unit: "seconds" },
                sustain: { type: "number", min: 0, max: 1, default: 0.8 },
                release: { type: "number", min: 0, max: 10, default: 0.5, unit: "seconds" }
            }
        },

        lfo: {
            signal: "mod",
            params: {
                shape: {
                    type: "string",
                    enum: ["sine", "triangle", "square", "saw", "random"],
                    default: "sine"
                },
                rate: { type: "number", min: 0.01, max: 20, default: 2, unit: "Hz" },
                sync: { type: "boolean", default: false },
                phase: { type: "number", min: 0, max: 1, default: 0 },
                amount: { type: "number", min: 0, max: 1, default: 0.5 }
            }
        },

        delay: {
            signal: "audio",
            params: {
                time: { type: "number", min: 0, max: 2, default: 0.3, unit: "seconds" },
                feedback: { type: "number", min: 0, max: 0.95, default: 0.35 },
                damping: { type: "number", min: 0, max: 1, default: 0.2 },
                mix: { type: "number", min: 0, max: 1, default: 0.25 }
            }
        },

        reverb: {
            signal: "audio",
            params: {
                reverbType: {
                    type: "string",
                    enum: ["hall", "plate", "room", "spring"],
                    default: "hall"
                },
                size: { type: "number", min: 0, max: 1, default: 0.7 },
                decay: { type: "number", min: 0.1, max: 20, default: 2.5, unit: "seconds" },
                damping: { type: "number", min: 0, max: 1, default: 0.3 },
                mix: { type: "number", min: 0, max: 1, default: 0.3 }
            }
        },

        distortion: {
            signal: "audio",
            params: {
                drive: { type: "number", min: 0, max: 1, default: 0.4 },
                tone: { type: "number", min: 0, max: 1, default: 0.5 },
                mix: { type: "number", min: 0, max: 1, default: 0.25 }
            }
        },

        chorus: {
            signal: "audio",
            params: {
                rate: { type: "number", min: 0.01, max: 10, default: 1.5, unit: "Hz" },
                depth: { type: "number", min: 0, max: 1, default: 0.4 },
                mix: { type: "number", min: 0, max: 1, default: 0.3 }
            }
        },

        compressor: {
            signal: "audio",
            params: {
                threshold: { type: "number", min: -60, max: 0, default: -18, unit: "dB" },
                ratio: { type: "number", min: 1, max: 20, default: 4 },
                attack: { type: "number", min: 0.0001, max: 0.1, default: 0.01, unit: "seconds" },
                release: { type: "number", min: 0.01, max: 1, default: 0.2, unit: "seconds" },
                knee: { type: "number", min: 0, max: 12, default: 1, unit: "dB" },
                makeup: { type: "number", min: -24, max: 24, default: 0, unit: "dB" },
                mix: { type: "number", min: 0, max: 1, default: 1 }
            }
        },

        eq: {
            signal: "audio",
            params: {
                lowGain: { type: "number", min: -24, max: 24, default: 0, unit: "dB" },
                lowFreq: { type: "number", min: 20, max: 500, default: 120, unit: "Hz", scale: "log" },
                lowQ: { type: "number", min: 0.1, max: 10, default: 0.7 },
                midGain: { type: "number", min: -24, max: 24, default: 0, unit: "dB" },
                midFreq: { type: "number", min: 200, max: 5000, default: 1000, unit: "Hz", scale: "log" },
                midQ: { type: "number", min: 0.1, max: 10, default: 1 },
                highGain: { type: "number", min: -24, max: 24, default: 0, unit: "dB" },
                highFreq: { type: "number", min: 2000, max: 20000, default: 8000, unit: "Hz", scale: "log" },
                highQ: { type: "number", min: 0.1, max: 10, default: 0.7 },
                mix: { type: "number", min: 0, max: 1, default: 1 }
            }
        },

        limiter: {
            signal: "audio",
            params: {
                threshold: { type: "number", min: -24, max: 0, default: -0.5, unit: "dB" },
                release: { type: "number", min: 0.005, max: 0.5, default: 0.1, unit: "seconds" },
                ceiling: { type: "number", min: -12, max: 0, default: 0, unit: "dB" },
                lookahead: { type: "number", min: 0, max: 0.01, default: 0.003, unit: "seconds" },
                mix: { type: "number", min: 0, max: 1, default: 1 }
            }
        }
    }
};
