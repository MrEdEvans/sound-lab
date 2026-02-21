/* ---------------------------
   UI STATE UPDATE FUNCTIONS
---------------------------- */

import { checked } from "./ui-helpers.js";

// Post-filter state
let _postFilterType = "peaking";
let _postFilterEnabled = false;

// Drive state
let _fxDriveEnabled = false;
let _fxDrive = 0;

// Getters
export const postFilterType = () => _postFilterType;
export const postFilterEnabled = () => _postFilterEnabled;
export const fxDriveEnabled = () => _fxDriveEnabled;
export const fxDrive = () => _fxDrive;

// Setters
export function setPostFilterType(v) {
    _postFilterType = v;
}

export function setPostFilterEnabled(v) {
    _postFilterEnabled = v;
}

export function setFxDriveEnabled(v) {
    _fxDriveEnabled = v;
}

export function setFxDrive(v) {
    _fxDrive = v;
}



console.log("ui-state.js loaded");

/* Pitch Envelope Mode */
export function updatePitchModeUI() {
    const start = document.getElementById("pitchStart");
    const end = document.getElementById("pitchEnd");
    const startLabel = document.getElementById("pitchStartLabel");
    const endLabel = document.getElementById("pitchEndLabel");

    if (checked("pitchModeRelative")) {
        start.min = 0.25; start.max = 4.0; start.step = 0.01;
        end.min = 0.25; end.max = 4.0; end.step = 0.01;

        startLabel.textContent = "Start Ratio Factor";
        endLabel.textContent = "End Ratio Factor";
    } else {
        start.min = 50; start.max = 2000; start.step = 1;
        end.min = 50; end.max = 2000; end.step = 1;

        startLabel.textContent = "Start Pitch (Hz)";
        endLabel.textContent = "End Pitch (Hz)";
    }
}

/* FM Mode */
export function updateFmModeUI() {
    const modeRatio = document.getElementById("fmModeRatio").checked;
    const ratioGroup = document.getElementById("fmRatioGroup");
    const freqGroup = document.getElementById("fmFreqGroup");
    const ratioInput = document.getElementById("fmRatio");
    const freqInput = document.getElementById("fmFreq");

    if (modeRatio) {
        ratioGroup.style.opacity = "1";
        ratioInput.disabled = false;
        freqGroup.style.opacity = "0.4";
        freqInput.disabled = true;
    } else {
        ratioGroup.style.opacity = "0.4";
        ratioInput.disabled = false;
        freqGroup.style.opacity = "1";
        freqInput.disabled = false;
    }
}

export function updateFmAmountLabel() {
    const linear = document.getElementById("fmAmountLinear").checked;
    const label = document.getElementById("fmAmountLabel");
    label.textContent = linear ? "FM Depth" : "Modulation Index";
}

/* Main Filter UI */
export function updateMainFilterUI() {
    const ids = [
        "mainFilterCutoff",
        "mainFilterResonance",
        "mainFilterEnvAmount",
        "mainFilterAttack",
        "mainFilterDecay",
        "mainFilterSustain",
        "mainFilterRelease"
    ];

    ids.forEach(id => {
        const val = document.getElementById(id).value;
        document.getElementById(id + "Value").textContent = val;
    });
}

/* Post-filter UI parameter build */
export function renderPostFilterControls(type) {
    const container = document.getElementById("postFilterControls");
    let html = "";

    // Frequency (always needed)
    html += `
        <div class="group">
            <div class="label-row">
                <span>Frequency</span>
                <span class="value" id="postFilterFreqValue">2000</span>
            </div>
            <input type="range" id="postFilterFreq" min="50" max="8000" step="1" value="2000">
        </div>
    `;

    // Q (peaking + bandpass)
    if (type === "peaking" || type === "bandpass") {
        html += `
            <div class="group">
                <div class="label-row">
                    <span>Q</span>
                    <span class="value" id="postFilterQValue">1.0</span>
                </div>
                <input type="range" id="postFilterQ" min="0.1" max="20" step="0.1" value="1">
            </div>
        `;
    }

    // Gain (peaking + shelves)
    if (type === "peaking" || type === "lowshelf" || type === "highshelf") {
        html += `
            <div class="group">
                <div class="label-row">
                    <span>Gain (dB)</span>
                    <span class="value" id="postFilterGainValue">0</span>
                </div>
                <input type="range" id="postFilterGain" min="-12" max="12" step="0.1" value="0">
            </div>
        `;
    }

    container.innerHTML = html;

    // Add listeners for the sliders after rendering

    // Frequency
    const freqSlider = document.getElementById("postFilterFreq");
    if (freqSlider) {
        freqSlider.addEventListener("input", e => {
            postFilterFreq = parseFloat(e.target.value);
            document.getElementById("postFilterFreqValue").textContent = postFilterFreq;
        });
    }

    // Q
    const qSlider = document.getElementById("postFilterQ");
    if (qSlider) {
        qSlider.addEventListener("input", e => {
            postFilterQ = parseFloat(e.target.value);
            document.getElementById("postFilterQValue").textContent = postFilterQ.toFixed(2);
        });
    }

    // Gain
    const gainSlider = document.getElementById("postFilterGain");
    if (gainSlider) {
        gainSlider.addEventListener("input", e => {
            postFilterGain = parseFloat(e.target.value);
            document.getElementById("postFilterGainValue").textContent = postFilterGain.toFixed(1);
        });
    }

}
