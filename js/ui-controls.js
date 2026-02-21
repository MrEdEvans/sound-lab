

import {
    fxDriveEnabled,
    fxDrive,
    postFilterType,
    postFilterEnabled,
    renderPostFilterControls
} from "./ui-state.js";


/* -------------------------------------------------------
   UI BINDINGS — event listeners + label binding only
------------------------------------------------------- */

import { bindValueLabel } from "./ui-helpers.js";

import {
    updatePitchModeUI,
    updateFmModeUI,
    updateFmAmountLabel,
    updateMainFilterUI,
    renderPostFilterControls
} from "./ui-state.js";

/* -------------------------------------------------------
   LABEL BINDINGS
------------------------------------------------------- */

/* Oscillator labels */
bindValueLabel("freq", "freqValue");
bindValueLabel("detune", "detuneValue");
bindValueLabel("inharm", "inharmValue", v => Number(v).toFixed(2));

/* Amplitude envelope labels */
bindValueLabel("attack", "attackValue", v => Number(v).toFixed(3));
bindValueLabel("decay", "decayValue", v => Number(v).toFixed(2));
bindValueLabel("sustain", "sustainValue", v => Number(v).toFixed(2));
bindValueLabel("release", "releaseValue", v => Number(v).toFixed(2));
bindValueLabel("tail", "tailValue", v => Number(v).toFixed(1));

/* Pitch envelope labels */
bindValueLabel("pitchStart", "pitchStartValue");
bindValueLabel("pitchEnd", "pitchEndValue");
bindValueLabel("pitchTime", "pitchTimeValue", v => Number(v).toFixed(2));

/* FM labels */
bindValueLabel("fmRatio", "fmRatioValue", v => Number(v).toFixed(2));
bindValueLabel("fmFreq", "fmFreqValue");
bindValueLabel("fmAmount", "fmAmountValue");
bindValueLabel("fmAttack", "fmAttackValue", v => Number(v).toFixed(3));
bindValueLabel("fmDecay", "fmDecayValue", v => Number(v).toFixed(2));
bindValueLabel("fmSustain", "fmSustainValue", v => Number(v).toFixed(2));
bindValueLabel("fmRelease", "fmReleaseValue", v => Number(v).toFixed(2));

/* Vibrato labels */
bindValueLabel("vibRate", "vibRateValue", v => Number(v).toFixed(1));
bindValueLabel("vibDepth", "vibDepthValue");
bindValueLabel("vibDelay", "vibDelayValue", v => Number(v).toFixed(2));
bindValueLabel("vibFade", "vibFadeValue", v => Number(v).toFixed(2));

/* Post-FX labels */
bindValueLabel("postFxNoise", "postFxNoiseValue", v => Number(v).toFixed(2));
bindValueLabel("postFxReverbAmount", "postFxReverbAmountValue", v => Number(v).toFixed(2));
bindValueLabel("postFxWidth", "postFxWidthValue", v => Number(v).toFixed(2));

/* -------------------------------------------------------
   EVENT LISTENERS
------------------------------------------------------- */

/* Pitch mode */
document.getElementById("pitchModeRelative")
    .addEventListener("change", updatePitchModeUI);

document.getElementById("pitchModeAbsolute")
    .addEventListener("change", updatePitchModeUI);

/* FM mode */
document.getElementById("fmModeRatio")
    .addEventListener("change", updateFmModeUI);

document.getElementById("fmModeFree")
    .addEventListener("change", updateFmModeUI);

document.getElementById("fmAmountLinear")
    .addEventListener("change", updateFmAmountLabel);

document.getElementById("fmAmountIndex")
    .addEventListener("change", updateFmAmountLabel);

/* Main filter */
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

/* Post-filter type */
document.querySelectorAll("input[name='postFilterType']")
    .forEach(radio => {
        radio.addEventListener("change", e => {
            renderPostFilterControls(e.target.value);
        });
    });

/* Post-filter enabled toggle */
document.getElementById("postFilterEnabled")
    .addEventListener("change", e => {
        // This simply updates UI; actual state lives in ui-state.js
        console.log("Post Filter Enabled:", e.target.checked);
    });

/* -------------------------------------------------------
   INITIALIZATION
------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {
    updatePitchModeUI();
    renderPostFilterControls("peaking");
});
