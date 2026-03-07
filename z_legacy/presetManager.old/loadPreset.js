// src/presets/presetManager/loadPreset.js

import { loadVersionedDefaults } from "../../audio/engine/state/loadVersionedEngineDefaults.js";
import { cloneEngineState } from "../../audio/engine/state/cloneEngineState.js";

export async function loadPreset(preset) {
  const version = preset.engineVersion;
  if (!version) {
    throw new Error("Preset missing required field: engineVersion");
  }

  const defaults = await loadVersionedDefaults(version);

  const engineDeltas = {};
  const metadata = {};

  for (const key in preset) {
    if (key === "engineVersion" || key === "presetFormatVersion") {
      metadata[key] = preset[key];
      continue;
    }

    if (key in defaults) {
      engineDeltas[key] = preset[key];
      continue;
    }

    if (defaults.modules && key in defaults.modules) {
      if (!engineDeltas.modules) engineDeltas.modules = {};
      engineDeltas.modules[key] = preset[key];
      continue;
    }

    metadata[key] = preset[key];
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
