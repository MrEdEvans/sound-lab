export const vibratoSpec = {
  enabled: { type: "boolean", default: false },

  waveform: {
    type: "enum",
    values: ["sine", "triangle", "square"],
    default: "sine"
  },

  rate: { type: "number", min: 0.1, max: 20, default: 5.0 },
  depth: { type: "number", min: 0, max: 200, default: 20 }, // cents

  delay: { type: "number", min: 0, max: 5, default: 0.0 },
  fade: { type: "number", min: 0, max: 5, default: 0.2 }
};
