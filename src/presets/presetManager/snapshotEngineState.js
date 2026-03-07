// src/presets/presetManager/snapshotEngineState.js

import { cloneEngineState } from "../../audio/engine/state/cloneEngineState.js";

export function snapshotEngineState(engine, metadata = {}) {
    if (!engine) {
        throw new Error("snapshotEngineState: engine is required.");
    }

    const engineState = cloneEngineState(engine.state);

    return {
        engineState,
        metadata
    };
}
