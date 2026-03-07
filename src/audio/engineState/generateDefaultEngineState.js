// src/audio/engineState/generateDefaultEngineState.js

import { engineSpec } from "./engineSpec.js";

function buildEngineDefaults() {
    const out = {};
    for (const [key, spec] of Object.entries(engineSpec.engine)) {
        out[key] = spec.default ?? null;
    }
    return out;
}

export function generateDefaultEngineState() {
    return {
        version: "1.0.0",
        engine: buildEngineDefaults(),
        modules: [],
        audioRouting: [],
        modRouting: []
    };
}
