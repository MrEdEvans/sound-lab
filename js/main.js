
import { loadBrightChimePreset, randomizeSettings, loadMarioJumpPreset, loadMarioCoinPreset } from "./presets.js";
import { playSoundFromUI, clearCurrentNodes } from "./audio-engine.js";

import "./ui/ui-helpers.js";
import "./ui/ui-state.js";
import "./ui/ui-bindings.js";



/* Buttons */
document.getElementById("playBtn").addEventListener("click", () => {
    playSoundFromUI();
});

document.getElementById("stopBtn").addEventListener("click", () => {
    clearCurrentNodes();
});

document.getElementById("randomBtn").addEventListener("click", () => {
    randomizeSettings();
    playSoundFromUI();
});

document.getElementById("brightChimeBtn").addEventListener("click", () => {
    loadBrightChimePreset();
    playSoundFromUI();
});

document.getElementById("marioJumpBtn").addEventListener("click", () => {
    loadMarioJumpPreset();
    playSoundFromUI();
});


document.getElementById("marioCoinBtn").addEventListener("click", () => {
    loadMarioCoinPreset();
    playSoundFromUI();
});


/* Initialize */
loadBrightChimePreset();