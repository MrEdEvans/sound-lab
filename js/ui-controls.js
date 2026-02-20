

/* Helpers */
function val(id) {
    return document.getElementById(id).value;
}
function checked(id) {
    return document.getElementById(id).checked;
}

/* Bind slider labels */
function bindValueLabel(id, labelId, transform = v => v) {
    const el = document.getElementById(id);
    const label = document.getElementById(labelId);
    const update = () => label.textContent = transform(el.value);
    el.addEventListener("input", update);
    update();
}

/* -------------------------------------------------------
   BIND ALL LABELS
------------------------------------------------------- */

/* Oscillators labels */
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
bindValueLabel("fmFreq", "fmFreqValue", v => v);
bindValueLabel("fmAmount", "fmAmountValue", v => v);
bindValueLabel("fmAttack", "fmAttackValue", v => Number(v).toFixed(3));
bindValueLabel("fmDecay", "fmDecayValue", v => Number(v).toFixed(2));
bindValueLabel("fmSustain", "fmSustainValue", v => Number(v).toFixed(2));
bindValueLabel("fmRelease", "fmReleaseValue", v => Number(v).toFixed(2));

/* Vibrato labels */
bindValueLabel("vibRate", "vibRateValue", v => Number(v).toFixed(1));
bindValueLabel("vibDepth", "vibDepthValue", v => v);
bindValueLabel("vibDelay", "vibDelayValue", v => Number(v).toFixed(2));
bindValueLabel("vibFade", "vibFadeValue", v => Number(v).toFixed(2));

/* Post Filter and FX labels */
bindValueLabel("postFxNoise", "postFxNoiseValue", v => Number(v).toFixed(2));
bindValueLabel("postFxReverbAmount", "postFxReverbAmountValue", v => Number(v).toFixed(2));
bindValueLabel("postFxWidth", "postFxWidthValue", v => Number(v).toFixed(2));

/* Update and UI elements that need it */
updatePitchModeUI();

document.getElementById("pitchModeRelative")
    .addEventListener("change", () => {
        updatePitchModeUI();
    });

document.getElementById("pitchModeAbsolute")
    .addEventListener("change", () => {
        updatePitchModeUI();
    });



function updateFmModeUI() {
/* FM UI behavior */
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
        ratioInput.disabled = false; // still tweakable for randomize
        freqGroup.style.opacity = "1";
        freqInput.disabled = false;
    }
}

function updateFmAmountLabel() {
    const linear = document.getElementById("fmAmountLinear").checked;
    const label = document.getElementById("fmAmountLabel");
    label.textContent = linear ? "FM Depth" : "Modulation Index";
}

/* Attach FM UI listeners */
document.getElementById("fmModeRatio").addEventListener("change", updateFmModeUI);
document.getElementById("fmModeFree").addEventListener("change", updateFmModeUI);
document.getElementById("fmAmountLinear").addEventListener("change", updateFmAmountLabel);
document.getElementById("fmAmountIndex").addEventListener("change", updateFmAmountLabel);

document.getElementById("fxDriveEnable").addEventListener("change", e => {
    fxDriveEnabled = e.target.checked;
});

document.getElementById("fxDrive").addEventListener("input", e => {
    fxDrive = parseFloat(e.target.value);
    document.getElementById("fxDriveValue").textContent = fxDrive.toFixed(2);
});



function updateMainFilterUI() {
    document.getElementById("mainFilterCutoffValue").textContent =
        document.getElementById("mainFilterCutoff").value;

    document.getElementById("mainFilterResonanceValue").textContent =
        document.getElementById("mainFilterResonance").value;

    document.getElementById("mainFilterEnvAmountValue").textContent =
        document.getElementById("mainFilterEnvAmount").value;

    document.getElementById("mainFilterAttackValue").textContent =
        document.getElementById("mainFilterAttack").value;

    document.getElementById("mainFilterDecayValue").textContent =
        document.getElementById("mainFilterDecay").value;

    document.getElementById("mainFilterSustainValue").textContent =
        document.getElementById("mainFilterSustain").value;

    document.getElementById("mainFilterReleaseValue").textContent =
        document.getElementById("mainFilterRelease").value;
}



document.getElementById("mainFilterCutoff").addEventListener("input", updateMainFilterUI);
document.getElementById("mainFilterResonance").addEventListener("input", updateMainFilterUI);
document.getElementById("mainFilterEnvAmount").addEventListener("input", updateMainFilterUI);
document.getElementById("mainFilterAttack").addEventListener("input", updateMainFilterUI);
document.getElementById("mainFilterDecay").addEventListener("input", updateMainFilterUI);
document.getElementById("mainFilterSustain").addEventListener("input", updateMainFilterUI);
document.getElementById("mainFilterRelease").addEventListener("input", updateMainFilterUI);




/* Post-filter UI listeners */
document.querySelectorAll("input[name='postFilterType']").forEach(radio => {
    radio.addEventListener("change", e => {
        postFilterType = e.target.value;
        console.log("Post Filter Type:", postFilterType);

        renderPostFilterControls(postFilterType);
    });
});

window.addEventListener("DOMContentLoaded", () => {
    renderPostFilterControls(postFilterType);
});

document.getElementById("postFilterEnabled").addEventListener("change", e => {
    postFilterEnabled = e.target.checked;
    console.log("Post Filter Enabled:", postFilterEnabled);
});




/* Pitch Envelope Dynamic UI Updates */

function updatePitchModeUI() {

    console.log("updatePitchModeUI() function called");

    const start = document.getElementById("pitchStart");
    const end = document.getElementById("pitchEnd");
    const startLabel = document.getElementById("pitchStartLabel");
    const endLabel = document.getElementById("pitchEndLabel");

    if (checked("pitchModeRelative")) {
        // Ratio mode
        start.min = 0.25;
        start.max = 4.0;
        start.step = 0.01;

        end.min = 0.25;
        end.max = 4.0;
        end.step = 0.01;

        startLabel.textContent = "Start Ratio Factor";
        endLabel.textContent = "End Ratio Factor";
    } else {
        // Hz mode
        start.min = 50;
        start.max = 2000;
        start.step = 1;

        end.min = 50;
        end.max = 2000;
        end.step = 1;

        startLabel.textContent = "Start Pitch (Hz)";
        endLabel.textContent = "End Pitch (Hz)";
    }
}

/* Post-filter parameter build */
function renderPostFilterControls(type) {
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







