/* ---------------------------
   UI EVENT BINDINGS
---------------------------- */

import { bindValueLabel } from "./ui-helpers.js";
import {
    updatePitchModeUI,
    updateFmModeUI,
    updateFmAmountLabel,
    updateMainFilterUI,
    renderPostFilterControls
} from "./ui-logic.js";

import { syncStateFromUI, syncUIFromState } from "./ui-state-sync.js";
import { playSoundFromState, stopSound } from "../audio-engine.js";
import {
    randomizeSettings,
    loadPreset,
    loadPresetAndPlay
} from "../presets.js";

/* ---------------------------
   Slider → label bindings
---------------------------- */

bindValueLabel("freq", "freqValue");
bindValueLabel("detune", "detuneValue");
bindValueLabel("inharm", "inharmValue", v => Number(v).toFixed(2));
bindValueLabel("stereoSpread", "stereoSpreadValue", v => Number(v).toFixed(2));

bindValueLabel("attack", "attackValue", v => Number(v).toFixed(3));
bindValueLabel("decay", "decayValue", v => Number(v).toFixed(2));
bindValueLabel("sustain", "sustainValue", v => Number(v).toFixed(2));
bindValueLabel("release", "releaseValue", v => Number(v).toFixed(2));
bindValueLabel("tail", "tailValue", v => Number(v).toFixed(1));

bindValueLabel("pitchStart", "pitchStartValue");
bindValueLabel("pitchEnd", "pitchEndValue");
bindValueLabel("pitchTime", "pitchTimeValue", v => Number(v).toFixed(2));

bindValueLabel("fmRatio", "fmRatioValue", v => Number(v).toFixed(2));
bindValueLabel("fmFreq", "fmFreqValue");
bindValueLabel("fmAmount", "fmAmountValue");
bindValueLabel("fmAttack", "fmAttackValue", v => Number(v).toFixed(3));
bindValueLabel("fmDecay", "fmDecayValue", v => Number(v).toFixed(2));
bindValueLabel("fmSustain", "fmSustainValue", v => Number(v).toFixed(2));
bindValueLabel("fmRelease", "fmReleaseValue", v => Number(v).toFixed(2));

bindValueLabel("vibRate", "vibRateValue", v => Number(v).toFixed(1));
bindValueLabel("vibDepth", "vibDepthValue");
bindValueLabel("vibDelay", "vibDelayValue", v => Number(v).toFixed(2));
bindValueLabel("vibFade", "vibFadeValue", v => Number(v).toFixed(2));

bindValueLabel("postFxReverbAmount", "postFxReverbAmountValue", v => Number(v).toFixed(2));
bindValueLabel("postFxNoise", "postFxNoiseValue", v => Number(v).toFixed(2));
bindValueLabel("postFxWidth", "postFxWidthValue", v => Number(v).toFixed(2));
bindValueLabel("fxDrive", "fxDriveValue", v => Number(v).toFixed(2));



/* ---------------------------
   Mode / UI logic bindings
---------------------------- */

// Pitch mode
document.getElementById("pitchModeRelative")
    .addEventListener("change", updatePitchModeUI);
document.getElementById("pitchModeAbsolute")
    .addEventListener("change", updatePitchModeUI);

// FM mode + amount label
document.getElementById("fmModeRatio")
    .addEventListener("change", updateFmModeUI);
document.getElementById("fmModeFree")
    .addEventListener("change", updateFmModeUI);
document.getElementById("fmAmountLinear")
    .addEventListener("change", updateFmAmountLabel);
document.getElementById("fmAmountIndex")
    .addEventListener("change", updateFmAmountLabel);

// Main filter sliders
[
    "mainFilterCutoff",
    "mainFilterResonance",
    "mainFilterEnvAmount",
    "mainFilterAttack",
    "mainFilterDecay",
    "mainFilterSustain",
    "mainFilterRelease"
].forEach(id => {
    document.getElementById(id).addEventListener("input", updateMainFilterUI);
});

// Post filter type radios
document.querySelectorAll("input[name='postFilterType']").forEach(radio => {
    radio.addEventListener("change", e => {
        renderPostFilterControls(e.target.value);
    });
});

/* ---------------------------
   Buttons: Play / Stop / Presets / Random
---------------------------- */

document.getElementById("playBtn").addEventListener("click", () => {
    syncStateFromUI();
    playSoundFromState();
});

document.getElementById("stopBtn").addEventListener("click", () => {
    stopSound(); // hard stop: clear all nodes
});

document.getElementById("randomBtn").addEventListener("click", () => {
    randomizeSettings();
    syncUIFromState();
    playSoundFromState();
});

document.getElementById("brightChimeBtn").addEventListener("click", () => {
    loadPreset("BrightChime");
    syncUIFromState();
    playSoundFromState();
});

document.getElementById("marioJumpBtn").addEventListener("click", () => {
    loadPreset("MarioJump");
    syncUIFromState();
    playSoundFromState();
});

document.getElementById("marioCoinBtn").addEventListener("click", () => {
    loadPreset("MarioCoin");
    syncUIFromState();
    playSoundFromState();
});

/* ---------------------------
   Initial UI setup
---------------------------- */

window.addEventListener("DOMContentLoaded", () => {
    renderPostFilterControls("peaking");
});
