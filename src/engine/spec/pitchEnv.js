export const pitchEnvSpec = {
  enabled: { type: "boolean", default: false },

  mode: { type: "enum", values: ["relative", "absolute"], default: "relative" },

  start: { type: "number", min: 0, max: 20000, default: 440 },
  end: { type: "number", min: 0, max: 20000, default: 440 },

  time: { type: "number", min: 0, max: 10, default: 0.1 },
  expo: { type: "boolean", default: true }
};
