// src/presets/presetManager/applyPresetToEngine.js

import { setEngineParams } from "../../audio/engine/setters/setEngineParams.js";

export function applyPresetToEngine(engine, preset) {
  if (!engine) {
    throw new Error("applyPresetToEngine: engine is required.");
  }

  const { engineState } = preset;

  setEngineParams(engine, engineState);

  return engineState;
}
