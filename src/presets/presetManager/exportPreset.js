// src/presets/presetManager/exportPreset.js

export function exportPreset(presetObj, pretty = true) {
  return pretty
    ? JSON.stringify(presetObj, null, 2)
    : JSON.stringify(presetObj);
}
