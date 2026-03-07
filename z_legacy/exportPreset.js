// src/engine/presets/exportPreset.js
import { savePreset } from "./savePreset.js";

export async function exportPreset(engineState, metadata, as = "string") {
  const json = await savePreset(engineState, metadata, true);

  if (as === "string") {
    return json;
  }

  if (as === "blob") {
    return new Blob([json], { type: "application/json" });
  }

  throw new Error(`Unknown export format: ${as}`);
}
