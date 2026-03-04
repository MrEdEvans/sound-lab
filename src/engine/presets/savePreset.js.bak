// src/engine/presets/savePreset.js

import { loadVersionedDefaults } from "../state/loadVersionedDefaults.js";

function extractDeltas(current, defaults) {
  const result = {};

  for (const key in current) {
    const cur = current[key];
    const def = defaults[key];

    const bothObjects =
      cur && typeof cur === "object" &&
      def && typeof def === "object" &&
      !Array.isArray(cur) &&
      !Array.isArray(def);

    if (bothObjects) {
      const nested = extractDeltas(cur, def);
      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
      continue;
    }

    if (cur !== def) {
      result[key] = cur;
    }
  }

  return result;
}

function sortObject(obj) {
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    const value = obj[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      sorted[key] = sortObject(value);
    } else {
      sorted[key] = value;
    }
  }
  return sorted;
}

export async function savePreset(engineState, metadata = {}, pretty = true) {
  const version = metadata.engineVersion;
  if (!version) {
    throw new Error("Metadata missing required field: engineVersion");
  }

  const defaults = await loadVersionedDefaults(version);

  let deltas = extractDeltas(engineState, defaults);

  if (deltas.modules) {
    for (const modKey in deltas.modules) {
      deltas[modKey] = deltas.modules[modKey];
    }
    delete deltas.modules;
  }

  const metadataOrder = [
    "name",
    "author",
    "description",
    "tags",
    "genre",
    "mood",
    "createdAt",
    "updatedAt",
    "favorite",
    "rating",
    "engineVersion",
    "presetFormatVersion",
    "uuid"
  ];

  const orderedMetadata = {};
  for (const key of metadataOrder) {
    if (metadata[key] !== undefined) {
      orderedMetadata[key] = metadata[key];
    }
  }

  const preset = {
    ...orderedMetadata,
    ...sortObject(deltas)
  };

  return pretty
    ? JSON.stringify(preset, null, 2)
    : JSON.stringify(preset);
}
