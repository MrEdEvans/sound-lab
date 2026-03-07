export const fmSpec = {
  enabled: { type: "boolean", default: false },

  waveform: {
    type: "enum",
    values: ["sine", "triangle", "square", "saw"],
    default: "sine"
  },

  mode: { type: "enum", values: ["ratio", "absolute"], default: "ratio" },

  ratio: { type: "number", min: 0.1, max: 20, default: 2.0 },
  frequency: { type: "number", min: 20, max: 20000, default: 600 },

  amountMode: { type: "enum", values: ["index", "depth"], default: "index" },
  amount: { type: "number", min: 0, max: 2000, default: 300 },

  env: {
    enabled: { type: "boolean", default: false },
    attack: { type: "number", min: 0, max: 10, default: 0.01 },
    decay: { type: "number", min: 0, max: 10, default: 0.25 },
    sustain: { type: "number", min: 0, max: 1, default: 0.3 },
    release: { type: "number", min: 0, max: 10, default: 0.6 }
  }
};
