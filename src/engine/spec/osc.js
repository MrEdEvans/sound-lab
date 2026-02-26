export const oscSpec = {
  enabled: { type: "boolean", default: true },

  frequency: { type: "number", min: 20, max: 20000, default: 440 },
  detune: { type: "number", min: -1200, max: 1200, default: 0 },

  inharmonicity: { type: "number", min: 0, max: 1, default: 0 },
  useInharmonicity: { type: "boolean", default: false },

  stereoSpread: { type: "number", min: 0, max: 1, default: 0 },

  waves: {
    sine: { type: "number", min: 0, max: 1, default: 1 },
    triangle: { type: "number", min: 0, max: 1, default: 0 },
    square: { type: "number", min: 0, max: 1, default: 0 },
    saw: { type: "number", min: 0, max: 1, default: 0 }
  }
};
