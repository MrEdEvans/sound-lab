// src/presets/presetManager/importPreset.js

import { validatePreset } from "../presetValidation/validatePreset.js";
import { resolvePreset } from "./resolvePreset.js";

export async function importPreset(jsonInput) {
    let presetObj;

    if (typeof jsonInput === "string") {
        try {
            presetObj = JSON.parse(jsonInput);
        } catch (err) {
            throw new Error("Invalid JSON: " + err.message);
        }
    } else if (typeof jsonInput === "object" && jsonInput !== null) {
        presetObj = jsonInput;
    } else {
        throw new Error("importPreset() requires a JSON string or object.");
    }

    const errors = validatePreset(presetObj);
    if (errors.length > 0) {
        throw new Error("Preset validation failed:\n" + errors.join("\n"));
    }

    // Resolve into engine-ready form
    return resolvePreset(presetObj);
}
