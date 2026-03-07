export const ampEnvSpec = {
  enabled: { type: "boolean", default: true },

  attack: { type: "number", min: 0, max: 10, default: 0.01 },
  decay: { type: "number", min: 0, max: 10, default: 0.2 },
  sustain: { type: "number", min: 0, max: 1, default: 0.5 },
  release: { type: "number", min: 0, max: 10, default: 0.3 },

  tail: { type: "number", min: 0, max: 5, default: 1.0 },
  clickSafe: { type: "boolean", default: true }
};
