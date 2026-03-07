// src/engine/state/generateDefaultState.js
import { engineSpec } from "../spec/index.js";

function buildFromSpec(specNode) {
  const result = {};

  for (const key in specNode) {
    const spec = specNode[key];

    // Parameter node (has a type)
    if (spec.type) {
      result[key] = spec.default;
      continue;
    }

    // Nested module or nested parameter group
    if (typeof spec === "object") {
      result[key] = buildFromSpec(spec);
      continue;
    }

    throw new Error(`Invalid spec node for key: ${key}`);
  }

  return result;
}

export function generateDefaultState() {
  return buildFromSpec(engineSpec);
}


function deepFreeze(obj) {
  Object.values(obj).forEach(v => {
    if (v && typeof v === "object") deepFreeze(v);
  });
  return Object.freeze(obj);
}

export function createDefaultEngineState() {
  return deepFreeze({
    version: "1.0.0",
    ...buildFromSpec(engineSpec)
  });
}

