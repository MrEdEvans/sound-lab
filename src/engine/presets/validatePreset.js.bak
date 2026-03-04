// src/engine/presets/validatePreset.js

import { loadVersionedDefaults } from "../state/loadVersionedDefaults.js";

const METADATA_SCHEMA = {
  name: "string",
  author: "string",
  description: "string",
  tags: "array",
  genre: "string",
  mood: "string",
  createdAt: "string",
  updatedAt: "string",
  favorite: "boolean",
  rating: "number",
  engineVersion: "string",
  presetFormatVersion: "string",
  uuid: "string"
};

// Required metadata for your preset format
const REQUIRED_METADATA = ["name", "author", "engineVersion", "presetFormatVersion"];

export function validatePreset(preset) {
  const errors = [];

  // --- Basic structure ---
  if (typeof preset !== "object" || Array.isArray(preset)) {
    errors.push("Preset must be a JSON object.");
    return errors;
  }

  // --- Required: engineVersion ---
  if (!preset.engineVersion || typeof preset.engineVersion !== "string") {
    errors.push("Preset must include a valid 'engineVersion' string.");
    return errors;
  }

  // --- Load defaults for this engine version ---
  let defaults;
  try {
    defaults = loadVersionedDefaults(preset.engineVersion);
  } catch {
    errors.push(`Unknown engineVersion '${preset.engineVersion}'.`);
    return errors;
  }

  // --- Validate metadata fields ---
  for (const key of REQUIRED_METADATA) {
    if (!(key in preset)) {
      errors.push(`Missing required metadata field '${key}'.`);
    }
  }

  for (const key in preset) {
    const expectedType = METADATA_SCHEMA[key];
    const value = preset[key];

    if (expectedType) {
      if (expectedType === "array") {
        if (!Array.isArray(value)) {
          errors.push(`Metadata field '${key}' must be an array.`);
        }
      } else if (typeof value !== expectedType) {
        errors.push(`Metadata field '${key}' must be of type '${expectedType}'.`);
      }
    }
  }

  // --- Validate engine deltas ---
  function validateDelta(deltaObj, defaultObj, path = "") {
    for (const key in deltaObj) {
      const fullPath = path ? `${path}.${key}` : key;

      if (!(key in defaultObj)) {
        errors.push(`Unknown engine parameter '${fullPath}'.`);
        continue;
      }

      const deltaVal = deltaObj[key];
      const defaultVal = defaultObj[key];

      const bothObjects =
        deltaVal && typeof deltaVal === "object" &&
        defaultVal && typeof defaultVal === "object" &&
        !Array.isArray(deltaVal) &&
        !Array.isArray(defaultVal);

      if (bothObjects) {
        validateDelta(deltaVal, defaultVal, fullPath);
        continue;
      }

      if (Array.isArray(deltaVal) !== Array.isArray(defaultVal)) {
        errors.push(
          `Type mismatch at '${fullPath}': expected ${Array.isArray(defaultVal) ? "array" : "non-array"}.`
        );
        continue;
      }

      if (typeof deltaVal !== typeof defaultVal) {
        errors.push(
          `Type mismatch at '${fullPath}': expected '${typeof defaultVal}', got '${typeof deltaVal}'.`
        );
      }
    }
  }

  // --- Extract engine deltas ---
  const engineDeltas = {};

  // Top-level engine keys (global, routing)
  for (const key in preset) {
    if (key in defaults) {
      engineDeltas[key] = preset[key];
    }
  }

  // Module deltas (osc, filter, envelope, vibrato, fx, master)
  if (defaults.modules) {
    for (const key in preset) {
      if (key in defaults.modules) {
        if (!engineDeltas.modules) engineDeltas.modules = {};
        engineDeltas.modules[key] = preset[key];
      }
    }
  }

  // Validate deltas against defaults
  validateDelta(engineDeltas, defaults);

  return errors;
}
