let audioCtx = null;
let currentNodes = [];

let fxDriveEnabled = false;
let fxDrive = 0.5;


let postFilterType = "peaking"; // default
let postFilterFreq = 2000;
let postFilterQ = 1.0;
let postFilterGain = 0;



function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function clearCurrentNodes() {
    currentNodes.forEach(node => {
        try { node.disconnect(); } catch(e) {}
    });
    currentNodes = [];
}

/* Simple impulse reverb generator */
function createImpulseResponse(audio, seconds = 2.5, decay = 2.0) {
    const rate = audio.sampleRate;
    const length = rate * seconds;
    const impulse = audio.createBuffer(2, length, rate);
    for (let c = 0; c < 2; c++) {
        const channel = impulse.getChannelData(c);
        for (let i = 0; i < length; i++) {
            const n = (length - i) / length;
            channel[i] = (Math.random() * 2 - 1) * Math.pow(n, decay);
        }
    }
    return impulse;
}

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





/* Core: build and play one sound */
function playSoundFromUI() {
    const audio = getAudioCtx();
    clearCurrentNodes();
    const now = audio.currentTime;


    /* ------------------------------------------------------------
       DEBUG
    ------------------------------------------------------------ */
    console.log("freq:", val("freq"));
    console.log("detune:", val("detune"));
    console.log("inharm:", val("inharm"));

    console.log("mainFilterCutoff:", val("mainFilterCutoff"));
    console.log("mainFilterResonance:", val("mainFilterResonance"));

    console.log("attack:", val("attack"));
    console.log("decay:", val("decay"));
    console.log("sustain:", val("sustain"));
    console.log("release:", val("release"));

    console.log("pitchStart:", val("pitchStart"));
    console.log("pitchEnd:", val("pitchEnd"));
    console.log("pitchTime:", val("pitchTime"));


    /* ------------------------------------------------------------
       1. READ UI VALUES
    ------------------------------------------------------------ */
    const baseFreq = Number(val("freq"));
    const detuneAmount = Number(val("detune"));
    const inharmSpread = Number(val("inharm"));
    const useSine = checked("oscSine");
    const useTriangle = checked("oscTriangle");
    const useSquare = checked("oscSquare");
    const useSaw = checked("oscSaw");
    const useInharm = checked("useInharm");
    const useStereoSpread = checked("stereoSpread");

    const mainFilterEnabled = checked("mainFilterEnabled");
    const mainFilterType = document.querySelector('input[name="mainFilterType"]:checked').value;
    const mainFilterCutoff = Number(val("mainFilterCutoff"));
    const mainFilterResonance = Number(val("mainFilterResonance"));
    const mainFilterEnvAmount = Number(val("mainFilterEnvAmount"));
    const mainFilterAttack = Number(val("mainFilterAttack"));
    const mainFilterDecay = Number(val("mainFilterDecay"));
    const mainFilterSustain = Number(val("mainFilterSustain"));
    const mainFilterRelease = Number(val("mainFilterRelease"));

    const attack = Number(val("attack"));
    const decay = Number(val("decay"));
    const sustain = Number(val("sustain"));
    const release = Number(val("release"));
    const tail = Number(val("tail"));
    const clickSafe = checked("clickSafe");

    const pitchStart = Number(val("pitchStart"));
    const pitchEnd = Number(val("pitchEnd"));
    const pitchTime = Number(val("pitchTime"));
    const pitchExpo = checked("pitchExpo");
    const pitchEnvEnable = checked("pitchEnvEnable");
    const pitchModeRelative = document.getElementById("pitchModeRelative").checked;

    const fmEnabled = checked("fmEnable");
    const fmModeRatio = document.getElementById("fmModeRatio").checked;
    const fmWave = document.querySelector('input[name="fmWave"]:checked').value;
    const fmRatio = Number(val("fmRatio"));
    const fmFreqFree = Number(val("fmFreq"));
    const fmAmount = Number(val("fmAmount"));
    const fmAmountLinear = document.getElementById("fmAmountLinear").checked;
    const fmAttack = Number(val("fmAttack"));
    const fmDecay = Number(val("fmDecay"));
    const fmSustain = Number(val("fmSustain"));
    const fmRelease = Number(val("fmRelease"));

    const vibEnabled = checked("vibEnable");
    const vibRate = Number(val("vibRate"));
    const vibDepthCents = Number(val("vibDepth"));
    const vibDelay = Number(val("vibDelay"));
    const vibFade = Math.max(0.001, Number(val("vibFade")));
    const vibWave = document.querySelector('input[name="vibWave"]:checked').value;

    const postFxReverbAmount = Number(val("postFxReverbAmount"));
    const postFxEnableReverb = checked("postFxEnableReverb");

    const postFilterEnabled = checked("postFilterEnabled");
    const postFilterType = document.querySelector('input[name="postFilterType"]:checked').value;

    const freqEl = document.getElementById("postFilterFreq");
    const qEl = document.getElementById("postFilterQ");
    const gainEl = document.getElementById("postFilterGain");

    const postFilterFreq = freqEl ? Number(freqEl.value) : 1000;
    const postFilterQ = qEl ? Number(qEl.value) : 1.0;
    const postFilterGain = gainEl ? Number(gainEl.value) : 0;



    /* ------------------------------------------------------------
       2. MASTER GAIN (ADSR)
    ------------------------------------------------------------ */
    const master = audio.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(1.0, now + attack);
    master.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.0001), now + attack + decay);
    master.gain.setValueAtTime(Math.max(sustain, 0.0001), now + tail);
    master.gain.exponentialRampToValueAtTime(0.0001, now + tail + release);
    master.connect(audio.destination);
    currentNodes.push(master);

    /* ------------------------------------------------------------
       3. MAIN FILTER (with bypass)
    ------------------------------------------------------------ */
    const mainFilterInput = audio.createGain();
    let mainFilterOutput = mainFilterInput;

    if (mainFilterEnabled) {
        const mf = audio.createBiquadFilter();
        mf.type = mainFilterType;
        mf.frequency.setValueAtTime(mainFilterCutoff, now);
        mf.Q.setValueAtTime(mainFilterResonance, now);

        const peakFreq = mainFilterCutoff + mainFilterEnvAmount * 3000;

        mf.frequency.setValueAtTime(mainFilterCutoff, now);
        mf.frequency.linearRampToValueAtTime(peakFreq, now + mainFilterAttack);
        mf.frequency.linearRampToValueAtTime(
            mainFilterCutoff + (peakFreq - mainFilterCutoff) * mainFilterSustain,
            now + mainFilterAttack + mainFilterDecay
        );
        mf.frequency.linearRampToValueAtTime(
            mainFilterCutoff,
            now + tail + mainFilterRelease
        );

        mainFilterInput.connect(mf);
        mainFilterOutput = mf;
        currentNodes.push(mf);
    }

    /* ------------------------------------------------------------
       4. REVERB (optional)
    ------------------------------------------------------------ */
    let fxInput = mainFilterOutput;
    let fxOutput = mainFilterOutput;

    if (postFxEnableReverb && postFxReverbAmount > 0.01) {
        const dry = audio.createGain();
        const wet = audio.createGain();
        dry.gain.setValueAtTime(1 - postFxReverbAmount, now);
        wet.gain.setValueAtTime(postFxReverbAmount, now);

        const conv = audio.createConvolver();
        conv.buffer = createImpulseResponse(audio, 2.5, 2.5);

        const reverbInput = audio.createGain();
        fxInput.connect(reverbInput);
        reverbInput.connect(dry);
        reverbInput.connect(conv);
        conv.connect(wet);

        const mix = audio.createGain();
        dry.connect(mix);
        wet.connect(mix);

        fxOutput = mix;
        currentNodes.push(dry, wet, conv, reverbInput, mix);
    }

    /* ------------------------------------------------------------
    4a. Drive (optional)
    ------------------------------------------------------------ */
    if (fxDriveEnabled) {
        const shaper = audio.createWaveShaper();

        const curveSize = 1024;
        const curve = new Float32Array(curveSize);

        // Drive scaling: 0–1 → 1–11
        const drive = fxDrive * 10 + 1;

        for (let i = 0; i < curveSize; i++) {
            const x = (i / (curveSize - 1)) * 2 - 1; // -1 to 1
            curve[i] = Math.tanh(drive * x);
        }

        shaper.curve = curve;
        shaper.oversample = "4x";

        fxOutput.connect(shaper);

        // --------------------------------------------------------
        // Stronger output gain compensation
        // --------------------------------------------------------
        const outGain = audio.createGain();
        const compensation = 1 / (drive ** 1.05);
        outGain.gain.setValueAtTime(compensation, now);

        shaper.connect(outGain);

        fxOutput = outGain;

        currentNodes.push(shaper, outGain);
    }




    /* ------------------------------------------------------------
    5. POST FILTER (optional)
    ------------------------------------------------------------ */
    let postOutput = fxOutput;

    if (postFilterEnabled) {
        const pf = audio.createBiquadFilter();
        pf.type = postFilterType;

        // Always set frequency
        const safeFreq = Number(postFilterFreq);
        pf.frequency.cancelScheduledValues(now);
        pf.frequency.linearRampToValueAtTime(
            isFinite(safeFreq) ? safeFreq : 1000,
            now + 0.02
        );

        // Q applies to: peaking, bandpass, lowpass, highpass, notch, allpass
        if (["peaking", "bandpass", "lowpass", "highpass", "notch", "allpass"].includes(postFilterType)) {
            const safeQ = Number(postFilterQ);
            pf.Q.cancelScheduledValues(now);
            pf.Q.linearRampToValueAtTime(
                isFinite(safeQ) ? safeQ : 1.0,
                now + 0.02
            );
        }

        // Gain applies to: peaking, lowshelf, highshelf
        if (["peaking", "lowshelf", "highshelf"].includes(postFilterType)) {
            const safeGain = Number(postFilterGain);
            pf.gain.cancelScheduledValues(now);
            pf.gain.linearRampToValueAtTime(
                isFinite(safeGain) ? safeGain : 0,
                now + 0.02
            );
        }

        fxOutput.connect(pf);
        postOutput = pf;
        currentNodes.push(pf);
    }

postOutput.connect(master);


    /* ⭐ FINAL CONNECTION — REQUIRED FOR SOUND ⭐ */
    postOutput.connect(master);


    /* ------------------------------------------------------------
       6. FM MODULATOR (optional)
    ------------------------------------------------------------ */
    let fmOsc = null;
    let fmGain = null;

    if (fmEnabled && fmAmount > 0) {
        fmOsc = audio.createOscillator();
        fmOsc.type = fmWave;

        fmGain = audio.createGain();
        fmGain.gain.setValueAtTime(0.0001, now);
        fmGain.gain.exponentialRampToValueAtTime(1.0, now + fmAttack);
        fmGain.gain.exponentialRampToValueAtTime(Math.max(fmSustain, 0.0001), now + fmAttack + fmDecay);
        fmGain.gain.setValueAtTime(Math.max(fmSustain, 0.0001), now + tail);
        fmGain.gain.exponentialRampToValueAtTime(0.0001, now + tail + fmRelease);

        fmOsc.connect(fmGain);
        fmOsc.start(now);
        fmOsc.stop(now + tail + fmRelease + 0.2);

        currentNodes.push(fmOsc, fmGain);
    }

    /* ------------------------------------------------------------
       7. VIBRATO LFO (optional)
    ------------------------------------------------------------ */
    let vibOsc = null;
    let vibGain = null;

    if (vibEnabled && vibDepthCents > 0) {
        vibOsc = audio.createOscillator();
        vibGain = audio.createGain();

        vibOsc.type = vibWave;
        vibOsc.frequency.setValueAtTime(vibRate, now);
        vibGain.gain.setValueAtTime(1, now);

        vibOsc.connect(vibGain);
        vibOsc.start(now);
        vibOsc.stop(now + tail + release + 0.5);

        currentNodes.push(vibOsc, vibGain);
    }

    /* ------------------------------------------------------------
       8. BUILD CARRIER PARTIALS
    ------------------------------------------------------------ */
    const oscTypes = [];
    if (useSine) oscTypes.push("sine");
    if (useTriangle) oscTypes.push("triangle");
    if (useSquare) oscTypes.push("square");
    if (useSaw) oscTypes.push("sawtooth");
    if (oscTypes.length === 0) oscTypes.push("sine");

    const partialRatios = useInharm
        ? [1.0, 2.71, 3.99, 5.41]
        : [1.0, 2.0, 3.0];

    partialRatios.forEach((ratio, index) => {
        const osc = audio.createOscillator();
        osc.type = oscTypes[index % oscTypes.length];

        // const carrierFreq = baseFreq * (1 + inharmSpread * (ratio - 1));
        const carrierFreq = (baseFreq || 440) * (1 + inharmSpread * (ratio - 1));

        osc.frequency.setValueAtTime(Math.max(carrierFreq, 1), now);

        /* Pitch Envelope */
        if (pitchEnvEnable) {
            const start = pitchModeRelative ? carrierFreq : Math.max(pitchStart, 1);
            const end = pitchModeRelative ? carrierFreq * (pitchEnd / Math.max(pitchStart, 1)) : Math.max(pitchEnd, 1);

            osc.frequency.setValueAtTime(start, now);
            if (pitchExpo) {
                osc.frequency.exponentialRampToValueAtTime(end, now + pitchTime);
            } else {
                osc.frequency.linearRampToValueAtTime(end, now + pitchTime);
            }
        }

        /* Detune */
        const detuneDir = index % 2 === 0 ? 1 : -1;
        osc.detune.setValueAtTime(detuneDir * detuneAmount * 10, now);

        /* Vibrato */
        if (vibGain && vibDepthCents > 0) {
            const vibDepthGain = audio.createGain();
            const depthRatio = Math.pow(2, vibDepthCents / 1200) - 1;
            const vibratoDepthHz = carrierFreq * depthRatio;

            vibDepthGain.gain.setValueAtTime(0, now);
            vibDepthGain.gain.setValueAtTime(0, now + vibDelay);
            vibDepthGain.gain.linearRampToValueAtTime(vibratoDepthHz, now + vibDelay + vibFade);

            vibGain.connect(vibDepthGain);
            vibDepthGain.connect(osc.frequency);
            currentNodes.push(vibDepthGain);
        }

        /* FM */
        if (fmEnabled && fmOsc && fmGain && fmAmount > 0) {
            const fmDepthGain = audio.createGain();
            const fmDepth = fmAmountLinear
                ? fmAmount
                : (fmAmount * carrierFreq) / 1000;

            fmDepthGain.gain.setValueAtTime(fmDepth, now);

            if (fmModeRatio) {
                fmOsc.frequency.setValueAtTime(carrierFreq * fmRatio, now);
            } else {
                fmOsc.frequency.setValueAtTime(fmFreqFree, now);
            }

            fmGain.connect(fmDepthGain);
            fmDepthGain.connect(osc.frequency);
            currentNodes.push(fmDepthGain);
        }

        /* Stereo Spread */
        let oscOutput = osc;
        if (useStereoSpread) {
            const pan = audio.createStereoPanner();
            const panPos = ((index / (partialRatios.length - 1 || 1)) - 0.5) * 2;
            pan.pan.setValueAtTime(panPos, now);
            osc.connect(pan);
            oscOutput = pan;
            currentNodes.push(pan);
        }

        /* Per‑oscillator gain */
        const oscGain = audio.createGain();
        const baseGain = 0.5 / partialRatios.length;

        oscGain.gain.setValueAtTime(clickSafe ? 0.0001 : baseGain, now);
        oscGain.gain.exponentialRampToValueAtTime(baseGain, now + (clickSafe ? attack : 0.001));
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + tail + release);

        oscOutput.connect(oscGain);
        oscGain.connect(mainFilterInput);

        osc.start(now);
        osc.stop(now + tail + release + 0.2);

        currentNodes.push(osc, oscGain);
    });
}

/*         */
/* PRESETS */
/*         */

/* Randomize settings */
function randomizeSettings() {
    document.getElementById("freq").value = 1800 + Math.random() * 2500;
    document.getElementById("detune").value = 4 + Math.random() * 20;
    document.getElementById("inharm").value = (0.2 + Math.random() * 0.5).toFixed(2);

    document.getElementById("attack").value = (0.002 + Math.random() * 0.02).toFixed(3);
    document.getElementById("decay").value = (0.1 + Math.random() * 0.5).toFixed(2);
    document.getElementById("sustain").value = (0.2 + Math.random() * 0.6).toFixed(2);
    document.getElementById("release").value = (0.5 + Math.random() * 1.5).toFixed(2);
    document.getElementById("tail").value = (0.6 + Math.random() * 1.8).toFixed(1);

    document.getElementById("filterFreq").value = 2000 + Math.random() * 4000;
    document.getElementById("filterQ").value = (8 + Math.random() * 15).toFixed(1);
    document.getElementById("noise").value = (Math.random() * 0.4).toFixed(2);
    document.getElementById("reverb").value = (0.2 + Math.random() * 0.6).toFixed(2);
    document.getElementById("width").value = (0.3 + Math.random() * 0.7).toFixed(2);

    // Pitch envelope
    document.getElementById("pitchStart").value = 200 + Math.random() * 2000;
    document.getElementById("pitchEnd").value = 500 + Math.random() * 3000;
    document.getElementById("pitchTime").value = (0.05 + Math.random() * 0.3).toFixed(2);
    document.getElementById("pitchEnvEnable").checked = Math.random() > 0.2;
    document.getElementById(Math.random() > 0.5 ? "pitchModeRelative" : "pitchModeAbsolute").checked = true;

    // FM settings
    document.getElementById("fmRatio").value = (0.5 + Math.random() * 4).toFixed(2);
    document.getElementById("fmFreq").value = 100 + Math.random() * 2000;
    document.getElementById("fmAmount").value = (50 + Math.random() * 600).toFixed(0);
    document.getElementById("fmAttack").value = (0.001 + Math.random() * 0.1).toFixed(3);
    document.getElementById("fmDecay").value = (0.05 + Math.random() * 0.6).toFixed(2);
    document.getElementById("fmSustain").value = (0.1 + Math.random() * 0.7).toFixed(2);
    document.getElementById("fmRelease").value = (0.1 + Math.random() * 1.0).toFixed(2);

    ["oscSine","oscTriangle","oscSquare","oscSaw"].forEach(id => {
        document.getElementById(id).checked = Math.random() > 0.3;
    });

    document.getElementById("useInharm").checked = Math.random() > 0.2;
    document.getElementById("stereoSpread").checked = true;
    document.getElementById("enableReverb").checked = true;
    document.getElementById("enableFilter").checked = true;
    document.getElementById("enableNoise").checked = Math.random() > 0.5;

    document.getElementById("fmEnable").checked = Math.random() > 0.2;

    // Random FM modes
    document.getElementById(Math.random() > 0.5 ? "fmModeRatio" : "fmModeFree").checked = true;
    document.getElementById(Math.random() > 0.5 ? "fmAmountLinear" : "fmAmountIndex").checked = true;

    // Random FM waveform
    const fmWaves = ["fmWaveSine","fmWaveTriangle","fmWaveSquare"];
    document.getElementById(fmWaves[Math.floor(Math.random()*fmWaves.length)]).checked = true;

    // Vibrato
    document.getElementById("vibEnable").checked = Math.random() > 0.2;
    document.getElementById("vibRate").value = (2 + Math.random() * 8).toFixed(1);
    document.getElementById("vibDepth").value = Math.floor(Math.random() * 150);
    document.getElementById("vibDelay").value = (Math.random() * 0.5).toFixed(2);
    document.getElementById("vibFade").value = (Math.random() * 0.5).toFixed(2);
    const vibWaves = ["vibWaveSine","vibWaveTriangle"];
    document.getElementById(vibWaves[Math.floor(Math.random()*vibWaves.length)]).checked = true;

    // Refresh labels
    [
        "freq","detune","inharm","attack","decay","sustain","release","tail",
        "filterFreq","filterQ","noise","reverb","width",
        "pitchStart","pitchEnd","pitchTime",
        "fmRatio","fmFreq","fmAmount","fmAttack","fmDecay","fmSustain","fmRelease",
        "vibRate","vibDepth","vibDelay","vibFade"
    ].forEach(id => {
        const event = new Event("input");
        document.getElementById(id).dispatchEvent(event);
    });

    document.getElementById("pitchModeRelative").checked = true;
    updatePitchModeUI();

    updateFmModeUI();
    updateFmAmountLabel();
}

/* Bright chime preset */
function loadBrightChimePreset() {
    document.getElementById("freq").value = 880;
    document.getElementById("detune").value = 10;
    document.getElementById("inharm").value = 0.4;

    document.getElementById("attack").value = 0.004;
    document.getElementById("decay").value = 0.25;
    document.getElementById("sustain").value = 0.35;
    document.getElementById("release").value = 1.0;
    document.getElementById("tail").value = 1.4;

    document.getElementById("postFxNoise").value = 0.0;
    document.getElementById("postFxReverbAmount").value = 0.45;
    document.getElementById("postFxWidth").value = 0.7;

    // Pitch envelope defaults
    document.getElementById("pitchStart").value = 1200;
    document.getElementById("pitchEnd").value = 2600;
    document.getElementById("pitchTime").value = 0.12;
    document.getElementById("pitchEnvEnable").checked = true;
    document.getElementById("pitchModeRelative").checked = true;
    document.getElementById("pitchModeAbsolute").checked = false;

    // FM defaults: gentle bell-like
    document.getElementById("fmEnable").checked = true;
    document.getElementById("fmModeRatio").checked = true;
    document.getElementById("fmModeFree").checked = false;
    document.getElementById("fmRatio").value = 2.00;
    document.getElementById("fmFreq").value = 600;
    document.getElementById("fmAmountIndex").checked = true;
    document.getElementById("fmAmountLinear").checked = false;
    document.getElementById("fmAmount").value = 300;
    document.getElementById("fmWaveSine").checked = true;
    document.getElementById("fmWaveTriangle").checked = false;
    document.getElementById("fmWaveSquare").checked = false;

    document.getElementById("fmAttack").value = 0.01;
    document.getElementById("fmDecay").value = 0.25;
    document.getElementById("fmSustain").value = 0.3;
    document.getElementById("fmRelease").value = 0.6;

    // Vibrato defaults
    document.getElementById("vibEnable").checked = true;
    document.getElementById("vibRate").value = 5.0;
    document.getElementById("vibDepth").value = 15;
    document.getElementById("vibDelay").value = 0.00;
    document.getElementById("vibFade").value = 0.20;
    document.getElementById("vibWaveSine").checked = true;
    document.getElementById("vibWaveTriangle").checked = false;

    document.getElementById("oscSine").checked = true;
    document.getElementById("oscTriangle").checked = true;
    document.getElementById("oscSquare").checked = false;
    document.getElementById("oscSaw").checked = false;

    document.getElementById("useInharm").checked = true;
    document.getElementById("stereoSpread").checked = true;
    document.getElementById("postFxEnableReverb").checked = true;
    document.getElementById("postFxEnableNoise").checked = false;
    document.getElementById("clickSafe").checked = true;

    [
    "freq","detune","inharm",
    "attack","decay","sustain","release","tail",
    "mainFilterCutoff","mainFilterResonance","mainFilterEnvAmount",
    "mainFilterAttack","mainFilterDecay","mainFilterSustain","mainFilterRelease",
    "postFxNoise","postFxReverbAmount","postFxWidth",
    "pitchStart","pitchEnd","pitchTime",
    "fxDrive",
    "postFilterFreq",
    "postFilterQ",
    "postFilterGain"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const event = new Event("input");
            el.dispatchEvent(event);
        }
    });
    
    document.getElementById("pitchModeRelative").checked = true;
    updatePitchModeUI();

    updateFmModeUI();
    updateFmAmountLabel();
}


function loadMarioJumpPreset() {

    // -----------------------------
    // OSCILLATORS
    // -----------------------------
    document.getElementById("freq").value = 1200;
    document.getElementById("detune").value = 0;
    document.getElementById("inharm").value = 0;

    document.getElementById("oscSine").checked = false;
    document.getElementById("oscTriangle").checked = false;
    document.getElementById("oscSquare").checked = true;
    document.getElementById("oscSaw").checked = false;

    document.getElementById("useInharm").checked = false;
    document.getElementById("stereoSpread").checked = false;

    // -----------------------------
    // AMP ENVELOPE
    // -----------------------------
    document.getElementById("attack").value = 0.001;
    document.getElementById("decay").value = 0.12;
    document.getElementById("sustain").value = 0.0;
    document.getElementById("release").value = 0.08;
    document.getElementById("tail").value = 0.2;
    document.getElementById("clickSafe").checked = true;

    // -----------------------------
    // MAIN FILTER (correct IDs)
    // -----------------------------
    document.getElementById("mainFilterEnabled").checked = true;
    document.getElementById("mainFilterCutoff").value = 20000;
    document.getElementById("mainFilterResonance").value = 0;
    document.getElementById("mainFilterEnvAmount").value = 0;

    document.getElementById("mainFilterAttack").value = 0.001;
    document.getElementById("mainFilterDecay").value = 0.001;
    document.getElementById("mainFilterSustain").value = 1.0;
    document.getElementById("mainFilterRelease").value = 0.001;

    // -----------------------------
    // POST FX (correct IDs)
    // -----------------------------
    document.getElementById("postFxNoise").value = 0.0;
    document.getElementById("postFxReverbAmount").value = 0.0;
    document.getElementById("postFxWidth").value = 0.0;

    document.getElementById("postFxEnableNoise").checked = false;
    document.getElementById("postFxEnableReverb").checked = false;

    // -----------------------------
    // PITCH ENVELOPE
    // -----------------------------
    document.getElementById("pitchEnvEnable").checked = true;
    document.getElementById("pitchModeRelative").checked = true;
    document.getElementById("pitchModeAbsolute").checked = false;

    document.getElementById("pitchStart").value = 2.0;
    document.getElementById("pitchEnd").value = 0.5;
    document.getElementById("pitchTime").value = 0.12;
    document.getElementById("pitchExpo").checked = true;

    // -----------------------------
    // FM (disabled)
    // -----------------------------
    document.getElementById("fmEnable").checked = false;

    // -----------------------------
    // VIBRATO (disabled)
    // -----------------------------
    document.getElementById("vibEnable").checked = false;

    // -----------------------------
    // SATURATION (correct IDs)
    // -----------------------------
    document.getElementById("fxDriveEnable").checked = true;
    document.getElementById("fxDrive").value = 0.15;

    // -----------------------------
    // DISPATCH INPUT EVENTS
    // -----------------------------
    [
        "freq","detune","inharm",
        "attack","decay","sustain","release","tail",
        "mainFilterCutoff","mainFilterResonance","mainFilterEnvAmount",
        "mainFilterAttack","mainFilterDecay","mainFilterSustain","mainFilterRelease",
        "postFxNoise","postFxReverbAmount","postFxWidth",
        "pitchStart","pitchEnd","pitchTime",
        "fxDrive"
    ].forEach(id => {
        const event = new Event("input");
        document.getElementById(id).dispatchEvent(event);
    });

    document.getElementById("pitchModeRelative").checked = true;
    updatePitchModeUI();

    updateFmModeUI();
    updateFmAmountLabel();
}


function loadMarioCoinPreset() {

    // -----------------------------
    // OSCILLATORS
    // -----------------------------
    document.getElementById("freq").value = 900;
    document.getElementById("detune").value = 0;
    document.getElementById("inharm").value = 0;

    document.getElementById("oscSine").checked = false;
    document.getElementById("oscTriangle").checked = false;
    document.getElementById("oscSquare").checked = true;
    document.getElementById("oscSaw").checked = false;

    document.getElementById("useInharm").checked = false;
    document.getElementById("stereoSpread").checked = false;

    // -----------------------------
    // AMP ENVELOPE
    // -----------------------------
    document.getElementById("attack").value = 0.001;
    document.getElementById("decay").value = 0.15;
    document.getElementById("sustain").value = 0.0;
    document.getElementById("release").value = 0.08;
    document.getElementById("tail").value = 0.2;
    document.getElementById("clickSafe").checked = true;

    // -----------------------------
    // MAIN FILTER
    // -----------------------------
    document.getElementById("mainFilterEnabled").checked = true;
    document.getElementById("mainFilterCutoff").value = 20000;
    document.getElementById("mainFilterResonance").value = 0;
    document.getElementById("mainFilterEnvAmount").value = 0;

    document.getElementById("mainFilterAttack").value = 0.001;
    document.getElementById("mainFilterDecay").value = 0.001;
    document.getElementById("mainFilterSustain").value = 1.0;
    document.getElementById("mainFilterRelease").value = 0.001;

    // -----------------------------
    // POST FX
    // -----------------------------
    document.getElementById("postFxNoise").value = 0.0;
    document.getElementById("postFxReverbAmount").value = 0.0;
    document.getElementById("postFxWidth").value = 0.0;

    document.getElementById("postFxEnableNoise").checked = false;
    document.getElementById("postFxEnableReverb").checked = false;

    // -----------------------------
    // PITCH ENVELOPE (UPWARD CHIRP)
    // -----------------------------
    document.getElementById("pitchEnvEnable").checked = true;
    document.getElementById("pitchModeRelative").checked = true;

    document.getElementById("pitchStart").value = 0.8;
    document.getElementById("pitchEnd").value = 2.2;
    document.getElementById("pitchTime").value = 0.10;
    document.getElementById("pitchExpo").checked = true;

    // -----------------------------
    // FM (disabled)
    // -----------------------------
    document.getElementById("fmEnable").checked = false;

    // -----------------------------
    // VIBRATO (disabled)
    // -----------------------------
    document.getElementById("vibEnable").checked = false;

    // -----------------------------
    // SATURATION
    // -----------------------------
    document.getElementById("fxDriveEnable").checked = true;
    document.getElementById("fxDrive").value = 0.12;

    // -----------------------------
    // DISPATCH INPUT EVENTS
    // -----------------------------
    [
    "freq","detune","inharm",
    "attack","decay","sustain","release","tail",
    "mainFilterCutoff","mainFilterResonance","mainFilterEnvAmount",
    "mainFilterAttack","mainFilterDecay","mainFilterSustain","mainFilterRelease",
    "postFxNoise","postFxReverbAmount","postFxWidth",
    "pitchStart","pitchEnd","pitchTime",
    "fxDrive",
    "postFilterFreq",
    "postFilterQ",
    "postFilterGain"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const event = new Event("input");
            el.dispatchEvent(event);
        }
    });


    document.getElementById("pitchModeRelative").checked = true;
    updatePitchModeUI();

    updateFmModeUI();
    updateFmAmountLabel();
}



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