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
} from "./ui-state.js";

/* Bind slider labels */
bindValueLabel("freq", "freqValue");
bindValueLabel("detune", "detuneValue");
bindValueLabel("inharm", "inharmValue", v => Number(v).toFixed(2));

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

bindValueLabel("postFxNoise", "postFxNoiseValue", v => Number(v).toFixed(2));
bindValueLabel("postFxReverbAmount", "postFxReverbAmountValue", v => Number(v).toFixed(2));
bindValueLabel("postFxWidth", "postFxWidthValue", v => Number(v).toFixed(2));

/* Pitch mode listeners */
document.getElementById("pitchModeRelative").addEventListener("change", updatePitchModeUI);
document.getElementById("pitchModeAbsolute").addEventListener("change", updatePitchModeUI);

/* FM listeners */
document.getElementById("fmModeRatio").addEventListener("change", updateFmModeUI);
document.getElementById("fmModeFree").addEventListener("change", updateFmModeUI);
document.getElementById("fmAmountLinear").addEventListener("change", updateFmAmountLabel);
document.getElementById("fmAmountIndex").addEventListener("change", updateFmAmountLabel);

/* Main filter listeners */
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

/* Post filter listeners */
document.querySelectorAll("input[name='postFilterType']").forEach(radio => {
    radio.addEventListener("change", e => {
        renderPostFilterControls(e.target.value);
    });
});

window.addEventListener("DOMContentLoaded", () => {
    renderPostFilterControls("peaking");
});
