// src/presets/presetSchema.js

export const presetSchema = {
    oscillators: {
        required: true,
        type: "array",
        items: {
            type: "object",
            fields: {
                type: { type: "string", required: true },
                detune: { type: "number", default: 0 },
                gain: { type: "number", default: 1 }
            }
        }
    },

    envelopes: {
        required: true,
        type: "object",
        fields: {
            amp: {
                required: true,
                type: "object",
                fields: {
                    type: { type: "string", default: "adsr" },
                    attack: { type: "number", min: 0, default: 0.01 },
                    decay: { type: "number", min: 0, default: 0.1 },
                    sustain: { type: "number", min: 0, max: 1, default: 0.7 },
                    release: { type: "number", min: 0, default: 0.2 }
                }
            }
        }
    },

    filters: {
        required: true,
        type: "array",
        items: {
            type: "object",
            fields: {
                type: { type: "string", required: true },
                cutoff: { type: "number", min: 20, max: 20000, default: 1000 },
                resonance: { type: "number", min: 0, default: 0.7 }
            }
        }
    },

    modMatrix: {
        required: false,
        type: "array",
        items: {
            type: "object",
            fields: {
                source: { type: "string", required: true },
                destination: { type: "string", required: true },
                amount: { type: "number", required: true }
            }
        },
        default: []
    },

    routing: {
        required: false,
        type: "object",
        default: {}
    },

    fx: {
        required: false,
        type: "array",
        items: {
            type: "object",
            fields: {
                type: { type: "string", required: true },
                enabled: { type: "boolean", default: true },
                params: { type: "object", default: {} }
            }
        },
        default: []
    },

    maxVoices: {
        required: false,
        type: "number",
        default: 16
    }
};
