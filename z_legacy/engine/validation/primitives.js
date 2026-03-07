// src/engine/validation/primitives.js
export function validateNumber(spec, value) {
  if (typeof value !== "number" || Number.isNaN(value)) return false;
  if ("min" in spec && value < spec.min) return false;
  if ("max" in spec && value > spec.max) return false;
  return true;
}

export function validateBoolean(value) {
  return typeof value === "boolean";
}

export function validateEnum(spec, value) {
  return spec.values.includes(value);
}
