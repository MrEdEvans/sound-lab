export const voiceFilterSpec = {
  enabled: { type: "boolean", default: true },

  cutoff: { type: "number", min: 20, max: 20000, default: 1000 },
  resonance: { type: "number", min: 0, max: 1, default: 0.2 },

  envAmount: { type: "number", min: 0, max: 1, default: 0.5 },

  env: {
    enabled: { type: "boolean", default: true },
    attack: { type: "number", min: 0, max: 10, default: 0.01 },
    decay: { type: "number", min: 0, max: 10, default: 0.2 },
    sustain: { type: "number", min: 0, max: 1, default: 0.5 },
    release: { type: "number", min: 0, max: 10, default: 0.3 }
  }
};
