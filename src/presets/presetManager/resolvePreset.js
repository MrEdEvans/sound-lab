// src/presets/presetManager/resolvePreset.js

import { loadVersionedDefaults } from "../../audio/engine/state/loadVersionedEngineDefaults.js";
import { cloneEngineState } from "../../audio/engine/state/cloneEngineState.js";

export async function resolvePreset(rawPreset) {
    const version = rawPreset.engineVersion;
    if (!version) {
        throw new Error("Preset missing required field: engineVersion");
    }

    const defaults = await loadVersionedDefaults(version);

    const engineDeltas = {};
    const metadata = {};

    for (const key in rawPreset) {
        if (key === "engineVersion" || key === "presetFormatVersion") {
            metadata[key] = rawPreset[key];
            continue;
        }

        if (key in defaults) {
            engineDeltas[key] = rawPreset[key];
            continue;
        }

        if (defaults.modules && key in defaults.modules) {
            if (!engineDeltas.modules) engineDeltas.modules = {};
            engineDeltas.modules[key] = rawPreset[key];
            continue;
        }

        metadata[key] = rawPreset[key];
    }

    metadata.engineVersion = version;
    delete metadata.version;

    const merged = structuredClone(defaults);

    function merge(target, source) {
        for (const key in source) {
            const value = source[key];
            if (value && typeof value === "object" && !Array.isArray(value)) {
                merge(target[key], value);
            } else {
                target[key] = value;
            }
        }
    }

    merge(merged, engineDeltas);

    return {
        engineState: cloneEngineState(merged),
        metadata
    };
}
