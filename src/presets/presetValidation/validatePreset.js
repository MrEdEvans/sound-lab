// src/presets/presetValidation/validatePreset.js

export function validatePreset(preset) {
    const errors = [];

    if (typeof preset !== "object" || preset === null) {
        return ["Preset must be an object."];
    }

    // --- Required metadata ---
    const requiredMeta = ["engineVersion", "presetFormatVersion"];
    for (const key of requiredMeta) {
        if (!(key in preset)) {
            errors.push(`Missing required metadata field: ${key}`);
        }
    }

    // --- Metadata type checks ---
    if (preset.engineVersion && typeof preset.engineVersion !== "string") {
        errors.push("engineVersion must be a string.");
    }

    if (
        preset.presetFormatVersion &&
        typeof preset.presetFormatVersion !== "number"
    ) {
        errors.push("presetFormatVersion must be a number.");
    }

    // --- Allowed top-level keys ---
    const allowedMetadata = new Set([
        "name", "author", "description", "tags", "genre", "mood",
        "createdAt", "updatedAt", "favorite", "rating",
        "engineVersion", "presetFormatVersion", "uuid"
    ]);

    // Engine keys will be validated during resolvePreset()
    // Here we only check that unknown keys aren't metadata mistakes.
    for (const key in preset) {
        const value = preset[key];

        const isMetadata = allowedMetadata.has(key);
        const isEngineDelta = typeof value === "object" || typeof value === "number" || typeof value === "string";

        if (!isMetadata && !isEngineDelta) {
            errors.push(`Unknown or invalid field: ${key}`);
        }
    }

    return errors;
}
