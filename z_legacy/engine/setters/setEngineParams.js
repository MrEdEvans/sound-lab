// src/engine/setters/setParam.js
import { engineSpec } from "../spec/index.js";
import { validateModule } from "../validation/validateModule.js";

function getSpecForPath(path) {
  const parts = path.split(".");
  let spec = engineSpec;

  for (const part of parts) {
    if (!spec[part]) return null;
    spec = spec[part];
  }

  return spec;
}

function getTargetRef(state, path) {
  const parts = path.split(".");
  const last = parts.pop();
  let ref = state;

  for (const part of parts) {
    if (!ref[part]) return null;
    ref = ref[part];
  }

  return { ref, key: last };
}

export function setParam(state, path, value) {
  const spec = getSpecForPath(path);
  if (!spec) {
    throw new Error(`Unknown parameter: ${path}`);
  }

  // Validate using the same logic as validateModule
  const fakeModule = { [path.split(".").pop()]: value };
  const fakeSpec = { [path.split(".").pop()]: spec };
  const errors = validateModule(fakeModule, fakeSpec, path);

  if (errors.length > 0) {
    throw new Error(`Invalid value for ${path}: ${errors.join(", ")}`);
  }

  const { ref, key } = getTargetRef(state, path);
  if (!ref) {
    throw new Error(`Invalid state path: ${path}`);
  }

  ref[key] = value;
  return state;
}
