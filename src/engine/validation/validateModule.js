// src/engine/validation/validateModule.js
import { validateNumber, validateBoolean, validateEnum } from "./primitives.js";

export function validateModule(moduleState, moduleSpec, path = "") {
  const errors = [];

  for (const key in moduleSpec) {
    const spec = moduleSpec[key];
    const value = moduleState[key];
    const fullPath = path ? `${path}.${key}` : key;

    // Nested object (e.g., waves, env, fx.noise)
    if (spec.type === undefined && typeof spec === "object" && !Array.isArray(spec)) {
      const nestedErrors = validateModule(value, spec, fullPath);
      errors.push(...nestedErrors);
      continue;
    }

    // Missing parameter
    if (value === undefined) {
      errors.push(`${fullPath} is missing`);
      continue;
    }

    // Type-specific validation
    switch (spec.type) {
      case "number":
        if (!validateNumber(spec, value)) {
          errors.push(`${fullPath} must be a number between ${spec.min} and ${spec.max}, got ${value}`);
        }
        break;

      case "boolean":
        if (!validateBoolean(value)) {
          errors.push(`${fullPath} must be a boolean, got ${typeof value}`);
        }
        break;

      case "enum":
        if (!validateEnum(spec, value)) {
          errors.push(`${fullPath} must be one of ${spec.values.join(", ")}, got ${value}`);
        }
        break;

      default:
        errors.push(`${fullPath} has unknown spec type: ${spec.type}`);
    }
  }

  return errors;
}
