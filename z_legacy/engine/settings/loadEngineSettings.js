import { defaultSettings } from "./defaultSettings.js";

// Deep merge helper
function deepMerge(target, source) {
  const output = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }

  return output;
}

export function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("settings") || "{}");
    return deepMerge(defaultSettings, saved);
  } catch (e) {
    console.warn("Failed to load settings, using defaults:", e);
    return structuredClone(defaultSettings);
  }
}
