// ------------------------------------------------------------
// PRESETS (import so they are available to UI bindings)
// ------------------------------------------------------------
import {
    loadPreset, presetBrightChime
} from "./presets.js";

// ------------------------------------------------------------
// UI EVENT BINDINGS (attaches all listeners automatically)
// ------------------------------------------------------------
import "./ui/ui-bindings.js";

// ------------------------------------------------------------
// AUDIO UNLOCK
// ------------------------------------------------------------
import { resumeAudio } from "./audio-engine.js";

document.addEventListener("click", () => {
    resumeAudio();
}, { once: true });

// ------------------------------------------------------------
// INITIALIZE DEFAULT PRESET
// ------------------------------------------------------------
loadPreset("BrightChime");

