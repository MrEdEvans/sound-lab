// src/engine/validation/validateEngineState.js
import { engineSpec } from "../spec/index.js";
import { validateModule } from "./validateModule.js";

export function validateEngineState(state) {
  const errors = [];

  for (const moduleName in engineSpec) {
    const moduleSpec = engineSpec[moduleName];
    const moduleState = state[moduleName];

    if (!moduleState) {
      errors.push(`Missing module: ${moduleName}`);
      continue;
    }

    const moduleErrors = validateModule(moduleState, moduleSpec, moduleName);
    errors.push(...moduleErrors);
  }

  return errors;
}
