// src/presets/presetManager/serializeEngineState.js

import { cloneEngineState } from "../../audio/engine/state/cloneEngineState.js";

export function serializeEngineState(engine, metadata = {}) {
  if (!engine) {
    throw new Error("serializeEngineState: engine is required.");
  }

  const engineState = cloneEngineState(engine.state);

  return {
    engineState,
    metadata
  };
}
