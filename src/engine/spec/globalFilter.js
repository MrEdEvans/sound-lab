export const globalFilterSpec = {
  enabled: { type: "boolean", default: true },

  type: {
    type: "enum",
    values: ["peaking", "lowshelf", "highshelf", "bandpass"],
    default: "peaking"
  },

  frequency: { type: "number", min: 20, max: 20000, default: 2000 },
  q: { type: "number", min: 0.1, max: 20, default: 1.0 },
  gain: { type: "number", min: -24, max: 24, default: 0 }
};
