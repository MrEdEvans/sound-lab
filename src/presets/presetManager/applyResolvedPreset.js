// src/presets/presetManager/applyResolvedPreset.js

import { setEngineParams } from "../../audio/engine/setters/setEngineParams.js";

export function applyResolvedPreset(engine, resolvedPreset) {
    if (!engine) {
        throw new Error("applyResolvedPreset: engine is required.");
    }

    const { engineState } = resolvedPreset;

    setEngineParams(engine, engineState);

    return engineState;
}
