export const fxSpec = {
  noise: {
    enabled: { type: "boolean", default: false },
    type: { type: "enum", values: ["white", "pink", "brown"], default: "white" },
    amount: { type: "number", min: 0, max: 1, default: 0 }
  },

  reverb: {
    enabled: { type: "boolean", default: false },
    type: { type: "enum", values: ["hall", "room", "plate"], default: "hall" },
    amount: { type: "number", min: 0, max: 1, default: 0 }
  },

  drive: {
    enabled: { type: "boolean", default: false },
    type: { type: "enum", values: ["soft", "hard", "tube", "fuzz"], default: "soft" },
    amount: { type: "number", min: 0, max: 1, default: 0 }
  },

  width: {
    enabled: { type: "boolean", default: true },
    amount: { type: "number", min: 0, max: 1, default: 1 }
  }
};
